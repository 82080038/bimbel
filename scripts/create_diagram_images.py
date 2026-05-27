#!/usr/bin/env python3
"""
Create diagrammatic images for soal using PIL
Creates actual visual representations instead of text placeholders
"""
from PIL import Image, ImageDraw, ImageFont
import os
import math

IMAGE_DIR = "uploads/soal"
os.makedirs(IMAGE_DIR, exist_ok=True)

def create_triangle():
    """Create a triangle diagram"""
    img = Image.new('RGB', (400, 400), color=(255, 255, 255))
    draw = ImageDraw.Draw(img)
    
    # Draw triangle
    points = [(200, 50), (50, 350), (350, 350)]
    draw.polygon(points, fill=(135, 206, 250), outline=(70, 130, 180), width=3)
    
    # Label vertices
    draw.text((190, 30), 'A', fill=(0, 0, 0), font=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 20))
    draw.text((30, 350), 'B', fill=(0, 0, 0), font=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 20))
    draw.text((350, 350), 'C', fill=(0, 0, 0), font=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 20))
    
    return img

def create_rectangle():
    """Create a rectangle diagram"""
    img = Image.new('RGB', (400, 400), color=(255, 255, 255))
    draw = ImageDraw.Draw(img)
    
    # Draw rectangle
    draw.rectangle([50, 50, 350, 300], fill=(144, 238, 144), outline=(34, 139, 34), width=3)
    
    # Label vertices
    draw.text((40, 40), 'A', fill=(0, 0, 0), font=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 20))
    draw.text((350, 40), 'B', fill=(0, 0, 0), font=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 20))
    draw.text((350, 300), 'C', fill=(0, 0, 0), font=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 20))
    draw.text((40, 300), 'D', fill=(0, 0, 0), font=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 20))
    
    return img

def create_cube():
    """Create a 3D cube diagram"""
    img = Image.new('RGB', (400, 400), color=(255, 255, 255))
    draw = ImageDraw.Draw(img)
    
    # Front face
    draw.rectangle([100, 150, 250, 300], fill=(255, 182, 193), outline=(220, 20, 60), width=3)
    
    # Back face (offset)
    draw.rectangle([150, 100, 300, 250], fill=(255, 218, 223), outline=(220, 20, 60), width=3)
    
    # Connecting lines
    draw.line([(100, 150), (150, 100)], fill=(220, 20, 60), width=3)
    draw.line([(250, 150), (300, 100)], fill=(220, 20, 60), width=3)
    draw.line([(250, 300), (300, 250)], fill=(220, 20, 60), width=3)
    draw.line([(100, 300), (150, 250)], fill=(220, 20, 60), width=3)
    
    return img

def create_balok():
    """Create a 3D rectangular prism (balok) diagram"""
    img = Image.new('RGB', (400, 400), color=(255, 255, 255))
    draw = ImageDraw.Draw(img)
    
    # Front face
    draw.rectangle([80, 150, 280, 300], fill=(173, 216, 230), outline=(0, 0, 139), width=3)
    
    # Back face (offset)
    draw.rectangle([130, 80, 330, 230], fill=(191, 239, 255), outline=(0, 0, 139), width=3)
    
    # Connecting lines
    draw.line([(80, 150), (130, 80)], fill=(0, 0, 139), width=3)
    draw.line([(280, 150), (330, 80)], fill=(0, 0, 139), width=3)
    draw.line([(280, 300), (330, 230)], fill=(0, 0, 139), width=3)
    draw.line([(80, 300), (130, 230)], fill=(0, 0, 139), width=3)
    
    return img

def create_cylinder():
    """Create a cylinder diagram"""
    img = Image.new('RGB', (400, 400), color=(255, 255, 255))
    draw = ImageDraw.Draw(img)
    
    # Top ellipse
    draw.ellipse([100, 50, 300, 120], fill=(255, 165, 0), outline=(255, 140, 0), width=3)
    
    # Body (rectangle)
    draw.rectangle([100, 85, 300, 300], fill=(255, 200, 100), outline=(255, 140, 0), width=3)
    
    # Bottom ellipse
    draw.ellipse([100, 265, 300, 335], fill=(255, 200, 100), outline=(255, 140, 0), width=3)
    
    return img

def create_cone():
    """Create a cone diagram"""
    img = Image.new('RGB', (400, 400), color=(255, 255, 255))
    draw = ImageDraw.Draw(img)
    
    # Triangle body
    draw.polygon([(200, 50), (100, 300), (300, 300)], fill=(147, 112, 219), outline=(75, 0, 130), width=3)
    
    # Bottom ellipse
    draw.ellipse([100, 265, 300, 335], fill=(147, 112, 219), outline=(75, 0, 130), width=3)
    
    return img

def create_sphere():
    """Create a sphere diagram"""
    img = Image.new('RGB', (400, 400), color=(255, 255, 255))
    draw = ImageDraw.Draw(img)
    
    # Main circle
    draw.ellipse([100, 100, 300, 300], fill=(255, 105, 180), outline=(199, 21, 133), width=3)
    
    # Highlight (to make it look 3D)
    draw.ellipse([130, 130, 160, 160], fill=(255, 182, 193), outline=(199, 21, 133), width=2)
    
    return img

def create_mirror_pattern():
    """Create a mirror reflection pattern"""
    img = Image.new('RGB', (400, 400), color=(255, 255, 255))
    draw = ImageDraw.Draw(img)
    
    # Draw mirror line (solid instead of dashed)
    draw.line([(200, 50), (200, 350)], fill=(0, 0, 0), width=2)
    
    # Draw shape on left
    draw.polygon([(100, 150), (50, 250), (150, 250)], fill=(70, 130, 180), outline=(0, 0, 139), width=3)
    
    # Draw mirrored shape on right
    draw.polygon([(300, 150), (350, 250), (250, 250)], fill=(70, 130, 180), outline=(0, 0, 139), width=3)
    
    return img

def create_folding_pattern():
    """Create a paper folding pattern"""
    img = Image.new('RGB', (400, 400), color=(255, 255, 255))
    draw = ImageDraw.Draw(img)
    
    # Draw paper
    draw.rectangle([50, 100, 350, 300], fill=(255, 250, 205), outline=(139, 69, 19), width=3)
    
    # Draw fold lines (solid instead of dashed)
    draw.line([(50, 200), (350, 200)], fill=(139, 69, 19), width=2)
    draw.line([(200, 100), (200, 300)], fill=(139, 69, 19), width=2)
    
    # Draw numbers
    draw.text((100, 130), '1', fill=(0, 0, 0), font=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 30))
    draw.text((280, 130), '2', fill=(0, 0, 0), font=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 30))
    draw.text((100, 230), '3', fill=(0, 0, 0), font=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 30))
    draw.text((280, 230), '4', fill=(0, 0, 0), font=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 30))
    
    return img

def create_spatial_pattern():
    """Create a spatial reasoning pattern"""
    img = Image.new('RGB', (400, 400), color=(255, 255, 255))
    draw = ImageDraw.Draw(img)
    
    # Draw pattern of shapes
    shapes = [
        (80, 80, 'circle'),
        (160, 80, 'square'),
        (240, 80, 'triangle'),
        (80, 160, 'square'),
        (160, 160, 'triangle'),
        (240, 160, 'circle'),
        (80, 240, 'triangle'),
        (160, 240, 'circle'),
        (240, 240, 'square')
    ]
    
    for x, y, shape in shapes:
        if shape == 'circle':
            draw.ellipse([x, y, x+40, y+40], fill=(255, 127, 80), outline=(255, 69, 0), width=2)
        elif shape == 'square':
            draw.rectangle([x, y, x+40, y+40], fill=(60, 179, 113), outline=(0, 100, 0), width=2)
        elif shape == 'triangle':
            draw.polygon([(x+20, y), (x, y+40), (x+40, y+40)], fill=(100, 149, 237), outline=(0, 0, 139), width=2)
    
    return img

def create_indonesia_map():
    """Create a simplified Indonesia map with numbered islands"""
    img = Image.new('RGB', (400, 400), color=(255, 255, 255))
    draw = ImageDraw.Draw(img)
    
    # Draw title
    try:
        title_font = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 16)
        font = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 14)
    except:
        title_font = ImageFont.load_default()
        font = ImageFont.load_default()
    
    draw.text((100, 20), 'PETA INDONESIA', fill=(0, 0, 0), font=title_font)
    
    # Draw simplified islands with numbers
    # Sumatra (1)
    draw.ellipse([50, 100, 130, 280], fill=(144, 238, 144), outline=(34, 139, 34), width=3)
    draw.text((75, 180), '1', fill=(255, 0, 0), font=font)
    draw.text((70, 200), 'Sumatera', fill=(0, 0, 0), font=font)
    
    # Java (2)
    draw.ellipse([140, 220, 300, 260], fill=(144, 238, 144), outline=(34, 139, 34), width=3)
    draw.text((210, 230), '2', fill=(255, 0, 0), font=font)
    draw.text((200, 250), 'Jawa', fill=(0, 0, 0), font=font)
    
    # Kalimantan (3)
    draw.ellipse([250, 80, 370, 200], fill=(144, 238, 144), outline=(34, 139, 34), width=3)
    draw.text((300, 130), '3', fill=(255, 0, 0), font=font)
    draw.text((290, 150), 'Kalimantan', fill=(0, 0, 0), font=font)
    
    # Sulawesi (4)
    draw.ellipse([280, 240, 360, 320], fill=(144, 238, 144), outline=(34, 139, 34), width=3)
    draw.text((310, 270), '4', fill=(255, 0, 0), font=font)
    draw.text((300, 290), 'Sulawesi', fill=(0, 0, 0), font=font)
    
    # Papua (5)
    draw.ellipse([320, 260, 390, 380], fill=(144, 238, 144), outline=(34, 139, 34), width=3)
    draw.text((345, 310), '5', fill=(255, 0, 0), font=font)
    draw.text((335, 330), 'Papua', fill=(0, 0, 0), font=font)
    
    return img

def create_java_map():
    """Create a simplified Java map with numbered provinces"""
    img = Image.new('RGB', (400, 400), color=(255, 255, 255))
    draw = ImageDraw.Draw(img)
    
    # Draw title
    try:
        title_font = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 16)
        font = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 14)
    except:
        title_font = ImageFont.load_default()
        font = ImageFont.load_default()
    
    draw.text((120, 20), 'PETA PULAU JAWA', fill=(0, 0, 0), font=title_font)
    
    # Draw Java island shape (simplified)
    draw.polygon([
        (50, 150), (100, 100), (200, 80), (300, 100), (350, 150),
        (350, 200), (300, 250), (200, 280), (100, 250), (50, 200)
    ], fill=(144, 238, 144), outline=(34, 139, 34), width=3)
    
    # Add numbered provinces with red numbers
    draw.text((80, 130), '1', fill=(255, 0, 0), font=font)
    draw.text((150, 110), '2', fill=(255, 0, 0), font=font)
    draw.text((220, 120), '3', fill=(255, 0, 0), font=font)
    draw.text((280, 140), '4', fill=(255, 0, 0), font=font)
    draw.text((200, 200), '5', fill=(255, 0, 0), font=font)
    
    return img

def create_volcano_map():
    """Create a topographic map with red volcano markers"""
    img = Image.new('RGB', (400, 400), color=(255, 255, 255))
    draw = ImageDraw.Draw(img)
    
    # Draw title
    try:
        title_font = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 16)
        font = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 14)
    except:
        title_font = ImageFont.load_default()
        font = ImageFont.load_default()
    
    draw.text((80, 20), 'PETA GUNUNG BERAPI', fill=(0, 0, 0), font=title_font)
    
    # Draw simplified map background (Indonesia shape)
    draw.rectangle([20, 50, 380, 350], fill=(240, 248, 255), outline=(70, 130, 180), width=2)
    
    # Draw simplified islands
    # Sumatra
    draw.ellipse([40, 100, 100, 250], fill=(144, 238, 144), outline=(34, 139, 34), width=2)
    # Java
    draw.ellipse([120, 200, 280, 240], fill=(144, 238, 144), outline=(34, 139, 34), width=2)
    # Kalimantan
    draw.ellipse([200, 80, 320, 180], fill=(144, 238, 144), outline=(34, 139, 34), width=2)
    # Sulawesi
    draw.ellipse([240, 220, 300, 280], fill=(144, 238, 144), outline=(34, 139, 34), width=2)
    
    # Draw volcano locations with prominent red dots
    volcano_locations = [
        (70, 150),   # Sumatra
        (200, 220),  # Java
        (260, 130),  # Kalimantan
        (270, 250)   # Sulawesi
    ]
    for x, y in volcano_locations:
        # Draw larger red dot
        draw.ellipse([x-12, y-12, x+12, y+12], fill=(255, 0, 0), outline=(139, 0, 0), width=3)
        # Draw smaller inner dot
        draw.ellipse([x-6, y-6, x+6, y+6], fill=(255, 100, 100), outline=(139, 0, 0), width=2)
    
    # Add label
    draw.text((100, 320), 'Titik merah = Lokasi gunung berapi', 
             fill=(0, 0, 0), font=font)
    
    return img

def create_proclamation_image():
    """Create a proclamation image placeholder"""
    img = Image.new('RGB', (400, 400), color=(255, 255, 255))
    draw = ImageDraw.Draw(img)
    
    # Draw flag
    draw.rectangle([50, 50, 350, 150], fill=(255, 0, 0), outline=(0, 0, 0), width=2)
    draw.rectangle([50, 150, 350, 200], fill=(255, 255, 255), outline=(0, 0, 0), width=2)
    
    # Draw text
    try:
        font = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 16)
        title_font = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 20)
    except:
        font = ImageFont.load_default()
        title_font = ImageFont.load_default()
    
    draw.text((100, 230), 'PROKLAMASI', fill=(0, 0, 0), font=title_font)
    draw.text((80, 260), 'KEMERDEKAAN', fill=(0, 0, 0), font=title_font)
    draw.text((60, 290), 'INDONESIA', fill=(0, 0, 0), font=title_font)
    draw.text((70, 320), '17 Agustus 1945', fill=(0, 0, 0), font=font)
    
    return img

def create_projection_3d():
    """Create a 3D projection diagram"""
    img = Image.new('RGB', (400, 400), color=(255, 255, 255))
    draw = ImageDraw.Draw(img)
    
    # Draw 3D cube
    draw.rectangle([100, 150, 200, 250], fill=(255, 182, 193), outline=(220, 20, 60), width=3)
    draw.rectangle([150, 100, 250, 200], fill=(255, 218, 223), outline=(220, 20, 60), width=3)
    draw.line([(100, 150), (150, 100)], fill=(220, 20, 60), width=3)
    draw.line([(200, 150), (250, 100)], fill=(220, 20, 60), width=3)
    draw.line([(200, 250), (250, 200)], fill=(220, 20, 60), width=3)
    draw.line([(100, 250), (150, 200)], fill=(220, 20, 60), width=3)
    
    # Draw 2D projection
    draw.rectangle([280, 180, 350, 250], fill=(144, 238, 144), outline=(34, 139, 34), width=3)
    
    # Draw arrow
    draw.line([(250, 175), (275, 195)], fill=(0, 0, 0), width=2)
    draw.polygon([(275, 195), (265, 190), (265, 200)], fill=(0, 0, 0))
    
    return img

def create_cube_rotation():
    """Create a cube rotation diagram"""
    img = Image.new('RGB', (400, 400), color=(255, 255, 255))
    draw = ImageDraw.Draw(img)
    
    # Draw original cube
    draw.rectangle([50, 150, 130, 230], fill=(255, 182, 193), outline=(220, 20, 60), width=3)
    draw.rectangle([90, 120, 170, 200], fill=(255, 218, 223), outline=(220, 20, 60), width=3)
    draw.line([(50, 150), (90, 120)], fill=(220, 20, 60), width=3)
    draw.line([(130, 150), (170, 120)], fill=(220, 20, 60), width=3)
    draw.line([(130, 230), (170, 200)], fill=(220, 20, 60), width=3)
    draw.line([(50, 230), (90, 200)], fill=(220, 20, 60), width=3)
    
    # Draw rotated cube
    draw.rectangle([230, 150, 310, 230], fill=(144, 238, 144), outline=(34, 139, 34), width=3)
    draw.rectangle([270, 120, 350, 200], fill=(191, 239, 255), outline=(34, 139, 34), width=3)
    draw.line([(230, 150), (270, 120)], fill=(34, 139, 34), width=3)
    draw.line([(310, 150), (350, 120)], fill=(34, 139, 34), width=3)
    draw.line([(310, 230), (350, 200)], fill=(34, 139, 34), width=3)
    draw.line([(230, 230), (270, 200)], fill=(34, 139, 34), width=3)
    
    # Draw rotation arrow
    draw.arc([170, 130, 190, 150], 0, 180, fill=(0, 0, 0), width=2)
    
    return img

def create_mirror_option_a():
    """Create mirror option A - shape reflected"""
    img = Image.new('RGB', (400, 400), color=(255, 255, 255))
    draw = ImageDraw.Draw(img)
    
    # Draw mirror line
    draw.line([(200, 50), (200, 350)], fill=(0, 0, 0), width=2)
    
    # Draw original shape (triangle pointing right)
    draw.polygon([(100, 150), (50, 250), (150, 250)], fill=(70, 130, 180), outline=(0, 0, 139), width=3)
    
    return img

def create_mirror_option_b():
    """Create mirror option B - shape reflected horizontally"""
    img = Image.new('RGB', (400, 400), color=(255, 255, 255))
    draw = ImageDraw.Draw(img)
    
    # Draw mirror line
    draw.line([(200, 50), (200, 350)], fill=(0, 0, 0), width=2)
    
    # Draw reflected shape (triangle pointing left)
    draw.polygon([(300, 150), (350, 250), (250, 250)], fill=(70, 130, 180), outline=(0, 0, 139), width=3)
    
    return img

def create_mirror_option_c():
    """Create mirror option C - different shape"""
    img = Image.new('RGB', (400, 400), color=(255, 255, 255))
    draw = ImageDraw.Draw(img)
    
    # Draw mirror line
    draw.line([(200, 50), (200, 350)], fill=(0, 0, 0), width=2)
    
    # Draw square
    draw.rectangle([100, 150, 150, 250], fill=(70, 130, 180), outline=(0, 0, 139), width=3)
    
    return img

def create_mirror_option_d():
    """Create mirror option D - circle"""
    img = Image.new('RGB', (400, 400), color=(255, 255, 255))
    draw = ImageDraw.Draw(img)
    
    # Draw mirror line
    draw.line([(200, 50), (200, 350)], fill=(0, 0, 0), width=2)
    
    # Draw circle
    draw.ellipse([100, 150, 150, 250], fill=(70, 130, 180), outline=(0, 0, 139), width=3)
    
    return img

def create_mirror_option_e():
    """Create mirror option E - diamond"""
    img = Image.new('RGB', (400, 400), color=(255, 255, 255))
    draw = ImageDraw.Draw(img)
    
    # Draw mirror line
    draw.line([(200, 50), (200, 350)], fill=(0, 0, 0), width=2)
    
    # Draw diamond
    draw.polygon([(125, 150), (150, 200), (125, 250), (100, 200)], fill=(70, 130, 180), outline=(0, 0, 139), width=3)
    
    return img

def create_folding_option_a():
    """Create folding option A - folded corner"""
    img = Image.new('RGB', (400, 400), color=(255, 255, 255))
    draw = ImageDraw.Draw(img)
    
    # Draw paper
    draw.rectangle([50, 100, 350, 300], fill=(255, 250, 205), outline=(139, 69, 19), width=3)
    
    # Draw folded corner (top-right)
    draw.polygon([(350, 100), (300, 150), (350, 150)], fill=(210, 180, 140), outline=(139, 69, 19), width=2)
    
    return img

def create_folding_option_b():
    """Create folding option B - folded edge"""
    img = Image.new('RGB', (400, 400), color=(255, 255, 255))
    draw = ImageDraw.Draw(img)
    
    # Draw paper
    draw.rectangle([50, 100, 350, 300], fill=(255, 250, 205), outline=(139, 69, 19), width=3)
    
    # Draw folded edge (top)
    draw.polygon([(50, 100), (350, 100), (350, 150), (50, 150)], fill=(210, 180, 140), outline=(139, 69, 19), width=2)
    
    return img

def create_folding_option_c():
    """Create folding option C - diagonal fold"""
    img = Image.new('RGB', (400, 400), color=(255, 255, 255))
    draw = ImageDraw.Draw(img)
    
    # Draw paper
    draw.rectangle([50, 100, 350, 300], fill=(255, 250, 205), outline=(139, 69, 19), width=3)
    
    # Draw diagonal fold
    draw.line([(50, 100), (350, 300)], fill=(139, 69, 19), width=2)
    
    return img

def create_folding_option_d():
    """Create folding option D - center fold"""
    img = Image.new('RGB', (400, 400), color=(255, 255, 255))
    draw = ImageDraw.Draw(img)
    
    # Draw paper
    draw.rectangle([50, 100, 350, 300], fill=(255, 250, 205), outline=(139, 69, 19), width=3)
    
    # Draw center fold
    draw.line([(200, 100), (200, 300)], fill=(139, 69, 19), width=2)
    
    return img

def create_pattern_option_a():
    """Create pattern option A - increasing squares"""
    img = Image.new('RGB', (400, 400), color=(255, 255, 255))
    draw = ImageDraw.Draw(img)
    
    sizes = [30, 50, 70, 90]
    for i, size in enumerate(sizes):
        x = 50 + i * 80
        y = 150 + (100 - size) // 2
        draw.rectangle([x, y, x + size, y + size], fill=(255, 127, 80), outline=(255, 69, 0), width=2)
    
    return img

def create_pattern_option_b():
    """Create pattern option B - decreasing squares"""
    img = Image.new('RGB', (400, 400), color=(255, 255, 255))
    draw = ImageDraw.Draw(img)
    
    sizes = [90, 70, 50, 30]
    for i, size in enumerate(sizes):
        x = 50 + i * 80
        y = 150 + (100 - size) // 2
        draw.rectangle([x, y, x + size, y + size], fill=(60, 179, 113), outline=(0, 100, 0), width=2)
    
    return img

def create_pattern_option_c():
    """Create pattern option C - alternating circles"""
    img = Image.new('RGB', (400, 400), color=(255, 255, 255))
    draw = ImageDraw.Draw(img)
    
    for i in range(4):
        x = 70 + i * 80
        y = 200
        radius = 30 if i % 2 == 0 else 20
        draw.ellipse([x - radius, y - radius, x + radius, y + radius], 
                    fill=(100, 149, 237) if i % 2 == 0 else (255, 182, 193), 
                    outline=(0, 0, 139), width=2)
    
    return img

def create_pattern_option_d():
    """Create pattern option D - triangles"""
    img = Image.new('RGB', (400, 400), color=(255, 255, 255))
    draw = ImageDraw.Draw(img)
    
    for i in range(4):
        x = 70 + i * 80
        y = 200
        # Triangle pointing up
        draw.polygon([(x, y - 30), (x - 30, y + 30), (x + 30, y + 30)], 
                    fill=(147, 112, 219), outline=(75, 0, 130), width=2)
    
    return img

def create_pattern_option_e():
    """Create pattern option E - mixed shapes"""
    img = Image.new('RGB', (400, 400), color=(255, 255, 255))
    draw = ImageDraw.Draw(img)
    
    shapes = ['circle', 'square', 'circle', 'square']
    for i, shape in enumerate(shapes):
        x = 70 + i * 80
        y = 200
        if shape == 'circle':
            draw.ellipse([x - 25, y - 25, x + 25, y + 25], fill=(255, 127, 80), outline=(255, 69, 0), width=2)
        else:
            draw.rectangle([x - 25, y - 25, x + 25, y + 25], fill=(60, 179, 113), outline=(0, 100, 0), width=2)
    
    return img

def create_projection_option_d():
    """Create projection option D - oblique"""
    img = Image.new('RGB', (400, 400), color=(255, 255, 255))
    draw = ImageDraw.Draw(img)
    
    # Draw cube in oblique projection
    draw.rectangle([100, 150, 200, 250], fill=(255, 182, 193), outline=(220, 20, 60), width=3)
    draw.rectangle([150, 100, 250, 200], fill=(255, 218, 223), outline=(220, 20, 60), width=3)
    draw.line([(100, 150), (150, 100)], fill=(220, 20, 60), width=3)
    draw.line([(200, 150), (250, 100)], fill=(220, 20, 60), width=3)
    draw.line([(200, 250), (250, 200)], fill=(220, 20, 60), width=3)
    draw.line([(100, 250), (150, 200)], fill=(220, 20, 60), width=3)
    
    return img

def create_rotation_option_a():
    """Create rotation option A - cube rotated 90 deg"""
    img = Image.new('RGB', (400, 400), color=(255, 255, 255))
    draw = ImageDraw.Draw(img)
    
    # Draw cube rotated
    draw.rectangle([100, 150, 200, 250], fill=(144, 238, 144), outline=(34, 139, 34), width=3)
    draw.rectangle([150, 120, 250, 220], fill=(191, 239, 255), outline=(34, 139, 34), width=3)
    draw.line([(100, 150), (150, 120)], fill=(34, 139, 34), width=3)
    draw.line([(200, 150), (250, 120)], fill=(34, 139, 34), width=3)
    draw.line([(200, 250), (250, 220)], fill=(34, 139, 34), width=3)
    draw.line([(100, 250), (150, 220)], fill=(34, 139, 34), width=3)
    
    return img

def create_rotation_option_b():
    """Create rotation option B - cube rotated 180 deg"""
    img = Image.new('RGB', (400, 400), color=(255, 255, 255))
    draw = ImageDraw.Draw(img)
    
    # Draw cube rotated 180
    draw.rectangle([150, 150, 250, 250], fill=(255, 182, 193), outline=(220, 20, 60), width=3)
    draw.rectangle([200, 100, 300, 200], fill=(255, 218, 223), outline=(220, 20, 60), width=3)
    draw.line([(150, 150), (200, 100)], fill=(220, 20, 60), width=3)
    draw.line([(250, 150), (300, 100)], fill=(220, 20, 60), width=3)
    draw.line([(250, 250), (300, 200)], fill=(220, 20, 60), width=3)
    draw.line([(150, 250), (200, 200)], fill=(220, 20, 60), width=3)
    
    return img

def create_rotation_option_d():
    """Create rotation option D - cube rotated 270 deg"""
    img = Image.new('RGB', (400, 400), color=(255, 255, 255))
    draw = ImageDraw.Draw(img)
    
    # Draw cube rotated 270
    draw.rectangle([150, 150, 250, 250], fill=(144, 238, 144), outline=(34, 139, 34), width=3)
    draw.rectangle([100, 200, 200, 300], fill=(191, 239, 255), outline=(34, 139, 34), width=3)
    draw.line([(150, 150), (100, 200)], fill=(34, 139, 34), width=3)
    draw.line([(250, 150), (200, 200)], fill=(34, 139, 34), width=3)
    draw.line([(250, 250), (200, 300)], fill=(34, 139, 34), width=3)
    draw.line([(150, 250), (100, 300)], fill=(34, 139, 34), width=3)
    
    return img

def main():
    print("Creating diagrammatic images for soal...")
    
    image_creators = {
        "geometri_segitiga.jpg": create_triangle,
        "persegi_panjang.jpg": create_rectangle,
        "kubus.jpg": create_cube,
        "balok.jpg": create_balok,
        "tabung.jpg": create_cylinder,
        "kerucut.jpg": create_cone,
        "bola.jpg": create_sphere,
        "cermin_asli.jpg": create_mirror_pattern,
        "lipatan.jpg": create_folding_pattern,
        "pola_spatial.jpg": create_spatial_pattern,
        "peta_indonesia.jpg": create_indonesia_map,
        "peta_jawa.jpg": create_java_map,
        "peta_gunung.jpg": create_volcano_map,
        "proklamasi.jpg": create_proclamation_image,
        "proyeksi_3d.jpg": create_projection_3d,
        "kubus_rotasi.jpg": create_cube_rotation,
        # Option images that failed to download
        "cermin_a.jpg": create_mirror_option_a,
        "cermin_b.jpg": create_mirror_option_b,
        "cermin_c.jpg": create_mirror_option_c,
        "cermin_d.jpg": create_mirror_option_d,
        "cermin_e.jpg": create_mirror_option_e,
        "lipatan_a.jpg": create_folding_option_a,
        "lipatan_b.jpg": create_folding_option_b,
        "lipatan_c.jpg": create_folding_option_c,
        "lipatan_d.jpg": create_folding_option_d,
        "pola_a.jpg": create_pattern_option_a,
        "pola_b.jpg": create_pattern_option_b,
        "pola_c.jpg": create_pattern_option_c,
        "pola_d.jpg": create_pattern_option_d,
        "pola_e.jpg": create_pattern_option_e,
        "proyeksi_d.jpg": create_projection_option_d,
        "kubus_rot_a.jpg": create_rotation_option_a,
        "kubus_rot_b.jpg": create_rotation_option_b,
        "kubus_rot_d.jpg": create_rotation_option_d
    }
    
    for filename, creator in image_creators.items():
        print(f"Creating: {filename}")
        img = creator()
        filepath = os.path.join(IMAGE_DIR, filename)
        img.save(filepath, 'JPEG', quality=90)
        print(f"✅ Saved: {filepath}")
    
    print("\n✅ All diagrammatic images created successfully!")

if __name__ == '__main__':
    main()
