<?php
// Gamification System API
session_start();
require_once '../config.php';
require_once '../api/middleware.php';

header('Content-Type: application/json');

$action = $_GET['action'] ?? '';

switch ($action) {
    case 'get_user_gamification':
        getUserGamification();
        break;
    case 'get_user_xp':
        getUserXP();
        break;
    case 'add_xp':
        addXP();
        break;
    case 'get_user_streak':
        getUserStreak();
        break;
    case 'update_streak':
        updateStreak();
        break;
    case 'get_user_badges':
        getUserBadges();
        break;
    case 'get_user_achievements':
        getUserAchievements();
        break;
    case 'get_daily_challenges':
        getDailyChallenges();
        break;
    case 'complete_daily_challenge':
        completeDailyChallenge();
        break;
    case 'claim_daily_challenge':
        claimDailyChallenge();
        break;
    case 'check_achievements':
        checkAchievements();
        break;
    case 'get_leaderboard_gamification':
        getLeaderboardGamification();
        break;
    case 'get_all_users_gamification':
        requireAdmin();
        getAllUsersGamification();
        break;
    case 'get_user_gamification_details':
        requireAdmin();
        getUserGamificationDetails();
        break;
    default:
        echo json_encode(['success' => false, 'error' => 'Invalid action']);
        break;
}

function getUserGamification() {
    global $conn;
    
    $user = requireAuth();
    
    $data = [
        'xp' => getUserXPData($user['id']),
        'streak' => getUserStreakData($user['id']),
        'badges' => getUserBadgesData($user['id']),
        'achievements' => getUserAchievementsData($user['id']),
        'daily_challenges' => getDailyChallengesData($user['id'])
    ];
    
    echo json_encode(['success' => true, 'data' => $data]);
}

function getUserXPData($user_id) {
    global $conn;
    
    $sql = "SELECT * FROM user_xp WHERE user_id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param('i', $user_id);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $xp = $result->fetch_assoc();
    
    if (!$xp) {
        // Create default XP entry
        $sql = "INSERT INTO user_xp (user_id, total_xp, level, xp_to_next_level) VALUES (?, 0, 1, 100)";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param('i', $user_id);
        $stmt->execute();
        
        return [
            'total_xp' => 0,
            'level' => 1,
            'xp_to_next_level' => 100,
            'xp_progress' => 0
        ];
    }
    
    $xp['xp_progress'] = ($xp['total_xp'] / $xp['xp_to_next_level']) * 100;
    
    return $xp;
}

function getUserXP() {
    global $conn;
    
    $user = requireAuth();
    
    $xp = getUserXPData($user['id']);
    
    echo json_encode(['success' => true, 'data' => $xp]);
}

function addXP() {
    global $conn;
    
    $data = json_decode(file_get_contents('php://input'), true);
    $user = requireAuth();
    
    $xp_amount = $data['xp_amount'] ?? 0;
    $reason = $data['reason'] ?? '';
    $source = $data['source'] ?? '';
    $source_id = $data['source_id'] ?? null;
    
    if ($xp_amount <= 0) {
        echo json_encode(['success' => false, 'error' => 'Invalid XP amount']);
        return;
    }
    
    // Get current XP
    $xp_data = getUserXPData($user['id']);
    $new_total_xp = $xp_data['total_xp'] + $xp_amount;
    
    // Calculate new level
    $new_level = calculateLevel($new_total_xp);
    $xp_to_next_level = calculateXPForLevel($new_level + 1);
    
    // Update user XP
    $sql = "UPDATE user_xp SET total_xp = ?, level = ?, xp_to_next_level = ? WHERE user_id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param('iiii', $new_total_xp, $new_level, $xp_to_next_level, $user['id']);
    
    if ($stmt->execute()) {
        // Record transaction
        $sql = "INSERT INTO xp_transactions (user_id, xp_amount, reason, source, source_id) VALUES (?, ?, ?, ?, ?)";
        $stmt2 = $conn->prepare($sql);
        $stmt2->bind_param('iissi', $user['id'], $xp_amount, $reason, $source, $source_id);
        $stmt2->execute();
        
        // Check for level-up rewards
        if ($new_level > $xp_data['level']) {
            awardLevelReward($user['id'], $new_level);
        }
        
        echo json_encode(['success' => true, 'new_xp' => $new_total_xp, 'new_level' => $new_level]);
    } else {
        echo json_encode(['success' => false, 'error' => $conn->error]);
    }
}

function calculateLevel($total_xp) {
    // Simple level formula: level = floor(sqrt(xp / 100)) + 1
    return floor(sqrt($total_xp / 100)) + 1;
}

function calculateXPForLevel($level) {
    // XP needed for next level: level^2 * 100
    return ($level * $level) * 100;
}

function awardLevelReward($user_id, $level) {
    global $conn;
    
    // Check if there's a badge reward for this level
    $sql = "SELECT lr.*, b.id as badge_id 
            FROM level_rewards lr 
            LEFT JOIN badges b ON lr.reward_name = b.nama
            WHERE lr.level = ? AND lr.reward_type = 'badge'";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param('i', $level);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $reward = $result->fetch_assoc();
    
    if ($reward && $reward['badge_id']) {
        // Award badge
        $sql = "INSERT IGNORE INTO user_badges (user_id, badge_id) VALUES (?, ?)";
        $stmt2 = $conn->prepare($sql);
        $stmt2->bind_param('ii', $user_id, $reward['badge_id']);
        $stmt2->execute();
    }
}

function getUserStreakData($user_id) {
    global $conn;
    
    $sql = "SELECT * FROM user_streak WHERE user_id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param('i', $user_id);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $streak = $result->fetch_assoc();
    
    if (!$streak) {
        return [
            'current_streak' => 0,
            'longest_streak' => 0,
            'last_activity_date' => null
        ];
    }
    
    return $streak;
}

function getUserStreak() {
    global $conn;
    
    $user = requireAuth();
    
    $streak = getUserStreakData($user['id']);
    
    echo json_encode(['success' => true, 'data' => $streak]);
}

function updateStreak() {
    global $conn;
    
    $user = requireAuth();
    
    $today = date('Y-m-d');
    $streak = getUserStreakData($user['id']);
    
    if (!$streak) {
        // Create new streak entry
        $sql = "INSERT INTO user_streak (user_id, current_streak, longest_streak, last_activity_date) VALUES (?, 1, 1, ?)";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param('is', $user['id'], $today);
        $stmt->execute();
        
        echo json_encode(['success' => true, 'current_streak' => 1, 'is_new_streak' => true]);
        return;
    }
    
    $last_date = $streak['last_activity_date'];
    $last_datetime = strtotime($last_date);
    $today_datetime = strtotime($today);
    $days_diff = ($today_datetime - $last_datetime) / (60 * 60 * 24);
    
    if ($days_diff == 0) {
        // Already logged in today, no change
        echo json_encode(['success' => true, 'current_streak' => $streak['current_streak'], 'is_new_streak' => false]);
        return;
    } elseif ($days_diff == 1) {
        // Consecutive day, increment streak
        $new_streak = $streak['current_streak'] + 1;
        $new_longest = max($streak['longest_streak'], $new_streak);
        
        $sql = "UPDATE user_streak SET current_streak = ?, longest_streak = ?, last_activity_date = ? WHERE user_id = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param('iisi', $new_streak, $new_longest, $today, $user['id']);
        $stmt->execute();
        
        // Award streak badges
        if ($new_streak == 7) {
            awardBadgeByName($user['id'], 'Week Warrior');
        } elseif ($new_streak == 30) {
            awardBadgeByName($user['id'], 'Month Warrior');
        }
        
        echo json_encode(['success' => true, 'current_streak' => $new_streak, 'is_new_streak' => true]);
        return;
    } else {
        // Streak broken, reset
        $sql = "UPDATE user_streak SET current_streak = 1, last_activity_date = ? WHERE user_id = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param('si', $today, $user['id']);
        $stmt->execute();
        
        echo json_encode(['success' => true, 'current_streak' => 1, 'streak_broken' => true]);
        return;
    }
}

function awardBadgeByName($user_id, $badge_name) {
    global $conn;
    
    $sql = "SELECT id FROM badges WHERE nama = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param('s', $badge_name);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $badge = $result->fetch_assoc();
    
    if ($badge) {
        $sql = "INSERT IGNORE INTO user_badges (user_id, badge_id) VALUES (?, ?)";
        $stmt2 = $conn->prepare($sql);
        $stmt2->bind_param('ii', $user_id, $badge['id']);
        $stmt2->execute();
    }
}

function getUserBadgesData($user_id) {
    global $conn;
    
    $sql = "SELECT b.*, ub.earned_at 
            FROM user_badges ub 
            JOIN badges b ON ub.badge_id = b.id 
            WHERE ub.user_id = ? 
            ORDER BY ub.earned_at DESC";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param('i', $user_id);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $badges = [];
    while ($row = $result->fetch_assoc()) {
        $badges[] = $row;
    }
    
    return $badges;
}

function getUserBadges() {
    global $conn;
    
    $user = requireAuth();
    
    $badges = getUserBadgesData($user['id']);
    
    echo json_encode(['success' => true, 'data' => $badges]);
}

function getUserAchievementsData($user_id) {
    global $conn;
    
    $sql = "SELECT a.*, ua.progress, ua.completed_at 
            FROM user_achievements ua 
            JOIN achievements a ON ua.achievement_id = a.id 
            WHERE ua.user_id = ? 
            ORDER BY ua.completed_at DESC, ua.created_at DESC";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param('i', $user_id);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $achievements = [];
    while ($row = $result->fetch_assoc()) {
        $achievements[] = $row;
    }
    
    return $achievements;
}

function getUserAchievements() {
    global $conn;
    
    $user = requireAuth();
    
    $achievements = getUserAchievementsData($user['id']);
    
    echo json_encode(['success' => true, 'data' => $achievements]);
}

function getDailyChallengesData($user_id) {
    global $conn;
    
    $today = date('Y-m-d');
    
    // Get today's challenges
    $sql = "SELECT dc.*, udc.progress, udc.completed_at, udc.claimed_at 
            FROM daily_challenges dc 
            LEFT JOIN user_daily_challenges udc ON dc.id = udc.challenge_id AND udc.user_id = ?
            WHERE dc.date = ? AND dc.is_active = TRUE 
            ORDER BY dc.created_at ASC";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param('is', $user_id, $today);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $challenges = [];
    while ($row = $result->fetch_assoc()) {
        $challenges[] = $row;
    }
    
    return $challenges;
}

function getDailyChallenges() {
    global $conn;
    
    $user = requireAuth();
    
    $challenges = getDailyChallengesData($user['id']);
    
    echo json_encode(['success' => true, 'data' => $challenges]);
}

function completeDailyChallenge() {
    global $conn;
    
    $data = json_decode(file_get_contents('php://input'), true);
    $user = requireAuth();
    
    $challenge_id = $data['challenge_id'] ?? 0;
    $progress = $data['progress'] ?? 0;
    
    $sql = "INSERT INTO user_daily_challenges (user_id, challenge_id, progress) 
            VALUES (?, ?, ?) 
            ON DUPLICATE KEY UPDATE progress = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param('iiii', $user['id'], $challenge_id, $progress, $progress);
    
    if ($stmt->execute()) {
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['success' => false, 'error' => $conn->error]);
    }
}

function claimDailyChallenge() {
    global $conn;
    
    $data = json_decode(file_get_contents('php://input'), true);
    $user = requireAuth();
    
    $challenge_id = $data['challenge_id'] ?? 0;
    
    // Get challenge info
    $sql = "SELECT * FROM daily_challenges WHERE id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param('i', $challenge_id);
    $stmt->execute();
    $challenge = $stmt->get_result()->fetch_assoc();
    
    if (!$challenge) {
        echo json_encode(['success' => false, 'error' => 'Challenge not found']);
        return;
    }
    
    // Check if already claimed
    $sql = "SELECT * FROM user_daily_challenges WHERE user_id = ? AND challenge_id = ? AND claimed_at IS NOT NULL";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param('ii', $user['id'], $challenge_id);
    $stmt->execute();
    $claimed = $stmt->get_result()->fetch_assoc();
    
    if ($claimed) {
        echo json_encode(['success' => false, 'error' => 'Already claimed']);
        return;
    }
    
    // Mark as claimed and award XP
    $sql = "UPDATE user_daily_challenges SET claimed_at = NOW() WHERE user_id = ? AND challenge_id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param('ii', $user['id'], $challenge_id);
    $stmt->execute();
    
    // Award XP
    addXPInternal($user['id'], $challenge['xp_reward'], 'Daily Challenge', 'daily_challenge', $challenge_id);
    
    echo json_encode(['success' => true, 'xp_rewarded' => $challenge['xp_reward']]);
}

function addXPInternal($user_id, $xp_amount, $reason, $source, $source_id) {
    global $conn;
    
    $xp_data = getUserXPData($user_id);
    $new_total_xp = $xp_data['total_xp'] + $xp_amount;
    $new_level = calculateLevel($new_total_xp);
    $xp_to_next_level = calculateXPForLevel($new_level + 1);
    
    $sql = "UPDATE user_xp SET total_xp = ?, level = ?, xp_to_next_level = ? WHERE user_id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param('iiii', $new_total_xp, $new_level, $xp_to_next_level, $user_id);
    $stmt->execute();
    
    $sql = "INSERT INTO xp_transactions (user_id, xp_amount, reason, source, source_id) VALUES (?, ?, ?, ?, ?)";
    $stmt2 = $conn->prepare($sql);
    $stmt2->bind_param('iissi', $user_id, $xp_amount, $reason, $source, $source_id);
    $stmt2->execute();
    
    if ($new_level > $xp_data['level']) {
        awardLevelReward($user_id, $new_level);
    }
}

function checkAchievements() {
    global $conn;
    
    $user = requireAuth();
    
    // Get user stats
    $sql = "SELECT COUNT(*) as exam_count FROM riwayat_ujian WHERE user_id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param('i', $user['id']);
    $stmt->execute();
    $exam_count = $stmt->get_result()->fetch_assoc()['exam_count'];
    
    $sql = "SELECT MAX(nilai_total) as max_score FROM riwayat_ujian WHERE user_id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param('i', $user['id']);
    $stmt->execute();
    $max_score = $stmt->get_result()->fetch_assoc()['max_score'] ?? 0;
    
    $streak = getUserStreakData($user['id']);
    
    $sql = "SELECT COUNT(*) as daily_challenges_count FROM user_daily_challenges WHERE user_id = ? AND completed_at IS NOT NULL";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param('i', $user['id']);
    $stmt->execute();
    $daily_challenges_count = $stmt->get_result()->fetch_assoc()['daily_challenges_count'];
    
    // Get achievements to check
    $sql = "SELECT * FROM achievements WHERE is_active = TRUE";
    $result = $conn->query($sql);
    
    $new_achievements = [];
    
    while ($achievement = $result->fetch_assoc()) {
        // Check if already earned
        $sql = "SELECT * FROM user_achievements WHERE user_id = ? AND achievement_id = ?";
        $stmt2 = $conn->prepare($sql);
        $stmt2->bind_param('ii', $user['id'], $achievement['id']);
        $stmt2->execute();
        $earned = $stmt2->get_result()->fetch_assoc();
        
        if ($earned) {
            continue;
        }
        
        // Check criteria
        $criteria_met = false;
        
        switch ($achievement['criteria_type']) {
            case 'exam_count':
                $criteria_met = $exam_count >= $achievement['criteria_value'];
                break;
            case 'exam_score':
                $criteria_met = $max_score >= $achievement['criteria_value'];
                break;
            case 'streak_days':
                $criteria_met = $streak['longest_streak'] >= $achievement['criteria_value'];
                break;
            case 'daily_challenges':
                $criteria_met = $daily_challenges_count >= $achievement['criteria_value'];
                break;
        }
        
        if ($criteria_met) {
            // Award achievement
            $sql = "INSERT INTO user_achievements (user_id, achievement_id, progress, completed_at) VALUES (?, ?, ?, NOW())";
            $stmt3 = $conn->prepare($sql);
            $stmt3->bind_param('iii', $user['id'], $achievement['id'], $achievement['criteria_value']);
            $stmt3->execute();
            
            // Award XP
            addXPInternal($user['id'], $achievement['xp_reward'], 'Achievement: ' . $achievement['nama'], 'achievement', $achievement['id']);
            
            // Award badge if linked
            if ($achievement['badge_id']) {
                $sql = "INSERT IGNORE INTO user_badges (user_id, badge_id) VALUES (?, ?)";
                $stmt4 = $conn->prepare($sql);
                $stmt4->bind_param('ii', $user['id'], $achievement['badge_id']);
                $stmt4->execute();
            }
            
            $new_achievements[] = $achievement;
        }
    }
    
    echo json_encode(['success' => true, 'new_achievements' => $new_achievements]);
}

function getLeaderboardGamification() {
    global $conn;
    
    $sql = "SELECT u.nama_lengkap, u.nama_peserta, ux.total_xp, ux.level, us.current_streak, us.longest_streak
            FROM user_xp ux
            JOIN users u ON ux.user_id = u.id
            LEFT JOIN user_streak us ON ux.user_id = us.user_id
            ORDER BY ux.total_xp DESC
            LIMIT 50";
    $result = $conn->query($sql);
    
    $leaderboard = [];
    while ($row = $result->fetch_assoc()) {
        $leaderboard[] = $row;
    }
    
    echo json_encode(['success' => true, 'data' => $leaderboard]);
}

function getAllUsersGamification() {
    global $conn;
    
    // Check if required tables exist
    $check_tables = $conn->query("SHOW TABLES LIKE 'user_xp'");
    if ($check_tables->num_rows == 0) {
        // Return empty data instead of error to allow section to display
        echo json_encode(['success' => true, 'data' => []]);
        return;
    }
    
    try {
        // Simplified query without subqueries to avoid potential issues
        $sql = "SELECT u.id, u.nama_lengkap, u.nama_peserta, 
                COALESCE(ux.total_xp, 0) as total_xp,
                COALESCE(ux.level, 1) as level,
                COALESCE(us.current_streak, 0) as current_streak,
                COALESCE(us.longest_streak, 0) as longest_streak
                FROM users u
                LEFT JOIN user_xp ux ON u.id = ux.user_id
                LEFT JOIN user_streak us ON u.id = us.user_id
                WHERE u.role = 'user'
                ORDER BY ux.total_xp DESC";
        $result = $conn->query($sql);
        
        if (!$result) {
            // Return empty data on query failure
            echo json_encode(['success' => true, 'data' => []]);
            return;
        }
        
        $users = [];
        while ($row = $result->fetch_assoc()) {
            // Get badge and achievement counts separately
            $user_id = $row['id'];
            
            $badge_count = 0;
            $badge_result = $conn->query("SELECT COUNT(*) as count FROM user_badges WHERE user_id = $user_id");
            if ($badge_result) {
                $badge_count = $badge_result->fetch_assoc()['count'];
            }
            
            $achievement_count = 0;
            $achievement_result = $conn->query("SELECT COUNT(*) as count FROM user_achievements WHERE user_id = $user_id AND completed_at IS NOT NULL");
            if ($achievement_result) {
                $achievement_count = $achievement_result->fetch_assoc()['count'];
            }
            
            $row['badge_count'] = $badge_count;
            $row['achievement_count'] = $achievement_count;
            $users[] = $row;
        }
        
        echo json_encode(['success' => true, 'data' => $users]);
    } catch (Exception $e) {
        // Return empty data on any exception
        echo json_encode(['success' => true, 'data' => []]);
    }
}

function getUserGamificationDetails() {
    global $conn;
    
    $user_id = $_GET['user_id'] ?? 0;
    
    $data = [
        'xp' => getUserXPData($user_id),
        'streak' => getUserStreakData($user_id),
        'badges' => getUserBadgesData($user_id),
        'achievements' => getUserAchievementsData($user_id),
        'daily_challenges' => getDailyChallengesData($user_id),
        'xp_transactions' => []
    ];
    
    // Get XP transactions
    $sql = "SELECT * FROM xp_transactions WHERE user_id = ? ORDER BY created_at DESC LIMIT 20";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param('i', $user_id);
    $stmt->execute();
    $result = $stmt->get_result();
    
    while ($row = $result->fetch_assoc()) {
        $data['xp_transactions'][] = $row;
    }
    
    echo json_encode(['success' => true, 'data' => $data]);
}
?>
