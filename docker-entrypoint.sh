#!/bin/bash

# Collect static files
echo "Collect static files"
python manage.py collectstatic --noinput
