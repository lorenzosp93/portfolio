from django.db import connection
from django.db.migrations.executor import MigrationExecutor
from django.test import TransactionTestCase

BEFORE = [('resume', '0011_skill_show_on_cv')]
AFTER = [('resume', '0012_skill_category_enum')]

# Production categories and skills as served on 2026-09-25.
PRODUCTION = {
    'Soft skills': ['Problem solving', 'Public speaking', 'Leadership'],
    'Language': ['English', 'Spanish', 'Italian', 'Dutch'],
    'Industry knowledge': ['Product management', 'Systems design'],
    'Web stack': ['Django', 'Vue.js', 'Kubernetes'],
    'Programming': ['Python', 'TypeScript'],
    'Data': ['SQL', 'MongoDB'],
}


class SkillCategoryMigrationTests(TransactionTestCase):
    def migrate(self, targets):
        executor = MigrationExecutor(connection)
        executor.loader.build_graph()
        executor.migrate(targets)
        return executor.loader.project_state(targets).apps

    def tearDown(self):
        self.migrate(executor_latest())

    def test_maps_every_production_category(self):
        from django.utils.text import slugify
        apps = self.migrate(BEFORE)
        Category = apps.get_model('resume', 'SkillCategory')
        Skill = apps.get_model('resume', 'Skill')
        for name, skills in PRODUCTION.items():
            category = Category.objects.create(name=name, slug=slugify(name))
            for skill in skills:
                Skill.objects.create(name=skill, slug=slugify(skill), category=category, level=3)

        apps = self.migrate(AFTER)
        Skill = apps.get_model('resume', 'Skill')
        mapped = {skill.name: skill.category for skill in Skill.objects.all()}
        self.assertEqual(mapped['Leadership'], 'soft_skills')
        self.assertEqual(mapped['Dutch'], 'language')
        self.assertEqual(mapped['Systems design'], 'industry_knowledge')
        self.assertEqual(mapped['Vue.js'], 'web_stack')
        self.assertEqual(mapped['TypeScript'], 'programming')
        self.assertEqual(mapped['MongoDB'], 'data')
        self.assertEqual(len(mapped), sum(map(len, PRODUCTION.values())))

    def test_unknown_category_fails_loudly(self):
        apps = self.migrate(BEFORE)
        Category = apps.get_model('resume', 'SkillCategory')
        Skill = apps.get_model('resume', 'Skill')
        category = Category.objects.create(name='Mystery', slug='mystery')
        Skill.objects.create(name='Juggling', slug='juggling', category=category, level=1)
        with self.assertRaisesRegex(RuntimeError, 'Mystery'):
            self.migrate(AFTER)
        Skill.objects.all().delete()
        Category.objects.all().delete()


def executor_latest():
    executor = MigrationExecutor(connection)
    return executor.loader.graph.leaf_nodes()
