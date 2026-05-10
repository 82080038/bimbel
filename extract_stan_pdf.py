#!/usr/bin/env python3
"""
Script untuk mengekstrak teks dari file-file PDF STAN dan menyimpan ke JSON
"""

import os
import json
import pdfplumber
from PyPDF2 import PdfReader

# Direktori PDF STAN
STAN_DIR = '/media/petrick/Transcend/DOWNLOADS/STAN'
OUTPUT_FILE = '/opt/lampp/htdocs/ujian/stan_pdf_extracted.json'

def extract_text_from_pdf(pdf_path):
    """Ekstrak teks dari file PDF menggunakan pdfplumber"""
    text = ""
    try:
        with pdfplumber.open(pdf_path) as pdf:
            for page in pdf.pages:
                text += page.extract_text() + "\n"
        return text
    except Exception as e:
        print(f"Error extracting from {pdf_path}: {e}")
        return ""

def extract_text_from_pdf_pypdf2(pdf_path):
    """Ekstrak teks dari file PDF menggunakan PyPDF2 (fallback)"""
    text = ""
    try:
        reader = PdfReader(pdf_path)
        for page in reader.pages:
            text += page.extract_text() + "\n"
        return text
    except Exception as e:
        print(f"Error extracting from {pdf_path} with PyPDF2: {e}")
        return ""

def process_stan_pdfs():
    """Proses semua file PDF di direktori STAN dan simpan ke JSON"""
    pdf_files = []
    
    # Dapatkan semua file PDF
    for file in os.listdir(STAN_DIR):
        if file.endswith('.pdf'):
            pdf_files.append(os.path.join(STAN_DIR, file))
    
    print(f"Ditemukan {len(pdf_files)} file PDF")
    
    extracted_data = []
    total_chars = 0
    
    for pdf_file in pdf_files:
        print(f"\nProcessing: {os.path.basename(pdf_file)}")
        
        # Coba ekstrak dengan pdfplumber dulu
        text = extract_text_from_pdf(pdf_file)
        
        # Jika gagal, coba dengan PyPDF2
        if not text or len(text) < 100:
            print("Trying PyPDF2...")
            text = extract_text_from_pdf_pypdf2(pdf_file)
        
        if text and len(text) > 100:
            print(f"Extracted {len(text)} characters")
            total_chars += len(text)
            
            # Simpan data ke list
            extracted_data.append({
                'file_name': os.path.basename(pdf_file),
                'file_path': pdf_file,
                'text': text,
                'character_count': len(text)
            })
        else:
            print(f"Failed to extract text from {pdf_file}")
    
    # Simpan ke JSON
    print(f"\nMenyimpan {len(extracted_data)} file ke JSON...")
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        json.dump(extracted_data, f, indent=2, ensure_ascii=False)
    
    print(f"Total characters extracted: {total_chars}")
    print(f"Data disimpan ke: {OUTPUT_FILE}")

if __name__ == "__main__":
    process_stan_pdfs()
