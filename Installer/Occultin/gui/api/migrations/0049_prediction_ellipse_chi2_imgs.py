# Generated by Django 4.0.4 on 2022-07-05 15:03

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0048_ellipse_negativechord_ellipse_sigma_ellipse_step'),
    ]

    operations = [
        migrations.AddField(
            model_name='prediction',
            name='ellipse_chi2_imgs',
            field=models.TextField(default=None, null=True, verbose_name='Ellipse Chi2 Images'),
        ),
    ]
