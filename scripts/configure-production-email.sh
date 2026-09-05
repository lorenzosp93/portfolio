#!/usr/bin/env bash
set -euo pipefail

namespace="${KUBE_NAMESPACE:-portfolio}"
deployment="${KUBE_DEPLOYMENT:-portfolio-backend}"
secret="${KUBE_EMAIL_SECRET:-portfolio-email}"

if [[ $# -lt 1 || $# -gt 3 ]]; then
  echo "Usage: $0 <icloud-login-address> [recipient-address] [sender-address]" >&2
  exit 2
fi

email_user="$1"
email_to="${2:-me@lorenzosp.com}"
email_from="${3:-$email_to}"

read -r -s -p "iCloud app-specific password: " email_password
echo
if [[ -z "$email_password" ]]; then
  echo "Password cannot be empty." >&2
  exit 2
fi

kubectl -n "$namespace" get deployment "$deployment" >/dev/null

secret_file="$(mktemp)"
trap 'rm -f "$secret_file"' EXIT
chmod 600 "$secret_file"
printf '%s\n' \
  "EMAIL_HOST=smtp.mail.me.com" \
  "EMAIL_PORT=587" \
  "EMAIL_USE_TLS=true" \
  "EMAIL_TIMEOUT=10" \
  "EMAIL_HOST_USER=$email_user" \
  "EMAIL_HOST_PASSWORD=$email_password" \
  "EMAIL_TO=$email_to" \
  "EMAIL_FROM=$email_from" >"$secret_file"

kubectl -n "$namespace" create secret generic "$secret" \
  --from-env-file="$secret_file" \
  --dry-run=client -o yaml | kubectl apply -f -

kubectl -n "$namespace" set env deployment/"$deployment" --from=secret/"$secret"
kubectl -n "$namespace" rollout status deployment/"$deployment" --timeout=5m

echo "Email configuration applied. Run scripts/verify-production-email.sh next."
