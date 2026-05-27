-- Fix Passing Grades in exam_types table
-- Update to official MENPAN values

UPDATE exam_types 
SET passing_grade_twk = 65,
    passing_grade_tiu = 80,
    passing_grade_tkp = 166,
    passing_grade_tpa = 0,
    passing_grade_psikologis = 0,
    passing_grade_total = 550
WHERE code IN ('SKD', 'skd_cat');

-- Verify update
SELECT code, name, passing_grade_twk, passing_grade_tiu, passing_grade_tkp, passing_grade_total 
FROM exam_types 
WHERE code IN ('SKD', 'skd_cat');
