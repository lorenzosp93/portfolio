#!/bin/bash

# entrypoint.sh file of Dockerfile
echo "$@"

# Section 1- Bash options
set -o errexit  
set -o pipefail  
set -o nounset

# Section 2: Health of dependent services  
postgres_ready() {  
    python << END  
import sys

from psycopg2 import connect  
from psycopg2.errors import OperationalError

try:  
    connect(  
        dbname="${DATABASE_NAME}",  
        user="${DATABASE_USERNAME}",  
        password="${DATABASE_PASSWORD}",  
        host="${DATABASE_HOST}",  
        port="${DATABASE_PORT}",  
    )  
except OperationalError:  
    sys.exit(-1)  
END
}

# redis_ready() {  
#     python << END  
# import sys
# import os

# from redis import Redis  
# from redis import RedisError

# REDIS_HOST = os.environ.get('REDIS_HOST', 'localhost')
# REDIS_USER = os.environ.get('REDIS_USER', '')
# REDIS_PASS = os.environ.get('REDIS_PASSWORD', '')
# REDIS_PORT = os.environ.get('REDIS_PORT', 6379)

# REDIS_AUTH = f'{REDIS_USER}:{REDIS_PASS}@' if REDIS_PASS else ''

# try:  
#     redis = Redis.from_url(
#         f"redis://{REDIS_AUTH}{REDIS_HOST}:{REDIS_PORT}/1"
#     )
#     redis.ping()  
# except RedisError:  
#     sys.exit(-1)  
# END
# }

until postgres_ready; do  
  >&2 echo "Waiting for PostgreSQL to become available..."  
  sleep 10  
done  
>&2 echo "PostgreSQL is available"

# until redis_ready; do  
#   >&2 echo "Waiting for Redis to become available..."  
#   sleep 10
# done  
# >&2 echo "Redis is available"

# Section 3- Idempotent Django commands  
python manage.py collectstatic --noinput  
python manage.py migrate --noinput

exec "$@"