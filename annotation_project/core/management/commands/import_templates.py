# core/management/commands/import_templates.py

import os
import pandas as pd
from django.core.management.base import BaseCommand, CommandError
from core.models import Domain, Heading, Sentence

class Command(BaseCommand):
    help = "Import headings & sentences from Excel files into the DB"

    def add_arguments(self, parser):
        parser.add_argument(
            'domain_name',
            help='Name of the domain to import (e.g. Newspaper)'
        )

    def handle(self, *args, **options):
        base_dir   = os.getcwd()
        domain_key = options['domain_name'].lower()

        # 1) Load the Domain
        try:
            domain = Domain.objects.get(name__iexact=options['domain_name'])
        except Domain.DoesNotExist:
            raise CommandError(f"No domain named '{options['domain_name']}'")

        # 2) Import Headings
        head_path = os.path.join(base_dir, f"{domain_key}_headings.xlsx")
        try:
            df_head = pd.read_excel(head_path, engine='openpyxl')
        except FileNotFoundError:
            raise CommandError(f"Could not find {head_path}")
        self.stdout.write(f"Importing {len(df_head)} headings from {head_path}…")

        for _, row in df_head.iterrows():
            title = row['heading']
            obj, created = Heading.objects.get_or_create(
                domain=domain,
                title=title
            )
            if created:
                self.stdout.write(f"  + Created Heading #{obj.id}: {obj.title}")

        # 3) Import Sentences
        sent_path = os.path.join(base_dir, f"{domain_key}_sentences.xlsx")
        try:
            df_sent = pd.read_excel(sent_path, engine='openpyxl')
        except FileNotFoundError:
            raise CommandError(f"Could not find {sent_path}")
        self.stdout.write(f"Importing {len(df_sent)} sentences from {sent_path}…")

        for _, row in df_sent.iterrows():
            hid  = int(row['foreignid'])
            text = row['sentence']
            try:
                heading = Heading.objects.get(id=hid, domain=domain)
            except Heading.DoesNotExist:
                self.stdout.write(f"  ! No Heading with id={hid}, skipping.")
                continue
            Sentence.objects.create(heading=heading, text=text)

        self.stdout.write(self.style.SUCCESS("Import complete!"))
