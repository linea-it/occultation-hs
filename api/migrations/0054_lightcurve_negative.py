# Generated by Django 4.0.4 on 2022-07-19 16:17

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0053_alter_ellipse_centerf_alter_ellipse_centerg_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='lightcurve',
            name='negative',
            field=models.BooleanField(default=False, verbose_name='Negative'),
        ),
    ]