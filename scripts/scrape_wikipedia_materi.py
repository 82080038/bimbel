#!/usr/bin/env python3
"""
Script untuk mengambil konten edukasi dari Wikipedia berdasarkan materi pelajaran
Menggunakan Wikipedia API untuk mengambil konten yang relevan
"""

import mysql.connector
import requests
import json
from bs4 import BeautifulSoup
import re
import time

# Database configuration
DB_CONFIG = {
    'host': '127.0.0.1',
    'user': 'root',
    'password': 'root',
    'database': 'ujian_sekolah_kedinasan',
    'charset': 'utf8mb4'
}

# Wikipedia API configuration
WIKI_API_URL = "https://id.wikipedia.org/w/api.php"

def get_materi_list():
    """Ambil daftar materi dari database"""
    conn = mysql.connector.connect(**DB_CONFIG)
    cursor = conn.cursor(dictionary=True)
    
    query = """
    SELECT m.id, m.nama_materi, m.deskripsi, t.nama_topik, k.nama_kategori
    FROM materi_pelajaran m
    JOIN topik_pelajaran t ON m.topic_id = t.id
    JOIN kategori_soal k ON m.kategori_id = k.id
    ORDER BY m.kategori_id, m.topic_id, m.urutan
    """
    
    cursor.execute(query)
    materi_list = cursor.fetchall()
    
    cursor.close()
    conn.close()
    
    return materi_list

def search_wikipedia(query):
    """Cari artikel di Wikipedia menggunakan direct search"""
    try:
        # Gunakan direct URL search
        search_url = f"https://id.wikipedia.org/w/index.php?search={query}"
        response = requests.get(search_url, timeout=10)
        response.raise_for_status()
        
        # Parse HTML untuk mendapatkan hasil
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # Cari hasil pencarian
        search_results = []
        for link in soup.select('.mw-search-result a'):
            if link.get('href') and link.get('href').startswith('/wiki/'):
                title = link.get_text().strip()
                search_results.append({'title': title})
                if len(search_results) >= 3:
                    break
        
        return search_results
    except Exception as e:
        print(f"  Error searching Wikipedia: {e}")
        return []

def get_wikipedia_content(title):
    """Ambil konten artikel Wikipedia"""
    params = {
        'action': 'query',
        'prop': 'extracts',
        'explaintext': True,
        'exintro': True,
        'titles': title,
        'format': 'json',
        'utf8': ''
    }
    
    try:
        response = requests.get(WIKI_API_URL, params=params)
        data = response.json()
        
        if 'query' in data and 'pages' in data['query']:
            pages = data['query']['pages']
            for page_id, page_data in pages.items():
                if 'extract' in page_data:
                    return page_data['extract']
        return None
    except Exception as e:
        print(f"Error getting Wikipedia content: {e}")
        return None

def clean_wikipedia_content(content):
    """Bersihkan konten Wikipedia"""
    if not content:
        return ""
    
    # Hapus referensi dan tanda kurung
    content = re.sub(r'\[\d+\]', '', content)
    content = re.sub(r'\[.*?\]', '', content)
    
    # Hapus multiple whitespace
    content = re.sub(r'\s+', ' ', content)
    
    # Batasi panjang konten
    if len(content) > 5000:
        content = content[:5000] + "..."
    
    return content.strip()

def save_bahan_pelajaran(materi_id, judul, konten, sumber):
    """Simpan bahan pelajaran ke database"""
    conn = mysql.connector.connect(**DB_CONFIG)
    cursor = conn.cursor()
    
    # Cek apakah tabel bahan_pelajaran ada
    cursor.execute("SHOW TABLES LIKE 'bahan_pelajaran'")
    if not cursor.fetchone():
        # Buat tabel jika belum ada
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS bahan_pelajaran (
            id INT AUTO_INCREMENT PRIMARY KEY,
            materi_id INT NOT NULL,
            judul VARCHAR(255) NOT NULL,
            konten TEXT,
            sumber VARCHAR(255),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (materi_id) REFERENCES materi_pelajaran(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        """)
    
    # Simpan konten
    query = """
    INSERT INTO bahan_pelajaran (materi_id, judul, konten, sumber)
    VALUES (%s, %s, %s, %s)
    ON DUPLICATE KEY UPDATE konten = VALUES(konten), sumber = VALUES(sumber)
    """
    
    cursor.execute(query, (materi_id, judul, konten, sumber))
    conn.commit()
    
    cursor.close()
    conn.close()

def main():
    print("=== SCRAPE WIKIPEDIA UNTUK MATERI PELAJARAN ===\n")
    
    # Ambil daftar materi
    materi_list = get_materi_list()
    print(f"Ditemukan {len(materi_list)} materi\n")
    
    if not materi_list:
        print("Tidak ada materi yang ditemukan")
        return
    
    success_count = 0
    fail_count = 0
    
    for materi in materi_list:
        materi_id = materi['id']
        nama_materi = materi['nama_materi']
        kategori = materi['nama_kategori']
        topic = materi['nama_topik']
        
        print(f"Memproses: {kategori} - {topic} - {nama_materi}")
        
        # Rate limiting
        time.sleep(0.5)
        
        # Cari di Wikipedia
        search_query = f"{nama_materi} Indonesia"
        search_results = search_wikipedia(search_query)
        
        if search_results:
            # Ambil artikel pertama
            first_result = search_results[0]
            title = first_result['title']
            
            # Ambil konten
            content = get_wikipedia_content(title)
            
            if content:
                # Bersihkan konten
                cleaned_content = clean_wikipedia_content(content)
                
                # Simpan ke database
                save_bahan_pelajaran(
                    materi_id,
                    title,
                    cleaned_content,
                    "Wikipedia Indonesia"
                )
                
                print(f"  ✓ Berhasil: {title}")
                success_count += 1
            else:
                print(f"  ✗ Gagal mengambil konten")
                fail_count += 1
        else:
            print(f"  ✗ Tidak ditemukan di Wikipedia")
            fail_count += 1
    
    print(f"\n=== HASIL ===")
    print(f"Berhasil: {success_count}")
    print(f"Gagal: {fail_count}")
    print(f"Total: {len(materi_list)}")

if __name__ == "__main__":
    main()
