#!/usr/bin/env python3
"""
Script untuk mengambil bahan ajar dari Wikipedia menggunakan Playwright
Menggunakan headed mode untuk menghindari rate limiting
"""

from playwright.sync_api import sync_playwright
import json
import os
import sys

# Database connection
sys.path.insert(0, '/opt/lampp/htdocs/ujian')
import config

# Wikipedia URLs untuk setiap topik
WIKIPEDIA_TOPICS = {
    # TWK - Tes Wawasan Kebangsaan
    'Pancasila': 'https://id.wikipedia.org/wiki/Pancasila',
    'UUD 1945': 'https://id.wikipedia.org/wiki/Undang-Undang_Dasar_1945',
    'Sejarah Indonesia': 'https://id.wikipedia.org/wiki/Sejarah_Indonesia',
    'Bela Negara': 'https://id.wikipedia.org/wiki/Bela_negara',
    'Nasionalisme': 'https://id.wikipedia.org/wiki/Nasionalisme',
    'Bhinneka Tunggal Ika': 'https://id.wikipedia.org/wiki/Bhinneka_Tunggal_Ika',
    'NKRI': 'https://id.wikipedia.org/wiki/Indonesia',
    'Pemerintahan Indonesia': 'https://id.wikipedia.org/wiki/Pemerintahan_Indonesia',
    
    # TIU - Tes Intelegensi Umum
    'Deret Angka': 'https://id.wikipedia.org/wiki/Barisan_(matematika)',
    'Analogi': 'https://id.wikipedia.org/wiki/Analogi',
    'Logika': 'https://id.wikipedia.org/wiki/Logika',
    'Silogisme': 'https://id.wikipedia.org/wiki/Silogisme',
    'Numerik': 'https://id.wikipedia.org/wiki/Aritmatika',
    'Verbal': 'https://id.wikipedia.org/wiki/Bahasa',
    
    # TKP - Tes Karakteristik Pribadi
    'Kepribadian': 'https://id.wikipedia.org/wiki/Kepribadian',
    'Motivasi': 'https://id.wikipedia.org/wiki/Motivasi',
    'Pengendalian Diri': 'https://id.wikipedia.org/wiki/Disiplin_diri',
    
    # TPA - Tes Potensi Akademik
    'Bahasa': 'https://id.wikipedia.org/wiki/Linguistik',
    'Logika Matematika': 'https://id.wikipedia.org/wiki/Logika_matematika',
    'Spasial': 'https://id.wikipedia.org/wiki/Spasial',
    
    # PSIKOLOGIS
    'Psikologi': 'https://id.wikipedia.org/wiki/Psikologi',
}

def scrape_wikipedia_page(url, topic_name):
    """Scrape content from Wikipedia page"""
    with sync_playwright() as p:
        # Launch browser in headed mode
        browser = p.chromium.launch(headless=False, slow_mo=100)
        context = browser.new_context(
            user_agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            viewport={'width': 1920, 'height': 1080}
        )
        page = context.new_page()
        
        try:
            print(f"Scraping: {topic_name} from {url}")
            
            # Navigate to Wikipedia page
            page.goto(url, wait_until='networkidle', timeout=60000)
            
            # Wait for page to load
            page.wait_for_timeout(2000)
            
            # Extract main content
            content = {
                'topic': topic_name,
                'url': url,
                'title': page.title(),
                'introduction': '',
                'main_content': [],
                'key_points': [],
                'summary': ''
            }
            
            # Get introduction (first paragraph)
            intro_selectors = [
                '#mw-content-text > div.mw-parser-output > p',
                '.mw-parser-output > p'
            ]
            
            for selector in intro_selectors:
                intro = page.query_selector(selector)
                if intro:
                    content['introduction'] = intro.inner_text().strip()
                    break
            
            # Get main content sections
            sections = page.query_selector_all('.mw-headline')
            for section in sections:
                section_title = section.inner_text()
                content['main_content'].append({
                    'section': section_title,
                    'content': ''
                })
            
            # Get key points (lists)
            lists = page.query_selector_all('ul, ol')
            for lst in lists:
                items = lst.query_selector_all('li')
                if items:
                    key_points = [item.inner_text().strip() for item in items[:5]]  # Max 5 points
                    if key_points:
                        content['key_points'].extend(key_points)
            
            # Create summary
            if content['introduction']:
                content['summary'] = content['introduction'][:500] + '...'
            
            print(f"✅ Successfully scraped: {topic_name}")
            print(f"   - Introduction: {len(content['introduction'])} chars")
            print(f"   - Sections: {len(content['main_content'])}")
            print(f"   - Key points: {len(content['key_points'])}")
            
            context.close()
            browser.close()
            return content
            
        except Exception as e:
            print(f"❌ Failed to scrape {topic_name}: {e}")
            context.close()
            browser.close()
            return None

def save_to_json(content, output_dir):
    """Save scraped content to JSON file"""
    if not content:
        return False
    
    os.makedirs(output_dir, exist_ok=True)
    filename = f"{content['topic'].replace(' ', '_').lower()}.json"
    filepath = os.path.join(output_dir, filename)
    
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(content, f, ensure_ascii=False, indent=2)
    
    print(f"💾 Saved to: {filepath}")
    return True

def update_database(content):
    """Update learning_topics table with scraped content"""
    if not content:
        return False
    
    import mysql.connector
    
    try:
        conn = mysql.connector.connect(
            host='localhost',
            user='root',
            password='root',
            database='bimbel_db'
        )
        cursor = conn.cursor()
        
        # Check if topic exists
        cursor.execute(
            "SELECT id FROM learning_topics WHERE topic_name = %s",
            (content['topic'],)
        )
        result = cursor.fetchone()
        
        if result:
            # Update existing topic
            topic_id = result[0]
            cursor.execute(
                """UPDATE learning_topics 
                   SET description = %s, 
                       external_api_url = %s,
                       json_material_url = %s
                   WHERE id = %s""",
                (content['introduction'], content['url'], 
                 f"data/learning_materials/{content['topic'].replace(' ', '_').lower()}.json",
                 topic_id)
            )
            print(f"📝 Updated existing topic: {content['topic']} (ID: {topic_id})")
        else:
            # Insert new topic
            cursor.execute(
                """INSERT INTO learning_topics 
                   (topic_name, kategori, description, external_api_url, json_material_url, difficulty_level)
                   VALUES (%s, %s, %s, %s, %s, %s)""",
                (content['topic'], 'General', content['introduction'], 
                 content['url'],
                 f"data/learning_materials/{content['topic'].replace(' ', '_').lower()}.json",
                 'intermediate')
            )
            print(f"➕ Inserted new topic: {content['topic']}")
        
        conn.commit()
        cursor.close()
        conn.close()
        return True
        
    except Exception as e:
        print(f"❌ Database error: {e}")
        return False

def main():
    print("=" * 60)
    print("WIKIPEDIA BAHAN AJAR SCRAPER")
    print("=" * 60)
    
    output_dir = '/opt/lampp/htdocs/ujian/data/learning_materials'
    
    success_count = 0
    fail_count = 0
    
    for topic_name, url in WIKIPEDIA_TOPICS.items():
        print(f"\n{'=' * 60}")
        print(f"Processing: {topic_name}")
        print(f"{'=' * 60}")
        
        # Scrape content
        content = scrape_wikipedia_page(url, topic_name)
        
        if content:
            # Save to JSON
            save_to_json(content, output_dir)
            
            # Update database
            update_database(content)
            
            success_count += 1
        else:
            fail_count += 1
        
        # Delay between requests
        import time
        time.sleep(3)
    
    print(f"\n{'=' * 60}")
    print(f"SCRAPING COMPLETE")
    print(f"{'=' * 60}")
    print(f"✅ Success: {success_count}")
    print(f"❌ Failed: {fail_count}")
    print(f"{'=' * 60}")

if __name__ == '__main__':
    main()
