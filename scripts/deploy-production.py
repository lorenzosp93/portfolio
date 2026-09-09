#!/usr/bin/env python3
"""Deploy CI-built image digests; migrate before updating API and worker."""
import copy
import json
import os
import re
import subprocess
import sys
import time

KUBECTL = os.environ.get('KUBECTL', '/opt/kubectl/kubectl')


def kubectl(*args, data=None):
    return subprocess.check_output(
        [KUBECTL, '-n', 'portfolio', *args], input=data, text=True
    )


def migration_job(deployment, image, name):
    spec = copy.deepcopy(deployment['spec']['template']['spec'])
    container = next(c for c in spec['containers'] if c['name'] == 'backend')
    for key in ('readinessProbe', 'livenessProbe', 'startupProbe', 'ports', 'lifecycle'):
        container.pop(key, None)
    container.update(image=image, command=['python', 'manage.py', 'migrate', '--noinput'], args=[])
    spec['containers'] = [container]
    # API anti-affinity would prevent this job scheduling on the occupied nodes.
    spec.pop('affinity', None)
    spec['restartPolicy'] = 'Never'
    return {'apiVersion': 'batch/v1', 'kind': 'Job',
            'metadata': {'name': name, 'namespace': 'portfolio'},
            'spec': {'backoffLimit': 0, 'activeDeadlineSeconds': 600,
                     'ttlSecondsAfterFinished': 3600,
                     'template': {'metadata': {'labels': {'app': 'portfolio-migration'}},
                                  'spec': spec}}}


def deploy(component, digest):
    if component not in ('frontend', 'backend') or not re.fullmatch(r'sha256:[a-f0-9]{64}', digest):
        raise ValueError('Expected frontend/backend and an immutable sha256 image digest')
    repository = 'portfolio-frontend' if component == 'frontend' else 'portfolio'
    image = f'docker.io/lorenzosp93/{repository}@{digest}'
    if component == 'backend':
        run = os.environ['GITHUB_RUN_ID']
        attempt = os.environ['GITHUB_RUN_ATTEMPT']
        if not re.fullmatch(r'\d+', run) or not re.fullmatch(r'\d+', attempt):
            raise ValueError('Invalid GitHub run identity')
        name = f'portfolio-migrate-{run}-{attempt}'
        deployment = json.loads(kubectl('get', 'deployment/portfolio-backend', '-o', 'json'))
        job = migration_job(deployment, image, name)
        kubectl('create', '-f', '-', data=json.dumps(job))
        deadline = time.monotonic() + 660
        success = False
        while time.monotonic() < deadline:
            status = json.loads(kubectl('get', f'job/{name}', '-o', 'json')).get('status', {})
            if status.get('succeeded', 0):
                success = True
                break
            if status.get('failed', 0) or any(c['type'] == 'Failed' and c['status'] == 'True' for c in status.get('conditions', [])):
                break
            time.sleep(5)
        try:
            print(kubectl('logs', f'job/{name}', '--all-containers=true'))
        except subprocess.CalledProcessError:
            print('Migration logs unavailable', file=sys.stderr)
        if not success:
            raise RuntimeError('Migration failed or timed out; application images were not changed')
        targets = [('portfolio-backend', 'backend'), ('portfolio-contact-worker', 'worker')]
    else:
        targets = [('portfolio-frontend', 'frontend')]
    for deployment, container in targets:
        print(kubectl('set', 'image', f'deployment/{deployment}', f'{container}={image}'))
    for deployment, _ in targets:
        print(kubectl('rollout', 'status', f'deployment/{deployment}', '--timeout=300s'))


if __name__ == '__main__':
    deploy(*sys.argv[1:])
