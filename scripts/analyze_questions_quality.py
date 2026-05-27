#!/usr/bin/env python3
"""
Question Data Quality Analysis
Analyzes all questions in the database for:
- Duplicates
- Incorrect categorization
- Content similarity
- Data quality issues
"""

import mysql.connector
import pandas as pd
import numpy as np
from difflib import SequenceMatcher
from collections import Counter
import re
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

def load_all_questions(conn):
    """Load all questions from database"""
    query = """
    SELECT s.id, s.kategori_id, k.nama_kategori, s.pertanyaan, s.opsi_a, s.opsi_b, 
           s.opsi_c, s.opsi_d, s.opsi_e, s.jawaban_benar, s.pembahasan
    FROM soal s
    LEFT JOIN kategori_soal k ON s.kategori_id = k.id
    ORDER BY s.id
    """
    
    cursor = conn.cursor(dictionary=True)
    cursor.execute(query)
    questions = cursor.fetchall()
    cursor.close()
    
    print(f"✅ Loaded {len(questions)} questions")
    return questions

def normalize_text(text):
    """Normalize text for comparison"""
    if not text:
        return ""
    text = text.lower()
    text = re.sub(r'[^\w\s]', '', text)
    text = re.sub(r'\s+', ' ', text)
    return text.strip()

def text_similarity(text1, text2):
    """Calculate text similarity using SequenceMatcher"""
    return SequenceMatcher(None, normalize_text(text1), normalize_text(text2)).ratio()

def find_duplicates(questions, threshold=0.95):
    """Find duplicate questions based on text similarity"""
    print("\n🔍 Checking for duplicates...")
    
    duplicates = []
    total_questions = len(questions)
    
    for i in range(total_questions):
        if i % 1000 == 0:
            print(f"  Progress: {i}/{total_questions}")
        
        for j in range(i + 1, total_questions):
            similarity = text_similarity(questions[i]['pertanyaan'], questions[j]['pertanyaan'])
            
            if similarity >= threshold:
                duplicates.append({
                    'id1': questions[i]['id'],
                    'id2': questions[j]['id'],
                    'similarity': similarity,
                    'kategori1': questions[i]['nama_kategori'],
                    'kategori2': questions[j]['nama_kategori'],
                    'text1': questions[i]['pertanyaan'][:100] + '...',
                    'text2': questions[j]['pertanyaan'][:100] + '...'
                })
    
    print(f"✅ Found {len(duplicates)} potential duplicates")
    return duplicates

def validate_categorization(questions):
    """Validate question categorization based on keywords"""
    print("\n🔍 Validating categorization...")
    
    # Keywords for each category
    category_keywords = {
        'TWK': ['nasionalisme', 'pancasila', 'uud', 'sejarah', 'ideologi', 'negara', 'pemerintahan', 
                'bhineka', 'kebinekaan', 'persatuan', 'demokrasi', 'hukum', 'konstitusi'],
        'TIU': ['deret', 'angka', 'logika', 'analisis', 'silogisme', 'analogi', 'verbal', 'numerik',
                'pola', 'matematika', 'perbandingan', 'persentase'],
        'TKP': ['sikap', 'perilaku', 'etika', 'kerja', 'tim', 'disiplin', 'kerjasama', 'komunikasi',
                'adaptasi', 'stres', 'konflik', 'motivasi', 'leadership'],
        'TPA': ['akademik', 'bahasa', 'inggris', 'matematika', 'fisika', 'kimia', 'biologi'],
        'PSIKOLOGIS': ['psikologi', 'kepribadian', 'karakter', 'emosional', 'mental', 'psikotes']
    }
    
    misclassified = []
    
    for q in questions:
        if not q['nama_kategori']:
            continue
            
        text = normalize_text(q['pertanyaan'])
        expected_category = q['nama_kategori']
        
        # Check if question contains keywords from other categories
        for category, keywords in category_keywords.items():
            if category == expected_category:
                continue
                
            keyword_matches = sum(1 for kw in keywords if kw in text)
            if keyword_matches >= 2:  # If 2+ keywords from another category
                misclassified.append({
                    'id': q['id'],
                    'current_category': expected_category,
                    'suggested_category': category,
                    'keywords_found': [kw for kw in keywords if kw in text],
                    'question': q['pertanyaan'][:100] + '...'
                })
    
    print(f"✅ Found {len(misclassified)} potentially misclassified questions")
    return misclassified

def analyze_question_length(questions):
    """Analyze question length distribution"""
    print("\n🔍 Analyzing question length...")
    
    lengths = [len(q['pertanyaan']) for q in questions]
    
    stats = {
        'min': min(lengths),
        'max': max(lengths),
        'avg': np.mean(lengths),
        'median': np.median(lengths),
        'std': np.std(lengths)
    }
    
    print(f"  Min length: {stats['min']}")
    print(f"  Max length: {stats['max']}")
    print(f"  Average length: {stats['avg']:.2f}")
    print(f"  Median length: {stats['median']}")
    print(f"  Std deviation: {stats['std']:.2f}")
    
    # Find questions with unusual lengths
    unusual = [q for q in questions if len(q['pertanyaan']) < 50 or len(q['pertanyaan']) > 2000]
    print(f"  Questions with unusual length: {len(unusual)}")
    
    return stats, unusual

def check_missing_data(questions):
    """Check for missing or incomplete data"""
    print("\n🔍 Checking for missing data...")
    
    missing_data = []
    
    for q in questions:
        issues = []
        
        if not q['pertanyaan'] or len(q['pertanyaan'].strip()) < 10:
            issues.append('missing_or_short_question')
        
        if not q['opsi_a'] or not q['opsi_b']:
            issues.append('missing_options')
        
        if not q['jawaban_benar'] or q['jawaban_benar'] not in ['A', 'B', 'C', 'D', 'E']:
            issues.append('invalid_answer')
        
        if not q['kategori_id']:
            issues.append('missing_category')
        
        if issues:
            missing_data.append({
                'id': q['id'],
                'issues': issues,
                'question': q['pertanyaan'][:50] + '...' if q['pertanyaan'] else 'N/A'
            })
    
    print(f"✅ Found {len(missing_data)} questions with data issues")
    return missing_data

def generate_report(questions, duplicates, misclassified, unusual, missing_data):
    """Generate comprehensive analysis report"""
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    
    report = {
        'timestamp': timestamp,
        'summary': {
            'total_questions': len(questions),
            'duplicates_found': len(duplicates),
            'misclassified_found': len(misclassified),
            'unusual_length': len(unusual),
            'missing_data': len(missing_data)
        },
        'duplicates': duplicates[:50],  # Limit to first 50
        'misclassified': misclassified[:50],
        'unusual_length': [{'id': q['id'], 'length': len(q['pertanyaan'])} for q in unusual[:50]],
        'missing_data': missing_data[:50]
    }
    
    # Save report to JSON
    report_file = f'question_analysis_report_{timestamp}.json'
    with open(report_file, 'w', encoding='utf-8') as f:
        json.dump(report, f, indent=2, ensure_ascii=False)
    
    print(f"\n✅ Report saved to: {report_file}")
    
    # Print summary
    print("\n" + "="*70)
    print("ANALYSIS SUMMARY")
    print("="*70)
    print(f"Total questions analyzed: {len(questions)}")
    print(f"Potential duplicates: {len(duplicates)}")
    print(f"Potentially misclassified: {len(misclassified)}")
    print(f"Unusual length questions: {len(unusual)}")
    print(f"Questions with data issues: {len(missing_data)}")
    print("="*70)

def main():
    """Main analysis function"""
    print("="*70)
    print("QUESTION DATA QUALITY ANALYSIS")
    print("="*70)
    
    # Connect to database
    conn = connect_database()
    if not conn:
        return
    
    try:
        # Load all questions
        questions = load_all_questions(conn)
        
        # Analyze duplicates (sample first 1000 for performance)
        print("\n⚠️  Analyzing first 1000 questions for duplicates (for performance)...")
        sample_questions = questions[:1000]
        duplicates = find_duplicates(sample_questions, threshold=0.95)
        
        # Validate categorization
        misclassified = validate_categorization(questions)
        
        # Analyze question length
        length_stats, unusual = analyze_question_length(questions)
        
        # Check for missing data
        missing_data = check_missing_data(questions)
        
        # Generate report
        generate_report(questions, duplicates, misclassified, unusual, missing_data)
        
        # Save detailed data to CSV for further analysis
        df = pd.DataFrame(questions)
        df.to_csv('questions_export.csv', index=False, encoding='utf-8')
        print("✅ Questions exported to: questions_export.csv")
        
    except Exception as e:
        print(f"❌ Analysis failed: {e}")
    finally:
        conn.close()
        print("\n✅ Database connection closed")

if __name__ == "__main__":
    main()
