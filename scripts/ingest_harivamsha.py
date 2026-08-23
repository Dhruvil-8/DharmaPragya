#!/usr/bin/env python3
"""
Ingestion Pipeline for Harivamsha Purana (हरिवंशपुराणम् - Mahabharata Khila Bhaga)
Ingests all 3 Parvas:
1. Harivamsha Parva (55 Adhyayas)
2. Vishnu Parva (128 Adhyayas)
3. Bhavishya Parva (135 Adhyayas)
Total: 318 Adhyayas, ~16,000 verses.
"""

import urllib.request
from bs4 import BeautifulSoup
import re
import sqlite3
import time
import sys

sys.stdout.reconfigure(encoding='utf-8')

DB_PATH = r"d:\DharmaPragya\backend\data\scriptures.db"
HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9',
}

def fetch_html_text(url):
    print(f"Fetching {url}...")
    req = urllib.request.Request(url, headers=HEADERS)
    for attempt in range(5):
        try:
            with urllib.request.urlopen(req, timeout=40) as resp:
                html = resp.read().decode('utf-8', errors='ignore')
            soup = BeautifulSoup(html, 'html.parser')
            pre = soup.find('pre')
            text = pre.get_text() if pre else soup.get_text()
            time.sleep(2.0)
            return text
        except urllib.error.HTTPError as e:
            print(f"  HTTP Error {e.code} on attempt {attempt+1}: {e}")
            if e.code == 429:
                time.sleep(6 + attempt * 3)
            else:
                time.sleep(3)
        except Exception as e:
            print(f"  Network error on attempt {attempt+1}: {e}")
            time.sleep(3)
            
    raise RuntimeError(f"Failed to fetch {url} after 5 attempts")

def get_or_create_source(conn, name, src_type="Purana"):
    cur = conn.cursor()
    cur.execute("SELECT id FROM sources WHERE name = ?", (name,))
    row = cur.fetchone()
    if row:
        return row[0]
    cur.execute("INSERT INTO sources (name, type) VALUES (?, ?)", (name, src_type))
    conn.commit()
    return cur.lastrowid

def parse_and_insert_harivamsha(conn):
    print("\n" + "="*60)
    print("INGESTING HARIVAMSHA PURANA (3 PARVAS COMPLETE)")
    print("="*60)
    
    url = "https://sanskritdocuments.org/doc_purana/harivanshapurANam.html"
    text = fetch_html_text(url)
    lines = text.splitlines()
    
    source_id = get_or_create_source(conn, "Harivamsha Purana", "Purana")
    cur = conn.cursor()
    
    cur.execute("DELETE FROM verses WHERE section_id IN (SELECT id FROM sections WHERE source_id = ?)", (source_id,))
    cur.execute("DELETE FROM sections WHERE source_id = ?", (source_id,))
    conn.commit()
    
    current_parva = "हरिवंशपर्व"
    current_adhyaya = 1
    current_chapter_name = f"{current_parva}, अध्याय १"
    global_chap_num = 1
    
    cur.execute("INSERT INTO sections (source_id, chapter_number, chapter_name) VALUES (?, ?, ?)",
                (source_id, global_chap_num, current_chapter_name))
    current_section_id = cur.lastrowid
    
    verse_buffer = []
    verse_count_in_chap = 0
    total_verses = 0
    trans_map = str.maketrans('०१२३४५६७८९', '0123456789')
    
    for line in lines:
        l = line.strip()
        if not l or l.startswith('Proofread') or l.startswith('The word ending') or l.startswith('श्रीमहाभारतस्य'):
            continue
        
        # Check Parva change
        if l in ["हरिवंशपर्व", "विष्णुपर्व", "भविष्यपर्व"]:
            current_parva = l
            continue
            
        # Check chapter header like '१.१ प्रथमोऽध्यायः' or '२.१० दशमोऽध्यायः'
        head_m = re.match(r'^([०-९0-9]+)\.([०-९0-9]+)\s+(.+?ऽध्याय[ः|ḥ]?)', l)
        if head_m:
            parva_num = int(head_m.group(1).translate(trans_map))
            adhyaya_num = int(head_m.group(2).translate(trans_map))
            adhyaya_name = head_m.group(3).strip()
            
            cur.execute("SELECT COUNT(*) FROM verses WHERE section_id = ?", (current_section_id,))
            if cur.fetchone()[0] > 0:
                global_chap_num += 1
                current_adhyaya = adhyaya_num
                current_chapter_name = f"{current_parva}, अध्याय {current_adhyaya}: {adhyaya_name}"
                cur.execute("INSERT INTO sections (source_id, chapter_number, chapter_name) VALUES (?, ?, ?)",
                            (source_id, global_chap_num, current_chapter_name))
                current_section_id = cur.lastrowid
                verse_count_in_chap = 0
            else:
                current_adhyaya = adhyaya_num
                current_chapter_name = f"{current_parva}, अध्याय {current_adhyaya}: {adhyaya_name}"
                cur.execute("UPDATE sections SET chapter_name = ? WHERE id = ?", (current_chapter_name, current_section_id))
            continue
            
        # Check colophon at end of adhyaya e.g., 'इति श्रीमहाभारते खिलभागे हरिवंशे हरिवंशपर्वणि आदिसर्गकथने प्रथमोऽध्यायः ॥ १॥'
        col_m = re.search(r'इति\s+श्रीमहाभारते\s+खिलभागे\s+हरिवंशे\s+(?:.+?)\s+([^\n]+?कथने|[^\n]+?वर्णने|[^\n]+?)\s+([^\n]+?ऽध्याय[ः|ḥ]?)\s*॥', l)
        if col_m:
            topic = col_m.group(1).strip()
            detailed_name = f"{current_parva}, अध्याय {current_adhyaya}: {topic}"
            cur.execute("UPDATE sections SET chapter_name = ? WHERE id = ?", (detailed_name, current_section_id))
            continue
            
        # Verse collection
        verse_buffer.append(l)
        if '॥' in l:
            full_verse = " ".join(verse_buffer).strip()
            verse_buffer = []
            
            # Extract verse number
            v_match = re.search(r'॥\s*(?:(\d+)[,\.](\d+)[,\.](\d+)|(\d+)[,\.](\d+)|([०-९0-9]+))\s*॥', l)
            if v_match:
                try:
                    raw_v = v_match.group(3) or v_match.group(5) or v_match.group(6)
                    v_no = int(raw_v.translate(trans_map))
                except:
                    verse_count_in_chap += 1
                    v_no = verse_count_in_chap
            else:
                verse_count_in_chap += 1
                v_no = verse_count_in_chap
                
            cur.execute("INSERT INTO verses (section_id, verse_number, sanskrit_text, transliteration, word_meanings) VALUES (?, ?, ?, '', '')",
                        (current_section_id, v_no, full_verse))
            total_verses += 1
            verse_count_in_chap = max(verse_count_in_chap, v_no)

    # Cleanup empty trailing section
    cur.execute("SELECT COUNT(*) FROM verses WHERE section_id = ?", (current_section_id,))
    if cur.fetchone()[0] == 0:
        cur.execute("DELETE FROM sections WHERE id = ?", (current_section_id,))
        global_chap_num -= 1

    conn.commit()
    print(f"✓ Harivamsha Purana Complete: {global_chap_num} sections, {total_verses:,} verses.")

def rebuild_fts_index(conn):
    print("\n" + "="*60)
    print("REBUILDING FTS5 SEARCH INDEX")
    print("="*60)
    cur = conn.cursor()
    cur.execute("DELETE FROM verses_fts")
    cur.execute("""
        INSERT INTO verses_fts (verse_id, sanskrit_text, transliteration, english_text, source_name, chapter_number, verse_number)
        SELECT 
            v.id,
            v.sanskrit_text,
            COALESCE(v.transliteration, ''),
            COALESCE((SELECT text FROM translations WHERE verse_id = v.id LIMIT 1), ''),
            src.name,
            sec.chapter_number,
            v.verse_number
        FROM verses v
        JOIN sections sec ON v.section_id = sec.id
        JOIN sources src ON sec.source_id = src.id
    """)
    conn.commit()
    print("FTS5 Index Rebuild Complete.")

def main():
    start_time = time.time()
    conn = sqlite3.connect(DB_PATH)
    parse_and_insert_harivamsha(conn)
    rebuild_fts_index(conn)
    conn.close()
    elapsed = time.time() - start_time
    print(f"\nHARIVAMSHA PURANA INGESTED SUCCESSFULLY IN {elapsed:.2f}s!")

if __name__ == "__main__":
    main()
