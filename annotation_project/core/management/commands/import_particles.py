# core/management/commands/import_particles.py
from django.core.management.base import BaseCommand
from core.models import Particle

class Command(BaseCommand):
    help = 'Import discourse particles and their English glosses from the hard-coded list.'

    # Hard-coded list of (code, english) pairs
    PARTICLES = [
        ('hI_1', 'Distinction, distinguishing, exclusive'),
        ('hI_2', 'fixture, firmness'),
        ('hI_3', 'A few'),
        ('hI_4', 'Right from'),
        ('hI_5', 'Not only… but also'),
        ('hI_6', 'Only'),
        ('aura_1', 'Additional (but not as conjunctive)'),
        ('BI_1', 'also/Inclusive'),
        ('BI_2', 'Emphasis'),
        ('BI_3', 'Any'),
        ('BI_4', 'Yet/Even then'),
        ('BI_5', 'Still'),
        ('wo_1', 'Contrast'),
        ('wo_2', 'certainty'),
        ('wo_3', 'Coordination'),
        ('wo_4', 'strong assertion'),
        ('waka_1', 'limit'),
        ('waka_2', 'even'),
        ('mAwra_1', 'only'),
        ('mAwra_2', 'all'),
        ('mAwra_3', 'Very little'),
        ('sIrPa_1', 'only'),
        ('sA_1', 'similarity'),
        ('sA_2', 'appearance'),
        ('sA_3', 'slightly'),
        ('sA_4', 'kind'),
        ('lagaBaga_1', 'Approximately'),
        ('nA_1', 'reproach with familiarity'),
        ('nA_2', 'loving request'),
        ('nA_3', 'negation/avoidance'),
        ('nA_4', 'informality'),
        ('basa_1', 'stop'),
        ('basa_2', 'sudden interruption'),
        ('basa_3', 'only'),
        ('karIba_1', 'physical closeness or metaphorical proximity'),
        ('karIba_2', 'approximation'),
        ('TIka_1', 'Exactly'),
        ('TIka_2', 'Correct / Proper / Appropriate'),
        ('TIka_3', 'fine'),
        ('TIka_4', 'alright'),
    ]

    def handle(self, *args, **options):
        count = 0
        for code, english in self.PARTICLES:
            Particle.objects.update_or_create(
                code=code,
                defaults={'english': english}
            )
            count += 1
        self.stdout.write(self.style.SUCCESS(f'Imported/updated {count} particles.'))
