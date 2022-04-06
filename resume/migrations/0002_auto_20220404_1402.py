# Generated by Django 3.0.4 on 2022-04-04 14:02

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('resume', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='education',
            name='entity',
            field=models.ForeignKey(limit_choices_to={'type': 1}, on_delete=django.db.models.deletion.CASCADE, related_name='educations', related_query_name='education_related', to='resume.Entity'),
        ),
        migrations.AlterField(
            model_name='experience',
            name='entity',
            field=models.ForeignKey(limit_choices_to={'type': 0}, on_delete=django.db.models.deletion.CASCADE, related_name='experiences', related_query_name='experience_related', to='resume.Entity'),
        ),
    ]
