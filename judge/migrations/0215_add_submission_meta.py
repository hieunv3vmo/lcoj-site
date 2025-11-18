# Generated migration for adding meta field to Submission
from django.db import migrations, models
import jsonfield


class Migration(migrations.Migration):

    dependencies = [
        ('judge', '0214_create_ide_problem'),
    ]

    operations = [
        migrations.AddField(
            model_name='submission',
            name='meta',
            field=jsonfield.JSONField(blank=True, null=True, verbose_name='metadata'),
        ),
    ]
