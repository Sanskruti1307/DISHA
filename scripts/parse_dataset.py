import json
import glob
import re

transcript_files = glob.glob(r'C:\Users\Sanskruti\.gemini\antigravity-ide\brain\358d90ee-cde5-49b7-84bb-8cb40e553d78\.system_generated\logs\*.jsonl')
rows = []
if transcript_files:
    with open(transcript_files[0], 'r', encoding='utf-8', errors='ignore') as f:
        for line in f:
            if '"USER_INPUT"' in line:
                try:
                    obj = json.loads(line)
                    content = obj.get('content', '')
                    if 'id,question,language,intent,expected_output,answer' in content:
                        csv_text = content.split('id,question,language,intent,expected_output,answer')[1]
                        import csv, io
                        reader = csv.reader(io.StringIO('id,question,language,intent,expected_output,answer' + csv_text))
                        header = next(reader)
                        for r in reader:
                            if len(r) >= 6:
                                rows.append({
                                    "id": r[0].strip(),
                                    "question": r[1].strip(),
                                    "language": r[2].strip(),
                                    "intent": r[3].strip(),
                                    "expected_output": r[4].strip(),
                                    "answer": r[5].strip()
                                })
                        break
                except Exception as e:
                    pass

print(f"Extracted {len(rows)} rows")
if rows:
    with open('data/records.json', 'w', encoding='utf-8') as f:
        json.dump(rows, f, ensure_ascii=False, indent=2)
    # also save CSV
    with open('data/dataset.csv', 'w', encoding='utf-8', newline='') as f:
        import csv
        w = csv.DictWriter(f, fieldnames=["id","question","language","intent","expected_output","answer"])
        w.writeheader()
        w.writerows(rows)
