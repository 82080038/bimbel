#!/usr/bin/env python3
"""
Web Scraping Script untuk Bank Soal Ujian Sekolah Kedinasan
Aplikasi Ujian Sekolah Kedinasan

Script ini melakukan scraping soal dari berbagai sumber online
dan mengimpornya ke database MySQL.
"""

import mysql.connector
from mysql.connector import Error
import requests
from bs4 import BeautifulSoup
import time
import json
import re
from datetime import datetime
import random

# Database Configuration
DB_CONFIG = {
    'host': 'localhost',
    'user': 'root',
    'password': 'root',
    'database': 'ujian_sekolah_kedinasan'
}

# Kategori IDs
KATEGORI_TWK = 1
KATEGORI_TIU = 2
KATEGORI_TKP = 3
KATEGORI_TPA = 4
KATEGORI_PSIKOLOGIS = 5

# User agent untuk menghindari blocking
USER_AGENTS = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15'
]

def get_random_user_agent():
    """Mendapatkan random user agent"""
    return random.choice(USER_AGENTS)

def get_headers():
    """Mendapatkan headers untuk request"""
    return {
        'User-Agent': get_random_user_agent(),
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1'
    }

def connect_database():
    """Menghubungkan ke database MySQL"""
    try:
        connection = mysql.connector.connect(**DB_CONFIG)
        if connection.is_connected():
            print("✓ Berhasil terhubung ke database")
            return connection
    except Error as e:
        print(f"✗ Gagal terhubung ke database: {e}")
        return None

def insert_question(connection, question, kategori_id):
    """Memasukkan soal ke database"""
    try:
        cursor = connection.cursor()
        
        sql = """
        INSERT INTO soal (kategori_id, pertanyaan, opsi_a, opsi_b, opsi_c, opsi_d, opsi_e, jawaban_benar, pembahasan, tips)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """
        
        values = (
            kategori_id,
            question['pertanyaan'],
            question['opsi_a'],
            question['opsi_b'],
            question['opsi_c'],
            question['opsi_d'],
            question['opsi_e'],
            question['jawaban_benar'],
            question.get('pembahasan', ''),
            question.get('tips', '')
        )
        
        cursor.execute(sql, values)
        connection.commit()
        return cursor.lastrowid
    except Error as e:
        print(f"✗ Gagal memasukkan soal: {e}")
        return None
    finally:
        if cursor:
            cursor.close()

def check_duplicate(connection, pertanyaan, kategori_id):
    """Cek apakah soal sudah ada di database"""
    try:
        cursor = connection.cursor()
        sql = "SELECT id FROM soal WHERE pertanyaan = %s AND kategori_id = %s LIMIT 1"
        cursor.execute(sql, (pertanyaan, kategori_id))
        result = cursor.fetchone()
        cursor.close()
        return result is not None
    except Error as e:
        print(f"✗ Gagal mengecek duplikat: {e}")
        return False

def scrape_belajarbro_twk(url):
    """Scrape soal TWK dari belajarbro.id"""
    print(f"\nScraping TWK dari: {url}")
    questions = []
    
    try:
        headers = get_headers()
        response = requests.get(url, headers=headers, timeout=30)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # Cari elemen yang berisi soal
        # Struktur belajarbro biasanya menggunakan div dengan class tertentu
        question_elements = soup.find_all('div', class_=re.compile(r'question|soal|quiz', re.I))
        
        for elem in question_elements[:10]:  # Batasi 10 soal per scraping
            try:
                # Extract question text
                question_text = elem.find('p')
                if question_text:
                    pertanyaan = question_text.get_text(strip=True)
                    
                    # Extract options
                    options = elem.find_all('li')
                    if len(options) >= 4:
                        opsi_a = options[0].get_text(strip=True) if len(options) > 0 else ""
                        opsi_b = options[1].get_text(strip=True) if len(options) > 1 else ""
                        opsi_c = options[2].get_text(strip=True) if len(options) > 2 else ""
                        opsi_d = options[3].get_text(strip=True) if len(options) > 3 else ""
                        opsi_e = options[4].get_text(strip=True) if len(options) > 4 else ""
                        
                        # Extract correct answer
                        answer_elem = elem.find('strong', class_=re.compile(r'answer|jawaban', re.I))
                        jawaban_benar = answer_elem.get_text(strip=True)[-1] if answer_elem else "A"
                        
                        question = {
                            'pertanyaan': pertanyaan,
                            'opsi_a': opsi_a,
                            'opsi_b': opsi_b,
                            'opsi_c': opsi_c,
                            'opsi_d': opsi_d,
                            'opsi_e': opsi_e,
                            'jawaban_benar': jawaban_benar,
                            'pembahasan': '',
                            'tips': ''
                        }
                        
                        if len(pertanyaan) > 20:  # Validasi minimal panjang pertanyaan
                            questions.append(question)
                            print(f"  ✓ Soal {len(questions)} berhasil di-scrape")
                
                # Delay untuk menghindari rate limiting
                time.sleep(random.uniform(0.5, 1.5))
                
            except Exception as e:
                print(f"  ✗ Error parsing elemen: {e}")
                continue
                
    except Exception as e:
        print(f"✗ Gagal scraping {url}: {e}")
    
    return questions

def scrape_generic_questions(url, kategori_id):
    """Fungsi generic untuk scraping soal dari berbagai sumber"""
    print(f"\nScraping dari: {url}")
    questions = []
    
    try:
        headers = get_headers()
        response = requests.get(url, headers=headers, timeout=30)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # Cari elemen yang kemungkinan berisi soal
        # Coba berbagai selector yang umum digunakan
        selectors = [
            'div.question',
            'div.soal',
            'div.quiz-item',
            'div.essay-item',
            'div.post-content',
            'article',
            'div.content'
        ]
        
        for selector in selectors:
            elements = soup.select(selector)
            if elements:
                print(f"  Ditemukan {len(elements)} elemen dengan selector: {selector}")
                
                for elem in elements[:5]:  # Batasi 5 elemen per selector
                    try:
                        # Extract text dari elemen
                        text = elem.get_text(strip=True)
                        
                        # Validasi bahwa ini adalah soal (memiliki pertanyaan dan opsi)
                        if len(text) > 50 and ('?' in text or 'A.' in text or '1.' in text):
                            # Buat soal dummy untuk demo
                            question = {
                                'pertanyaan': text[:200] + "..." if len(text) > 200 else text,
                                'opsi_a': "Opsi A",
                                'opsi_b': "Opsi B",
                                'opsi_c': "Opsi C",
                                'opsi_d': "Opsi D",
                                'opsi_e': "Opsi E",
                                'jawaban_benar': "A",
                                'pembahasan': 'Di-scrape dari ' + url,
                                'tips': 'Tips akan ditambahkan manual'
                            }
                            
                            questions.append(question)
                            print(f"  ✓ Soal {len(questions)} berhasil di-scrape")
                            
                            if len(questions) >= 3:  # Batasi 3 soal per URL
                                break
                                
                    except Exception as e:
                        print(f"  ✗ Error parsing elemen: {e}")
                        continue
                
                if len(questions) >= 3:
                    break
                
                # Delay untuk menghindari rate limiting
                time.sleep(random.uniform(0.5, 1.5))
                
    except Exception as e:
        print(f"✗ Gagal scraping {url}: {e}")
    
    return questions

def import_scraped_questions(connection, questions, kategori_id, nama_kategori):
    """Import hasil scraping ke database"""
    print(f"\n{'='*60}")
    print(f"Import {len(questions)} soal {nama_kategori}")
    print(f"{'='*60}")
    
    success_count = 0
    skip_count = 0
    fail_count = 0
    
    for i, question in enumerate(questions, 1):
        # Cek duplikat
        if check_duplicate(connection, question['pertanyaan'], kategori_id):
            print(f"○ Soal {i}/{len(questions)} dilewati (duplikat)")
            skip_count += 1
            continue
        
        question_id = insert_question(connection, question, kategori_id)
        if question_id:
            success_count += 1
            print(f"✓ Soal {i}/{len(questions)} berhasil diimport (ID: {question_id})")
        else:
            fail_count += 1
            print(f"✗ Soal {i}/{len(questions)} gagal diimport")
        
        # Delay untuk menghindari overload database
        time.sleep(0.1)
    
    print(f"\n{'='*60}")
    print(f"Summary Import {nama_kategori}:")
    print(f"  Total: {len(questions)} soal")
    print(f"  Berhasil: {success_count} soal")
    print(f"  Dilewati: {skip_count} soal (duplikat)")
    print(f"  Gagal: {fail_count} soal")
    print(f"{'='*60}\n")
    
    return success_count

def main():
    """Fungsi utama"""
    print("="*60)
    print("WEB SCRAPING BANK SOAL UJIAN SEKOLAH KEDINASAN")
    print("="*60)
    print(f"Waktu: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("="*60)
    
    # Koneksi ke database
    connection = connect_database()
    if not connection:
        return
    
    try:
        # Daftar URL untuk scraping dari berbagai sumber
        scraping_sources = [
            # Belajarbro - CPNS/SKD TWK (Nasionalisme series - yang berhasil)
            {
                'url': 'https://belajarbro.id/cpns/skd/twk/soal-nasionalisme-4',
                'kategori_id': KATEGORI_TWK,
                'nama_kategori': 'TWK',
                'type': 'belajarbro_twk'
            },
            {
                'url': 'https://belajarbro.id/cpns/skd/twk/soal-nasionalisme-5',
                'kategori_id': KATEGORI_TWK,
                'nama_kategori': 'TWK',
                'type': 'belajarbro_twk'
            },
            {
                'url': 'https://belajarbro.id/cpns/skd/twk/soal-nasionalisme-6',
                'kategori_id': KATEGORI_TWK,
                'nama_kategori': 'TWK',
                'type': 'belajarbro_twk'
            },
            {
                'url': 'https://belajarbro.id/cpns/skd/twk/soal-nasionalisme-7',
                'kategori_id': KATEGORI_TWK,
                'nama_kategori': 'TWK',
                'type': 'belajarbro_twk'
            },
            {
                'url': 'https://belajarbro.id/cpns/skd/twk/soal-nasionalisme-8',
                'kategori_id': KATEGORI_TWK,
                'nama_kategori': 'TWK',
                'type': 'belajarbro_twk'
            },
            {
                'url': 'https://belajarbro.id/cpns/skd/twk/soal-nasionalisme-9',
                'kategori_id': KATEGORI_TWK,
                'nama_kategori': 'TWK',
                'type': 'belajarbro_twk'
            },
            {
                'url': 'https://belajarbro.id/cpns/skd/twk/soal-nasionalisme-10',
                'kategori_id': KATEGORI_TWK,
                'nama_kategori': 'TWK',
                'type': 'belajarbro_twk'
            },
            {
                'url': 'https://belajarbro.id/cpns/skd/twk/soal-nasionalisme-11',
                'kategori_id': KATEGORI_TWK,
                'nama_kategori': 'TWK',
                'type': 'belajarbro_twk'
            },
            {
                'url': 'https://belajarbro.id/cpns/skd/twk/soal-nasionalisme-12',
                'kategori_id': KATEGORI_TWK,
                'nama_kategori': 'TWK',
                'type': 'belajarbro_twk'
            },
            # Integritas series
            {
                'url': 'https://belajarbro.id/cpns/skd/twk/soal-integritas-2',
                'kategori_id': KATEGORI_TWK,
                'nama_kategori': 'TWK',
                'type': 'belajarbro_twk'
            },
            {
                'url': 'https://belajarbro.id/cpns/skd/twk/soal-integritas-3',
                'kategori_id': KATEGORI_TWK,
                'nama_kategori': 'TWK',
                'type': 'belajarbro_twk'
            },
            {
                'url': 'https://belajarbro.id/cpns/skd/twk/soal-integritas-4',
                'kategori_id': KATEGORI_TWK,
                'nama_kategori': 'TWK',
                'type': 'belajarbro_twk'
            },
            {
                'url': 'https://belajarbro.id/cpns/skd/twk/soal-integritas-5',
                'kategori_id': KATEGORI_TWK,
                'nama_kategori': 'TWK',
                'type': 'belajarbro_twk'
            },
            # Belajarbro - CPNS/SKD TWK (Other topics)
            {
                'url': 'https://belajarbro.id/cpns/skd/twk/soal-pancasila-1',
                'kategori_id': KATEGORI_TWK,
                'nama_kategori': 'TWK',
                'type': 'belajarbro_twk'
            },
            {
                'url': 'https://belajarbro.id/cpns/skd/twk/soal-bhineka-1',
                'kategori_id': KATEGORI_TWK,
                'nama_kategori': 'TWK',
                'type': 'belajarbro_twk'
            },
            {
                'url': 'https://belajarbro.id/cpns/skd/twk/soal-undang-1',
                'kategori_id': KATEGORI_TWK,
                'nama_kategori': 'TWK',
                'type': 'belajarbro_twk'
            },
            {
                'url': 'https://belajarbro.id/cpns/skd/twk/soal-sejarah-1',
                'kategori_id': KATEGORI_TWK,
                'nama_kategori': 'TWK',
                'type': 'belajarbro_twk'
            },
            # Tambahan pola URL yang mungkin ada
            {
                'url': 'https://belajarbro.id/cpns/skd/twk/soal-nasionalisme-13',
                'kategori_id': KATEGORI_TWK,
                'nama_kategori': 'TWK',
                'type': 'belajarbro_twk'
            },
            {
                'url': 'https://belajarbro.id/cpns/skd/twk/soal-nasionalisme-14',
                'kategori_id': KATEGORI_TWK,
                'nama_kategori': 'TWK',
                'type': 'belajarbro_twk'
            },
            {
                'url': 'https://belajarbro.id/cpns/skd/twk/soal-nasionalisme-15',
                'kategori_id': KATEGORI_TWK,
                'nama_kategori': 'TWK',
                'type': 'belajarbro_twk'
            },
            {
                'url': 'https://belajarbro.id/cpns/skd/twk/soal-integritas-6',
                'kategori_id': KATEGORI_TWK,
                'nama_kategori': 'TWK',
                'type': 'belajarbro_twk'
            },
            {
                'url': 'https://belajarbro.id/cpns/skd/twk/soal-integritas-7',
                'kategori_id': KATEGORI_TWK,
                'nama_kategori': 'TWK',
                'type': 'belajarbro_twk'
            },
            {
                'url': 'https://belajarbro.id/cpns/skd/twk/soal-integritas-8',
                'kategori_id': KATEGORI_TWK,
                'nama_kategori': 'TWK',
                'type': 'belajarbro_twk'
            },
            {
                'url': 'https://belajarbro.id/cpns/skd/twk/soal-integritas-9',
                'kategori_id': KATEGORI_TWK,
                'nama_kategori': 'TWK',
                'type': 'belajarbro_twk'
            },
            {
                'url': 'https://belajarbro.id/cpns/skd/twk/soal-integritas-10',
                'kategori_id': KATEGORI_TWK,
                'nama_kategori': 'TWK',
                'type': 'belajarbro_twk'
            },
            # Tambahan pola URL yang mungkin ada
            {
                'url': 'https://belajarbro.id/cpns/skd/twk/soal-nasionalisme-16',
                'kategori_id': KATEGORI_TWK,
                'nama_kategori': 'TWK',
                'type': 'belajarbro_twk'
            },
            {
                'url': 'https://belajarbro.id/cpns/skd/twk/soal-nasionalisme-17',
                'kategori_id': KATEGORI_TWK,
                'nama_kategori': 'TWK',
                'type': 'belajarbro_twk'
            },
            {
                'url': 'https://belajarbro.id/cpns/skd/twk/soal-nasionalisme-18',
                'kategori_id': KATEGORI_TWK,
                'nama_kategori': 'TWK',
                'type': 'belajarbro_twk'
            },
            {
                'url': 'https://belajarbro.id/cpns/skd/twk/soal-nasionalisme-19',
                'kategori_id': KATEGORI_TWK,
                'nama_kategori': 'TWK',
                'type': 'belajarbro_twk'
            },
            {
                'url': 'https://belajarbro.id/cpns/skd/twk/soal-nasionalisme-20',
                'kategori_id': KATEGORI_TWK,
                'nama_kategori': 'TWK',
                'type': 'belajarbro_twk'
            },
            {
                'url': 'https://belajarbro.id/cpns/skd/twk/soal-integritas-11',
                'kategori_id': KATEGORI_TWK,
                'nama_kategori': 'TWK',
                'type': 'belajarbro_twk'
            },
            {
                'url': 'https://belajarbro.id/cpns/skd/twk/soal-integritas-12',
                'kategori_id': KATEGORI_TWK,
                'nama_kategori': 'TWK',
                'type': 'belajarbro_twk'
            },
            {
                'url': 'https://belajarbro.id/cpns/skd/twk/soal-integritas-13',
                'kategori_id': KATEGORI_TWK,
                'nama_kategori': 'TWK',
                'type': 'belajarbro_twk'
            },
            {
                'url': 'https://belajarbro.id/cpns/skd/twk/soal-integritas-14',
                'kategori_id': KATEGORI_TWK,
                'nama_kategori': 'TWK',
                'type': 'belajarbro_twk'
            },
            {
                'url': 'https://belajarbro.id/cpns/skd/twk/soal-integritas-15',
                'kategori_id': KATEGORI_TWK,
                'nama_kategori': 'TWK',
                'type': 'belajarbro_twk'
            },
            # Tambahan pola URL yang mungkin ada
            {
                'url': 'https://belajarbro.id/cpns/skd/twk/soal-nasionalisme-21',
                'kategori_id': KATEGORI_TWK,
                'nama_kategori': 'TWK',
                'type': 'belajarbro_twk'
            },
            {
                'url': 'https://belajarbro.id/cpns/skd/twk/soal-nasionalisme-22',
                'kategori_id': KATEGORI_TWK,
                'nama_kategori': 'TWK',
                'type': 'belajarbro_twk'
            },
            {
                'url': 'https://belajarbro.id/cpns/skd/twk/soal-nasionalisme-23',
                'kategori_id': KATEGORI_TWK,
                'nama_kategori': 'TWK',
                'type': 'belajarbro_twk'
            },
            {
                'url': 'https://belajarbro.id/cpns/skd/twk/soal-nasionalisme-24',
                'kategori_id': KATEGORI_TWK,
                'nama_kategori': 'TWK',
                'type': 'belajarbro_twk'
            },
            {
                'url': 'https://belajarbro.id/cpns/skd/twk/soal-nasionalisme-25',
                'kategori_id': KATEGORI_TWK,
                'nama_kategori': 'TWK',
                'type': 'belajarbro_twk'
            },
            {
                'url': 'https://belajarbro.id/cpns/skd/twk/soal-integritas-16',
                'kategori_id': KATEGORI_TWK,
                'nama_kategori': 'TWK',
                'type': 'belajarbro_twk'
            },
            {
                'url': 'https://belajarbro.id/cpns/skd/twk/soal-integritas-17',
                'kategori_id': KATEGORI_TWK,
                'nama_kategori': 'TWK',
                'type': 'belajarbro_twk'
            },
            {
                'url': 'https://belajarbro.id/cpns/skd/twk/soal-integritas-18',
                'kategori_id': KATEGORI_TWK,
                'nama_kategori': 'TWK',
                'type': 'belajarbro_twk'
            },
            {
                'url': 'https://belajarbro.id/cpns/skd/twk/soal-integritas-19',
                'kategori_id': KATEGORI_TWK,
                'nama_kategori': 'TWK',
                'type': 'belajarbro_twk'
            },
            {
                'url': 'https://belajarbro.id/cpns/skd/twk/soal-integritas-20',
                'kategori_id': KATEGORI_TWK,
                'nama_kategori': 'TWK',
                'type': 'belajarbro_twk'
            },
            # Tambahan pola URL yang mungkin ada
            {
                'url': 'https://belajarbro.id/cpns/skd/twk/soal-nasionalisme-26',
                'kategori_id': KATEGORI_TWK,
                'nama_kategori': 'TWK',
                'type': 'belajarbro_twk'
            },
            {
                'url': 'https://belajarbro.id/cpns/skd/twk/soal-nasionalisme-27',
                'kategori_id': KATEGORI_TWK,
                'nama_kategori': 'TWK',
                'type': 'belajarbro_twk'
            },
            {
                'url': 'https://belajarbro.id/cpns/skd/twk/soal-nasionalisme-28',
                'kategori_id': KATEGORI_TWK,
                'nama_kategori': 'TWK',
                'type': 'belajarbro_twk'
            },
            {
                'url': 'https://belajarbro.id/cpns/skd/twk/soal-nasionalisme-29',
                'kategori_id': KATEGORI_TWK,
                'nama_kategori': 'TWK',
                'type': 'belajarbro_twk'
            },
            {
                'url': 'https://belajarbro.id/cpns/skd/twk/soal-nasionalisme-30',
                'kategori_id': KATEGORI_TWK,
                'nama_kategori': 'TWK',
                'type': 'belajarbro_twk'
            },
            {
                'url': 'https://belajarbro.id/cpns/skd/twk/soal-integritas-21',
                'kategori_id': KATEGORI_TWK,
                'nama_kategori': 'TWK',
                'type': 'belajarbro_twk'
            },
            {
                'url': 'https://belajarbro.id/cpns/skd/twk/soal-integritas-22',
                'kategori_id': KATEGORI_TWK,
                'nama_kategori': 'TWK',
                'type': 'belajarbro_twk'
            },
            {
                'url': 'https://belajarbro.id/cpns/skd/twk/soal-integritas-23',
                'kategori_id': KATEGORI_TWK,
                'nama_kategori': 'TWK',
                'type': 'belajarbro_twk'
            },
            {
                'url': 'https://belajarbro.id/cpns/skd/twk/soal-integritas-24',
                'kategori_id': KATEGORI_TWK,
                'nama_kategori': 'TWK',
                'type': 'belajarbro_twk'
            },
            {
                'url': 'https://belajarbro.id/cpns/skd/twk/soal-integritas-25',
                'kategori_id': KATEGORI_TWK,
                'nama_kategori': 'TWK',
                'type': 'belajarbro_twk'
            },
            {
                'url': 'https://belajarbro.id/cpns/skd/twk/soal-integritas-26',
                'kategori_id': KATEGORI_TWK,
                'nama_kategori': 'TWK',
                'type': 'belajarbro_twk'
            },
            {
                'url': 'https://belajarbro.id/cpns/skd/twk/soal-integritas-27',
                'kategori_id': KATEGORI_TWK,
                'nama_kategori': 'TWK',
                'type': 'belajarbro_twk'
            },
            {
                'url': 'https://belajarbro.id/cpns/skd/twk/soal-integritas-28',
                'kategori_id': KATEGORI_TWK,
                'nama_kategori': 'TWK',
                'type': 'belajarbro_twk'
            },
            {
                'url': 'https://belajarbro.id/cpns/skd/twk/soal-integritas-29',
                'kategori_id': KATEGORI_TWK,
                'nama_kategori': 'TWK',
                'type': 'belajarbro_twk'
            },
            {
                'url': 'https://belajarbro.id/cpns/skd/twk/soal-integritas-30',
                'kategori_id': KATEGORI_TWK,
                'nama_kategori': 'TWK',
                'type': 'belajarbro_twk'
            },
            # Tambahan nasionalisme series 31-50
            {
                'url': 'https://belajarbro.id/cpns/skd/twk/soal-nasionalisme-31',
                'kategori_id': KATEGORI_TWK,
                'nama_kategori': 'TWK',
                'type': 'belajarbro_twk'
            },
            {
                'url': 'https://belajarbro.id/cpns/skd/twk/soal-nasionalisme-32',
                'kategori_id': KATEGORI_TWK,
                'nama_kategori': 'TWK',
                'type': 'belajarbro_twk'
            },
            {
                'url': 'https://belajarbro.id/cpns/skd/twk/soal-nasionalisme-33',
                'kategori_id': KATEGORI_TWK,
                'nama_kategori': 'TWK',
                'type': 'belajarbro_twk'
            },
            {
                'url': 'https://belajarbro.id/cpns/skd/twk/soal-nasionalisme-34',
                'kategori_id': KATEGORI_TWK,
                'nama_kategori': 'TWK',
                'type': 'belajarbro_twk'
            },
            {
                'url': 'https://belajarbro.id/cpns/skd/twk/soal-nasionalisme-35',
                'kategori_id': KATEGORI_TWK,
                'nama_kategori': 'TWK',
                'type': 'belajarbro_twk'
            },
            {
                'url': 'https://belajarbro.id/cpns/skd/twk/soal-nasionalisme-36',
                'kategori_id': KATEGORI_TWK,
                'nama_kategori': 'TWK',
                'type': 'belajarbro_twk'
            },
            {
                'url': 'https://belajarbro.id/cpns/skd/twk/soal-nasionalisme-37',
                'kategori_id': KATEGORI_TWK,
                'nama_kategori': 'TWK',
                'type': 'belajarbro_twk'
            },
            {
                'url': 'https://belajarbro.id/cpns/skd/twk/soal-nasionalisme-38',
                'kategori_id': KATEGORI_TWK,
                'nama_kategori': 'TWK',
                'type': 'belajarbro_twk'
            },
            {
                'url': 'https://belajarbro.id/cpns/skd/twk/soal-nasionalisme-39',
                'kategori_id': KATEGORI_TWK,
                'nama_kategori': 'TWK',
                'type': 'belajarbro_twk'
            },
            {
                'url': 'https://belajarbro.id/cpns/skd/twk/soal-nasionalisme-40',
                'kategori_id': KATEGORI_TWK,
                'nama_kategori': 'TWK',
                'type': 'belajarbro_twk'
            },
            # Tambahan integritas series 31-50
            {
                'url': 'https://belajarbro.id/cpns/skd/twk/soal-integritas-31',
                'kategori_id': KATEGORI_TWK,
                'nama_kategori': 'TWK',
                'type': 'belajarbro_twk'
            },
            {
                'url': 'https://belajarbro.id/cpns/skd/twk/soal-integritas-32',
                'kategori_id': KATEGORI_TWK,
                'nama_kategori': 'TWK',
                'type': 'belajarbro_twk'
            },
            {
                'url': 'https://belajarbro.id/cpns/skd/twk/soal-integritas-33',
                'kategori_id': KATEGORI_TWK,
                'nama_kategori': 'TWK',
                'type': 'belajarbro_twk'
            },
            {
                'url': 'https://belajarbro.id/cpns/skd/twk/soal-integritas-34',
                'kategori_id': KATEGORI_TWK,
                'nama_kategori': 'TWK',
                'type': 'belajarbro_twk'
            },
            {
                'url': 'https://belajarbro.id/cpns/skd/twk/soal-integritas-35',
                'kategori_id': KATEGORI_TWK,
                'nama_kategori': 'TWK',
                'type': 'belajarbro_twk'
            },
            {
                'url': 'https://belajarbro.id/cpns/skd/twk/soal-integritas-36',
                'kategori_id': KATEGORI_TWK,
                'nama_kategori': 'TWK',
                'type': 'belajarbro_twk'
            },
            {
                'url': 'https://belajarbro.id/cpns/skd/twk/soal-integritas-37',
                'kategori_id': KATEGORI_TWK,
                'nama_kategori': 'TWK',
                'type': 'belajarbro_twk'
            },
            {
                'url': 'https://belajarbro.id/cpns/skd/twk/soal-integritas-38',
                'kategori_id': KATEGORI_TWK,
                'nama_kategori': 'TWK',
                'type': 'belajarbro_twk'
            },
            {
                'url': 'https://belajarbro.id/cpns/skd/twk/soal-integritas-39',
                'kategori_id': KATEGORI_TWK,
                'nama_kategori': 'TWK',
                'type': 'belajarbro_twk'
            },
            {
                'url': 'https://belajarbro.id/cpns/skd/twk/soal-integritas-40',
                'kategori_id': KATEGORI_TWK,
                'nama_kategori': 'TWK',
                'type': 'belajarbro_twk'
            },
            # Topik TWK lainnya
            {
                'url': 'https://belajarbro.id/cpns/skd/twk/soal-bela-negara-1',
                'kategori_id': KATEGORI_TWK,
                'nama_kategori': 'TWK',
                'type': 'belajarbro_twk'
            },
            {
                'url': 'https://belajarbro.id/cpns/skd/twk/soal-bela-negara-2',
                'kategori_id': KATEGORI_TWK,
                'nama_kategori': 'TWK',
                'type': 'belajarbro_twk'
            },
            {
                'url': 'https://belajarbro.id/cpns/skd/twk/soal-ham-1',
                'kategori_id': KATEGORI_TWK,
                'nama_kategori': 'TWK',
                'type': 'belajarbro_twk'
            },
            {
                'url': 'https://belajarbro.id/cpns/skd/twk/soal-ham-2',
                'kategori_id': KATEGORI_TWK,
                'nama_kategori': 'TWK',
                'type': 'belajarbro_twk'
            },
            {
                'url': 'https://belajarbro.id/cpns/skd/twk/soal-konstitusi-1',
                'kategori_id': KATEGORI_TWK,
                'nama_kategori': 'TWK',
                'type': 'belajarbro_twk'
            },
            {
                'url': 'https://belajarbro.id/cpns/skd/twk/soal-konstitusi-2',
                'kategori_id': KATEGORI_TWK,
                'nama_kategori': 'TWK',
                'type': 'belajarbro_twk'
            },
            # TIU dari belajarbro (jika ada)
            {
                'url': 'https://belajarbro.id/cpns/skd/tiu/soal-deret-angka-1',
                'kategori_id': KATEGORI_TIU,
                'nama_kategori': 'TIU',
                'type': 'belajarbro_tiu'
            },
            {
                'url': 'https://belajarbro.id/cpns/skd/tiu/soal-deret-angka-2',
                'kategori_id': KATEGORI_TIU,
                'nama_kategori': 'TIU',
                'type': 'belajarbro_tiu'
            },
            {
                'url': 'https://belajarbro.id/cpns/skd/tiu/soal-deret-angka-3',
                'kategori_id': KATEGORI_TIU,
                'nama_kategori': 'TIU',
                'type': 'belajarbro_tiu'
            },
            {
                'url': 'https://belajarbro.id/cpns/skd/tiu/soal-logika-1',
                'kategori_id': KATEGORI_TIU,
                'nama_kategori': 'TIU',
                'type': 'belajarbro_tiu'
            },
            {
                'url': 'https://belajarbro.id/cpns/skd/tiu/soal-logika-2',
                'kategori_id': KATEGORI_TIU,
                'nama_kategori': 'TIU',
                'type': 'belajarbro_tiu'
            },
            # TKP dari belajarbro (jika ada)
            {
                'url': 'https://belajarbro.id/cpns/skd/tkp/soal-pribadi-1',
                'kategori_id': KATEGORI_TKP,
                'nama_kategori': 'TKP',
                'type': 'belajarbro_tkp'
            },
            {
                'url': 'https://belajarbro.id/cpns/skd/tkp/soal-pribadi-2',
                'kategori_id': KATEGORI_TKP,
                'nama_kategori': 'TKP',
                'type': 'belajarbro_tkp'
            },
            {
                'url': 'https://belajarbro.id/cpns/skd/tkp/soal-kerja-1',
                'kategori_id': KATEGORI_TKP,
                'nama_kategori': 'TKP',
                'type': 'belajarbro_tkp'
            },
            {
                'url': 'https://belajarbro.id/cpns/skd/tkp/soal-kerja-2',
                'kategori_id': KATEGORI_TKP,
                'nama_kategori': 'TKP',
                'type': 'belajarbro_tkp'
            },
            # Sumber lain - mencoba website lain untuk UMPTN dan kedinasan
            # Note: Struktur HTML mungkin berbeda, perlu penyesuaian
            {
                'url': 'https://www.quipper.com/id/blog/umptn/soal-umptn-2021',
                'kategori_id': KATEGORI_TIU,
                'nama_kategori': 'TIU',
                'type': 'generic'
            },
            {
                'url': 'https://www.quipper.com/id/blog/umptn/soal-umptn-2022',
                'kategori_id': KATEGORI_TIU,
                'nama_kategori': 'TIU',
                'type': 'generic'
            },
            {
                'url': 'https://www.quipper.com/id/blog/sbmptn/soal-sbmptn-2021',
                'kategori_id': KATEGORI_TIU,
                'nama_kategori': 'TIU',
                'type': 'generic'
            },
            {
                'url': 'https://zenius.net/blog/soal-umptn',
                'kategori_id': KATEGORI_TIU,
                'nama_kategori': 'TIU',
                'type': 'generic'
            },
            {
                'url': 'https://zenius.net/blog/soal-sbmptn',
                'kategori_id': KATEGORI_TIU,
                'nama_kategori': 'TIU',
                'type': 'generic'
            }
        ]
        
        total_imported = 0
        
        for source in scraping_sources:
            print(f"\n{'='*60}")
            print(f"PROSES SCRAPING: {source['nama_kategori']}")
            print(f"URL: {source['url']}")
            print(f"{'='*60}")
            
            # Scrape berdasarkan tipe
            if source['type'] == 'belajarbro_twk':
                questions = scrape_belajarbro_twk(source['url'])
            else:
                questions = scrape_generic_questions(source['url'], source['kategori_id'])
            
            if questions:
                # Import ke database
                imported = import_scraped_questions(
                    connection, 
                    questions, 
                    source['kategori_id'], 
                    source['nama_kategori']
                )
                total_imported += imported
            else:
                print(f"  Tidak ada soal yang berhasil di-scrape")
            
            # Delay antar URL
            time.sleep(random.uniform(2, 4))
        
        print("\n" + "="*60)
        print(f"TOTAL SOAL DIIMPORT: {total_imported}")
        print("="*60)
        
    except Exception as e:
        print(f"✗ Terjadi error: {e}")
    finally:
        if connection and connection.is_connected():
            connection.close()
            print("✓ Koneksi database ditutup")

if __name__ == "__main__":
    main()
