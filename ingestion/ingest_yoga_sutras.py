import sqlite3
import re
from bs4 import BeautifulSoup
import json
import uuid

DB_PATH = "backend/data/scriptures.db"

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def parse_sanskrit_html():
    print("Parsing Sanskrit HTML...")
    with open("scratch/yogasuutra.html", "r", encoding="utf-8", errors="ignore") as f:
        html = f.read()
    soup = BeautifulSoup(html, 'html.parser')
    text = soup.get_text()

    chapters_data = []
    for i in range(1, 5):
        chapters_data.append({
            "chapter_number": i,
            "verses": {}
        })

    matches = re.finditer(r'(?:॥.*?॥)?(.*?)\s*॥\s*(\d+)\.(\d+)\s*॥', text.replace('\n', ' '))
    for m in matches:
        sanskrit = m.group(1).strip()
        sanskrit = re.sub(r'.*॥\s*', '', sanskrit).strip()
        sanskrit = re.sub(r'[॒॑]', '', sanskrit)

        ch = int(m.group(2))
        v = int(m.group(3))

        if 1 <= ch <= 4:
            chapters_data[ch-1]["verses"][v] = sanskrit

    chapter_names = ["Samadhi Pada", "Sadhana Pada", "Vibhuti Pada", "Kaivalya Pada"]
    for i in range(4):
        chapters_data[i]["chapter_name"] = chapter_names[i]
        
    return chapters_data

def parse_english_properly():
    print("Parsing English TXT...")
    with open("scratch/patan10.txt", "r", encoding="utf-8", errors="ignore") as f:
        content = f.read()

    matches = re.finditer(r'(?m)^\s*(\d+)\.?\s+(.*?)(?=\n\s*\n)', content, re.DOTALL)
    
    current_ch = 1
    verses = {}
    chapters_data = []
    
    count = 0
    for m in matches:
        v_num = int(m.group(1))
        text = m.group(2).replace('\n', ' ').strip()
        text = re.sub(r'\s+', ' ', text)
        
        if v_num == 1 and count > 0:
            chapters_data.append(verses)
            current_ch += 1
            verses = {}
            
        verses[v_num] = text
        count += 1
        
    if len(verses) > 0:
        chapters_data.append(verses)
        
    return chapters_data

def insert_into_db(sanskrit_data, english_data):
    conn = get_db()
    cursor = conn.cursor()
    
    print("Inserting into database...")
    
    cursor.execute("""
        INSERT INTO sources (name, type)
        VALUES (?, ?)
    """, ("Patanjali Yoga Sutras", "Sutra"))
    source_id = cursor.lastrowid
    
    for i in range(4):
        ch_sanskrit = sanskrit_data[i]
        ch_english = english_data[i] if i < len(english_data) else {}
        
        ch_num = ch_sanskrit["chapter_number"]
        ch_name = ch_sanskrit["chapter_name"]
        cursor.execute("""
            INSERT INTO sections (source_id, chapter_number, chapter_name)
            VALUES (?, ?, ?)
        """, (source_id, ch_num, ch_name))
        section_id = cursor.lastrowid
        
        verses = ch_sanskrit["verses"]
        for v_num in sorted(verses.keys()):
            san = verses[v_num]
            eng = ch_english.get(v_num, "")
            
            cursor.execute("""
                INSERT INTO verses (section_id, verse_number, sanskrit_text)
                VALUES (?, ?, ?)
            """, (section_id, v_num, san))
            verse_id = cursor.lastrowid
            
            if eng:
                cursor.execute("""
                    INSERT INTO translations (verse_id, language, text, author)
                    VALUES (?, ?, ?, ?)
                """, (verse_id, "english", eng, "Charles Johnston"))
                
    conn.commit()
    conn.close()
    print("Done!")

if __name__ == "__main__":
    san_data = parse_sanskrit_html()
    for i, ch in enumerate(san_data):
        print(f"Chapter {i+1} has {len(ch['verses'])} verses")
        
    eng_data = parse_english_properly()
    for i, ch in enumerate(eng_data):
        print(f"Eng Chapter {i+1} has {len(ch)} verses")
        
    if len(san_data) == 4 and len(eng_data) >= 4:
        insert_into_db(san_data, eng_data)
    else:
        print("Mismatched chapters! Script might need adjustments.")
