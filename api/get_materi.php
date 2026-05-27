<?php
/**
 * API untuk mendapatkan materi pembelajaran
 * Mendukung berbagai sumber: Wikipedia, YouTube, Local files, dll
 */

header('Content-Type: application/json');
require_once __DIR__ . '/../config.php';

// Get parameters
$action = $_GET['action'] ?? 'list';
$materi_id = $_GET['materi_id'] ?? null;
$kategori_id = $_GET['kategori_id'] ?? null;
$user_id = $_GET['user_id'] ?? null;

try {
    $conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
    
    if ($conn->connect_error) {
        throw new Exception("Connection failed: " . $conn->connect_error);
    }
    
    switch ($action) {
        case 'list':
            // Get list of materi
            $where = "WHERE is_active = 1";
            $params = [];
            
            if ($kategori_id) {
                $where .= " AND kategori_id = ?";
                $params[] = $kategori_id;
            }
            
            $sql = "SELECT m.*, k.nama_kategori, t.nama_topic 
                    FROM materi m 
                    LEFT JOIN kategori_soal k ON m.kategori_id = k.id 
                    LEFT JOIN topics t ON m.topic_id = t.id 
                    $where 
                    ORDER BY m.urutan, m.judul";
            
            $stmt = $conn->prepare($sql);
            if (!empty($params)) {
                $stmt->bind_param(str_repeat('i', count($params)), ...$params);
            }
            $stmt->execute();
            $result = $stmt->get_result();
            
            $materi_list = [];
            while ($row = $result->fetch_assoc()) {
                $materi_list[] = $row;
            }
            
            echo json_encode([
                'success' => true,
                'data' => $materi_list
            ]);
            break;
            
        case 'detail':
            // Get materi detail with sections
            if (!$materi_id) {
                throw new Exception("materi_id is required");
            }
            
            // Get materi info
            $sql = "SELECT m.*, k.nama_kategori, t.nama_topic 
                    FROM materi m 
                    LEFT JOIN kategori_soal k ON m.kategori_id = k.id 
                    LEFT JOIN topics t ON m.topic_id = t.id 
                    WHERE m.id = ?";
            $stmt = $conn->prepare($sql);
            $stmt->bind_param('i', $materi_id);
            $stmt->execute();
            $materi = $stmt->get_result()->fetch_assoc();
            
            if (!$materi) {
                throw new Exception("Materi not found");
            }
            
            // Get sections
            $sql = "SELECT * FROM materi_sections WHERE materi_id = ? ORDER BY urutan";
            $stmt = $conn->prepare($sql);
            $stmt->bind_param('i', $materi_id);
            $stmt->execute();
            $sections = [];
            $result = $stmt->get_result();
            while ($row = $result->fetch_assoc()) {
                $sections[] = $row;
            }
            $materi['sections'] = $sections;
            
            // Load content from file if needed
            if ($materi['file_path'] && file_exists('../' . $materi['file_path'])) {
                $content = json_decode(file_get_contents('../' . $materi['file_path']), true);
                $materi['full_content'] = $content;
            }
            
            // Get user progress if user_id provided
            if ($user_id) {
                $sql = "SELECT * FROM learning_progress WHERE user_id = ? AND materi_id = ?";
                $stmt = $conn->prepare($sql);
                $stmt->bind_param('ii', $user_id, $materi_id);
                $stmt->execute();
                $progress = $stmt->get_result()->fetch_assoc();
                $materi['user_progress'] = $progress;
            }
            
            echo json_encode([
                'success' => true,
                'data' => $materi
            ]);
            break;
            
        case 'section':
            // Get specific section content
            $section_id = $_GET['section_id'] ?? null;
            if (!$section_id) {
                throw new Exception("section_id is required");
            }
            
            $sql = "SELECT s.*, m.judul as materi_judul 
                    FROM materi_sections s 
                    JOIN materi m ON s.materi_id = m.id 
                    WHERE s.id = ?";
            $stmt = $conn->prepare($sql);
            $stmt->bind_param('i', $section_id);
            $stmt->execute();
            $section = $stmt->get_result()->fetch_assoc();
            
            if (!$section) {
                throw new Exception("Section not found");
            }
            
            echo json_encode([
                'success' => true,
                'data' => $section
            ]);
            break;
            
        case 'progress':
            // Update learning progress
            if (!$user_id || !$materi_id) {
                throw new Exception("user_id and materi_id are required");
            }
            
            $section_id = $_GET['section_id'] ?? null;
            $status = $_GET['status'] ?? 'in_progress';
            $progress_percent = $_GET['progress_percent'] ?? 0;
            
            // Check if progress exists
            $sql = "SELECT id FROM learning_progress 
                    WHERE user_id = ? AND materi_id = ? AND (section_id = ? OR section_id IS NULL)";
            $stmt = $conn->prepare($sql);
            $stmt->bind_param('iii', $user_id, $materi_id, $section_id);
            $stmt->execute();
            $existing = $stmt->get_result()->fetch_assoc();
            
            if ($existing) {
                // Update
                $sql = "UPDATE learning_progress 
                        SET status = ?, progress_percent = ?, last_accessed = NOW()";
                if ($status == 'completed') {
                    $sql .= ", completed_at = NOW()";
                }
                $sql .= " WHERE id = ?";
                $stmt = $conn->prepare($sql);
                $stmt->bind_param('sii', $status, $progress_percent, $existing['id']);
                $stmt->execute();
            } else {
                // Insert
                $sql = "INSERT INTO learning_progress 
                        (user_id, materi_id, section_id, status, progress_percent, last_accessed)";
                if ($status == 'completed') {
                    $sql .= ", completed_at";
                }
                $sql .= " VALUES (?, ?, ?, ?, ?, NOW()";
                if ($status == 'completed') {
                    $sql .= ", NOW()";
                }
                $sql .= ")";
                $stmt = $conn->prepare($sql);
                $stmt->bind_param('iiisi', $user_id, $materi_id, $section_id, $status, $progress_percent);
                $stmt->execute();
            }
            
            echo json_encode([
                'success' => true,
                'message' => 'Progress updated'
            ]);
            break;
            
        case 'notes':
            // Get or save user notes
            if (!$user_id || !$materi_id) {
                throw new Exception("user_id and materi_id are required");
            }
            
            if ($_SERVER['REQUEST_METHOD'] === 'POST') {
                // Save note
                $input = json_decode(file_get_contents('php://input'), true);
                $note_text = $input['note_text'] ?? '';
                $section_id = $input['section_id'] ?? null;
                
                $sql = "INSERT INTO learning_notes (user_id, materi_id, section_id, note_text) 
                        VALUES (?, ?, ?, ?)";
                $stmt = $conn->prepare($sql);
                $stmt->bind_param('iiis', $user_id, $materi_id, $section_id, $note_text);
                $stmt->execute();
                
                echo json_encode([
                    'success' => true,
                    'message' => 'Note saved'
                ]);
            } else {
                // Get notes
                $section_id = $_GET['section_id'] ?? null;
                $sql = "SELECT * FROM learning_notes 
                        WHERE user_id = ? AND materi_id = ?";
                if ($section_id) {
                    $sql .= " AND section_id = ?";
                }
                $sql .= " ORDER BY created_at DESC";
                
                $stmt = $conn->prepare($sql);
                if ($section_id) {
                    $stmt->bind_param('iii', $user_id, $materi_id, $section_id);
                } else {
                    $stmt->bind_param('ii', $user_id, $materi_id);
                }
                $stmt->execute();
                
                $notes = [];
                $result = $stmt->get_result();
                while ($row = $result->fetch_assoc()) {
                    $notes[] = $row;
                }
                
                echo json_encode([
                    'success' => true,
                    'data' => $notes
                ]);
            }
            break;
            
        default:
            throw new Exception("Invalid action");
    }
    
    $conn->close();
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
?>
