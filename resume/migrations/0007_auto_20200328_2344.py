# Generated by Django 3.0.4 on 2020-03-28 23:44

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('resume', '0006_auto_20200322_1204'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='skillcategory',
            options={},
        ),
        migrations.RemoveField(
            model_name='project',
            name='during',
        ),
        migrations.AddField(
            model_name='education',
            name='attachment',
            field=models.FileField(blank=True, null=True, upload_to='attachments/'),
        ),
        migrations.AddField(
            model_name='education',
            name='project',
            field=models.ManyToManyField(to='resume.Project'),
        ),
        migrations.AddField(
            model_name='experience',
            name='attachment',
            field=models.FileField(blank=True, null=True, upload_to='attachments/'),
        ),
        migrations.AddField(
            model_name='experience',
            name='project',
            field=models.ManyToManyField(to='resume.Project'),
        ),
        migrations.RemoveField(
            model_name='education',
            name='company',
        ),
        migrations.AddField(
            model_name='education',
            name='company',
            field=models.ManyToManyField(to='resume.Company'),
        ),
        migrations.RemoveField(
            model_name='experience',
            name='company',
        ),
        migrations.AddField(
            model_name='experience',
            name='company',
            field=models.ManyToManyField(to='resume.Company'),
        ),
        migrations.DeleteModel(
            name='Attachment',
        ),
    ]
