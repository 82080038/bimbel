#!/usr/bin/env python3
"""
Generate basic pembahasan for soal without explanations
"""
import mysql.connector
import re

def connect_db():
    return mysql.connector.connect(
        host='localhost',
        user='root',
        password='root',
        database='bimbel_db'
    )

def generate_math_explanation(pertanyaan, opsi_a, opsi_b, opsi_c, opsi_d, opsi_e, jawaban):
    """Generate basic explanation for math questions"""
    explanation = ""
    
    # Check for common math patterns
    if "x + y" in pertanyaan and "xy" in pertanyaan and "x² + y²" in pertanyaan:
        explanation = "Gunakan rumus: x² + y² = (x + y)² - 2xy. Substitusi nilai yang diketahui."
    elif "segitiga" in pertanyaan.lower() and "luas" in pertanyaan.lower():
        explanation = "Gunakan rumus luas segitiga: L = ½ × alas × tinggi. Cek apakah segitiga siku-siku menggunakan teorema Pythagoras."
    elif "dipilih" in pertanyaan.lower() and "cara" in pertanyaan.lower():
        explanation = "Gunakan rumus kombinasi: C(n, r) = n! / (r! × (n-r)!)."
    elif "f(x)" in pertanyaan and "nilai" in pertanyaan:
        explanation = "Substitusi nilai x ke dalam fungsi f(x) dan hitung hasilnya."
    elif "lingkaran" in pertanyaan.lower() and "keliling" in pertanyaan.lower():
        explanation = "Gunakan rumus keliling lingkaran: K = π × d atau K = 2 × π × r."
    elif "lingkaran" in pertanyaan.lower() and "luas" in pertanyaan.lower():
        explanation = "Gunakan rumus luas lingkaran: L = π × r²."
    elif "kubus" in pertanyaan.lower() and "volume" in pertanyaan.lower():
        explanation = "Gunakan rumus volume kubus: V = s³, dimana s adalah panjang rusuk."
    elif "balok" in pertanyaan.lower() and "volume" in pertanyaan.lower():
        explanation = "Gunakan rumus volume balok: V = p × l × t."
    elif "kerucut" in pertanyaan.lower() and "volume" in pertanyaan.lower():
        explanation = "Gunakan rumus volume kerucut: V = ⅓ × π × r² × t."
    elif "tabung" in pertanyaan.lower() and "volume" in pertanyaan.lower():
        explanation = "Gunakan rumus volume tabung: V = π × r² × t."
    elif "bola" in pertanyaan.lower() and "volume" in pertanyaan.lower():
        explanation = "Gunakan rumus volume bola: V = ⁴⁄₃ × π × r³."
    else:
        explanation = f"Jawaban yang benar adalah {jawaban}. Analisis opsi yang tersedia dan pilih yang paling sesuai dengan pertanyaan."
    
    return explanation

def generate_twk_explanation(pertanyaan, jawaban):
    """Generate basic explanation for TWK questions"""
    return f"Jawaban yang benar adalah {jawaban}. Ini berkaitan dengan materi wawasan kebangsaan."

def generate_tiu_explanation(pertanyaan, jawaban):
    """Generate basic explanation for TIU questions"""
    return f"Jawaban yang benar adalah {jawaban}. Analisis pola atau logika dari pertanyaan."

def generate_tkp_explanation(pertanyaan, jawaban):
    """Generate basic explanation for TKP questions"""
    return f"Jawaban yang benar adalah {jawaban}. Pilih jawaban yang paling mencerminkan sikap positif."

def main():
    conn = connect_db()
    cursor = conn.cursor(dictionary=True)
    
    # Get soal without pembahasan
    cursor.execute("""
        SELECT id, kategori_id, pertanyaan, opsi_a, opsi_b, opsi_c, opsi_d, opsi_e, jawaban_benar
        FROM soal
        WHERE pembahasan IS NULL
    """)
    
    soal_list = cursor.fetchall()
    print(f"Found {len(soal_list)} soal without pembahasan")
    
    updated = 0
    for soal in soal_list:
        explanation = ""
        
        if soal['kategori_id'] == 1:  # TWK
            explanation = generate_twk_explanation(soal['pertanyaan'], soal['jawaban_benar'])
        elif soal['kategori_id'] == 2:  # TIU
            explanation = generate_tiu_explanation(soal['pertanyaan'], soal['jawaban_benar'])
        elif soal['kategori_id'] == 3:  # TKP
            explanation = generate_tkp_explanation(soal['pertanyaan'], soal['jawaban_benar'])
        else:  # TPA/PSIKOLOGIS - likely math
            explanation = generate_math_explanation(
                soal['pertanyaan'],
                soal['opsi_a'], soal['opsi_b'], soal['opsi_c'],
                soal['opsi_d'], soal['opsi_e'],
                soal['jawaban_benar']
            )
        
        # Update pembahasan
        cursor.execute("""
            UPDATE soal
            SET pembahasan = %s
            WHERE id = %s
        """, (explanation, soal['id']))
        
        updated += 1
        if updated % 10 == 0:
            print(f"Updated {updated} soal...")
            conn.commit()
    
    conn.commit()
    print(f"✅ Total updated: {updated} soal")
    
    cursor.close()
    conn.close()

if __name__ == '__main__':
    main()
