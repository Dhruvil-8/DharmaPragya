#!/usr/bin/env python3
"""
Comprehensive Ingestion Pipeline for Puranas from Sanskrit Documents
Ingests:
1. Garuda Purana (264 Adhyayas)
2. Devi Bhagavata Mahapurana (12 Skandhas, 318 Adhyayas)
3. Brahma Purana (245 Adhyayas)
4. Shrimad Bhagavata Purana (Mahatmyam + 12 Skandhas, 341 Adhyayas)
Into scriptures.db with FTS5 search indexing.
"""

import urllib.request
from bs4 import BeautifulSoup
import re
import sqlite3
import os
import sys
import time

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
    for attempt in range(3):
        try:
            with urllib.request.urlopen(req, timeout=35) as resp:
                html = resp.read().decode('utf-8', errors='ignore')
            soup = BeautifulSoup(html, 'html.parser')
            pre = soup.find('pre')
            text = pre.get_text() if pre else soup.get_text()
            return text
        except Exception as e:
            print(f"  Attempt {attempt+1} failed: {e}")
            time.sleep(2)
    raise RuntimeError(f"Failed to fetch {url}")

def get_or_create_source(conn, name, src_type="Purana"):
    cur = conn.cursor()
    cur.execute("SELECT id FROM sources WHERE name = ?", (name,))
    row = cur.fetchone()
    if row:
        return row[0]
    cur.execute("INSERT INTO sources (name, type) VALUES (?, ?)", (name, src_type))
    conn.commit()
    return cur.lastrowid

# ==========================================
# 1. GARUDA PURANA PARSER
# ==========================================
def parse_and_insert_garuda_purana(conn):
    print("\n" + "="*50)
    print("INGESTING GARUDA PURANA")
    print("="*50)
    
    url = "https://sanskritdocuments.org/doc_purana/garuDapurANa.html"
    text = fetch_html_text(url)
    lines = text.splitlines()
    
    source_id = get_or_create_source(conn, "Garuda Purana", "Purana")
    cur = conn.cursor()
    
    # Delete previous entries if any
    cur.execute("DELETE FROM verses WHERE section_id IN (SELECT id FROM sections WHERE source_id = ?)", (source_id,))
    cur.execute("DELETE FROM sections WHERE source_id = ?", (source_id,))
    conn.commit()
    
    current_khanda = "पूर्वखण्डः (आचारकाण्डः)"
    current_adhyaya = 1
    current_chapter_name = f"{current_khanda}, अध्याय १"
    current_section_id = None
    
    cur.execute("INSERT INTO sections (source_id, chapter_number, chapter_name) VALUES (?, ?, ?)", 
                (source_id, current_adhyaya, current_chapter_name))
    current_section_id = cur.lastrowid
    
    verse_buffer = []
    verse_count_in_chap = 0
    total_verses = 0
    global_chap_num = 1

    for line in lines:
        l = line.strip()
        if not l:
            continue
        
        # Check colophons for Khanda / Adhyaya changes
        # e.g., 'इति श्रीगारुडे महापुराणे पूर्वखण्डे... द्वितीयाध्याये...' or 'उत्तरखण्डः' or 'धर्मकाण्डः'
        if 'उत्तरखण्ड' in l or 'प्रेतकल्प' in l or 'धर्मकाण्ड' in l:
            if 'उत्तर' in l:
                current_khanda = "उत्तरखण्डः (धर्मकाण्डः / प्रेतकल्पः)"
        
        # Check verse tag ending like '॥ १,२.१४॥' or '॥ १.१४॥' or '॥ १४॥'
        v_match = re.search(r'॥\s*(?:(\d+)[,\.](\d+)[,\.](\d+)|(\d+)[,\.](\d+)|(\d+))\s*॥', l)
        
        verse_buffer.append(l)
        
        if v_match:
            # We found a complete verse
            full_verse = " ".join(verse_buffer).strip()
            verse_buffer = []
            
            # Determine verse number
            v_num = v_match.group(3) or v_match.group(5) or v_match.group(6)
            try:
                v_no = int(v_num)
            except:
                verse_count_in_chap += 1
                v_no = verse_count_in_chap
                
            cur.execute("INSERT INTO verses (section_id, verse_number, sanskrit_text, transliteration, word_meanings) VALUES (?, ?, ?, '', '')",
                        (current_section_id, v_no, full_verse))
            total_verses += 1
            verse_count_in_chap = max(verse_count_in_chap, v_no)
            
        # Check colophon marking end of adhyaya
        if 'इति श्रीगारुडे' in l or 'इति गारुडे' in l:
            # Advance chapter
            global_chap_num += 1
            current_adhyaya += 1
            verse_count_in_chap = 0
            current_chapter_name = f"{current_khanda}, अध्याय {current_adhyaya}"
            cur.execute("INSERT INTO sections (source_id, chapter_number, chapter_name) VALUES (?, ?, ?)", 
                        (source_id, global_chap_num, current_chapter_name))
            current_section_id = cur.lastrowid

    conn.commit()
    print(f"✓ Garuda Purana Ingested: {global_chap_num} sections, {total_verses:,} verses.")

# ==========================================
# 2. DEVI BHAGAVATA MAHAPURANA PARSER
# ==========================================
def parse_and_insert_devi_bhagavata(conn):
    print("\n" + "="*50)
    print("INGESTING DEVI BHAGAVATA MAHAPURANA (12 SKANDHAS)")
    print("="*50)
    
    source_id = get_or_create_source(conn, "Devi Bhagavata Purana", "Purana")
    cur = conn.cursor()
    
    cur.execute("DELETE FROM verses WHERE section_id IN (SELECT id FROM sections WHERE source_id = ?)", (source_id,))
    cur.execute("DELETE FROM sections WHERE source_id = ?", (source_id,))
    conn.commit()
    
    skandha_urls = [
        (1, "https://sanskritdocuments.org/doc_purana/devIbhAgavatam01.html"),
        (2, "https://sanskritdocuments.org/doc_purana/devIbhAgavatam02.html"),
        (3, "https://sanskritdocuments.org/doc_purana/devIbhAgavatam03.html"),
        (4, "https://sanskritdocuments.org/doc_purana/devIbhAgavatam04.html"),
        (5, "https://sanskritdocuments.org/doc_purana/devIbhAgavatam05.html"),
        (6, "https://sanskritdocuments.org/doc_purana/devIbhAgavatam06.html"),
        (7, "https://sanskritdocuments.org/doc_purana/devIbhAgavatam07.html"),
        (8, "https://sanskritdocuments.org/doc_purana/devIbhAgavatam08.html"),
        (9, "https://sanskritdocuments.org/doc_purana/devIbhAgavatam09.html"),
        (10, "https://sanskritdocuments.org/doc_purana/devIbhAgavatam10.html"),
        (11, "https://sanskritdocuments.org/doc_purana/devIbhAgavatam11.html"),
        (12, "https://sanskritdocuments.org/doc_purana/devIbhAgavatam12.html"),
    ]
    
    global_chap_num = 0
    total_verses = 0
    
    for skandha_no, url in skandha_urls:
        text = fetch_html_text(url)
        lines = text.splitlines()
        
        current_adhyaya = 1
        current_chapter_name = f"स्कन्ध {skandha_no}, अध्याय १"
        global_chap_num += 1
        
        cur.execute("INSERT INTO sections (source_id, chapter_number, chapter_name) VALUES (?, ?, ?)",
                    (source_id, global_chap_num, current_chapter_name))
        current_section_id = cur.lastrowid
        
        verse_buffer = []
        verse_count_in_chap = 0
        
        for line in lines:
            l = line.strip()
            if not l or l.startswith('Encoded') or l.startswith('Proofread'):
                continue
            
            # Check chapter end colophon e.g., 'प्रथमस्कन्धे शौनकप्रश्नः नाम प्रथमोऽध्यायः ॥ १.१॥'
            col_match = re.search(r'स्कन्धे\s+(.+?)\s+नाम\s+(.+?ऽध्याय[ः|ḥ]?)\s*॥\s*(\d+)[\.\,](\d+)\s*॥', l)
            if col_match:
                topic = col_match.group(1).strip()
                chap_title = col_match.group(2).strip()
                # Update current section name with the descriptive title
                detailed_name = f"स्कन्ध {skandha_no}, अध्याय {current_adhyaya}: {topic}"
                cur.execute("UPDATE sections SET chapter_name = ? WHERE id = ?", (detailed_name, current_section_id))
                
                # Start new section
                current_adhyaya += 1
                global_chap_num += 1
                verse_count_in_chap = 0
                current_chapter_name = f"स्कन्ध {skandha_no}, अध्याय {current_adhyaya}"
                cur.execute("INSERT INTO sections (source_id, chapter_number, chapter_name) VALUES (?, ?, ?)",
                            (source_id, global_chap_num, current_chapter_name))
                current_section_id = cur.lastrowid
                continue
            
            # Normal verse accumulation
            verse_buffer.append(l)
            if '॥' in l:
                full_verse = " ".join(verse_buffer).strip()
                verse_buffer = []
                
                # Extract verse number if present like '॥ १२॥'
                v_num_match = re.search(r'॥\s*([०-९0-9]+)\s*॥', l)
                if v_num_match:
                    try:
                        raw_v = v_num_match.group(1)
                        # Convert devanagari numerals if any
                        trans_map = str.maketrans('०१२३४५६७८९', '0123456789')
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

        # Cleanup trailing empty section if created after the last colophon
        cur.execute("SELECT COUNT(*) FROM verses WHERE section_id = ?", (current_section_id,))
        if cur.fetchone()[0] == 0:
            cur.execute("DELETE FROM sections WHERE id = ?", (current_section_id,))
            global_chap_num -= 1
            
        conn.commit()
        print(f"  ✓ Skandha {skandha_no} Ingested.")

    print(f"✓ Devi Bhagavata Purana Complete: {global_chap_num} sections, {total_verses:,} verses.")

# ==========================================
# 3. BRAHMA PURANA PARSER
# ==========================================
def parse_and_insert_brahma_purana(conn):
    print("\n" + "="*50)
    print("INGESTING BRAHMA PURANA (245 ADHYAYAS)")
    print("="*50)
    
    url = "https://sanskritdocuments.org/doc_purana/brahmapur.html"
    text = fetch_html_text(url)
    lines = text.splitlines()
    
    source_id = get_or_create_source(conn, "Brahma Purana", "Purana")
    cur = conn.cursor()
    
    cur.execute("DELETE FROM verses WHERE section_id IN (SELECT id FROM sections WHERE source_id = ?)", (source_id,))
    cur.execute("DELETE FROM sections WHERE source_id = ?", (source_id,))
    conn.commit()
    
    # Lines have format: '१.१/१यस्मात् सर्वमिदं...' or '२४५.१२/१...'
    current_adhyaya = 0
    current_section_id = None
    verse_padas = {} # (chap, verse) -> [pada1, pada2, ...]
    
    trans_map = str.maketrans('०१२३४५६७८९', '0123456789')
    
    for line in lines:
        l = line.strip()
        m = re.match(r'^([०-९0-9]+)\.([०-९0-9]+)/([०-९0-9]+)(.*)', l)
        if m:
            chap = int(m.group(1).translate(trans_map))
            v_no = int(m.group(2).translate(trans_map))
            p_no = int(m.group(3).translate(trans_map))
            p_text = m.group(4).strip()
            
            key = (chap, v_no)
            if key not in verse_padas:
                verse_padas[key] = []
            verse_padas[key].append(p_text)

    # Insert structured chapters and verses
    all_chaps = sorted(list(set(k[0] for k in verse_padas.keys())))
    total_verses = 0
    
    for chap_no in all_chaps:
        chap_name = f"अध्याय {chap_no}"
        cur.execute("INSERT INTO sections (source_id, chapter_number, chapter_name) VALUES (?, ?, ?)",
                    (source_id, chap_no, chap_name))
        sec_id = cur.lastrowid
        
        chap_verses = [k for k in verse_padas.keys() if k[0] == chap_no]
        chap_verses.sort(key=lambda x: x[1])
        
        for _, v_no in chap_verses:
            padas = verse_padas[(chap_no, v_no)]
            full_verse = " ".join(padas).strip()
            cur.execute("INSERT INTO verses (section_id, verse_number, sanskrit_text, transliteration, word_meanings) VALUES (?, ?, ?, '', '')",
                        (sec_id, v_no, full_verse))
            total_verses += 1

    conn.commit()
    print(f"✓ Brahma Purana Ingested: {len(all_chaps)} sections, {total_verses:,} verses.")

# ==========================================
# 4. SHRIMAD BHAGAVATA PURANA PARSER
# ==========================================
def parse_and_insert_bhagavata_purana(conn):
    print("\n" + "="*50)
    print("INGESTING SHRIMAD BHAGAVATA PURANA (MAHATMYAM + 12 SKANDHAS)")
    print("="*50)
    
    source_id = get_or_create_source(conn, "Bhagavata Purana", "Purana")
    cur = conn.cursor()
    
    cur.execute("DELETE FROM verses WHERE section_id IN (SELECT id FROM sections WHERE source_id = ?)", (source_id,))
    cur.execute("DELETE FROM sections WHERE source_id = ?", (source_id,))
    conn.commit()
    
    files = [
        ("माहात्म्यम्", "https://sanskritdocuments.org/doc_purana/bhagpur-00-mahatmyam.html"),
        ("स्कन्ध १", "https://sanskritdocuments.org/doc_purana/bhagpur-01.html"),
        ("स्कन्ध २", "https://sanskritdocuments.org/doc_purana/bhagpur-02.html"),
        ("स्कन्ध ३", "https://sanskritdocuments.org/doc_purana/bhagpur-03.html"),
        ("स्कन्ध ४", "https://sanskritdocuments.org/doc_purana/bhagpur-04.html"),
        ("स्कन्ध ५", "https://sanskritdocuments.org/doc_purana/bhagpur-05.html"),
        ("स्कन्ध ६", "https://sanskritdocuments.org/doc_purana/bhagpur-06.html"),
        ("स्कन्ध ७", "https://sanskritdocuments.org/doc_purana/bhagpur-07.html"),
        ("स्कन्ध ८", "https://sanskritdocuments.org/doc_purana/bhagpur-08.html"),
        ("स्कन्ध ९", "https://sanskritdocuments.org/doc_purana/bhagpur-09.html"),
        ("स्कन्ध १० पूर्वार्धम्", "https://sanskritdocuments.org/doc_purana/bhagpur-10a.html"),
        ("स्कन्ध १० उत्तरार्धम्", "https://sanskritdocuments.org/doc_purana/bhagpur-10b.html"),
        ("स्कन्ध ११", "https://sanskritdocuments.org/doc_purana/bhagpur-11.html"),
        ("स्कन्ध १२", "https://sanskritdocuments.org/doc_purana/bhagpur-12.html"),
    ]
    
    global_chap_num = 0
    total_verses = 0
    trans_map = str.maketrans('०१२३४५६७८९', '0123456789')
    
    for skandha_label, url in files:
        text = fetch_html_text(url)
        lines = text.splitlines()
        
        current_adhyaya = 1
        current_chapter_name = f"{skandha_label}, अध्याय १"
        global_chap_num += 1
        
        cur.execute("INSERT INTO sections (source_id, chapter_number, chapter_name) VALUES (?, ?, ?)",
                    (source_id, global_chap_num, current_chapter_name))
        current_section_id = cur.lastrowid
        
        verse_buffer = []
        verse_count_in_chap = 0
        
        for line in lines:
            l = line.strip()
            if not l or l.startswith('Proofread') or l.startswith('GRETIL'):
                continue
            
            # Check chapter start headers like '॥ प्रथमोऽध्यायः - १ ॥' or '॥ पञ्चाशत्तमोऽध्यायः - ५० ॥'
            chap_m = re.search(r'॥\s*(.+?ऽध्याय[ः|ḥ]?)\s*-\s*([०-९0-9]+)\s*॥', l)
            if chap_m:
                chap_no = int(chap_m.group(2).translate(trans_map))
                current_adhyaya = chap_no
                
                # If current section has verses, start next section
                cur.execute("SELECT COUNT(*) FROM verses WHERE section_id = ?", (current_section_id,))
                if cur.fetchone()[0] > 0:
                    global_chap_num += 1
                    current_chapter_name = f"{skandha_label}, अध्याय {current_adhyaya}"
                    cur.execute("INSERT INTO sections (source_id, chapter_number, chapter_name) VALUES (?, ?, ?)",
                                (source_id, global_chap_num, current_chapter_name))
                    current_section_id = cur.lastrowid
                    verse_count_in_chap = 0
                else:
                    # Update initial section name
                    current_chapter_name = f"{skandha_label}, अध्याय {current_adhyaya}"
                    cur.execute("UPDATE sections SET chapter_name = ? WHERE id = ?", (current_chapter_name, current_section_id))
                continue
                
            # Regular verse collection
            verse_buffer.append(l)
            if '॥' in l:
                full_verse = " ".join(verse_buffer).strip()
                verse_buffer = []
                
                # Extract verse number like '॥ १२॥' or '॥ १॥'
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

        conn.commit()
        print(f"  ✓ {skandha_label} Ingested.")

    print(f"✓ Shrimad Bhagavata Purana Complete: {global_chap_num} sections, {total_verses:,} verses.")

# ==========================================
# 5. REBUILD FTS5 SEARCH INDEX
# ==========================================
def rebuild_fts_index(conn):
    print("\n" + "="*50)
    print("REBUILDING FTS5 SEARCH INDEX")
    print("="*50)
    cur = conn.cursor()
    cur.execute("DELETE FROM verses_fts")
    cur.execute("""
        INSERT INTO verses_fts (rowid, sanskrit_text, transliteration, word_meanings)
        SELECT id, sanskrit_text, transliteration, word_meanings FROM verses
    """)
    conn.commit()
    print("✓ FTS5 Index Successfully Rebuilt.")

def main():
    start_time = time.time()
    conn = sqlite3.connect(DB_PATH)
    
    parse_and_insert_garuda_purana(conn)
    parse_and_insert_devi_bhagavata(conn)
    parse_and_insert_brahma_purana(conn)
    parse_and_insert_bhagavata_purana(conn)
    
    rebuild_fts_index(conn)
    conn.close()
    
    elapsed = time.time() - start_time
    print(f"\n🎉 ALL 4 PURANAS INGESTED SUCCESSFULLY IN {elapsed:.2f}s!")

if __name__ == "__main__":
    main()
