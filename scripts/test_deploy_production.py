import importlib.util
import json
import os
import unittest
from pathlib import Path
from unittest.mock import patch

spec = importlib.util.spec_from_file_location('deploy', Path(__file__).with_name('deploy-production.py'))
deploy = importlib.util.module_from_spec(spec)
spec.loader.exec_module(deploy)

DEPLOYMENT = {'spec': {'template': {'metadata': {'labels': {'app': 'api'}}, 'spec': {
    'containers': [{'name': 'backend', 'image': 'old', 'envFrom': [{'secretRef': {'name': 'db'}}],
                    'readinessProbe': {}, 'ports': [80]}],
    'affinity': {'podAntiAffinity': {}}, 'nodeSelector': {'kubernetes.io/arch': 'amd64'},
    'restartPolicy': 'Always'}}}}


class DeploymentTests(unittest.TestCase):
    def test_migration_is_separate_from_api(self):
        job = deploy.migration_job(DEPLOYMENT, 'new', 'migration')
        pod = job['spec']['template']
        self.assertNotEqual(pod['metadata']['labels'], {'app': 'api'})
        self.assertNotIn('affinity', pod['spec'])
        self.assertEqual(pod['spec']['nodeSelector'], {'kubernetes.io/arch': 'amd64'})
        container = pod['spec']['containers'][0]
        self.assertEqual(container['envFrom'], [{'secretRef': {'name': 'db'}}])
        self.assertEqual(container['command'], ['python', 'manage.py', 'migrate', '--noinput'])
        self.assertNotIn('readinessProbe', container)
        self.assertEqual(DEPLOYMENT['spec']['template']['spec']['containers'][0]['image'], 'old')

    @patch.dict(os.environ, {'GITHUB_RUN_ID': '123', 'GITHUB_RUN_ATTEMPT': '1'})
    def test_failed_migration_never_updates_images(self):
        with patch.object(deploy, 'kubectl', side_effect=[json.dumps(DEPLOYMENT), '', '{"status":{"failed":1}}', 'migration failed']) as cli:
            with self.assertRaisesRegex(RuntimeError, 'Migration failed'):
                deploy.deploy('backend', 'sha256:' + 'a' * 64)
            self.assertFalse(any(call.args[0] == 'set' for call in cli.call_args_list))

    def test_invalid_digest_never_contacts_cluster(self):
        with patch.object(deploy, 'kubectl') as cli:
            with self.assertRaises(ValueError):
                deploy.deploy('frontend', 'master')
            cli.assert_not_called()

    @patch.dict(os.environ, {'GITHUB_RUN_ID': '123', 'GITHUB_RUN_ATTEMPT': '1'})
    def test_success_updates_both_services_after_migration(self):
        with patch.object(deploy, 'kubectl', side_effect=[json.dumps(DEPLOYMENT), '', '{"status":{"succeeded":1}}', '', '', '', '', '']) as cli:
            deploy.deploy('backend', 'sha256:' + 'a' * 64)
            updates = [c.args for c in cli.call_args_list if c.args[0] == 'set']
            self.assertEqual([c[2] for c in updates], ['deployment/portfolio-backend', 'deployment/portfolio-contact-worker'])


if __name__ == '__main__':
    unittest.main()
