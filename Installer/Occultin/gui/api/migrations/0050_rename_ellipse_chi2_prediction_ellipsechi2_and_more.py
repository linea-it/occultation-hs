# Generated by Django 4.0.4 on 2022-07-06 23:55

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0049_prediction_ellipse_chi2_imgs'),
    ]

    operations = [
        migrations.RenameField(
            model_name='prediction',
            old_name='ellipse_chi2',
            new_name='ellipseChi2',
        ),
        migrations.RenameField(
            model_name='prediction',
            old_name='ellipse_chi2_imgs',
            new_name='ellipseChi2Imgs',
        ),
        migrations.AddField(
            model_name='prediction',
            name='fittedOcc',
            field=models.TextField(default=None, null=True, verbose_name='Fitted Occultation'),
        ),
        migrations.AlterField(
            model_name='prediction',
            name='dist',
            field=models.FloatField(default=0, verbose_name='Distancia'),
        ),
        migrations.AlterField(
            model_name='prediction',
            name='vel',
            field=models.FloatField(default=0, verbose_name='Velocidade'),
        ),
    ]