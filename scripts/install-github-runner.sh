#!/usr/bin/env bash
set -euo pipefail
repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
context="${KUBE_CONTEXT:-home-k3s}"
chart_version=0.14.2
kubectl --context "$context" apply -f "$repo_root/deploy/github-runner/resources.yaml"
helm upgrade --install portfolio-arc \
  oci://ghcr.io/actions/actions-runner-controller-charts/gha-runner-scale-set-controller \
  --kube-context "$context" --namespace arc-systems --version "$chart_version" \
  --values "$repo_root/deploy/github-runner/controller-values.yaml" --wait --timeout 180s
if ! kubectl --context "$context" -n arc-runners get secret portfolio-runner-github-app -o name >/dev/null 2>&1; then
  echo 'Controller ready. Create the portfolio-runner-github-app Secret, then run this script again.'
  exit 1
fi
helm upgrade --install portfolio-deploy \
  oci://ghcr.io/actions/actions-runner-controller-charts/gha-runner-scale-set \
  --kube-context "$context" --namespace arc-runners --version "$chart_version" \
  --values "$repo_root/deploy/github-runner/runner-values.yaml" --wait --timeout 180s
kubectl --context "$context" -n arc-runners get autoscalingrunnersets,pods
