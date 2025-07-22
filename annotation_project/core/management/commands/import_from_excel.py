import pandas as pd
from django.core.management.base import BaseCommand, CommandError
from django.db import transaction
from core.models import Domain, Heading, Sentence

class Command(BaseCommand):
    help = (
        "Import rows from an Excel file into Domain, Heading, and Sentence tables. "
        "Use --domain to set the domain for all rows; if no --domain provided, requires a 'domain' column."  
    )

    def add_arguments(self, parser):
        parser.add_argument(
            'excel_path', help='Path to the .xlsx file to import'
        )
        parser.add_argument(
            '--sheet', default='Sheet1', help='Excel sheet name (default Sheet1)'
        )
        parser.add_argument(
            '--domain', help='Domain name for all rows (overrides column)'
        )

    @transaction.atomic
    def handle(self, *args, **options):
        path       = options['excel_path']
        sheet      = options['sheet']
        forced_dom = options.get('domain')

        try:
            df = pd.read_excel(path, sheet_name=sheet, engine='openpyxl')
        except Exception as e:
            raise CommandError(f"Error reading {path}:{sheet} → {e}")

        cols = {c.lower() for c in df.columns}
        required = {'heading', 'sentence'}
        if forced_dom is None:
            required.add('domain')
        if not required.issubset(cols):
            missing = required - cols
            raise CommandError(f"Missing columns: {', '.join(missing)}")

        use_idx = 'sentence_id' in cols
        if use_idx:
            self.stdout.write("Using provided 'sentence_id' column")
        if forced_dom:
            self.stdout.write(f"Overriding domain to '{forced_dom}'")

        total = len(df)
        self.stdout.write(f"Importing {total} rows from {path} (sheet={sheet})…")

        for idx, row in df.iterrows():
            dom_name = forced_dom or row['domain']
            heading_title = row['heading']
            sent_text = row['sentence']

            domain, _ = Domain.objects.get_or_create(name=dom_name)
            heading, _ = Heading.objects.get_or_create(domain=domain, title=heading_title)

            if use_idx:
                ext_id = row['sentence_id']
                Sentence.objects.update_or_create(
                    sentence_id=ext_id,
                    defaults={'heading': heading, 'text': sent_text}
                )
            else:
                Sentence.objects.create(heading=heading, text=sent_text)

            if (idx + 1) % 100 == 0:
                self.stdout.write(f"  …{idx+1}/{total} processed")

        self.stdout.write(self.style.SUCCESS("Import complete!"))
