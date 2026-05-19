#!/usr/bin/env python3
"""
Script to generate SQL INSERT statements for questions based on new materials from internet research.
This script adds questions for:
- TWK: Nasionalisme, Integritas Nasional, Pilar Negara
- TIU: Deret Gambar, Teori Bilangan, Operasi Pecahan
- TKP: Pelayanan Publik, Jejaring Kerja, Sosial Budaya, Teknologi Informasi, Profesionalisme
- TPA: Matematika Dasar, Bahasa Indonesia, Bahasa Inggris
- PSIKOLOGIS: Tes IQ, Logika Aritmatika, Analog Verbal, Wartegg, Spasial, Pauli, Gambar Pohon, EPPS, MBTI
"""

import json
import random
from datetime import datetime

# Database configuration
DB_CONFIG = {
    'host': '127.0.0.1',
    'user': 'root',
    'password': 'root',
    'database': 'ujian_sekolah_kedinasan'
}

# Question templates for new materials
QUESTION_TEMPLATES = {
    'TWK': {
        'nasionalisme': [
            {
                'pertanyaan': 'Nasionalisme dalam konteks TWK SKD CPNS dimaknai sebagai...',
                'opsi_a': 'Kebanggaan berlebihan terhadap bangsa',
                'opsi_b': 'Fanatisme sempit terhadap suku',
                'opsi_c': 'Sikap moderat yang menjunjung persatuan dan menghormati perbedaan',
                'opsi_d': 'Ketaatan mutlak terhadap pemerintah',
                'opsi_e': 'Penolakan terhadap budaya asing',
                'jawaban_benar': 'C',
                'pembahasan': 'Nasionalisme dalam konteks TWK SKD CPNS dimaknai sebagai sikap moderat yang menjunjung persatuan, menghormati perbedaan, dan mengutamakan kepentingan nasional, bukan sebagai kebanggaan berlebihan atau fanatisme sempit.'
            },
            {
                'pertanyaan': 'Tujuan utama nasionalisme adalah untuk...',
                'opsi_a': 'Memperkuat kepentingan kelompok',
                'opsi_b': 'Menjaga keutuhan NKRI',
                'opsi_c': 'Menolak budaya asing',
                'opsi_d': 'Mengutamakan kepentingan pribadi',
                'opsi_e': 'Mengisolasi negara dari dunia',
                'jawaban_benar': 'B',
                'pembahasan': 'Tujuan utama nasionalisme adalah untuk menjaga keutuhan NKRI, mempertahankan kedaulatan negara, memperkuat identitas nasional, dan mendorong warga negara berpartisipasi aktif membangun bangsa.'
            },
            {
                'pertanyaan': 'Nasionalisme Indonesia bersifat kebangsaan artinya...',
                'opsi_a': 'Berdasarkan kesamaan suku',
                'opsi_b': 'Berdasarkan kesamaan agama',
                'opsi_c': 'Berdasarkan kesamaan ras',
                'opsi_d': 'Berdasarkan kesamaan nasib bangsa Indonesia',
                'opsi_e': 'Berdasarkan kesamaan wilayah',
                'jawaban_benar': 'D',
                'pembahasan': 'Nasionalisme Indonesia bersifat kebangsaan, artinya berdasarkan kesamaan nasib bangsa Indonesia, bukan berdasarkan kesamaan suku, agama, atau ras.'
            }
        ],
        'integritas_nasional': [
            {
                'pertanyaan': 'Integritas nasional tercermin dalam sikap...',
                'opsi_a': 'Konsisten antara perkataan dan perbuatan',
                'opsi_b': 'Mengikuti keinginan atasan tanpa pertanyaan',
                'opsi_c': 'Mencari pembenaran atas kesalahan',
                'opsi_d': 'Menyembunyikan informasi penting',
                'opsi_e': 'Mengutamakan kepentingan pribadi',
                'jawaban_benar': 'A',
                'pembahasan': 'Integritas nasional tercermin dalam sikap konsisten antara perkataan dan perbuatan, taat aturan meskipun tidak diawasi, menolak penyimpangan sekecil apa pun, dan berani menanggung risiko demi kebenaran.'
            },
            {
                'pertanyaan': 'Mengapa integritas nasional sangat penting bagi warga negara...',
                'opsi_a': 'Karena meningkatkan popularitas',
                'opsi_b': 'Karena mendapatkan keuntungan pribadi',
                'opsi_c': 'Karena warga negara memegang kepercayaan publik',
                'opsi_d': 'Karena diwajibkan oleh atasan',
                'opsi_e': 'Karena untuk menghindari hukuman',
                'jawaban_benar': 'C',
                'pembahasan': 'Integritas nasional sangat penting bagi warga negara karena warga negara memegang kepercayaan publik, penyimpangan berawal dari runtuhnya integritas, sistem yang baik akan rusak bila dijalankan tanpa integritas, dan negara membutuhkan warga yang kokoh secara moral.'
            }
        ],
        'pilar_negara': [
            {
                'pertanyaan': 'Empat pilar negara meliputi...',
                'opsi_a': 'Pancasila, UUD 1945, NKRI, dan Bhinneka Tunggal Ika',
                'opsi_b': 'Pancasila, UUD 1945, NKRI, dan Garuda Pancasila',
                'opsi_c': 'Pancasila, UUD 1945, NKRI, dan Indonesia Raya',
                'opsi_d': 'Pancasila, UUD 1945, NKRI, dan Merah Putih',
                'opsi_e': 'Pancasila, UUD 1945, NKRI, dan NKRI',
                'jawaban_benar': 'A',
                'pembahasan': 'Empat pilar negara meliputi Pancasila, UUD 1945, NKRI, dan Bhinneka Tunggal Ika. Keempat pilar ini saling terkait dan tidak dapat dipisahkan.'
            },
            {
                'pertanyaan': 'Pancasila berperan sebagai pilar negara karena...',
                'opsi_a': 'Sebagai hukum dasar',
                'opsi_b': 'Sebagai dasar filosofis dan sumber dari segala sumber hukum',
                'opsi_c': 'Sebagai bentuk negara',
                'opsi_d': 'Sebagai semangat persatuan',
                'opsi_e': 'Sebagai lambang negara',
                'jawaban_benar': 'B',
                'pembahasan': 'Pancasila berperan sebagai pilar negara karena berfungsi sebagai dasar filosofis dan sumber dari segala sumber hukum, sebagai ideologi dasar negara Indonesia.'
            }
        ]
    },
    'TIU': {
        'deret_gambar': [
            {
                'pertanyaan': 'Bentuk selanjutnya dalam deret rotasi adalah...',
                'opsi_a': 'Rotasi 90 derajat searah jarum jam',
                'opsi_b': 'Rotasi 90 derajat berlawanan jarum jam',
                'opsi_c': 'Rotasi 180 derajat',
                'opsi_d': 'Tidak ada rotasi',
                'opsi_e': 'Rotasi 45 derajat',
                'jawaban_benar': 'A',
                'pembahasan': 'Dalam deret rotasi, bentuk biasanya berputar 90 derajat searah jarum jam secara konsisten dari satu gambar ke gambar berikutnya.'
            }
        ],
        'teori_bilangan': [
            {
                'pertanyaan': 'Hasil dari 15 + (-8) adalah...',
                'opsi_a': '23',
                'opsi_b': '7',
                'opsi_c': '-7',
                'opsi_d': '-23',
                'opsi_e': '8',
                'jawaban_benar': 'B',
                'pembahasan': '15 + (-8) = 15 - 8 = 7. Penjumlahan bilangan positif dengan negatif sama dengan pengurangan.'
            },
            {
                'pertanyaan': 'Bilangan prima di antara 10 dan 20 adalah...',
                'opsi_a': '10, 12, 14, 16, 18',
                'opsi_b': '11, 13, 17, 19',
                'opsi_c': '12, 15, 18',
                'opsi_d': '13, 15, 17',
                'opsi_e': '11, 15, 17, 19',
                'jawaban_benar': 'B',
                'pembahasan': 'Bilangan prima di antara 10 dan 20 adalah 11, 13, 17, dan 19. Bilangan prima adalah bilangan yang hanya dapat dibagi oleh 1 dan dirinya sendiri.'
            }
        ],
        'operasi_pecahan': [
            {
                'pertanyaan': 'Hasil dari 2/3 + 1/4 adalah...',
                'opsi_a': '3/7',
                'opsi_b': '5/12',
                'opsi_c': '11/12',
                'opsi_d': '8/12',
                'opsi_e': '1/2',
                'jawaban_benar': 'C',
                'pembahasan': '2/3 + 1/4 = (2×4 + 1×3) / (3×4) = (8 + 3) / 12 = 11/12. Samakan penyebut terlebih dahulu.'
            }
        ]
    },
    'TKP': {
        'pelayanan_publik': [
            {
                'pertanyaan': 'Prinsip pelayanan publik yang mengutamakan keterbukaan informasi adalah...',
                'opsi_a': 'Akuntabilitas',
                'opsi_b': 'Transparansi',
                'opsi_c': 'Partisipatif',
                'opsi_d': 'Non-diskriminatif',
                'opsi_e': 'Kepastian hukum',
                'jawaban_benar': 'B',
                'pembahasan': 'Prinsip transparansi mengutamakan keterbukaan informasi dalam pelayanan publik, sehingga masyarakat dapat mengakses informasi dengan mudah.'
            }
        ],
        'jejaring_kerja': [
            {
                'pertanyaan': 'Cara membangun jejaring kerja yang baik adalah...',
                'opsi_a': 'Komunikasi yang efektif',
                'opsi_b': 'Saling menghargai',
                'opsi_c': 'Kolaborasi yang baik',
                'opsi_d': 'Semua jawaban benar',
                'opsi_e': 'Hanya a dan b yang benar',
                'jawaban_benar': 'D',
                'pembahasan': 'Cara membangun jejaring kerja yang baik meliputi komunikasi yang efektif, saling menghargai, kolaborasi yang baik, dan dukungan timbal balik.'
            }
        ],
        'sosial_budaya': [
            {
                'pertanyaan': 'Sikap yang menunjukkan penghargaan terhadap keberagaman adalah...',
                'opsi_a': 'Toleransi terhadap perbedaan',
                'opsi_b': 'Menghargai budaya lain',
                'opsi_c': 'Tidak diskriminatif',
                'opsi_d': 'Mempertahankan persatuan',
                'opsi_e': 'Semua jawaban benar',
                'jawaban_benar': 'E',
                'pembahasan': 'Sikap yang menunjukkan penghargaan terhadap keberagaman meliputi toleransi terhadap perbedaan, menghargai budaya lain, tidak diskriminatif, dan mempertahankan persatuan.'
            }
        ],
        'teknologi_informasi': [
            {
                'pertanyaan': 'Manfaat pemanfaatan TIK dalam pelayanan publik adalah...',
                'opsi_a': 'E-government untuk efisiensi',
                'opsi_b': 'Sistem informasi terpadu',
                'opsi_c': 'Layanan online',
                'opsi_d': 'Digitalisasi arsip',
                'opsi_e': 'Semua jawaban benar',
                'jawaban_benar': 'E',
                'pembahasan': 'Manfaat pemanfaatan TIK dalam pelayanan publik meliputi e-government untuk efisiensi, sistem informasi terpadu, layanan online, dan digitalisasi arsip.'
            }
        ],
        'profesionalisme': [
            {
                'pertanyaan': 'Ciri utama seorang profesional adalah...',
                'opsi_a': 'Kompeten dalam bidangnya',
                'opsi_b': 'Etos kerja tinggi',
                'opsi_c': 'Integritas moral',
                'opsi_d': 'Tanggung jawab',
                'opsi_e': 'Semua jawaban benar',
                'jawaban_benar': 'E',
                'pembahasan': 'Ciri utama seorang profesional meliputi kompeten dalam bidangnya, etos kerja tinggi, integritas moral, tanggung jawab, dan terus belajar dan berkembang.'
            }
        ]
    },
    'TPA': {
        'matematika_dasar': [
            {
                'pertanyaan': 'Jika 2x + 3 = 9, maka nilai x adalah...',
                'opsi_a': '2',
                'opsi_b': '3',
                'opsi_c': '4',
                'opsi_d': '5',
                'opsi_e': '6',
                'jawaban_benar': 'B',
                'pembahasan': '2x + 3 = 9 → 2x = 9 - 3 → 2x = 6 → x = 6/2 → x = 3'
            },
            {
                'pertanyaan': 'Hasil dari 15% dari 200 adalah...',
                'opsi_a': '15',
                'opsi_b': '20',
                'opsi_c': '25',
                'opsi_d': '30',
                'opsi_e': '35',
                'jawaban_benar': 'D',
                'pembahasan': '15% dari 200 = (15/100) × 200 = 0.15 × 200 = 30'
            }
        ],
        'bahasa_indonesia': [
            {
                'pertanyaan': 'Kalimat yang efektif adalah...',
                'opsi_a': 'Saya pergi ke pasar membeli sayur',
                'opsi_b': 'Saya pergi ke pasar untuk membeli sayur',
                'opsi_c': 'Saya membeli sayur di pasar',
                'opsi_d': 'Ke pasar saya pergi membeli sayur',
                'opsi_e': 'Membeli sayur saya pergi ke pasar',
                'jawaban_benar': 'B',
                'pembahasan': 'Kalimat efektif adalah "Saya pergi ke pasar untuk membeli sayur" karena struktur kalimat yang jelas dan menggunakan kata penghubung yang tepat.'
            }
        ],
        'bahasa_inggris': [
            {
                'pertanyaan': 'She ___ to the meeting yesterday (go/went/gone)',
                'opsi_a': 'go',
                'opsi_b': 'went',
                'opsi_c': 'gone',
                'opsi_d': 'going',
                'opsi_e': 'goes',
                'jawaban_benar': 'B',
                'pembahasan': 'She went to the meeting yesterday. Past tense dari "go" adalah "went".'
            }
        ]
    },
    'PSIKOLOGIS': {
        'tes_iq': [
            {
                'pertanyaan': 'Lanjutkan deret angka: 2, 4, 8, 16, ...',
                'opsi_a': '24',
                'opsi_b': '30',
                'opsi_c': '32',
                'opsi_d': '36',
                'opsi_e': '40',
                'jawaban_benar': 'C',
                'pembahasan': 'Deret mengikuti pola perkalian 2: 2×2=4, 4×2=8, 8×2=16, 16×2=32. Jadi angka selanjutnya adalah 32.'
            }
        ],
        'tes_logika_aritmatika': [
            {
                'pertanyaan': 'Angka selanjutnya dari 3, 6, 12, 24, ... adalah',
                'opsi_a': '30',
                'opsi_b': '36',
                'opsi_c': '42',
                'opsi_d': '48',
                'opsi_e': '54',
                'jawaban_benar': 'D',
                'pembahasan': 'Deret mengikuti pola perkalian 2: 3×2=6, 6×2=12, 12×2=24, 24×2=48. Jadi angka selanjutnya adalah 48.'
            }
        ],
        'tes_analog_verbal': [
            {
                'pertanyaan': 'Sinonim dari kata "cepat" adalah',
                'opsi_a': 'lambat',
                'opsi_b': 'pelan',
                'opsi_c': 'kilat',
                'opsi_d': 'tenang',
                'opsi_e': 'santai',
                'jawaban_benar': 'C',
                'pembahasan': 'Sinonim dari kata "cepat" adalah "kilat", yang memiliki makna serupa yaitu sesuatu yang bergerak dengan kecepatan tinggi.'
            }
        ],
        'tes_wartegg': [
            {
                'pertanyaan': 'Tes Wartegg digunakan untuk mengukur...',
                'opsi_a': 'Kecerdasan intelektual',
                'opsi_b': 'Kreativitas dan kepribadian',
                'opsi_c': 'Kemampuan matematika',
                'opsi_d': 'Kemampuan verbal',
                'opsi_e': 'Kemampuan spasial',
                'jawaban_benar': 'B',
                'pembahasan': 'Tes Wartegg digunakan untuk mengukur kreativitas, ketelitian, dan kepribadian peserta melalui gambar pola sederhana yang harus dilanjutkan menjadi gambar utuh.'
            }
        ],
        'tes_spasial': [
            {
                'pertanyaan': 'Tes Spasial menguji kemampuan...',
                'opsi_a': 'Imajinasi visual dan kejelian terhadap bentuk',
                'opsi_b': 'Kemampuan verbal',
                'opsi_c': 'Kemampuan matematika',
                'opsi_d': 'Kemampuan logika',
                'opsi_e': 'Kemampuan memori',
                'jawaban_benar': 'A',
                'pembahasan': 'Tes Spasial menguji kemampuan imajinasi dan kejelian terhadap bentuk atau pola, seperti rotasi bentuk dan susunan pola geometris.'
            }
        ],
        'tes_pauli': [
            {
                'pertanyaan': 'Tes Pauli (Kraepelin) digunakan untuk mengukur...',
                'opsi_a': 'Konsistensi dan daya tahan',
                'opsi_b': 'Kreativitas',
                'opsi_c': 'Kemampuan verbal',
                'opsi_d': 'Kemampuan matematika',
                'opsi_e': 'Kepribadian',
                'jawaban_benar': 'A',
                'pembahasan': 'Tes Pauli (Kraepelin) digunakan untuk mengukur konsistensi, daya tahan, dan tingkat konsentrasi peserta melalui penjumlahan angka yang tersusun vertikal.'
            }
        ],
        'tes_gambar_pohon': [
            {
                'pertanyaan': 'Tes Gambar Pohon digunakan untuk menggali...',
                'opsi_a': 'Aspek emosional dan kepribadian',
                'opsi_b': 'Kemampuan matematika',
                'opsi_c': 'Kemampuan verbal',
                'opsi_d': 'Kecerdasan intelektual',
                'opsi_e': 'Kemampuan spasial',
                'jawaban_benar': 'A',
                'pembahasan': 'Tes Gambar Pohon digunakan untuk menggali aspek psikologis yang lebih dalam, seperti aspek emosional, kepribadian, dan persepsi individu terhadap lingkungan sosial.'
            }
        ],
        'tes_epps': [
            {
                'pertanyaan': 'Tes EPPS digunakan untuk mengukur...',
                'opsi_a': 'Kecenderungan kepribadian dan preferensi',
                'opsi_b': 'Kecerdasan intelektual',
                'opsi_c': 'Kemampuan matematika',
                'opsi_d': 'Kemampuan verbal',
                'opsi_e': 'Kemampuan spasial',
                'jawaban_benar': 'A',
                'pembahasan': 'Tes Edward Personal Preference Schedule (EPPS) digunakan untuk mengukur kecenderungan kepribadian dan preferensi seseorang melalui pernyataan verbal.'
            }
        ],
        'tes_mbti': [
            {
                'pertanyaan': 'Tes MBTI mengukur dimensi kepribadian...',
                'opsi_a': 'Introversi-Ekstroversi, Penginderaan-Intuisi, Pemikiran-Perasaan, Penilaian-Persepsi',
                'opsi_b': 'Hanya introversi-ekstroversi',
                'opsi_c': 'Hanya penginderaan-intuisi',
                'opsi_d': 'Hanya pemikiran-perasaan',
                'opsi_e': 'Hanya penilaian-persepsi',
                'jawaban_benar': 'A',
                'pembahasan': 'Tes MBTI mengukur dimensi kepribadian seperti introversi-ekstroversi, penginderaan-intuisi, pemikiran-perasaan, dan penilaian-persepsi untuk memahami tipe kepribadian dan potensi seseorang.'
            }
        ]
    }
}

def generate_sql_insert(category, tipe_soal, question_data):
    """Generate SQL INSERT statement for a single question."""
    timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    
    # Map category to kategori_id
    category_map = {
        'TWK': 1,
        'TIU': 2,
        'TKP': 3,
        'TPA': 4,
        'PSIKOLOGIS': 5
    }
    
    kategori_id = category_map.get(category, 1)
    
    sql = f"""INSERT INTO soal (kategori_id, tipe_soal, pertanyaan, opsi_a, opsi_b, opsi_c, opsi_d, opsi_e, jawaban_benar, pembahasan, created_at) 
VALUES ({kategori_id}, '{tipe_soal}', '{question_data['pertanyaan']}', '{question_data['opsi_a']}', '{question_data['opsi_b']}', '{question_data['opsi_c']}', '{question_data['opsi_d']}', '{question_data['opsi_e']}', '{question_data['jawaban_benar']}', '{question_data['pembahasan']}', '{timestamp}');"""
    
    return sql

def main():
    """Generate SQL INSERT statements for all new materials."""
    output_file = 'c:\\xampp\\htdocs\\bimbel\\scripts\\add_internet_materials_questions.sql'
    
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write("-- SQL INSERT statements for questions based on new materials from internet research\n")
        f.write(f"-- Generated on {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n\n")
        
        for category, materials in QUESTION_TEMPLATES.items():
            for tipe_soal, questions in materials.items():
                for question in questions:
                    sql = generate_sql_insert(category, tipe_soal, question)
                    f.write(sql + '\n\n')
        
        f.write(f"-- Total questions: {sum(len(questions) for materials in QUESTION_TEMPLATES.values() for questions in materials.values())}\n")
    
    print(f"SQL file generated: {output_file}")
    print(f"Total questions: {sum(len(questions) for materials in QUESTION_TEMPLATES.values() for questions in materials.values())}")

if __name__ == '__main__':
    main()
