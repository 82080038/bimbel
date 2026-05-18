<?php
// Course Management API
if (session_status() === PHP_SESSION_NONE) { session_start(); }
require_once '../config.php';
require_once '../scripts/logger.php';
require_once '../api/middleware.php';

header('Content-Type: application/json');

$action = $_GET['action'] ?? '';

switch ($action) {
    case 'list_courses':
        listCourses();
        break;
    case 'get_course':
        getCourse();
        break;
    case 'create_course':
        requireAdmin();
        createCourse();
        break;
    case 'update_course':
        requireAdmin();
        updateCourse();
        break;
    case 'delete_course':
        requireAdmin();
        deleteCourse();
        break;
    case 'list_modules':
        listModules();
        break;
    case 'create_module':
        requireAdmin();
        createModule();
        break;
    case 'update_module':
        requireAdmin();
        updateModule();
        break;
    case 'delete_module':
        requireAdmin();
        deleteModule();
        break;
    case 'list_materials':
        listMaterials();
        break;
    case 'create_material':
        requireAdmin();
        createMaterial();
        break;
    case 'update_material':
        requireAdmin();
        updateMaterial();
        break;
    case 'delete_material':
        requireAdmin();
        deleteMaterial();
        break;
    case 'get_user_progress':
        getUserProgress();
        break;
    case 'update_material_progress':
        updateMaterialProgress();
        break;
    case 'list_learning_paths':
        listLearningPaths();
        break;
    case 'get_user_learning_path':
        getUserLearningPath();
        break;
    case 'assign_learning_path':
        requireAdmin();
        assignLearningPath();
        break;
    case 'check_prerequisites':
        checkPrerequisites();
        break;
    case 'get_courses':
        listCourses();
        break;
    case 'user_course_progress':
        getUserCourseProgress();
        break;
    case 'user_module_progress':
        getUserModuleProgress();
        break;
    case 'get_statistics':
        getCourseStatistics();
        break;
    default:
        echo json_encode(['success' => false, 'error' => 'Invalid action']);
        break;
}

function listCourses() {
    global $conn;

    $kategori = $_GET['kategori'] ?? '';
    $status = $_GET['status'] ?? 'published';

    // Handle both numeric ID and string name (courses table uses kategori name as VARCHAR)
    if ($kategori && is_numeric($kategori)) {
        $kategori_map = [1 => 'TWK', 2 => 'TIU', 3 => 'TKP', 4 => 'TPA', 5 => 'PSIKOLOGIS'];
        $kategori = $kategori_map[intval($kategori)] ?? $kategori;
    }

    $sql = "SELECT c.*,
            (SELECT COUNT(*) FROM course_modules WHERE course_id = c.id) as module_count,
            (SELECT COUNT(*) FROM user_course_progress WHERE course_id = c.id) as enrolled_count
            FROM courses c
            WHERE status = ?";

    $params = [$status];
    if ($kategori) {
        $sql .= " AND kategori = ?";
        $params[] = $kategori;
    }
    
    $sql .= " ORDER BY urutan ASC, created_at DESC";
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param(str_repeat('s', count($params)), ...$params);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $courses = [];
    while ($row = $result->fetch_assoc()) {
        $courses[] = $row;
    }
    
    echo json_encode(['success' => true, 'data' => $courses]);
}

function getCourse() {
    global $conn;
    
    $course_id = $_GET['course_id'] ?? 0;
    
    $sql = "SELECT c.*, 
            (SELECT COUNT(*) FROM course_modules WHERE course_id = c.id) as module_count
            FROM courses c 
            WHERE id = ?";
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param('i', $course_id);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $course = $result->fetch_assoc();
    
    if (!$course) {
        echo json_encode(['success' => false, 'error' => 'Course not found']);
        return;
    }
    
    // Get modules
    $sql = "SELECT * FROM course_modules WHERE course_id = ? ORDER BY urutan ASC";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param('i', $course_id);
    $stmt->execute();
    $modules_result = $stmt->get_result();
    
    $modules = [];
    while ($module = $modules_result->fetch_assoc()) {
        // Get materials for this module
        $sql = "SELECT m.*, s.pertanyaan 
                FROM course_materials m 
                LEFT JOIN soal s ON m.soal_id = s.id
                WHERE module_id = ? 
                ORDER BY m.urutan ASC";
        $stmt2 = $conn->prepare($sql);
        $stmt2->bind_param('i', $module['id']);
        $stmt2->execute();
        $materials_result = $stmt2->get_result();
        
        $materials = [];
        while ($material = $materials_result->fetch_assoc()) {
            $materials[] = $material;
        }
        
        $module['materials'] = $materials;
        $modules[] = $module;
    }
    
    $course['modules'] = $modules;
    
    // Get prerequisites
    $sql = "SELECT p.*, c.judul as prerequisite_title
            FROM course_prerequisites p
            JOIN courses c ON p.prerequisite_course_id = c.id
            WHERE p.course_id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param('i', $course_id);
    $stmt->execute();
    $prereq_result = $stmt->get_result();
    
    $prerequisites = [];
    while ($prereq = $prereq_result->fetch_assoc()) {
        $prerequisites[] = $prereq;
    }
    
    $course['prerequisites'] = $prerequisites;
    
    echo json_encode(['success' => true, 'data' => $course]);
}

function createCourse() {
    global $conn;
    
    $data = json_decode(file_get_contents('php://input'), true);
    
    $judul = $data['judul'] ?? '';
    $deskripsi = $data['deskripsi'] ?? '';
    $kategori = $data['kategori'] ?? '';
    $tags = $data['tags'] ?? '';
    $urutan = $data['urutan'] ?? 0;
    $status = $data['status'] ?? 'draft';
    $user = requireAuth();
    
    $sql = "INSERT INTO courses (judul, deskripsi, kategori, tags, urutan, status, created_by)
            VALUES (?, ?, ?, ?, ?, ?, ?)";
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param('ssssisi', $judul, $deskripsi, $kategori, $tags, $urutan, $status, $user['id']);
    
    if ($stmt->execute()) {
        echo json_encode(['success' => true, 'course_id' => $conn->insert_id]);
    } else {
        echo json_encode(['success' => false, 'error' => $conn->error]);
    }
}

function updateCourse() {
    global $conn;
    
    $data = json_decode(file_get_contents('php://input'), true);
    
    $course_id = $data['course_id'] ?? 0;
    $judul = $data['judul'] ?? '';
    $deskripsi = $data['deskripsi'] ?? '';
    $kategori = $data['kategori'] ?? '';
    $tags = $data['tags'] ?? '';
    $urutan = $data['urutan'] ?? 0;
    $status = $data['status'] ?? 'draft';
    
    $sql = "UPDATE courses SET judul = ?, deskripsi = ?, kategori = ?, tags = ?, urutan = ?, status = ?
            WHERE id = ?";
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param('ssssisi', $judul, $deskripsi, $kategori, $tags, $urutan, $status, $course_id);
    
    if ($stmt->execute()) {
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['success' => false, 'error' => $conn->error]);
    }
}

function deleteCourse() {
    global $conn;
    
    $course_id = $_GET['course_id'] ?? 0;
    
    $sql = "DELETE FROM courses WHERE id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param('i', $course_id);
    
    if ($stmt->execute()) {
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['success' => false, 'error' => $conn->error]);
    }
}

function listModules() {
    global $conn;
    
    $course_id = $_GET['course_id'] ?? 0;
    
    $sql = "SELECT * FROM course_modules WHERE course_id = ? ORDER BY urutan ASC";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param('i', $course_id);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $modules = [];
    while ($row = $result->fetch_assoc()) {
        $modules[] = $row;
    }
    
    echo json_encode(['success' => true, 'data' => $modules]);
}

function createModule() {
    global $conn;
    
    $data = json_decode(file_get_contents('php://input'), true);
    
    $course_id = $data['course_id'] ?? 0;
    $judul = $data['judul'] ?? '';
    $deskripsi = $data['deskripsi'] ?? '';
    $urutan = $data['urutan'] ?? 0;
    
    $sql = "INSERT INTO course_modules (course_id, judul, deskripsi, urutan)
            VALUES (?, ?, ?, ?)";
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param('issi', $course_id, $judul, $deskripsi, $urutan);
    
    if ($stmt->execute()) {
        echo json_encode(['success' => true, 'module_id' => $conn->insert_id]);
    } else {
        echo json_encode(['success' => false, 'error' => $conn->error]);
    }
}

function updateModule() {
    global $conn;
    
    $data = json_decode(file_get_contents('php://input'), true);
    
    $module_id = $data['module_id'] ?? 0;
    $judul = $data['judul'] ?? '';
    $deskripsi = $data['deskripsi'] ?? '';
    $urutan = $data['urutan'] ?? 0;
    
    $sql = "UPDATE course_modules SET judul = ?, deskripsi = ?, urutan = ? WHERE id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param('ssii', $judul, $deskripsi, $urutan, $module_id);
    
    if ($stmt->execute()) {
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['success' => false, 'error' => $conn->error]);
    }
}

function deleteModule() {
    global $conn;
    
    $module_id = $_GET['module_id'] ?? 0;
    
    $sql = "DELETE FROM course_modules WHERE id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param('i', $module_id);
    
    if ($stmt->execute()) {
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['success' => false, 'error' => $conn->error]);
    }
}

function listMaterials() {
    global $conn;
    
    $module_id = $_GET['module_id'] ?? 0;
    
    $sql = "SELECT m.*, s.pertanyaan 
            FROM course_materials m 
            LEFT JOIN soal s ON m.soal_id = s.id
            WHERE module_id = ? 
            ORDER BY m.urutan ASC";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param('i', $module_id);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $materials = [];
    while ($row = $result->fetch_assoc()) {
        $materials[] = $row;
    }
    
    echo json_encode(['success' => true, 'data' => $materials]);
}

function createMaterial() {
    global $conn;
    
    $data = json_decode(file_get_contents('php://input'), true);
    
    $module_id = $data['module_id'] ?? 0;
    $judul = $data['judul'] ?? '';
    $konten = $data['konten'] ?? '';
    $tipe = $data['tipe'] ?? 'teks';
    $file_path = $data['file_path'] ?? '';
    $urutan = $data['urutan'] ?? 0;
    $soal_id = $data['soal_id'] ?? null;
    
    $sql = "INSERT INTO course_materials (module_id, judul, konten, tipe, file_path, urutan, soal_id)
            VALUES (?, ?, ?, ?, ?, ?, ?)";
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param('isssisi', $module_id, $judul, $konten, $tipe, $file_path, $urutan, $soal_id);
    
    if ($stmt->execute()) {
        echo json_encode(['success' => true, 'material_id' => $conn->insert_id]);
    } else {
        echo json_encode(['success' => false, 'error' => $conn->error]);
    }
}

function updateMaterial() {
    global $conn;
    
    $data = json_decode(file_get_contents('php://input'), true);
    
    $material_id = $data['material_id'] ?? 0;
    $judul = $data['judul'] ?? '';
    $konten = $data['konten'] ?? '';
    $tipe = $data['tipe'] ?? 'teks';
    $file_path = $data['file_path'] ?? '';
    $urutan = $data['urutan'] ?? 0;
    $soal_id = $data['soal_id'] ?? null;
    
    $sql = "UPDATE course_materials SET judul = ?, konten = ?, tipe = ?, file_path = ?, urutan = ?, soal_id = ?
            WHERE id = ?";
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param('sssisii', $judul, $konten, $tipe, $file_path, $urutan, $soal_id, $material_id);
    
    if ($stmt->execute()) {
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['success' => false, 'error' => $conn->error]);
    }
}

function deleteMaterial() {
    global $conn;
    
    $material_id = $_GET['material_id'] ?? 0;
    
    $sql = "DELETE FROM course_materials WHERE id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param('i', $material_id);
    
    if ($stmt->execute()) {
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['success' => false, 'error' => $conn->error]);
    }
}

function getUserProgress() {
    global $conn;
    
    $user = requireAuth();
    $course_id = $_GET['course_id'] ?? 0;
    
    // Get course progress
    $sql = "SELECT * FROM user_course_progress WHERE user_id = ? AND course_id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param('ii', $user['id'], $course_id);
    $stmt->execute();
    $course_progress = $stmt->get_result()->fetch_assoc();
    
    // Get module progress
    $sql = "SELECT mp.*, m.judul as module_title
            FROM user_module_progress mp
            JOIN course_modules m ON mp.module_id = m.id
            WHERE mp.user_id = ? AND m.course_id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param('ii', $user['id'], $course_id);
    $stmt->execute();
    $module_progress_result = $stmt->get_result();
    
    $module_progress = [];
    while ($row = $module_progress_result->fetch_assoc()) {
        $module_progress[] = $row;
    }
    
    echo json_encode([
        'success' => true,
        'course_progress' => $course_progress,
        'module_progress' => $module_progress
    ]);
}

function updateMaterialProgress() {
    global $conn;
    
    $data = json_decode(file_get_contents('php://input'), true);
    $user = requireAuth();
    
    $material_id = $data['material_id'] ?? 0;
    $status = $data['status'] ?? 'completed';
    
    $sql = "INSERT INTO user_material_progress (user_id, material_id, status, completed_at)
            VALUES (?, ?, ?, NOW())
            ON DUPLICATE KEY UPDATE status = ?, completed_at = IF(VALUES(status) = 'completed', NOW(), completed_at)";
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param('iiss', $user['id'], $material_id, $status, $status);
    
    if ($stmt->execute()) {
        // Update module progress
        $sql = "SELECT module_id FROM course_materials WHERE id = ?";
        $stmt2 = $conn->prepare($sql);
        $stmt2->bind_param('i', $material_id);
        $stmt2->execute();
        $module_id = $stmt2->get_result()->fetch_assoc()['module_id'] ?? 0;
        
        if ($module_id > 0) {
            // Calculate module progress
            $sql = "SELECT COUNT(*) as total, 
                    SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed
                    FROM user_material_progress 
                    WHERE user_id = ? AND material_id IN (SELECT id FROM course_materials WHERE module_id = ?)";
            $stmt3 = $conn->prepare($sql);
            $stmt3->bind_param('ii', $user['id'], $module_id);
            $stmt3->execute();
            $progress = $stmt3->get_result()->fetch_assoc();
            
            $progress_percent = $progress['total'] > 0 ? ($progress['completed'] / $progress['total']) * 100 : 0;
            $module_status = $progress_percent >= 100 ? 'completed' : 'in_progress';
            
            $sql = "INSERT INTO user_module_progress (user_id, module_id, status, progress_percent, completed_at)
                    VALUES (?, ?, ?, ?, IF(VALUES(progress_percent) >= 100, NOW(), NULL))
                    ON DUPLICATE KEY UPDATE status = ?, progress_percent = ?, completed_at = IF(VALUES(progress_percent) >= 100, NOW(), completed_at)";
            $stmt4 = $conn->prepare($sql);
            $stmt4->bind_param('iisdids', $user['id'], $module_id, $module_status, $progress_percent, $module_status, $progress_percent);
            $stmt4->execute();
            
            // Update course progress
            $sql = "SELECT course_id FROM course_modules WHERE id = ?";
            $stmt5 = $conn->prepare($sql);
            $stmt5->bind_param('i', $module_id);
            $stmt5->execute();
            $course_id = $stmt5->get_result()->fetch_assoc()['course_id'] ?? 0;
            
            if ($course_id > 0) {
                $sql = "SELECT COUNT(*) as total, 
                        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed
                        FROM user_module_progress 
                        WHERE user_id = ? AND module_id IN (SELECT id FROM course_modules WHERE course_id = ?)";
                $stmt6 = $conn->prepare($sql);
                $stmt6->bind_param('ii', $user['id'], $course_id);
                $stmt6->execute();
                $course_progress = $stmt6->get_result()->fetch_assoc();
                
                $course_progress_percent = $course_progress['total'] > 0 ? ($course_progress['completed'] / $course_progress['total']) * 100 : 0;
                $course_status = $course_progress_percent >= 100 ? 'completed' : 'in_progress';
                
                $sql = "INSERT INTO user_course_progress (user_id, course_id, status, progress_percent, started_at, completed_at)
                        VALUES (?, ?, ?, ?, IF(VALUES(progress_percent) > 0, NOW(), NULL), IF(VALUES(progress_percent) >= 100, NOW(), NULL))
                        ON DUPLICATE KEY UPDATE status = ?, progress_percent = ?, completed_at = IF(VALUES(progress_percent) >= 100, NOW(), completed_at)";
                $stmt7 = $conn->prepare($sql);
                $stmt7->bind_param('iisdids', $user['id'], $course_id, $course_status, $course_progress_percent, $course_status, $course_progress_percent);
                $stmt7->execute();
            }
        }
        
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['success' => false, 'error' => $conn->error]);
    }
}

function listLearningPaths() {
    global $conn;
    
    $sql = "SELECT lp.*, 
            (SELECT COUNT(*) FROM learning_path_courses WHERE learning_path_id = lp.id) as course_count
            FROM learning_paths lp
            ORDER BY lp.created_at DESC";
    
    $result = $conn->query($sql);
    
    $paths = [];
    while ($row = $result->fetch_assoc()) {
        $paths[] = $row;
    }
    
    echo json_encode(['success' => true, 'data' => $paths]);
}

function getUserLearningPath() {
    global $conn;
    
    $user = requireAuth();
    
    // Get user's latest exam scores (hasil_ujian has nilai_twk, nilai_tiu, nilai_tkp columns)
    $sql = "SELECT AVG(nilai_twk) as avg_twk, AVG(nilai_tiu) as avg_tiu, AVG(nilai_tkp) as avg_tkp, AVG(nilai_total) as avg_total
            FROM hasil_ujian 
            WHERE user_id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param('i', $user['id']);
    $stmt->execute();
    $scores_result = $stmt->get_result();
    $row = $scores_result->fetch_assoc();
    
    $scores = [
        'TWK' => $row['avg_twk'] ?? 0,
        'TIU' => $row['avg_tiu'] ?? 0,
        'TKP' => $row['avg_tkp'] ?? 0,
        'total' => $row['avg_total'] ?? 0
    ];
    
    // Find matching learning path
    $sql = "SELECT lp.* FROM learning_paths lp
            WHERE (min_score_twk IS NULL OR ? >= min_score_twk)
            AND (min_score_tiu IS NULL OR ? >= min_score_tiu)
            AND (min_score_tkp IS NULL OR ? >= min_score_tkp)
            AND (min_score_tpa IS NULL OR ? >= min_score_tpa)
            AND (min_score_psikologis IS NULL OR ? >= min_score_psikologis)
            ORDER BY lp.created_at DESC
            LIMIT 1";
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param('ddddd', 
        $scores['TWK'], 
        $scores['TIU'], 
        $scores['TKP'], 
        $scores['total'],
        $scores['total']
    );
    $stmt->execute();
    $path = $stmt->get_result()->fetch_assoc();
    
    if ($path) {
        // Get courses in this path
        $sql = "SELECT lpc.*, c.judul, c.deskripsi
                FROM learning_path_courses lpc
                JOIN courses c ON lpc.course_id = c.id
                WHERE lpc.learning_path_id = ?
                ORDER BY lpc.urutan ASC";
        $stmt2 = $conn->prepare($sql);
        $stmt2->bind_param('i', $path['id']);
        $stmt2->execute();
        $courses_result = $stmt2->get_result();
        
        $courses = [];
        while ($course = $courses_result->fetch_assoc()) {
            // Get user progress for this course
            $sql = "SELECT * FROM user_course_progress WHERE user_id = ? AND course_id = ?";
            $stmt3 = $conn->prepare($sql);
            $stmt3->bind_param('ii', $user['id'], $course['course_id']);
            $stmt3->execute();
            $progress = $stmt3->get_result()->fetch_assoc();
            
            $course['progress'] = $progress;
            $courses[] = $course;
        }
        
        $path['courses'] = $courses;
    }
    
    echo json_encode(['success' => true, 'data' => $path]);
}

function assignLearningPath() {
    global $conn;
    
    $data = json_decode(file_get_contents('php://input'), true);
    
    $user_id = $data['user_id'] ?? 0;
    $learning_path_id = $data['learning_path_id'] ?? 0;
    
    $sql = "INSERT INTO user_learning_paths (user_id, learning_path_id, status, assigned_at)
            VALUES (?, ?, 'assigned', NOW())";
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param('ii', $user_id, $learning_path_id);
    
    if ($stmt->execute()) {
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['success' => false, 'error' => $conn->error]);
    }
}

function checkPrerequisites() {
    global $conn;
    
    $user = requireAuth();
    $course_id = $_GET['course_id'] ?? 0;
    
    // Get prerequisites for this course
    $sql = "SELECT prerequisite_course_id FROM course_prerequisites WHERE course_id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param('i', $course_id);
    $stmt->execute();
    $prereq_result = $stmt->get_result();
    
    $prerequisites = [];
    while ($row = $prereq_result->fetch_assoc()) {
        $prerequisites[] = $row['prerequisite_course_id'];
    }
    
    if (empty($prerequisites)) {
        echo json_encode(['success' => true, 'can_enroll' => true, 'prerequisites' => []]);
        return;
    }
    
    // Check if user has completed all prerequisites
    $placeholders = str_repeat('?,', count($prerequisites) - 1) . '?';
    $sql = "SELECT course_id, status FROM user_course_progress 
            WHERE user_id = ? AND course_id IN ($placeholders)";
    
    $params = array_merge([$user['id']], $prerequisites);
    $stmt = $conn->prepare($sql);
    $stmt->bind_param(str_repeat('i', count($params)), ...$params);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $completed = [];
    while ($row = $result->fetch_assoc()) {
        if ($row['status'] === 'completed') {
            $completed[] = $row['course_id'];
        }
    }
    
    $can_enroll = count($completed) === count($prerequisites);
    
    echo json_encode([
        'success' => true,
        'can_enroll' => $can_enroll,
        'prerequisites' => $prerequisites,
        'completed' => $completed
    ]);
}

function getUserCourseProgress() {
    global $conn;
    
    $user = requireAuth();
    
    $sql = "SELECT ucp.*, c.judul as nama_kursus, c.deskripsi
            FROM user_course_progress ucp
            JOIN courses c ON ucp.course_id = c.id
            WHERE ucp.user_id = ?
            ORDER BY ucp.last_accessed DESC";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param('i', $user['id']);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $courses = [];
    while ($row = $result->fetch_assoc()) {
        $courses[] = $row;
    }
    
    echo json_encode(['success' => true, 'data' => $courses]);
}

function getUserModuleProgress() {
    global $conn;
    
    $user = requireAuth();
    
    $sql = "SELECT ump.*, cm.judul as module_title, c.judul as course_title
            FROM user_module_progress ump
            JOIN course_modules cm ON ump.module_id = cm.id
            JOIN courses c ON cm.course_id = c.id
            WHERE ump.user_id = ?
            ORDER BY ump.last_accessed DESC";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param('i', $user['id']);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $modules = [];
    while ($row = $result->fetch_assoc()) {
        $modules[] = $row;
    }
    
    echo json_encode(['success' => true, 'data' => $modules]);
}

function getCourseStatistics() {
    global $conn;
    
    $user = requireAuth();
    
    $sql = "SELECT 
                COUNT(DISTINCT ucp.course_id) as total_courses,
                SUM(CASE WHEN ucp.status = 'completed' THEN 1 ELSE 0 END) as completed_courses,
                AVG(ucp.progress_percent) as avg_progress
            FROM user_course_progress ucp
            WHERE ucp.user_id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param('i', $user['id']);
    $stmt->execute();
    $stats = $stmt->get_result()->fetch_assoc();
    
    echo json_encode(['success' => true, 'data' => $stats]);
}
?>
