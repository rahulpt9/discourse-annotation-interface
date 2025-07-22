import pandas as pd
import re

# === Configuration ===
INPUT_TXT      = 'C:/Users/Rahul/Desktop/anotatorsss/scripts/hindi_5000_sentence.txt'  # Path to your TXT file
OUTPUT_XLSX    = 'newspaper.xlsx'           # Desired output Excel file
DOMAIN_PREFIX  = 'news'                               # e.g. 'news', 'stories', 'conversation'
SHEET_NAME     = 'Sheet1'
# =====================

def txt_to_excel(txt_path, excel_path, domain_prefix, sheet_name='Sheet1'):
    # Read lines from the TXT
    with open(txt_path, 'r', encoding='utf-8') as f:
        lines = [line.strip() for line in f if line.strip()]

    data = []
    headline = None
    h_count = 0
    s_count = 0

    for line in lines:
        # Detect a headline line (e.g. starts with "HEADLINE:")
        m = re.match(r'^(?:HEADLINE:|this have headline:)\s*(.*)', line, flags=re.IGNORECASE)
        if m:
            headline = m.group(1).strip()
            h_count += 1
            s_count = 0
            continue

        # Otherwise treat as a sentence under the current headline
        if headline:
            s_count += 1
            # Build zero‑padded sentence ID
            sent_id = f"{domain_prefix}_headline_{h_count}_{s_count:04d}"
            data.append({
                'heading':     headline,
                'sentence_id': sent_id,
                'sentence':    line
            })

    # Create DataFrame and write to Excel
    df = pd.DataFrame(data, columns=['heading','sentence_id','sentence'])
    df.to_excel(excel_path, index=False, sheet_name=sheet_name, engine='openpyxl')
    print(f"Written {len(df)} rows to {excel_path}")

if __name__ == '__main__':
    txt_to_excel(
        INPUT_TXT,
        OUTPUT_XLSX,
        DOMAIN_PREFIX,
        SHEET_NAME
    )
