# Portfolio deployment runner

GitHub Actions Runner Controller (ARC) runs in `home-k3s`. The controller and
listener use `arc-systems`; disposable deployment runners use `arc-runners`.
They connect outbound to GitHub over HTTPS. No public Kubernetes API, webhook,
or Tailscale Funnel is needed. Zero idle runners, at most one active runner.

The dedicated GitHub App `lorenzosp-portfolio-deployer` is installed only on
`lorenzosp93/portfolio`. Repository Administration read/write and Metadata
read-only are required for repository runner registration. Webhooks are off.
The private key is stored only in the Kubernetes Secret
`arc-runners/portfolio-runner-github-app` (and the owner's local key store).
Never commit the key or a rendered Secret manifest.

## Install or update

Requirements: authenticated kubectl context `home-k3s`, Helm, outbound HTTPS.
The manifests reflect this cluster's API endpoints; update the network policy
when node addresses change. Versions are pinned in the values and installer:
ARC 0.14.2, runner 2.337.0, kubectl 1.36.3. Keep runner releases current.

```sh
kubectl --context home-k3s apply -f deploy/github-runner/resources.yaml
kubectl --context home-k3s -n arc-runners create secret generic portfolio-runner-github-app \
  --from-literal=github_app_id="$APP_ID" \
  --from-literal=github_app_installation_id="$INSTALLATION_ID" \
  --from-file=github_app_private_key="$PRIVATE_KEY_PATH" \
  --dry-run=client -o json | kubectl --context home-k3s -n arc-runners apply -f -
scripts/install-github-runner.sh
```

For key rotation, generate a replacement in GitHub, update the Secret using the
command above, restart the controller, verify the listener reconnects, and then
revoke the old key in GitHub. The App key is not mounted in runner pods.

## Deployment behavior

Tests and multiarchitecture image builds stay on GitHub-hosted runners. Only
trusted master push deployment jobs use `runs-on: portfolio-deploy`. Pull
requests never use this runner in these workflows. The deployment-check
workflow also offers a read-only manual connectivity check from master.

A successful build exposes its immutable image digest. Frontend deployment
updates the frontend image and waits for readiness. Backend deployment creates
one migration Job from the existing backend pod configuration and the new image.
It preserves environment/Secret references, volumes and node placement, removes
API service labels and API anti-affinity, and explicitly runs Django migrate.
Failure or timeout stops before changing either application image. Success
updates backend and contact worker to the same digest and waits for both.
Migration jobs expire after one hour. Migrations must remain compatible with
old replicas during a rolling update; use staged schema changes for removals.

If a rollout fails, inspect the workflow and deployment status. Restore the
previous known-good image digest with `kubectl set image`, then wait for rollout.
Database migrations are not automatically reversed. Existing cluster manifests
remain authoritative for application configuration; this setup patches images
only, so keep their desired image references aligned if using reconciliation.

## Access and isolation

The runner has no Docker socket, privileged containers, or host mounts. Its
service account can patch only the three named portfolio deployments, create
migration Jobs in portfolio, and read pod status/logs there. It cannot read
Secrets directly or administer the cluster. **Job creation nevertheless grants
application-level authority:** Jobs can consume portfolio Secrets, and changed
application code can access its existing credentials. This is a production
credential boundary, not a sandbox for untrusted code.

The repository is public. Do not run fork/PR code or unreviewed workflows on
this runner. Workflow conditions are defense in depth, not a runner-side access
control: a workflow author can request the runner label. Restrict who can merge
or change workflows, review changes before approving workflow runs, and retain
GitHub's fork-run approval protections. Ephemeral runners reduce persistence;
they do not make untrusted code safe to run with deployment credentials.

Runner egress is limited to DNS, the cluster API, and public HTTPS; private LAN
and pod destinations are blocked. The ARC controller/listener live separately.
The cluster API stays private. Kubernetes Secret encryption/backups follow the
cluster's existing configuration.

## Validate

```sh
python3 -m unittest discover -s scripts -p 'test_deploy_production.py'
bash -n scripts/install-github-runner.sh
kubectl --context home-k3s -n arc-systems get pods
kubectl --context home-k3s -n arc-runners get autoscalingrunnersets,pods
```

Reference: [GitHub ARC documentation](https://docs.github.com/en/actions/tutorials/use-actions-runner-controller/get-started).
