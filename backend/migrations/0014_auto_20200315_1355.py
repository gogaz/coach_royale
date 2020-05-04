# Generated by Django 3.0.2 on 2020-03-15 13:55

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('backend', '0013_playercube'),
    ]

    operations = [
        migrations.AddField(
            model_name='card',
            name='card_id',
            field=models.IntegerField(null=True),
        ),
        migrations.AddField(
            model_name='clanhistory',
            name='region_id',
            field=models.CharField(max_length=32, null=True),
        ),
        migrations.AddField(
            model_name='playercardlevel',
            name='star_level',
            field=models.IntegerField(null=True),
        ),
        migrations.AddField(
            model_name='playerstatshistory',
            name='star_points',
            field=models.IntegerField(null=True),
        ),
        migrations.CreateModel(
            name='OfficialAPIError',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('clazz', models.CharField(max_length=256, null=True)),
                ('traceback', models.TextField(null=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('method', models.CharField(max_length=128, null=True)),
                ('refresh_method', models.CharField(max_length=256, null=True)),
                ('data', models.TextField(null=True)),
                ('code', models.CharField(max_length=64, null=True)),
                ('reason', models.CharField(max_length=256, null=True)),
            ],
            options={
                'abstract': False,
            },
        ),
        migrations.RenameModel(
            old_name='RoyaleAPIError',
            new_name='ObsoleteRoyaleAPIError',
        ),
    ]