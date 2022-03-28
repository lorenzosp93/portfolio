# Generated by Django 3.0.4 on 2022-03-22 18:27

from django.db import migrations, models
import django.db.models.deletion
import uuid


class Migration(migrations.Migration):

    dependencies = [
        ('contenttypes', '0002_remove_content_type_name'),
        ('resume', '0013_keyword'),
    ]

    operations = [
        migrations.RenameModel(
            old_name='Company',
            new_name='Entity',
        ),
        migrations.AlterModelOptions(
            name='entity',
            options={'verbose_name_plural': 'Entities'},
        ),
        migrations.RenameField(
            model_name='education',
            old_name='company',
            new_name='entity',
        ),
        migrations.RenameField(
            model_name='experience',
            old_name='company',
            new_name='entity',
        ),
        migrations.RemoveField(
            model_name='education',
            name='project',
        ),
        migrations.RemoveField(
            model_name='experience',
            name='project',
        ),
        migrations.RemoveField(
            model_name='keyword',
            name='content_type',
        ),
        migrations.RemoveField(
            model_name='keyword',
            name='object_id',
        ),
        migrations.RemoveField(
            model_name='project',
            name='id',
        ),
        migrations.AddField(
            model_name='education',
            name='keywords',
            field=models.ManyToManyField(to='resume.Keyword'),
        ),
        migrations.AddField(
            model_name='experience',
            name='keywords',
            field=models.ManyToManyField(to='resume.Keyword'),
        ),
        migrations.AddField(
            model_name='keyword',
            name='id',
            field=models.AutoField(auto_created=True, default=1, primary_key=True, serialize=False, verbose_name='ID'),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='keyword',
            name='slug',
            field=models.SlugField(default='', editable=False, max_length=100),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='project',
            name='content_type',
            field=models.ForeignKey(default=None, on_delete=django.db.models.deletion.CASCADE, null=True,to='contenttypes.ContentType'),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='project',
            name='object_id',
            field=models.UUIDField(default=uuid.uuid4, primary_key=False, serialize=False),
            preserve_default=False,
        ),
        migrations.AlterField(
            model_name='keyword',
            name='name',
            field=models.CharField(max_length=90, unique=True),
        ),
    ]
