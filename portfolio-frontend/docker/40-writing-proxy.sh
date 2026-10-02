#!/bin/sh
set -eu
# Deployments may instead route /writing and /sitemap.xml directly to Django.
mkdir -p /etc/nginx/snippets
if [ -z "${WRITING_BACKEND_ORIGIN:-}" ]; then
  printf '%s\n' 'return 503;' > /etc/nginx/snippets/writing-proxy.conf
  exit 0
fi
case "$WRITING_BACKEND_ORIGIN" in
  http://*|https://*) ;;
  *) echo 'WRITING_BACKEND_ORIGIN must be an HTTP(S) origin' >&2; exit 1 ;;
esac
if ! printf '%s' "$WRITING_BACKEND_ORIGIN" | grep -Eq '^https?://[A-Za-z0-9._:-]+/?$'; then
  echo 'WRITING_BACKEND_ORIGIN must contain only a scheme and hostname/port' >&2
  exit 1
fi
cat > /etc/nginx/snippets/writing-proxy.conf <<CONFIG
proxy_pass ${WRITING_BACKEND_ORIGIN%/};
proxy_set_header Host \$host;
proxy_set_header X-Forwarded-Proto \$scheme;
proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
CONFIG
