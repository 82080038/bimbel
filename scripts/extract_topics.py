#!/usr/bin/env python3
"""
Topic Extraction Script
Analyzes all soal (questions) in the database to extract and categorize topics/materi
"""

import mysql.connector
from collections import Counter
import re
import json
from typing import Dict, List, Set

# Database configuration
DB_CONFIG = {
    'host': '127.0.0.1',
    'user': 'root',
    'password': 'root',
    'database': 'ujian_sekolah_kedinasan',
    'charset': 'utf8mb4'
}

# Indonesian stopwords (common words to ignore)
INDONESIAN_STOPWORDS = {
    'yang', 'dan', 'di', 'ke', 'dari', 'pada', 'untuk', 'dengan', 'adalah',
    'ini', 'itu', 'tersebut', 'mereka', 'kita', 'kami', 'anda', 'beliau',
    'atau', 'tetapi', 'namun', 'karena', 'jika', 'bila', 'apabila',
    'sebagai', 'yaitu', 'yakni', 'ialah', 'adalah', 'merupakan',
    'dalam', 'kepada', 'oleh', 'terhadap', 'tentang', 'mengenai',
    'sebuah', 'suatu', 'setiap', 'tiap', 'semua', 'para',
    'telah', 'sudah', 'masih', 'akan', 'harus', 'perlu',
    'bisa', 'dapat', 'mampu', 'mungkin', 'biasanya',
    'lebih', 'paling', 'sangat', 'cukup', 'hanya',
    'satu', 'dua', 'tiga', 'empat', 'lima', 'enam', 'tujuh', 'delapan', 'sembilan', 'sepuluh',
    'juga', 'lagi', 'pun', 'saja', 'mah', 'kah', 'lah',
    'no', 'nomor', 'pertanyaan', 'jawaban', 'pilih', 'a', 'b', 'c', 'd', 'e'
}

def extract_keywords(text: str, min_length: int = 3) -> List[str]:
    """Extract keywords from text"""
    if not text:
        return []
    
    # Convert to lowercase
    text = text.lower()
    
    # Remove special characters and numbers
    text = re.sub(r'[^a-z\s]', ' ', text)
    
    # Split into words
    words = text.split()
    
    # Filter stopwords and short words
    keywords = [word for word in words if word not in INDONESIAN_STOPWORDS and len(word) >= min_length]
    
    return keywords

def analyze_soal_by_category(conn) -> Dict[str, Dict]:
    """Analyze soal by category and extract topics"""
    cursor = conn.cursor(dictionary=True)
    
    # Get all categories
    cursor.execute("SELECT id, nama_kategori FROM kategori_soal")
    categories = cursor.fetchall()
    
    results = {}
    
    for category in categories:
        category_id = category['id']
        category_name = category['nama_kategori']
        
        # Get all soal for this category
        cursor.execute("""
            SELECT id, pertanyaan, kategori_id 
            FROM soal 
            WHERE kategori_id = %s
        """, (category_id,))
        
        soal_list = cursor.fetchall()
        
        if not soal_list:
            results[category_name] = {
                'total_soal': 0,
                'topics': []
            }
            continue
        
        # Extract keywords from all questions
        all_keywords = []
        soal_keywords = {}  # Map soal_id to its keywords
        
        for soal in soal_list:
            keywords = extract_keywords(soal['pertanyaan'])
            all_keywords.extend(keywords)
            soal_keywords[soal['id']] = keywords
        
        # Count keyword frequency
        keyword_counter = Counter(all_keywords)
        
        # Get top keywords as topics (minimum frequency 3)
        top_keywords = [kw for kw, count in keyword_counter.most_common(50) if count >= 3]
        
        # Group related keywords into topics
        topics = group_keywords_into_topics(top_keywords, all_keywords)
        
        results[category_name] = {
            'total_soal': len(soal_list),
            'topics': topics,
            'soal_keywords': soal_keywords
        }
    
    cursor.close()
    return results

def group_keywords_into_topics(keywords: List[str], all_keywords: List[str]) -> List[Dict]:
    """Group related keywords into meaningful topics"""
    if not keywords:
        return []
    
    # Simple grouping: each keyword is a potential topic
    # In a more advanced version, we could use clustering or word embeddings
    topics = []
    
    for keyword in keywords:
        # Count occurrences
        count = all_keywords.count(keyword)
        
        # Create topic
        topic = {
            'name': keyword.title(),
            'keyword': keyword,
            'frequency': count,
            'related_keywords': []
        }
        
        topics.append(topic)
    
    return topics

def create_topics_table(conn):
    """Create topics table if it doesn't exist"""
    cursor = conn.cursor()
    
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS topics (
            id INT AUTO_INCREMENT PRIMARY KEY,
            kategori_id INT NOT NULL,
            nama_topic VARCHAR(255) NOT NULL,
            keyword VARCHAR(100) NOT NULL,
            frequency INT DEFAULT 0,
            deskripsi TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (kategori_id) REFERENCES kategori_soal(id) ON DELETE CASCADE,
            UNIQUE KEY unique_topic (kategori_id, keyword)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    """)
    
    conn.commit()
    cursor.close()
    print("✓ Topics table created/verified")

def add_topic_column_to_soal(conn):
    """Add topic_id column to soal table if it doesn't exist"""
    cursor = conn.cursor()
    
    try:
        cursor.execute("""
            ALTER TABLE soal 
            ADD COLUMN topic_id INT NULL,
            ADD FOREIGN KEY (topic_id) REFERENCES topics(id) ON DELETE SET NULL
        """)
        conn.commit()
        print("✓ topic_id column added to soal table")
    except mysql.connector.Error as err:
        if err.errno == 1060:  # Column already exists
            print("✓ topic_id column already exists in soal table")
        else:
            print(f"✗ Error adding topic_id column: {err}")
    
    cursor.close()

def save_topics_to_database(conn, analysis_results: Dict):
    """Save extracted topics to database"""
    cursor = conn.cursor(dictionary=True)
    
    # Get category ID mapping
    cursor.execute("SELECT id, nama_kategori FROM kategori_soal")
    category_map = {cat['nama_kategori']: cat['id'] for cat in cursor.fetchall()}
    
    for category_name, data in analysis_results.items():
        if data['total_soal'] == 0:
            continue
        
        category_id = category_map.get(category_name)
        if not category_id:
            continue
        
        for topic in data['topics']:
            # Check if topic already exists
            cursor.execute("""
                SELECT id FROM topics 
                WHERE kategori_id = %s AND keyword = %s
            """, (category_id, topic['keyword']))
            
            existing = cursor.fetchone()
            
            if existing:
                # Update frequency
                cursor.execute("""
                    UPDATE topics 
                    SET frequency = %s, updated_at = CURRENT_TIMESTAMP
                    WHERE id = %s
                """, (topic['frequency'], existing['id']))
            else:
                # Insert new topic
                cursor.execute("""
                    INSERT INTO topics (kategori_id, nama_topic, keyword, frequency, deskripsi)
                    VALUES (%s, %s, %s, %s, %s)
                """, (category_id, topic['name'], topic['keyword'], topic['frequency'], 
                      f"Topic extracted from {topic['frequency']} questions"))
        
        conn.commit()
    
    cursor.close()
    print(f"✓ Topics saved to database")

def assign_topics_to_soal(conn, analysis_results: Dict):
    """Assign topics to individual soal based on keyword matching"""
    cursor = conn.cursor(dictionary=True)
    
    # Get all topics
    cursor.execute("""
        SELECT t.id, t.keyword, k.nama_kategori 
        FROM topics t
        JOIN kategori_soal k ON t.kategori_id = k.id
    """)
    topics = cursor.fetchall()
    
    # Create topic lookup by category and keyword
    topic_lookup = {}
    for topic in topics:
        category = topic['nama_kategori']
        keyword = topic['keyword']
        if category not in topic_lookup:
            topic_lookup[category] = {}
        topic_lookup[category][keyword] = topic['id']
    
    # Assign topics to soal
    for category_name, data in analysis_results.items():
        if data['total_soal'] == 0:
            continue
        
        for soal_id, keywords in data['soal_keywords'].items():
            # Find matching topic
            for keyword in keywords:
                if category_name in topic_lookup and keyword in topic_lookup[category_name]:
                    topic_id = topic_lookup[category_name][keyword]
                    
                    # Update soal with topic_id
                    cursor.execute("""
                        UPDATE soal 
                        SET topic_id = %s 
                        WHERE id = %s
                    """, (topic_id, soal_id))
                    
                    # Assign first matching topic only
                    break
        
        conn.commit()
    
    cursor.close()
    print(f"✓ Topics assigned to soal")

def main():
    print("=" * 60)
    print("TOPIC EXTRACTION FROM SOAL DATABASE")
    print("=" * 60)
    
    # Connect to database
    try:
        conn = mysql.connector.connect(**DB_CONFIG)
        print("✓ Connected to database")
    except mysql.connector.Error as err:
        print(f"✗ Error connecting to database: {err}")
        return
    
    try:
        # Analyze soal
        print("\nAnalyzing soal by category...")
        analysis_results = analyze_soal_by_category(conn)
        
        # Print results
        print("\n" + "=" * 60)
        print("ANALYSIS RESULTS")
        print("=" * 60)
        
        for category_name, data in analysis_results.items():
            print(f"\n{category_name}:")
            print(f"  Total Soal: {data['total_soal']}")
            print(f"  Topics Found: {len(data['topics'])}")
            
            if data['topics']:
                print("  Top Topics:")
                for topic in data['topics'][:10]:  # Show top 10
                    print(f"    - {topic['name']} ({topic['frequency']} occurrences)")
        
        # Create tables
        print("\n" + "=" * 60)
        print("DATABASE SETUP")
        print("=" * 60)
        
        create_topics_table(conn)
        add_topic_column_to_soal(conn)
        
        # Save topics
        print("\n" + "=" * 60)
        print("SAVING TOPICS TO DATABASE")
        print("=" * 60)
        
        save_topics_to_database(conn, analysis_results)
        
        # Assign topics to soal
        print("\n" + "=" * 60)
        print("ASSIGNING TOPICS TO SOAL")
        print("=" * 60)
        
        assign_topics_to_soal(conn, analysis_results)
        
        # Save analysis results to JSON for reference
        with open('topic_analysis_results.json', 'w', encoding='utf-8') as f:
            json.dump(analysis_results, f, ensure_ascii=False, indent=2)
        
        print("\n✓ Analysis results saved to topic_analysis_results.json")
        
        print("\n" + "=" * 60)
        print("EXTRACTION COMPLETE")
        print("=" * 60)
        
    except Exception as e:
        print(f"✗ Error during extraction: {e}")
        import traceback
        traceback.print_exc()
    finally:
        conn.close()
        print("\n✓ Database connection closed")

if __name__ == "__main__":
    main()
