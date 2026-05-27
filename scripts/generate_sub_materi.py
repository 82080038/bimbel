#!/usr/bin/env python3
"""
Generate sub_materi for soal without sub_materi
"""
import mysql.connector

def connect_db():
    return mysql.connector.connect(
        host='localhost',
        user='root',
        password='root',
        database='bimbel_db'
    )

def get_sub_materi_by_kategori(kategori_id):
    """Get appropriate sub_materi based on kategori"""
    sub_materi_map = {
        1: "Nasionalisme",  # TWK
        2: "Logika Matematika",  # TIU
        3: "Kepribadian",  # TKP
        4: "Verbal",  # TPA
        5: "Psikotes"  # PSIKOLOGIS
    }
    return sub_materi_map.get(kategori_id, "Umum")

def main():
    conn = connect_db()
    cursor = conn.cursor(dictionary=True)
    
    # Get soal without sub_materi
    cursor.execute("""
        SELECT id, kategori_id
        FROM soal
        WHERE sub_materi IS NULL
    """)
    
    soal_list = cursor.fetchall()
    print(f"Found {len(soal_list)} soal without sub_materi")
    
    updated = 0
    for soal in soal_list:
        sub_materi = get_sub_materi_by_kategori(soal['kategori_id'])
        
        # Update sub_materi
        cursor.execute("""
            UPDATE soal
            SET sub_materi = %s
            WHERE id = %s
        """, (sub_materi, soal['id']))
        
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
