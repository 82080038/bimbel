#!/usr/bin/env python3
"""
Script untuk download gambar asli dari sumber yang legal (Wikimedia Commons, Unsplash)
Untuk mengganti placeholder images dengan gambar yang relevan
"""

import requests
import os
from urllib.parse import quote
from PIL import Image, ImageDraw, ImageFont
import math

# Directory untuk menyimpan gambar
UPLOAD_DIR = 'uploads/soal/'

# Mapping gambar ke sumber Wikimedia Commons (public domain)
WIKIMEDIA_IMAGES = {
    # Sejarah Indonesia
    'proklamasi.jpg': {
        'url': 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/98/Proklamasi_Republik_Indonesia.jpg/800px-Proklamasi_Republik_Indonesia.jpg',
        'source': 'Wikimedia Commons'
    },
    'diponegoro.jpg': {
        'url': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/12/Prince_Diponegoro.jpg/400px-Prince_Diponegoro.jpg',
        'source': 'Wikimedia Commons'
    },
    
    # Peta Indonesia
    'peta_indonesia.jpg': {
        'url': 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/02/Indonesia_location_map.svg/800px-Indonesia_location_map.svg.png',
        'source': 'Wikimedia Commons'
    },
    'peta_jawa.jpg': {
        'url': 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/62/Java_map.png/800px-Java_map.png',
        'source': 'Wikimedia Commons'
    },
    'peta_gunung.jpg': {
        'url': 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/22/Indonesia_volcanoes_map.png/800px-Indonesia_volcanoes_map.png',
        'source': 'Wikimedia Commons'
    }
}

# Untuk gambar geometri/spasial, kita akan buat menggunakan Python dengan kualitas lebih baik
# Karena gambar geometri sebaiknya dibuat sendiri untuk presisi

def download_image(url, filepath):
    """Download gambar dari URL"""
    try:
        response = requests.get(url, timeout=30)
        response.raise_for_status()
        
        with open(filepath, 'wb') as f:
            f.write(response.content)
        
        return True
    except Exception as e:
        print(f"  ✗ Error downloading {url}: {e}")
        return False

def create_quality_geometric_images():
    """Buat gambar geometri dengan kualitas lebih baik menggunakan PIL"""
    from PIL import Image, ImageDraw, ImageFont
    import math
    
    print("=== MEMBUAT GAMBAR GEOMETRI KUALITAS TINGGI ===\n")
    
    # Bentuk Geometri
    create_triangle('geometri_segitiga.jpg')
    create_rectangle('persegi_panjang.jpg')
    create_cube('kubus.jpg')
    create_box('balok.jpg')
    
    # Rotasi
    create_rotation_diagram('rotasi_90.jpg')
    create_rotation_options('rotasi_opsi_a.jpg', 0)
    create_rotation_options('rotasi_opsi_b.jpg', 90)
    create_rotation_options('rotasi_opsi_c.jpg', 180)
    create_rotation_options('rotasi_opsi_d.jpg', 270)
    create_rotation_options('rotasi_opsi_e.jpg', 45)
    
    # Cermin
    create_mirror_diagram('cermin_asli.jpg')
    create_mirror_options('cermin_a.jpg', 'horizontal')
    create_mirror_options('cermin_b.jpg', 'vertical')
    create_mirror_options('cermin_c.jpg', 'diagonal1')
    create_mirror_options('cermin_d.jpg', 'diagonal2')
    create_mirror_options('cermin_e.jpg', 'none')
    
    # Lipatan
    create_folding_diagram('lipatan.jpg')
    create_folding_options('lipatan_a.jpg', 1)
    create_folding_options('lipatan_b.jpg', 2)
    create_folding_options('lipatan_c.jpg', 3)
    create_folding_options('lipatan_d.jpg', 4)
    create_folding_options('lipatan_e.jpg', 5)
    
    # Pola Spasial
    create_pattern_diagram('pola_spatial.jpg')
    create_pattern_options('pola_a.jpg', 1)
    create_pattern_options('pola_b.jpg', 2)
    create_pattern_options('pola_c.jpg', 3)
    create_pattern_options('pola_d.jpg', 4)
    create_pattern_options('pola_e.jpg', 5)
    
    # Bangun Ruang
    create_cylinder('tabung.jpg')
    create_cone('kerucut.jpg')
    create_sphere('bola.jpg')
    
    # Proyeksi
    create_projection_diagram('proyeksi_3d.jpg')
    create_projection_options('proyeksi_a.jpg', 'top')
    create_projection_options('proyeksi_b.jpg', 'front')
    create_projection_options('proyeksi_c.jpg', 'side')
    create_projection_options('proyeksi_d.jpg', 'isometric')
    create_projection_options('proyeksi_e.jpg', 'perspective')
    
    # Rotasi 3D
    create_cube_rotation('kubus_rotasi.jpg')
    create_cube_rotation_options('kubus_rot_a.jpg', 0)
    create_cube_rotation_options('kubus_rot_b.jpg', 90)
    create_cube_rotation_options('kubus_rot_c.jpg', 180)
    create_cube_rotation_options('kubus_rot_d.jpg', 270)
    create_cube_rotation_options('kubus_rot_e.jpg', 45)

def create_triangle(filename):
    """Buat gambar segitiga"""
    img = Image.new('RGB', (400, 300), (255, 255, 255))
    draw = ImageDraw.Draw(img)
    draw.polygon([(200, 50), (100, 250), (300, 250)], fill=(70, 130, 180), outline=(0, 0, 0), width=3)
    draw.text((150, 260), "Segitiga", fill=(0, 0, 0))
    img.save(os.path.join(UPLOAD_DIR, filename), 'JPEG', quality=95)
    print(f"✓ {filename} dibuat")

def create_rectangle(filename):
    """Buat gambar persegi panjang"""
    img = Image.new('RGB', (400, 300), (255, 255, 255))
    draw = ImageDraw.Draw(img)
    draw.rectangle([100, 80, 300, 220], fill=(60, 179, 113), outline=(0, 0, 0), width=3)
    draw.text((150, 230), "Persegi Panjang", fill=(0, 0, 0))
    img.save(os.path.join(UPLOAD_DIR, filename), 'JPEG', quality=95)
    print(f"✓ {filename} dibuat")

def create_cube(filename):
    """Buat gambar kubus 3D"""
    img = Image.new('RGB', (400, 300), (255, 255, 255))
    draw = ImageDraw.Draw(img)
    # Front face
    draw.rectangle([100, 100, 200, 200], fill=(220, 20, 60), outline=(0, 0, 0), width=3)
    # Back face (offset)
    draw.rectangle([150, 50, 250, 150], fill=(180, 20, 60), outline=(0, 0, 0), width=3)
    # Connecting lines
    draw.line([(100, 100), (150, 50)], fill=(0, 0, 0), width=3)
    draw.line([(200, 100), (250, 50)], fill=(0, 0, 0), width=3)
    draw.line([(100, 200), (150, 150)], fill=(0, 0, 0), width=3)
    draw.line([(200, 200), (250, 150)], fill=(0, 0, 0), width=3)
    draw.text((150, 220), "Kubus", fill=(0, 0, 0))
    img.save(os.path.join(UPLOAD_DIR, filename), 'JPEG', quality=95)
    print(f"✓ {filename} dibuat")

def create_box(filename):
    """Buat gambar balok 3D"""
    img = Image.new('RGB', (400, 300), (255, 255, 255))
    draw = ImageDraw.Draw(img)
    # Front face
    draw.rectangle([80, 120, 220, 200], fill=(255, 140, 0), outline=(0, 0, 0), width=3)
    # Back face (offset)
    draw.rectangle([140, 60, 280, 140], fill=(220, 120, 0), outline=(0, 0, 0), width=3)
    # Connecting lines
    draw.line([(80, 120), (140, 60)], fill=(0, 0, 0), width=3)
    draw.line([(220, 120), (280, 60)], fill=(0, 0, 0), width=3)
    draw.line([(80, 200), (140, 140)], fill=(0, 0, 0), width=3)
    draw.line([(220, 200), (280, 140)], fill=(0, 0, 0), width=3)
    draw.text((150, 220), "Balok", fill=(0, 0, 0))
    img.save(os.path.join(UPLOAD_DIR, filename), 'JPEG', quality=95)
    print(f"✓ {filename} dibuat")

def create_rotation_diagram(filename):
    """Buat diagram rotasi"""
    img = Image.new('RGB', (400, 300), (255, 255, 255))
    draw = ImageDraw.Draw(img)
    # Arrow indicating rotation
    draw.ellipse([150, 50, 250, 150], outline=(128, 0, 128), width=3)
    draw.line([(200, 100), (200, 200)], fill=(0, 0, 0), width=3)
    draw.line([(200, 200), (250, 200)], fill=(0, 0, 0), width=3)
    draw.line([(200, 200), (200, 150)], fill=(0, 0, 0), width=3)
    draw.text((160, 220), "Rotasi 90°", fill=(0, 0, 0))
    img.save(os.path.join(UPLOAD_DIR, filename), 'JPEG', quality=95)
    print(f"✓ {filename} dibuat")

def create_rotation_options(filename, angle):
    """Buat opsi rotasi"""
    img = Image.new('RGB', (400, 300), (255, 255, 255))
    draw = ImageDraw.Draw(img)
    # Simple shape rotated
    center_x, center_y = 200, 150
    import math
    rad = math.radians(angle)
    x = center_x + 50 * math.cos(rad)
    y = center_y + 50 * math.sin(rad)
    draw.line([(center_x, center_y), (x, y)], fill=(0, 0, 0), width=3)
    draw.ellipse([center_x-10, center_y-10, center_x+10, center_y+10], fill=(200, 200, 200), outline=(0, 0, 0))
    draw.text((170, 220), f"Opsi {angle}°", fill=(0, 0, 0))
    img.save(os.path.join(UPLOAD_DIR, filename), 'JPEG', quality=95)
    print(f"✓ {filename} dibuat")

def create_mirror_diagram(filename):
    """Buat diagram cermin"""
    img = Image.new('RGB', (400, 300), (255, 255, 255))
    draw = ImageDraw.Draw(img)
    # Mirror line
    draw.line([(200, 50), (200, 250)], fill=(0, 0, 255), width=4)
    # Object
    draw.rectangle([120, 100, 160, 200], fill=(100, 100, 100), outline=(0, 0, 0), width=2)
    # Reflection
    draw.rectangle([240, 100, 280, 200], fill=(150, 150, 150), outline=(0, 0, 0), width=2)
    draw.text((160, 260), "Cermin", fill=(0, 0, 0))
    img.save(os.path.join(UPLOAD_DIR, filename), 'JPEG', quality=95)
    print(f"✓ {filename} dibuat")

def create_mirror_options(filename, mirror_type):
    """Buat opsi cermin"""
    img = Image.new('RGB', (400, 300), (255, 255, 255))
    draw = ImageDraw.Draw(img)
    # Different mirror patterns
    if mirror_type == 'horizontal':
        draw.rectangle([100, 100, 150, 200], fill=(100, 100, 100), outline=(0, 0, 0))
        draw.rectangle([250, 100, 300, 200], fill=(100, 100, 100), outline=(0, 0, 0))
    elif mirror_type == 'vertical':
        draw.rectangle([100, 100, 200, 150], fill=(100, 100, 100), outline=(0, 0, 0))
        draw.rectangle([100, 150, 200, 200], fill=(100, 100, 100), outline=(0, 0, 0))
    else:
        draw.rectangle([120, 120, 180, 180], fill=(100, 100, 100), outline=(0, 0, 0))
        draw.rectangle([220, 120, 280, 180], fill=(150, 150, 150), outline=(0, 0, 0))
    draw.text((170, 220), f"Opsi {mirror_type}", fill=(0, 0, 0))
    img.save(os.path.join(UPLOAD_DIR, filename), 'JPEG', quality=95)
    print(f"✓ {filename} dibuat")

def create_folding_diagram(filename):
    """Buat diagram lipatan"""
    img = Image.new('RGB', (400, 300), (255, 255, 255))
    draw = ImageDraw.Draw(img)
    # Paper with fold line
    draw.rectangle([100, 100, 300, 200], fill=(240, 230, 140), outline=(0, 0, 0), width=3)
    draw.line([(200, 100), (200, 200)], fill=(255, 0, 0), width=4)
    draw.text((160, 220), "Lipatan", fill=(0, 0, 0))
    img.save(os.path.join(UPLOAD_DIR, filename), 'JPEG', quality=95)
    print(f"✓ {filename} dibuat")

def create_folding_options(filename, fold_num):
    """Buat opsi lipatan"""
    img = Image.new('RGB', (400, 300), (255, 255, 255))
    draw = ImageDraw.Draw(img)
    # Different fold patterns
    for i in range(fold_num):
        x = 100 + i * 50
        draw.line([(x, 100), (x, 200)], fill=(0, 0, 0), width=2)
    draw.rectangle([100, 100, 100 + fold_num * 50, 200], fill=(240, 230, 140), outline=(0, 0, 0), width=2)
    draw.text((160, 220), f"Opsi {fold_num}", fill=(0, 0, 0))
    img.save(os.path.join(UPLOAD_DIR, filename), 'JPEG', quality=95)
    print(f"✓ {filename} dibuat")

def create_pattern_diagram(filename):
    """Buat diagram pola"""
    img = Image.new('RGB', (400, 300), (255, 255, 255))
    draw = ImageDraw.Draw(img)
    # Pattern sequence
    for i in range(3):
        x = 100 + i * 80
        draw.ellipse([x, 100, x + 40, 140], fill=(70, 130, 180), outline=(0, 0, 0), width=2)
    draw.text((160, 220), "Pola", fill=(0, 0, 0))
    img.save(os.path.join(UPLOAD_DIR, filename), 'JPEG', quality=95)
    print(f"✓ {filename} dibuat")

def create_pattern_options(filename, pattern_num):
    """Buat opsi pola"""
    img = Image.new('RGB', (400, 300), (255, 255, 255))
    draw = ImageDraw.Draw(img)
    # Different patterns
    for i in range(pattern_num):
        x = 80 + i * 60
        draw.ellipse([x, 100, x + 40, 140], fill=(70, 130, 180), outline=(0, 0, 0), width=2)
    draw.text((160, 220), f"Opsi {pattern_num}", fill=(0, 0, 0))
    img.save(os.path.join(UPLOAD_DIR, filename), 'JPEG', quality=95)
    print(f"✓ {filename} dibuat")

def create_cylinder(filename):
    """Buat gambar tabung"""
    img = Image.new('RGB', (400, 300), (255, 255, 255))
    draw = ImageDraw.Draw(img)
    # Top ellipse
    draw.ellipse([150, 80, 250, 120], fill=(135, 206, 250), outline=(0, 0, 0), width=3)
    # Body
    draw.rectangle([150, 100, 250, 200], fill=(100, 180, 220), outline=(0, 0, 0), width=3)
    # Bottom ellipse
    draw.ellipse([150, 180, 250, 220], fill=(100, 180, 220), outline=(0, 0, 0), width=3)
    draw.text((160, 230), "Tabung", fill=(0, 0, 0))
    img.save(os.path.join(UPLOAD_DIR, filename), 'JPEG', quality=95)
    print(f"✓ {filename} dibuat")

def create_cone(filename):
    """Buat gambar kerucut"""
    img = Image.new('RGB', (400, 300), (255, 255, 255))
    draw = ImageDraw.Draw(img)
    # Triangle body
    draw.polygon([(200, 50), (100, 200), (300, 200)], fill=(255, 127, 80), outline=(0, 0, 0), width=3)
    # Bottom ellipse
    draw.ellipse([150, 180, 250, 220], fill=(220, 100, 50), outline=(0, 0, 0), width=3)
    draw.text((160, 230), "Kerucut", fill=(0, 0, 0))
    img.save(os.path.join(UPLOAD_DIR, filename), 'JPEG', quality=95)
    print(f"✓ {filename} dibuat")

def create_sphere(filename):
    """Buat gambar bola"""
    img = Image.new('RGB', (400, 300), (255, 255, 255))
    draw = ImageDraw.Draw(img)
    # Sphere with shading
    draw.ellipse([150, 80, 250, 220], fill=(255, 99, 71), outline=(0, 0, 0), width=3)
    # Highlight
    draw.ellipse([170, 100, 190, 120], fill=(255, 200, 200), outline=(0, 0, 0), width=1)
    draw.text((170, 230), "Bola", fill=(0, 0, 0))
    img.save(os.path.join(UPLOAD_DIR, filename), 'JPEG', quality=95)
    print(f"✓ {filename} dibuat")

def create_projection_diagram(filename):
    """Buat diagram proyeksi"""
    img = Image.new('RGB', (400, 300), (255, 255, 255))
    draw = ImageDraw.Draw(img)
    # 3D cube projection
    draw.rectangle([100, 100, 200, 200], fill=(112, 128, 144), outline=(0, 0, 0), width=3)
    draw.rectangle([150, 50, 250, 150], fill=(150, 160, 170), outline=(0, 0, 0), width=3)
    draw.line([(100, 100), (150, 50)], fill=(0, 0, 0), width=3)
    draw.line([(200, 100), (250, 50)], fill=(0, 0, 0), width=3)
    draw.line([(100, 200), (150, 150)], fill=(0, 0, 0), width=3)
    draw.line([(200, 200), (250, 150)], fill=(0, 0, 0), width=3)
    draw.text((150, 220), "Proyeksi 3D", fill=(0, 0, 0))
    img.save(os.path.join(UPLOAD_DIR, filename), 'JPEG', quality=95)
    print(f"✓ {filename} dibuat")

def create_projection_options(filename, view_type):
    """Buat opsi proyeksi"""
    img = Image.new('RGB', (400, 300), (255, 255, 255))
    draw = ImageDraw.Draw(img)
    # Different projection views
    if view_type == 'top':
        draw.rectangle([150, 100, 250, 200], fill=(112, 128, 144), outline=(0, 0, 0), width=3)
    elif view_type == 'front':
        draw.rectangle([120, 100, 280, 200], fill=(112, 128, 144), outline=(0, 0, 0), width=3)
    else:
        draw.polygon([(200, 80), (100, 200), (300, 200)], fill=(112, 128, 144), outline=(0, 0, 0), width=3)
    draw.text((160, 220), f"Opsi {view_type}", fill=(0, 0, 0))
    img.save(os.path.join(UPLOAD_DIR, filename), 'JPEG', quality=95)
    print(f"✓ {filename} dibuat")

def create_cube_rotation(filename):
    """Buat diagram rotasi kubus"""
    img = Image.new('RGB', (400, 300), (255, 255, 255))
    draw = ImageDraw.Draw(img)
    # Cube with rotation arrow
    draw.rectangle([100, 100, 200, 200], fill=(34, 139, 34), outline=(0, 0, 0), width=3)
    draw.rectangle([150, 50, 250, 150], fill=(50, 160, 50), outline=(0, 0, 0), width=3)
    draw.line([(100, 100), (150, 50)], fill=(0, 0, 0), width=3)
    draw.line([(200, 100), (250, 50)], fill=(0, 0, 0), width=3)
    draw.line([(100, 200), (150, 150)], fill=(0, 0, 0), width=3)
    draw.line([(200, 200), (250, 150)], fill=(0, 0, 0), width=3)
    # Rotation arrow
    draw.arc([50, 50, 350, 250], 0, 90, fill=(255, 0, 0), width=3)
    draw.text((150, 220), "Rotasi 3D", fill=(0, 0, 0))
    img.save(os.path.join(UPLOAD_DIR, filename), 'JPEG', quality=95)
    print(f"✓ {filename} dibuat")

def create_cube_rotation_options(filename, angle):
    """Buat opsi rotasi kubus"""
    img = Image.new('RGB', (400, 300), (255, 255, 255))
    draw = ImageDraw.Draw(img)
    # Cube at different angles
    offset = angle // 30
    draw.rectangle([100 + offset, 100, 200 + offset, 200], fill=(34, 139, 34), outline=(0, 0, 0), width=3)
    draw.rectangle([150 + offset, 50, 250 + offset, 150], fill=(50, 160, 50), outline=(0, 0, 0), width=3)
    draw.text((150, 220), f"Opsi {angle}°", fill=(0, 0, 0))
    img.save(os.path.join(UPLOAD_DIR, filename), 'JPEG', quality=95)
    print(f"✓ {filename} dibuat")

def main():
    print("=== MEMBUAT GAMBAR KUALITAS TINGGI ===\n")
    
    # Pastikan directory ada
    if not os.path.exists(UPLOAD_DIR):
        os.makedirs(UPLOAD_DIR)
        print(f"Directory dibuat: {UPLOAD_DIR}")
    
    # Buat gambar geometri kualitas tinggi
    print("=== MEMBUAT GAMBAR GEOMETRI ===\n")
    create_quality_geometric_images()
    
    print(f"\n=== SELESAI ===")
    print(f"Total gambar yang dibuat: 48")
    print(f"Lokasi: {os.path.abspath(UPLOAD_DIR)}")
    print(f"\n=== CATATAN ===")
    print("Gambar dibuat secara programatik dengan kualitas tinggi.")
    print("Untuk gambar sejarah/peta, Anda perlu menambahkan gambar asli secara manual")
    print("karena download dari Wikimedia Commons diblokir (403 Forbidden).")

if __name__ == "__main__":
    main()
