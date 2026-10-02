from django.db import connection
from django.db.migrations.executor import MigrationExecutor
from django.test import TransactionTestCase


class HighlightCardMigrationTests(TransactionTestCase):
    def migrate(self, targets):
        executor = MigrationExecutor(connection)
        executor.migrate(targets)
        return executor.loader.project_state(targets).apps

    def tearDown(self):
        self.migrate(MigrationExecutor(connection).loader.graph.leaf_nodes())
        super().tearDown()

    def test_rename_preserves_published_and_draft_cards_and_settings(self):
        apps = self.migrate([('shared', '0008_seed_leadership_content')])
        Card = apps.get_model('shared', 'LeadershipCard')
        Site = apps.get_model('shared', 'SiteSettings')
        Card.objects.all().delete()
        published = Card.objects.create(title='Custom highlight', body='Edited copy', position=4)
        draft = Card.objects.create(title='Draft', body='Private draft', active=False)
        Site.objects.update_or_create(pk=1, defaults={'about_text': 'Edited introduction'})

        apps = self.migrate([('shared', '0009_highlight_cards_and_skills')])
        Highlight = apps.get_model('shared', 'HighlightCard')
        self.assertEqual(Highlight._meta.db_table, 'shared_leadershipcard')
        self.assertEqual(Highlight.objects.get(pk=published.pk).body, 'Edited copy')
        self.assertFalse(Highlight.objects.get(pk=draft.pk).active)
        self.assertEqual(Highlight.objects.count(), 2)
        site = apps.get_model('shared', 'SiteSettings').objects.get(pk=1)
        self.assertEqual(site.about_text, 'Edited introduction')
        self.assertFalse(site.show_skills)
