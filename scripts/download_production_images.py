#!/usr/bin/env python3
"""
Script untuk download gambar asli dari internet untuk produksi
Menggunakan sumber gratis: Unsplash, Pexels, Pixabay
Untuk penggunaan internal/terbatas saja
"""

import requests
import os
import time
from urllib.parse import quote

# Directory untuk menyimpan gambar
UPLOAD_DIR = 'uploads/soal/'

# Unsplash API (gratis untuk penggunaan terbatas)
UNSPLASH_ACCESS_KEY = 'YOUR_UNSPLASH_ACCESS_KEY'  # Ganti dengan API key Anda

# Mapping gambar ke keywords untuk pencarian
IMAGE_KEYWORDS = {
    # Geometri
    'geometri_segitiga.jpg': 'triangle geometry',
    'persegi_panjang.jpg': 'rectangle geometry',
    'kubus.jpg': 'cube 3d',
    'balok.jpg': 'rectangular prism',
    
    # Rotasi
    'rotasi_90.jpg': 'rotation arrow',
    'rotasi_opsi_a.jpg': 'rotation diagram',
    'rotasi_opsi_b.jpg': 'rotation shape',
    'rotasi_opsi_c.jpg': 'rotation pattern',
    'rotasi_opsi_d.jpg': 'rotation geometric',
    'rotasi_opsi_e.jpg': 'rotation abstract',
    
    # Cermin
    'cermin_asli.jpg': 'mirror reflection',
    'cermin_a.jpg': 'mirror symmetry',
    'cermin_b.jpg': 'reflection pattern',
    'cermin_c.jpg': 'mirror image',
    'cermin_d.jpg': 'symmetry pattern',
    'cermin_e.jpg': 'reflection shape',
    
    # Lipatan
    'lipatan.jpg': 'paper folding',
    'lipatan_a.jpg': 'folded paper',
    'lipatan_b.jpg': 'origami pattern',
    'lipatan_c.jpg': 'folding diagram',
    'lipatan_d.jpg': 'paper crease',
    'lipatan_e.jpg': 'folded shape',
    
    # Pola Spasial
    'pola_spatial.jpg': 'spatial pattern',
    'pola_a.jpg': 'geometric pattern',
    'pola_b.jpg': 'abstract pattern',
    'pola_c.jpg': 'shape pattern',
    'pola_d.jpg': 'visual pattern',
    'pola_e.jpg': 'design pattern',
    
    # Bangun Ruang
    'tabung.jpg': 'cylinder 3d',
    'kerucut.jpg': 'cone 3d',
    'bola.jpg': 'sphere 3d',
    
    # Proyeksi
    'proyeksi_3d.jpg': '3d projection',
    'proyeksi_a.jpg': 'top view',
    'proyeksi_b.jpg': 'front view',
    'proyeksi_c.jpg': 'side view',
    'proyeksi_d.jpg': 'isometric view',
    'proyeksi_e.jpg': 'perspective view',
    
    # Rotasi 3D
    'kubus_rotasi.jpg': 'cube rotation',
    'kubus_rot_a.jpg': 'rotated cube',
    'kubus_rot_b.jpg': 'cube angle',
    'kubus_rot_c.jpg': '3d cube',
    'kubus_rot_d.jpg': 'cube perspective',
    'kubus_rot_e.jpg': 'cube geometric',
    
    # Peta
    'peta_indonesia.jpg': 'indonesia map',
    'peta_jawa.jpg': 'java island map',
    'peta_gunung.jpg': 'indonesia volcano map',
    
    # Sejarah
    'proklamasi.jpg': 'indonesia independence proclamation',
    'diponegoro.jpg': 'prince diponegoro'
}

def download_from_unsplash(keyword, filename):
    """Download gambar dari Unsplash API"""
    if UNSPLASH_ACCESS_KEY == 'YOUR_UNSPLASH_ACCESS_KEY':
        print(f"  ⊘ {filename}: Unsplash API key tidak di-set, dilewati")
        return False
    
    try:
        url = f"https://api.unsplash.com/search/photos"
        params = {
            'query': keyword,
            'per_page': 1,
            'orientation': 'landscape'
        }
        headers = {
            'Authorization': f'Client-ID {UNSPLASH_ACCESS_KEY}'
        }
        
        response = requests.get(url, params=params, headers=headers, timeout=30)
        response.raise_for_status()
        
        data = response.json()
        if data['results']:
            image_url = data['results'][0]['urls']['regular']
            
            # Download image
            img_response = requests.get(image_url, timeout=30)
            img_response.raise_for_status()
            
            filepath = os.path.join(UPLOAD_DIR, filename)
            with open(filepath, 'wb') as f:
                f.write(img_response.content)
            
            return True
        else:
            print(f"  ✗ {filename}: Tidak ada gambar ditemukan untuk keyword '{keyword}'")
            return False
    except Exception as e:
        print(f"  ✗ {filename}: Error - {e}")
        return False

def download_from_pexels(keyword, filename):
    """Download gambar dari Pexels API"""
    # Pexels API key (gratis untuk penggunaan terbatas)
    PEXELS_API_KEY = 'YOUR_PEXELS_API_KEY'  # Ganti dengan API key Anda
    
    if PEXELS_API_KEY == 'YOUR_PEXELS_API_KEY':
        print(f"  ⊘ {filename}: Pexels API key tidak di-set, dilewati")
        return False
    
    try:
        url = f"https://api.pexels.com/v1/search"
        params = {
            'query': keyword,
            'per_page': 1,
            'orientation': 'landscape'
        }
        headers = {
            'Authorization': PEXELS_API_KEY
        }
        
        response = requests.get(url, params=params, headers=headers, timeout=30)
        response.raise_for_status()
        
        data = response.json()
        if data['photos']:
            image_url = data['photos'][0]['src']['large']
            
            # Download image
            img_response = requests.get(image_url, timeout=30)
            img_response.raise_for_status()
            
            filepath = os.path.join(UPLOAD_DIR, filename)
            with open(filepath, 'wb') as f:
                f.write(img_response.content)
            
            return True
        else:
            print(f"  ✗ {filename}: Tidak ada gambar ditemukan untuk keyword '{keyword}'")
            return False
    except Exception as e:
        print(f"  ✗ {filename}: Error - {e}")
        return False

def download_from_pixabay(keyword, filename):
    """Download gambar dari Pixabay API"""
    # Pixabay API key (gratis untuk penggunaan terbatas)
    PIXABAY_API_KEY = 'YOUR_PIXABAY_API_KEY'  # Ganti dengan API key Anda
    
    if PIXABAY_API_KEY == 'YOUR_PIXABAY_API_KEY':
        print(f"  ⊘ {filename}: Pixabay API key tidak di-set, dilewati")
        return False
    
    try:
        url = f"https://pixabay.com/api/"
        params = {
            'key': PIXABAY_API_KEY,
            'q': keyword,
            'per_page': 1,
            'image_type': 'photo',
            'orientation': 'horizontal'
        }
        
        response = requests.get(url, params=params, timeout=30)
        response.raise_for_status()
        
        data = response.json()
        if data['hits']:
            image_url = data['hits'][0]['largeImageURL']
            
            # Download image
            img_response = requests.get(image_url, timeout=30)
            img_response.raise_for_status()
            
            filepath = os.path.join(UPLOAD_DIR, filename)
            with open(filepath, 'wb') as f:
                f.write(img_response.content)
            
            return True
        else:
            print(f"  ✗ {filename}: Tidak ada gambar ditemukan untuk keyword '{keyword}'")
            return False
    except Exception as e:
        print(f"  ✗ {filename}: Error - {e}")
        return False

def download_from_direct_url(url, filename):
    """Download gambar dari URL langsung dengan proper headers dan rate limit protection"""
    try:
        # Add user-agent to avoid 403 errors
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
        
        # Add delay to avoid rate limiting
        time.sleep(2)  # 2 second delay between requests
        
        response = requests.get(url, headers=headers, timeout=30)
        response.raise_for_status()
        
        filepath = os.path.join(UPLOAD_DIR, filename)
        with open(filepath, 'wb') as f:
            f.write(response.content)
        
        return True
    except Exception as e:
        print(f"  ✗ {filename}: Error - {e}")
        return False

# URL langsung untuk gambar spesifik (public domain / free to use)
# Menggunakan sumber alternatif yang mungkin tidak diblokir
DIRECT_IMAGE_URLS = {
    # Sejarah Indonesia (alternatif sources)
    'proklamasi.jpg': 'https://upload.wikimedia.org/wikipedia/commons/9/98/Proklamasi_Republik_Indonesia.jpg',
    'diponegoro.jpg': 'https://upload.wikimedia.org/wikipedia/commons/1/12/Prince_Diponegoro.jpg',
    
    # Peta (alternatif sources)
    'peta_indonesia.jpg': 'https://upload.wikimedia.org/wikipedia/commons/0/02/Indonesia_location_map.svg',
    'peta_jawa.jpg': 'https://upload.wikimedia.org/wikipedia/commons/6/62/Java_map.png',
    'peta_gunung.jpg': 'https://upload.wikimedia.org/wikipedia/commons/2/22/Indonesia_volcanoes_map.png'
}

# Alternative sources untuk geometri (dari situs pendidikan)
GEOMETRY_IMAGE_URLS = {
    'geometri_segitiga.jpg': 'https://www.mathsisfun.com/images/triangle.svg',
    'persegi_panjang.jpg': 'https://www.mathsisfun.com/images/rectangle.svg',
    'kubus.jpg': 'https://www.mathsisfun.com/images/cube.svg',
    'balok.jpg': 'https://www.mathsisfun.com/images/rectangular-prism.svg',
    'tabung.jpg': 'https://www.mathsisfun.com/images/cylinder.svg',
    'kerucut.jpg': 'https://www.mathsisfun.com/images/cone.svg',
    'bola.jpg': 'https://www.mathsisfun.com/images/sphere.svg'
}

def main():
    print("=== DOWNLOAD GAMBAR PRODUKSI DARI INTERNET ===\n")
    
    # Pastikan directory ada
    if not os.path.exists(UPLOAD_DIR):
        os.makedirs(UPLOAD_DIR)
        print(f"Directory dibuat: {UPLOAD_DIR}")
    
    # Download dari URL langsung (Wikipedia - public domain)
    print("=== DOWNLOAD DARI WIKIMEDIA (PUBLIC DOMAIN) ===\n")
    downloaded = 0
    failed = 0
    
    for filename, url in DIRECT_IMAGE_URLS.items():
        filepath = os.path.join(UPLOAD_DIR, filename)
        
        # Hapus file yang sudah ada untuk force download
        if os.path.exists(filepath):
            os.remove(filepath)
        
        print(f"Downloading {filename}...")
        if download_from_direct_url(url, filename):
            print(f"  ✓ {filename} berhasil didownload")
            downloaded += 1
        else:
            print(f"  ✗ {filename} gagal didownload")
            failed += 1
    
    print(f"\n=== HASIL DOWNLOAD WIKIMEDIA ===")
    print(f"Berhasil: {downloaded}")
    print(f"Gagal: {failed}")
    
    # Download dari API stock photos (Unsplash/Pexels/Pixabay)
    print(f"\n=== DOWNLOAD DARI STOCK PHOTO APIs ===\n")
    print("Catatan: Untuk menggunakan fitur ini, Anda perlu:")
    print("1. Daftar di https://unsplash.com/developers untuk mendapatkan API key")
    print("2. Daftar di https://www.pexels.com/api/ untuk mendapatkan API key")
    print("3. Daftar di https://pixabay.com/api/docs/ untuk mendapatkan API key")
    print("4. Update API keys di script ini")
    print(f"\nUntuk sekarang, menggunakan gambar programatik yang sudah dibuat.")
    
    api_downloaded = 0
    api_failed = 0
    
    # Coba download dari Unsplash jika API key tersedia
    if UNSPLASH_ACCESS_KEY != 'YOUR_UNSPLASH_ACCESS_KEY':
        print(f"\n=== MENCoba DOWNLOAD DARI UNSPLASH ===\n")
        
        for filename, keyword in IMAGE_KEYWORDS.items():
            filepath = os.path.join(UPLOAD_DIR, filename)
            
            # Skip jika sudah ada
            if os.path.exists(filepath):
                continue
            
            print(f"Downloading {filename} (keyword: {keyword})...")
            if download_from_unsplash(keyword, filename):
                print(f"  ✓ {filename} berhasil didownload")
                api_downloaded += 1
            else:
                print(f"  ✗ {filename} gagal didownload")
                api_failed += 1
        
        print(f"\n=== HASIL DOWNLOAD UNSPLASH ===")
        print(f"Berhasil: {api_downloaded}")
        print(f"Gagal: {api_failed}")
    
    print(f"\n=== SELESAI ===")
    print(f"Total gambar yang diproses: {downloaded + api_downloaded}")
    print(f"Lokasi: {os.path.abspath(UPLOAD_DIR)}")
    print(f"\n=== CATATAN ===")
    print("Gambar dari Wikimedia Commons adalah public domain.")
    print("Untuk gambar geometri/spasial, menggunakan gambar programatik berkualitas tinggi.")
    print("Jika ingin menggunakan gambar dari stock photo sites, daftar API key dan update script.")

if __name__ == "__main__":
    main()
