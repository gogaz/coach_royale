# Generated by Django 2.1.5 on 2019-04-05 20:48

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('react_api', '0005_auto_20190403_0935'),
    ]

    operations = [
        migrations.AddField(
            model_name='clanhistory',
            name='global_war_rank',
            field=models.IntegerField(null=True),
        ),
        migrations.AddField(
            model_name='clanhistory',
            name='local_war_rank',
            field=models.IntegerField(null=True),
        ),
        migrations.AddField(
            model_name='clanhistory',
            name='prev_global_war_rank',
            field=models.IntegerField(null=True),
        ),
        migrations.AddField(
            model_name='clanhistory',
            name='prev_local_war_rank',
            field=models.IntegerField(null=True),
        ),
    ]