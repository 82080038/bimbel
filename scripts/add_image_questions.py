#!/usr/bin/env python3
"""
Script untuk menambahkan soal bergambar berdasarkan materi
Membuat template soal dengan placeholder untuk gambar
"""

import mysql.connector
from datetime import datetime

# Database configuration
DB_CONFIG = {
    'host': '127.0.0.1',
    'user': 'root',
    'password': 'root',
    'database': 'ujian_sekolah_kedinasan',
    'charset': 'utf8mb4'
}

# Template soal bergambar untuk materi yang relevan
IMAGE_QUESTION_TEMPLATES = {
    # TIU - Spasial Reasoning (paling relevan untuk soal gambar)
    6: {
        'Bentuk Geometri': [
            {
                'pertanyaan': 'Perhatikan gambar di atas. Bentuk geometri apa yang ditunjukkan?',
                'opsi_a': 'Segitiga',
                'opsi_b': 'Persegi',
                'opsi_c': 'Lingkaran',
                'opsi_d': 'Trapesium',
                'opsi_e': 'Jajargenjang',
                'jawaban': 'A',
                'pembahasan': 'Gambar menunjukkan bentuk segitiga dengan tiga sisi dan tiga sudut.',
                'gambar_pertanyaan': 'uploads/soal/geometri_segitiga.jpg'
            },
            {
                'pertanyaan': 'Berdasarkan gambar di atas, berapakah jumlah sudut pada bangun tersebut?',
                'opsi_a': '3',
                'opsi_b': '4',
                'opsi_c': '5',
                'opsi_d': '6',
                'opsi_e': '8',
                'jawaban': 'B',
                'pembahasan': 'Bangun pada gambar adalah persegi panjang yang memiliki 4 sudut.',
                'gambar_pertanyaan': 'uploads/soal/persegi_panjang.jpg'
            }
        ],
        'Kubus dan Balok': [
            {
                'pertanyaan': 'Perhatikan gambar kubus di atas. Berapakah jumlah rusuk kubus tersebut?',
                'opsi_a': '6',
                'opsi_b': '8',
                'opsi_c': '10',
                'opsi_d': '12',
                'opsi_e': '16',
                'jawaban': 'D',
                'pembahasan': 'Kubus memiliki 12 rusuk (12 garis tepi).',
                'gambar_pertanyaan': 'uploads/soal/kubus.jpg'
            },
            {
                'pertanyaan': 'Gambar di atas menunjukkan balok. Berapakah jumlah sisi balok?',
                'opsi_a': '4',
                'opsi_b': '5',
                'opsi_c': '6',
                'opsi_d': '8',
                'opsi_e': '12',
                'jawaban': 'C',
                'pembahasan': 'Balok memiliki 6 sisi (sisi depan, belakang, kiri, kanan, atas, bawah).',
                'gambar_pertanyaan': 'uploads/soal/balok.jpg'
            }
        ],
        'Rotasi dan Putaran': [
            {
                'pertanyaan': 'Perhatikan gambar di atas. Jika gambar tersebut diputar 90 derajat searah jarum jam, bagaimana bentuknya?',
                'opsi_a': 'Opsi A',
                'opsi_b': 'Opsi B',
                'opsi_c': 'Opsi C',
                'opsi_d': 'Opsi D',
                'opsi_e': 'Opsi E',
                'jawaban': 'B',
                'pembahasan': 'Rotasi 90 derajat searah jarum jam akan mengubah posisi gambar seperti pada opsi B.',
                'gambar_pertanyaan': 'uploads/soal/rotasi_90.jpg',
                'gambar_opsi_a': 'uploads/soal/rotasi_opsi_a.jpg',
                'gambar_opsi_b': 'uploads/soal/rotasi_opsi_b.jpg',
                'gambar_opsi_c': 'uploads/soal/rotasi_opsi_c.jpg',
                'gambar_opsi_d': 'uploads/soal/rotasi_opsi_d.jpg',
                'gambar_opsi_e': 'uploads/soal/rotasi_opsi_e.jpg'
            }
        ],
        'Cermin dan Refleksi': [
            {
                'pertanyaan': 'Perhatikan gambar di atas. Manakah yang merupakan bayangan cermin dari gambar tersebut?',
                'opsi_a': 'Opsi A',
                'opsi_b': 'Opsi B',
                'opsi_c': 'Opsi C',
                'opsi_d': 'Opsi D',
                'opsi_e': 'Opsi E',
                'jawaban': 'C',
                'pembahasan': 'Bayangan cermin menunjukkan pencerminan horizontal dari gambar asli.',
                'gambar_pertanyaan': 'uploads/soal/cermin_asli.jpg',
                'gambar_opsi_a': 'uploads/soal/cermin_a.jpg',
                'gambar_opsi_b': 'uploads/soal/cermin_b.jpg',
                'gambar_opsi_c': 'uploads/soal/cermin_c.jpg',
                'gambar_opsi_d': 'uploads/soal/cermin_d.jpg',
                'gambar_opsi_e': 'uploads/soal/cermin_e.jpg'
            }
        ],
        'Lipatan dan Folding': [
            {
                'pertanyaan': 'Perhatikan gambar kertas yang dilipat di atas. Bagaimana bentuk kertas setelah dibuka?',
                'opsi_a': 'Opsi A',
                'opsi_b': 'Opsi B',
                'opsi_c': 'Opsi C',
                'opsi_d': 'Opsi D',
                'opsi_e': 'Opsi E',
                'jawaban': 'A',
                'pembahasan': 'Lipatan kertas menghasilkan pola simetris seperti pada opsi A.',
                'gambar_pertanyaan': 'uploads/soal/lipatan.jpg',
                'gambar_opsi_a': 'uploads/soal/lipatan_a.jpg',
                'gambar_opsi_b': 'uploads/soal/lipatan_b.jpg',
                'gambar_opsi_c': 'uploads/soal/lipatan_c.jpg',
                'gambar_opsi_d': 'uploads/soal/lipatan_d.jpg',
                'gambar_opsi_e': 'uploads/soal/lipatan_e.jpg'
            }
        ],
        'Pola Spasial': [
            {
                'pertanyaan': 'Perhatikan pola gambar di atas. Manakah yang melanjutkan pola tersebut?',
                'opsi_a': 'Opsi A',
                'opsi_b': 'Opsi B',
                'opsi_c': 'Opsi C',
                'opsi_d': 'Opsi D',
                'opsi_e': 'Opsi E',
                'jawaban': 'D',
                'pembahasan': 'Pola menunjukkan rotasi berurutan 45 derajat, sehingga jawaban adalah opsi D.',
                'gambar_pertanyaan': 'uploads/soal/pola_spatial.jpg',
                'gambar_opsi_a': 'uploads/soal/pola_a.jpg',
                'gambar_opsi_b': 'uploads/soal/pola_b.jpg',
                'gambar_opsi_c': 'uploads/soal/pola_c.jpg',
                'gambar_opsi_d': 'uploads/soal/pola_d.jpg',
                'gambar_opsi_e': 'uploads/soal/pola_e.jpg'
            }
        ]
    },
    # TPA - Spasial
    12: {
        'Bangun Ruang': [
            {
                'pertanyaan': 'Perhatikan gambar tabung di atas. Berapakah volume tabung jika jari-jari = 7 cm dan tinggi = 10 cm?',
                'opsi_a': '1540 cm³',
                'opsi_b': '220 cm³',
                'opsi_c': '440 cm³',
                'opsi_d': '154 cm³',
                'opsi_e': '770 cm³',
                'jawaban': 'A',
                'pembahasan': 'Volume tabung = π × r² × t = 22/7 × 7² × 10 = 1540 cm³',
                'gambar_pertanyaan': 'uploads/soal/tabung.jpg'
            },
            {
                'pertanyaan': 'Gambar di atas menunjukkan kerucut. Berapakah luas permukaan kerucut jika jari-jari = 6 cm dan garis pelukis = 10 cm?',
                'opsi_a': '96π cm²',
                'opsi_b': '60π cm²',
                'opsi_c': '36π cm²',
                'opsi_d': '100π cm²',
                'opsi_e': '120π cm²',
                'jawaban': 'A',
                'pembahasan': 'Luas permukaan = π × r × (r + s) = π × 6 × (6 + 10) = 96π cm²',
                'gambar_pertanyaan': 'uploads/soal/kerucut.jpg'
            }
        ],
        'Volume dan Luas': [
            {
                'pertanyaan': 'Perhatikan gambar bola di atas. Berapakah volume bola jika jari-jari = 7 cm?',
                'opsi_a': '1437.33 cm³',
                'opsi_b': '2156 cm³',
                'opsi_c': '1078 cm³',
                'opsi_d': '718.67 cm³',
                'opsi_e': '359.33 cm³',
                'jawaban': 'A',
                'pembahasan': 'Volume bola = 4/3 × π × r³ = 4/3 × 22/7 × 7³ = 1437.33 cm³',
                'gambar_pertanyaan': 'uploads/soal/bola.jpg'
            }
        ],
        'Proyeksi': [
            {
                'pertanyaan': 'Perhatikan gambar 3D di atas. Manakah yang merupakan proyeksi 2D dari gambar tersebut?',
                'opsi_a': 'Opsi A',
                'opsi_b': 'Opsi B',
                'opsi_c': 'Opsi C',
                'opsi_d': 'Opsi D',
                'opsi_e': 'Opsi E',
                'jawaban': 'B',
                'pembahasan': 'Proyeksi 2D menunjukkan pandangan dari atas (top view) seperti pada opsi B.',
                'gambar_pertanyaan': 'uploads/soal/proyeksi_3d.jpg',
                'gambar_opsi_a': 'uploads/soal/proyeksi_a.jpg',
                'gambar_opsi_b': 'uploads/soal/proyeksi_b.jpg',
                'gambar_opsi_c': 'uploads/soal/proyeksi_c.jpg',
                'gambar_opsi_d': 'uploads/soal/proyeksi_d.jpg',
                'gambar_opsi_e': 'uploads/soal/proyeksi_e.jpg'
            }
        ],
        'Rotasi 3D': [
            {
                'pertanyaan': 'Perhatikan gambar kubus di atas. Jika diputar 90 derajat pada sumbu horizontal, bagaimana bentuknya?',
                'opsi_a': 'Opsi A',
                'opsi_b': 'Opsi B',
                'opsi_c': 'Opsi C',
                'opsi_d': 'Opsi D',
                'opsi_e': 'Opsi E',
                'jawaban': 'C',
                'pembahasan': 'Rotasi 90 derajat pada sumbu horizontal mengubah posisi wajah kubus seperti pada opsi C.',
                'gambar_pertanyaan': 'uploads/soal/kubus_rotasi.jpg',
                'gambar_opsi_a': 'uploads/soal/kubus_rot_a.jpg',
                'gambar_opsi_b': 'uploads/soal/kubus_rot_b.jpg',
                'gambar_opsi_c': 'uploads/soal/kubus_rot_c.jpg',
                'gambar_opsi_d': 'uploads/soal/kubus_rot_d.jpg',
                'gambar_opsi_e': 'uploads/soal/kubus_rot_e.jpg'
            }
        ]
    },
    # TWK - Geografi Indonesia (peta/visual)
    3: {
        'Pulau-Pulau Besar': [
            {
                'pertanyaan': 'Perhatikan peta Indonesia di atas. Pulau manakah yang ditunjukkan dengan nomor 1?',
                'opsi_a': 'Sumatera',
                'opsi_b': 'Jawa',
                'opsi_c': 'Kalimantan',
                'opsi_d': 'Sulawesi',
                'opsi_e': 'Papua',
                'jawaban': 'A',
                'pembahasan': 'Pulau yang ditunjukkan dengan nomor 1 adalah Pulau Sumatera di bagian barat Indonesia.',
                'gambar_pertanyaan': 'uploads/soal/peta_indonesia.jpg'
            },
            {
                'pertanyaan': 'Berdasarkan peta di atas, provinsi manakah yang berada di posisi nomor 2?',
                'opsi_a': 'DKI Jakarta',
                'opsi_b': 'Jawa Barat',
                'opsi_c': 'Jawa Tengah',
                'opsi_d': 'Jawa Timur',
                'opsi_e': 'Banten',
                'jawaban': 'C',
                'pembahasan': 'Posisi nomor 2 menunjukkan provinsi Jawa Tengah di pulau Jawa.',
                'gambar_pertanyaan': 'uploads/soal/peta_jawa.jpg'
            }
        ],
        'Gunung dan Pegunungan': [
            {
                'pertanyaan': 'Perhatikan peta topografi di atas. Gunung berapi manakah yang ditunjukkan dengan titik merah?',
                'opsi_a': 'Gunung Merapi',
                'opsi_b': 'Gunung Rinjani',
                'opsi_c': 'Gunung Bromo',
                'opsi_d': 'Gunung Semeru',
                'opsi_e': 'Gunung Kerinci',
                'jawaban': 'A',
                'pembahasan': 'Titik merah pada peta menunjukkan lokasi Gunung Merapi di Jawa Tengah.',
                'gambar_pertanyaan': 'uploads/soal/peta_gunung.jpg'
            }
        ]
    },
    # TWK - Sejarah Indonesia (gambar sejarah)
    2: {
        'Proklamasi Kemerdekaan': [
            {
                'pertanyaan': 'Perhatikan foto di atas. Siapakah tokoh yang sedang membacakan teks Proklamasi?',
                'opsi_a': 'Mohammad Hatta',
                'opsi_b': 'Ir. Soekarno',
                'opsi_c': 'Mr. Soepomo',
                'opsi_d': 'Ki Hajar Dewantara',
                'opsi_e': 'Drs. Mohammad Hatta',
                'jawaban': 'B',
                'pembahasan': 'Ir. Soekarno adalah yang membacakan teks Proklamasi Kemerdekaan Indonesia pada 17 Agustus 1945.',
                'gambar_pertanyaan': 'uploads/soal/proklamasi.jpg'
            }
        ],
        'Pahlawan Nasional': [
            {
                'pertanyaan': 'Perhatikan foto pahlawan di atas. Siapakah nama pahlawan tersebut?',
                'opsi_a': 'Diponegoro',
                'opsi_b': 'Tuanku Imam Bonjol',
                'opsi_c': 'Teuku Umar',
                'opsi_d': 'Cut Nyak Dhien',
                'opsi_e': 'Sultan Hasanuddin',
                'jawaban': 'A',
                'pembahasan': 'Foto menunjukkan Pangeran Diponegoro, pahlawan perang Jawa.',
                'gambar_pertanyaan': 'uploads/soal/diponegoro.jpg'
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

def save_question_to_db(question_data, kategori_id, topic_id, materi_id):
    """Simpan soal ke database"""
    conn = mysql.connector.connect(**DB_CONFIG)
    cursor = conn.cursor()
    
    query = """
    INSERT INTO soal (kategori_id, topic_id, materi_id, pertanyaan, opsi_a, opsi_b, opsi_c, opsi_d, opsi_e, jawaban_benar, pembahasan, gambar_pertanyaan, gambar_opsi_a, gambar_opsi_b, gambar_opsi_c, gambar_opsi_d, gambar_opsi_e, gambar_pembahasan, created_at)
    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
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
        question_data.get('gambar_pertanyaan', None),
        question_data.get('gambar_opsi_a', None),
        question_data.get('gambar_opsi_b', None),
        question_data.get('gambar_opsi_c', None),
        question_data.get('gambar_opsi_d', None),
        question_data.get('gambar_opsi_e', None),
        question_data.get('gambar_pembahasan', None),
        datetime.now()
    ))
    
    conn.commit()
    soal_id = cursor.lastrowid
    
    cursor.close()
    conn.close()
    
    return soal_id

def main():
    print("=== TAMBAH SOAL BERGAMBAR BERDASARKAN MATERI ===\n")
    
    # Ambil daftar materi
    materi_list = get_materi_list()
    print(f"Ditemukan {len(materi_list)} materi\n")
    
    if not materi_list:
        print("Tidak ada materi yang ditemukan")
        return
    
    # Generate soal bergambar untuk materi yang relevan
    total_generated = 0
    total_skipped = 0
    
    for materi in materi_list:
        materi_id = materi['id']
        materi_nama = materi['nama_materi']
        kategori_id = materi['kategori_id']
        topic_id = materi['topic_id']
        kategori_nama = materi['nama_kategori']
        topic_nama = materi['nama_topik']
        
        # Cek apakah ada template untuk materi ini
        if topic_id in IMAGE_QUESTION_TEMPLATES and materi_nama in IMAGE_QUESTION_TEMPLATES[topic_id]:
            templates = IMAGE_QUESTION_TEMPLATES[topic_id][materi_nama]
            
            print(f"Memproses: {kategori_nama} - {topic_nama} - {materi_nama}")
            
            for template in templates:
                # Simpan ke database
                soal_id = save_question_to_db(template, kategori_id, topic_id, materi_id)
                print(f"  ✓ Soal ID {soal_id} berhasil dibuat (dengan placeholder gambar)")
                total_generated += 1
        else:
            total_skipped += 1
    
    print(f"\n=== HASIL ===")
    print(f"Total soal bergambar yang ditambahkan: {total_generated}")
    print(f"Total materi yang dilewati (tanpa template): {total_skipped}")
    print(f"\n=== CATATAN ===")
    print("Soal yang ditambahkan menggunakan placeholder untuk path gambar.")
    print("Anda perlu:")
    print("1. Menyiapkan gambar yang sesuai")
    print("2. Menyimpan gambar di folder: uploads/soal/")
    print("3. Update path gambar di database jika nama file berbeda")
    print("\nContoh gambar yang diperlukan:")
    print("- geometri_segitiga.jpg")
    print("- kubus.jpg")
    print("- balok.jpg")
    print("- rotasi_90.jpg")
    print("- cermin_asli.jpg")
    print("- lipatan.jpg")
    print("- pola_spatial.jpg")
    print("- tabung.jpg")
    print("- kerucut.jpg")
    print("- bola.jpg")
    print("- peta_indonesia.jpg")
    print("- proklamasi.jpg")
    print("- diponegoro.jpg")
    print("- Dan lainnya sesuai dengan path di database")

if __name__ == "__main__":
    main()
