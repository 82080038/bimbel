import json
import random

# Bela Negara questions to add
BELA_NEGARA_QUESTIONS = [
    {
        "kategori_id": 1,
        "pertanyaan": "Tujuan utama bela negara adalah untuk...",
        "opsi_a": "Mewujudkan sikap dan perilaku yang mendukung sistem ketatanegaraan",
        "opsi_b": "Menghancurkan negara lain",
        "opsi_c": "Mengabaikan masalah nasional",
        "opsi_d": "Mencari keuntungan pribadi",
        "opsi_e": "Semua jawaban salah",
        "jawaban_benar": "A",
        "pembahasan": "Tujuan utama bela negara adalah mewujudkan sikap dan perilaku yang mendukung sistem ketatanegaraan"
    },
    {
        "kategori_id": 1,
        "pertanyaan": "Bentuk-bentuk bela negara yang dapat dilakukan warga negara adalah...",
        "opsi_a": "Ikut serta dalam pertahanan dan keamanan negara",
        "opsi_b": "Menghina lambang negara",
        "opsi_c": "Menghindari kewajiban negara",
        "opsi_d": "Membocorkan rahasia negara",
        "opsi_e": "Semua jawaban salah",
        "jawaban_benar": "A",
        "pembahasan": "Bentuk-bentuk bela negara antara lain: ikut serta dalam pertahanan dan keamanan negara"
    },
    {
        "kategori_id": 1,
        "pertanyaan": "Contoh penerapan bela negara dalam kehidupan sehari-hari adalah...",
        "opsi_a": "Mengibarkan bendera merah putih pada hari-hari besar",
        "opsi_b": "Membakar bendera negara",
        "opsi_c": "Mengabaikan lagu kebangsaan",
        "opsi_d": "Merusak fasilitas umum",
        "opsi_e": "Semua jawaban salah",
        "jawaban_benar": "A",
        "pembahasan": "Contoh penerapan bela negara: mengibarkan bendera merah putih pada hari-hari besar"
    },
    {
        "kategori_id": 1,
        "pertanyaan": "Unsur-unsur bela negara meliputi...",
        "opsi_a": "Cinta tanah air, Kesediaan berkorban untuk bangsa, Pengakuan terhadap sistem negara, Kemampuan mempertahankan negara",
        "opsi_b": "Kebencian terhadap negara, Menghancurkan negara, Mengabaikan sistem negara",
        "opsi_c": "Mencari keuntungan pribadi, Mengabaikan kewajiban, Menghina pemerintah",
        "opsi_d": "Tidak peduli dengan nasib negara, Menghina lambang negara",
        "opsi_e": "Semua jawaban salah",
        "jawaban_benar": "A",
        "pembahasan": "Unsur-unsur bela negara: cinta tanah air, kesediaan berkorban untuk bangsa, pengakuan terhadap sistem negara, kemampuan mempertahankan negara"
    },
    {
        "kategori_id": 1,
        "pertanyaan": "Mempertahankan kedaulatan negara merupakan tujuan dari...",
        "opsi_a": "Bela negara",
        "opsi_b": "Korupsi",
        "opsi_c": "Pengkhianatan",
        "opsi_d": "Apathy",
        "opsi_e": "Semua jawaban salah",
        "jawaban_benar": "A",
        "pembahasan": "Mempertahankan kedaulatan negara merupakan tujuan bela negara"
    },
    {
        "kategori_id": 1,
        "pertanyaan": "Menjaga keutuhan wilayah NKRI adalah tanggung jawab...",
        "opsi_a": "Setiap warga negara sebagai bagian dari bela negara",
        "opsi_b": "Hanya militer",
        "opsi_c": "Hanya pemerintah",
        "opsi_d": "Hanya polisi",
        "opsi_e": "Semua jawaban salah",
        "jawaban_benar": "A",
        "pembahasan": "Menjaga keutuhan wilayah NKRI adalah tanggung jawab setiap warga negara sebagai bagian dari bela negara"
    },
    {
        "kategori_id": 1,
        "pertanyaan": "Menghormati lambang-lambang negara merupakan bentuk...",
        "opsi_a": "Bela negara",
        "opsi_b": "Pengkhianatan",
        "opsi_c": "Kriminalitas",
        "opsi_d": "Pelanggaran",
        "opsi_e": "Semua jawaban salah",
        "jawaban_benar": "A",
        "pembahasan": "Menghormati lambang-lambang negara merupakan bentuk bela negara"
    },
    {
        "kategori_id": 1,
        "pertanyaan": "Melestarikan budaya bangsa adalah bagian dari...",
        "opsi_a": "Bela negara",
        "opsi_b": "Penghancuran budaya",
        "opsi_c": "Apathy terhadap budaya",
        "opsi_d": "Penghinaan budaya",
        "opsi_e": "Semua jawaban salah",
        "jawaban_benar": "A",
        "pembahasan": "Melestarikan budaya bangsa adalah bagian dari bela negara"
    },
    {
        "kategori_id": 1,
        "pertanyaan": "Kesediaan berkorban untuk bangsa merupakan unsur dari...",
        "opsi_a": "Bela negara",
        "opsi_b": "Keegoisan",
        "opsi_c": "Kepentingan pribadi",
        "opsi_d": "Ketidakpedulian",
        "opsi_e": "Semua jawaban salah",
        "jawaban_benar": "A",
        "pembahasan": "Kesediaan berkorban untuk bangsa merupakan unsur dari bela negara"
    },
    {
        "kategori_id": 1,
        "pertanyaan": "Menyanyikan lagu Indonesia Raya dengan penuh penghormatan adalah contoh...",
        "opsi_a": "Bela negara",
        "opsi_b": "Ketidakpedulian",
        "opsi_c": "Penghinaan",
        "opsi_d": "Pelanggaran",
        "opsi_e": "Semua jawaban salah",
        "jawaban_benar": "A",
        "pembahasan": "Menyanyikan lagu Indonesia Raya dengan penuh penghormatan adalah contoh bela negara"
    }
]

# Generate SQL INSERT statements
def generate_insert_statements():
    sql_statements = []
    
    for i, question in enumerate(BELA_NEGARA_QUESTIONS, start=1):
        sql = f"""INSERT INTO soal (kategori_id, pertanyaan, opsi_a, opsi_b, opsi_c, opsi_d, opsi_e, jawaban_benar, pembahasan, created_at) 
VALUES ({question['kategori_id']}, '{question['pertanyaan']}', '{question['opsi_a']}', '{question['opsi_b']}', '{question['opsi_c']}', '{question['opsi_d']}', '{question['opsi_e']}', '{question['jawaban_benar']}', '{question['pembahasan']}', NOW());"""
        sql_statements.append(sql)
    
    return sql_statements

# Save to SQL file
def save_to_sql_file():
    sql_statements = generate_insert_statements()
    
    with open('add_bela_negara_questions.sql', 'w', encoding='utf-8') as f:
        f.write("-- Bela Negara Questions for TWK\n")
        f.write("-- Generated on: " + str(random.randint(1000, 9999)) + "\n\n")
        for sql in sql_statements:
            f.write(sql + "\n\n")
    
    print(f"Generated {len(sql_statements)} SQL INSERT statements")
    print("Saved to: add_bela_negara_questions.sql")

if __name__ == "__main__":
    save_to_sql_file()
