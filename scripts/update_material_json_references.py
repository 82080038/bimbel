#!/usr/bin/env python3
"""
Update Database with JSON Learning Material References
"""

import mysql.connector
import json
from datetime import datetime

# Database configuration
DB_CONFIG = {
    'host': '127.0.0.1',
    'user': 'root',
    'password': 'root',
    'database': 'ujian_sekolah_kedinasan',
    'charset': 'utf8mb4'
}

JSON_MATERIALS = {
    'TWK': 'c:/xampp/htdocs/bimbel/data/learning_materials/twk_comprehensive.json',
    'TIU': 'c:/xampp/htdocs/bimbel/data/learning_materials/tiu_comprehensive.json',
    'TKP': 'c:/xampp/htdocs/bimbel/data/learning_materials/tkp_comprehensive.json',
    'TPA': 'c:/xampp/htdocs/bimbel/data/learning_materials/tpa_comprehensive.json',
    'PSIKOLOGIS': 'c:/xampp/htdocs/bimbel/data/learning_materials/psikologis_comprehensive.json'
}

CATEGORY_IDS = {
    'TWK': 1,
    'TIU': 2,
    'TKP': 3,
    'TPA': 4,
    'PSIKOLOGIS': 5
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

def update_material_references(conn):
    """Update bahan_pelajaran with JSON file references"""
    print("\n🔍 Updating bahan_pelajaran with JSON references...")
    
    cursor = conn.cursor()
    
    # Clear existing category materials
    cursor.execute("DELETE FROM bahan_pelajaran WHERE judul LIKE 'Materi%' AND soal_id IS NULL")
    
    # Insert JSON references
    for category, json_path in JSON_MATERIALS.items():
        try:
            category_id = CATEGORY_IDS[category]
            
            # Read JSON file to get summary
            with open(json_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
            
            summary = f"Materi lengkap {category} dalam format JSON komprehensif. File berisi: {', '.join(data['materi'].keys())}"
            
            insert_query = """
            INSERT INTO bahan_pelajaran (soal_id, kategori_id, judul, konten, tipe, url, urutan, created_at, updated_at)
            VALUES (NULL, %s, %s, %s, %s, %s, 0, NOW(), NOW())
            """
            cursor.execute(insert_query, (category_id, f'Materi {category} (JSON)', summary, 'link', json_path))
            print(f"  ✅ Added JSON reference for {category}: {json_path}")
            
        except Exception as e:
            print(f"  ❌ Error adding reference for {category}: {e}")
    
    conn.commit()
    cursor.close()
    
    print(f"✅ Updated bahan_pelajaran with {len(JSON_MATERIALS)} JSON references")

def display_json_summary():
    """Display summary of JSON materials"""
    print("\n📋 JSON Learning Materials Summary:")
    print("="*70)
    
    for category, json_path in JSON_MATERIALS.items():
        try:
            with open(json_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
            
            print(f"\n📚 {category} - {data['nama_kategori']}")
            print(f"   File: {json_path}")
            print(f"   Deskripsi: {data['deskripsi']}")
            print(f"   Materi: {', '.join(data['materi'].keys())}")
            print(f"   Tags: {', '.join(data['tags'])}")
            print(f"   Version: {data['version']}")
            
        except Exception as e:
            print(f"  ❌ Error reading {category} JSON: {e}")

def main():
    """Main function to update database references"""
    print("="*70)
    print("UPDATE DATABASE WITH JSON LEARNING MATERIAL REFERENCES")
    print("="*70)
    
    conn = connect_database()
    if not conn:
        return
    
    try:
        # Display JSON summary
        display_json_summary()
        
        # Update database references
        update_material_references(conn)
        
        print("\n" + "="*70)
        print("SUMMARY:")
        print(f"  Updated bahan_pelajaran with {len(JSON_MATERIALS)} JSON references")
        print(f"  JSON materials ready for AI question generation")
        print("="*70)
        
    except Exception as e:
        print(f"❌ Error: {e}")
        conn.rollback()
    finally:
        conn.close()
        print("\n✅ Database connection closed")

if __name__ == "__main__":
    main()
