#!/usr/bin/env bash
set -euo pipefail

namespace="${KUBE_NAMESPACE:-portfolio}"
deployment="${KUBE_DEPLOYMENT:-portfolio-backend}"

kubectl -n "$namespace" exec deployment/"$deployment" -- python manage.py shell -c '
from django.conf import settings
from django.core.mail import get_connection

required = ("EMAIL_HOST", "EMAIL_HOST_USER", "EMAIL_HOST_PASSWORD", "EMAIL_TO")
missing = [name for name in required if not getattr(settings, name, None)]
if missing:
    raise SystemExit("Missing email settings: " + ", ".join(missing))

connection = get_connection()
if not connection.open():
    raise SystemExit("SMTP connection was not opened")
connection.close()
print("SMTP connection and authentication succeeded")
'

if [[ "${1:-}" == "--send" ]]; then
  kubectl -n "$namespace" exec deployment/"$deployment" -- python manage.py shell -c '
from django.conf import settings
from django.core.mail import EmailMessage

sent = EmailMessage(
    subject="Portfolio SMTP verification",
    body="This message confirms that production SMTP delivery is working.",
    from_email=getattr(settings, "EMAIL_FROM", settings.EMAIL_TO),
    to=[settings.EMAIL_TO],
).send()
if sent != 1:
    raise SystemExit("Django did not report one sent message")
print("Verification email sent to EMAIL_TO")
'
fi
