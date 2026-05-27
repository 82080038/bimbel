#!/usr/bin/env python3
"""
Script untuk menganalisis soal tanpa topic_id dan menentukan topik secara otomatis
Menggunakan NLP sederhana dan keyword matching untuk klasifikasi
"""

import mysql.connector
import re
from collections import Counter
import json

# Database configuration
DB_CONFIG = {
    'host': '127.0.0.1',
    'user': 'root',
    'password': 'root',
    'database': 'bimbel_db',
    'charset': 'utf8mb4'
}

# Default topic untuk setiap kategori (fallback jika tidak dapat diklasifikasikan)
DEFAULT_TOPICS = {
    1: 'Ideologi Pancasila',  # TWK
    2: 'Logika Matematika',   # TIU
    3: 'Kepribadian',         # TKP
    4: 'Bahasa Indonesia',    # TPA
    5: 'Kepribadian'          # PSIKOLOGIS
}
TOPIC_KEYWORDS = {
    # TWK (Kategori 1)
    1: {
        'Ideologi Pancasila': [
            'pancasila', 'ideologi', 'sila', 'butir', 'nilai', 'bangsa', 'negara', 'ketuhanan', 'kemanusiaan', 
            'persatuan', 'demokrasi', 'keadilan', 'bhineka', 'tunggal', 'ika', 'nkri', 'dasar', 'negara',
            'pembukaan', 'uud', '1945', 'alinea', 'keempat', 'proklamasi', 'merdeka', 'kemerdekaan'
        ],
        'Sejarah Indonesia': [
            'sejarah', 'kerajaan', 'penjajahan', 'kemerdekaan', 'proklamasi', 'pahlawan', 'revolusi', 
            'kolonial', 'belanda', 'portugis', 'inggris', 'jepang', 'perjuangan', 'perang', 'diponegoro',
            'soeharto', 'soekarno', 'habibie', 'reformasi', 'orde', 'baru', 'lama', 'naskah', 'proklamasi'
        ],
        'Geografi Indonesia': [
            'geografi', 'pulau', 'laut', 'gunung', 'sungai', 'iklim', 'wilayah', 'batas', 'letak', 
            'astronomis', 'geografis', 'klimatologis', 'maritim', 'daratan', 'samudra', 'selat', 
            'jawa', 'sumatera', 'kalimantan', 'sulawesi', 'papua', 'bali', 'ntb', 'ntt', 'provinsi'
        ]
    },
    # TIU (Kategori 2)
    2: {
        'Logika Matematika': [
            'logika', 'matematika', 'hitung', 'angka', 'operasi', 'persamaan', 'deret', 'aritmatika',
            'aljabar', 'penjumlahan', 'pengurangan', 'perkalian', 'pembagian', 'pangkat', 'akar',
            'persentase', 'rasio', 'proporsi', 'faktor', 'kelipatan', 'prima', 'ganjil', 'genap'
        ],
        'Verbal Reasoning': [
            'verbal', 'bahasa', 'sinonim', 'antonim', 'analogi', 'kata', 'makna', 'padanan', 
            'lawan', 'kata', 'bermakna', 'sama', 'berlawanan', 'hubungan', 'kata', 'paragraf',
            'kalimat', 'artinya', 'dimaksudkan', 'tersurat', 'tersirat', 'kesimpulan', 'bacaan'
        ],
        'Spasial Reasoning': [
            'spasial', 'gambar', 'bentuk', 'rotasi', 'cermin', 'pola', 'visual', 'kubus', 'balok',
            'segitiga', 'persegi', 'lingkaran', 'lipatan', 'dilipat', 'diputar', 'digeser', 'bayangan',
            'proyeksi', 'dimensi', 'ruang', 'tiga', 'dua', 'bidang', 'sisi', 'titik', 'garis'
        ]
    },
    # TKP (Kategori 3)
    3: {
        'Kepribadian': [
            'kepribadian', 'sifat', 'karakter', 'perilaku', 'sikap', 'temperamen', 'introvert', 'ekstrovert',
            'ambivert', 'pribadi', 'diri', 'sendiri', 'manusia', 'individu', 'orang', 'jiwa', 'psikologis'
        ],
        'Etika Kerja': [
            'etika', 'kerja', 'profesional', 'disiplin', 'tanggung jawab', 'kolaborasi', 'tim', 'team',
            'kerja', 'sama', 'kerjasama', 'kantor', 'kantor', 'karyawan', 'pegawai', 'atasan', 'bawahan',
            'rekan', 'sejawat', 'lingkungan', 'kerja', 'kantor', 'profesi', 'pekerjaan'
        ]
    },
    # TPA (Kategori 4)
    4: {
        'Bahasa Indonesia': [
            'bahasa', 'indonesia', 'tatabahasa', 'kalimat', 'paragraf', 'ejaan', 'kata', 'imbuhan',
            'awalan', 'akhiran', 'sisipan', 'prefiks', 'sufiks', 'konfiks', 'sinonim', 'antonim',
            'homonym', 'polisemi', 'makna', 'denotasi', 'konotasi', 'idiom', 'peribahasa'
        ],
        'Numerik': [
            'numerik', 'angka', 'hitung', 'kalkulasi', 'persentase', 'rasio', 'proporsi', 'statistik',
            'rata-rata', 'median', 'modus', 'standar', 'deviasi', 'varians', 'probabilitas', 'kombinasi',
            'permutasi', 'deret', 'aritmatika', 'geometri', 'fibonacci', 'pangkat', 'akar'
        ],
        'Logika': [
            'logika', 'penalaran', 'deduksi', 'induksi', 'analisis', 'sintesis', 'silogisme', 'premis',
            'kesimpulan', 'argumen', 'valid', 'invalid', 'bena', 'salah', 'jika', 'maka', 'sebab',
            'akibat', 'sebab-akibat', 'kondisi', 'syarat', 'cukup', 'perlu', 'perlu', 'cukup'
        ],
        'Spasial': [
            'spasial', 'visual', 'gambar', 'bentuk', 'ruang', 'dimensi', 'tiga', 'dua', 'bidang',
            'kubus', 'balok', 'tabung', 'kerucut', 'bola', 'prisma', 'limas', 'volume', 'luas',
            'keliling', 'diagonal', 'sisi', 'rusuk', 'titik', 'garis', 'sudut', 'rotasi', 'cermin'
        ]
    },
    # PSIKOLOGIS (Kategori 5)
    5: {
        'Kepribadian': [
            'kepribadian', 'sifat', 'karakter', 'perilaku', 'psikologi', 'temperamen', 'introvert',
            'ekstrovert', 'ambivert', 'pribadi', 'diri', 'sendiri', 'manusia', 'individu', 'orang',
            'jiwa', 'emosi', 'perasaan', 'sikap', 'pendirian', 'prinsip', 'nilai', 'hidup'
        ],
        'Motivasi': [
            'motivasi', 'dorongan', 'insentif', 'prestasi', 'tujuan', 'ambisi', 'keinginan', 'hasrat',
            'mencapai', 'berprestasi', 'sukses', 'gagal', 'keberhasilan', 'kegagalan', 'target', 'sasaran',
            'harapan', 'cita-cita', 'impian', 'aspirasi', 'ambisi', 'terdorong', 'termotivasi'
        ],
        'Pengendalian Diri': [
            'pengendalian', 'emosi', 'stress', 'tekanan', 'adaptasi', 'resilien', 'sabar', 'tenang',
            'marah', 'sedih', 'senang', 'bahagia', 'kecewa', 'frustasi', 'depresi', 'cemas', 'khawatir',
            'takut', 'takut', 'berani', 'percaya', 'diri', 'yakin', 'optimis', 'pesimis'
        ]
    }
}

def get_soal_without_topic():
    """Ambil soal yang belum memiliki topic_id"""
    conn = mysql.connector.connect(**DB_CONFIG)
    cursor = conn.cursor(dictionary=True)
    
    query = """
    SELECT id, kategori_id, pertanyaan, opsi_a, opsi_b, opsi_c, opsi_d, opsi_e
    FROM soal
    WHERE topic_id IS NULL
    """
    
    cursor.execute(query)
    soal_list = cursor.fetchall()
    
    cursor.close()
    conn.close()
    
    return soal_list

def get_topic_id_by_name(kategori_id, topic_name):
    """Ambil topic_id berdasarkan nama topik dan kategori"""
    conn = mysql.connector.connect(**DB_CONFIG)
    cursor = conn.cursor(dictionary=True)
    
    query = """
    SELECT id FROM topik_pelajaran
    WHERE kategori_id = %s AND nama_topik = %s
    LIMIT 1
    """
    
    cursor.execute(query, (kategori_id, topic_name))
    result = cursor.fetchone()
    
    cursor.close()
    conn.close()
    
    return result['id'] if result else None

def classify_topic(soal_text, kategori_id):
    """Klasifikasikan topik berdasarkan keyword matching"""
    if kategori_id not in TOPIC_KEYWORDS:
        return None
    
    # Normalisasi teks
    soal_text = soal_text.lower()
    soal_text = re.sub(r'[^\w\s]', ' ', soal_text)
    words = soal_text.split()
    
    # Hitung skor untuk setiap topik
    topic_scores = {}
    for topic_name, keywords in TOPIC_KEYWORDS[kategori_id].items():
        score = 0
        for keyword in keywords:
            if keyword in soal_text:
                score += 1
        topic_scores[topic_name] = score
    
    # Pilih topik dengan skor tertinggi
    if topic_scores:
        best_topic = max(topic_scores, key=topic_scores.get)
        if topic_scores[best_topic] > 0:
            return best_topic
    
    # Fallback ke default topic jika tidak ada keyword match
    return DEFAULT_TOPICS.get(kategori_id)

def update_soal_topic(soal_id, topic_id):
    """Update topic_id untuk soal"""
    conn = mysql.connector.connect(**DB_CONFIG)
    cursor = conn.cursor()
    
    query = "UPDATE soal SET topic_id = %s WHERE id = %s"
    cursor.execute(query, (topic_id, soal_id))
    
    conn.commit()
    cursor.close()
    conn.close()

def main():
    print("=== KLASIFIKASI TOPIK SOAL ===\n")
    
    # Ambil soal tanpa topic_id
    soal_list = get_soal_without_topic()
    print(f"Ditemukan {len(soal_list)} soal tanpa topic_id\n")
    
    if not soal_list:
        print("Tidak ada soal yang perlu diklasifikasikan")
        return
    
    # Klasifikasikan setiap soal
    classified = 0
    unclassified = 0
    
    for soal in soal_list:
        soal_id = soal['id']
        kategori_id = soal['kategori_id']
        pertanyaan = soal['pertanyaan']
        
        # Gabungkan semua teks untuk analisis
        full_text = f"{pertanyaan} {soal['opsi_a']} {soal['opsi_b']} {soal['opsi_c']} {soal['opsi_d']} {soal['opsi_e']}"
        
        # Klasifikasikan topik
        predicted_topic = classify_topic(full_text, kategori_id)
        
        if predicted_topic:
            # Ambil topic_id dari database
            topic_id = get_topic_id_by_name(kategori_id, predicted_topic)
            
            if topic_id:
                # Update database
                update_soal_topic(soal_id, topic_id)
                print(f"✓ Soal {soal_id}: {predicted_topic} (Topic ID: {topic_id})")
                classified += 1
            else:
                print(f"✗ Soal {soal_id}: Topik '{predicted_topic}' tidak ditemukan di database")
                unclassified += 1
        else:
            print(f"✗ Soal {soal_id}: Tidak dapat diklasifikasikan")
            unclassified += 1
    
    print(f"\n=== HASIL ===")
    print(f"Berhasil diklasifikasikan: {classified}")
    print(f"Tidak dapat diklasifikasikan: {unclassified}")
    print(f"Total: {len(soal_list)}")

if __name__ == "__main__":
    main()
