#!/usr/bin/env python3
"""
Script untuk membuat gambar sejarah dan peta dengan kualitas tinggi
Menggantikan gambar yang gagal didownload dari Wikimedia Commons
"""

from PIL import Image, ImageDraw, ImageFont
import os

UPLOAD_DIR = 'uploads/soal/'

def create_proklamasi_image():
    """Buat gambar ilustrasi Proklamasi Kemerdekaan"""
    img = Image.new('RGB', (400, 300), (255, 255, 255))
    draw = ImageDraw.Draw(img)
    
    # Background
    draw.rectangle([0, 0, 400, 300], fill=(240, 240, 220))
    
    # Text area
    draw.rectangle([50, 50, 350, 250], fill=(255, 255, 255), outline=(0, 0, 0), width=3)
    
    # Red and White flag colors
    draw.rectangle([100, 80, 300, 120], fill=(255, 0, 0), outline=(0, 0, 0), width=2)
    draw.rectangle([100, 120, 300, 160], fill=(255, 255, 255), outline=(0, 0, 0), width=2)
    
    # Text
    try:
        font_large = ImageFont.truetype("arial.ttf", 24)
        font_small = ImageFont.truetype("arial.ttf", 16)
    except:
        font_large = ImageFont.load_default()
        font_small = ImageFont.load_default()
    
    draw.text((200, 40), "PROKLAMASI", fill=(0, 0, 0), font=font_large, anchor="mm")
    draw.text((200, 200), "17 Agustus 1945", fill=(0, 0, 0), font=font_small, anchor="mm")
    draw.text((200, 230), "Jakarta", fill=(0, 0, 0), font=font_small, anchor="mm")
    
    img.save(os.path.join(UPLOAD_DIR, 'proklamasi.jpg'), 'JPEG', quality=95)
    print("✓ proklamasi.jpg dibuat")

def create_diponegoro_image():
    """Buat gambar ilustrasi Pangeran Diponegoro"""
    img = Image.new('RGB', (400, 300), (255, 255, 255))
    draw = ImageDraw.Draw(img)
    
    # Background
    draw.rectangle([0, 0, 400, 300], fill=(245, 235, 220))
    
    # Figure silhouette
    draw.ellipse([150, 60, 250, 140], fill=(139, 69, 19), outline=(0, 0, 0), width=2)  # Head
    draw.rectangle([160, 140, 240, 220], fill=(139, 69, 19), outline=(0, 0, 0), width=2)  # Body
    draw.rectangle([120, 160, 160, 200], fill=(139, 69, 19), outline=(0, 0, 0), width=2)  # Left arm
    draw.rectangle([240, 160, 280, 200], fill=(139, 69, 19), outline=(0, 0, 0), width=2)  # Right arm
    draw.rectangle([170, 220, 190, 280], fill=(0, 0, 0), outline=(0, 0, 0), width=2)  # Left leg
    draw.rectangle([210, 220, 230, 280], fill=(0, 0, 0), outline=(0, 0, 0), width=2)  # Right leg
    
    # Kris (traditional weapon)
    draw.line([(280, 180), (320, 140)], fill=(100, 100, 100), width=4)
    
    # Text
    try:
        font = ImageFont.truetype("arial.ttf", 20)
    except:
        font = ImageFont.load_default()
    
    draw.text((200, 290), "Pangeran Diponegoro", fill=(0, 0, 0), font=font, anchor="mm")
    
    img.save(os.path.join(UPLOAD_DIR, 'diponegoro.jpg'), 'JPEG', quality=95)
    print("✓ diponegoro.jpg dibuat")

def create_peta_indonesia_image():
    """Buat peta Indonesia sederhana"""
    img = Image.new('RGB', (400, 300), (135, 206, 250))  # Ocean blue background
    draw = ImageDraw.Draw(img)
    
    # Sumatera (west)
    draw.polygon([(80, 80), (120, 70), (130, 150), (100, 180), (70, 160)], fill=(34, 139, 34), outline=(0, 0, 0), width=2)
    
    # Java (center)
    draw.polygon([(180, 180), (220, 170), (240, 200), (220, 220), (180, 210)], fill=(34, 139, 34), outline=(0, 0, 0), width=2)
    
    # Kalimantan (northwest)
    draw.polygon([(200, 80), (280, 70), (300, 130), (260, 160), (200, 140)], fill=(34, 139, 34), outline=(0, 0, 0), width=2)
    
    # Sulawesi (east)
    draw.polygon([(280, 180), (320, 170), (340, 220), (300, 240), (280, 200)], fill=(34, 139, 34), outline=(0, 0, 0), width=2)
    
    # Papua (east)
    draw.polygon([(320, 100), (380, 90), (390, 180), (340, 200), (320, 150)], fill=(34, 139, 34), outline=(0, 0, 0), width=2)
    
    # Labels
    try:
        font = ImageFont.truetype("arial.ttf", 12)
    except:
        font = ImageFont.load_default()
    
    draw.text((100, 130), "Sumatera", fill=(255, 255, 255), font=font)
    draw.text((200, 200), "Jawa", fill=(255, 255, 255), font=font)
    draw.text((250, 120), "Kalimantan", fill=(255, 255, 255), font=font)
    draw.text((300, 210), "Sulawesi", fill=(255, 255, 255), font=font)
    draw.text((350, 150), "Papua", fill=(255, 255, 255), font=font)
    
    img.save(os.path.join(UPLOAD_DIR, 'peta_indonesia.jpg'), 'JPEG', quality=95)
    print("✓ peta_indonesia.jpg dibuat")

def create_peta_jawa_image():
    """Buat peta Jawa sederhana"""
    img = Image.new('RGB', (400, 300), (135, 206, 250))
    draw = ImageDraw.Draw(img)
    
    # Java island shape
    draw.polygon([(50, 100), (150, 80), (250, 90), (350, 120), (340, 180), (300, 220), (200, 230), (100, 220), (40, 180)], 
                 fill=(34, 139, 34), outline=(0, 0, 0), width=3)
    
    # Province boundaries (simplified)
    draw.line([(150, 80), (150, 220)], fill=(255, 255, 255), width=2)  # West-Central
    draw.line([(250, 90), (250, 230)], fill=(255, 255, 255), width=2)  # Central-East
    
    # Labels
    try:
        font = ImageFont.truetype("arial.ttf", 14)
    except:
        font = ImageFont.load_default()
    
    draw.text((100, 150), "Jawa Barat", fill=(255, 255, 255), font=font)
    draw.text((200, 160), "Jawa Tengah", fill=(255, 255, 255), font=font)
    draw.text((300, 170), "Jawa Timur", fill=(255, 255, 255), font=font)
    
    # Jakarta marker
    draw.ellipse([145, 195, 155, 205], fill=(255, 0, 0), outline=(255, 255, 255), width=2)
    draw.text((150, 210), "DKI", fill=(255, 255, 255), font=font)
    
    img.save(os.path.join(UPLOAD_DIR, 'peta_jawa.jpg'), 'JPEG', quality=95)
    print("✓ peta_jawa.jpg dibuat")

def create_peta_gunung_image():
    """Buat peta gunung berapi Indonesia"""
    img = Image.new('RGB', (400, 300), (135, 206, 250))
    draw = ImageDraw.Draw(img)
    
    # Simplified map
    draw.polygon([(50, 100), (150, 80), (250, 90), (350, 120), (340, 180), (300, 220), (200, 230), (100, 220), (40, 180)], 
                 fill=(34, 139, 34), outline=(0, 0, 0), width=2)
    
    # Volcanoes (red triangles)
    volcanoes = [
        (150, 150),  # Merapi area
        (200, 160),  # Bromo area
        (250, 140),  # Rinjani area
        (100, 130),  # Kerinci area
        (280, 170)   # Semeru area
    ]
    
    for vx, vy in volcanoes:
        # Triangle for volcano
        draw.polygon([(vx, vy-15), (vx-12, vy+10), (vx+12, vy+10)], fill=(255, 69, 0), outline=(0, 0, 0), width=2)
        # Smoke
        draw.ellipse([vx-5, vy-25, vx+5, vy-15], fill=(200, 200, 200), outline=(0, 0, 0), width=1)
    
    # Labels
    try:
        font = ImageFont.truetype("arial.ttf", 12)
    except:
        font = ImageFont.load_default()
    
    draw.text((140, 175), "Merapi", fill=(255, 255, 255), font=font)
    draw.text((190, 185), "Bromo", fill=(255, 255, 255), font=font)
    draw.text((240, 165), "Rinjani", fill=(255, 255, 255), font=font)
    draw.text((90, 155), "Kerinci", fill=(255, 255, 255), font=font)
    draw.text((270, 195), "Semeru", fill=(255, 255, 255), font=font)
    
    img.save(os.path.join(UPLOAD_DIR, 'peta_gunung.jpg'), 'JPEG', quality=95)
    print("✓ peta_gunung.jpg dibuat")

def main():
    print("=== MEMBUAT GAMBAR SEJARAH DAN PETA ===\n")
    
    # Pastikan directory ada
    if not os.path.exists(UPLOAD_DIR):
        os.makedirs(UPLOAD_DIR)
        print(f"Directory dibuat: {UPLOAD_DIR}")
    
    # Buat gambar
    create_proklamasi_image()
    create_diponegoro_image()
    create_peta_indonesia_image()
    create_peta_jawa_image()
    create_peta_gunung_image()
    
    print(f"\n=== SELESAI ===")
    print(f"Total gambar yang dibuat: 5")
    print(f"Lokasi: {os.path.abspath(UPLOAD_DIR)}")

if __name__ == "__main__":
    main()
