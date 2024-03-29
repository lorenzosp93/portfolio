# Generated by Django 3.0.4 on 2022-04-02 18:17

from django.db import migrations, models
import django.db.models.deletion
import uuid


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('contenttypes', '0002_remove_content_type_name'),
        ('shared', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Entity',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('uuid', models.UUIDField(default=uuid.uuid4, editable=False)),
                ('name', models.CharField(max_length=90, unique=True)),
                ('slug', models.SlugField(editable=False, max_length=100)),
                ('picture', models.ImageField(upload_to='pictures/', verbose_name='Header picture')),
                ('type', models.IntegerField(choices=[(0, 'Company'), (1, 'Institution')])),
            ],
            options={
                'verbose_name_plural': 'Entities',
            },
        ),
        migrations.CreateModel(
            name='Keyword',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=90, unique=True)),
                ('slug', models.SlugField(editable=False, max_length=100)),
            ],
            options={
                'abstract': False,
            },
        ),
        migrations.CreateModel(
            name='SkillCategory',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=90, unique=True)),
                ('slug', models.SlugField(editable=False, max_length=100)),
                ('description', models.TextField(blank=True, null=True)),
            ],
            options={
                'verbose_name_plural': 'Skill Categories',
            },
        ),
        migrations.CreateModel(
            name='Skill',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('uuid', models.UUIDField(default=uuid.uuid4, editable=False)),
                ('name', models.CharField(max_length=90, unique=True)),
                ('slug', models.SlugField(editable=False, max_length=100)),
                ('created_at', models.DateTimeField(auto_now_add=True, verbose_name='Created date')),
                ('modified_at', models.DateTimeField(auto_now=True, verbose_name='Last modified date')),
                ('url', models.URLField(blank=True, null=True)),
                ('level', models.IntegerField(choices=[(1, 'basic'), (2, 'advanced'), (3, 'expert'), (4, 'professional')])),
                ('category', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='resume.SkillCategory')),
            ],
            options={
                'abstract': False,
            },
        ),
        migrations.CreateModel(
            name='Project',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('uuid', models.UUIDField(default=uuid.uuid4, editable=False)),
                ('name', models.CharField(max_length=90, unique=True)),
                ('slug', models.SlugField(editable=False, max_length=100)),
                ('created_at', models.DateTimeField(auto_now_add=True, verbose_name='Created date')),
                ('modified_at', models.DateTimeField(auto_now=True, verbose_name='Last modified date')),
                ('description', models.TextField(blank=True, null=True)),
                ('picture', models.ImageField(upload_to='pictures/', verbose_name='Header picture')),
                ('content', models.TextField()),
                ('object_id', models.UUIDField()),
                ('attachments', models.ManyToManyField(blank=True, related_name='resume_project_related', related_query_name='resume_projects', to='shared.Attachment', verbose_name='attachment')),
                ('content_type', models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, to='contenttypes.ContentType')),
            ],
            options={
                'ordering': ['-created_at'],
            },
        ),
        migrations.CreateModel(
            name='Experience',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('uuid', models.UUIDField(default=uuid.uuid4, editable=False)),
                ('name', models.CharField(max_length=90, unique=True)),
                ('slug', models.SlugField(editable=False, max_length=100)),
                ('created_at', models.DateTimeField(auto_now_add=True, verbose_name='Created date')),
                ('modified_at', models.DateTimeField(auto_now=True, verbose_name='Last modified date')),
                ('start_date', models.DateField(verbose_name='Start date')),
                ('end_date', models.DateField(blank=True, null=True, verbose_name='End date')),
                ('current', models.BooleanField(default=False, verbose_name='Is current')),
                ('location', models.CharField(max_length=50)),
                ('description', models.TextField(blank=True, null=True)),
                ('department', models.CharField(blank=True, max_length=100)),
                ('key_achievements', models.TextField(blank=True)),
                ('attachments', models.ManyToManyField(blank=True, related_name='resume_experience_related', related_query_name='resume_experiences', to='shared.Attachment', verbose_name='attachment')),
                ('entity', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='resume.Entity')),
                ('keywords', models.ManyToManyField(blank=True, to='resume.Keyword')),
            ],
            options={
                'verbose_name': 'Experience',
                'ordering': ['-start_date'],
            },
        ),
        migrations.CreateModel(
            name='Education',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('uuid', models.UUIDField(default=uuid.uuid4, editable=False)),
                ('name', models.CharField(max_length=90, unique=True)),
                ('slug', models.SlugField(editable=False, max_length=100)),
                ('created_at', models.DateTimeField(auto_now_add=True, verbose_name='Created date')),
                ('modified_at', models.DateTimeField(auto_now=True, verbose_name='Last modified date')),
                ('start_date', models.DateField(verbose_name='Start date')),
                ('end_date', models.DateField(blank=True, null=True, verbose_name='End date')),
                ('current', models.BooleanField(default=False, verbose_name='Is current')),
                ('location', models.CharField(max_length=50)),
                ('description', models.TextField(blank=True, null=True)),
                ('attachments', models.ManyToManyField(blank=True, related_name='resume_education_related', related_query_name='resume_educations', to='shared.Attachment', verbose_name='attachment')),
                ('entity', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='resume.Entity')),
                ('keywords', models.ManyToManyField(blank=True, to='resume.Keyword')),
            ],
            options={
                'verbose_name': 'Education',
                'ordering': ['-start_date'],
            },
        ),
    ]
