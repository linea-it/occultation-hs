# Generated by Django 4.0.2 on 2022-06-08 18:09

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0033_star_referencemag_star_varg_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='star',
            name='calculationType',
            field=models.CharField(choices=[('kervella', 'kervella'), ('van_belle', 'van_belle'), ('gaia', 'gaia'), ('user', 'user')], default=None, max_length=9, null=True, verbose_name='CalculationType'),
        ),
    ]