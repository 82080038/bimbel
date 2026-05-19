#!/usr/bin/env python3
"""
Fix Duplicate Questions - Conservative Approach
Removes only exact duplicates keeping only the first occurrence
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

def connect_database():
    """Connect to MySQL database"""
    try:
        conn = mysql.connector.connect(**DB_CONFIG)
        print("✅ Database connected successfully")
        return conn
    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        return None

def find_exact_duplicates(conn):
    """Find groups of exact duplicate questions"""
    print("\n🔍 Finding exact duplicate question groups...")
    
    query = """
    SELECT MIN(id) as keep_id, GROUP_CONCAT(id ORDER BY id) as all_ids, 
           pertanyaan, COUNT(*) as duplicate_count
    FROM soal
    GROUP BY pertanyaan
    HAVING COUNT(*) > 1
    ORDER BY duplicate_count DESC
    """
    
    cursor = conn.cursor()
    cursor.execute(query)
    duplicates = cursor.fetchall()
    cursor.close()
    
    print(f"✅ Found {len(duplicates)} duplicate groups")
    return duplicates

def remove_exact_duplicates(conn, duplicates):
    """Remove exact duplicate questions keeping first occurrence"""
    print("\n🔍 Removing exact duplicates...")
    
    cursor = conn.cursor()
    removed_count = 0
    
    for keep_id, all_ids_str, question, duplicate_count in duplicates:
        all_ids = [int(id_str) for id_str in all_ids_str.split(',')]
        remove_ids = [id for id in all_ids if id != keep_id]
        
        print(f"\n  Question: {question[:60]}...")
        print(f"  Keep ID: {keep_id}, Remove IDs: {remove_ids[:10]}{'...' if len(remove_ids) > 10 else ''}")
        
        for remove_id in remove_ids:
            try:
                # Check if the question is used in any exam results
                check_query = """
                SELECT COUNT(*) as count FROM hasil_ujian 
                WHERE jawaban_peserta LIKE %s
                """
                cursor.execute(check_query, (f'%{remove_id}%',))
                result = cursor.fetchone()
                
                if result[0] == 0:
                    # Safe to delete
                    delete_query = "DELETE FROM soal WHERE id = %s"
                    cursor.execute(delete_query, (remove_id,))
                    removed_count += 1
                    print(f"    ✅ Removed duplicate ID: {remove_id}")
                else:
                    print(f"    ⚠️  Skipping ID {remove_id} (used in {result[0]} exam results)")
                    
            except Exception as e:
                print(f"    ❌ Error removing ID {remove_id}: {e}")
        
        # Commit after each group
        conn.commit()
    
    cursor.close()
    
    print(f"\n✅ Removed {removed_count} duplicate questions")
    return removed_count

def fix_misclassified_questions(conn):
    """Fix potentially misclassified questions"""
    print("\n🔍 Fixing misclassified questions...")
    
    # Load the misclassified questions from the report
    with open('question_analysis_report_20260520_024936.json', 'r', encoding='utf-8') as f:
        report = json.load(f)
    
    misclassified = report['misclassified']
    
    cursor = conn.cursor()
    fixed_count = 0
    
    # Category ID mapping
    category_ids = {
        'TWK': 1,
        'TIU': 2,
        'TKP': 3,
        'TPA': 4,
        'PSIKOLOGIS': 5
    }
    
    for item in misclassified:
        question_id = item['id']
        current_category = item['current_category']
        suggested_category = item['suggested_category']
        keywords = item['keywords_found']
        
        # Only fix if the suggested category makes more sense
        # For now, we'll just log the potential fixes
        print(f"  ID {question_id}: {current_category} → {suggested_category} (keywords: {keywords})")
    
    cursor.close()
    
    print(f"\n✅ Found {len(misclassified)} potentially misclassified questions")
    print(f"   (Manual review recommended before auto-fixing)")
    return misclassified

def main():
    """Main function to fix duplicates conservatively"""
    print("="*70)
    print("FIX DUPLICATE QUESTIONS - CONSERVATIVE APPROACH")
    print("="*70)
    
    conn = connect_database()
    if not conn:
        return
    
    try:
        # Find exact duplicates
        duplicates = find_exact_duplicates(conn)
        
        if not duplicates:
            print("\n✅ No duplicates found!")
            return
        
        # Show summary
        total_duplicates = sum(d[3] - 1 for d in duplicates)
        print(f"\n📊 Summary:")
        print(f"  Total duplicate groups: {len(duplicates)}")
        print(f"  Total duplicate questions to remove: {total_duplicates}")
        
        # Remove duplicates
        removed_count = remove_exact_duplicates(conn, duplicates)
        
        # Fix misclassified
        misclassified = fix_misclassified_questions(conn)
        
        print("\n" + "="*70)
        print(f"SUMMARY:")
        print(f"  Removed {removed_count} duplicate questions")
        print(f"  Found {len(misclassified)} potentially misclassified questions")
        print("="*70)
        
    except Exception as e:
        print(f"❌ Error: {e}")
        conn.rollback()
    finally:
        conn.close()
        print("\n✅ Database connection closed")

if __name__ == "__main__":
    main()
