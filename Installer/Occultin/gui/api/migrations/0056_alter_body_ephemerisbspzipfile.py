# Generated by Django 4.0.2 on 2022-07-20 16:18

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0055_alter_body_ephemeris'),
    ]

    operations = [
        migrations.AlterField(
            model_name='body',
            name='ephemerisBSPzipFile',
            field=models.TextField(default=None, null=True),
        ),
    ]
