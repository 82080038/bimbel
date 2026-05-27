#!/usr/bin/env python3
"""
Fix Duplicate Questions in Database
Removes duplicate questions keeping only the first occurrence
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

def connect_database():
    """Connect to MySQL database"""
    try:
        conn = mysql.connector.connect(**DB_CONFIG)
        print("✅ Database connected successfully")
        return conn
    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        return None

def find_duplicate_groups(conn):
    """Find groups of duplicate questions"""
    print("\n🔍 Finding duplicate question groups...")
    
    query = """
    SELECT s1.id as id1, s2.id as id2, s1.pertanyaan
    FROM soal s1
    JOIN soal s2 ON s1.pertanyaan = s2.pertanyaan
    WHERE s1.id < s2.id
    ORDER BY s1.id
    """
    
    cursor = conn.cursor()
    cursor.execute(query)
    duplicates = cursor.fetchall()
    cursor.close()
    
    print(f"✅ Found {len(duplicates)} duplicate pairs")
    return duplicates

def group_duplicates(duplicates):
    """Group duplicates by their content"""
    print("\n🔍 Grouping duplicates...")
    
    groups = {}
    
    for id1, id2, question in duplicates:
        if question not in groups:
            groups[question] = [id1]
        groups[question].append(id2)
    
    print(f"✅ Found {len(groups)} unique duplicate groups")
    return groups

def remove_duplicates(conn, groups):
    """Remove duplicate questions keeping first occurrence"""
    print("\n🔍 Removing duplicates...")
    
    cursor = conn.cursor()
    removed_count = 0
    
    for question, ids in groups.items():
        # Keep the first ID, remove the rest
        keep_id = ids[0]
        remove_ids = ids[1:]
        
        for remove_id in remove_ids:
            try:
                # Check if the question is used in any exam results
                check_query = """
                SELECT COUNT(*) as count FROM hasil_ujian 
                WHERE jawaban_peserta LIKE CONCAT('%', ?, '%')
                """
                cursor.execute(check_query, (str(remove_id),))
                result = cursor.fetchone()
                
                if result[0] == 0:
                    # Safe to delete
                    delete_query = "DELETE FROM soal WHERE id = %s"
                    cursor.execute(delete_query, (remove_id,))
                    removed_count += 1
                    print(f"  Removed duplicate ID: {remove_id}")
                else:
                    print(f"  ⚠️  Skipping ID {remove_id} (used in exam results)")
                    
            except Exception as e:
                print(f"  ❌ Error removing ID {remove_id}: {e}")
    
    conn.commit()
    cursor.close()
    
    print(f"✅ Removed {removed_count} duplicate questions")
    return removed_count

def main():
    """Main function to fix duplicates"""
    print("="*70)
    print("FIX DUPLICATE QUESTIONS")
    print("="*70)
    
    conn = connect_database()
    if not conn:
        return
    
    try:
        # Find duplicates
        duplicates = find_duplicate_groups(conn)
        
        if not duplicates:
            print("\n✅ No duplicates found!")
            return
        
        # Group duplicates
        groups = group_duplicates(duplicates)
        
        # Show some examples
        print("\n📋 Sample duplicate groups:")
        for i, (question, ids) in enumerate(list(groups.items())[:5]):
            print(f"  Group {i+1}: IDs {ids[:5]}... (total {len(ids)} duplicates)")
            print(f"  Question: {question[:80]}...")
        
        # Confirm before removing
        print(f"\n⚠️  WARNING: This will remove {sum(len(ids)-1 for ids in groups.values())} duplicate questions")
        response = input("Continue? (yes/no): ")
        
        if response.lower() != 'yes':
            print("❌ Cancelled")
            return
        
        # Remove duplicates
        removed_count = remove_duplicates(conn, groups)
        
        print("\n" + "="*70)
        print(f"SUMMARY: Removed {removed_count} duplicate questions")
        print("="*70)
        
    except Exception as e:
        print(f"❌ Error: {e}")
        conn.rollback()
    finally:
        conn.close()
        print("\n✅ Database connection closed")

if __name__ == "__main__":
    main()
