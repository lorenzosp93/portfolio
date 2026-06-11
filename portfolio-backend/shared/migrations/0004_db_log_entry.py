from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ('shared', '0003_keys_subscription_and_more'),
    ]

    operations = [
        migrations.CreateModel(
            name='SystemLog',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(auto_now_add=True, db_index=True)),
                ('level', models.CharField(max_length=20, db_index=True)),
                ('logger_name', models.CharField(max_length=255, db_index=True)),
                ('message', models.TextField()),
                ('traceback', models.TextField(blank=True)),
            ],
            options={'ordering': ['-created_at']},
        ),
    ]
