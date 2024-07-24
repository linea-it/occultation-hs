# Generated by Django 4.0.4 on 2022-07-14 22:27

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0050_rename_ellipse_chi2_prediction_ellipsechi2_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='ellipse',
            name='legendLocation',
            field=models.CharField(max_length=20, null=True, verbose_name='Legend Location'),
        ),
        migrations.AddField(
            model_name='ellipse',
            name='maxX',
            field=models.FloatField(null=True, verbose_name='Max X'),
        ),
        migrations.AddField(
            model_name='ellipse',
            name='maxY',
            field=models.FloatField(null=True, verbose_name='Max Y'),
        ),
        migrations.AddField(
            model_name='ellipse',
            name='minX',
            field=models.FloatField(null=True, verbose_name='Min X'),
        ),
        migrations.AddField(
            model_name='ellipse',
            name='minY',
            field=models.FloatField(null=True, verbose_name='Min Y'),
        ),
    ]
