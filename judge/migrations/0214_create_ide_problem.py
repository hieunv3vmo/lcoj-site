# Generated migration for creating the __ide__ problem
from django.db import migrations


def create_ide_problem(apps, schema_editor):
    """
    Create the special __ide__ problem for Online IDE execution.
    This problem is used exclusively for IDE code execution, not for grading.
    """
    Problem = apps.get_model('judge', 'Problem')
    ProblemTranslation = apps.get_model('judge', 'ProblemTranslation')

    # Create the IDE problem if it doesn't exist
    ide_problem, created = Problem.objects.get_or_create(
        code='__ide__',
        defaults={
            'name': 'Online IDE',
            'description': '',
            'points': 0.0,
            'partial': False,
            'allowed_languages_id': None,
            'time_limit': 15.0,  # 15 seconds for IDE
            'memory_limit': 262144,  # 256 MB
            'short_circuit': False,
            'group_id': None,
            'is_public': False,  # Hidden from problem list
            'is_manually_managed': True,
            'is_organization_private': False,
            'date': None,
            'banned_users': None,
            'license_id': None,
        }
    )

    if created:
        # Create English translation
        ProblemTranslation.objects.create(
            problem=ide_problem,
            language='en',
            name='Online IDE',
            description='Special problem for Online IDE code execution. Not for direct submission.',
        )


def delete_ide_problem(apps, schema_editor):
    """
    Remove the __ide__ problem when rolling back.
    """
    Problem = apps.get_model('judge', 'Problem')
    Problem.objects.filter(code='__ide__').delete()


class Migration(migrations.Migration):

    dependencies = [
        ('judge', '0213_add_rate_disqualified'),
    ]

    operations = [
        migrations.RunPython(create_ide_problem, delete_ide_problem),
    ]
