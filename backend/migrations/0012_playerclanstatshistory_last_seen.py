# Generated by Django 2.2.7 on 2019-12-05 20:06

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('backend', '0011_royaleapierror'),
    ]

    operations = [
        migrations.AddField(
            model_name='playerclanstatshistory',
            name='last_seen',
            field=models.DateTimeField(null=True),
        ),
    ]