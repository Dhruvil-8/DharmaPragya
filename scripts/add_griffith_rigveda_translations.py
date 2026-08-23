import sqlite3
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

scrip_path = r"d:\DharmaPragya\backend\data\scriptures.db"
vedas_path = r"d:\DharmaPragya\backend\data\vedas.db"

print("Connecting to databases...")
scrip_conn = sqlite3.connect(scrip_path)
scrip_cur = scrip_conn.cursor()

vedas_conn = sqlite3.connect(vedas_path)
vedas_cur = vedas_conn.cursor()

# 1. Fetch Griffith translations from scriptures.db
scrip_cur.execute("""
    SELECT s.chapter_name, v.verse_number, t.text
    FROM translations t
    JOIN verses v ON t.verse_id = v.id
    JOIN sections s ON v.section_id = s.id
    WHERE s.source_id = 2 AND t.author = 'Ralph T.H. Griffith'
""")

griffith_map = {}
for ch_name, v_num, text in scrip_cur.fetchall():
    m = re.search(r"Mandala\s+(\d+),\s+Hymn\s+(\d+)", ch_name, re.IGNORECASE)
    if m:
        mandala = int(m.group(1))
        sukta = int(m.group(2))
        griffith_map[(mandala, sukta, v_num)] = text.strip()

print(f"Loaded {len(griffith_map)} Griffith translations from scriptures.db")

# 2. Fetch all Rigveda mantras from vedas.db
vedas_cur.execute("""
    SELECT id, division_1, division_2, division_3 
    FROM mantras 
    WHERE veda_id = 'rigveda'
""")
rv_mantras = vedas_cur.fetchall()
print(f"Found {len(rv_mantras)} Rigveda mantras in vedas.db")

# 3. Check and delete existing Griffith translations from vedas.db to prevent duplicates
vedas_cur.execute("DELETE FROM bhashyas WHERE author = 'Ralph T.H. Griffith'")
print(f"Cleaned any existing Griffith records in vedas.db")

# 4. Insert into bhashyas table
inserted = 0
bhashya_inserts = []
for mid, d1, d2, d3 in rv_mantras:
    trans_text = griffith_map.get((d1, d2, d3))
    if trans_text:
        bhashya_inserts.append((
            mid,
            'Ralph T.H. Griffith',
            'english',
            None, # mantra_vishaya
            None, # anvaya
            trans_text, # bhavartha (English translation)
            None  # tika
        ))
        inserted += 1

vedas_cur.executemany("""
    INSERT INTO bhashyas (mantra_id, author, language, mantra_vishaya, anvaya, bhavartha, tika)
    VALUES (?, ?, ?, ?, ?, ?, ?)
""", bhashya_inserts)

vedas_conn.commit()

# Verify count
vedas_cur.execute("SELECT count(*) FROM bhashyas WHERE author = 'Ralph T.H. Griffith'")
final_count = vedas_cur.fetchone()[0]

print(f"\n========================================================")
print(f"SUCCESS: Inserted {final_count} Ralph T.H. Griffith English translations into vedas.db!")
print(f"========================================================")

scrip_conn.close()
vedas_conn.close()
