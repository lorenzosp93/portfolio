"""Replace the SkillCategory model with an enum and fold Language into Skill."""
from django.db import migrations, models

# Keyed by the legacy category's name or slug (casefolded). Values match the
# production categories as of 2026-09-25; "coding" is a local-dev leftover.
LEGACY_CATEGORY_MAP = {
    'soft skills': 'soft_skills', 'soft-skills': 'soft_skills',
    'language': 'language', 'languages': 'language',
    'industry knowledge': 'industry_knowledge', 'industry-knowledge': 'industry_knowledge',
    'web stack': 'web_stack', 'web-stack': 'web_stack',
    'programming': 'programming',
    'data': 'data',
    'coding': 'web_stack', 'computer science': 'web_stack',
}


def to_enum(apps, schema_editor):
    Skill = apps.get_model('resume', 'Skill')
    unknown = set()
    for skill in Skill.objects.select_related('category_legacy'):
        legacy = skill.category_legacy
        keys = [(legacy.name or '').casefold(), (legacy.slug or '').casefold()] if legacy else []
        value = next((LEGACY_CATEGORY_MAP[k] for k in keys if k in LEGACY_CATEGORY_MAP), None)
        if value is None:
            unknown.add(legacy.name if legacy else '<none>')
            continue
        skill.category = value
        skill.save(update_fields=['category'])
    if unknown:
        # Fail the deploy rather than silently misfiling skills.
        raise RuntimeError(f'Unmapped skill categories: {sorted(unknown)}; extend LEGACY_CATEGORY_MAP.')


def languages_to_skills(apps, schema_editor):
    Language = apps.get_model('resume', 'Language')
    Skill = apps.get_model('resume', 'Skill')
    for language in Language.objects.all():
        # 1–100% onto novice(0)…professional(4).
        level = max(0, min(4, round(language.proficiency / 20) - 1))
        Skill.objects.get_or_create(
            name=language.name,
            defaults={
                'slug': language.name.lower().replace(' ', '-'),
                'category': 'language',
                'level': level,
                'show_on_cv': True,
            },
        )


class Migration(migrations.Migration):

    dependencies = [
        ('resume', '0011_skill_show_on_cv'),
    ]

    operations = [
        migrations.RenameField('skill', 'category', 'category_legacy'),
        migrations.AddField(
            model_name='skill',
            name='category',
            field=models.CharField(
                choices=[
                    ('soft_skills', 'Soft skills'),
                    ('language', 'Language'),
                    ('industry_knowledge', 'Industry knowledge'),
                    ('web_stack', 'Web stack'),
                    ('programming', 'Programming'),
                    ('data', 'Data'),
                ],
                default='programming',
                max_length=32,
            ),
        ),
        migrations.RunPython(to_enum, migrations.RunPython.noop),
        migrations.RunPython(languages_to_skills, migrations.RunPython.noop),
        migrations.RemoveField('skill', 'category_legacy'),
        migrations.DeleteModel('SkillCategory'),
        migrations.DeleteModel('Language'),
        migrations.AlterField(
            model_name='skill',
            name='show_on_cv',
            field=models.BooleanField(
                default=False,
                help_text='Show on the printable CV (bar, or bubble for languages); size follows Level.',
                verbose_name='Show on CV',
            ),
        ),
    ]
