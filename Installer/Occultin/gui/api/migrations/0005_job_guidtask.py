# Generated by Django 4.0.3 on 2022-03-23 14:45

from django.db import migrations, models
import uuid


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0004_remove_job_endat_job_endedat_alter_job_params_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='job',
            name='guidTask',
            field=models.UUIDField(default=uuid.uuid4, verbose_name='Guid Task'),
        ),
    ]