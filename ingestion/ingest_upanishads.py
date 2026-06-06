import os
import sqlite3
import urllib.request
from bs4 import BeautifulSoup
import re
import time

DB_PATH = os.path.join(os.path.dirname(__file__), '..', 'backend', 'data', 'scriptures.db')

URLS = [
    "https://sanskritdocuments.org/doc_upanishhat/brinew-proofed.html",
    "https://sanskritdocuments.org/doc_upanishhat/chhaandogya.html",
    "https://sanskritdocuments.org/doc_upanishhat/taitaccent.html",
    "https://sanskritdocuments.org/doc_upanishhat/aitareyopaniShatsasvarA.html",
    "https://sanskritdocuments.org/doc_upanishhat/iisha.html",
    "https://sanskritdocuments.org/doc_upanishhat/kena.html",
    "https://sanskritdocuments.org/doc_upanishhat/katha.html",
    "https://sanskritdocuments.org/doc_upanishhat/prashna.html",
    "https://sanskritdocuments.org/doc_upanishhat/mundaka.html",
    "https://sanskritdocuments.org/doc_upanishhat/maandu.html",
    "https://sanskritdocuments.org/doc_upanishhat/shveta.html",
    "https://sanskritdocuments.org/doc_upanishhat/kaushhiitaki.html",
    "https://sanskritdocuments.org/doc_upanishhat/maitri.html",
    "https://sanskritdocuments.org/doc_upanishhat/amrtabindu_upan.html",
    "https://sanskritdocuments.org/doc_upanishhat/tejobindu.html"
]

def clean_verse(text):
    text = re.sub(r'<[^>]+>', '', text)
    text = text.strip()
    return text

def devanagari_to_int(s):
    DEV_DIGITS = {'०': '0', '१': '1', '२': '2', '३': '3', '४': '4', '५': '5', '६': '6', '७': '7', '८': '8', '९': '9'}
    normal_chars = []
    for c in s:
        if c in DEV_DIGITS:
            normal_chars.append(DEV_DIGITS[c])
        elif c.isdigit():
            normal_chars.append(c)
    if not normal_chars:
        return 0
    return int("".join(normal_chars))

def run():
    print("Connecting to DB...")
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }

    for url in URLS:
        name = url.split('/')[-1].replace('.html', '').capitalize()
        # Some manual name cleanup
        if name == 'Brinew-proofed': name = 'Brihadaranyaka Upanishad'
        elif name == 'Chhaandogya': name = 'Chandogya Upanishad'
        elif name == 'Taitaccent': name = 'Taittiriya Upanishad'
        elif name == 'Aitareyopanishatsasvara': name = 'Aitareya Upanishad'
        elif name == 'Iisha': name = 'Isha Upanishad'
        elif name == 'Kena': name = 'Kena Upanishad'
        elif name == 'Katha': name = 'Katha Upanishad'
        elif name == 'Prashna': name = 'Prashna Upanishad'
        elif name == 'Mundaka': name = 'Mundaka Upanishad'
        elif name == 'Maandu': name = 'Mandukya Upanishad'
        elif name == 'Shveta': name = 'Shvetashvatara Upanishad'
        elif name == 'Kaushhiitaki': name = 'Kaushitaki Upanishad'
        elif name == 'Maitri': name = 'Maitri Upanishad'
        elif name == 'Amrtabindu_upan': name = 'Amritabindu Upanishad'
        elif name == 'Tejobindu': name = 'Tejobindu Upanishad'

        print(f"Ingesting {name}...")
        try:
            req = urllib.request.Request(url, headers=headers)
            html = urllib.request.urlopen(req).read().decode('utf-8')
            soup = BeautifulSoup(html, 'html.parser')
            
            pre_tag = soup.find('pre', {'id': 'content'})
            if not pre_tag:
                print(f"Could not find <pre id='content'> for {name}")
                continue
            
            text = pre_tag.get_text()
            
            # Create Source
            cursor.execute('INSERT INTO sources (name, type) VALUES (?, ?)', (name, 'Shruti'))
            source_id = cursor.lastrowid
            
            # Create Section (Just one chapter for simplicity, or we can parse chapters later if needed)
            cursor.execute('INSERT INTO sections (source_id, chapter_number, chapter_name) VALUES (?, ?, ?)', (source_id, 1, name))
            section_id = cursor.lastrowid
            
            # Split by verse marks e.g. ॥ १ ॥
            parts = re.split(r'([॥|]\s*[०-९\d]+\s*[॥|])', text)
            
            v_idx = 1
            for i in range(0, len(parts), 2):
                content = parts[i].strip()
                if not content:
                    continue
                
                # Try to get verse number from the next marker
                if i + 1 < len(parts):
                    marker = parts[i+1]
                    num = devanagari_to_int(marker)
                    if num > 0:
                        v_idx = num
                
                cursor.execute('''
                    INSERT INTO verses (section_id, verse_number, sanskrit_text, transliteration, word_meanings)
                    VALUES (?, ?, ?, ?, ?)
                ''', (section_id, v_idx, content, "", ""))
                v_idx += 1
                
        except Exception as e:
            print(f"Error processing {name}: {e}")
            
        time.sleep(1) # delay to be nice to the server
        
    conn.commit()
    conn.close()
    print("Done!")

if __name__ == '__main__':
    run()
