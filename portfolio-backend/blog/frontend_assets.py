"""Read the deployed frontend's Vite entry without coupling image builds."""
import logging
import time
from functools import lru_cache
from urllib.parse import urljoin

import requests
from django.conf import settings

logger = logging.getLogger(__name__)


@lru_cache(maxsize=4)
def _manifest_assets(origin, minute):
    try:
        response = requests.get(origin + '/asset-manifest.json', timeout=2)
        response.raise_for_status()
        manifest = response.json()
        entry = next(value for value in manifest.values() if value.get('isEntry'))
        script = entry['file']
        css = []
        visited = set()

        def collect(record):
            css.extend(record.get('css', []))
            for key in record.get('imports', []):
                if key not in visited:
                    visited.add(key)
                    collect(manifest[key])

        collect(entry)
        # The manifest may reference only built assets at the configured origin.
        paths = [script, *css]
        if not all(path.startswith('assets/') and '..' not in path for path in paths):
            raise ValueError('Invalid asset path in Vite manifest')
        return [urljoin(origin + '/', script)], [urljoin(origin + '/', path) for path in dict.fromkeys(css)]
    except (requests.RequestException, ValueError, KeyError, TypeError, AttributeError, StopIteration):
        logger.warning('Frontend entry unavailable; serving the readable article fallback.')
        return [], []


def frontend_assets():
    if settings.FRONTEND_DEV_SERVER:
        origin = settings.FRONTEND_DEV_SERVER.rstrip('/')
        return [origin + '/@vite/client', origin + '/src/main.ts'], []
    origin = settings.FRONTEND_ASSET_ORIGIN.rstrip('/')
    if not origin:
        return [], []
    return _manifest_assets(origin, int(time.time() // 60))
