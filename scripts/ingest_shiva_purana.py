#!/usr/bin/env python3
"""
Ingestion Pipeline for Shiva Mahapurana (श्रीशिवमहापुराणम्) from Sanskrit Documents
Ingests all 12 Samhitas and Khandas:
1. Shiva Purana Mahatmyam
2. Vidyeshvara Samhita
3. Rudra Samhita (Srishti Khanda)
4. Rudra Samhita (Sati Khanda)
5. Rudra Samhita (Parvati Khanda)
6. Rudra Samhita (Kumara Khanda)
7. Rudra Samhita (Yuddha Khanda)
8. Shatarudra Samhita
9. Kotirudra Samhita
10. Uma Samhita
11. Kailasa Samhita
12. Vayaviya Samhita (Purva & Uttara Khandas)
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
            with urllib.request.urlopen(req, timeout=35) as resp:
                html = resp.read().decode('utf-8', errors='ignore')
            soup = BeautifulSoup(html, 'html.parser')
            pre = soup.find('pre')
            text = pre.get_text() if pre else soup.get_text()
            # Polite sleep to respect server rate limits
            time.sleep(2.0)
            return text
        except urllib.error.HTTPError as e:
            print(f"  HTTP Error {e.code} on attempt {attempt+1}: {e}")
            if e.code == 429:
                time.sleep(5 + attempt * 3)
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

def parse_and_insert_shiva_purana(conn):
    print("\n" + "="*60)
    print("INGESTING SHIVA MAHAPURANA (7 SAMHITAS COMPLETE)")
    print("="*60)
    
    source_id = get_or_create_source(conn, "Shiva Purana", "Purana")
    cur = conn.cursor()
    
    cur.execute("DELETE FROM verses WHERE section_id IN (SELECT id FROM sections WHERE source_id = ?)", (source_id,))
    cur.execute("DELETE FROM sections WHERE source_id = ?", (source_id,))
    conn.commit()
    
    files = [
        ("माहात्म्यम्", "https://sanskritdocuments.org/doc_purana/shivapurANamAhAtmyam.html"),
        ("१ विद्येश्वरसंहिता", "https://sanskritdocuments.org/doc_purana/shivapurANam1vidyeshvarasaMhitA.html"),
        ("२ रुद्रसंहिता - १ सृष्टिखण्डः", "https://sanskritdocuments.org/doc_purana/shivapurANam2rudrasaMhitA1sRRiShTikhaNDaH.html"),
        ("२ रुद्रसंहिता - २ सतीखण्डः", "https://sanskritdocuments.org/doc_purana/shivapurANam2rudrasaMhitA2satIkhaNDaH.html"),
        ("२ रुद्रसंहिता - ३ पार्वतीखण्डः", "https://sanskritdocuments.org/doc_purana/shivapurANam2rudrasaMhitA3pArvatIkhaNDaH.html"),
        ("२ रुद्रसंहिता - ४ कुमारखण्डः", "https://sanskritdocuments.org/doc_purana/shivapurANam2rudrasaMhitA4kumArakhaNDaH.html"),
        ("२ रुद्रसंहिता - ५ युद्धखण्डः", "https://sanskritdocuments.org/doc_purana/shivapurANam2rudrasaMhitA5yuddhakhaNDaH.html"),
        ("३ शतरुद्रसंहिता", "https://sanskritdocuments.org/doc_purana/shivapurANam3shatarudrasaMhitA.html"),
        ("४ कोटिरुद्रसंहिता", "https://sanskritdocuments.org/doc_purana/shivapurANam4koTirudrasaMhitA.html"),
        ("५ उमासंहिता", "https://sanskritdocuments.org/doc_purana/shivapurANam5umAsaMhitA.html"),
        ("६ कैलाससंहिता", "https://sanskritdocuments.org/doc_purana/shivapurANam6kailAsasaMhitA.html"),
        ("७ वायवीयसंहिता", "https://sanskritdocuments.org/doc_purana/shivapurANam7vAyavIyasaMhitA.html"),
    ]
    
    global_chap_num = 0
    total_verses = 0
    trans_map = str.maketrans('०१२३४५६७८९', '0123456789')
    
    for samhita_label, url in files:
        text = fetch_html_text(url)
        lines = text.splitlines()
        
        current_adhyaya = 1
        current_chapter_name = f"{samhita_label}, अध्याय १"
        global_chap_num += 1
        
        cur.execute("INSERT INTO sections (source_id, chapter_number, chapter_name) VALUES (?, ?, ?)",
                    (source_id, global_chap_num, current_chapter_name))
        current_section_id = cur.lastrowid
        
        verse_buffer = []
        verse_count_in_chap = 0
        
        for line in lines:
            l = line.strip()
            if not l or l.startswith('Proofread') or l.startswith('Encoded'):
                continue
            
            # Check chapter end colophon e.g., 'इति श्रीशिवमहापुराणे... मुनिप्रश्नवर्णनं नाम प्रथमोऽध्यायः ॥ १.१॥'
            col_match = re.search(r'इति\s+श्रीशिवमहापुराणे\s+(?:.+?)\s+([^\n]+?वर्णनं|[^\n]+?उपाख्याने|[^\n]+?)\s+नाम\s+([^\n]+?ऽध्याय[ः|ḥ]?)\s*॥\s*(?:(\d+)[\.\,](\d+)[\.\,](\d+)|(\d+)[\.\,](\d+)|(\d+))\s*॥', l)
            if col_match:
                topic = col_match.group(1).strip()
                # Update current section name with the rich chapter topic
                detailed_name = f"{samhita_label}, अध्याय {current_adhyaya}: {topic}"
                cur.execute("UPDATE sections SET chapter_name = ? WHERE id = ?", (detailed_name, current_section_id))
                
                # Advance to next chapter
                current_adhyaya += 1
                global_chap_num += 1
                verse_count_in_chap = 0
                current_chapter_name = f"{samhita_label}, अध्याय {current_adhyaya}"
                cur.execute("INSERT INTO sections (source_id, chapter_number, chapter_name) VALUES (?, ?, ?)",
                            (source_id, global_chap_num, current_chapter_name))
                current_section_id = cur.lastrowid
                continue
                
            # Regular verse accumulation
            verse_buffer.append(l)
            if '॥' in l:
                full_verse = " ".join(verse_buffer).strip()
                verse_buffer = []
                
                # Extract verse number if present like '॥ १२॥' or '॥ १॥'
                v_num_match = re.search(r'॥\s*([०-९0-9]+)\s*॥', l)
                if v_num_match:
                    try:
                        v_no = int(v_num_match.group(1).translate(trans_map))
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

        # Cleanup trailing empty section if created after the last colophon
        cur.execute("SELECT COUNT(*) FROM verses WHERE section_id = ?", (current_section_id,))
        if cur.fetchone()[0] == 0:
            cur.execute("DELETE FROM sections WHERE id = ?", (current_section_id,))
            global_chap_num -= 1

        conn.commit()
        print(f"  ✓ {samhita_label} Ingested.")

    print(f"✓ Shiva Mahapurana Complete: {global_chap_num} sections, {total_verses:,} verses.")

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
    parse_and_insert_shiva_purana(conn)
    rebuild_fts_index(conn)
    conn.close()
    elapsed = time.time() - start_time
    print(f"\nALL SHIVA PURANA SAMHITAS INGESTED SUCCESSFULLY IN {elapsed:.2f}s!")

if __name__ == "__main__":
    main()
