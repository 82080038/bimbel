#!/usr/bin/env python3
"""
Download real images for soal from various free sources
Uses multiple sources with delays to avoid rate limiting
"""
import os
import requests
from PIL import Image
import io
import time
import random

# Directory for images
IMAGE_DIR = "uploads/soal"
os.makedirs(IMAGE_DIR, exist_ok=True)

# Real image sources from multiple free sources
IMAGE_SOURCES = {
    "proklamasi.jpg": [
        "https://upload.wikimedia.org/wikipedia/commons/a/a2/Proklamasi_Kemerdekaan_Indonesia.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/9/98/Soekarno%2C_Sukarno%2C_1940s.jpg",
        "https://images.unsplash.com/photo-1596524449347-4651af83d1a6?w=800"  # Alternative
    ],
    "peta_indonesia.jpg": [
        "https://upload.wikimedia.org/wikipedia/commons/0/0c/Indonesia_provinces_blank.svg",
        "https://upload.wikimedia.org/wikipedia/commons/2/25/Indonesia_location_map.svg"
    ],
    "peta_jawa.jpg": [
        "https://upload.wikimedia.org/wikipedia/commons/6/6e/Java_province_map.svg"
    ],
    "peta_gunung.jpg": [
        "https://upload.wikimedia.org/wikipedia/commons/8/8d/Indonesia_volcanoes_map.png"
    ],
    "geometri_segitiga.jpg": [
        "https://upload.wikimedia.org/wikipedia/commons/6/6f/Triangle_illustration.svg"
    ],
    "persegi_panjang.jpg": [
        "https://upload.wikimedia.org/wikipedia/commons/3/3d/Rectangle_illustration.svg"
    ],
    "kubus.jpg": [
        "https://upload.wikimedia.org/wikipedia/commons/3/33/Cube_illustration.svg"
    ],
    "balok.jpg": [
        "https://upload.wikimedia.org/wikipedia/commons/8/8e/Cuboid_illustration.svg"
    ],
    "tabung.jpg": [
        "https://upload.wikimedia.org/wikipedia/commons/4/4f/Cylinder_illustration.svg"
    ],
    "kerucut.jpg": [
        "https://upload.wikimedia.org/wikipedia/commons/5/5e/Cone_illustration.svg"
    ],
    "bola.jpg": [
        "https://upload.wikimedia.org/wikipedia/commons/3/3b/Sphere_illustration.svg"
    ]
}

def download_image(url, filename):
    """Download image from URL with proper headers and delay"""
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Referer': 'https://www.wikipedia.org/'
    }
    
    try:
        print(f"Downloading {filename} from {url}...")
        response = requests.get(url, headers=headers, timeout=30)
        response.raise_for_status()
        
        # Convert to JPEG if SVG
        if url.endswith('.svg'):
            content = response.content
            if content.startswith(b'<?xml') or content.startswith(b'<svg'):
                svg_filename = filename.replace('.jpg', '.svg')
                filepath = os.path.join(IMAGE_DIR, svg_filename)
                with open(filepath, 'wb') as f:
                    f.write(content)
                print(f"✅ Downloaded SVG: {svg_filename}")
                try:
                    from cairosvg import svg2png
                    png_data = svg2png(bytestring=content)
                    img = Image.open(io.BytesIO(png_data))
                    if img.mode in ('RGBA', 'LA', 'P'):
                        img = img.convert('RGB')
                    jpg_filepath = os.path.join(IMAGE_DIR, filename)
                    img.save(jpg_filepath, 'JPEG', quality=90)
                    print(f"✅ Converted to JPEG: {filename}")
                    os.remove(filepath)
                    return True
                except ImportError:
                    print(f"⚠️  cairosvg not installed, keeping SVG")
                    return True
                except Exception as e:
                    print(f"⚠️  Could not convert SVG: {e}")
                    return True
            else:
                filepath = os.path.join(IMAGE_DIR, filename)
                with open(filepath, 'wb') as f:
                    f.write(content)
                print(f"✅ Downloaded: {filename}")
                return True
        else:
            img = Image.open(io.BytesIO(response.content))
            if img.mode in ('RGBA', 'LA', 'P'):
                img = img.convert('RGB')
            filepath = os.path.join(IMAGE_DIR, filename)
            img.save(filepath, 'JPEG', quality=90)
            print(f"✅ Downloaded: {filename}")
            return True
            
    except Exception as e:
        print(f"❌ Failed to download {filename}: {e}")
        return False

def main():
    print("Starting real image download process...\n")
    print("Note: Adding delays between requests to avoid rate limiting\n")
    
    success_count = 0
    fail_count = 0
    
    for filename, urls in IMAGE_SOURCES.items():
        print(f"\nProcessing: {filename}")
        
        downloaded = False
        for url in urls:
            if download_image(url, filename):
                downloaded = True
                success_count += 1
                break
            # Add delay between retries
            time.sleep(2)
        
        if not downloaded:
            fail_count += 1
            print(f"⚠️  All sources failed for {filename}")
        
        # Add delay between different files
        time.sleep(random.uniform(3, 5))
    
    print("\n" + "=" * 50)
    print(f"Download complete!")
    print(f"✅ Success: {success_count}")
    print(f"❌ Failed: {fail_count}")
    print("=" * 50)

if __name__ == '__main__':
    main()
