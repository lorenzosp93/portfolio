# Generated by Django 4.0.2 on 2022-04-06 09:36

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('shared', '0002_alter_attachment_id_alter_authorable_created_by_and_more'),
        ('resume', '0002_auto_20220404_1402'),
    ]

    operations = [
        migrations.AlterField(
            model_name='education',
            name='attachments',
            field=models.ManyToManyField(blank=True, related_name='%(app_label)s_%(class)s_related', related_query_name='%(app_label)s_%(class)ss', to='shared.Attachment', verbose_name='attachment'),
        ),
        migrations.AlterField(
            model_name='education',
            name='id',
            field=models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID'),
        ),
        migrations.AlterField(
            model_name='entity',
            name='id',
            field=models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID'),
        ),
        migrations.AlterField(
            model_name='experience',
            name='attachments',
            field=models.ManyToManyField(blank=True, related_name='%(app_label)s_%(class)s_related', related_query_name='%(app_label)s_%(class)ss', to='shared.Attachment', verbose_name='attachment'),
        ),
        migrations.AlterField(
            model_name='experience',
            name='id',
            field=models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID'),
        ),
        migrations.AlterField(
            model_name='keyword',
            name='id',
            field=models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID'),
        ),
        migrations.AlterField(
            model_name='project',
            name='attachments',
            field=models.ManyToManyField(blank=True, related_name='%(app_label)s_%(class)s_related', related_query_name='%(app_label)s_%(class)ss', to='shared.Attachment', verbose_name='attachment'),
        ),
        migrations.AlterField(
            model_name='project',
            name='id',
            field=models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID'),
        ),
        migrations.AlterField(
            model_name='skill',
            name='id',
            field=models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID'),
        ),
        migrations.AlterField(
            model_name='skillcategory',
            name='id',
            field=models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID'),
        ),
    ]
