#!/usr/bin/env python3
"""
Script untuk generate placeholder images untuk testing soal bergambar
Menggunakan PIL untuk membuat gambar sederhana
"""

from PIL import Image, ImageDraw, ImageFont
import os

# Directory untuk menyimpan gambar
UPLOAD_DIR = 'uploads/soal/'

# Daftar gambar yang perlu dibuat
IMAGES_TO_CREATE = [
    # Geometri
    {'filename': 'geometri_segitiga.jpg', 'type': 'triangle', 'color': 'blue'},
    {'filename': 'persegi_panjang.jpg', 'type': 'rectangle', 'color': 'green'},
    {'filename': 'kubus.jpg', 'type': 'cube', 'color': 'red'},
    {'filename': 'balok.jpg', 'type': 'box', 'color': 'orange'},
    
    # Rotasi
    {'filename': 'rotasi_90.jpg', 'type': 'rotation', 'color': 'purple'},
    {'filename': 'rotasi_opsi_a.jpg', 'type': 'rotation_a', 'color': 'lightblue'},
    {'filename': 'rotasi_opsi_b.jpg', 'type': 'rotation_b', 'color': 'lightgreen'},
    {'filename': 'rotasi_opsi_c.jpg', 'type': 'rotation_c', 'color': 'lightyellow'},
    {'filename': 'rotasi_opsi_d.jpg', 'type': 'rotation_d', 'color': 'lightcoral'},
    {'filename': 'rotasi_opsi_e.jpg', 'type': 'rotation_e', 'color': 'lightpink'},
    
    # Cermin
    {'filename': 'cermin_asli.jpg', 'type': 'mirror_original', 'color': 'darkblue'},
    {'filename': 'cermin_a.jpg', 'type': 'mirror_a', 'color': 'cyan'},
    {'filename': 'cermin_b.jpg', 'type': 'mirror_b', 'color': 'magenta'},
    {'filename': 'cermin_c.jpg', 'type': 'mirror_c', 'color': 'yellow'},
    {'filename': 'cermin_d.jpg', 'type': 'mirror_d', 'color': 'lime'},
    {'filename': 'cermin_e.jpg', 'type': 'mirror_e', 'color': 'pink'},
    
    # Lipatan
    {'filename': 'lipatan.jpg', 'type': 'folding', 'color': 'brown'},
    {'filename': 'lipatan_a.jpg', 'type': 'folding_a', 'color': 'tan'},
    {'filename': 'lipatan_b.jpg', 'type': 'folding_b', 'color': 'beige'},
    {'filename': 'lipatan_c.jpg', 'type': 'folding_c', 'color': 'navy'},
    {'filename': 'lipatan_d.jpg', 'type': 'folding_d', 'color': 'maroon'},
    {'filename': 'lipatan_e.jpg', 'type': 'folding_e', 'color': 'olive'},
    
    # Pola Spasial
    {'filename': 'pola_spatial.jpg', 'type': 'pattern', 'color': 'teal'},
    {'filename': 'pola_a.jpg', 'type': 'pattern_a', 'color': 'violet'},
    {'filename': 'pola_b.jpg', 'type': 'pattern_b', 'color': 'indigo'},
    {'filename': 'pola_c.jpg', 'type': 'pattern_c', 'color': 'salmon'},
    {'filename': 'pola_d.jpg', 'type': 'pattern_d', 'color': 'crimson'},
    {'filename': 'pola_e.jpg', 'type': 'pattern_e', 'color': 'gold'},
    
    # Bangun Ruang
    {'filename': 'tabung.jpg', 'type': 'cylinder', 'color': 'skyblue'},
    {'filename': 'kerucut.jpg', 'type': 'cone', 'color': 'coral'},
    {'filename': 'bola.jpg', 'type': 'sphere', 'color': 'tomato'},
    
    # Proyeksi
    {'filename': 'proyeksi_3d.jpg', 'type': 'projection', 'color': 'slategray'},
    {'filename': 'proyeksi_a.jpg', 'type': 'proj_a', 'color': 'silver'},
    {'filename': 'proyeksi_b.jpg', 'type': 'proj_b', 'color': 'gray'},
    {'filename': 'proyeksi_c.jpg', 'type': 'proj_c', 'color': 'dimgray'},
    {'filename': 'proyeksi_d.jpg', 'type': 'proj_d', 'color': 'black'},
    {'filename': 'proyeksi_e.jpg', 'type': 'proj_e', 'color': 'white'},
    
    # Rotasi 3D
    {'filename': 'kubus_rotasi.jpg', 'type': 'cube_rot', 'color': 'darkgreen'},
    {'filename': 'kubus_rot_a.jpg', 'type': 'cube_rot_a', 'color': 'forestgreen'},
    {'filename': 'kubus_rot_b.jpg', 'type': 'cube_rot_b', 'color': 'limegreen'},
    {'filename': 'kubus_rot_c.jpg', 'type': 'cube_rot_c', 'color': 'mediumseagreen'},
    {'filename': 'kubus_rot_d.jpg', 'type': 'cube_rot_d', 'color': 'darkseagreen'},
    {'filename': 'kubus_rot_e.jpg', 'type': 'cube_rot_e', 'color': 'seagreen'},
    
    # Peta
    {'filename': 'peta_indonesia.jpg', 'type': 'map', 'color': 'steelblue'},
    {'filename': 'peta_jawa.jpg', 'type': 'map_jawa', 'color': 'royalblue'},
    {'filename': 'peta_gunung.jpg', 'type': 'map_mountain', 'color': 'firebrick'},
    
    # Sejarah
    {'filename': 'proklamasi.jpg', 'type': 'history', 'color': 'darkred'},
    {'filename': 'diponegoro.jpg', 'type': 'hero', 'color': 'darkgoldenrod'}
]

COLOR_MAP = {
    'blue': (0, 0, 255),
    'green': (0, 128, 0),
    'red': (255, 0, 0),
    'orange': (255, 165, 0),
    'purple': (128, 0, 128),
    'lightblue': (173, 216, 230),
    'lightgreen': (144, 238, 144),
    'lightyellow': (255, 255, 224),
    'lightcoral': (240, 128, 128),
    'lightpink': (255, 182, 193),
    'darkblue': (0, 0, 139),
    'cyan': (0, 255, 255),
    'magenta': (255, 0, 255),
    'yellow': (255, 255, 0),
    'lime': (0, 255, 0),
    'pink': (255, 192, 203),
    'brown': (165, 42, 42),
    'tan': (210, 180, 140),
    'beige': (245, 245, 220),
    'navy': (0, 0, 128),
    'maroon': (128, 0, 0),
    'olive': (128, 128, 0),
    'teal': (0, 128, 128),
    'violet': (238, 130, 238),
    'indigo': (75, 0, 130),
    'salmon': (250, 128, 114),
    'crimson': (220, 20, 60),
    'gold': (255, 215, 0),
    'skyblue': (135, 206, 235),
    'coral': (255, 127, 80),
    'tomato': (255, 99, 71),
    'slategray': (112, 128, 144),
    'silver': (192, 192, 192),
    'gray': (128, 128, 128),
    'dimgray': (105, 105, 105),
    'black': (0, 0, 0),
    'white': (255, 255, 255),
    'darkgreen': (0, 100, 0),
    'forestgreen': (34, 139, 34),
    'limegreen': (50, 205, 50),
    'mediumseagreen': (60, 179, 113),
    'darkseagreen': (47, 79, 79),
    'seagreen': (46, 139, 87),
    'steelblue': (70, 130, 180),
    'royalblue': (65, 105, 225),
    'firebrick': (178, 34, 34),
    'darkred': (139, 0, 0),
    'darkgoldenrod': (184, 134, 11)
}

def create_placeholder_image(filename, img_type, color):
    """Buat gambar placeholder sederhana"""
    width, height = 400, 300
    img = Image.new('RGB', (width, height), color=COLOR_MAP.get(color, (200, 200, 200)))
    draw = ImageDraw.Draw(img)
    
    # Tambahkan teks
    text = f"PLACEHOLDER\n{filename}\nType: {img_type}"
    
    # Tambahkan bentuk sederhana berdasarkan tipe
    if 'triangle' in img_type:
        # Gambar segitiga
        draw.polygon([(200, 50), (100, 250), (300, 250)], fill=(255, 255, 255), outline=(0, 0, 0))
    elif 'rectangle' in img_type:
        # Gambar persegi panjang
        draw.rectangle([100, 100, 300, 200], fill=(255, 255, 255), outline=(0, 0, 0))
    elif 'cube' in img_type or 'box' in img_type:
        # Gambar kubus sederhana
        draw.rectangle([100, 100, 200, 200], fill=(255, 255, 255), outline=(0, 0, 0))
        draw.rectangle([150, 150, 250, 250], fill=(200, 200, 200), outline=(0, 0, 0))
    elif 'rotation' in img_type:
        # Gambar panah rotasi
        draw.ellipse([150, 50, 250, 150], fill=(255, 255, 255), outline=(0, 0, 0))
        draw.line([(200, 100), (200, 250)], fill=(0, 0, 0), width=3)
    elif 'mirror' in img_type:
        # Gambar simetri
        draw.rectangle([120, 80, 180, 220], fill=(255, 255, 255), outline=(0, 0, 0))
        draw.rectangle([220, 80, 280, 220], fill=(200, 200, 200), outline=(0, 0, 0))
    elif 'folding' in img_type:
        # Gambar garis lipatan
        draw.rectangle([100, 100, 300, 200], fill=(255, 255, 255), outline=(0, 0, 0))
        draw.line([(200, 100), (200, 200)], fill=(255, 0, 0), width=3)
    elif 'pattern' in img_type:
        # Gambar pola
        for i in range(3):
            draw.ellipse([100 + i*80, 100, 140 + i*80, 140], fill=(255, 255, 255), outline=(0, 0, 0))
    elif 'cylinder' in img_type:
        # Gambar tabung
        draw.ellipse([150, 80, 250, 120], fill=(255, 255, 255), outline=(0, 0, 0))
        draw.rectangle([150, 100, 250, 200], fill=(200, 200, 200), outline=(0, 0, 0))
        draw.ellipse([150, 180, 250, 220], fill=(255, 255, 255), outline=(0, 0, 0))
    elif 'cone' in img_type:
        # Gambar kerucut
        draw.polygon([(200, 50), (100, 200), (300, 200)], fill=(255, 255, 255), outline=(0, 0, 0))
        draw.ellipse([150, 180, 250, 220], fill=(200, 200, 200), outline=(0, 0, 0))
    elif 'sphere' in img_type:
        # Gambar bola
        draw.ellipse([150, 80, 250, 220], fill=(255, 255, 255), outline=(0, 0, 0))
    elif 'map' in img_type:
        # Gambar peta sederhana
        draw.rectangle([80, 60, 320, 240], fill=(255, 255, 255), outline=(0, 0, 0))
        draw.ellipse([120, 100, 160, 140], fill=(100, 100, 100), outline=(0, 0, 0))
        draw.ellipse([200, 120, 280, 180], fill=(150, 150, 150), outline=(0, 0, 0))
    elif 'history' in img_type or 'hero' in img_type:
        # Gambar placeholder foto
        draw.rectangle([120, 80, 280, 220], fill=(255, 255, 255), outline=(0, 0, 0))
        draw.ellipse([170, 120, 230, 180], fill=(200, 200, 200), outline=(0, 0, 0))
    else:
        # Default: kotak dengan teks
        draw.rectangle([50, 50, 350, 250], fill=(255, 255, 255), outline=(0, 0, 0))
    
    # Tambahkan teks label
    try:
        font = ImageFont.truetype("arial.ttf", 20)
    except:
        font = ImageFont.load_default()
    
    # Gambar teks di tengah
    text_lines = text.split('\n')
    y_offset = 120
    for line in text_lines:
        bbox = draw.textbbox((0, 0), line, font=font)
        text_width = bbox[2] - bbox[0]
        x_position = (width - text_width) // 2
        draw.text((x_position, y_offset), line, fill=(0, 0, 0), font=font)
        y_offset += 25
    
    return img

def main():
    print("=== GENERATE PLACEHOLDER IMAGES ===\n")
    
    # Pastikan directory ada
    if not os.path.exists(UPLOAD_DIR):
        os.makedirs(UPLOAD_DIR)
        print(f"Directory dibuat: {UPLOAD_DIR}")
    
    # Generate gambar
    created = 0
    skipped = 0
    
    for img_info in IMAGES_TO_CREATE:
        filename = img_info['filename']
        img_type = img_info['type']
        color = img_info['color']
        filepath = os.path.join(UPLOAD_DIR, filename)
        
        # Cek apakah file sudah ada
        if os.path.exists(filepath):
            print(f"⊘ {filename} sudah ada, dilewati")
            skipped += 1
            continue
        
        # Buat gambar
        try:
            img = create_placeholder_image(filename, img_type, color)
            img.save(filepath, 'JPEG', quality=85)
            print(f"✓ {filename} berhasil dibuat")
            created += 1
        except Exception as e:
            print(f"✗ {filename} gagal dibuat: {e}")
    
    print(f"\n=== HASIL ===")
    print(f"Gambar yang dibuat: {created}")
    print(f"Gambar yang dilewati (sudah ada): {skipped}")
    print(f"Total: {created + skipped}")
    print(f"\nLokasi: {os.path.abspath(UPLOAD_DIR)}")

if __name__ == "__main__":
    main()
