#!/usr/bin/env python3
"""
Generate tips for soal without tips
"""
import mysql.connector

def connect_db():
    return mysql.connector.connect(
        host='localhost',
        user='root',
        password='root',
        database='bimbel_db'
    )

def get_tips_by_kategori(kategori_id):
    """Get appropriate tips based on kategori"""
    tips_map = {
        1: "Baca pertanyaan dengan teliti dan pahami konteks sejarah atau kebangsaan.",  # TWK
        2: "Analisis pola atau logika matematika dengan cermat. Gunakan rumus yang sesuai.",  # TIU
        3: "Pilih jawaban yang mencerminkan sikap positif dan profesional.",  # TKP
        4: "Perhatikan sinonim, antonim, atau hubungan kata dalam pertanyaan.",  # TPA
        5: "Jawab dengan jujur sesuai kepribadian Anda."  # PSIKOLOGIS
    }
    return tips_map.get(kategori_id, "Baca pertanyaan dengan teliti sebelum menjawab.")

def main():
    conn = connect_db()
    cursor = conn.cursor(dictionary=True)
    
    # Get soal without tips
    cursor.execute("""
        SELECT id, kategori_id
        FROM soal
        WHERE tips IS NULL
    """)
    
    soal_list = cursor.fetchall()
    print(f"Found {len(soal_list)} soal without tips")
    
    updated = 0
    for soal in soal_list:
        tips = get_tips_by_kategori(soal['kategori_id'])
        
        # Update tips
        cursor.execute("""
            UPDATE soal
            SET tips = %s
            WHERE id = %s
        """, (tips, soal['id']))
        
        updated += 1
        if updated % 100 == 0:
            print(f"Updated {updated} soal...")
            conn.commit()
    
    conn.commit()
    print(f"✅ Total updated: {updated} soal")
    
    cursor.close()
    conn.close()

if __name__ == '__main__':
    main()
