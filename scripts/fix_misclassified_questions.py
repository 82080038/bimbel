#!/usr/bin/env python3
"""
Fix Misclassified Questions
Updates category for questions that are incorrectly classified
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

def load_misclassified():
    """Load misclassified questions from report"""
    with open('question_analysis_report_20260520_024936.json', 'r', encoding='utf-8') as f:
        report = json.load(f)
    return report['misclassified']

def manual_review_questions(misclassified):
    """Manually review and select which questions to fix"""
    print("\n🔍 Manual review of misclassified questions:")
    
    category_ids = {
        'TWK': 1,
        'TIU': 2,
        'TKP': 3,
        'TPA': 4,
        'PSIKOLOGIS': 5
    }
    
    to_fix = []
    
    for item in misclassified:
        question_id = item['id']
        current_category = item['current_category']
        suggested_category = item['suggested_category']
        keywords = item['keywords_found']
        
        # Only fix if the suggestion makes sense
        # Skip questions that are correctly classified despite having some keywords
        if question_id in [1, 476, 598, 770, 976, 1191, 1429]:  # Skip nasionalisme questions - they belong in TWK
            print(f"  ⏭️  Skipping ID {question_id}: {current_category} (nasionalisme belongs in TWK)")
            continue
        
        if question_id in [22]:  # Deret angka - should be TIU, not TPA
            print(f"  ✅ Fixing ID {question_id}: {current_category} → {suggested_category} (deret angka belongs in TIU)")
            to_fix.append({
                'id': question_id,
                'new_category_id': category_ids[suggested_category]
            })
            continue
        
        if question_id in [29]:  # Motivasi kerja - should be TKP
            print(f"  ✅ Fixing ID {question_id}: {current_category} → {suggested_category} (motivasi kerja belongs in TKP)")
            to_fix.append({
                'id': question_id,
                'new_category_id': category_ids[suggested_category]
            })
            continue
        
        if question_id in [3363, 3859, 4356, 4883, 5419, 6003, 6721, 7446]:  # Kimia/Biologi - should be TPA
            print(f"  ✅ Fixing ID {question_id}: {current_category} → {suggested_category} (kimia/biologi belongs in TPA)")
            to_fix.append({
                'id': question_id,
                'new_category_id': category_ids[suggested_category]
            })
            continue
        
        print(f"  ⏭️  Skipping ID {question_id}: {current_category} (requires manual review)")
    
    return to_fix

def fix_categories(conn, to_fix):
    """Update categories for selected questions"""
    print(f"\n🔍 Fixing {len(to_fix)} questions...")
    
    cursor = conn.cursor()
    fixed_count = 0
    
    for item in to_fix:
        question_id = item['id']
        new_category_id = item['new_category_id']
        
        try:
            update_query = "UPDATE soal SET kategori_id = %s WHERE id = %s"
            cursor.execute(update_query, (new_category_id, question_id))
            fixed_count += 1
            print(f"  ✅ Fixed ID {question_id} → category {new_category_id}")
        except Exception as e:
            print(f"  ❌ Error fixing ID {question_id}: {e}")
    
    conn.commit()
    cursor.close()
    
    print(f"\n✅ Fixed {fixed_count} questions")
    return fixed_count

def main():
    """Main function to fix misclassified questions"""
    print("="*70)
    print("FIX MISCLASSIFIED QUESTIONS")
    print("="*70)
    
    conn = connect_database()
    if not conn:
        return
    
    try:
        # Load misclassified questions
        misclassified = load_misclassified()
        print(f"\n📋 Loaded {len(misclassified)} potentially misclassified questions")
        
        # Manual review
        to_fix = manual_review_questions(misclassified)
        
        if not to_fix:
            print("\n✅ No questions selected for fixing")
            return
        
        # Fix categories
        fixed_count = fix_categories(conn, to_fix)
        
        print("\n" + "="*70)
        print(f"SUMMARY: Fixed {fixed_count} misclassified questions")
        print("="*70)
        
    except Exception as e:
        print(f"❌ Error: {e}")
        conn.rollback()
    finally:
        conn.close()
        print("\n✅ Database connection closed")

if __name__ == "__main__":
    main()
