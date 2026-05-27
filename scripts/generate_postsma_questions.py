#!/usr/bin/env python3
"""
Script untuk generate soal Post-SMA (SNBT, TNI, Polri, BUMN)
Menambahkan coverage untuk kategori baru
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

# Template soal untuk Post-SMA categories
POSTSMA_TEMPLATES = {
    # SNBT TPS (Tes Potensi Skolastik)
    16: {
        'Penalaran Umum': [
            {
                'pertanyaan': 'Jika semua A adalah B dan beberapa B adalah C, maka...',
                'opsi_a': 'Semua A adalah C',
                'opsi_b': 'Beberapa A adalah C',
                'opsi_c': 'Tidak ada A yang C',
                'opsi_d': 'Semua C adalah A',
                'opsi_e': 'Tidak dapat ditarik kesimpulan',
                'jawaban': 'E',
                'pembahasan': 'Dari premis "semua A adalah B" dan "beberapa B adalah C", tidak dapat ditarik kesimpulan pasti tentang hubungan A dan C.'
            },
            {
                'pertanyaan': 'Manakah pernyataan yang setara dengan "Jika hujan, maka saya membawa payung"?',
                'opsi_a': 'Jika saya membawa payung, maka hujan',
                'opsi_b': 'Jika tidak hujan, maka saya tidak membawa payung',
                'opsi_c': 'Jika saya tidak membawa payung, maka tidak hujan',
                'opsi_d': 'Hujan atau saya membawa payung',
                'opsi_e': 'Hujan dan saya membawa payung',
                'jawaban': 'C',
                'pembahasan': 'Kontraposisi dari "Jika P maka Q" adalah "Jika tidak Q maka tidak P".'
            },
            {
                'pertanyaan': 'Semua dokter adalah orang berpendidikan. Sebagian orang berpendidikan adalah kaya. Maka...',
                'opsi_a': 'Semua dokter kaya',
                'opsi_b': 'Sebagian dokter kaya',
                'opsi_c': 'Tidak ada dokter yang kaya',
                'opsi_d': 'Semua orang kaya adalah dokter',
                'opsi_e': 'Tidak dapat ditarik kesimpulan',
                'jawaban': 'E',
                'pembahasan': 'Dari premis tidak dapat ditarik kesimpulan pasti tentang kekayaan dokter.'
            },
            {
                'pertanyaan': 'Jika "Semua siswa kelas XII harus ujian", maka pernyataan yang pasti benar adalah...',
                'opsi_a': 'Jika tidak ujian, maka bukan siswa kelas XII',
                'opsi_b': 'Jika ujian, maka siswa kelas XII',
                'opsi_c': 'Jika bukan siswa kelas XII, maka tidak ujian',
                'opsi_d': 'Semua yang ujian adalah siswa kelas XII',
                'opsi_e': 'Tidak ada yang ujian',
                'jawaban': 'A',
                'pembahasan': 'Kontraposisi: "Jika tidak ujian, maka bukan siswa kelas XII".'
            },
            {
                'pertanyaan': 'Deret: A, C, E, G, I, ... huruf selanjutnya adalah...',
                'opsi_a': 'J',
                'opsi_b': 'K',
                'opsi_c': 'L',
                'opsi_d': 'M',
                'opsi_e': 'N',
                'jawaban': 'B',
                'pembahasan': 'Deret huruf dengan selisih 2 (A→C→E→G→I→K).'
            }
        ],
        'Pengetahuan Kuantitatif': [
            {
                'pertanyaan': 'Jika x + y = 10 dan x - y = 2, maka nilai x adalah...',
                'opsi_a': '4',
                'opsi_b': '5',
                'opsi_c': '6',
                'opsi_d': '7',
                'opsi_e': '8',
                'jawaban': 'C',
                'pembahasan': 'Tambahkan kedua persamaan: (x+y)+(x-y)=10+2 → 2x=12 → x=6'
            },
            {
                'pertanyaan': 'Sebuah lingkaran memiliki jari-jari 7 cm. Keliling lingkaran tersebut adalah...',
                'opsi_a': '22 cm',
                'opsi_b': '44 cm',
                'opsi_c': '154 cm',
                'opsi_d': '308 cm',
                'opsi_e': '49 cm',
                'jawaban': 'B',
                'pembahasan': 'Keliling = 2πr = 2 × 22/7 × 7 = 44 cm'
            },
            {
                'pertanyaan': 'Luas persegi panjang dengan panjang 12 cm dan lebar 8 cm adalah...',
                'opsi_a': '80 cm²',
                'opsi_b': '96 cm²',
                'opsi_c': '100 cm²',
                'opsi_d': '120 cm²',
                'opsi_e': '192 cm²',
                'jawaban': 'B',
                'pembahasan': 'Luas = panjang × lebar = 12 × 8 = 96 cm²'
            },
            {
                'pertanyaan': 'Jika 20% dari suatu bilangan adalah 30, maka bilangan tersebut adalah...',
                'opsi_a': '100',
                'opsi_b': '120',
                'opsi_c': '150',
                'opsi_d': '180',
                'opsi_e': '200',
                'jawaban': 'C',
                'pembahasan': '20% × x = 30 → x = 30/0.2 = 150'
            },
            {
                'pertanyaan': 'Deret: 3, 6, 12, 24, 48, ... angka selanjutnya adalah...',
                'opsi_a': '72',
                'opsi_b': '84',
                'opsi_c': '96',
                'opsi_d': '108',
                'opsi_e': '120',
                'jawaban': 'C',
                'pembahasan': 'Deret geometri dengan rasio 2. Angka selanjutnya: 48 × 2 = 96'
            }
        ]
    },
    # TNI AKADEMIK
    20: {
        'Pengetahuan Umum': [
            {
                'pertanyaan': 'TNI dibentuk pada tanggal...',
                'opsi_a': '5 Oktober 1945',
                'opsi_b': '5 Oktober 1946',
                'opsi_c': '5 Oktober 1947',
                'opsi_d': '5 Oktober 1948',
                'opsi_e': '5 Oktober 1949',
                'jawaban': 'A',
                'pembahasan': 'TNI dibentuk pada 5 Oktober 1945 melalui penggabungan berbagai laskar perjuangan.'
            },
            {
                'pertanyaan': 'Markas Besar TNI berada di...',
                'opsi_a': 'Bandung',
                'opsi_b': 'Jakarta',
                'opsi_c': 'Surabaya',
                'opsi_d': 'Medan',
                'opsi_e': 'Makassar',
                'jawaban': 'B',
                'pembahasan': 'Mabes TNI berlokasi di Cilangkap, Jakarta Timur.'
            },
            {
                'pertanyaan': 'TNI terdiri dari berapa matra?',
                'opsi_a': '2',
                'opsi_b': '3',
                'opsi_c': '4',
                'opsi_d': '5',
                'opsi_e': '6',
                'jawaban': 'B',
                'pembahasan': 'TNI terdiri dari 3 matra: AD, AL, dan AU.'
            },
            {
                'pertanyaan': 'Pangkat tertinggi di TNI adalah...',
                'opsi_a': 'Jenderal',
                'opsi_b': 'Laksamana',
                'opsi_c': 'Marsekal',
                'opsi_d': 'Semua pangkat di atas setara',
                'opsi_e': 'Komandan',
                'jawaban': 'D',
                'pembahasan': 'Pangkat tertinggi di setiap matra setara: Jenderal (AD), Laksamana (AL), Marsekal (AU).'
            },
            {
                'pertanyaan': 'Angkatan Darat dipimpin oleh...',
                'opsi_a': 'Kasal',
                'opsi_b': 'Kasad',
                'opsi_c': 'Kasau',
                'opsi_d': 'Kapolri',
                'opsi_e': 'Kapolri',
                'jawaban': 'B',
                'pembahasan': 'Angkatan Darat dipimpin oleh Kepala Staf Angkatan Darat (Kasad).'
            }
        ],
        'Matematika Dasar': [
            {
                'pertanyaan': 'Turunan pertama dari f(x) = 3x² + 2x - 1 adalah...',
                'opsi_a': '6x + 2',
                'opsi_b': '3x + 2',
                'opsi_c': '6x - 2',
                'opsi_d': '3x - 2',
                'opsi_e': '6x',
                'jawaban': 'A',
                'pembahasan': 'f\'(x) = 2(3x) + 2(1) - 0 = 6x + 2'
            },
            {
                'pertanyaan': 'Integral dari 2x dx adalah...',
                'opsi_a': 'x²',
                'opsi_b': 'x² + C',
                'opsi_c': '2x²',
                'opsi_d': '2x² + C',
                'opsi_e': 'x',
                'jawaban': 'B',
                'pembahasan': '∫2x dx = x² + C'
            },
            {
                'pertanyaan': 'Jika log x = 2, maka x adalah...',
                'opsi_a': '10',
                'opsi_b': '20',
                'opsi_c': '100',
                'opsi_d': '200',
                'opsi_e': '1000',
                'jawaban': 'C',
                'pembahasan': 'log x = 2 → x = 10² = 100'
            },
            {
                'pertanyaan': 'Sin 90° adalah...',
                'opsi_a': '0',
                'opsi_b': '1',
                'opsi_c': '-1',
                'opsi_d': '0.5',
                'opsi_e': '√2/2',
                'jawaban': 'B',
                'pembahasan': 'Sin 90° = 1'
            },
            {
                'pertanyaan': 'Persamaan garis dengan gradien 2 dan melalui titik (0,3) adalah...',
                'opsi_a': 'y = 2x + 3',
                'opsi_b': 'y = 2x - 3',
                'opsi_c': 'y = 3x + 2',
                'opsi_d': 'y = 3x - 2',
                'opsi_e': 'y = x + 3',
                'jawaban': 'A',
                'pembahasan': 'y = mx + c → y = 2x + 3'
            }
        ]
    },
    # POLRI AKADEMIK
    22: {
        'Pengetahuan Kepolisian': [
            {
                'pertanyaan': 'Polri dibentuk berdasarkan...',
                'opsi_a': 'UU No. 13 Tahun 2002',
                'opsi_b': 'UU No. 2 Tahun 2002',
                'opsi_c': 'UU No. 14 Tahun 2002',
                'opsi_d': 'UU No. 15 Tahun 2002',
                'opsi_e': 'UU No. 16 Tahun 2002',
                'jawaban': 'B',
                'pembahasan': 'Polri dibentuk berdasarkan UU No. 2 Tahun 2002 tentang Kepolisian Negara Republik Indonesia.'
            },
            {
                'pertanyaan': 'Kepala Kepolisian Negara Republik Indonesia disebut...',
                'opsi_a': 'Kapolri',
                'opsi_b': 'Kapolda',
                'opsi_c': 'Kapolsek',
                'opsi_d': 'Kapolres',
                'opsi_e': 'Kapolwilt',
                'jawaban': 'A',
                'pembahasan': 'Kepala Kepolisian Negara Republik Indonesia disebut Kapolri.'
            },
            {
                'pertanyaan': 'Motto Polri adalah...',
                'opsi_a': 'Demi Kemanusiaan',
                'opsi_b': 'Melindungi, Melayani, Mengayomi',
                'opsi_c': 'Bhakti Karya Wira',
                'opsi_d': 'Karya Kencana',
                'opsi_e': 'Satya Wira Pratama',
                'jawaban': 'B',
                'pembahasan': 'Motto Polri adalah "Melindungi, Melayani, Mengayomi".'
            },
            {
                'pertanyaan': 'Akdemi Kepolisian (Akpol) berada di...',
                'opsi_a': 'Jakarta',
                'opsi_b': 'Bandung',
                'opsi_c': 'Semarang',
                'opsi_d': 'Surabaya',
                'opsi_e': 'Medan',
                'jawaban': 'C',
                'pembahasan': 'Akdemi Kepolisian (Akpol) berlokasi di Semarang, Jawa Tengah.'
            },
            {
                'pertanyaan': 'Pangkat tertinggi di Polri adalah...',
                'opsi_a': 'Komisaris Jenderal',
                'opsi_b': 'Inspektur Jenderal',
                'opsi_c': 'Jenderal Polisi',
                'opsi_d': 'Komisaris Besar',
                'opsi_e': 'Brigadir Jenderal',
                'jawaban': 'C',
                'pembahasan': 'Pangkat tertinggi di Polri adalah Jenderal Polisi (bintang 4).'
            }
        ],
        'Bahasa Indonesia': [
            {
                'pertanyaan': 'Kalimat efektif adalah kalimat yang...',
                'opsi_a': 'Panjang dan kompleks',
                'opsi_b': 'Singkat dan padat',
                'opsi_c': 'Menggunakan kata-kata asing',
                'opsi_d': 'Menggunakan kalimat pasif',
                'opsi_e': 'Tidak memiliki subjek',
                'jawaban': 'B',
                'pembahasan': 'Kalimat efektif adalah kalimat yang singkat, padat, dan jelas.'
            },
            {
                'pertanyaan': 'Sinonim dari kata "diligent" adalah...',
                'opsi_a': 'Malas',
                'opsi_b': 'Rajin',
                'opsi_c': 'Cerdas',
                'opsi_d': 'Pintar',
                'opsi_e': 'Lambat',
                'jawaban': 'B',
                'pembahasan': 'Diligent berarti rajin atau tekun.'
            },
            {
                'pertanyaan': 'Antonim dari kata "ekspor" adalah...',
                'opsi_a': 'Jual',
                'opsi_b': 'Beli',
                'opsi_c': 'Impor',
                'opsi_d': 'Produksi',
                'opsi_e': 'Distribusi',
                'jawaban': 'C',
                'pembahasan': 'Ekspor berarti menjual ke luar negeri, antonimnya adalah impor (membeli dari luar negeri).'
            },
            {
                'pertanyaan': 'Kata "pemerintah" memiliki kata dasar...',
                'opsi_a': 'Pemerint',
                'opsi_b': 'Ajar',
                'opsi_c': 'Tahu',
                'opsi_d': 'Hantar',
                'opsi_e': 'Perintah',
                'jawaban': 'E',
                'pembahasan': 'Kata dasar dari "pemerintah" adalah "perintah".'
            },
            {
                'pertanyaan': 'Kalimat pasif dari "Saya membeli buku" adalah...',
                'opsi_a': 'Buku saya beli',
                'opsi_b': 'Buku dibeli oleh saya',
                'opsi_c': 'Saya dibeli buku',
                'opsi_d': 'Buku membeli saya',
                'opsi_e': 'Saya oleh buku dibeli',
                'jawaban': 'B',
                'pembahasan': 'Kalimat pasif: "Buku dibeli oleh saya".'
            }
        ]
    },
    # BUMN TPA
    24: {
        'Verbal': [
            {
                'pertanyaan': 'Sinonim dari kata "abstrak" adalah...',
                'opsi_a': 'Nyata',
                'opsi_b': 'Konkret',
                'opsi_c': 'Tidak nyata',
                'opsi_d': 'Jelas',
                'opsi_e': 'Terkini',
                'jawaban': 'C',
                'pembahasan': 'Abstrak berarti tidak nyata atau tidak berwujud, sehingga sinonimnya adalah "tidak nyata".'
            },
            {
                'pertanyaan': 'Antonim dari kata "ekonomis" adalah...',
                'opsi_a': 'Hemat',
                'opsi_b': 'Murah',
                'opsi_c': 'Boros',
                'opsi_d': 'Cermat',
                'opsi_e': 'Efisien',
                'jawaban': 'C',
                'pembahasan': 'Ekonomis berarti hemat, antonimnya adalah boros.'
            },
            {
                'pertanyaan': 'Sinonim dari kata "konsisten" adalah...',
                'opsi_a': 'Berubah-ubah',
                'opsi_b': 'Tetap',
                'opsi_c': 'Acak',
                'opsi_d': 'Sementara',
                'opsi_e': 'Kadang-kadang',
                'jawaban': 'B',
                'pembahasan': 'Konsisten berarti tetap atau tidak berubah-ubah.'
            },
            {
                'pertanyaan': 'Antonim dari kata "optimal" adalah...',
                'opsi_a': 'Terbaik',
                'opsi_b': 'Sempurna',
                'opsi_c': 'Kurang',
                'opsi_d': 'Buruk',
                'opsi_e': 'Minimal',
                'jawaban': 'C',
                'pembahasan': 'Optimal berarti terbaik atau sempurna, antonimnya adalah kurang.'
            },
            {
                'pertanyaan': 'Kata "BUMN" adalah singkatan dari...',
                'opsi_a': 'Badan Usaha Milik Negara',
                'opsi_b': 'Badan Usaha Milik Nasional',
                'opsi_c': 'Badan Usaha Milik Negeri',
                'opsi_d': 'Badan Usaha Milik Negara',
                'opsi_e': 'Badan Usaha Milik Nasional',
                'jawaban': 'A',
                'pembahasan': 'BUMN adalah singkatan dari Badan Usaha Milik Negara.'
            }
        ],
        'Numerik': [
            {
                'pertanyaan': 'Deret: 2, 4, 8, 16, 32, ... angka selanjutnya adalah...',
                'opsi_a': '48',
                'opsi_b': '56',
                'opsi_c': '64',
                'opsi_d': '72',
                'opsi_e': '80',
                'jawaban': 'C',
                'pembahasan': 'Deret geometri dengan rasio 2. Angka selanjutnya: 32 × 2 = 64'
            },
            {
                'pertanyaan': 'Jika 3x = 27, maka x =...',
                'opsi_a': '3',
                'opsi_b': '6',
                'opsi_c': '9',
                'opsi_d': '12',
                'opsi_e': '15',
                'jawaban': 'C',
                'pembahasan': '3x = 27 → x = 27/3 = 9'
            },
            {
                'pertanyaan': 'Deret: 1, 4, 9, 16, 25, ... angka selanjutnya adalah...',
                'opsi_a': '30',
                'opsi_b': '35',
                'opsi_c': '36',
                'opsi_d': '49',
                'opsi_e': '64',
                'jawaban': 'C',
                'pembahasan': 'Deret kuadrat: 1², 2², 3², 4², 5², 6² = 36'
            },
            {
                'pertanyaan': 'Jika a : b = 3 : 4 dan b : c = 2 : 3, maka a : c adalah...',
                'opsi_a': '1 : 2',
                'opsi_b': '2 : 3',
                'opsi_c': '3 : 4',
                'opsi_d': '4 : 5',
                'opsi_e': '5 : 6',
                'jawaban': 'A',
                'pembahasan': 'a:b = 3:4 = 6:8, b:c = 2:3 = 8:12, maka a:c = 6:12 = 1:2'
            },
            {
                'pertanyaan': 'Sebuah tabung memiliki jari-jari 7 cm dan tinggi 10 cm. Volume tabung tersebut adalah...',
                'opsi_a': '1540 cm³',
                'opsi_b': '2200 cm³',
                'opsi_c': '3080 cm³',
                'opsi_d': '4400 cm³',
                'opsi_e': '6160 cm³',
                'jawaban': 'A',
                'pembahasan': 'Volume = πr²h = 22/7 × 7² × 10 = 1540 cm³'
            }
        ]
    }
}

def get_db_connection():
    """Create database connection"""
    return mysql.connector.connect(**DB_CONFIG)

def generate_soal_id(conn):
    """Generate unique soal_id"""
    cursor = conn.cursor()
    cursor.execute("SELECT MAX(id) as max_id FROM soal")
    result = cursor.fetchone()
    max_id = result[0] if result[0] else 0
    cursor.close()
    return max_id + 1

def insert_soal(conn, soal_data):
    """Insert soal into database"""
    cursor = conn.cursor()
    
    sql = """
    INSERT INTO soal (id, pertanyaan, opsi_a, opsi_b, opsi_c, opsi_d, opsi_e, jawaban_benar, pembahasan, kategori_id, is_duplicate, created_at)
    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, 0, NOW())
    """
    
    cursor.execute(sql, (
        soal_data['id'],
        soal_data['pertanyaan'],
        soal_data['opsi_a'],
        soal_data['opsi_b'],
        soal_data['opsi_c'],
        soal_data['opsi_d'],
        soal_data['opsi_e'],
        soal_data['jawaban'],
        soal_data['pembahasan'],
        soal_data['kategori_id']
    ))
    
    conn.commit()
    cursor.close()

def generate_hash(soal_data):
    """Generate hash for duplicate detection"""
    import hashlib
    content = f"{soal_data['pertanyaan']}{''.join([soal_data[f'opsi_{c}'] for c in ['a','b','c','d','e']])}{soal_data['jawaban']}"
    return hashlib.md5(content.encode()).hexdigest()

def main():
    """Main function to generate Post-SMA questions"""
    conn = get_db_connection()
    
    total_generated = 0
    current_id = generate_soal_id(conn)
    
    print("=== GENERATING POST-SMA QUESTIONS ===\n")
    
    for kategori_id, materi_dict in POSTSMA_TEMPLATES.items():
        print(f"Processing kategori_id: {kategori_id}")
        
        for materi_name, questions in materi_dict.items():
            print(f"  - {materi_name}: {len(questions)} questions")
            
            for q in questions:
                soal_data = {
                    'id': current_id,
                    'pertanyaan': q['pertanyaan'],
                    'opsi_a': q['opsi_a'],
                    'opsi_b': q['opsi_b'],
                    'opsi_c': q['opsi_c'],
                    'opsi_d': q['opsi_d'],
                    'opsi_e': q['opsi_e'],
                    'jawaban': q['jawaban'],
                    'pembahasan': q['pembahasan'],
                    'kategori_id': kategori_id
                }
                
                insert_soal(conn, soal_data)
                current_id += 1
                total_generated += 1
    
    print(f"\n=== COMPLETE ===")
    print(f"Total questions generated: {total_generated}")
    print(f"New soal_id range: {generate_soal_id(conn) - total_generated} to {current_id - 1}")
    
    conn.close()

if __name__ == "__main__":
    main()
