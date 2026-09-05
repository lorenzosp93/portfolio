#!/bin/bash

cd /app

if [ $# -eq 0 ]; then
    echo "Usage: start.sh [PROCESS_TYPE](server/worker)"
    exit 1
fi

PROCESS_TYPE=$1

if [ "$PROCESS_TYPE" = "server" ]; then
    if [ "$DJANGO_DEBUG" = "true" ]; then
        gunicorn \
            --reload \
            --bind 0.0.0.0:8000 \
            --workers 2 \
            --log-level DEBUG \
            --access-logfile "-" \
            --error-logfile "-" \
            portfolio.wsgi
    else
        gunicorn \
            --bind 0.0.0.0:8000 \
            --workers 2 \
            --log-level DEBUG \
            --access-logfile "-" \
            --error-logfile "-" \
            portfolio.wsgi
    fi
elif [ "$PROCESS_TYPE" = "worker" ]; then
    exec python manage.py process_contact_submissions
else
    echo "Unsupported process type: $PROCESS_TYPE. Supported: server, worker."
    exit 1
fi
