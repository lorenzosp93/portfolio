"""Replace the SkillCategory model with an enum and fold Language into Skill."""
from django.db import migrations, models

LEGACY_CATEGORY_MAP = {
    'coding': 'computer_science',
    'computer-science': 'computer_science',
    'industry-knowledge': 'industry_knowledge',
}


def to_enum(apps, schema_editor):
    Skill = apps.get_model('resume', 'Skill')
    for skill in Skill.objects.select_related('category_legacy'):
        legacy = skill.category_legacy
        slug = (legacy.slug or '').lower() if legacy else ''
        name = (legacy.name or '').lower() if legacy else ''
        if 'language' in slug or 'language' in name:
            value = 'language'
        elif 'industry' in slug or 'industry' in name:
            value = 'industry_knowledge'
        else:
            value = LEGACY_CATEGORY_MAP.get(slug, 'computer_science')
        skill.category = value
        skill.save(update_fields=['category'])


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
                    ('computer_science', 'Computer Science'),
                    ('industry_knowledge', 'Industry knowledge'),
                    ('language', 'Languages'),
                ],
                default='computer_science',
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
