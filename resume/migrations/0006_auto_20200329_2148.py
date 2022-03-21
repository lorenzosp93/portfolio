# Generated by Django 3.0.4 on 2020-03-29 21:48

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('resume', '0005_auto_20200329_1937'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='company',
            name='logo',
        ),
        migrations.AddField(
            model_name='company',
            name='picture',
            field=models.ImageField(default=0, upload_to='pictures/', verbose_name='Header picture'),
            preserve_default=False,
        ),
    ]
