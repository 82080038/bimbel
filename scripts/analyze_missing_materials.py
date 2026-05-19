import json
import sys

# Database question types from previous analysis
DB_QUESTION_TYPES = {
    'TWK': [
        'Pancasila', 'Sejarah Kemerdekaan', 'UUD 1945', 'Bhinneka Tunggal Ika',
        'Demokrasi', 'Kedaulatan Rakyat', 'Sistem Pemerintahan', 'Perundang-undangan',
        'Hak Asasi Manusia', 'Otonomi Daerah', 'Partisipasi Masyarakat', 'Bela Negara'
    ],
    'TIU': [
        'Sinonim', 'Antonim', 'Analogi', 'Pemahaman Bacaan', 'Deret Angka',
        'Deret Huruf', 'Logika', 'Aritmatika', 'Geometri', 'Persentase',
        'Perbandingan', 'Himpunan'
    ],
    'TKP': [
        'Sikap Kerja', 'Perilaku Sosial', 'Kepemimpinan', 'Integritas',
        'Disiplin', 'Tanggung Jawab', 'Kerjasama Tim', 'Kreativitas'
    ],
    'TPA': [
        'Matematika', 'Bahasa Indonesia', 'Bahasa Inggris', 'Fisika',
        'Kimia', 'Biologi', 'Deret', 'Logika'
    ],
    'PSIKOLOGIS': [
        'Kepribadian', 'Mental', 'Sosial', 'Karakter', 'Emosi',
        'Adaptasi', 'Komunikasi', 'Empati'
    ]
}

# Load comprehensive materials from JSON files
def load_json_materials():
    materials = {}
    categories = ['TWK', 'TIU', 'TKP', 'TPA', 'PSIKOLOGIS']
    
    for category in categories:
        try:
            with open(f'data/learning_materials/{category.lower()}_comprehensive.json', 'r', encoding='utf-8') as f:
                data = json.load(f)
                materi_keys = list(data.get('materi', {}).keys())
                materials[category] = materi_keys
                print(f"{category}: {len(materi_keys)} materi")
                for key in materi_keys:
                    print(f"  - {key}")
        except Exception as e:
            print(f"Error loading {category}: {e}")
            materials[category] = []
    
    return materials

# Analyze missing materials
def analyze_missing_materials(json_materials):
    print("\n" + "="*80)
    print("ANALISIS MATERI YANG BELUM TERSEDIA")
    print("="*80 + "\n")
    
    for category in ['TWK', 'TIU', 'TKP', 'TPA', 'PSIKOLOGIS']:
        print(f"\n{category}:")
        print("-" * 40)
        
        json_materi = json_materials.get(category, [])
        db_types = DB_QUESTION_TYPES.get(category, [])
        
        # Convert materi keys to lowercase for comparison
        json_materi_lower = [m.lower().replace('_', ' ') for m in json_materi]
        
        missing_types = []
        for db_type in db_types:
            db_type_lower = db_type.lower().replace('_', ' ')
            if db_type_lower not in json_materi_lower:
                missing_types.append(db_type)
        
        if missing_types:
            print(f"  ❌ Tipe soal yang belum ada materi:")
            for mt in missing_types:
                print(f"     - {mt}")
        else:
            print(f"  ✅ Semua tipe soal sudah tercover")
        
        print(f"  Total materi di JSON: {len(json_materi)}")
        print(f"  Total tipe soal di DB: {len(db_types)}")

if __name__ == "__main__":
    json_materials = load_json_materials()
    analyze_missing_materials(json_materials)
