# Generated by Django 3.0.4 on 2020-03-29 17:00

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('resume', '0002_auto_20200329_1523'),
    ]

    operations = [
        migrations.AddField(
            model_name='project',
            name='picture',
            field=models.ImageField(blank=True, null=True, upload_to='', verbose_name='%(Class)S Header Picture'),
        ),
        migrations.AlterField(
            model_name='education',
            name='attachment',
            field=models.ManyToManyField(related_name='resume_education_related', related_query_name='resume_educations', to='resume.Attachment', verbose_name='%(Class)S Attachment'),
        ),
        migrations.AlterField(
            model_name='experience',
            name='attachment',
            field=models.ManyToManyField(related_name='resume_experience_related', related_query_name='resume_experiences', to='resume.Attachment', verbose_name='%(Class)S Attachment'),
        ),
        migrations.AlterField(
            model_name='project',
            name='attachment',
            field=models.ManyToManyField(related_name='resume_project_related', related_query_name='resume_projects', to='resume.Attachment', verbose_name='%(Class)S Attachment'),
        ),
    ]
