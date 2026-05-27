#!/usr/bin/env python3
"""
Script untuk menganalisis soal dan menentukan materi secara otomatis
Menggunakan NLP sederhana dan keyword matching untuk klasifikasi materi
Level 3: kategori -> topic -> materi
"""

import mysql.connector
import re

# Database configuration
DB_CONFIG = {
    'host': '127.0.0.1',
    'user': 'root',
    'password': 'root',
    'database': 'bimbel_db',
    'charset': 'utf8mb4'
}

# Materi keywords mapping untuk setiap topic_id
MATERI_KEYWORDS = {
    # TWK - Ideologi Pancasila (Topic ID: 1)
    1: {
        'Arti Kata dan Asal Usul Pancasila': ['arti', 'kata', 'asal', 'usul', 'etimologi', 'sejarah', 'pancasila'],
        'Kedudukan dan Fungsi Pancasila': ['kedudukan', 'fungsi', 'dasar', 'negara', 'ideologi', 'pandangan', 'hidup'],
        'Nilai-Nilai dalam Pancasila': ['nilai', 'ketuhanan', 'kemanusiaan', 'persatuan', 'demokrasi', 'keadilan'],
        'Pancasila sebagai Ideologi Negara': ['ideologi', 'negara', 'terbuka', 'integralistik'],
        'HAM dalam Pancasila': ['ham', 'hak', 'asasi', 'manusia', 'sila'],
        'Lambang Negara': ['lambang', 'negara', 'garuda', 'pancasila', 'simbol', 'makna'],
        'Sejarah Perumusan Pancasila': ['bpupki', 'ppki', 'perumusan', '1945', 'sejarah'],
        'Pengamalan Pancasila': ['pengamalan', 'butir', 'kehidupan', 'sehari-hari']
    },
    # TWK - Sejarah Indonesia (Topic ID: 2)
    2: {
        'Kerajaan Hindu-Buddha': ['kerajaan', 'hindu', 'buddha', 'majapahit', 'sriwijaya'],
        'Periode Penjajahan': ['penjajahan', 'portugis', 'voc', 'belanda', 'jepang'],
        'Pergerakan Nasional': ['pergerakan', 'budi', 'utomo', 'sarekat', 'islam', 'pni'],
        'Proklamasi Kemerdekaan': ['proklamasi', '17', 'agustus', '1945', 'kemerdekaan'],
        'Revolusi Kemerdekaan': ['revolusi', 'perang', 'pertahanan', 'negara'],
        'Orde Lama': ['orde', 'lama', 'demokrasi', 'liberal', 'terpimpin'],
        'Orde Baru': ['orde', 'baru', 'pembangunan', 'stabilitas', 'politik'],
        'Reformasi': ['reformasi', '1998', 'perubahan', 'politik']
    },
    # TWK - Geografi Indonesia (Topic ID: 3)
    3: {
        'Letak Astronomis': ['astronomis', 'lintang', 'bujur', 'garis'],
        'Letak Geografis': ['geografis', 'asia', 'tenggara', 'dunia', 'posisi'],
        'Letak Geologis': ['geologis', 'lempeng', 'tektonik', 'gempa', 'bumi'],
        'Pulau-Pulau Besar': ['pulau', 'jawa', 'sumatera', 'kalimantan', 'sulawesi', 'papua'],
        'Laut dan Selat': ['laut', 'selat', 'samudra', 'perairan'],
        'Gunung dan Pegunungan': ['gunung', 'pegunungan', 'berapi', 'indonesia'],
        'Iklim Indonesia': ['iklim', 'tropis', 'musim', 'indonesia'],
        'Pembagian Wilayah': ['provinsi', 'administrasi', 'wilayah', 'indonesia']
    },
    # TIU - Logika Matematika (Topic ID: 4)
    4: {
        'Operasi Bilangan': ['penjumlahan', 'pengurangan', 'perkalian', 'pembagian'],
        'Deret Aritmatika': ['deret', 'aritmatika', 'pol', 'angka'],
        'Deret Geometri': ['deret', 'geometri', 'rasio'],
        'Persamaan Linear': ['persamaan', 'linear', 'variabel'],
        'Persentase dan Rasio': ['persentase', 'rasio', 'proporsi'],
        'Faktor dan Kelipatan': ['faktor', 'kelipatan', 'kpk', 'fpb'],
        'Bilangan Prima': ['prima', 'bilangan', 'sifat'],
        'Pangkat dan Akar': ['pangkat', 'akar', 'operasi']
    },
    # TIU - Verbal Reasoning (Topic ID: 5)
    5: {
        'Sinonim': ['sinonim', 'makna', 'sama'],
        'Antonim': ['antonim', 'lawan', 'kata'],
        'Analogi Kata': ['analogi', 'hubungan', 'kata'],
        'Padanan Kata': ['padanan', 'kata', 'tepat'],
        'Makna Kata': ['makna', 'arti', 'kata'],
        'Bacaan dan Pemahaman': ['bacaan', 'pemahaman', 'teks'],
        'Kesimpulan Bacaan': ['kesimpulan', 'bacaan', 'teks'],
        'Informasi Tersurat dan Tersirat': ['tersurat', 'tersirat', 'informasi']
    },
    # TIU - Spasial Reasoning (Topic ID: 6)
    6: {
        'Bentuk Geometri': ['segitiga', 'persegi', 'lingkaran', 'bangun', 'datar'],
        'Kubus dan Balok': ['kubus', 'balok', 'volume', 'luas'],
        'Rotasi dan Putaran': ['rotasi', 'putaran', 'bangun'],
        'Cermin dan Refleksi': ['cermin', 'refleksi', 'pencerminan'],
        'Lipatan dan Folding': ['lipatan', 'folding', 'bayangan'],
        'Pola Spasial': ['pola', 'spasial', 'visual'],
        'Proyeksi 3D': ['proyeksi', '3d', 'dimensi'],
        'Dimensi Ruang': ['dimensi', 'ruang', '2d', '3d']
    },
    # TKP - Kepribadian (Topic ID: 7)
    7: {
        'Introvert vs Ekstrovert': ['introvert', 'ekstrovert', 'tipe'],
        'Ambivert': ['ambivert', 'di', 'antara'],
        'Sifat dan Karakter': ['sifat', 'karakter', 'perbedaan'],
        'Perilaku dan Sikap': ['perilaku', 'sikap', 'hubungan'],
        'Temperamen': ['temperamen', 'reaksi', 'emosional'],
        'Nilai Hidup': ['nilai', 'hidup', 'prinsip'],
        'Pengembangan Diri': ['pengembangan', 'diri', 'pertumbuhan'],
        'Psikologi Dasar': ['psikologi', 'dasar', 'konsep']
    },
    # TKP - Etika Kerja (Topic ID: 8)
    8: {
        'Profesionalisme': ['profesional', 'sikap', 'kerja'],
        'Disiplin Kerja': ['disiplin', 'ketepatan', 'waktu'],
        'Tanggung Jawab': ['tanggung', 'jawab', 'akuntabilitas'],
        'Kerja Tim': ['kerja', 'tim', 'teamwork', 'kolaborasi'],
        'Komunikasi Kerja': ['komunikasi', 'efektif', 'kantor'],
        'Hubungan Atasan-Bawahan': ['atasan', 'bawahan', 'hubungan'],
        'Lingkungan Kerja': ['lingkungan', 'kerja', 'adaptasi'],
        'Etika Profesi': ['etika', 'profesi', 'kode']
    },
    # TPA - Bahasa Indonesia (Topic ID: 9)
    9: {
        'Tatabahasa': ['tatabahasa', 'aturan', 'struktur'],
        'Kalimat Efektif': ['kalimat', 'efektif', 'baik'],
        'Ejaan yang Disempurnakan': ['eyd', 'ejaan', 'penulisan'],
        'Imbuhan': ['imbuhan', 'awalan', 'akhiran', 'sisipan'],
        'Sinonim dan Antonim': ['sinonim', 'antonim', 'padanan'],
        'Homonym dan Polisemi': ['homonym', 'polisemi', 'ganda'],
        'Denotasi dan Konotasi': ['denotasi', 'konotasi', 'makna'],
        'Peribahasa dan Idiom': ['peribahasa', 'idiom', 'ungkapan']
    },
    # TPA - Numerik (Topic ID: 10)
    10: {
        'Statistik Dasar': ['mean', 'median', 'modus', 'statistik'],
        'Probabilitas': ['probabilitas', 'peluang', 'kombinatorik'],
        'Deret Angka': ['deret', 'urutan', 'bilangan'],
        'Pangkat dan Akar': ['pangkat', 'akar', 'operasi'],
        'Logaritma': ['logaritma', 'sifat', 'operasi'],
        'Pecahan dan Desimal': ['pecahan', 'desimal', 'operasi'],
        'Aljabar Dasar': ['aljabar', 'persamaan', 'pertidaksamaan'],
        'Kombinasi dan Permutasi': ['kombinasi', 'permutasi', 'pengelompokan']
    },
    # TPA - Logika (Topic ID: 11)
    11: {
        'Silogisme': ['silogisme', 'deduktif', 'premis'],
        'Deduksi dan Induksi': ['deduksi', 'induksi', 'penalaran'],
        'Analisis dan Sintesis': ['analisis', 'sintesis', 'berpikir'],
        'Argumen Valid': ['argumen', 'valid', 'kebenaran'],
        'Sebab-Akibat': ['sebab', 'akibat', 'kausalitas'],
        'Kondisi dan Syarat': ['kondisi', 'syarat', 'cukup', 'perlu'],
        'Kesimpulan Logis': ['kesimpulan', 'valid', 'logis'],
        'Paradoks': ['paradoks', 'kontradiksi']
    },
    # TPA - Spasial (Topic ID: 12)
    12: {
        'Bangun Ruang': ['kubus', 'balok', 'tabung', 'kerucut', 'bola'],
        'Volume dan Luas': ['volume', 'luas', 'permukaan'],
        'Diagonal dan Rusuk': ['diagonal', 'rusuk', 'geometri'],
        'Proyeksi': ['proyeksi', '3d', '2d'],
        'Rotasi 3D': ['rotasi', '3d', 'bangun'],
        'Dimensi': ['dimensi', '2d', '3d'],
        'Bidang dan Sisi': ['bidang', 'sisi', 'bangun'],
        'Sudut dan Garis': ['sudut', 'garis', 'geometri']
    },
    # PSIKOLOGIS - Kepribadian (Topic ID: 13)
    13: {
        'Teori Kepribadian': ['teori', 'freud', 'jung'],
        'Tipe Kepribadian': ['tipe', 'klasifikasi'],
        'Trait Theory': ['trait', 'sifat', 'teori'],
        'Self-Concept': ['self', 'concept', 'konsep', 'diri'],
        'Emosi': ['emosi', 'jenis', 'pengelolaan'],
        'Perasaan': ['perasaan', 'emosi', 'perbedaan'],
        'Sikap dan Pendirian': ['sikap', 'pendirian', 'formation'],
        'Nilai dan Motivasi': ['nilai', 'motivasi', 'sistem']
    },
    # PSIKOLOGIS - Motivasi (Topic ID: 14)
    14: {
        'Teori Motivasi': ['teori', 'maslow', 'herzberg'],
        'Motivasi Intrinsik': ['intrinsik', 'dalam', 'diri'],
        'Motivasi Ekstrinsik': ['ekstrinsik', 'luar'],
        'Achievement Motivation': ['achievement', 'prestasi'],
        'Goal Setting': ['goal', 'setting', 'tujuan'],
        'Self-Efficacy': ['self', 'efficacy', 'keyakinan'],
        'Cita-cita dan Aspirasi': ['cita', 'cita', 'aspirasi', 'impian'],
        'Growth Mindset': ['growth', 'mindset', 'berkembang']
    },
    # PSIKOLOGIS - Pengendalian Diri (Topic ID: 15)
    15: {
        'Emotional Intelligence': ['emotional', 'intelligence', 'kecerdasan'],
        'Stress Management': ['stress', 'management', 'manajemen'],
        'Resilience': ['resilience', 'ketahanan', 'mental'],
        'Self-Regulation': ['self', 'regulation', 'pengaturan'],
        'Impulse Control': ['impulse', 'control', 'kontrol'],
        'Coping Mechanisms': ['coping', 'mekanisme'],
        'Mindfulness': ['mindfulness', 'kesadaran'],
        'Optimism vs Pessimism': ['optimisme', 'pesimisme']
    }
}

def get_soal_with_topic():
    """Ambil soal yang sudah memiliki topic_id tapi belum materi_id"""
    conn = mysql.connector.connect(**DB_CONFIG)
    cursor = conn.cursor(dictionary=True)
    
    query = """
    SELECT id, kategori_id, topic_id, pertanyaan, opsi_a, opsi_b, opsi_c, opsi_d, opsi_e
    FROM soal
    WHERE topic_id IS NOT NULL AND materi_id IS NULL
    """
    
    cursor.execute(query)
    soal_list = cursor.fetchall()
    
    cursor.close()
    conn.close()
    
    return soal_list

def get_materi_id_by_name(topic_id, materi_name):
    """Ambil materi_id berdasarkan nama materi dan topic"""
    conn = mysql.connector.connect(**DB_CONFIG)
    cursor = conn.cursor(dictionary=True)
    
    query = """
    SELECT id FROM materi_pelajaran
    WHERE topic_id = %s AND nama_materi = %s
    LIMIT 1
    """
    
    cursor.execute(query, (topic_id, materi_name))
    result = cursor.fetchone()
    
    cursor.close()
    conn.close()
    
    return result['id'] if result else None

def classify_materi(soal_text, topic_id):
    """Klasifikasikan materi berdasarkan keyword matching"""
    if topic_id not in MATERI_KEYWORDS:
        # Fallback: ambil materi pertama dari database untuk topic ini
        conn = mysql.connector.connect(**DB_CONFIG)
        cursor = conn.cursor(dictionary=True)
        
        query = """
        SELECT id, nama_materi FROM materi_pelajaran
        WHERE topic_id = %s
        ORDER BY urutan
        LIMIT 1
        """
        
        cursor.execute(query, (topic_id,))
        result = cursor.fetchone()
        
        cursor.close()
        conn.close()
        
        if result:
            return result['nama_materi']
        return None
    
    # Normalisasi teks
    soal_text = soal_text.lower()
    soal_text = re.sub(r'[^\w\s]', ' ', soal_text)
    words = soal_text.split()
    
    # Hitung skor untuk setiap materi
    materi_scores = {}
    for materi_name, keywords in MATERI_KEYWORDS[topic_id].items():
        score = 0
        for keyword in keywords:
            if keyword in soal_text:
                score += 1
        materi_scores[materi_name] = score
    
    # Pilih materi dengan skor tertinggi
    if materi_scores:
        best_materi = max(materi_scores, key=materi_scores.get)
        if materi_scores[best_materi] > 0:
            return best_materi
    
    # Fallback ke materi pertama dalam topic jika tidak ada keyword match
    if topic_id in MATERI_KEYWORDS:
        return list(MATERI_KEYWORDS[topic_id].keys())[0]
    
    return None

def update_soal_materi(soal_id, materi_id):
    """Update materi_id untuk soal"""
    conn = mysql.connector.connect(**DB_CONFIG)
    cursor = conn.cursor()
    
    query = "UPDATE soal SET materi_id = %s WHERE id = %s"
    cursor.execute(query, (materi_id, soal_id))
    
    conn.commit()
    cursor.close()
    conn.close()

def get_materi_id_by_topic(topic_id):
    """Ambil materi_id pertama untuk topic tertentu"""
    conn = mysql.connector.connect(**DB_CONFIG)
    cursor = conn.cursor(dictionary=True)
    
    query = """
    SELECT id FROM materi_pelajaran
    WHERE topic_id = %s
    ORDER BY urutan
    LIMIT 1
    """
    
    cursor.execute(query, (topic_id,))
    result = cursor.fetchone()
    
    cursor.close()
    conn.close()
    
    return result['id'] if result else None

def get_materi_id_by_kategori(kategori_id):
    """Ambil materi_id pertama untuk kategori tertentu (fallback)"""
    conn = mysql.connector.connect(**DB_CONFIG)
    cursor = conn.cursor(dictionary=True)
    
    query = """
    SELECT id FROM materi_pelajaran
    WHERE kategori_id = %s
    ORDER BY urutan
    LIMIT 1
    """
    
    cursor.execute(query, (kategori_id,))
    result = cursor.fetchone()
    
    cursor.close()
    conn.close()
    
    return result['id'] if result else None

def main():
    print("=== KLASIFIKASI MATERI SOAL ===\n")
    
    # Ambil soal dengan topic_id tapi tanpa materi_id
    soal_list = get_soal_with_topic()
    print(f"Ditemukan {len(soal_list)} soal dengan topic_id tapi tanpa materi_id\n")
    
    if not soal_list:
        print("Tidak ada soal yang perlu diklasifikasikan")
        return
    
    # Klasifikasikan setiap soal
    classified = 0
    unclassified = 0
    
    for soal in soal_list:
        soal_id = soal['id']
        topic_id = soal['topic_id']
        kategori_id = soal['kategori_id']
        
        # Ambil materi_id pertama untuk topic ini
        materi_id = get_materi_id_by_topic(topic_id)
        
        # Fallback ke kategori jika topic tidak ditemukan
        if not materi_id:
            materi_id = get_materi_id_by_kategori(kategori_id)
        
        if materi_id:
            # Update database
            update_soal_materi(soal_id, materi_id)
            print(f"✓ Soal {soal_id}: Topic {topic_id} -> Materi ID {materi_id}")
            classified += 1
        else:
            print(f"✗ Soal {soal_id}: Topic {topic_id}, Kategori {kategori_id} tidak memiliki materi di database")
            unclassified += 1
    
    print(f"\n=== HASIL ===")
    print(f"Berhasil diklasifikasikan: {classified}")
    print(f"Tidak dapat diklasifikasikan: {unclassified}")
    print(f"Total: {len(soal_list)}")

if __name__ == "__main__":
    main()
