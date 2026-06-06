import sqlite3
import json
import csv
import os
import re
from collections import defaultdict
import vedic_cleaner as vc

DB_PATH = os.path.join(os.path.dirname(__file__), '..', 'backend', 'data', 'scriptures.db')
RAW_DATA_DIR = os.path.join(os.path.dirname(__file__), '..', 'raw_data')

def setup_db(cursor):
    cursor.execute('DROP TABLE IF EXISTS commentaries')
    cursor.execute('DROP TABLE IF EXISTS translations')
    cursor.execute('DROP TABLE IF EXISTS verses')
    cursor.execute('DROP TABLE IF EXISTS sections')
    cursor.execute('DROP TABLE IF EXISTS sources')
    
    cursor.execute('''
    CREATE TABLE sources (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE,
        type TEXT
    )
    ''')
    
    cursor.execute('''
    CREATE TABLE sections (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        source_id INTEGER,
        chapter_number INTEGER,
        chapter_name TEXT,
        FOREIGN KEY(source_id) REFERENCES sources(id)
    )
    ''')
    
    cursor.execute('''
    CREATE TABLE verses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        section_id INTEGER,
        verse_number INTEGER,
        sanskrit_text TEXT,
        transliteration TEXT,
        word_meanings TEXT,
        FOREIGN KEY(section_id) REFERENCES sections(id)
    )
    ''')
    
    cursor.execute('''
    CREATE TABLE translations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        verse_id INTEGER,
        language TEXT,
        text TEXT,
        author TEXT,
        FOREIGN KEY(verse_id) REFERENCES verses(id)
    )
    ''')
    
    cursor.execute('''
    CREATE TABLE commentaries (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        verse_id INTEGER,
        language TEXT,
        text TEXT,
        author TEXT,
        FOREIGN KEY(verse_id) REFERENCES verses(id)
    )
    ''')

def ingest_gita(cursor):
    print("Ingesting Bhagavad Gita...")
    cursor.execute('INSERT INTO sources (name, type) VALUES (?, ?)', ('Bhagavad Gita', 'Itihasa/Smriti'))
    source_id = cursor.lastrowid
    
    gita_dir = os.path.join(RAW_DATA_DIR, 'gita')
    
    with open(os.path.join(gita_dir, 'chapters.json'), 'r', encoding='utf-8') as f:
        chapters = json.load(f)
    with open(os.path.join(gita_dir, 'verse.json'), 'r', encoding='utf-8') as f:
        verses = json.load(f)
    with open(os.path.join(gita_dir, 'translation.json'), 'r', encoding='utf-8') as f:
        translations = json.load(f)
    with open(os.path.join(gita_dir, 'commentary.json'), 'r', encoding='utf-8') as f:
        commentaries = json.load(f)

    sections_map = {}
    for ch in chapters:
        ch_num = ch['chapter_number']
        ch_name_en = ch['name_translation']
        ch_name_sa = ch['name']
        cursor.execute('INSERT INTO sections (source_id, chapter_number, chapter_name) VALUES (?, ?, ?)',
                       (source_id, ch_num, f"{ch_name_sa} ({ch_name_en})"))
        sections_map[ch_num] = cursor.lastrowid
        
    trans_by_verse = {}
    for t in translations:
        vid = t['verse_id']
        if vid not in trans_by_verse:
            trans_by_verse[vid] = []
        trans_by_verse[vid].append(t)
        
    comm_by_verse = {}
    for c in commentaries:
        vid = c['verse_id']
        if vid not in comm_by_verse:
            comm_by_verse[vid] = []
        comm_by_verse[vid].append(c)
        
    for v in verses:
        ch_num = v['chapter_number']
        v_num = v['verse_number']
        sanskrit = v['text']
        translit = v['transliteration']
        word_meanings = v['word_meanings']
        
        section_id = sections_map.get(ch_num)
        
        cursor.execute('''
        INSERT INTO verses (section_id, verse_number, sanskrit_text, transliteration, word_meanings)
        VALUES (?, ?, ?, ?, ?)
        ''', (section_id, v_num, sanskrit, translit, word_meanings))
        v_db_id = cursor.lastrowid
        
        for t in trans_by_verse.get(v['id'], []):
            lang = 'english' if t['lang'] == 'english' else 'hindi' if t['lang'] == 'hindi' else 'sanskrit'
            author = t['authorName']
            text = t['description']
            cursor.execute('INSERT INTO translations (verse_id, language, text, author) VALUES (?, ?, ?, ?)',
                           (v_db_id, lang, text, author))
                           
        for c in comm_by_verse.get(v['id'], []):
            lang = 'english' if c['lang'] == 'english' else 'hindi' if c['lang'] == 'hindi' else 'sanskrit'
            author = c['authorName']
            text = c['description']
            cursor.execute('INSERT INTO commentaries (verse_id, language, text, author) VALUES (?, ?, ?, ?)',
                           (v_db_id, lang, text, author))

def ingest_rigveda(cursor):
    print("Ingesting Rigveda...")
    cursor.execute('INSERT INTO sources (name, type) VALUES (?, ?)', ('Rigveda', 'Shruti'))
    source_id = cursor.lastrowid
    
    rv_dir = os.path.join(RAW_DATA_DIR, 'rigveda')
    
    sanskrit_data = {}
    with open(os.path.join(rv_dir, 'eichler.csv'), 'r', encoding='utf-8') as f:
        reader = csv.reader(f, delimiter='\t')
        for row in reader:
            if len(row) >= 3:
                m_id = row[0]
                text = row[2]
                if m_id not in sanskrit_data:
                    sanskrit_data[m_id] = []
                sanskrit_data[m_id].append(text)
                
    english_data = {}
    with open(os.path.join(rv_dir, 'griffith.csv'), 'r', encoding='utf-8') as f:
        reader = csv.reader(f, delimiter='\t')
        for row in reader:
            if len(row) >= 2:
                m_id = row[0]
                text = row[1]
                if m_id not in english_data:
                    english_data[m_id] = []
                english_data[m_id].append(text)
                
    sections_map = {}
    all_mantra_ids = set(list(sanskrit_data.keys()) + list(english_data.keys()))
    
    for m_id in sorted(list(all_mantra_ids)):
        parts = m_id.split('.')
        if len(parts) == 3:
            try:
                mandala = int(parts[0])
                hymn = int(parts[1])
                mantra = int(parts[2])
            except ValueError:
                continue
            
            section_key = f"{mandala}.{hymn}"
            if section_key not in sections_map:
                cursor.execute('INSERT INTO sections (source_id, chapter_number, chapter_name) VALUES (?, ?, ?)',
                               (source_id, int(f"{mandala}{hymn:03d}"), f"Mandala {mandala}, Hymn {hymn}"))
                sections_map[section_key] = cursor.lastrowid
                
            section_id = sections_map[section_key]
            
            s_padas = sanskrit_data.get(m_id, [])
            s_text = " ".join(s_padas)
            
            e_padas = english_data.get(m_id, [])
            e_text = " ".join(e_padas)
            
            cursor.execute('''
            INSERT INTO verses (section_id, verse_number, sanskrit_text, transliteration, word_meanings)
            VALUES (?, ?, ?, ?, ?)
            ''', (section_id, mantra, s_text, "", ""))
            
            v_db_id = cursor.lastrowid
            
            if e_text:
                cursor.execute('INSERT INTO translations (verse_id, language, text, author) VALUES (?, ?, ?, ?)',
                               (v_db_id, "english", e_text, "Ralph T.H. Griffith"))

def ingest_mahabharata(cursor):
    print("Ingesting Mahabharata...")
    cursor.execute('INSERT INTO sources (name, type) VALUES (?, ?)', ('Mahabharata', 'Itihasa/Smriti'))
    source_id = cursor.lastrowid
    
    mbh_dir = os.path.join(RAW_DATA_DIR, 'mahabharata')
    
    line_pat = re.compile(r'^(\d{2})(\d{3})(\d{3})([a-z\d])\s+(.*)$')
    
    PARVA_NAMES = {
        1: "Adi Parva", 2: "Sabha Parva", 3: "Vana Parva", 4: "Virata Parva",
        5: "Udyoga Parva", 6: "Bhishma Parva", 7: "Drona Parva", 8: "Karna Parva",
        9: "Shalya Parva", 10: "Sauptika Parva", 11: "Stri Parva", 12: "Shanti Parva",
        13: "Anushasana Parva", 14: "Ashvamedhika Parva", 15: "Ashramavasika Parva",
        16: "Mausala Parva", 17: "Mahaprasthanika Parva", 18: "Svargarohana Parva"
    }
    
    sections_map = {}
    verse_groups = {}
    
    for parva in range(1, 19):
        filename = f"MBh{parva:02d}.txt"
        filepath = os.path.join(mbh_dir, filename)
        if not os.path.exists(filepath):
            print(f"Warning: Mahabharata file {filename} not found.")
            continue
            
        with open(filepath, 'r', encoding='utf-8') as f:
            for line in f:
                line = line.strip()
                if not line or line.startswith('%'):
                    continue
                match = line_pat.match(line)
                if match:
                    p_num = int(match.group(1))
                    a_num = int(match.group(2))
                    s_num = int(match.group(3))
                    suffix = match.group(4)
                    text = match.group(5).strip()
                    
                    key = (p_num, a_num, s_num)
                    if key not in verse_groups:
                        verse_groups[key] = []
                    verse_groups[key].append((suffix, text))
                    
    # Insert grouped verses sequentially
    for key in sorted(verse_groups.keys()):
        p_num, a_num, s_num = key
        lines_list = verse_groups[key]
        lines_list.sort(key=lambda x: x[0])
        sanskrit_text = "\n".join([item[1] for item in lines_list])
        
        section_key = (p_num, a_num)
        if section_key not in sections_map:
            chapter_number = (p_num * 1000) + a_num
            parva_name = PARVA_NAMES.get(p_num, f"Parva {p_num}")
            chapter_name = f"{parva_name}, Adhyaya {a_num}"
            cursor.execute('INSERT INTO sections (source_id, chapter_number, chapter_name) VALUES (?, ?, ?)',
                           (source_id, chapter_number, chapter_name))
            sections_map[section_key] = cursor.lastrowid
            
        section_id = sections_map[section_key]
        
        cursor.execute('''
        INSERT INTO verses (section_id, verse_number, sanskrit_text, transliteration, word_meanings)
        VALUES (?, ?, ?, ?, ?)
        ''', (section_id, s_num, sanskrit_text, "", ""))

def ingest_ramayana(cursor):
    print("Ingesting Valmiki Ramayana...")
    cursor.execute('INSERT INTO sources (name, type) VALUES (?, ?)', ('Valmiki Ramayana', 'Itihasa/Smriti'))
    source_id = cursor.lastrowid
    
    ram_dir = os.path.join(RAW_DATA_DIR, 'ramayana')
    
    line_pat = re.compile(r'^(\d{1})(\d{3})(\d{3})([a-z\d])\s+(.*)$')
    
    KANDA_NAMES = {
        1: "Balakanda", 2: "Ayodhyakanda", 3: "Aranyakanda", 4: "Kishkindhakanda",
        5: "Sundarakanda", 6: "Yuddhakanda", 7: "Uttarakanda"
    }
    
    sections_map = {}
    verse_groups = {}
    
    for kanda in range(1, 8):
        filename = f"Ram{kanda:02d}.txt"
        filepath = os.path.join(ram_dir, filename)
        if not os.path.exists(filepath):
            print(f"Warning: Ramayana file {filename} not found.")
            continue
            
        with open(filepath, 'r', encoding='utf-8') as f:
            for line in f:
                line = line.strip()
                if not line or line.startswith('%'):
                    continue
                match = line_pat.match(line)
                if match:
                    k_num = int(match.group(1))
                    s_num = int(match.group(2))
                    v_num = int(match.group(3))
                    suffix = match.group(4)
                    text = match.group(5).strip()
                    
                    key = (k_num, s_num, v_num)
                    if key not in verse_groups:
                        verse_groups[key] = []
                    verse_groups[key].append((suffix, text))
                    
    for key in sorted(verse_groups.keys()):
        k_num, s_num, v_num = key
        lines_list = verse_groups[key]
        lines_list.sort(key=lambda x: x[0])
        sanskrit_text = "\n".join([item[1] for item in lines_list])
        
        section_key = (k_num, s_num)
        if section_key not in sections_map:
            chapter_number = (k_num * 1000) + s_num
            kanda_name = KANDA_NAMES.get(k_num, f"Kanda {k_num}")
            chapter_name = f"{kanda_name}, Sarga {s_num}"
            cursor.execute('INSERT INTO sections (source_id, chapter_number, chapter_name) VALUES (?, ?, ?)',
                           (source_id, chapter_number, chapter_name))
            sections_map[section_key] = cursor.lastrowid
            
        section_id = sections_map[section_key]
        
        cursor.execute('''
        INSERT INTO verses (section_id, verse_number, sanskrit_text, transliteration, word_meanings)
        VALUES (?, ?, ?, ?, ?)
        ''', (section_id, v_num, sanskrit_text, "", ""))

def ingest_atharvaveda(cursor):
    print("Ingesting Atharva Veda...")
    cursor.execute('INSERT INTO sources (name, type) VALUES (?, ?)', ('Atharva Veda', 'Shruti'))
    source_id = cursor.lastrowid
    
    av_dir = os.path.join(RAW_DATA_DIR, 'DharmicData', 'AtharvaVeda')
    
    split_pat = re.compile(r'([॥।|]{1,2}\s*[०-९\d]+\s*[॥।|]{1,2})')
    
    DEV_DIGITS = {'०': '0', '१': '1', '२': '2', '३': '3', '४': '4', '५': '5', '६': '6', '७': '7', '८': '8', '९': '9'}
    def devanagari_to_int(s):
        normal_chars = []
        for c in s:
            if c in DEV_DIGITS:
                normal_chars.append(DEV_DIGITS[c])
            elif c.isdigit():
                normal_chars.append(c)
        return int("".join(normal_chars)) if normal_chars else 0
        
    for kanda_num in range(1, 21):
        filename = f"atharvaveda_kaanda_{kanda_num}.json"
        filepath = os.path.join(av_dir, filename)
        if not os.path.exists(filepath):
            print(f"Warning: Atharva Veda file {filename} not found.")
            continue
            
        with open(filepath, 'r', encoding='utf-8') as f:
            data = json.load(f)
            
        for item in data:
            kaanda = item.get('kaanda', kanda_num)
            sukta = item.get('sukta')
            text = item.get('text', '').strip()
            if not text or sukta is None:
                continue
                
            chapter_number = (kaanda * 1000) + sukta
            chapter_name = f"Kaanda {kaanda}, Sukta {sukta}"
            
            cursor.execute('INSERT INTO sections (source_id, chapter_number, chapter_name) VALUES (?, ?, ?)',
                           (source_id, chapter_number, chapter_name))
            section_id = cursor.lastrowid
            
            parts = split_pat.split(text)
            
            verse_idx = 1
            for i in range(0, len(parts), 2):
                content = parts[i].strip()
                if not content:
                    continue
                    
                lines = content.split('\n')
                content_lines = [line for line in lines if not vc.looks_like_metadata_line(line)]
                if content_lines:
                    content = '\n'.join(content_lines)
                    
                v_num = verse_idx
                if i + 1 < len(parts):
                    marker = parts[i+1]
                    parsed_num = devanagari_to_int(marker)
                    if parsed_num > 0:
                        v_num = parsed_num
                        verse_idx = parsed_num
                
                cursor.execute('''
                INSERT INTO verses (section_id, verse_number, sanskrit_text, transliteration, word_meanings)
                VALUES (?, ?, ?, ?, ?)
                ''', (section_id, v_num, content, "", ""))
                verse_idx += 1

def ingest_yajurveda(cursor):
    print("Ingesting Yajur Veda...")
    cursor.execute('INSERT INTO sources (name, type) VALUES (?, ?)', ('Yajur Veda', 'Shruti'))
    source_id = cursor.lastrowid
    
    yv_dir = os.path.join(RAW_DATA_DIR, 'DharmicData', 'Yajurveda')
    
    split_pat = re.compile(r'([॥।|]{1,2}\s*[०-९\d]+\s*[॥।|]{1,2})')
    
    DEV_DIGITS = {'०': '0', '१': '1', '२': '2', '३': '3', '४': '4', '५': '5', '६': '6', '७': '7', '८': '8', '९': '9'}
    def devanagari_to_int(s):
        normal_chars = []
        for c in s:
            if c in DEV_DIGITS:
                normal_chars.append(DEV_DIGITS[c])
            elif c.isdigit():
                normal_chars.append(c)
        return int("".join(normal_chars)) if normal_chars else 0
        
    filepath = os.path.join(yv_dir, "vajasneyi_madhyadina_samhita.json")
    if not os.path.exists(filepath):
        print(f"Warning: Yajur Veda file vajasneyi_madhyadina_samhita.json not found.")
        return
        
    with open(filepath, 'r', encoding='utf-8') as f:
        data = json.load(f)
        
    for item in data:
        adhyaya = item.get('adhyaya')
        text = item.get('text', '').strip()
        if not text or adhyaya is None:
            continue
            
        chapter_number = adhyaya
        chapter_name = f"Adhyaya {adhyaya}"
        
        cursor.execute('INSERT INTO sections (source_id, chapter_number, chapter_name) VALUES (?, ?, ?)',
                       (source_id, chapter_number, chapter_name))
        section_id = cursor.lastrowid
        
        parts = split_pat.split(text)
        
        verse_idx = 1
        for i in range(0, len(parts), 2):
            content = parts[i].strip()
            if not content:
                continue
                
            lines = content.split('\n')
            content_lines = [line for line in lines if not vc.looks_like_metadata_line(line)]
            if content_lines:
                content = '\n'.join(content_lines)
                
            v_num = verse_idx
            if i + 1 < len(parts):
                marker = parts[i+1]
                parsed_num = devanagari_to_int(marker)
                if parsed_num > 0:
                    v_num = parsed_num
                    verse_idx = parsed_num
            
            cursor.execute('''
            INSERT INTO verses (section_id, verse_number, sanskrit_text, transliteration, word_meanings)
            VALUES (?, ?, ?, ?, ?)
            ''', (section_id, v_num, content, "", ""))
            verse_idx += 1

def main():
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    setup_db(cursor)
    ingest_gita(cursor)
    ingest_rigveda(cursor)
    ingest_mahabharata(cursor)
    ingest_ramayana(cursor)
    ingest_atharvaveda(cursor)
    ingest_yajurveda(cursor)
    
    conn.commit()
    conn.close()
    print("Ingestion complete. Database created at:", DB_PATH)

if __name__ == '__main__':
    main()
