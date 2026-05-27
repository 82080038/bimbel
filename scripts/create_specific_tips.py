#!/usr/bin/env python3
"""
Create Specific Tips for Question Types
Based on internet research and Wikipedia
"""

import mysql.connector
import json
from datetime import datetime

# Database configuration
DB_CONFIG = {
    'host': '127.0.0.1',
    'user': 'root',
    'password': 'root',
    'database': 'bimbel_db',
    'charset': 'utf8mb4'
}

# Specific tips based on question types from internet research
QUESTION_TYPE_TIPS = {
    'deret_angka': {
        'keywords': ['deret', 'angka', 'pola', 'urutan'],
        'tip': '''Trik "Hitung Detik" untuk deret angka:
1. Gunakan metode "Lompat Pola" - jangan hitung selisih satu per satu
2. Jika angka naik-turun drastis, curigai pola lompat 2 atau 3
3. Perhatikan pola penjumlahan (+), pengurangan (-), perkalian (×), pembagian (÷)
4. Untuk deret kuadrat: 1, 4, 9, 16 (pola n²)
5. Untuk deret kubik: 1, 8, 27, 64 (pola n³)
6. Gunakan eliminasi jika tidak bisa menemukan pola dengan cepat'''
    },
    'logika_silogisme': {
        'keywords': ['silogisme', 'logika', 'premis', 'konklusi'],
        'tip': '''Trik menjawab soal silogisme:
1. Identifikasi premis mayor dan minor
2. Cari hubungan antar-subjek dalam premis
3. Gunakan diagram Venn jika perlu untuk visualisasi
4. Hindari asumsi luar yang tidak ada dalam premis
5. Perhatikan kata kunci: "semua", "sebagian", "tidak ada"
6. Konklusi harus mengikuti secara logis dari premis'''
    },
    'sinonim_antonim': {
        'keywords': ['sinonim', 'antonim', 'padanan', 'lawan kata'],
        'tip': '''Trik cepat sinonim dan antonim:
1. Buat flashcards dari kata-kata sulit
2. Perhatikan prefiks/sufiks untuk mengidentifikasi makna
3. Gunakan konteks kalimat untuk menebak makna
4. Sinonim: kata dengan makna sama (gembira = senang)
5. Antonim: kata dengan makna berlawanan (panjang = pendek)
6. Eliminasi pilihan yang jelas salah terlebih dahulu'''
    },
    'analogi': {
        'keywords': ['analogi', 'hubungan', 'kata', 'padanan'],
        'tip': '''Trik mengerjakan soal analogi:
1. Buat kalimat penghubung antara dua kata pertama
2. Contoh: "Buku : Membaca = Radio : Mendengarkan"
3. Terapkan pola kalimat yang sama pada pilihan jawaban
4. Perhatikan jenis hubungan: fungsi, bagian, sebab-akibat
5. Gunakan pengetahuan umum untuk memahami hubungan
6. Eliminasi jawaban yang tidak memiliki pola yang sama'''
    },
    'aritmatika': {
        'keywords': ['hitung', 'kalkulasi', 'matematika', 'persentase', 'perbandingan'],
        'tip': '''Trik hitung cepat aritmatika:
1. Gunakan estimasi dan pembulatan
2. Untuk persentase: 10% = ÷10, 20% = ÷5, 25% = ÷4
3. Untuk perbandingan: gunakan rasio sederhana
4. Triple Pythagoras untuk geometri jarak
5. Jangan menghitung detail jika tidak perlu
6. Gunakan eliminasi untuk pilihan yang tidak masuk akal'''
    },
    'nasionalisme': {
        'keywords': ['nasionalisme', 'pancasila', 'uud', 'negara', 'kemerdekaan'],
        'tip': '''Tips menjawab soal nasionalisme TWK:
1. Pahami 5 sila Pancasila dan contohnya
2. Ketahui sejarah kemerdekaan Indonesia
3. Pahami UUD 1945 pasal-pasal penting
4. Nilai-nilai Bhinneka Tunggal Ika
5. Bela negara: cinta tanah air dan siap membela
6. Fokus pada konteks Indonesia dalam pertanyaan'''
    },
    'sikap_perilaku': {
        'keywords': ['sikap', 'perilaku', 'kerja', 'tim', 'motivasi'],
        'tip': '''Tips menjawab soal sikap dan perilaku TKP:
1. Pilih jawaban yang menunjukkan sikap positif
2. Prioritaskan kerjasama tim dan integritas
3. Hindari jawaban yang menunjukkan sikap negatif
4. Pilih jawaban yang menunjukkan tanggung jawab
5. Pertimbangkan etika kerja dan profesionalisme
6. Pilih jawaban yang mendukung lingkungan kerja baik'''
    },
    'sejarah': {
        'keywords': ['tahun', 'sejarah', 'peristiwa', 'masa', 'penjajahan'],
        'tip': '''Tips menjawab soal sejarah TWK:
1. Hafalkan tahun-tahun penting Indonesia
2. Pahami periode sejarah: penjajahan, kemerdekaan, reformasi
3. Ketahui tokoh-tokoh penting nasional
4. Pahami peristiwa penting: Proklamasi, Baperki, dll
5. Kaitkan sejarah dengan konteks nasionalisme
6. Gunakan pengetahuan umum sejarah Indonesia'''
    },
    'geografi': {
        'keywords': ['wilayah', 'provinsi', 'ibu kota', 'letak', 'pulau'],
        'tip': '''Tips menjawab soal geografi TWK:
1. Hafalkan provinsi dan ibu kota Indonesia
2. Pahami posisi strategis Indonesia
3. Ketahui pulau-pulau besar di Indonesia
4. Pahami batas wilayah Indonesia
5. Ketahui sumber daya alam per wilayah
6. Kaitkan geografi dengan pembangunan nasional'''
    },
    'psikotes': {
        'keywords': ['psikologi', 'karakter', 'kepribadian', 'emosional'],
        'tip': '''Tips menjawab soal psikotes:
1. Jawab dengan jujur dan konsisten
2. Jangan berusaha menjawab sesuai keinginan penguji
3. Pilih jawaban yang mencerminkan kepribadian Anda
4. Hindari jawaban ekstrem (sangat setuju/sangat tidak setuju)
5. Pilih jawaban moderat jika ragu
6. Konsistensi jawaban sangat penting'''
    }
}

CATEGORY_MATERIALS = {
    'TWK': {
        'materi': '''Materi Tes Wawasan Kebangsaan (TWK):

1. Nasionalisme:
   - Cinta tanah air dan kesetiaan pada NKRI
   - Pengorbanan untuk bangsa dan negara
   - Menjaga persatuan dan kesatuan bangsa
   - Menghargai jasa pahlawan

2. Integritas:
   - Jujur dan konsisten dalam perilaku
   - Menjunjung tinggi nilai moral
   - Bertanggung jawab atas tindakan
   - Anti-korupsi dan anti-kolusi

3. Bela Negara:
   - Siap membela negara dari ancaman
   - Memiliki kesadaran pertahanan
   - Menghargai jasa TNI dan Polri
   - Partisipasi dalam pertahanan negara

4. Pilar Negara:
   - Pancasila sebagai dasar negara
   - UUD 1945 sebagai konstitusi
   - NKRI sebagai bentuk negara
   - Bhinneka Tunggal Ika sebagai semboyan

5. Bahasa Indonesia:
   - Penggunaan bahasa Indonesia yang baik dan benar
   - Pemahaman tata bahasa
   - Kosakata baku
   - Ejaan yang disempurnakan''',
        'referensi': 'Buku Pendidikan Pancasila, UUD 1945, Sejarah Indonesia'
    },
    'TIU': {
        'materi': '''Materi Tes Intelegensi Umum (TIU):

1. Kemampuan Verbal:
   - Sinonim: kata dengan makna sama
   - Antonim: kata dengan makna berlawanan
   - Analogi: hubungan antar-kata
   - Pemahaman bacaan

2. Kemampuan Numerik:
   - Deret angka: pola matematika
   - Aritmatika: hitungan dasar
   - Persentase dan perbandingan
   - Geometri dasar

3. Kemampuan Logika:
   - Silogisme: penarikan kesimpulan
   - Analisis: pemecahan masalah
   - Penalaran: logika berpikir
   - Deduksi dan induksi''',
        'referensi': 'Buku Logika Matematika, Psikologi Kognitif'
    },
    'TKP': {
        'materi': '''Materi Tes Karakteristik Pribadi (TKP):

1. Sikap Kerja:
   - Disiplin dan tanggung jawab
   - Kerjasama dalam tim
   - Inisiatif dan kreativitas
   - Etos kerja tinggi

2. Perilaku Sosial:
   - Kemampuan beradaptasi
   - Komunikasi efektif
   - Toleransi dan penghormatan
   - Empati terhadap orang lain

3. Kepemimpinan:
   - Kemampuan memimpin
   - Pengambilan keputusan
   - Motivasi diri dan orang lain
   - Manajemen konflik

4. Integritas Moral:
   - Kejujuran dan transparansi
   - Konsistensi perilaku
   - Etika profesional
   - Tanggung jawab moral''',
        'referensi': 'Buku Psikologi Industri, Tes Psikologi'
    },
    'TPA': {
        'materi': '''Materi Tes Potensi Akademik (TPA):

1. Matematika:
   - Aljabar dasar
   - Geometri
   - Statistik dasar
   - Trigonometri dasar

2. Bahasa:
   - Bahasa Indonesia
   - Bahasa Inggris
   - Pemahaman bacaan
   - Struktur kalimat

3. Sains:
   - Fisika dasar
   - Kimia dasar
   - Biologi dasar
   - IPA terpadu''',
        'referensi': 'Buku Matematika SMA, Fisika SMA, Kimia SMA, Biologi SMA'
    },
    'PSIKOLOGIS': {
        'materi': '''Materi Tes Psikologis:

1. Kepribadian:
   - Karakter dan temperamen
   - Motivasi dan emosi
   - Kecerdasan emosional
   - Adaptasi lingkungan

2. Mental:
   - Kestabilan emosi
   - Ketahanan stres
   - Konsentrasi dan fokus
   - Keseimbangan mental

3. Sosial:
   - Interaksi sosial
   - Komunikasi
   - Kerjasama
   - Empati''',
        'referensi': 'Buku Psikologi Umum, Tes Psikologi'
    }
}

def connect_database():
    """Connect to MySQL database"""
    try:
        conn = mysql.connector.connect(**DB_CONFIG)
        print("✅ Database connected successfully")
        return conn
    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        return None

def identify_question_type(question_text):
    """Identify the type of question based on keywords"""
    question_lower = question_text.lower()
    
    for question_type, data in QUESTION_TYPE_TIPS.items():
        for keyword in data['keywords']:
            if keyword in question_lower:
                return question_type
    
    return 'umum'

def get_specific_tip(question_text):
    """Get specific tip based on question type"""
    question_type = identify_question_type(question_text)
    
    if question_type in QUESTION_TYPE_TIPS:
        return QUESTION_TYPE_TIPS[question_type]['tip']
    else:
        return 'Bacalah pertanyaan dengan teliti sebelum menjawab. Perhatikan kata kunci dalam pertanyaan untuk memahami apa yang ditanyakan.'

def update_tips_umum(conn):
    """Update tips_umum table with specific tips"""
    print("\n🔍 Updating tips_umum table with specific tips...")
    
    cursor = conn.cursor()
    
    # Clear existing generic tips
    cursor.execute("DELETE FROM tips_umum WHERE judul IN ('Jangan Terburu-buru', 'Fokus dan Teliti', 'Kerjakan Soal yang Dapat Dijawab', 'Urutan Pengerjaan Materi', 'Tips TIU - Hitung Cepat')")
    
    # Insert specific tips for each question type
    tip_id = 1
    for question_type, data in QUESTION_TYPE_TIPS.items():
        try:
            insert_query = """
            INSERT INTO tips_umum (kategori_id, judul, konten, created_at)
            VALUES (%s, %s, %s, NOW())
            """
            cursor.execute(insert_query, (None, f'Tips {question_type.replace("_", " ").title()}', data['tip']))
            print(f"  ✅ Added tip for {question_type}")
            tip_id += 1
        except Exception as e:
            print(f"  ❌ Error adding tip for {question_type}: {e}")
    
    conn.commit()
    cursor.close()
    
    print(f"✅ Updated tips_umum table with {len(QUESTION_TYPE_TIPS)} specific tips")

def update_bahan_pelajaran(conn):
    """Update bahan_pelajaran with category materials"""
    print("\n🔍 Updating bahan_pelajaran with category materials...")
    
    cursor = conn.cursor()
    
    # Clear generic materials
    cursor.execute("DELETE FROM bahan_pelajaran WHERE judul LIKE 'Pembahasan Soal%'")
    
    # Insert category materials
    for category, data in CATEGORY_MATERIALS.items():
        try:
            # Get category ID
            category_ids = {'TWK': 1, 'TIU': 2, 'TKP': 3, 'TPA': 4, 'PSIKOLOGIS': 5}
            category_id = category_ids.get(category)
            
            insert_query = """
            INSERT INTO bahan_pelajaran (soal_id, kategori_id, judul, konten, tipe, urutan, created_at, updated_at)
            VALUES (NULL, %s, %s, %s, %s, 0, NOW(), NOW())
            """
            cursor.execute(insert_query, (category_id, f'Materi {category}', data['materi'], 'teks'))
            print(f"  ✅ Added material for {category}")
        except Exception as e:
            print(f"  ❌ Error adding material for {category}: {e}")
    
    conn.commit()
    cursor.close()
    
    print(f"✅ Updated bahan_pelajaran with {len(CATEGORY_MATERIALS)} category materials")

def main():
    """Main function to create specific tips"""
    print("="*70)
    print("CREATE SPECIFIC TIPS FOR QUESTION TYPES")
    print("="*70)
    
    conn = connect_database()
    if not conn:
        return
    
    try:
        # Update tips_umum table
        update_tips_umum(conn)
        
        # Update bahan_pelajaran table
        update_bahan_pelajaran(conn)
        
        print("\n" + "="*70)
        print("SUMMARY:")
        print(f"  Added {len(QUESTION_TYPE_TIPS)} specific tips for question types")
        print(f"  Added {len(CATEGORY_MATERIALS)} category learning materials")
        print("="*70)
        
    except Exception as e:
        print(f"❌ Error: {e}")
        conn.rollback()
    finally:
        conn.close()
        print("\n✅ Database connection closed")

if __name__ == "__main__":
    main()
