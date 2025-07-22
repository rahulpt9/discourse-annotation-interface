# core/management/commands/export_templates.py

import os
import pandas as pd
from django.core.management.base import BaseCommand
from core.models import Domain, Heading

class Command(BaseCommand):
    help = "Export headings & sentence templates for each Domain (without the id column)"

    def handle(self, *args, **options):
        base_dir = os.getcwd()

        for domain in Domain.objects.all():
            key = domain.name.lower()

            # 1) HEADINGS — only foreignid & heading
            qs = Heading.objects.filter(domain=domain).order_by('id')
            head_rows = [
                {
                    'foreignid': h.pk,
                    'heading': h.title
                }
                for h in qs
            ]
            df_head = pd.DataFrame(head_rows, columns=['foreignid','heading'])

            head_fname = f"{key}_headings.xlsx"
            df_head.to_excel(
                os.path.join(base_dir, head_fname),
                index=False,
                sheet_name='Sheet1',
                engine='openpyxl'
            )
            self.stdout.write(f"→ Wrote {head_fname} ({len(df_head)} rows)")

            # 2) SENTENCE TEMPLATES (unchanged)
            sent_rows = [
                {'foreignid': h.pk, 'sentence_id': '', 'sentence': ''}
                for h in qs
            ]
            df_sent = pd.DataFrame(sent_rows, columns=['foreignid','sentence_id','sentence'])

            sent_fname = f"{key}_sentences_template.xlsx"
            df_sent.to_excel(
                os.path.join(base_dir, sent_fname),
                index=False,
                sheet_name='Sheet1',
                engine='openpyxl'
            )
            self.stdout.write(f"→ Wrote {sent_fname} ({len(df_sent)} rows)")

        self.stdout.write(self.style.SUCCESS("All templates exported!"))
