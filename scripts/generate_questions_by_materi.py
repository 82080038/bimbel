#!/usr/bin/env python3
"""
Script untuk generate soal berdasarkan materi-topic-kategori
Menggunakan template dan materi untuk generate soal secara otomatis
"""

import mysql.connector
import json
import random
from datetime import datetime

# Database configuration
DB_CONFIG = {
    'host': '127.0.0.1',
    'user': 'root',
    'password': 'root',
    'database': 'bimbel_db',
    'charset': 'utf8mb4'
}

# Template soal untuk setiap materi
QUESTION_TEMPLATES = {
    # TWK - Ideologi Pancasila
    1: {
        'Arti Kata dan Asal Usul Pancasila': [
            {
                'pertanyaan': 'Apa arti kata "Pancasila" menurut etimologi Sanskerta?',
                'opsi_a': 'Lima dasar',
                'opsi_b': 'Lima sila',
                'opsi_c': 'Lima nilai',
                'opsi_d': 'Laku lima',
                'opsi_e': 'Panca sila',
                'jawaban': 'A',
                'pembahasan': 'Pancasila berasal dari kata "Panca" yang berarti lima dan "Sila" yang berarti dasar atau asas.'
            },
            {
                'pertanyaan': 'Siapa yang pertama kali merumuskan istilah "Pancasila"?',
                'opsi_a': 'Soekarno',
                'opsi_b': 'Mohammad Hatta',
                'opsi_c': 'Mr. Soepomo',
                'opsi_d': 'Mr. Muhammad Yamin',
                'opsi_e': 'Ki Hajar Dewantara',
                'jawaban': 'D',
                'pembahasan': 'Mr. Muhammad Yamin adalah yang pertama kali merumuskan istilah "Pancasila" dalam pidatonya tanggal 29 Mei 1945.'
            }
        ],
        'Kedudukan dan Fungsi Pancasila': [
            {
                'pertanyaan': 'Pancasila tercantum dalam Pembukaan UUD 1945 alinea ke-',
                'opsi_a': 'Pertama',
                'opsi_b': 'Kedua',
                'opsi_c': 'Ketiga',
                'opsi_d': 'Keempat',
                'opsi_e': 'Kelima',
                'jawaban': 'D',
                'pembahasan': 'Pancasila tercantum dalam Pembukaan UUD 1945 alinea keempat sebagai dasar negara.'
            },
            {
                'pertanyaan': 'Pancasila sebagai dasar negara memiliki kedudukan sebagai...',
                'opsi_a': 'Hukum adat',
                'opsi_b': 'Hukum tertulis',
                'opsi_c': 'Sumber dari segala sumber hukum',
                'opsi_d': 'Hukum internasional',
                'opsi_e': 'Hukum perdata',
                'jawaban': 'C',
                'pembahasan': 'Pancasila sebagai dasar negara merupakan sumber dari segala sumber hukum negara.'
            }
        ]
    },
    # TWK - Sejarah Indonesia
    2: {
        'Proklamasi Kemerdekaan': [
            {
                'pertanyaan': 'Kapan Proklamasi Kemerdekaan Indonesia dibacakan?',
                'opsi_a': '16 Agustus 1945',
                'opsi_b': '17 Agustus 1945',
                'opsi_c': '18 Agustus 1945',
                'opsi_d': '28 Oktober 1928',
                'opsi_e': '10 November 1945',
                'jawaban': 'B',
                'pembahasan': 'Proklamasi Kemerdekaan Indonesia dibacakan pada tanggal 17 Agustus 1945 oleh Ir. Soekarno.'
            },
            {
                'pertanyaan': 'Di mana Proklamasi Kemerdekaan Indonesia dibacakan?',
                'opsi_a': 'Gedung Merdeka',
                'opsi_b': 'Jalan Pegangsaan Timur No. 56',
                'opsi_c': 'Istana Negara',
                'opsi_d': 'Lapangan Ikada',
                'opsi_e': 'Gedung Agung',
                'jawaban': 'B',
                'pembahasan': 'Proklamasi Kemerdekaan dibacakan di Jalan Pegangsaan Timur No. 56, Jakarta.'
            }
        ]
    },
    # TIU - Logika Matematika
    4: {
        'Operasi Bilangan': [
            {
                'pertanyaan': 'Jika A = 5 dan B = 3, berapakah nilai dari A + B × 2?',
                'opsi_a': '11',
                'opsi_b': '16',
                'opsi_c': '13',
                'opsi_d': '10',
                'opsi_e': '8',
                'jawaban': 'A',
                'pembahasan': 'A + B × 2 = 5 + 3 × 2 = 5 + 6 = 11'
            },
            {
                'pertanyaan': 'Berapakah hasil dari 15 + 25 - 10 × 2?',
                'opsi_a': '30',
                'opsi_b': '20',
                'opsi_c': '40',
                'opsi_d': '25',
                'opsi_e': '35',
                'jawaban': 'B',
                'pembahasan': '15 + 25 - 10 × 2 = 15 + 25 - 20 = 40 - 20 = 20'
            }
        ],
        'Deret Aritmatika': [
            {
                'pertanyaan': 'Lanjutkan deret berikut: 2, 4, 6, 8, ...',
                'opsi_a': '9',
                'opsi_b': '10',
                'opsi_c': '11',
                'opsi_d': '12',
                'opsi_e': '14',
                'jawaban': 'B',
                'pembahasan': 'Deret ini menambah 2 setiap langkah: 2, 4, 6, 8, 10'
            },
            {
                'pertanyaan': 'Lanjutkan deret berikut: 1, 4, 7, 10, ...',
                'opsi_a': '11',
                'opsi_b': '12',
                'opsi_c': '13',
                'opsi_d': '14',
                'opsi_e': '15',
                'jawaban': 'C',
                'pembahasan': 'Deret ini menambah 3 setiap langkah: 1, 4, 7, 10, 13'
            }
        ]
    },
    # TIU - Verbal Reasoning
    5: {
        'Sinonim': [
            {
                'pertanyaan': 'Sinonim dari kata "besar" adalah...',
                'opsi_a': 'Kecil',
                'opsi_b': 'Ramping',
                'opsi_c': 'Gedang',
                'opsi_d': 'Pendek',
                'opsi_e': 'Tipis',
                'jawaban': 'C',
                'pembahasan': 'Sinonim dari kata "besar" adalah "gedang".'
            },
            {
                'pertanyaan': 'Sinonim dari kata "cepat" adalah...',
                'opsi_a': 'Lambat',
                'opsi_b': 'Laju',
                'opsi_c': 'Tenang',
                'opsi_d': 'Diam',
                'opsi_e': 'Santai',
                'jawaban': 'B',
                'pembahasan': 'Sinonim dari kata "cepat" adalah "laju".'
            }
        ],
        'Antonim': [
            {
                'pertanyaan': 'Antonim dari kata "tinggi" adalah...',
                'opsi_a': 'Atas',
                'opsi_b': 'Besar',
                'opsi_c': 'Rendah',
                'opsi_d': 'Panjang',
                'opsi_e': 'Lebar',
                'jawaban': 'C',
                'pembahasan': 'Antonim dari kata "tinggi" adalah "rendah".'
            },
            {
                'pertanyaan': 'Antonim dari kata "panas" adalah...',
                'opsi_a': 'Hangat',
                'opsi_b': 'Dingin',
                'opsi_c': 'Segar',
                'opsi_d': 'Basah',
                'opsi_e': 'Kering',
                'jawaban': 'B',
                'pembahasan': 'Antonim dari kata "panas" adalah "dingin".'
            }
        ]
    }
}

def get_materi_list():
    """Ambil daftar materi dari database"""
    conn = mysql.connector.connect(**DB_CONFIG)
    cursor = conn.cursor(dictionary=True)
    
    query = """
    SELECT m.id, m.nama_materi, m.topic_id, t.nama_topik, m.kategori_id, k.nama_kategori
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

def get_kategori_id_by_name(kategori_nama):
    """Ambil kategori_id berdasarkan nama kategori"""
    kategori_map = {
        'TWK': 1,
        'TIU': 2,
        'TKP': 3,
        'TPA': 4,
        'PSIKOLOGIS': 5
    }
    return kategori_map.get(kategori_nama)

def generate_question_for_materi(materi_id, materi_nama, kategori_id, topic_id):
    """Generate soal untuk materi tertentu"""
    # Cek apakah ada template untuk materi ini
    if materi_id in QUESTION_TEMPLATES and materi_nama in QUESTION_TEMPLATES[materi_id]:
        templates = QUESTION_TEMPLATES[materi_id][materi_nama]
        # Pilih template secara random
        template = random.choice(templates)
        return template
    else:
        # Generate generic question jika tidak ada template
        return {
            'pertanyaan': f'Ini adalah soal contoh untuk materi {materi_nama}. Silakan lengkapi dengan konten yang sesuai.',
            'opsi_a': 'Opsi A',
            'opsi_b': 'Opsi B',
            'opsi_c': 'Opsi C',
            'opsi_d': 'Opsi D',
            'opsi_e': 'Opsi E',
            'jawaban': 'A',
            'pembahasan': f'Pembahasan untuk materi {materi_nama}.'
        }

def save_question_to_db(question_data, kategori_id, topic_id, materi_id):
    """Simpan soal ke database"""
    conn = mysql.connector.connect(**DB_CONFIG)
    cursor = conn.cursor()
    
    query = """
    INSERT INTO soal (kategori_id, topic_id, materi_id, pertanyaan, opsi_a, opsi_b, opsi_c, opsi_d, opsi_e, jawaban_benar, pembahasan, created_at)
    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
    """
    
    cursor.execute(query, (
        kategori_id,
        topic_id,
        materi_id,
        question_data['pertanyaan'],
        question_data['opsi_a'],
        question_data['opsi_b'],
        question_data['opsi_c'],
        question_data['opsi_d'],
        question_data['opsi_e'],
        question_data['jawaban'],
        question_data['pembahasan'],
        datetime.now()
    ))
    
    conn.commit()
    soal_id = cursor.lastrowid
    
    cursor.close()
    conn.close()
    
    return soal_id

def main():
    print("=== GENERATE SOAL BERDASARKAN MATERI ===\n")
    
    # Ambil daftar materi
    materi_list = get_materi_list()
    print(f"Ditemukan {len(materi_list)} materi\n")
    
    if not materi_list:
        print("Tidak ada materi yang ditemukan")
        return
    
    # Generate soal untuk setiap materi
    total_generated = 0
    
    for materi in materi_list:
        materi_id = materi['id']
        materi_nama = materi['nama_materi']
        kategori_id = materi['kategori_id']
        topic_id = materi['topic_id']
        kategori_nama = materi['nama_kategori']
        topic_nama = materi['nama_topik']
        
        print(f"Memproses: {kategori_nama} - {topic_nama} - {materi_nama}")
        
        # Generate 1 soal per materi (bisa diubah)
        question_data = generate_question_for_materi(materi_id, materi_nama, kategori_id, topic_id)
        
        # Simpan ke database
        soal_id = save_question_to_db(question_data, kategori_id, topic_id, materi_id)
        
        print(f"  ✓ Soal ID {soal_id} berhasil dibuat")
        total_generated += 1
    
    print(f"\n=== HASIL ===")
    print(f"Total soal yang digenerate: {total_generated}")

if __name__ == "__main__":
    main()
