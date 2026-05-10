#!/bin/bash

echo "==================================="
echo "Setup Aplikasi Ujian Sekolah Kedinasan"
echo "==================================="
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo "Error: Script ini harus dijalankan dengan root privileges"
    echo "Gunakan: sudo bash setup.sh"
    exit 1
fi

# Start XAMPP
echo "1. Starting XAMPP..."
/opt/lampp/lampp start
if [ $? -eq 0 ]; then
    echo "✓ XAMPP berhasil di-start"
else
    echo "✗ Gagal men-start XAMPP"
    exit 1
fi
echo ""

# Wait for MySQL to be ready
echo "2. Menunggu MySQL siap..."
sleep 5
echo "✓ MySQL seharusnya sudah siap"
echo ""

# Check MySQL connection
echo "3. Cek koneksi MySQL..."
/opt/lampp/bin/mysql -u root -e "SELECT VERSION();" > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "✓ Koneksi MySQL berhasil"
else
    echo "⚠ MySQL mungkin memerlukan password. Silakan import database secara manual via phpMyAdmin"
    echo "   URL: http://localhost/phpmyadmin"
    echo "   Import file: database.sql"
    echo ""
    echo "Lanjut ke import sample questions..."
fi
echo ""

# Import database
echo "4. Import database structure..."
if /opt/lampp/bin/mysql -u root < database.sql 2>/dev/null; then
    echo "✓ Database structure berhasil di-import"
else
    echo "⚠ Gagal import database structure. Coba secara manual via phpMyAdmin"
    echo "   URL: http://localhost/phpmyadmin"
    echo "   Import file: database.sql"
fi
echo ""

# Import sample questions
echo "5. Import sample questions..."
/opt/lampp/bin/php seed_questions.php
echo ""

echo "==================================="
echo "Setup Selesai!"
echo "==================================="
echo ""
echo "Akses aplikasi di: http://localhost/ujian/"
echo ""
echo "Jika ada error, silakan:"
echo "1. Cek phpMyAdmin: http://localhost/phpmyadmin"
echo "2. Import database.sql secara manual"
echo "3. Jalankan seed_questions.php via browser"
echo ""
