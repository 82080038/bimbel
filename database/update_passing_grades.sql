-- Update Passing Grades to Official MENPAN Values
-- Created: 2026-05-27
-- Purpose: Update exam_types table with official MENPAN passing grades (Keputusan Menteri PANRB No. 651/2023)

-- Update SKD exam type with official MENPAN passing grades
UPDATE exam_types 
SET 
    passing_grade_twk = 65,
    passing_grade_tiu = 80,
    passing_grade_tkp = 166,
    passing_grade_tpa = 0,
    passing_grade_psikologis = 0,
    passing_grade_total = 550,
    description = 'Tes Wawasan Kebangsaan, Tes Intelegensia Umum, Tes Karakteristik Pribadi (Official MENPAN)',
    updated_at = CURRENT_TIMESTAMP
WHERE code = 'SKD' OR code = 'skd_cat';

-- Update SKB exam type
UPDATE exam_types 
SET 
    passing_grade_twk = 0,
    passing_grade_tiu = 0,
    passing_grade_tkp = 0,
    passing_grade_tpa = 10,
    passing_grade_psikologis = 10,
    passing_grade_total = 0,
    updated_at = CURRENT_TIMESTAMP
WHERE code = 'SKB';

-- Update UTBK exam type
UPDATE exam_types 
SET 
    passing_grade_twk = 0,
    passing_grade_tiu = 0,
    passing_grade_tkp = 0,
    passing_grade_tpa = 10,
    passing_grade_psikologis = 10,
    passing_grade_total = 0,
    updated_at = CURRENT_TIMESTAMP
WHERE code = 'UTBK';

-- Update TRYOUT exam type (keep adjusted values for simulation)
UPDATE exam_types 
SET 
    passing_grade_twk = 15,
    passing_grade_tiu = 15,
    passing_grade_tkp = 15,
    passing_grade_tpa = 10,
    passing_grade_psikologis = 10,
    passing_grade_total = 40,
    description = 'Simulasi ujian untuk latihan (adjusted for fewer questions)',
    updated_at = CURRENT_TIMESTAMP
WHERE code = 'TRYOUT' OR code = 'tryout';

-- Update TPA exam type
UPDATE exam_types 
SET 
    passing_grade_twk = 0,
    passing_grade_tiu = 0,
    passing_grade_tkp = 0,
    passing_grade_tpa = 15,
    passing_grade_psikologis = 0,
    passing_grade_total = 15,
    updated_at = CURRENT_TIMESTAMP
WHERE code = 'tpa';

-- Update Psikotes exam type
UPDATE exam_types 
SET 
    passing_grade_twk = 0,
    passing_grade_tiu = 0,
    passing_grade_tkp = 0,
    passing_grade_tpa = 0,
    passing_grade_psikologis = 15,
    passing_grade_total = 15,
    updated_at = CURRENT_TIMESTAMP
WHERE code = 'psikotes';

-- Update Latihan Bebas exam type (no passing grade)
UPDATE exam_types 
SET 
    passing_grade_twk = 0,
    passing_grade_tiu = 0,
    passing_grade_tkp = 0,
    passing_grade_tpa = 0,
    passing_grade_psikologis = 0,
    passing_grade_total = 0,
    updated_at = CURRENT_TIMESTAMP
WHERE code = 'latihan';
