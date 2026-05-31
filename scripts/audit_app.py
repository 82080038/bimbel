#!/usr/bin/env python3
"""
Aplikasi Audit - Ujian Sekolah Kedinasan
Script Python untuk melakukan audit menyeluruh aplikasi PHP/JS
"""

import json
import os
import re
import sys
from pathlib import Path

class AppAuditor:
    def __init__(self, base_path):
        self.base_path = Path(base_path)
        self.issues = []
        self.warnings = []
        self.fixed = []
        
        # Field mappings: correct_field -> wrong_fields
        self.field_mappings = {
            'nama_kategori': ['\.kategori\b(?!_)'],
            'tipe': ['jenis_file'],
            'topic_name': ['nama_topic'],
            'konten': ['deskripsi'],
        }
        
        # Files that should exist
        self.required_files = [
            'manifest.json',
            'icon-192.svg', 
            'icon-512.svg',
            'participant/sections/materi-content.html',
            'participant/sections/dashboard-content.html',
            'participant/sections/profile-content.html',
            'participant/sections/ujian-content.html',
            'participant/sections/achievements-content.html',
            'participant/sections/leaderboard-content.html',
            'participant/components/modals-shared.html',
        ]
        
        # API endpoints to check
        self.api_endpoints = [
            'auth.php',
            'soal.php',
            'gamification.php',
            'analytics.php',
            'courses.php',
        ]

    def log_issue(self, file_path, line_num, issue_type, description, severity='error'):
        self.issues.append({
            'file': str(file_path),
            'line': line_num,
            'type': issue_type,
            'description': description,
            'severity': severity
        })

    def scan_js_files(self):
        """Scan all JS files for field name mismatches and data flow issues"""
        js_dir = self.base_path / 'participant' / 'js'
        
        if not js_dir.exists():
            self.log_issue(js_dir, 0, 'MISSING_DIR', 'JS directory not found', 'critical')
            return
            
        for js_file in js_dir.glob('*.js'):
            content = js_file.read_text(encoding='utf-8', errors='ignore')
            lines = content.split('\n')
            
            for line_num, line in enumerate(lines, 1):
                # Check for problematic field access patterns
                # Pattern: m.kategori without nama_kategori fallback
                if re.search(r'\bkategori\b', line) and not re.search(r'nama_kategori', line):
                    if 'm.kategori' in line or 'exam.kategori' in line or 'activity.kategori' in line:
                        if not re.search(r'dominantCategory|kategoriNames', line):
                            self.log_issue(js_file, line_num, 'FIELD_MISMATCH', 
                                f"Potentially incorrect field access: {line.strip()[:80]}", 'warning')
                
                # Check for jenis_file (should be tipe)
                if 'jenis_file' in line:
                    self.log_issue(js_file, line_num, 'FIELD_MISMATCH',
                        f"'jenis_file' should be 'tipe'", 'error')
                
                # Check for nama_topic (should be topic_name)
                if 'nama_topic' in line:
                    self.log_issue(js_file, line_num, 'FIELD_MISMATCH',
                        f"'nama_topic' should be 'topic_name'", 'error')
                
                # Check fetch calls without auth headers
                if 'fetch(' in line and 'apiUrl' in line:
                    if 'getAuthHeaders' not in line and 'Authorization' not in line:
                        # Check next 5 lines for headers
                        next_lines = '\n'.join(lines[line_num:line_num+5])
                        if 'headers' not in next_lines:
                            self.log_issue(js_file, line_num, 'MISSING_AUTH',
                                "API call may be missing authentication headers", 'warning')
                
                # Check for hardcoded API limits
                if 'limit=10000' in line or 'limit=9999' in line:
                    self.log_issue(js_file, line_num, 'PERFORMANCE',
                        "Hardcoded high limit may cause performance issues", 'warning')
                
                # Check for inline scripts in HTML injection
                if 'innerHTML' in line and 'script' in line.lower():
                    self.log_issue(js_file, line_num, 'SECURITY',
                        "Potential XSS: script tag in innerHTML", 'warning')

    def scan_html_files(self):
        """Scan HTML files for loading patterns and structure"""
        participant_dir = self.base_path / 'participant'
        
        for html_file in participant_dir.glob('*.html'):
            content = html_file.read_text(encoding='utf-8', errors='ignore')
            
            # Check for dynamic loading pattern
            has_dynamic_load = 'fetch(' in content and 'innerHTML' in content
            has_init_after_load = 'initAfterLoad' in content or 'initUIAfterLoad' in content
            
            if not has_dynamic_load and html_file.name not in ['certificate.html', 'sertifikat-print.html']:
                self.log_issue(html_file, 0, 'LOADING_PATTERN',
                    f"May be missing dynamic content loading", 'warning')
            
            if has_dynamic_load and not has_init_after_load:
                self.log_issue(html_file, 0, 'LOADING_PATTERN',
                    f"Dynamic loading without initAfterLoad call", 'warning')
            
            # Check for duplicate -new.html files
            if '-new.html' in html_file.name:
                self.log_issue(html_file, 0, 'DUPLICATE_FILE',
                    f"Duplicate -new.html file should be removed", 'warning')

    def check_pwa_files(self):
        """Check PWA required files"""
        pwa_files = ['manifest.json', 'icon-192.svg', 'icon-512.svg']
        for file in pwa_files:
            file_path = self.base_path / file
            if not file_path.exists():
                self.log_issue(file_path, 0, 'PWA_MISSING',
                    f"PWA file missing: {file}", 'warning')
            else:
                self.fixed.append(f"PWA file exists: {file}")

    def check_api_endpoints(self):
        """Check API files for common issues"""
        api_dir = self.base_path / 'api'
        
        if not api_dir.exists():
            self.log_issue(api_dir, 0, 'MISSING_DIR', 'API directory not found', 'critical')
            return
            
        sql_keywords = ['SELECT ', 'INSERT ', 'UPDATE ', 'DELETE ', 'FROM ', 'WHERE ']
            
        for php_file in api_dir.glob('*.php'):
            content = php_file.read_text(encoding='utf-8', errors='ignore')
            
            # Only check SQL injection if file actually has SQL queries
            has_sql = any(kw in content.upper() for kw in sql_keywords)
            
            # Skip utility/helper files that don't contain actual SQL queries
            skip_files = ['api_protection.php', 'csrf.php', 'rate_limiter.php', 'validator.php', 'middleware.php']
            if php_file.name in skip_files:
                continue
            
            if has_sql:
                # Check for SQL injection risks - $_GET used in SQL without prepare
                if "$_GET" in content and 'prepare' not in content:
                    # Check if $_GET values are cast with intval() or escaped
                    if 'intval($_GET' not in content and 'real_escape_string' not in content:
                        self.log_issue(php_file, 0, 'SECURITY',
                            "Potential SQL injection: $_GET used in SQL without sanitization", 'critical')
                
                # Check for missing auth on endpoints that modify data
                has_write_ops = any(kw in content.upper() for kw in ['INSERT ', 'UPDATE ', 'DELETE '])
                if has_write_ops and 'requireAuth' not in content and 'auth.php' not in content:
                    self.log_issue(php_file, 0, 'SECURITY',
                        "Write API missing authentication check", 'warning')

    def check_database_consistency(self):
        """Check if PHP files reference correct DB fields"""
        # This would require DB connection - provide instructions instead
        pass

    def generate_report(self):
        """Generate audit report"""
        print("=" * 70)
        print("APLIKASI AUDIT REPORT")
        print("=" * 70)
        print()
        
        # Group issues by severity
        errors = [i for i in self.issues if i['severity'] == 'error']
        warnings = [i for i in self.issues if i['severity'] == 'warning']
        critical = [i for i in self.issues if i['severity'] == 'critical']
        
        print(f"CRITICAL ISSUES: {len(critical)}")
        for issue in critical:
            print(f"  [CRITICAL] {issue['file']}:{issue['line']}")
            print(f"    {issue['description']}")
        print()
        
        print(f"ERRORS: {len(errors)}")
        for issue in errors:
            print(f"  [ERROR] {issue['file']}:{issue['line']}")
            print(f"    {issue['description']}")
        print()
        
        print(f"WARNINGS: {len(warnings)}")
        for issue in warnings[:20]:  # Limit output
            print(f"  [WARNING] {issue['file']}:{issue['line']}")
            print(f"    {issue['description']}")
        if len(warnings) > 20:
            print(f"  ... and {len(warnings) - 20} more warnings")
        print()
        
        if self.fixed:
            print(f"FIXED/COMPLETED: {len(self.fixed)}")
            for item in self.fixed:
                print(f"  [OK] {item}")
            print()
        
        # Summary
        total_issues = len(critical) + len(errors) + len(warnings)
        print("=" * 70)
        print(f"TOTAL ISSUES: {total_issues}")
        print(f"  - Critical: {len(critical)}")
        print(f"  - Errors: {len(errors)}")
        print(f"  - Warnings: {len(warnings)}")
        print()
        
        health_score = max(0, 100 - (len(critical) * 10 + len(errors) * 5 + len(warnings) * 1))
        print(f"HEALTH SCORE: {health_score}/100")
        print("=" * 70)
        
        return total_issues == 0

    def run_audit(self):
        """Run full audit"""
        print("Starting comprehensive audit...")
        print()
        
        self.scan_js_files()
        self.scan_html_files()
        self.check_pwa_files()
        self.check_api_endpoints()
        
        return self.generate_report()


def main():
    # Detect base path
    script_dir = Path(__file__).parent.parent
    base_path = script_dir.resolve()
    
    print(f"Auditing application at: {base_path}")
    print()
    
    auditor = AppAuditor(base_path)
    is_healthy = auditor.run_audit()
    
    if not is_healthy:
        print()
        print("RECOMMENDATIONS:")
        print("1. Fix all CRITICAL issues immediately")
        print("2. Fix ERROR issues before next release")
        print("3. Review WARNING items for potential improvements")
        sys.exit(1)
    else:
        print()
        print("Application is healthy!")
        sys.exit(0)


if __name__ == '__main__':
    main()
