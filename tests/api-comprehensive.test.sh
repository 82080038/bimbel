#!/bin/bash
# Comprehensive API Test Suite
# Tests: auth, data isolation, exam flow, analytics, leaderboard, expert

BASE="http://localhost/ujian/api"
PASS=0
FAIL=0
ERRORS=()

green='\033[0;32m'
red='\033[0;31m'
yellow='\033[1;33m'
nc='\033[0m'

assert() {
    local label="$1"
    local result="$2"
    local expect="$3"
    if [ "$result" = "$expect" ]; then
        echo -e "${green}✓ PASS${nc} $label"
        ((PASS++))
    else
        echo -e "${red}✗ FAIL${nc} $label (got: $result, want: $expect)"
        ERRORS+=("$label")
        ((FAIL++))
    fi
}

assert_contains() {
    local label="$1"
    local result="$2"
    local expect="$3"
    if echo "$result" | grep -q "$expect"; then
        echo -e "${green}✓ PASS${nc} $label"
        ((PASS++))
    else
        echo -e "${red}✗ FAIL${nc} $label (expected to contain: $expect)"
        ERRORS+=("$label")
        ((FAIL++))
    fi
}

api_get() { curl -s "$BASE/$1" -H "Authorization: Bearer $2"; }
api_post() { curl -s -X POST "$BASE/$1" -H "Content-Type: application/json" -H "Authorization: Bearer $2" -d "$3"; }
jq_val() { echo "$1" | python3 -c "import sys,json; d=json.load(sys.stdin); print($2)" 2>/dev/null; }
success() { jq_val "$1" "d.get('success','false')"; }

echo ""
echo "========================================"
echo " UJIAN APP — COMPREHENSIVE API TESTS"
echo "========================================"

# ─── SETUP ────────────────────────────────
echo -e "\n${yellow}[SETUP] Login & Token${nc}"

RESP_LOGIN=$(curl -s -X POST "$BASE/auth.php?action=login" \
  -H "Content-Type: application/json" \
  -d '{"username":"fresh_user_11778919457","password":"simulasi123"}')
TOKEN1=$(jq_val "$RESP_LOGIN" "d['user']['api_key']")
USER1_ID=$(jq_val "$RESP_LOGIN" "d['user']['id']")

RESP_ADMIN=$(curl -s -X POST "$BASE/auth.php?action=login" \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}')
TOKEN_ADMIN=$(jq_val "$RESP_ADMIN" "d['user']['api_key']")

assert "Login user1 berhasil" "$(success "$RESP_LOGIN")" "True"
assert "Login admin berhasil" "$(success "$RESP_ADMIN")" "True"
assert "Token user1 tidak kosong" "$([ -n "$TOKEN1" ] && echo ok || echo empty)" "ok"
assert "Token admin tidak kosong" "$([ -n "$TOKEN_ADMIN" ] && echo ok || echo empty)" "ok"

# ─── AUTH PROTECTION ──────────────────────
echo -e "\n${yellow}[AUTH] Semua endpoint wajib token${nc}"

for action in get_riwayat_ujian get_statistik get_exam_result get_sertifikat; do
    R=$(api_get "soal.php?action=$action" "")
    assert "Tanpa token: $action diblokir" "$(success "$R")" "False"
done

R=$(api_get "analytics.php?action=get_user_analytics" "")
assert "Tanpa token: get_user_analytics diblokir" "$(success "$R")" "False"

# ─── EXAM FLOW ────────────────────────────
echo -e "\n${yellow}[EXAM] Alur lengkap ujian${nc}"

# Submit exam
R_SUBMIT=$(api_post "soal.php?action=submit_ujian" "$TOKEN1" \
  '{"answers":{"1":"A","2":"B","3":"C","4":"D","5":"E"},"exam_type_id":1,"paket_id":1}')
assert "Submit ujian berhasil" "$(success "$R_SUBMIT")" "True"
HASIL_ID=$(jq_val "$R_SUBMIT" "d.get('data',{}).get('id',0)")
assert "Hasil ID tersimpan" "$([ "$HASIL_ID" -gt 0 ] 2>/dev/null && echo ok || echo fail)" "ok"

# Riwayat
R_RIW=$(api_get "soal.php?action=get_riwayat_ujian&limit=1" "$TOKEN1")
assert "Riwayat ujian tersedia" "$(success "$R_RIW")" "True"
UID_CHECK=$(jq_val "$R_RIW" "str(set(r['user_id'] for r in d.get('data',[]))) if d.get('data') else '{}'")
assert "Riwayat hanya data sendiri" "$(echo "$UID_CHECK" | grep -v "$USER1_ID" | grep -c '[0-9]')" "0"

# Statistik
R_STAT=$(api_get "soal.php?action=get_statistik" "$TOKEN1")
assert "Statistik user tersedia" "$(success "$R_STAT")" "True"
assert "Statistik punya total_exams" "$(jq_val "$R_STAT" "'ok' if 'total_exams' in str(d) else 'missing'")" "ok"

# ─── DATA ISOLATION ───────────────────────
echo -e "\n${yellow}[SECURITY] Data isolation antar user${nc}"

# Ambil hasil milik user lain
OTHER_HASIL=$(sudo /opt/lampp/bin/mysql -u root -proot ujian_sekolah_kedinasan 2>/dev/null -sN -e \
  "SELECT id FROM hasil_ujian WHERE user_id != $USER1_ID LIMIT 1")

if [ -n "$OTHER_HASIL" ] && [ "$OTHER_HASIL" -gt 0 ] 2>/dev/null; then
    R_CROSS=$(api_get "soal.php?action=get_exam_result&id=$OTHER_HASIL" "$TOKEN1")
    assert "User1 tidak bisa akses hasil user lain" "$(success "$R_CROSS")" "False"

    R_CERT=$(api_get "soal.php?action=get_sertifikat&hasil_id=$OTHER_HASIL" "$TOKEN1")
    assert "User1 tidak bisa akses sertifikat user lain" "$(success "$R_CERT")" "False"
else
    echo -e "${yellow}  SKIP: tidak ada hasil dari user lain${nc}"
fi

# Admin bisa akses semua
if [ -n "$HASIL_ID" ] && [ "$HASIL_ID" -gt 0 ] 2>/dev/null; then
    R_ADMIN_VIEW=$(api_get "soal.php?action=get_exam_result&id=$HASIL_ID" "$TOKEN_ADMIN")
    assert "Admin bisa lihat hasil user lain" "$(success "$R_ADMIN_VIEW")" "True"
fi

# ─── ANALYTICS ────────────────────────────
echo -e "\n${yellow}[ANALYTICS] User & Admin analytics${nc}"

R_UA=$(api_get "analytics.php?action=get_user_analytics" "$TOKEN1")
assert "get_user_analytics berhasil" "$(success "$R_UA")" "True"
assert "user_analytics punya total_exams" "$(jq_val "$R_UA" "'ok' if 'total_exams' in str(d) else 'missing'")" "ok"
assert "user_analytics punya avg_score" "$(jq_val "$R_UA" "'ok' if 'avg_score' in str(d) else 'missing'")" "ok"

# Admin-only analytics
R_EXAM_ANLT=$(api_get "analytics.php?action=get_exam_analytics" "$TOKEN_ADMIN")
assert "Admin: get_exam_analytics berhasil" "$(success "$R_EXAM_ANLT")" "True"

R_EXAM_ANLT_USER=$(api_get "analytics.php?action=get_exam_analytics" "$TOKEN1")
assert "User biasa: get_exam_analytics diblokir" "$(success "$R_EXAM_ANLT_USER")" "False"

# ─── LEADERBOARD ──────────────────────────
echo -e "\n${yellow}[LEADERBOARD] Ranking & Optout${nc}"

R_RANK=$(api_get "soal.php?action=get_ranking" "$TOKEN1")
assert "Leaderboard tersedia" "$(success "$R_RANK")" "True"

R_OPTOUT=$(api_post "soal.php?action=leaderboard_optout" "$TOKEN1" '{"optout":true}')
assert "Opt-out leaderboard berhasil" "$(success "$R_OPTOUT")" "True"

R_STATUS=$(api_get "soal.php?action=get_leaderboard_optout_status" "$TOKEN1")
assert "Status optout = true" "$(jq_val "$R_STATUS" "d.get('opted_out')")" "True"

# Re-optin
R_OPTIN=$(api_post "soal.php?action=leaderboard_optout" "$TOKEN1" '{"optout":false}')
assert "Opt-in leaderboard berhasil" "$(success "$R_OPTIN")" "True"

# ─── EXPERT SYSTEM ───────────────────────
echo -e "\n${yellow}[EXPERT] Rekomendasi & knowledge${nc}"

R_EXPERT=$(api_get "expert.php?action=get_learning_recommendations" "$TOKEN1")
assert "get_learning_recommendations berhasil" "$(success "$R_EXPERT")" "True"
assert "Rekomendasi berupa array" "$(jq_val "$R_EXPERT" "'ok' if isinstance(d.get('data',[]),list) else 'fail'")" "ok"

R_EK=$(api_get "expert.php?action=get_expert_knowledge&kategori_id=1" "$TOKEN1")
assert "get_expert_knowledge berhasil" "$(success "$R_EK")" "True"

# ─── SOAL & PAKET ─────────────────────────
echo -e "\n${yellow}[SOAL] Data soal & paket${nc}"

R_SOAL=$(api_get "soal.php?action=get_soal_acak&limit=5" "$TOKEN1")
assert "get_soal_acak berhasil" "$(success "$R_SOAL")" "True"

R_PAKET=$(api_get "soal.php?action=get_paket" "$TOKEN1")
assert "get_paket berhasil" "$(success "$R_PAKET")" "True"

R_KATEGORI=$(api_get "soal.php?action=get_kategori" "$TOKEN1")
assert "get_kategori berhasil" "$(success "$R_KATEGORI")" "True"
K_COUNT=$(jq_val "$R_KATEGORI" "len(d.get('data',[]))")
assert "Kategori tepat 5 (no duplikat)" "$K_COUNT" "5"

R_EXAM_TYPES=$(api_get "soal.php?action=get_exam_types" "$TOKEN1")
assert "get_exam_types berhasil" "$(success "$R_EXAM_TYPES")" "True"

# ─── PROFILE ─────────────────────────────
echo -e "\n${yellow}[PROFILE] Data profil user${nc}"

R_PROFILE=$(api_get "auth.php?action=get_profile" "$TOKEN1")
assert "get_profile berhasil" "$(success "$R_PROFILE")" "True"
PROFILE_UID=$(jq_val "$R_PROFILE" "d.get('user',d.get('data',{})).get('id',0)")
assert "Profile adalah data sendiri" "$PROFILE_UID" "$USER1_ID"

# ─── DB INTEGRITY ────────────────────────
echo -e "\n${yellow}[DB] Integritas database${nc}"

# Orphan check
ORPHAN_SOAL=$(sudo /opt/lampp/bin/mysql -u root -proot ujian_sekolah_kedinasan 2>/dev/null -sN -e \
  "SELECT COUNT(*) FROM soal WHERE kategori_id NOT IN (SELECT id FROM kategori_soal)")
assert "Tidak ada soal orphan (kategori)" "$ORPHAN_SOAL" "0"

ORPHAN_HASIL=$(sudo /opt/lampp/bin/mysql -u root -proot ujian_sekolah_kedinasan 2>/dev/null -sN -e \
  "SELECT COUNT(*) FROM hasil_ujian WHERE user_id NOT IN (SELECT id FROM users)")
assert "Tidak ada hasil_ujian orphan (user)" "$ORPHAN_HASIL" "0"

DUP_KATEGORI=$(sudo /opt/lampp/bin/mysql -u root -proot ujian_sekolah_kedinasan 2>/dev/null -sN -e \
  "SELECT COUNT(*) FROM kategori_soal")
assert "Kategori_soal tepat 5 baris" "$DUP_KATEGORI" "5"

NO_NAMA_LENGKAP=$(sudo /opt/lampp/bin/mysql -u root -proot ujian_sekolah_kedinasan 2>/dev/null -sN -e \
  "SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
   WHERE TABLE_SCHEMA='ujian_sekolah_kedinasan' AND TABLE_NAME='hasil_ujian' AND COLUMN_NAME='nama_lengkap'")
assert "nama_lengkap sudah dihapus dari hasil_ujian" "$NO_NAMA_LENGKAP" "0"

NO_NAMA_PESERTA_SESI=$(sudo /opt/lampp/bin/mysql -u root -proot ujian_sekolah_kedinasan 2>/dev/null -sN -e \
  "SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
   WHERE TABLE_SCHEMA='ujian_sekolah_kedinasan' AND TABLE_NAME='sesi_ujian' AND COLUMN_NAME='nama_peserta'")
assert "nama_peserta sudah dihapus dari sesi_ujian" "$NO_NAMA_PESERTA_SESI" "0"

COLLATION_OK=$(sudo /opt/lampp/bin/mysql -u root -proot ujian_sekolah_kedinasan 2>/dev/null -sN -e \
  "SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
   WHERE TABLE_SCHEMA='ujian_sekolah_kedinasan'
     AND TABLE_NAME IN ('expert_knowledge','kategori_soal')
     AND COLUMN_NAME IN ('sub_kategori','nama_kategori')
     AND COLLATION_NAME != 'utf8mb4_unicode_ci'")
assert "Collation expert_knowledge & kategori_soal seragam" "$COLLATION_OK" "0"

echo -e "\n${yellow}[ADMIN] Admin-only endpoints${nc}"

R_ADMIN_RIWAYAT=$(api_get "soal.php?action=get_riwayat_ujian&limit=10" "$TOKEN_ADMIN")
assert "Admin: get_riwayat_ujian berhasil" "$(success "$R_ADMIN_RIWAYAT")" "True"

R_NOTIF=$(api_get "notifications.php?action=get_history&limit=5" "$TOKEN_ADMIN")
assert "Admin: get_history notifications berhasil" "$(success "$R_NOTIF")" "True"

R_EXPORT_USER=$(api_get "analytics.php?action=export_analytics&type=user" "$TOKEN_ADMIN")
assert "Admin: export_analytics user tidak error" "$(success "$R_EXPORT_USER")" "True"

# ─── SUMMARY ─────────────────────────────
echo ""
echo "========================================"
echo -e " RESULTS: ${green}${PASS} PASS${nc} | ${red}${FAIL} FAIL${nc}"
echo "========================================"

if [ ${#ERRORS[@]} -gt 0 ]; then
    echo -e "\n${red}Failed tests:${nc}"
    for e in "${ERRORS[@]}"; do echo "  - $e"; done
fi

echo ""
[ $FAIL -eq 0 ] && exit 0 || exit 1
