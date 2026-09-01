#!/bin/bash

cd /app

if [ $# -eq 0 ]; then
    echo "Usage: start.sh [PROCESS_TYPE](server/beat/worker/flower)"
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
else
    echo "Unsupported process type: $PROCESS_TYPE. Only 'server' is supported."
    exit 1
fi
