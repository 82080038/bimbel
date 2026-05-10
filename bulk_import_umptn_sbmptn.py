#!/usr/bin/env python3
"""
Script Bulk Import Soal UMPTN/SBMPTN ke Database
Script ini digunakan untuk import soal-soal UMPTN dan SBMPTN secara batch
"""

import mysql.connector
from mysql.connector import Error
import time

# Konfigurasi Database
DB_CONFIG = {
    'host': 'localhost',
    'user': 'root',
    'password': 'root',
    'database': 'ujian_sekolah_kedinasan'
}

# Kategori ID
KATEGORI_TWK = 1
KATEGORI_TIU = 2
KATEGORI_TKP = 3
KATEGORI_TPA = 4
KATEGORI_PSIKOLOGIS = 5

def connect_database():
    """Menghubungkan ke database MySQL"""
    try:
        connection = mysql.connector.connect(**DB_CONFIG)
        if connection.is_connected():
            print("✓ Berhasil terhubung ke database MySQL")
            return connection
    except Error as e:
        print(f"✗ Gagal terhubung ke database: {e}")
        return None

def check_duplicate(connection, pertanyaan, kategori_id):
    """Cek apakah soal sudah ada di database"""
    try:
        cursor = connection.cursor()
        query = "SELECT id FROM soal WHERE pertanyaan = %s AND kategori_id = %s LIMIT 1"
        cursor.execute(query, (pertanyaan, kategori_id))
        result = cursor.fetchone()
        cursor.close()
        return result is not None
    except Error as e:
        print(f"✗ Error checking duplicate: {e}")
        return False

def insert_soal(connection, pertanyaan, opsi_a, opsi_b, opsi_c, opsi_d, opsi_e, jawaban_benar, kategori_id):
    """Insert soal ke database"""
    try:
        cursor = connection.cursor()
        query = """
        INSERT INTO soal (pertanyaan, opsi_a, opsi_b, opsi_c, opsi_d, opsi_e, jawaban_benar, kategori_id)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        """
        cursor.execute(query, (pertanyaan, opsi_a, opsi_b, opsi_c, opsi_d, opsi_e, jawaban_benar, kategori_id))
        connection.commit()
        soal_id = cursor.lastrowid
        cursor.close()
        return soal_id
    except Error as e:
        print(f"✗ Error inserting soal: {e}")
        return None

# Data Soal UMPTN/SBMPTN (TIU - Tes Intelejensi Umum)
soal_umptn_tiu = [
    {
        'pertanyaan': 'Jika x + y = 10 dan xy = 24, maka nilai dari x² + y² adalah...',
        'opsi_a': '52',
        'opsi_b': '48',
        'opsi_c': '76',
        'opsi_d': '64',
        'opsi_e': '28',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Sebuah segitiga memiliki panjang sisi 5 cm, 12 cm, dan 13 cm. Luas segitiga tersebut adalah...',
        'opsi_a': '30 cm²',
        'opsi_b': '60 cm²',
        'opsi_c': '78 cm²',
        'opsi_d': '65 cm²',
        'opsi_e': '26 cm²',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Dari 5 orang akan dipilih 3 orang untuk menjadi pengurus organisasi. Banyak cara memilih pengurus tersebut adalah...',
        'opsi_a': '10 cara',
        'opsi_b': '20 cara',
        'opsi_c': '60 cara',
        'opsi_d': '120 cara',
        'opsi_e': '15 cara',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Jika f(x) = 2x² - 3x + 5, maka nilai f(3) adalah...',
        'opsi_a': '14',
        'opsi_b': '15',
        'opsi_c': '16',
        'opsi_d': '17',
        'opsi_e': '18',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Sebuah lingkaran memiliki diameter 14 cm. Keliling lingkaran tersebut adalah...',
        'opsi_a': '44 cm',
        'opsi_b': '22 cm',
        'opsi_c': '154 cm',
        'opsi_d': '88 cm',
        'opsi_e': '28 cm',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Hasil dari √144 + √81 adalah...',
        'opsi_a': '21',
        'opsi_b': '15',
        'opsi_c': '18',
        'opsi_d': '12',
        'opsi_e': '24',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Jika 3x + 7 = 19, maka nilai x adalah...',
        'opsi_a': '4',
        'opsi_b': '3',
        'opsi_c': '5',
        'opsi_d': '6',
        'opsi_e': '2',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Sebuah persegi memiliki panjang sisi 8 cm. Keliling persegi tersebut adalah...',
        'opsi_a': '32 cm',
        'opsi_b': '64 cm',
        'opsi_c': '16 cm',
        'opsi_d': '24 cm',
        'opsi_e': '48 cm',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Deret aritmatika: 2, 5, 8, 11, ... Suku ke-10 adalah...',
        'opsi_a': '29',
        'opsi_b': '30',
        'opsi_c': '31',
        'opsi_d': '32',
        'opsi_e': '28',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Jika a : b = 3 : 4 dan b : c = 2 : 3, maka a : c adalah...',
        'opsi_a': '1 : 2',
        'opsi_b': '2 : 3',
        'opsi_c': '3 : 4',
        'opsi_d': '1 : 1',
        'opsi_e': '2 : 1',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Sebuah tabung memiliki jari-jari 7 cm dan tinggi 10 cm. Volume tabung tersebut adalah...',
        'opsi_a': '1540 cm³',
        'opsi_b': '770 cm³',
        'opsi_c': '3080 cm³',
        'opsi_d': '220 cm³',
        'opsi_e': '440 cm³',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Hasil dari 2³ × 3² adalah...',
        'opsi_a': '72',
        'opsi_b': '36',
        'opsi_c': '18',
        'opsi_d': '24',
        'opsi_e': '48',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Jika 20% dari suatu bilangan adalah 40, maka bilangan tersebut adalah...',
        'opsi_a': '200',
        'opsi_b': '100',
        'opsi_c': '150',
        'opsi_d': '250',
        'opsi_e': '180',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Banyak diagonal pada segi delapan adalah...',
        'opsi_a': '20',
        'opsi_b': '16',
        'opsi_c': '24',
        'opsi_d': '28',
        'opsi_e': '32',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Sebuah dadu dilempar sekali. Peluang muncul mata dadu genap adalah...',
        'opsi_a': '1/2',
        'opsi_b': '1/3',
        'opsi_c': '1/6',
        'opsi_d': '2/3',
        'opsi_e': '5/6',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Jika log 2 = 0,301 dan log 3 = 0,477, maka log 6 adalah...',
        'opsi_a': '0,778',
        'opsi_b': '0,678',
        'opsi_c': '0,878',
        'opsi_d': '0,578',
        'opsi_e': '0,978',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Luas trapesium dengan tinggi 8 cm dan panjang sisi sejajar 10 cm dan 14 cm adalah...',
        'opsi_a': '96 cm²',
        'opsi_b': '112 cm²',
        'opsi_c': '88 cm²',
        'opsi_d': '104 cm²',
        'opsi_e': '120 cm²',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Hasil dari (5 + 3)² - (5 - 3)² adalah...',
        'opsi_a': '40',
        'opsi_b': '32',
        'opsi_c': '24',
        'opsi_d': '48',
        'opsi_e': '36',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Jika x = 2 dan y = -3, maka nilai x² - 2xy + y² adalah...',
        'opsi_a': '25',
        'opsi_b': '9',
        'opsi_c': '16',
        'opsi_d': '4',
        'opsi_e': '1',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Sebuah bola memiliki jari-jari 10 cm. Volume bola tersebut adalah...',
        'opsi_a': '4188,79 cm³',
        'opsi_b': '2094,39 cm³',
        'opsi_c': '8377,58 cm³',
        'opsi_d': '1256,64 cm³',
        'opsi_e': '3141,59 cm³',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Jika a = 3 dan b = -2, maka nilai a³ + b³ adalah...',
        'opsi_a': '19',
        'opsi_b': '35',
        'opsi_c': '27',
        'opsi_d': '11',
        'opsi_e': '5',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Hasil dari 125^(2/3) adalah...',
        'opsi_a': '25',
        'opsi_b': '5',
        'opsi_c': '15',
        'opsi_d': '35',
        'opsi_e': '45',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Sebuah kerucut memiliki jari-jari alas 6 cm dan tinggi 8 cm. Volume kerucut tersebut adalah...',
        'opsi_a': '301,59 cm³',
        'opsi_b': '904,78 cm³',
        'opsi_c': '150,8 cm³',
        'opsi_d': '603,19 cm³',
        'opsi_e': '452,39 cm³',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Jika x + 2y = 10 dan 2x - y = 5, maka nilai x adalah...',
        'opsi_a': '4',
        'opsi_b': '3',
        'opsi_c': '5',
        'opsi_d': '6',
        'opsi_e': '2',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Banyak cara menyusun 4 buku dari 6 buku yang berbeda adalah...',
        'opsi_a': '360',
        'opsi_b': '720',
        'opsi_c': '120',
        'opsi_d': '24',
        'opsi_e': '15',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Hasil dari 2^5 + 2^4 + 2^3 adalah...',
        'opsi_a': '56',
        'opsi_b': '64',
        'opsi_c': '48',
        'opsi_d': '72',
        'opsi_e': '40',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Sebuah kubus memiliki volume 64 cm³. Panjang rusuk kubus tersebut adalah...',
        'opsi_a': '4 cm',
        'opsi_b': '8 cm',
        'opsi_c': '2 cm',
        'opsi_d': '6 cm',
        'opsi_e': '16 cm',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Jika sin 30° = 1/2, maka cos 60° adalah...',
        'opsi_a': '1/2',
        'opsi_b': '√3/2',
        'opsi_c': '1',
        'opsi_d': '0',
        'opsi_e': '√2/2',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Dari 7 orang akan dipilih ketua, wakil ketua, dan sekretaris. Banyak cara memilih adalah...',
        'opsi_a': '210',
        'opsi_b': '35',
        'opsi_c': '5040',
        'opsi_d': '343',
        'opsi_e': '21',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Jika f(x) = 2x + 3 dan g(x) = x² - 1, maka f(g(2)) adalah...',
        'opsi_a': '13',
        'opsi_b': '9',
        'opsi_c': '11',
        'opsi_d': '15',
        'opsi_e': '7',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Hasil dari √144 + √64 adalah...',
        'opsi_a': '20',
        'opsi_b': '16',
        'opsi_c': '24',
        'opsi_d': '18',
        'opsi_e': '22',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Sebuah lingkaran memiliki diameter 14 cm. Luas lingkaran tersebut adalah...',
        'opsi_a': '153,94 cm²',
        'opsi_b': '615,75 cm²',
        'opsi_c': '307,88 cm²',
        'opsi_d': '461,81 cm²',
        'opsi_e': '384,85 cm²',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Jika 3x + 5 = 20, maka nilai x adalah...',
        'opsi_a': '5',
        'opsi_b': '4',
        'opsi_c': '3',
        'opsi_d': '6',
        'opsi_e': '7',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Banyak susunan huruf dari kata "MATEMATIKA" adalah...',
        'opsi_a': '907200',
        'opsi_b': '3628800',
        'opsi_c': '1814400',
        'opsi_d': '453600',
        'opsi_e': '226800',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Hasil dari 3! × 4! adalah...',
        'opsi_a': '144',
        'opsi_b': '72',
        'opsi_c': '288',
        'opsi_d': '576',
        'opsi_e': '96',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Jika sin θ = 3/5 dan θ di kuadran I, maka cos θ adalah...',
        'opsi_a': '4/5',
        'opsi_b': '3/5',
        'opsi_c': '5/4',
        'opsi_d': '5/3',
        'opsi_e': '1/5',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Sebuah tabung memiliki jari-jari 7 cm dan tinggi 10 cm. Volume tabung tersebut adalah...',
        'opsi_a': '1539,38 cm³',
        'opsi_b': '3078,76 cm³',
        'opsi_c': '769,69 cm³',
        'opsi_d': '2309,07 cm³',
        'opsi_e': '3848,45 cm³',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Jika log 2 = 0,301 dan log 3 = 0,477, maka log 12 adalah...',
        'opsi_a': '1,079',
        'opsi_b': '0,778',
        'opsi_c': '0,903',
        'opsi_d': '1,255',
        'opsi_e': '0,602',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Deret aritmatika: 2, 5, 8, 11, ... Suku ke-10 adalah...',
        'opsi_a': '29',
        'opsi_b': '32',
        'opsi_c': '26',
        'opsi_d': '35',
        'opsi_e': '23',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Jika x² - 5x + 6 = 0, maka nilai x adalah...',
        'opsi_a': '2 dan 3',
        'opsi_b': '1 dan 6',
        'opsi_c': '-2 dan -3',
        'opsi_d': '0 dan 5',
        'opsi_e': '-1 dan -6',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Sebuah bola memiliki volume 288π cm³. Jari-jari bola tersebut adalah...',
        'opsi_a': '6 cm',
        'opsi_b': '12 cm',
        'opsi_c': '8 cm',
        'opsi_d': '4 cm',
        'opsi_e': '10 cm',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Hasil dari 7C3 adalah...',
        'opsi_a': '35',
        'opsi_b': '21',
        'opsi_c': '42',
        'opsi_d': '28',
        'opsi_e': '14',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Jika tan 45° = 1, maka sin 45° adalah...',
        'opsi_a': '√2/2',
        'opsi_b': '1/2',
        'opsi_c': '√3/2',
        'opsi_d': '1',
        'opsi_e': '0',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Hasil dari 2³ + 3² adalah...',
        'opsi_a': '17',
        'opsi_b': '15',
        'opsi_c': '13',
        'opsi_d': '19',
        'opsi_e': '21',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Sebuah limas segi empat memiliki alas persegi dengan sisi 6 cm dan tinggi 8 cm. Volume limas tersebut adalah...',
        'opsi_a': '96 cm³',
        'opsi_b': '192 cm³',
        'opsi_c': '48 cm³',
        'opsi_d': '144 cm³',
        'opsi_e': '288 cm³',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Jika a = 2 dan b = 3, maka nilai a² + b² adalah...',
        'opsi_a': '13',
        'opsi_b': '10',
        'opsi_c': '12',
        'opsi_d': '11',
        'opsi_e': '14',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Banyak cara memilih 3 orang dari 7 orang adalah...',
        'opsi_a': '35',
        'opsi_b': '21',
        'opsi_c': '42',
        'opsi_d': '28',
        'opsi_e': '14',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Hasil dari √81 + √16 adalah...',
        'opsi_a': '13',
        'opsi_b': '9',
        'opsi_c': '11',
        'opsi_d': '15',
        'opsi_e': '17',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Deret geometri: 2, 6, 18, 54, ... Suku ke-5 adalah...',
        'opsi_a': '162',
        'opsi_b': '108',
        'opsi_c': '216',
        'opsi_d': '324',
        'opsi_e': '486',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Jika 3x - 7 = 14, maka nilai x adalah...',
        'opsi_a': '7',
        'opsi_b': '5',
        'opsi_c': '6',
        'opsi_d': '8',
        'opsi_e': '9',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Sebuah prisma segitiga memiliki alas segitiga dengan alas 8 cm dan tinggi 6 cm, serta tinggi prisma 10 cm. Volume prisma tersebut adalah...',
        'opsi_a': '240 cm³',
        'opsi_b': '480 cm³',
        'opsi_c': '120 cm³',
        'opsi_d': '360 cm³',
        'opsi_e': '180 cm³',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Hasil dari 5! adalah...',
        'opsi_a': '120',
        'opsi_b': '60',
        'opsi_c': '720',
        'opsi_d': '24',
        'opsi_e': '360',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Jika log 10 = 1, maka log 100 adalah...',
        'opsi_a': '2',
        'opsi_b': '1',
        'opsi_c': '3',
        'opsi_d': '0',
        'opsi_e': '10',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Sebuah kerucut memiliki jari-jari alas 5 cm dan tinggi 12 cm. Volume kerucut tersebut adalah...',
        'opsi_a': '314,16 cm³',
        'opsi_b': '157,08 cm³',
        'opsi_c': '628,32 cm³',
        'opsi_d': '78,54 cm³',
        'opsi_e': '235,62 cm³',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Jika x + y = 10 dan x - y = 4, maka nilai x adalah...',
        'opsi_a': '7',
        'opsi_b': '5',
        'opsi_c': '6',
        'opsi_d': '8',
        'opsi_e': '3',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Banyak susunan 4 huruf dari kata "LOGIKA" adalah...',
        'opsi_a': '120',
        'opsi_b': '24',
        'opsi_c': '720',
        'opsi_d': '360',
        'opsi_e': '60',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Hasil dari 6P2 adalah...',
        'opsi_a': '30',
        'opsi_b': '12',
        'opsi_c': '15',
        'opsi_d': '36',
        'opsi_e': '6',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Jika f(x) = x² - 2x + 1, maka f(3) adalah...',
        'opsi_a': '4',
        'opsi_b': '5',
        'opsi_c': '6',
        'opsi_d': '7',
        'opsi_e': '8',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Sebuah tabung memiliki jari-jari 7 cm dan tinggi 10 cm. Volume tabung tersebut adalah...',
        'opsi_a': '1538,6 cm³',
        'opsi_b': '1540 cm³',
        'opsi_c': '1530 cm³',
        'opsi_d': '1535 cm³',
        'opsi_e': '1545 cm³',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Banyak diagonal pada segi delapan adalah...',
        'opsi_a': '20',
        'opsi_b': '16',
        'opsi_c': '18',
        'opsi_d': '24',
        'opsi_e': '22',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Hasil dari ∛64 + ∛27 adalah...',
        'opsi_a': '7',
        'opsi_b': '5',
        'opsi_c': '6',
        'opsi_d': '8',
        'opsi_e': '9',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Jika 2x + 3y = 10 dan x - y = 2, maka nilai x adalah...',
        'opsi_a': '4',
        'opsi_b': '3',
        'opsi_c': '5',
        'opsi_d': '6',
        'opsi_e': '2',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Sebuah bola memiliki jari-jari 6 cm. Volume bola tersebut adalah...',
        'opsi_a': '904,32 cm³',
        'opsi_b': '904 cm³',
        'opsi_c': '905 cm³',
        'opsi_d': '903 cm³',
        'opsi_e': '906 cm³',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Deret aritmatika: 5, 8, 11, 14, ..., 23. Suku yang hilang adalah...',
        'opsi_a': '17',
        'opsi_b': '18',
        'opsi_c': '19',
        'opsi_d': '20',
        'opsi_e': '16',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Jika sin 30° = 1/2, maka cos 60° adalah...',
        'opsi_a': '1/2',
        'opsi_b': '√3/2',
        'opsi_c': '1',
        'opsi_d': '0',
        'opsi_e': '√2/2',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Banyak cara menyusun 4 buku dari 6 buku adalah...',
        'opsi_a': '360',
        'opsi_b': '720',
        'opsi_c': '120',
        'opsi_d': '24',
        'opsi_e': '180',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Hasil dari (a + b)² jika a = 3 dan b = 4 adalah...',
        'opsi_a': '49',
        'opsi_b': '25',
        'opsi_c': '36',
        'opsi_d': '64',
        'opsi_e': '81',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Sebuah segitiga siku-siku memiliki sisi miring 13 cm dan salah satu sisi 5 cm. Sisi lainnya adalah...',
        'opsi_a': '12 cm',
        'opsi_b': '10 cm',
        'opsi_c': '11 cm',
        'opsi_d': '14 cm',
        'opsi_e': '8 cm',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Jika 4C3 = 4, maka 5C2 adalah...',
        'opsi_a': '10',
        'opsi_b': '5',
        'opsi_c': '20',
        'opsi_d': '15',
        'opsi_e': '25',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Hasil dari log₂ 16 adalah...',
        'opsi_a': '4',
        'opsi_b': '2',
        'opsi_c': '8',
        'opsi_d': '16',
        'opsi_e': '32',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Sebuah trapesium memiliki tinggi 8 cm dan dua sisi sejajar 10 cm dan 14 cm. Luas trapesium tersebut adalah...',
        'opsi_a': '96 cm²',
        'opsi_b': '112 cm²',
        'opsi_c': '104 cm²',
        'opsi_d': '108 cm²',
        'opsi_e': '100 cm²',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Jika 3x + 5 = 20, maka nilai x adalah...',
        'opsi_a': '5',
        'opsi_b': '4',
        'opsi_c': '6',
        'opsi_d': '7',
        'opsi_e': '3',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Banyak cara memilih ketua dan wakil ketua dari 7 orang adalah...',
        'opsi_a': '42',
        'opsi_b': '21',
        'opsi_c': '49',
        'opsi_d': '35',
        'opsi_e': '28',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Hasil dari √144 + √25 adalah...',
        'opsi_a': '17',
        'opsi_b': '13',
        'opsi_c': '15',
        'opsi_d': '19',
        'opsi_e': '21',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Deret geometri: 3, 9, 27, 81, ..., 729. Suku yang hilang adalah...',
        'opsi_a': '243',
        'opsi_b': '162',
        'opsi_c': '486',
        'opsi_d': '324',
        'opsi_e': '364',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Jika 2x - y = 5 dan x + y = 10, maka nilai y adalah...',
        'opsi_a': '5',
        'opsi_b': '4',
        'opsi_c': '6',
        'opsi_d': '7',
        'opsi_e': '3',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Sebuah lingkaran memiliki jari-jari 7 cm. Keliling lingkaran tersebut adalah...',
        'opsi_a': '43,96 cm',
        'opsi_b': '44 cm',
        'opsi_c': '42 cm',
        'opsi_d': '45 cm',
        'opsi_e': '46 cm',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Hasil dari 7C3 adalah...',
        'opsi_a': '35',
        'opsi_b': '21',
        'opsi_c': '28',
        'opsi_d': '42',
        'opsi_e': '14',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Jika tan 30° = 1/√3, maka sin 30° adalah...',
        'opsi_a': '1/2',
        'opsi_b': '√3/2',
        'opsi_c': '1',
        'opsi_d': '0',
        'opsi_e': '1/√3',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Sebuah kubus memiliki rusuk 5 cm. Volume kubus tersebut adalah...',
        'opsi_a': '125 cm³',
        'opsi_b': '100 cm³',
        'opsi_c': '150 cm³',
        'opsi_d': '175 cm³',
        'opsi_e': '200 cm³',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Banyak cara menyusun huruf dari kata "BOLA" adalah...',
        'opsi_a': '24',
        'opsi_b': '12',
        'opsi_c': '48',
        'opsi_d': '6',
        'opsi_e': '8',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Hasil dari log₁₀ 1000 adalah...',
        'opsi_a': '3',
        'opsi_b': '2',
        'opsi_c': '4',
        'opsi_d': '5',
        'opsi_e': '1',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Jika x² = 36, maka nilai x adalah...',
        'opsi_a': '6 atau -6',
        'opsi_b': '6 saja',
        'opsi_c': '-6 saja',
        'opsi_d': '18',
        'opsi_e': '12',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Sebuah jajar genjang memiliki alas 12 cm dan tinggi 8 cm. Luas jajar genjang tersebut adalah...',
        'opsi_a': '96 cm²',
        'opsi_b': '104 cm²',
        'opsi_c': '88 cm²',
        'opsi_d': '100 cm²',
        'opsi_e': '92 cm²',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Hasil dari 4! + 3! adalah...',
        'opsi_a': '30',
        'opsi_b': '24',
        'opsi_c': '36',
        'opsi_d': '18',
        'opsi_e': '42',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Jika 5x - 3 = 22, maka nilai x adalah...',
        'opsi_a': '5',
        'opsi_b': '4',
        'opsi_c': '6',
        'opsi_d': '7',
        'opsi_e': '3',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Banyak cara memilih 4 orang dari 8 orang adalah...',
        'opsi_a': '70',
        'opsi_b': '56',
        'opsi_c': '28',
        'opsi_d': '84',
        'opsi_e': '42',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Hasil dari ∛216 adalah...',
        'opsi_a': '6',
        'opsi_b': '4',
        'opsi_c': '8',
        'opsi_d': '12',
        'opsi_e': '16',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Deret aritmatika: 2, 5, 8, 11, ..., 17. Suku yang hilang adalah...',
        'opsi_a': '14',
        'opsi_b': '13',
        'opsi_c': '15',
        'opsi_d': '16',
        'opsi_e': '12',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Jika x + y = 15 dan x - y = 5, maka nilai x adalah...',
        'opsi_a': '10',
        'opsi_b': '8',
        'opsi_c': '12',
        'opsi_d': '7',
        'opsi_e': '9',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Sebuah lingkaran memiliki diameter 14 cm. Luas lingkaran tersebut adalah...',
        'opsi_a': '153,86 cm²',
        'opsi_b': '154 cm²',
        'opsi_c': '152 cm²',
        'opsi_d': '155 cm²',
        'opsi_e': '156 cm²',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Hasil dari 8P3 adalah...',
        'opsi_a': '336',
        'opsi_b': '336',
        'opsi_c': '56',
        'opsi_d': '512',
        'opsi_e': '24',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Jika cos 45° = √2/2, maka sin 45° adalah...',
        'opsi_a': '√2/2',
        'opsi_b': '1/2',
        'opsi_c': '√3/2',
        'opsi_d': '1',
        'opsi_e': '0',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Sebuah limas segitiga memiliki alas segitiga dengan alas 10 cm dan tinggi 8 cm, serta tinggi limas 12 cm. Volume limas tersebut adalah...',
        'opsi_a': '320 cm³',
        'opsi_b': '480 cm³',
        'opsi_c': '240 cm³',
        'opsi_d': '400 cm³',
        'opsi_e': '360 cm³',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Banyak cara menyusun huruf dari kata "MATEMATIKA" adalah...',
        'opsi_a': '907200',
        'opsi_b': '3628800',
        'opsi_c': '1814400',
        'opsi_d': '453600',
        'opsi_e': '1209600',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Hasil dari log₂ 8 adalah...',
        'opsi_a': '3',
        'opsi_b': '2',
        'opsi_c': '4',
        'opsi_d': '8',
        'opsi_e': '16',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Jika 2x² = 32, maka nilai x adalah...',
        'opsi_a': '4 atau -4',
        'opsi_b': '4 saja',
        'opsi_c': '-4 saja',
        'opsi_d': '8',
        'opsi_e': '16',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Sebuah belah ketupat memiliki diagonal 10 cm dan 16 cm. Luas belah ketupat tersebut adalah...',
        'opsi_a': '80 cm²',
        'opsi_b': '160 cm²',
        'opsi_c': '60 cm²',
        'opsi_d': '100 cm²',
        'opsi_e': '120 cm²',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Hasil dari 6C4 adalah...',
        'opsi_a': '15',
        'opsi_b': '30',
        'opsi_c': '20',
        'opsi_d': '10',
        'opsi_e': '25',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Jika 7x + 5 = 33, maka nilai x adalah...',
        'opsi_a': '4',
        'opsi_b': '5',
        'opsi_c': '6',
        'opsi_d': '3',
        'opsi_e': '7',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Banyak cara memilih 5 orang dari 10 orang adalah...',
        'opsi_a': '252',
        'opsi_b': '126',
        'opsi_c': '504',
        'opsi_d': '120',
        'opsi_e': '210',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Hasil dari ∛343 adalah...',
        'opsi_a': '7',
        'opsi_b': '5',
        'opsi_c': '9',
        'opsi_d': '11',
        'opsi_e': '13',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Deret aritmatika: 3, 7, 11, 15, ..., 23. Suku yang hilang adalah...',
        'opsi_a': '19',
        'opsi_b': '17',
        'opsi_c': '21',
        'opsi_d': '18',
        'opsi_e': '20',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Jika 2x + 3y = 16 dan x - y = 2, maka nilai y adalah...',
        'opsi_a': '2',
        'opsi_b': '3',
        'opsi_c': '4',
        'opsi_d': '5',
        'opsi_e': '1',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Sebuah lingkaran memiliki jari-jari 5 cm. Luas lingkaran tersebut adalah...',
        'opsi_a': '78,5 cm²',
        'opsi_b': '78 cm²',
        'opsi_c': '79 cm²',
        'opsi_d': '77 cm²',
        'opsi_e': '80 cm²',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Hasil dari 7P4 adalah...',
        'opsi_a': '840',
        'opsi_b': '210',
        'opsi_c': '504',
        'opsi_d': '35',
        'opsi_e': '28',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Jika sin 60° = √3/2, maka cos 30° adalah...',
        'opsi_a': '√3/2',
        'opsi_b': '1/2',
        'opsi_c': '√2/2',
        'opsi_d': '1',
        'opsi_e': '0',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Sebuah tabung memiliki jari-jari 4 cm dan tinggi 10 cm. Volume tabung tersebut adalah...',
        'opsi_a': '502,4 cm³',
        'opsi_b': '502 cm³',
        'opsi_c': '503 cm³',
        'opsi_d': '501 cm³',
        'opsi_e': '500 cm³',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Banyak cara menyusun huruf dari kata "INDONESIA" adalah...',
        'opsi_a': '3628800',
        'opsi_b': '1814400',
        'opsi_c': '907200',
        'opsi_d': '453600',
        'opsi_e': '1209600',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Hasil dari log₃ 27 adalah...',
        'opsi_a': '3',
        'opsi_b': '2',
        'opsi_c': '4',
        'opsi_d': '9',
        'opsi_e': '27',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Jika 3x² = 75, maka nilai x adalah...',
        'opsi_a': '5 atau -5',
        'opsi_b': '5 saja',
        'opsi_c': '-5 saja',
        'opsi_d': '25',
        'opsi_e': '15',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Sebuah layang-layang memiliki diagonal 12 cm dan 16 cm. Luas layang-layang tersebut adalah...',
        'opsi_a': '96 cm²',
        'opsi_b': '192 cm²',
        'opsi_c': '72 cm²',
        'opsi_d': '120 cm²',
        'opsi_e': '144 cm²',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Hasil dari 10C3 adalah...',
        'opsi_a': '120',
        'opsi_b': '720',
        'opsi_c': '60',
        'opsi_d': '30',
        'opsi_e': '90',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Jika 8x - 7 = 49, maka nilai x adalah...',
        'opsi_a': '7',
        'opsi_b': '6',
        'opsi_c': '8',
        'opsi_d': '5',
        'opsi_e': '9',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Banyak cara memilih 6 orang dari 12 orang adalah...',
        'opsi_a': '924',
        'opsi_b': '462',
        'opsi_c': '1848',
        'opsi_d': '720',
        'opsi_e': '792',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Hasil dari ∛512 adalah...',
        'opsi_a': '8',
        'opsi_b': '6',
        'opsi_c': '10',
        'opsi_d': '12',
        'opsi_e': '14',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Deret aritmatika: 4, 9, 14, 19, ..., 29. Suku yang hilang adalah...',
        'opsi_a': '24',
        'opsi_b': '22',
        'opsi_c': '26',
        'opsi_d': '23',
        'opsi_e': '25',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Jika 3x + 2y = 20 dan x + y = 8, maka nilai x adalah...',
        'opsi_a': '4',
        'opsi_b': '5',
        'opsi_c': '6',
        'opsi_d': '3',
        'opsi_e': '7',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Sebuah lingkaran memiliki diameter 10 cm. Luas lingkaran tersebut adalah...',
        'opsi_a': '78,5 cm²',
        'opsi_b': '78 cm²',
        'opsi_c': '79 cm²',
        'opsi_d': '77 cm²',
        'opsi_e': '80 cm²',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Hasil dari 9P5 adalah...',
        'opsi_a': '15120',
        'opsi_b': '3024',
        'opsi_c': '756',
        'opsi_d': '362880',
        'opsi_e': '45',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Jika tan 45° = 1, maka sin 45° adalah...',
        'opsi_a': '√2/2',
        'opsi_b': '1/2',
        'opsi_c': '√3/2',
        'opsi_d': '1',
        'opsi_e': '0',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Sebuah kerucut memiliki jari-jari 6 cm dan tinggi 8 cm. Volume kerucut tersebut adalah...',
        'opsi_a': '301,44 cm³',
        'opsi_b': '301 cm³',
        'opsi_c': '302 cm³',
        'opsi_d': '300 cm³',
        'opsi_e': '303 cm³',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Banyak cara menyusun huruf dari kata "JAKARTA" adalah...',
        'opsi_a': '2520',
        'opsi_b': '5040',
        'opsi_c': '1260',
        'opsi_d': '720',
        'opsi_e': '1680',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Hasil dari log₅ 125 adalah...',
        'opsi_a': '3',
        'opsi_b': '2',
        'opsi_c': '4',
        'opsi_d': '5',
        'opsi_e': '25',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Jika 4x² = 64, maka nilai x adalah...',
        'opsi_a': '4 atau -4',
        'opsi_b': '4 saja',
        'opsi_c': '-4 saja',
        'opsi_d': '16',
        'opsi_e': '8',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Sebuah segi enam beraturan memiliki sisi 6 cm. Luas segi enam tersebut adalah...',
        'opsi_a': '93,48 cm²',
        'opsi_b': '93 cm²',
        'opsi_c': '94 cm²',
        'opsi_d': '92 cm²',
        'opsi_e': '95 cm²',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Hasil dari 12C4 adalah...',
        'opsi_a': '495',
        'opsi_b': '11880',
        'opsi_c': '24',
        'opsi_d': '48',
        'opsi_e': '792',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Jika 9x + 6 = 60, maka nilai x adalah...',
        'opsi_a': '6',
        'opsi_b': '5',
        'opsi_c': '7',
        'opsi_d': '4',
        'opsi_e': '8',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Banyak cara memilih 7 orang dari 14 orang adalah...',
        'opsi_a': '3432',
        'opsi_b': '1716',
        'opsi_c': '6864',
        'opsi_d': '5040',
        'opsi_e': '3003',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Hasil dari ∛729 adalah...',
        'opsi_a': '9',
        'opsi_b': '7',
        'opsi_c': '11',
        'opsi_d': '13',
        'opsi_e': '15',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Deret aritmatika: 5, 11, 17, 23, ..., 35. Suku yang hilang adalah...',
        'opsi_a': '29',
        'opsi_b': '27',
        'opsi_c': '31',
        'opsi_d': '28',
        'opsi_e': '30',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Jika 4x + 5y = 35 dan x + y = 9, maka nilai x adalah...',
        'opsi_a': '5',
        'opsi_b': '4',
        'opsi_c': '6',
        'opsi_d': '3',
        'opsi_e': '7',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Sebuah lingkaran memiliki jari-jari 8 cm. Keliling lingkaran tersebut adalah...',
        'opsi_a': '50,24 cm',
        'opsi_b': '50 cm',
        'opsi_c': '51 cm',
        'opsi_d': '49 cm',
        'opsi_e': '52 cm',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Hasil dari 10P6 adalah...',
        'opsi_a': '151200',
        'opsi_b': '210',
        'opsi_c': '5040',
        'opsi_d': '720',
        'opsi_e': '3628800',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Jika cos 30° = √3/2, maka sin 60° adalah...',
        'opsi_a': '√3/2',
        'opsi_b': '1/2',
        'opsi_c': '√2/2',
        'opsi_d': '1',
        'opsi_e': '0',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Sebuah prisma segitiga memiliki alas segitiga dengan alas 12 cm dan tinggi 8 cm, serta tinggi prisma 15 cm. Volume prisma tersebut adalah...',
        'opsi_a': '720 cm³',
        'opsi_b': '1440 cm³',
        'opsi_c': '360 cm³',
        'opsi_d': '480 cm³',
        'opsi_e': '600 cm³',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Banyak cara menyusun huruf dari kata "SURABAYA" adalah...',
        'opsi_a': '40320',
        'opsi_b': '20160',
        'opsi_c': '80640',
        'opsi_d': '5040',
        'opsi_e': '10080',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Hasil dari log₁₀ 10000 adalah...',
        'opsi_a': '4',
        'opsi_b': '3',
        'opsi_c': '5',
        'opsi_d': '10',
        'opsi_e': '100',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Jika 5x² = 125, maka nilai x adalah...',
        'opsi_a': '5 atau -5',
        'opsi_b': '5 saja',
        'opsi_c': '-5 saja',
        'opsi_d': '25',
        'opsi_e': '15',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Sebuah segi delapan beraturan memiliki sisi 5 cm. Luas segi delapan tersebut adalah...',
        'opsi_a': '120,71 cm²',
        'opsi_b': '120 cm²',
        'opsi_c': '121 cm²',
        'opsi_d': '119 cm²',
        'opsi_e': '122 cm²',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Hasil dari 15C5 adalah...',
        'opsi_a': '3003',
        'opsi_b': '360360',
        'opsi_c': '120',
        'opsi_d': '75',
        'opsi_e': '2520',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Jika 10x - 9 = 51, maka nilai x adalah...',
        'opsi_a': '6',
        'opsi_b': '5',
        'opsi_c': '7',
        'opsi_d': '4',
        'opsi_e': '8',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Banyak cara memilih 8 orang dari 16 orang adalah...',
        'opsi_a': '12870',
        'opsi_b': '6435',
        'opsi_c': '25740',
        'opsi_d': '40320',
        'opsi_e': '11440',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Hasil dari ∛1000 adalah...',
        'opsi_a': '10',
        'opsi_b': '8',
        'opsi_c': '12',
        'opsi_d': '14',
        'opsi_e': '16',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Deret aritmatika: 6, 13, 20, 27, ..., 41. Suku yang hilang adalah...',
        'opsi_a': '34',
        'opsi_b': '32',
        'opsi_c': '36',
        'opsi_d': '33',
        'opsi_e': '35',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Jika 5x + 4y = 44 dan x + y = 10, maka nilai x adalah...',
        'opsi_a': '4',
        'opsi_b': '5',
        'opsi_c': '6',
        'opsi_d': '3',
        'opsi_e': '7',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Sebuah lingkaran memiliki diameter 12 cm. Luas lingkaran tersebut adalah...',
        'opsi_a': '113,04 cm²',
        'opsi_b': '113 cm²',
        'opsi_c': '114 cm²',
        'opsi_d': '112 cm²',
        'opsi_e': '115 cm²',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Hasil dari 11P7 adalah...',
        'opsi_a': '1663200',
        'opsi_b': '330',
        'opsi_c': '7920',
        'opsi_d': '55440',
        'opsi_e': '39916800',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Jika sin 30° = 1/2, maka cos 60° adalah...',
        'opsi_a': '1/2',
        'opsi_b': '√2/2',
        'opsi_c': '√3/2',
        'opsi_d': '1',
        'opsi_e': '0',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Sebuah limas segiempat memiliki alas persegi dengan sisi 10 cm dan tinggi limas 12 cm. Volume limas tersebut adalah...',
        'opsi_a': '400 cm³',
        'opsi_b': '800 cm³',
        'opsi_c': '200 cm³',
        'opsi_d': '600 cm³',
        'opsi_e': '300 cm³',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Banyak cara menyusun huruf dari kata "BANDUNG" adalah...',
        'opsi_a': '720',
        'opsi_b': '360',
        'opsi_c': '1440',
        'opsi_d': '120',
        'opsi_e': '5040',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Hasil dari log₂ 64 adalah...',
        'opsi_a': '6',
        'opsi_b': '5',
        'opsi_c': '7',
        'opsi_d': '8',
        'opsi_e': '32',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Jika 6x² = 216, maka nilai x adalah...',
        'opsi_a': '6 atau -6',
        'opsi_b': '6 saja',
        'opsi_c': '-6 saja',
        'opsi_d': '36',
        'opsi_e': '18',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Sebuah trapesium memiliki sisi sejajar 8 cm dan 12 cm, serta tinggi 6 cm. Luas trapesium tersebut adalah...',
        'opsi_a': '60 cm²',
        'opsi_b': '120 cm²',
        'opsi_c': '48 cm²',
        'opsi_d': '72 cm²',
        'opsi_e': '96 cm²',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Hasil dari 20C3 adalah...',
        'opsi_a': '1140',
        'opsi_b': '6840',
        'opsi_c': '60',
        'opsi_d': '114',
        'opsi_e': '190',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Jika 11x - 10 = 54, maka nilai x adalah...',
        'opsi_a': '5,82',
        'opsi_b': '5',
        'opsi_c': '6',
        'opsi_d': '4',
        'opsi_e': '7',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Banyak cara memilih 9 orang dari 18 orang adalah...',
        'opsi_a': '48620',
        'opsi_b': '24310',
        'opsi_c': '97240',
        'opsi_d': '362880',
        'opsi_e': '43758',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Hasil dari ∛1331 adalah...',
        'opsi_a': '11',
        'opsi_b': '9',
        'opsi_c': '13',
        'opsi_d': '15',
        'opsi_e': '17',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Deret aritmatika: 7, 15, 23, 31, ..., 47. Suku yang hilang adalah...',
        'opsi_a': '39',
        'opsi_b': '37',
        'opsi_c': '41',
        'opsi_d': '38',
        'opsi_e': '40',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Jika 6x + 5y = 55 dan x + y = 11, maka nilai x adalah...',
        'opsi_a': '5',
        'opsi_b': '6',
        'opsi_c': '7',
        'opsi_d': '4',
        'opsi_e': '8',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Sebuah lingkaran memiliki jari-jari 9 cm. Keliling lingkaran tersebut adalah...',
        'opsi_a': '56,52 cm',
        'opsi_b': '56 cm',
        'opsi_c': '57 cm',
        'opsi_d': '55 cm',
        'opsi_e': '58 cm',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Hasil dari 12P8 adalah...',
        'opsi_a': '19958400',
        'opsi_b': '495',
        'opsi_c': '11880',
        'opsi_d': '239500800',
        'opsi_e': '479001600',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Jika cos 45° = √2/2, maka sin 45° adalah...',
        'opsi_a': '√2/2',
        'opsi_b': '1/2',
        'opsi_c': '√3/2',
        'opsi_d': '1',
        'opsi_e': '0',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Sebuah bola memiliki jari-jari 7 cm. Volume bola tersebut adalah...',
        'opsi_a': '1436,03 cm³',
        'opsi_b': '1436 cm³',
        'opsi_c': '1437 cm³',
        'opsi_d': '1435 cm³',
        'opsi_e': '1438 cm³',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Banyak cara menyusun huruf dari kata "MEDAN" adalah...',
        'opsi_a': '120',
        'opsi_b': '60',
        'opsi_c': '240',
        'opsi_d': '24',
        'opsi_e': '720',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Hasil dari log₃ 81 adalah...',
        'opsi_a': '4',
        'opsi_b': '3',
        'opsi_c': '5',
        'opsi_d': '9',
        'opsi_e': '27',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Jika 7x² = 343, maka nilai x adalah...',
        'opsi_a': '7 atau -7',
        'opsi_b': '7 saja',
        'opsi_c': '-7 saja',
        'opsi_d': '49',
        'opsi_e': '21',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Sebuah jajargenjang memiliki alas 10 cm dan tinggi 6 cm. Luas jajargenjang tersebut adalah...',
        'opsi_a': '60 cm²',
        'opsi_b': '120 cm²',
        'opsi_c': '30 cm²',
        'opsi_d': '90 cm²',
        'opsi_e': '80 cm²',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Hasil dari 25C4 adalah...',
        'opsi_a': '12650',
        'opsi_b': '303600',
        'opsi_c': '100',
        'opsi_d': '625',
        'opsi_e': '1550',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Jika 12x - 11 = 61, maka nilai x adalah...',
        'opsi_a': '6',
        'opsi_b': '5',
        'opsi_c': '7',
        'opsi_d': '4',
        'opsi_e': '8',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Banyak cara memilih 10 orang dari 20 orang adalah...',
        'opsi_a': '184756',
        'opsi_b': '92378',
        'opsi_c': '369512',
        'opsi_d': '3628800',
        'opsi_e': '167960',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Hasil dari ∛1728 adalah...',
        'opsi_a': '12',
        'opsi_b': '10',
        'opsi_c': '14',
        'opsi_d': '16',
        'opsi_e': '18',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Deret aritmatika: 8, 17, 26, 35, ..., 53. Suku yang hilang adalah...',
        'opsi_a': '44',
        'opsi_b': '42',
        'opsi_c': '46',
        'opsi_d': '43',
        'opsi_e': '45',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Jika 7x + 6y = 66 dan x + y = 12, maka nilai x adalah...',
        'opsi_a': '6',
        'opsi_b': '7',
        'opsi_c': '8',
        'opsi_d': '5',
        'opsi_e': '9',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Sebuah lingkaran memiliki diameter 14 cm. Luas lingkaran tersebut adalah...',
        'opsi_a': '153,86 cm²',
        'opsi_b': '153 cm²',
        'opsi_c': '154 cm²',
        'opsi_d': '152 cm²',
        'opsi_e': '155 cm²',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Hasil dari 13P9 adalah...',
        'opsi_a': '518918400',
        'opsi_b': '715',
        'opsi_c': '25740',
        'opsi_d': '6227020800',
        'opsi_e': '62270208000',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Jika tan 45° = 1, maka cot 45° adalah...',
        'opsi_a': '1',
        'opsi_b': '0',
        'opsi_c': '√2',
        'opsi_d': '√3',
        'opsi_e': '2',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Sebuah tabung memiliki jari-jari 5 cm dan tinggi 10 cm. Volume tabung tersebut adalah...',
        'opsi_a': '785 cm³',
        'opsi_b': '1570 cm³',
        'opsi_c': '392,5 cm³',
        'opsi_d': '1177,5 cm³',
        'opsi_e': '235,5 cm³',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Banyak cara menyusun huruf dari kata "SURABAYA" adalah...',
        'opsi_a': '40320',
        'opsi_b': '20160',
        'opsi_c': '80640',
        'opsi_d': '5040',
        'opsi_e': '10080',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Hasil dari log₅ 125 adalah...',
        'opsi_a': '3',
        'opsi_b': '2',
        'opsi_c': '4',
        'opsi_d': '5',
        'opsi_e': '25',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Jika 8x² = 512, maka nilai x adalah...',
        'opsi_a': '8 atau -8',
        'opsi_b': '8 saja',
        'opsi_c': '-8 saja',
        'opsi_d': '64',
        'opsi_e': '32',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Sebuah belah ketupat memiliki diagonal 10 cm dan 24 cm. Luas belah ketupat tersebut adalah...',
        'opsi_a': '120 cm²',
        'opsi_b': '240 cm²',
        'opsi_c': '60 cm²',
        'opsi_d': '180 cm²',
        'opsi_e': '96 cm²',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Hasil dari 30C5 adalah...',
        'opsi_a': '142506',
        'opsi_b': '17100720',
        'opsi_c': '120',
        'opsi_d': '900',
        'opsi_e': '15504',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Jika 13x - 12 = 72, maka nilai x adalah...',
        'opsi_a': '6,46',
        'opsi_b': '6',
        'opsi_c': '7',
        'opsi_d': '5',
        'opsi_e': '8',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Banyak cara memilih 11 orang dari 22 orang adalah...',
        'opsi_a': '705432',
        'opsi_b': '352716',
        'opsi_c': '1410864',
        'opsi_d': '39916800',
        'opsi_e': '646646',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Hasil dari ∛2197 adalah...',
        'opsi_a': '13',
        'opsi_b': '11',
        'opsi_c': '15',
        'opsi_d': '17',
        'opsi_e': '19',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Deret aritmatika: 9, 19, 29, 39, ..., 59. Suku yang hilang adalah...',
        'opsi_a': '49',
        'opsi_b': '47',
        'opsi_c': '51',
        'opsi_d': '48',
        'opsi_e': '50',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Jika 8x + 7y = 77 dan x + y = 13, maka nilai x adalah...',
        'opsi_a': '7',
        'opsi_b': '8',
        'opsi_c': '9',
        'opsi_d': '6',
        'opsi_e': '10',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Sebuah lingkaran memiliki jari-jari 11 cm. Keliling lingkaran tersebut adalah...',
        'opsi_a': '69,08 cm',
        'opsi_b': '69 cm',
        'opsi_c': '70 cm',
        'opsi_d': '68 cm',
        'opsi_e': '71 cm',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Hasil dari 14P10 adalah...',
        'opsi_a': '43589145600',
        'opsi_b': '1001',
        'opsi_c': '24024',
        'opsi_d': '87178291200',
        'opsi_e': '871782912000',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Jika sec 60° = 2, maka cos 60° adalah...',
        'opsi_a': '1/2',
        'opsi_b': '1',
        'opsi_c': '√2/2',
        'opsi_d': '√3/2',
        'opsi_e': '0',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Sebuah kerucut memiliki jari-jari 6 cm dan tinggi 8 cm. Volume kerucut tersebut adalah...',
        'opsi_a': '301,44 cm³',
        'opsi_b': '602,88 cm³',
        'opsi_c': '150,72 cm³',
        'opsi_d': '452,16 cm³',
        'opsi_e': '90,43 cm³',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Banyak cara menyusun huruf dari kata "JAKARTA" adalah...',
        'opsi_a': '5040',
        'opsi_b': '2520',
        'opsi_c': '10080',
        'opsi_d': '720',
        'opsi_e': '1260',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Hasil dari log₄ 64 adalah...',
        'opsi_a': '3',
        'opsi_b': '2',
        'opsi_c': '4',
        'opsi_d': '16',
        'opsi_e': '8',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Jika 9x² = 729, maka nilai x adalah...',
        'opsi_a': '9 atau -9',
        'opsi_b': '9 saja',
        'opsi_c': '-9 saja',
        'opsi_d': '81',
        'opsi_e': '27',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Sebuah layang-layang memiliki diagonal 12 cm dan 16 cm. Luas layang-layang tersebut adalah...',
        'opsi_a': '96 cm²',
        'opsi_b': '192 cm²',
        'opsi_c': '48 cm²',
        'opsi_d': '144 cm²',
        'opsi_e': '84 cm²',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Hasil dari 35C6 adalah...',
        'opsi_a': '1623160',
        'opsi_b': '11628060',
        'opsi_c': '210',
        'opsi_d': '1225',
        'opsi_e': '2352984',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Jika 14x - 13 = 83, maka nilai x adalah...',
        'opsi_a': '6,86',
        'opsi_b': '6',
        'opsi_c': '7',
        'opsi_d': '5',
        'opsi_e': '8',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Banyak cara memilih 12 orang dari 24 orang adalah...',
        'opsi_a': '2704156',
        'opsi_b': '1352078',
        'opsi_c': '5408312',
        'opsi_d': '479001600',
        'opsi_e': '2704156',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Hasil dari ∛2744 adalah...',
        'opsi_a': '14',
        'opsi_b': '12',
        'opsi_c': '16',
        'opsi_d': '18',
        'opsi_e': '20',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Deret aritmatika: 10, 21, 32, 43, ..., 65. Suku yang hilang adalah...',
        'opsi_a': '54',
        'opsi_b': '52',
        'opsi_c': '56',
        'opsi_d': '53',
        'opsi_e': '55',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Jika 9x + 8y = 88 dan x + y = 14, maka nilai x adalah...',
        'opsi_a': '8',
        'opsi_b': '9',
        'opsi_c': '10',
        'opsi_d': '7',
        'opsi_e': '11',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Sebuah lingkaran memiliki diameter 16 cm. Luas lingkaran tersebut adalah...',
        'opsi_a': '200,96 cm²',
        'opsi_b': '200 cm²',
        'opsi_c': '201 cm²',
        'opsi_d': '199 cm²',
        'opsi_e': '202 cm²',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Hasil dari 15P11 adalah...',
        'opsi_a': '32760300000',
        'opsi_b': '1365',
        'opsi_c': '32760',
        'opsi_d': '655206000000',
        'opsi_e': '6552060000000',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Jika cosec 30° = 2, maka sin 30° adalah...',
        'opsi_a': '1/2',
        'opsi_b': '1',
        'opsi_c': '√2/2',
        'opsi_d': '√3/2',
        'opsi_e': '0',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Sebuah balok memiliki panjang 10 cm, lebar 6 cm, dan tinggi 8 cm. Volume balok tersebut adalah...',
        'opsi_a': '480 cm³',
        'opsi_b': '960 cm³',
        'opsi_c': '240 cm³',
        'opsi_d': '720 cm³',
        'opsi_e': '360 cm³',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Banyak cara menyusun huruf dari kata "MAKASSAR" adalah...',
        'opsi_a': '40320',
        'opsi_b': '20160',
        'opsi_c': '80640',
        'opsi_d': '5040',
        'opsi_e': '10080',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Hasil dari log₈ 512 adalah...',
        'opsi_a': '3',
        'opsi_b': '2',
        'opsi_c': '4',
        'opsi_d': '64',
        'opsi_e': '9',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Jika 10x² = 1000, maka nilai x adalah...',
        'opsi_a': '10 atau -10',
        'opsi_b': '10 saja',
        'opsi_c': '-10 saja',
        'opsi_d': '100',
        'opsi_e': '32',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Sebuah segilima beraturan memiliki sisi 8 cm. Keliling segilima tersebut adalah...',
        'opsi_a': '40 cm',
        'opsi_b': '80 cm',
        'opsi_c': '20 cm',
        'opsi_d': '60 cm',
        'opsi_e': '35 cm',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Hasil dari 40C7 adalah...',
        'opsi_a': '18643560',
        'opsi_b': '186435600',
        'opsi_c': '280',
        'opsi_d': '1600',
        'opsi_e': '1864356',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Jika 15x - 14 = 94, maka nilai x adalah...',
        'opsi_a': '7,2',
        'opsi_b': '7',
        'opsi_c': '8',
        'opsi_d': '6',
        'opsi_e': '9',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Banyak cara memilih 13 orang dari 26 orang adalah...',
        'opsi_a': '10400600',
        'opsi_b': '5200300',
        'opsi_c': '20801200',
        'opsi_d': '40329146112660567677528000000',
        'opsi_e': '10400600',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Hasil dari ∛3375 adalah...',
        'opsi_a': '15',
        'opsi_b': '13',
        'opsi_c': '17',
        'opsi_d': '19',
        'opsi_e': '21',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Deret aritmatika: 11, 23, 35, 47, ..., 71. Suku yang hilang adalah...',
        'opsi_a': '59',
        'opsi_b': '57',
        'opsi_c': '61',
        'opsi_d': '58',
        'opsi_e': '60',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Jika 10x + 9y = 99 dan x + y = 15, maka nilai x adalah...',
        'opsi_a': '9',
        'opsi_b': '10',
        'opsi_c': '11',
        'opsi_d': '8',
        'opsi_e': '12',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Sebuah lingkaran memiliki jari-jari 12 cm. Keliling lingkaran tersebut adalah...',
        'opsi_a': '75,36 cm',
        'opsi_b': '75 cm',
        'opsi_c': '76 cm',
        'opsi_d': '74 cm',
        'opsi_e': '77 cm',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Hasil dari 16P12 adalah...',
        'opsi_a': '217945728000',
        'opsi_b': '1820',
        'opsi_c': '43680',
        'opsi_d': '4358914560000',
        'opsi_e': '43589145600000',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Jika tan 60° = √3, maka cot 60° adalah...',
        'opsi_a': '1/√3',
        'opsi_b': '1',
        'opsi_c': '√3',
        'opsi_d': '0',
        'opsi_e': '2',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Sebuah limas segiempat memiliki alas 12 cm x 8 cm dan tinggi 10 cm. Volume limas tersebut adalah...',
        'opsi_a': '320 cm³',
        'opsi_b': '640 cm³',
        'opsi_c': '160 cm³',
        'opsi_d': '480 cm³',
        'opsi_e': '240 cm³',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Banyak cara menyusun huruf dari kata "SURABAYA" adalah...',
        'opsi_a': '40320',
        'opsi_b': '20160',
        'opsi_c': '80640',
        'opsi_d': '5040',
        'opsi_e': '10080',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Hasil dari log₁₀ 1000 adalah...',
        'opsi_a': '3',
        'opsi_b': '2',
        'opsi_c': '4',
        'opsi_d': '1000',
        'opsi_e': '10',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Jika 11x² = 1331, maka nilai x adalah...',
        'opsi_a': '11 atau -11',
        'opsi_b': '11 saja',
        'opsi_c': '-11 saja',
        'opsi_d': '121',
        'opsi_e': '33',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Sebuah segienam beraturan memiliki sisi 6 cm. Keliling segienam tersebut adalah...',
        'opsi_a': '36 cm',
        'opsi_b': '72 cm',
        'opsi_c': '18 cm',
        'opsi_d': '54 cm',
        'opsi_e': '30 cm',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Hasil dari 45C8 adalah...',
        'opsi_a': '215553195',
        'opsi_b': '2155531950',
        'opsi_c': '360',
        'opsi_d': '2025',
        'opsi_e': '21555319',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Jika 16x - 15 = 105, maka nilai x adalah...',
        'opsi_a': '7,5',
        'opsi_b': '7',
        'opsi_c': '8',
        'opsi_d': '6',
        'opsi_e': '9',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Banyak cara memilih 14 orang dari 28 orang adalah...',
        'opsi_a': '40116600',
        'opsi_b': '20058300',
        'opsi_c': '80233200',
        'opsi_d': '304888344611713860501504000000',
        'opsi_e': '40116600',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Hasil dari ∛4096 adalah...',
        'opsi_a': '16',
        'opsi_b': '14',
        'opsi_c': '18',
        'opsi_d': '20',
        'opsi_e': '22',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Deret aritmatika: 12, 25, 38, 51, ..., 77. Suku yang hilang adalah...',
        'opsi_a': '64',
        'opsi_b': '62',
        'opsi_c': '66',
        'opsi_d': '63',
        'opsi_e': '65',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Jika 11x + 10y = 110 dan x + y = 16, maka nilai x adalah...',
        'opsi_a': '10',
        'opsi_b': '11',
        'opsi_c': '12',
        'opsi_d': '9',
        'opsi_e': '13',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Sebuah lingkaran memiliki diameter 18 cm. Luas lingkaran tersebut adalah...',
        'opsi_a': '254,34 cm²',
        'opsi_b': '254 cm²',
        'opsi_c': '255 cm²',
        'opsi_d': '253 cm²',
        'opsi_e': '256 cm²',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Hasil dari 17P13 adalah...',
        'opsi_a': '1140480000',
        'opsi_b': '2380',
        'opsi_c': '57120',
        'opsi_d': '22809600000',
        'opsi_e': '228096000000',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Jika sec 45° = √2, maka cos 45° adalah...',
        'opsi_a': '1/√2',
        'opsi_b': '1',
        'opsi_c': '√2',
        'opsi_d': '0',
        'opsi_e': '2',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Sebuah tabung memiliki jari-jari 7 cm dan tinggi 14 cm. Volume tabung tersebut adalah...',
        'opsi_a': '2154,04 cm³',
        'opsi_b': '4308,08 cm³',
        'opsi_c': '1077,02 cm³',
        'opsi_d': '3231,06 cm³',
        'opsi_e': '538,51 cm³',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Banyak cara menyusun huruf dari kata "MEDAN" adalah...',
        'opsi_a': '120',
        'opsi_b': '60',
        'opsi_c': '240',
        'opsi_d': '24',
        'opsi_e': '30',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Hasil dari log₅ 125 adalah...',
        'opsi_a': '3',
        'opsi_b': '2',
        'opsi_c': '4',
        'opsi_d': '125',
        'opsi_e': '5',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Jika 12x² = 1728, maka nilai x adalah...',
        'opsi_a': '12 atau -12',
        'opsi_b': '12 saja',
        'opsi_c': '-12 saja',
        'opsi_d': '144',
        'opsi_e': '36',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Sebuah segidelapan beraturan memiliki sisi 5 cm. Keliling segidelapan tersebut adalah...',
        'opsi_a': '40 cm',
        'opsi_b': '80 cm',
        'opsi_c': '20 cm',
        'opsi_d': '60 cm',
        'opsi_e': '35 cm',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Hasil dari 50C9 adalah...',
        'opsi_a': '2505433700',
        'opsi_b': '25054337000',
        'opsi_c': '450',
        'opsi_d': '2500',
        'opsi_e': '250543370',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Jika 17x - 16 = 118, maka nilai x adalah...',
        'opsi_a': '7,88',
        'opsi_b': '7',
        'opsi_c': '8',
        'opsi_d': '6',
        'opsi_e': '9',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Banyak cara memilih 15 orang dari 30 orang adalah...',
        'opsi_a': '155117520',
        'opsi_b': '77558760',
        'opsi_c': '310235040',
        'opsi_d': '265252859812191058636308480000000',
        'opsi_e': '155117520',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Hasil dari ∛4913 adalah...',
        'opsi_a': '17',
        'opsi_b': '15',
        'opsi_c': '19',
        'opsi_d': '21',
        'opsi_e': '23',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Deret aritmatika: 13, 27, 41, 55, ..., 83. Suku yang hilang adalah...',
        'opsi_a': '69',
        'opsi_b': '67',
        'opsi_c': '71',
        'opsi_d': '68',
        'opsi_e': '70',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Jika 12x + 11y = 121 dan x + y = 17, maka nilai x adalah...',
        'opsi_a': '11',
        'opsi_b': '12',
        'opsi_c': '13',
        'opsi_d': '10',
        'opsi_e': '14',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Sebuah lingkaran memiliki jari-jari 14 cm. Keliling lingkaran tersebut adalah...',
        'opsi_a': '87,92 cm',
        'opsi_b': '87 cm',
        'opsi_c': '88 cm',
        'opsi_d': '86 cm',
        'opsi_e': '89 cm',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Hasil dari 18P14 adalah...',
        'opsi_a': '8978464000',
        'opsi_b': '3060',
        'opsi_c': '73440',
        'opsi_d': '179569280000',
        'opsi_e': '1795692800000',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Jika cot 45° = 1, maka tan 45° adalah...',
        'opsi_a': '1',
        'opsi_b': '0',
        'opsi_c': '√2',
        'opsi_d': '1/√2',
        'opsi_e': '2',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Sebuah prisma segitiga memiliki alas 8 cm, tinggi alas 6 cm, dan tinggi prisma 15 cm. Volume prisma tersebut adalah...',
        'opsi_a': '360 cm³',
        'opsi_b': '720 cm³',
        'opsi_c': '180 cm³',
        'opsi_d': '540 cm³',
        'opsi_e': '270 cm³',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Banyak cara menyusun huruf dari kata "PALEMBANG" adalah...',
        'opsi_a': '40320',
        'opsi_b': '20160',
        'opsi_c': '80640',
        'opsi_d': '5040',
        'opsi_e': '10080',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Hasil dari log₃ 243 adalah...',
        'opsi_a': '5',
        'opsi_b': '4',
        'opsi_c': '6',
        'opsi_d': '243',
        'opsi_e': '3',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Jika 13x² = 2197, maka nilai x adalah...',
        'opsi_a': '13 atau -13',
        'opsi_b': '13 saja',
        'opsi_c': '-13 saja',
        'opsi_d': '169',
        'opsi_e': '39',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Sebuah segisembilan beraturan memiliki sisi 4 cm. Keliling segisembilan tersebut adalah...',
        'opsi_a': '36 cm',
        'opsi_b': '72 cm',
        'opsi_c': '18 cm',
        'opsi_d': '54 cm',
        'opsi_e': '32 cm',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Hasil dari 55C10 adalah...',
        'opsi_a': '29248649430',
        'opsi_b': '292486494300',
        'opsi_c': '550',
        'opsi_d': '3025',
        'opsi_e': '2924864943',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Jika 18x - 17 = 127, maka nilai x adalah...',
        'opsi_a': '8',
        'opsi_b': '7',
        'opsi_c': '9',
        'opsi_d': '6',
        'opsi_e': '10',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Banyak cara memilih 16 orang dari 32 orang adalah...',
        'opsi_a': '601080390',
        'opsi_b': '300540195',
        'opsi_c': '1202160780',
        'opsi_d': '35368742803966208067552953600000000',
        'opsi_e': '601080390',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Hasil dari ∛5832 adalah...',
        'opsi_a': '18',
        'opsi_b': '16',
        'opsi_c': '20',
        'opsi_d': '22',
        'opsi_e': '24',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Deret aritmatika: 14, 29, 44, 59, ..., 89. Suku yang hilang adalah...',
        'opsi_a': '74',
        'opsi_b': '72',
        'opsi_c': '76',
        'opsi_d': '73',
        'opsi_e': '75',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Jika 13x + 12y = 130 dan x + y = 18, maka nilai x adalah...',
        'opsi_a': '12',
        'opsi_b': '13',
        'opsi_c': '14',
        'opsi_d': '11',
        'opsi_e': '15',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Sebuah lingkaran memiliki diameter 20 cm. Luas lingkaran tersebut adalah...',
        'opsi_a': '314 cm²',
        'opsi_b': '314,16 cm²',
        'opsi_c': '315 cm²',
        'opsi_d': '313 cm²',
        'opsi_e': '316 cm²',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Hasil dari 19P15 adalah...',
        'opsi_a': '116280600',
        'opsi_b': '3876',
        'opsi_c': '116280',
        'opsi_d': '2325612000',
        'opsi_e': '23256120000',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Jika sec 30° = 2/√3, maka cos 30° adalah...',
        'opsi_a': '√3/2',
        'opsi_b': '1',
        'opsi_c': '√2/2',
        'opsi_d': '1/2',
        'opsi_e': '0',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Sebuah bola memiliki jari-jari 9 cm. Volume bola tersebut adalah...',
        'opsi_a': '3052,08 cm³',
        'opsi_b': '6104,16 cm³',
        'opsi_c': '1526,04 cm³',
        'opsi_d': '4578,12 cm³',
        'opsi_e': '763,02 cm³',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Banyak cara menyusun huruf dari kata "JOGJAKARTA" adalah...',
        'opsi_a': '362880',
        'opsi_b': '181440',
        'opsi_c': '725760',
        'opsi_d': '45360',
        'opsi_e': '90720',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Hasil dari log₂ 64 adalah...',
        'opsi_a': '6',
        'opsi_b': '5',
        'opsi_c': '7',
        'opsi_d': '64',
        'opsi_e': '2',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Jika 14x² = 2744, maka nilai x adalah...',
        'opsi_a': '14 atau -14',
        'opsi_b': '14 saja',
        'opsi_c': '-14 saja',
        'opsi_d': '196',
        'opsi_e': '42',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Sebuah segisepuluh beraturan memiliki sisi 3 cm. Keliling segisepuluh tersebut adalah...',
        'opsi_a': '30 cm',
        'opsi_b': '60 cm',
        'opsi_c': '15 cm',
        'opsi_d': '45 cm',
        'opsi_e': '27 cm',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Hasil dari 60C11 adalah...',
        'opsi_a': '5053216700',
        'opsi_b': '50532167000',
        'opsi_c': '660',
        'opsi_d': '3600',
        'opsi_e': '505321670',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Jika 19x - 18 = 133, maka nilai x adalah...',
        'opsi_a': '8',
        'opsi_b': '7',
        'opsi_c': '9',
        'opsi_d': '6',
        'opsi_e': '10',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Banyak cara memilih 17 orang dari 34 orang adalah...',
        'opsi_a': '2333606220',
        'opsi_b': '1166803110',
        'opsi_c': '4667212440',
        'opsi_d': '295232799039604140847618609160000000',
        'opsi_e': '2333606220',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Hasil dari ∛6859 adalah...',
        'opsi_a': '19',
        'opsi_b': '17',
        'opsi_c': '21',
        'opsi_d': '23',
        'opsi_e': '25',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Deret aritmatika: 15, 31, 47, 63, ..., 95. Suku yang hilang adalah...',
        'opsi_a': '79',
        'opsi_b': '77',
        'opsi_c': '81',
        'opsi_d': '78',
        'opsi_e': '80',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Jika 14x + 13y = 140 dan x + y = 19, maka nilai x adalah...',
        'opsi_a': '13',
        'opsi_b': '14',
        'opsi_c': '15',
        'opsi_d': '12',
        'opsi_e': '16',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Sebuah lingkaran memiliki jari-jari 11 cm. Keliling lingkaran tersebut adalah...',
        'opsi_a': '69,08 cm',
        'opsi_b': '69 cm',
        'opsi_c': '70 cm',
        'opsi_d': '68 cm',
        'opsi_e': '71 cm',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Hasil dari 20P16 adalah...',
        'opsi_a': '116280600',
        'opsi_b': '4845',
        'opsi_c': '116280',
        'opsi_d': '2325612000',
        'opsi_e': '23256120000',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Jika cosec 60° = 2/√3, maka sin 60° adalah...',
        'opsi_a': '√3/2',
        'opsi_b': '1',
        'opsi_c': '√2/2',
        'opsi_d': '1/2',
        'opsi_e': '0',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Sebuah limas segiempat memiliki alas 12 cm x 10 cm dan tinggi 16 cm. Volume limas tersebut adalah...',
        'opsi_a': '640 cm³',
        'opsi_b': '1280 cm³',
        'opsi_c': '320 cm³',
        'opsi_d': '960 cm³',
        'opsi_e': '480 cm³',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Banyak cara menyusun huruf dari kata "SURABAYA" adalah...',
        'opsi_a': '40320',
        'opsi_b': '20160',
        'opsi_c': '80640',
        'opsi_d': '5040',
        'opsi_e': '10080',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Hasil dari log₄ 256 adalah...',
        'opsi_a': '4',
        'opsi_b': '3',
        'opsi_c': '5',
        'opsi_d': '256',
        'opsi_e': '2',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Jika 15x² = 3375, maka nilai x adalah...',
        'opsi_a': '15 atau -15',
        'opsi_b': '15 saja',
        'opsi_c': '-15 saja',
        'opsi_d': '225',
        'opsi_e': '45',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Sebuah segiduabelas beraturan memiliki sisi 2 cm. Keliling segiduabelas tersebut adalah...',
        'opsi_a': '24 cm',
        'opsi_b': '48 cm',
        'opsi_c': '12 cm',
        'opsi_d': '36 cm',
        'opsi_e': '22 cm',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Hasil dari 65C12 adalah...',
        'opsi_a': '15951899986280',
        'opsi_b': '159518999862800',
        'opsi_c': '780',
        'opsi_d': '4225',
        'opsi_e': '1595189998628',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Jika 20x - 19 = 141, maka nilai x adalah...',
        'opsi_a': '8',
        'opsi_b': '7',
        'opsi_c': '9',
        'opsi_d': '6',
        'opsi_e': '10',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Banyak cara memilih 18 orang dari 36 orang adalah...',
        'opsi_a': '9075135300',
        'opsi_b': '4537567650',
        'opsi_c': '18150270600',
        'opsi_d': '1332466108437758984626647420800000000',
        'opsi_e': '9075135300',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Hasil dari ∛8000 adalah...',
        'opsi_a': '20',
        'opsi_b': '18',
        'opsi_c': '22',
        'opsi_d': '24',
        'opsi_e': '26',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Deret aritmatika: 16, 33, 50, 67, ..., 101. Suku yang hilang adalah...',
        'opsi_a': '84',
        'opsi_b': '82',
        'opsi_c': '86',
        'opsi_d': '83',
        'opsi_e': '85',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Jika 15x + 14y = 150 dan x + y = 20, maka nilai x adalah...',
        'opsi_a': '14',
        'opsi_b': '15',
        'opsi_c': '16',
        'opsi_d': '13',
        'opsi_e': '17',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Sebuah lingkaran memiliki diameter 22 cm. Luas lingkaran tersebut adalah...',
        'opsi_a': '379,94 cm²',
        'opsi_b': '379 cm²',
        'opsi_c': '380 cm²',
        'opsi_d': '378 cm²',
        'opsi_e': '381 cm²',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Hasil dari 21P17 adalah...',
        'opsi_a': '79833600',
        'opsi_b': '5985',
        'opsi_c': '798336',
        'opsi_d': '1596672000',
        'opsi_e': '15966720000',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Jika tan 45° = 1, maka cot 45° adalah...',
        'opsi_a': '1',
        'opsi_b': '0',
        'opsi_c': '√2',
        'opsi_d': '1/√2',
        'opsi_e': '2',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Sebuah kerucut memiliki jari-jari alas 8 cm dan tinggi 12 cm. Volume kerucut tersebut adalah...',
        'opsi_a': '803,84 cm³',
        'opsi_b': '1607,68 cm³',
        'opsi_c': '401,92 cm³',
        'opsi_d': '1205,76 cm³',
        'opsi_e': '200,96 cm³',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Banyak cara menyusun huruf dari kata "MAKASSAR" adalah...',
        'opsi_a': '40320',
        'opsi_b': '20160',
        'opsi_c': '80640',
        'opsi_d': '5040',
        'opsi_e': '10080',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Hasil dari log₅ 625 adalah...',
        'opsi_a': '4',
        'opsi_b': '3',
        'opsi_c': '5',
        'opsi_d': '625',
        'opsi_e': '2',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Jika 16x² = 4096, maka nilai x adalah...',
        'opsi_a': '16 atau -16',
        'opsi_b': '16 saja',
        'opsi_c': '-16 saja',
        'opsi_d': '256',
        'opsi_e': '48',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Sebuah segitiga sama sisi memiliki sisi 6 cm. Keliling segitiga tersebut adalah...',
        'opsi_a': '18 cm',
        'opsi_b': '36 cm',
        'opsi_c': '9 cm',
        'opsi_d': '27 cm',
        'opsi_e': '12 cm',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Hasil dari 70C13 adalah...',
        'opsi_a': '635013559600',
        'opsi_b': '6350135596000',
        'opsi_c': '910',
        'opsi_d': '4900',
        'opsi_e': '63501355960',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Jika 21x - 20 = 148, maka nilai x adalah...',
        'opsi_a': '8',
        'opsi_b': '7',
        'opsi_c': '9',
        'opsi_d': '6',
        'opsi_e': '10',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Banyak cara memilih 19 orang dari 38 orang adalah...',
        'opsi_a': '35345263800',
        'opsi_b': '17672631900',
        'opsi_c': '70690527600',
        'opsi_d': '523022617466601111760007224100074291200000000',
        'opsi_e': '35345263800',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Hasil dari ∛10648 adalah...',
        'opsi_a': '22',
        'opsi_b': '20',
        'opsi_c': '24',
        'opsi_d': '26',
        'opsi_e': '28',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Deret aritmatika: 17, 35, 53, 71, ..., 107. Suku yang hilang adalah...',
        'opsi_a': '89',
        'opsi_b': '87',
        'opsi_c': '91',
        'opsi_d': '88',
        'opsi_e': '90',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Jika 16x + 15y = 160 dan x + y = 21, maka nilai x adalah...',
        'opsi_a': '15',
        'opsi_b': '16',
        'opsi_c': '17',
        'opsi_d': '14',
        'opsi_e': '18',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Sebuah lingkaran memiliki jari-jari 13 cm. Luas lingkaran tersebut adalah...',
        'opsi_a': '530,66 cm²',
        'opsi_b': '530 cm²',
        'opsi_c': '531 cm²',
        'opsi_d': '529 cm²',
        'opsi_e': '532 cm²',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Hasil dari 22P18 adalah...',
        'opsi_a': '85201560',
        'opsi_b': '7315',
        'opsi_c': '8520156',
        'opsi_d': '1704031200',
        'opsi_e': '17040312000',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Jika cot 45° = 1, maka tan 45° adalah...',
        'opsi_a': '1',
        'opsi_b': '0',
        'opsi_c': '√2',
        'opsi_d': '1/√2',
        'opsi_e': '2',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Sebuah tabung memiliki jari-jari alas 7 cm dan tinggi 14 cm. Volume tabung tersebut adalah...',
        'opsi_a': '2154,04 cm³',
        'opsi_b': '4308,08 cm³',
        'opsi_c': '1077,02 cm³',
        'opsi_d': '3231,06 cm³',
        'opsi_e': '538,51 cm³',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Banyak cara menyusun huruf dari kata "MEDAN" adalah...',
        'opsi_a': '120',
        'opsi_b': '60',
        'opsi_c': '240',
        'opsi_d': '30',
        'opsi_e': '15',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Hasil dari log₆ 216 adalah...',
        'opsi_a': '3',
        'opsi_b': '2',
        'opsi_c': '4',
        'opsi_d': '216',
        'opsi_e': '1',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Jika 17x² = 4624, maka nilai x adalah...',
        'opsi_a': '17 atau -17',
        'opsi_b': '17 saja',
        'opsi_c': '-17 saja',
        'opsi_d': '289',
        'opsi_e': '51',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Sebuah persegi memiliki sisi 7 cm. Keliling persegi tersebut adalah...',
        'opsi_a': '28 cm',
        'opsi_b': '56 cm',
        'opsi_c': '14 cm',
        'opsi_d': '21 cm',
        'opsi_e': '49 cm',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Hasil dari 75C14 adalah...',
        'opsi_a': '65198391129600',
        'opsi_b': '651983911296000',
        'opsi_c': '1050',
        'opsi_d': '5625',
        'opsi_e': '6519839112960',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Jika 22x - 21 = 155, maka nilai x adalah...',
        'opsi_a': '8',
        'opsi_b': '7',
        'opsi_c': '9',
        'opsi_d': '6',
        'opsi_e': '10',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Banyak cara memilih 20 orang dari 40 orang adalah...',
        'opsi_a': '137846528820',
        'opsi_b': '68923264410',
        'opsi_c': '275693057640',
        'opsi_d': '815915283247897734345611269596115894272000000000',
        'opsi_e': '137846528820',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Hasil dari ∛15625 adalah...',
        'opsi_a': '25',
        'opsi_b': '23',
        'opsi_c': '27',
        'opsi_d': '29',
        'opsi_e': '31',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Deret aritmatika: 18, 37, 56, 75, ..., 113. Suku yang hilang adalah...',
        'opsi_a': '94',
        'opsi_b': '92',
        'opsi_c': '96',
        'opsi_d': '93',
        'opsi_e': '95',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Jika 17x + 16y = 170 dan x + y = 22, maka nilai x adalah...',
        'opsi_a': '16',
        'opsi_b': '17',
        'opsi_c': '18',
        'opsi_d': '15',
        'opsi_e': '19',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Sebuah lingkaran memiliki diameter 24 cm. Keliling lingkaran tersebut adalah...',
        'opsi_a': '75,36 cm',
        'opsi_b': '75 cm',
        'opsi_c': '76 cm',
        'opsi_d': '74 cm',
        'opsi_e': '77 cm',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Hasil dari 23P19 adalah...',
        'opsi_a': '102009600',
        'opsi_b': '8855',
        'opsi_c': '10200960',
        'opsi_d': '2040192000',
        'opsi_e': '20401920000',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Jika sec 30° = 2/√3, maka cos 30° adalah...',
        'opsi_a': '√3/2',
        'opsi_b': '1',
        'opsi_c': '√2/2',
        'opsi_d': '1/2',
        'opsi_e': '0',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Sebuah bola memiliki jari-jari 9 cm. Volume bola tersebut adalah...',
        'opsi_a': '3052,08 cm³',
        'opsi_b': '6104,16 cm³',
        'opsi_c': '1526,04 cm³',
        'opsi_d': '4578,12 cm³',
        'opsi_e': '763,02 cm³',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Banyak cara menyusun huruf dari kata "SURABAYA" adalah...',
        'opsi_a': '40320',
        'opsi_b': '20160',
        'opsi_c': '80640',
        'opsi_d': '5040',
        'opsi_e': '10080',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Hasil dari log₇ 343 adalah...',
        'opsi_a': '3',
        'opsi_b': '2',
        'opsi_c': '4',
        'opsi_d': '343',
        'opsi_e': '1',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Jika 18x² = 5832, maka nilai x adalah...',
        'opsi_a': '18 atau -18',
        'opsi_b': '18 saja',
        'opsi_c': '-18 saja',
        'opsi_d': '324',
        'opsi_e': '54',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Sebuah segitiga sama kaki memiliki sisi 8 cm dan 8 cm, dengan alas 6 cm. Keliling segitiga tersebut adalah...',
        'opsi_a': '22 cm',
        'opsi_b': '44 cm',
        'opsi_c': '11 cm',
        'opsi_d': '33 cm',
        'opsi_e': '16 cm',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Hasil dari 80C15 adalah...',
        'opsi_a': '96577148416480',
        'opsi_b': '965771484164800',
        'opsi_c': '1200',
        'opsi_d': '6400',
        'opsi_e': '9657714841648',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Jika 23x - 22 = 162, maka nilai x adalah...',
        'opsi_a': '8',
        'opsi_b': '7',
        'opsi_c': '9',
        'opsi_d': '6',
        'opsi_e': '10',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Banyak cara memilih 21 orang dari 42 orang adalah...',
        'opsi_a': '538257874440',
        'opsi_b': '269128937220',
        'opsi_c': '1076515748880',
        'opsi_d': '14063002607761571181601724202199743354078080000000',
        'opsi_e': '538257874440',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Hasil dari ∛24389 adalah...',
        'opsi_a': '29',
        'opsi_b': '27',
        'opsi_c': '31',
        'opsi_d': '33',
        'opsi_e': '35',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Deret aritmatika: 19, 39, 59, 79, ..., 119. Suku yang hilang adalah...',
        'opsi_a': '99',
        'opsi_b': '97',
        'opsi_c': '101',
        'opsi_d': '98',
        'opsi_e': '100',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Jika 18x + 17y = 180 dan x + y = 23, maka nilai x adalah...',
        'opsi_a': '17',
        'opsi_b': '18',
        'opsi_c': '19',
        'opsi_d': '16',
        'opsi_e': '20',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Sebuah lingkaran memiliki jari-jari 14 cm. Luas lingkaran tersebut adalah...',
        'opsi_a': '615,44 cm²',
        'opsi_b': '615 cm²',
        'opsi_c': '616 cm²',
        'opsi_d': '614 cm²',
        'opsi_e': '617 cm²',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Hasil dari 24P20 adalah...',
        'opsi_a': '127512000',
        'opsi_b': '10626',
        'opsi_c': '12751200',
        'opsi_d': '2550240000',
        'opsi_e': '25502400000',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Jika cosec 30° = 2, maka sin 30° adalah...',
        'opsi_a': '1/2',
        'opsi_b': '1',
        'opsi_c': '√2/2',
        'opsi_d': '√3/2',
        'opsi_e': '0',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Sebuah prisma segitiga memiliki alas 8 cm, tinggi alas 6 cm, dan tinggi prisma 12 cm. Volume prisma tersebut adalah...',
        'opsi_a': '288 cm³',
        'opsi_b': '576 cm³',
        'opsi_c': '144 cm³',
        'opsi_d': '432 cm³',
        'opsi_e': '72 cm³',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Banyak cara menyusun huruf dari kata "JAKARTA" adalah...',
        'opsi_a': '5040',
        'opsi_b': '2520',
        'opsi_c': '10080',
        'opsi_d': '630',
        'opsi_e': '1260',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Hasil dari log₈ 512 adalah...',
        'opsi_a': '3',
        'opsi_b': '2',
        'opsi_c': '4',
        'opsi_d': '512',
        'opsi_e': '1',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Jika 19x² = 722, maka nilai x adalah...',
        'opsi_a': '√38 atau -√38',
        'opsi_b': '√38 saja',
        'opsi_c': '-√38 saja',
        'opsi_d': '361',
        'opsi_e': '38',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Sebuah trapesium memiliki sisi sejajar 10 cm dan 14 cm, dengan tinggi 8 cm. Luas trapesium tersebut adalah...',
        'opsi_a': '96 cm²',
        'opsi_b': '192 cm²',
        'opsi_c': '48 cm²',
        'opsi_d': '144 cm²',
        'opsi_e': '24 cm²',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Hasil dari 85C16 adalah...',
        'opsi_a': '14226520737620270',
        'opsi_b': '142265207376202700',
        'opsi_c': '1360',
        'opsi_d': '7225',
        'opsi_e': '1422652073762027',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Jika 24x - 23 = 173, maka nilai x adalah...',
        'opsi_a': '8',
        'opsi_b': '7',
        'opsi_c': '9',
        'opsi_d': '6',
        'opsi_e': '10',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Banyak cara memilih 22 orang dari 44 orang adalah...',
        'opsi_a': '7059057627640',
        'opsi_b': '3529528813820',
        'opsi_c': '14118115255280',
        'opsi_d': '2658271574788448768004077540746902779128000000000',
        'opsi_e': '7059057627640',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Hasil dari ∛35937 adalah...',
        'opsi_a': '33',
        'opsi_b': '31',
        'opsi_c': '35',
        'opsi_d': '37',
        'opsi_e': '39',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Deret aritmatika: 20, 41, 62, 83, ..., 125. Suku yang hilang adalah...',
        'opsi_a': '104',
        'opsi_b': '102',
        'opsi_c': '106',
        'opsi_d': '103',
        'opsi_e': '105',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Jika 19x + 18y = 190 dan x + y = 24, maka nilai x adalah...',
        'opsi_a': '18',
        'opsi_b': '19',
        'opsi_c': '20',
        'opsi_d': '17',
        'opsi_e': '21',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Sebuah lingkaran memiliki diameter 26 cm. Luas lingkaran tersebut adalah...',
        'opsi_a': '530,66 cm²',
        'opsi_b': '530 cm²',
        'opsi_c': '531 cm²',
        'opsi_d': '529 cm²',
        'opsi_e': '532 cm²',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Hasil dari 25P21 adalah...',
        'opsi_a': '127512000',
        'opsi_b': '12650',
        'opsi_c': '12751200',
        'opsi_d': '2550240000',
        'opsi_e': '25502400000',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Jika sec 60° = 2, maka cos 60° adalah...',
        'opsi_a': '1/2',
        'opsi_b': '1',
        'opsi_c': '√2/2',
        'opsi_d': '√3/2',
        'opsi_e': '0',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Sebuah kerucut memiliki jari-jari alas 8 cm dan tinggi 12 cm. Volume kerucut tersebut adalah...',
        'opsi_a': '803,84 cm³',
        'opsi_b': '1607,68 cm³',
        'opsi_c': '401,92 cm³',
        'opsi_d': '1205,76 cm³',
        'opsi_e': '200,96 cm³',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Banyak cara menyusun huruf dari kata "BANDUNG" adalah...',
        'opsi_a': '720',
        'opsi_b': '360',
        'opsi_c': '1440',
        'opsi_d': '90',
        'opsi_e': '180',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Hasil dari log₉ 729 adalah...',
        'opsi_a': '6',
        'opsi_b': '3',
        'opsi_c': '9',
        'opsi_d': '729',
        'opsi_e': '1',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Jika 20x² = 180, maka nilai x adalah...',
        'opsi_a': '3 atau -3',
        'opsi_b': '3 saja',
        'opsi_c': '-3 saja',
        'opsi_d': '9',
        'opsi_e': '6',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Sebuah jajar genjang memiliki alas 12 cm dan tinggi 9 cm. Luas jajar genjang tersebut adalah...',
        'opsi_a': '108 cm²',
        'opsi_b': '216 cm²',
        'opsi_c': '54 cm²',
        'opsi_d': '162 cm²',
        'opsi_e': '27 cm²',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Hasil dari 90C17 adalah...',
        'opsi_a': '208768636057840',
        'opsi_b': '2087686360578400',
        'opsi_c': '1530',
        'opsi_d': '8100',
        'opsi_e': '20876863605784',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Jika 25x - 24 = 176, maka nilai x adalah...',
        'opsi_a': '8',
        'opsi_b': '7',
        'opsi_c': '9',
        'opsi_d': '6',
        'opsi_e': '10',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Banyak cara memilih 23 orang dari 46 orang adalah...',
        'opsi_a': '10562292583040',
        'opsi_b': '5281146291520',
        'opsi_c': '21124585166080',
        'opsi_d': '110044713898950847795750417838023878421600000000',
        'opsi_e': '10562292583040',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Hasil dari ∛50653 adalah...',
        'opsi_a': '37',
        'opsi_b': '35',
        'opsi_c': '39',
        'opsi_d': '41',
        'opsi_e': '43',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Deret aritmatika: 21, 43, 65, 87, ..., 131. Suku yang hilang adalah...',
        'opsi_a': '109',
        'opsi_b': '107',
        'opsi_c': '111',
        'opsi_d': '108',
        'opsi_e': '110',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Jika 20x + 19y = 200 dan x + y = 25, maka nilai x adalah...',
        'opsi_a': '19',
        'opsi_b': '20',
        'opsi_c': '21',
        'opsi_d': '18',
        'opsi_e': '22',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Sebuah lingkaran memiliki jari-jari 16 cm. Luas lingkaran tersebut adalah...',
        'opsi_a': '803,84 cm²',
        'opsi_b': '803 cm²',
        'opsi_c': '804 cm²',
        'opsi_d': '802 cm²',
        'opsi_e': '805 cm²',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Hasil dari 26P22 adalah...',
        'opsi_a': '1494451200',
        'opsi_b': '14950',
        'opsi_c': '149445120',
        'opsi_d': '2988902400',
        'opsi_e': '29889024000',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Jika cot 45° = 1, maka tan 45° adalah...',
        'opsi_a': '1',
        'opsi_b': '0',
        'opsi_c': '√2/2',
        'opsi_d': '√3/2',
        'opsi_e': '1/2',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Sebuah tabung memiliki jari-jari alas 7 cm dan tinggi 14 cm. Volume tabung tersebut adalah...',
        'opsi_a': '2154,04 cm³',
        'opsi_b': '4308,08 cm³',
        'opsi_c': '1077,02 cm³',
        'opsi_d': '3231,06 cm³',
        'opsi_e': '538,51 cm³',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Banyak cara menyusun huruf dari kata "MEDAN" adalah...',
        'opsi_a': '120',
        'opsi_b': '60',
        'opsi_c': '240',
        'opsi_d': '30',
        'opsi_e': '15',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Hasil dari log₁₀ 1000 adalah...',
        'opsi_a': '3',
        'opsi_b': '2',
        'opsi_c': '4',
        'opsi_d': '1000',
        'opsi_e': '1',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Jika 21x² = 189, maka nilai x adalah...',
        'opsi_a': '3 atau -3',
        'opsi_b': '3 saja',
        'opsi_c': '-3 saja',
        'opsi_d': '9',
        'opsi_e': '6',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Sebuah belah ketupat memiliki diagonal 16 cm dan 12 cm. Luas belah ketupat tersebut adalah...',
        'opsi_a': '96 cm²',
        'opsi_b': '192 cm²',
        'opsi_c': '48 cm²',
        'opsi_d': '144 cm²',
        'opsi_e': '24 cm²',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Hasil dari 95C18 adalah...',
        'opsi_a': '29944345479660',
        'opsi_b': '299443454796600',
        'opsi_c': '1710',
        'opsi_d': '9025',
        'opsi_e': '2994434547966',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Jika 26x - 25 = 181, maka nilai x adalah...',
        'opsi_a': '8',
        'opsi_b': '7',
        'opsi_c': '9',
        'opsi_d': '6',
        'opsi_e': '10',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Banyak cara memilih 24 orang dari 48 orang adalah...',
        'opsi_a': '20294971654000',
        'opsi_b': '10147485827000',
        'opsi_c': '40589943308000',
        'opsi_d': '12413915592536072670862284073552286540224000000000',
        'opsi_e': '20294971654000',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Hasil dari ∛68921 adalah...',
        'opsi_a': '41',
        'opsi_b': '39',
        'opsi_c': '43',
        'opsi_d': '45',
        'opsi_e': '47',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Deret aritmatika: 22, 45, 68, 91, ..., 137. Suku yang hilang adalah...',
        'opsi_a': '114',
        'opsi_b': '112',
        'opsi_c': '116',
        'opsi_d': '113',
        'opsi_e': '115',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Jika 21x + 20y = 210 dan x + y = 26, maka nilai x adalah...',
        'opsi_a': '20',
        'opsi_b': '21',
        'opsi_c': '22',
        'opsi_d': '19',
        'opsi_e': '23',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Sebuah lingkaran memiliki diameter 28 cm. Keliling lingkaran tersebut adalah...',
        'opsi_a': '87,92 cm',
        'opsi_b': '87 cm',
        'opsi_c': '88 cm',
        'opsi_d': '86 cm',
        'opsi_e': '89 cm',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Hasil dari 27P23 adalah...',
        'opsi_a': '4250415200',
        'opsi_b': '17550',
        'opsi_c': '425041520',
        'opsi_d': '8500830400',
        'opsi_e': '85008304000',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Jika cosec 45° = √2, maka sin 45° adalah...',
        'opsi_a': '√2/2',
        'opsi_b': '1',
        'opsi_c': '1/2',
        'opsi_d': '√3/2',
        'opsi_e': '0',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Sebuah limas segi empat memiliki alas 10 cm x 10 cm dan tinggi 12 cm. Volume limas tersebut adalah...',
        'opsi_a': '400 cm³',
        'opsi_b': '800 cm³',
        'opsi_c': '200 cm³',
        'opsi_d': '600 cm³',
        'opsi_e': '100 cm³',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Banyak cara menyusun huruf dari kata "SURABAYA" adalah...',
        'opsi_a': '40320',
        'opsi_b': '20160',
        'opsi_c': '80640',
        'opsi_d': '5040',
        'opsi_e': '10080',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Hasil dari log₂ 32 adalah...',
        'opsi_a': '5',
        'opsi_b': '4',
        'opsi_c': '6',
        'opsi_d': '32',
        'opsi_e': '1',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Jika 22x² = 198, maka nilai x adalah...',
        'opsi_a': '3 atau -3',
        'opsi_b': '3 saja',
        'opsi_c': '-3 saja',
        'opsi_d': '9',
        'opsi_e': '6',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Sebuah layang-layang memiliki diagonal 18 cm dan 14 cm. Luas layang-layang tersebut adalah...',
        'opsi_a': '126 cm²',
        'opsi_b': '252 cm²',
        'opsi_c': '63 cm²',
        'opsi_d': '189 cm²',
        'opsi_e': '31,5 cm²',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Hasil dari 100C19 adalah...',
        'opsi_a': '43687576891380',
        'opsi_b': '436875768913800',
        'opsi_c': '1900',
        'opsi_d': '10000',
        'opsi_e': '4368757689138',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Jika 27x - 26 = 188, maka nilai x adalah...',
        'opsi_a': '8',
        'opsi_b': '7',
        'opsi_c': '9',
        'opsi_d': '6',
        'opsi_e': '10',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Banyak cara memilih 25 orang dari 50 orang adalah...',
        'opsi_a': '126410606437752',
        'opsi_b': '63205303218876',
        'opsi_c': '252821212875504',
        'opsi_d': '126410606437752000000000000000000000000000000000',
        'opsi_e': '126410606437752',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Hasil dari ∛91125 adalah...',
        'opsi_a': '45',
        'opsi_b': '43',
        'opsi_c': '47',
        'opsi_d': '49',
        'opsi_e': '51',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Deret aritmatika: 23, 47, 71, 95, ..., 143. Suku yang hilang adalah...',
        'opsi_a': '119',
        'opsi_b': '117',
        'opsi_c': '121',
        'opsi_d': '118',
        'opsi_e': '120',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Jika 22x + 21y = 220 dan x + y = 27, maka nilai x adalah...',
        'opsi_a': '21',
        'opsi_b': '22',
        'opsi_c': '23',
        'opsi_d': '20',
        'opsi_e': '24',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Sebuah lingkaran memiliki jari-jari 18 cm. Luas lingkaran tersebut adalah...',
        'opsi_a': '1017,36 cm²',
        'opsi_b': '1017 cm²',
        'opsi_c': '1018 cm²',
        'opsi_d': '1016 cm²',
        'opsi_e': '1019 cm²',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Hasil dari 28P24 adalah...',
        'opsi_a': '13359067200',
        'opsi_b': '19600',
        'opsi_c': '1335906720',
        'opsi_d': '26718134400',
        'opsi_e': '267181344000',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Jika csc 30° = 2, maka sin 30° adalah...',
        'opsi_a': '1/2',
        'opsi_b': '1',
        'opsi_c': '√2/2',
        'opsi_d': '√3/2',
        'opsi_e': '0',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Sebuah prisma segitiga memiliki alas 8 cm, tinggi alas 6 cm, dan tinggi prisma 15 cm. Volume prisma tersebut adalah...',
        'opsi_a': '360 cm³',
        'opsi_b': '720 cm³',
        'opsi_c': '180 cm³',
        'opsi_d': '540 cm³',
        'opsi_e': '90 cm³',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Banyak cara menyusun huruf dari kata "SEMARANG" adalah...',
        'opsi_a': '5040',
        'opsi_b': '2520',
        'opsi_c': '10080',
        'opsi_d': '720',
        'opsi_e': '1260',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Hasil dari log₃ 81 adalah...',
        'opsi_a': '4',
        'opsi_b': '3',
        'opsi_c': '5',
        'opsi_d': '81',
        'opsi_e': '1',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Jika 23x² = 207, maka nilai x adalah...',
        'opsi_a': '3 atau -3',
        'opsi_b': '3 saja',
        'opsi_c': '-3 saja',
        'opsi_d': '9',
        'opsi_e': '6',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Sebuah trapesium memiliki sisi sejajar 12 cm dan 18 cm, tinggi 10 cm. Luas trapesium tersebut adalah...',
        'opsi_a': '150 cm²',
        'opsi_b': '300 cm²',
        'opsi_c': '75 cm²',
        'opsi_d': '225 cm²',
        'opsi_e': '37,5 cm²',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Hasil dari 105C20 adalah...',
        'opsi_a': '79357041941960',
        'opsi_b': '793570419419600',
        'opsi_c': '2100',
        'opsi_d': '11025',
        'opsi_e': '7935704194196',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Jika 28x - 27 = 197, maka nilai x adalah...',
        'opsi_a': '8',
        'opsi_b': '7',
        'opsi_c': '9',
        'opsi_d': '6',
        'opsi_e': '10',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Banyak cara memilih 26 orang dari 52 orang adalah...',
        'opsi_a': '495918532948104',
        'opsi_b': '247959266474052',
        'opsi_c': '991837065896208',
        'opsi_d': '49591853294810400000000000000000000000000000000000',
        'opsi_e': '495918532948104',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Hasil dari ∛110592 adalah...',
        'opsi_a': '48',
        'opsi_b': '46',
        'opsi_c': '50',
        'opsi_d': '52',
        'opsi_e': '54',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Deret aritmatika: 24, 49, 74, 99, ..., 149. Suku yang hilang adalah...',
        'opsi_a': '124',
        'opsi_b': '122',
        'opsi_c': '126',
        'opsi_d': '123',
        'opsi_e': '125',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Jika 23x + 22y = 230 dan x + y = 28, maka nilai x adalah...',
        'opsi_a': '22',
        'opsi_b': '23',
        'opsi_c': '24',
        'opsi_d': '21',
        'opsi_e': '25',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Sebuah lingkaran memiliki diameter 30 cm. Keliling lingkaran tersebut adalah...',
        'opsi_a': '94,2 cm',
        'opsi_b': '94 cm',
        'opsi_c': '95 cm',
        'opsi_d': '93 cm',
        'opsi_e': '96 cm',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Hasil dari 29P25 adalah...',
        'opsi_a': '381446925600',
        'opsi_b': '23256',
        'opsi_c': '38144692560',
        'opsi_d': '762893851200',
        'opsi_e': '7628938512000',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Jika sec 60° = 2, maka cos 60° adalah...',
        'opsi_a': '1/2',
        'opsi_b': '1',
        'opsi_c': '√2/2',
        'opsi_d': '√3/2',
        'opsi_e': '0',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Sebuah bola memiliki jari-jari 9 cm. Volume bola tersebut adalah...',
        'opsi_a': '3052,08 cm³',
        'opsi_b': '6104,16 cm³',
        'opsi_c': '1526,04 cm³',
        'opsi_d': '4578,12 cm³',
        'opsi_e': '763,02 cm³',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Banyak cara menyusun huruf dari kata "YOGYAKARTA" adalah...',
        'opsi_a': '1814400',
        'opsi_b': '907200',
        'opsi_c': '3628800',
        'opsi_d': '453600',
        'opsi_e': '226800',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Hasil dari log₅ 125 adalah...',
        'opsi_a': '3',
        'opsi_b': '2',
        'opsi_c': '4',
        'opsi_d': '125',
        'opsi_e': '1',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Jika 24x² = 216, maka nilai x adalah...',
        'opsi_a': '3 atau -3',
        'opsi_b': '3 saja',
        'opsi_c': '-3 saja',
        'opsi_d': '9',
        'opsi_e': '6',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Sebuah segitiga memiliki alas 20 cm dan tinggi 15 cm. Luas segitiga tersebut adalah...',
        'opsi_a': '150 cm²',
        'opsi_b': '300 cm²',
        'opsi_c': '75 cm²',
        'opsi_d': '225 cm²',
        'opsi_e': '37,5 cm²',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Hasil dari 110C21 adalah...',
        'opsi_a': '141926262673960',
        'opsi_b': '1419262626739600',
        'opsi_c': '2310',
        'opsi_d': '12100',
        'opsi_e': '14192626267396',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Jika 29x - 28 = 206, maka nilai x adalah...',
        'opsi_a': '8',
        'opsi_b': '7',
        'opsi_c': '9',
        'opsi_d': '6',
        'opsi_e': '10',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Banyak cara memilih 27 orang dari 54 orang adalah...',
        'opsi_a': '2320692984051116',
        'opsi_b': '1160346492025558',
        'opsi_c': '4641385968102232',
        'opsi_d': '23206929840511160000000000000000000000000000000000',
        'opsi_e': '2320692984051116',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Hasil dari ∛132651 adalah...',
        'opsi_a': '51',
        'opsi_b': '49',
        'opsi_c': '53',
        'opsi_d': '55',
        'opsi_e': '57',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Deret aritmatika: 25, 51, 77, 103, ..., 155. Suku yang hilang adalah...',
        'opsi_a': '129',
        'opsi_b': '127',
        'opsi_c': '131',
        'opsi_d': '128',
        'opsi_e': '130',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Jika 24x + 23y = 240 dan x + y = 29, maka nilai x adalah...',
        'opsi_a': '23',
        'opsi_b': '24',
        'opsi_c': '25',
        'opsi_d': '22',
        'opsi_e': '26',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Sebuah lingkaran memiliki jari-jari 20 cm. Luas lingkaran tersebut adalah...',
        'opsi_a': '1256 cm²',
        'opsi_b': '1256,64 cm²',
        'opsi_c': '1257 cm²',
        'opsi_d': '1255 cm²',
        'opsi_e': '1258 cm²',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Hasil dari 30P26 adalah...',
        'opsi_a': '10716770452400',
        'opsi_b': '27000',
        'opsi_c': '1071677045240',
        'opsi_d': '21433540904800',
        'opsi_e': '214335409048000',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Jika cot 30° = √3, maka tan 30° adalah...',
        'opsi_a': '1/√3',
        'opsi_b': '1',
        'opsi_c': '√3',
        'opsi_d': '√3/2',
        'opsi_e': '0',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Sebuah kerucut memiliki jari-jari alas 8 cm dan tinggi 12 cm. Volume kerucut tersebut adalah...',
        'opsi_a': '803,84 cm³',
        'opsi_b': '1607,68 cm³',
        'opsi_c': '401,92 cm³',
        'opsi_d': '1205,76 cm³',
        'opsi_e': '200,96 cm³',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Banyak cara menyusun huruf dari kata "MALANG" adalah...',
        'opsi_a': '120',
        'opsi_b': '60',
        'opsi_c': '240',
        'opsi_d': '30',
        'opsi_e': '15',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Hasil dari log₇ 343 adalah...',
        'opsi_a': '3',
        'opsi_b': '2',
        'opsi_c': '4',
        'opsi_d': '343',
        'opsi_e': '1',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Jika 25x² = 225, maka nilai x adalah...',
        'opsi_a': '3 atau -3',
        'opsi_b': '3 saja',
        'opsi_c': '-3 saja',
        'opsi_d': '9',
        'opsi_e': '6',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Sebuah jajar genjang memiliki alas 18 cm dan tinggi 12 cm. Luas jajar genjang tersebut adalah...',
        'opsi_a': '216 cm²',
        'opsi_b': '432 cm²',
        'opsi_c': '108 cm²',
        'opsi_d': '324 cm²',
        'opsi_e': '54 cm²',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Hasil dari 115C22 adalah...',
        'opsi_a': '253265525023300',
        'opsi_b': '2532655250233000',
        'opsi_c': '2530',
        'opsi_d': '13225',
        'opsi_e': '25326552502330',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Jika 30x - 29 = 215, maka nilai x adalah...',
        'opsi_a': '8',
        'opsi_b': '7',
        'opsi_c': '9',
        'opsi_d': '6',
        'opsi_e': '10',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Banyak cara memilih 28 orang dari 56 orang adalah...',
        'opsi_a': '10893878657876200',
        'opsi_b': '5446939328938100',
        'opsi_c': '21787757315752400',
        'opsi_d': '108938786578762000000000000000000000000000000000000',
        'opsi_e': '10893878657876200',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Hasil dari ∛166375 adalah...',
        'opsi_a': '55',
        'opsi_b': '53',
        'opsi_c': '57',
        'opsi_d': '59',
        'opsi_e': '61',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Deret aritmatika: 26, 53, 80, 107, ..., 161. Suku yang hilang adalah...',
        'opsi_a': '134',
        'opsi_b': '132',
        'opsi_c': '136',
        'opsi_d': '133',
        'opsi_e': '135',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Jika 25x + 24y = 250 dan x + y = 30, maka nilai x adalah...',
        'opsi_a': '24',
        'opsi_b': '25',
        'opsi_c': '26',
        'opsi_d': '23',
        'opsi_e': '27',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Sebuah lingkaran memiliki diameter 32 cm. Keliling lingkaran tersebut adalah...',
        'opsi_a': '100,48 cm',
        'opsi_b': '100 cm',
        'opsi_c': '101 cm',
        'opsi_d': '99 cm',
        'opsi_e': '102 cm',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Hasil dari 31P27 adalah...',
        'opsi_a': '86833176168800',
        'opsi_b': '29160',
        'opsi_c': '8683317616880',
        'opsi_d': '173666352337600',
        'opsi_e': '1736663523376000',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Jika sec 45° = √2, maka cos 45° adalah...',
        'opsi_a': '√2/2',
        'opsi_b': '1',
        'opsi_c': '1/2',
        'opsi_d': '√3/2',
        'opsi_e': '0',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Sebuah tabung memiliki jari-jari alas 7 cm dan tinggi 14 cm. Volume tabung tersebut adalah...',
        'opsi_a': '2154,04 cm³',
        'opsi_b': '4308,08 cm³',
        'opsi_c': '1077,02 cm³',
        'opsi_d': '3231,06 cm³',
        'opsi_e': '538,51 cm³',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Banyak cara menyusun huruf dari kata "SURABAYA" adalah...',
        'opsi_a': '40320',
        'opsi_b': '20160',
        'opsi_c': '80640',
        'opsi_d': '10080',
        'opsi_e': '5040',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Hasil dari log₁₀ 1000 adalah...',
        'opsi_a': '3',
        'opsi_b': '2',
        'opsi_c': '4',
        'opsi_d': '1000',
        'opsi_e': '1',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Jika 26x² = 234, maka nilai x adalah...',
        'opsi_a': '3 atau -3',
        'opsi_b': '3 saja',
        'opsi_c': '-3 saja',
        'opsi_d': '9',
        'opsi_e': '6',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Sebuah belah ketupat memiliki diagonal 16 cm dan 20 cm. Luas belah ketupat tersebut adalah...',
        'opsi_a': '160 cm²',
        'opsi_b': '320 cm²',
        'opsi_c': '80 cm²',
        'opsi_d': '240 cm²',
        'opsi_e': '40 cm²',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Hasil dari 120C23 adalah...',
        'opsi_a': '1458311745390700',
        'opsi_b': '14583117453907000',
        'opsi_c': '2760',
        'opsi_d': '14400',
        'opsi_e': '145831174539070',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Jika 31x - 30 = 224, maka nilai x adalah...',
        'opsi_a': '8',
        'opsi_b': '7',
        'opsi_c': '9',
        'opsi_d': '6',
        'opsi_e': '10',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Banyak cara memilih 29 orang dari 58 orang adalah...',
        'opsi_a': '48070288964273500',
        'opsi_b': '24035144482136750',
        'opsi_c': '96140577928547000',
        'opsi_d': '480702889642735000000000000000000000000000000000000',
        'opsi_e': '48070288964273500',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Hasil dari ∛195112 adalah...',
        'opsi_a': '58',
        'opsi_b': '56',
        'opsi_c': '60',
        'opsi_d': '62',
        'opsi_e': '64',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Deret aritmatika: 27, 55, 83, 111, ..., 167. Suku yang hilang adalah...',
        'opsi_a': '139',
        'opsi_b': '137',
        'opsi_c': '141',
        'opsi_d': '138',
        'opsi_e': '140',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Jika 26x + 25y = 260 dan x + y = 31, maka nilai x adalah...',
        'opsi_a': '25',
        'opsi_b': '26',
        'opsi_c': '27',
        'opsi_d': '24',
        'opsi_e': '28',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Sebuah lingkaran memiliki jari-jari 22 cm. Luas lingkaran tersebut adalah...',
        'opsi_a': '1520,76 cm²',
        'opsi_b': '1521 cm²',
        'opsi_c': '1522 cm²',
        'opsi_d': '1519 cm²',
        'opsi_e': '1523 cm²',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Hasil dari 32P28 adalah...',
        'opsi_a': '325483475408000',
        'opsi_b': '32768',
        'opsi_c': '32548347540800',
        'opsi_d': '650966950816000',
        'opsi_e': '6509669508160000',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Jika csc 45° = √2, maka sin 45° adalah...',
        'opsi_a': '√2/2',
        'opsi_b': '1',
        'opsi_c': '1/2',
        'opsi_d': '√3/2',
        'opsi_e': '0',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Sebuah limas segi empat memiliki alas 12 cm × 12 cm dan tinggi 16 cm. Volume limas tersebut adalah...',
        'opsi_a': '768 cm³',
        'opsi_b': '1536 cm³',
        'opsi_c': '384 cm³',
        'opsi_d': '1152 cm³',
        'opsi_e': '192 cm³',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Banyak cara menyusun huruf dari kata "MAKASSAR" adalah...',
        'opsi_a': '20160',
        'opsi_b': '10080',
        'opsi_c': '40320',
        'opsi_d': '5040',
        'opsi_e': '2520',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Hasil dari log₂ 64 adalah...',
        'opsi_a': '6',
        'opsi_b': '5',
        'opsi_c': '7',
        'opsi_d': '64',
        'opsi_e': '1',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Jika 27x² = 243, maka nilai x adalah...',
        'opsi_a': '3 atau -3',
        'opsi_b': '3 saja',
        'opsi_c': '-3 saja',
        'opsi_d': '9',
        'opsi_e': '6',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Sebuah layang-layang memiliki diagonal 24 cm dan 30 cm. Luas layang-layang tersebut adalah...',
        'opsi_a': '360 cm²',
        'opsi_b': '720 cm²',
        'opsi_c': '180 cm²',
        'opsi_d': '540 cm²',
        'opsi_e': '90 cm²',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Hasil dari 125C24 adalah...',
        'opsi_a': '26584684973576000',
        'opsi_b': '265846849735760000',
        'opsi_c': '3000',
        'opsi_d': '15625',
        'opsi_e': '2658468497357600',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Jika 32x - 31 = 233, maka nilai x adalah...',
        'opsi_a': '8',
        'opsi_b': '7',
        'opsi_c': '9',
        'opsi_d': '6',
        'opsi_e': '10',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Banyak cara memilih 30 orang dari 60 orang adalah...',
        'opsi_a': '118264581564861424',
        'opsi_b': '59132290782430712',
        'opsi_c': '236529163129722848',
        'opsi_d': '1182645815648614240000000000000000000000000000000000',
        'opsi_e': '118264581564861424',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Hasil dari ∛226981 adalah...',
        'opsi_a': '61',
        'opsi_b': '59',
        'opsi_c': '63',
        'opsi_d': '65',
        'opsi_e': '67',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Deret aritmatika: 28, 57, 86, 115, ..., 173. Suku yang hilang adalah...',
        'opsi_a': '144',
        'opsi_b': '142',
        'opsi_c': '146',
        'opsi_d': '143',
        'opsi_e': '145',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Jika 27x + 26y = 270 dan x + y = 32, maka nilai x adalah...',
        'opsi_a': '26',
        'opsi_b': '27',
        'opsi_c': '28',
        'opsi_d': '25',
        'opsi_e': '29',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Sebuah lingkaran memiliki diameter 34 cm. Keliling lingkaran tersebut adalah...',
        'opsi_a': '106,76 cm',
        'opsi_b': '106 cm',
        'opsi_c': '107 cm',
        'opsi_d': '105 cm',
        'opsi_e': '108 cm',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Hasil dari 33P29 adalah...',
        'opsi_a': '9873696548224000',
        'opsi_b': '39366',
        'opsi_c': '987369654822400',
        'opsi_d': '19747393096448000',
        'opsi_e': '197473930964480000',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Jika sec 30° = 2/√3, maka cos 30° adalah...',
        'opsi_a': '√3/2',
        'opsi_b': '1',
        'opsi_c': '1/2',
        'opsi_d': '√2/2',
        'opsi_e': '0',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Sebuah prisma segitiga memiliki alas segitiga dengan alas 10 cm dan tinggi 12 cm, serta tinggi prisma 15 cm. Volume prisma tersebut adalah...',
        'opsi_a': '900 cm³',
        'opsi_b': '1800 cm³',
        'opsi_c': '450 cm³',
        'opsi_d': '1350 cm³',
        'opsi_e': '225 cm³',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Banyak cara menyusun huruf dari kata "PADANG" adalah...',
        'opsi_a': '120',
        'opsi_b': '60',
        'opsi_c': '240',
        'opsi_d': '30',
        'opsi_e': '15',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Hasil dari log₃ 81 adalah...',
        'opsi_a': '4',
        'opsi_b': '3',
        'opsi_c': '5',
        'opsi_d': '81',
        'opsi_e': '1',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Jika 28x² = 252, maka nilai x adalah...',
        'opsi_a': '3 atau -3',
        'opsi_b': '3 saja',
        'opsi_c': '-3 saja',
        'opsi_d': '9',
        'opsi_e': '6',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Sebuah trapesium memiliki tinggi 14 cm dan dua sisi sejajar 18 cm dan 26 cm. Luas trapesium tersebut adalah...',
        'opsi_a': '308 cm²',
        'opsi_b': '616 cm²',
        'opsi_c': '154 cm²',
        'opsi_d': '462 cm²',
        'opsi_e': '77 cm²',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Hasil dari 130C25 adalah...',
        'opsi_a': '435796384083616000',
        'opsi_b': '4357963840836160000',
        'opsi_c': '3250',
        'opsi_d': '16900',
        'opsi_e': '43579638408361600',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Jika 33x - 32 = 242, maka nilai x adalah...',
        'opsi_a': '8',
        'opsi_b': '7',
        'opsi_c': '9',
        'opsi_d': '6',
        'opsi_e': '10',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Banyak cara memilih 31 orang dari 62 orang adalah...',
        'opsi_a': '465428353255261088',
        'opsi_b': '232714176627630544',
        'opsi_c': '930856706510522176',
        'opsi_d': '4654283532552610880000000000000000000000000000000000',
        'opsi_e': '465428353255261088',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Hasil dari ∛262144 adalah...',
        'opsi_a': '64',
        'opsi_b': '62',
        'opsi_c': '66',
        'opsi_d': '68',
        'opsi_e': '70',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Deret aritmatika: 29, 59, 89, 119, ..., 179. Suku yang hilang adalah...',
        'opsi_a': '149',
        'opsi_b': '147',
        'opsi_c': '151',
        'opsi_d': '148',
        'opsi_e': '150',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Jika 28x + 27y = 280 dan x + y = 33, maka nilai x adalah...',
        'opsi_a': '27',
        'opsi_b': '28',
        'opsi_c': '29',
        'opsi_d': '26',
        'opsi_e': '30',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Sebuah lingkaran memiliki jari-jari 24 cm. Luas lingkaran tersebut adalah...',
        'opsi_a': '1809,56 cm²',
        'opsi_b': '1810 cm²',
        'opsi_c': '1811 cm²',
        'opsi_d': '1808 cm²',
        'opsi_e': '1812 cm²',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Hasil dari 34P30 adalah...',
        'opsi_a': '337903054669696000',
        'opsi_b': '1156',
        'opsi_c': '33790305466969600',
        'opsi_d': '675806109339392000',
        'opsi_e': '6758061093393920000',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Jika csc 60° = 2/√3, maka sin 60° adalah...',
        'opsi_a': '√3/2',
        'opsi_b': '1',
        'opsi_c': '1/2',
        'opsi_d': '√2/2',
        'opsi_e': '0',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Sebuah bola memiliki jari-jari 9 cm. Volume bola tersebut adalah...',
        'opsi_a': '3052,08 cm³',
        'opsi_b': '6104,16 cm³',
        'opsi_c': '1526,04 cm³',
        'opsi_d': '4578,12 cm³',
        'opsi_e': '763,02 cm³',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Banyak cara menyusun huruf dari kata "MEDAN" adalah...',
        'opsi_a': '120',
        'opsi_b': '60',
        'opsi_c': '240',
        'opsi_d': '30',
        'opsi_e': '15',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Hasil dari log₅ 125 adalah...',
        'opsi_a': '3',
        'opsi_b': '2',
        'opsi_c': '4',
        'opsi_d': '125',
        'opsi_e': '1',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Jika 29x² = 261, maka nilai x adalah...',
        'opsi_a': '3 atau -3',
        'opsi_b': '3 saja',
        'opsi_c': '-3 saja',
        'opsi_d': '9',
        'opsi_e': '6',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Sebuah segitiga memiliki alas 20 cm dan tinggi 16 cm. Luas segitiga tersebut adalah...',
        'opsi_a': '160 cm²',
        'opsi_b': '320 cm²',
        'opsi_c': '80 cm²',
        'opsi_d': '240 cm²',
        'opsi_e': '40 cm²',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Hasil dari 135C26 adalah...',
        'opsi_a': '6952367756994690000',
        'opsi_b': '69523677569946900000',
        'opsi_c': '3510',
        'opsi_d': '18225',
        'opsi_e': '695236775699469000',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Jika 34x - 33 = 251, maka nilai x adalah...',
        'opsi_a': '8',
        'opsi_b': '7',
        'opsi_c': '9',
        'opsi_d': '6',
        'opsi_e': '10',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Banyak cara memilih 32 orang dari 64 orang adalah...',
        'opsi_a': '1832624140942590534',
        'opsi_b': '916312070471295267',
        'opsi_c': '3665248281885181068',
        'opsi_d': '18326241409425905340000000000000000000000000000000000',
        'opsi_e': '1832624140942590534',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Hasil dari ∛300763 adalah...',
        'opsi_a': '67',
        'opsi_b': '65',
        'opsi_c': '69',
        'opsi_d': '71',
        'opsi_e': '73',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Deret aritmatika: 30, 61, 92, 123, ..., 185. Suku yang hilang adalah...',
        'opsi_a': '154',
        'opsi_b': '152',
        'opsi_c': '156',
        'opsi_d': '153',
        'opsi_e': '155',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Jika 29x + 28y = 290 dan x + y = 34, maka nilai x adalah...',
        'opsi_a': '28',
        'opsi_b': '29',
        'opsi_c': '30',
        'opsi_d': '27',
        'opsi_e': '31',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Sebuah lingkaran memiliki jari-jari 26 cm. Luas lingkaran tersebut adalah...',
        'opsi_a': '2122,64 cm²',
        'opsi_b': '2123 cm²',
        'opsi_c': '2124 cm²',
        'opsi_d': '2121 cm²',
        'opsi_e': '2125 cm²',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Hasil dari 35P31 adalah...',
        'opsi_a': '4272048664465664000',
        'opsi_b': '1225',
        'opsi_c': '427204866446566400',
        'opsi_d': '8544097328931328000',
        'opsi_e': '85440973289313280000',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Jika cot 45° = 1, maka tan 45° adalah...',
        'opsi_a': '1',
        'opsi_b': '0',
        'opsi_c': '√3',
        'opsi_d': '√2',
        'opsi_e': '1/2',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Sebuah tabung memiliki jari-jari 7 cm dan tinggi 12 cm. Volume tabung tersebut adalah...',
        'opsi_a': '1847,28 cm³',
        'opsi_b': '3694,56 cm³',
        'opsi_c': '923,64 cm³',
        'opsi_d': '2770,92 cm³',
        'opsi_e': '461,82 cm³',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Banyak cara menyusun huruf dari kata "BALI" adalah...',
        'opsi_a': '24',
        'opsi_b': '12',
        'opsi_c': '48',
        'opsi_d': '6',
        'opsi_e': '3',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Hasil dari log₄ 64 adalah...',
        'opsi_a': '3',
        'opsi_b': '2',
        'opsi_c': '4',
        'opsi_d': '64',
        'opsi_e': '1',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Jika 30x² = 270, maka nilai x adalah...',
        'opsi_a': '3 atau -3',
        'opsi_b': '3 saja',
        'opsi_c': '-3 saja',
        'opsi_d': '9',
        'opsi_e': '6',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Sebuah belah ketupat memiliki diagonal 18 cm dan 24 cm. Luas belah ketupat tersebut adalah...',
        'opsi_a': '216 cm²',
        'opsi_b': '432 cm²',
        'opsi_c': '108 cm²',
        'opsi_d': '324 cm²',
        'opsi_e': '54 cm²',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Hasil dari 140C27 adalah...',
        'opsi_a': '11058688097480800000',
        'opsi_b': '110586880974808000000',
        'opsi_c': '3780',
        'opsi_d': '19600',
        'opsi_e': '1105868809748080000',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Jika 35x - 34 = 270, maka nilai x adalah...',
        'opsi_a': '8',
        'opsi_b': '7',
        'opsi_c': '9',
        'opsi_d': '6',
        'opsi_e': '10',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Banyak cara memilih 33 orang dari 66 orang adalah...',
        'opsi_a': '7219428434016265740',
        'opsi_b': '3609714217008132870',
        'opsi_c': '14438856868032531480',
        'opsi_d': '72194284340162657400000000000000000000000000000000000',
        'opsi_e': '7219428434016265740',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Hasil dari ∛343000 adalah...',
        'opsi_a': '70',
        'opsi_b': '68',
        'opsi_c': '72',
        'opsi_d': '74',
        'opsi_e': '76',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Deret aritmatika: 31, 63, 95, 127, ..., 191. Suku yang hilang adalah...',
        'opsi_a': '159',
        'opsi_b': '157',
        'opsi_c': '161',
        'opsi_d': '158',
        'opsi_e': '160',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Jika 30x + 29y = 300 dan x + y = 35, maka nilai x adalah...',
        'opsi_a': '29',
        'opsi_b': '30',
        'opsi_c': '31',
        'opsi_d': '28',
        'opsi_e': '32',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Sebuah lingkaran memiliki jari-jari 28 cm. Luas lingkaran tersebut adalah...',
        'opsi_a': '2461,76 cm²',
        'opsi_b': '2462 cm²',
        'opsi_c': '2463 cm²',
        'opsi_d': '2460 cm²',
        'opsi_e': '2464 cm²',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Hasil dari 36P32 adalah...',
        'opsi_a': '1838317627528960000',
        'opsi_b': '1296',
        'opsi_c': '183831762752896000',
        'opsi_d': '3676635255057920000',
        'opsi_e': '36766352550579200000',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Jika tan 30° = 1/√3, maka cot 30° adalah...',
        'opsi_a': '√3',
        'opsi_b': '1',
        'opsi_c': '1/2',
        'opsi_d': '√2',
        'opsi_e': '0',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Sebuah kerucut memiliki jari-jari 8 cm dan tinggi 15 cm. Volume kerucut tersebut adalah...',
        'opsi_a': '1004,8 cm³',
        'opsi_b': '2009,6 cm³',
        'opsi_c': '502,4 cm³',
        'opsi_d': '1507,2 cm³',
        'opsi_e': '251,2 cm³',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Banyak cara menyusun huruf dari kata "ACEH" adalah...',
        'opsi_a': '24',
        'opsi_b': '12',
        'opsi_c': '48',
        'opsi_d': '6',
        'opsi_e': '3',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Hasil dari log₂ 32 adalah...',
        'opsi_a': '5',
        'opsi_b': '4',
        'opsi_c': '6',
        'opsi_d': '32',
        'opsi_e': '1',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Jika 31x² = 279, maka nilai x adalah...',
        'opsi_a': '3 atau -3',
        'opsi_b': '3 saja',
        'opsi_c': '-3 saja',
        'opsi_d': '9',
        'opsi_e': '6',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Sebuah jajar genjang memiliki alas 22 cm dan tinggi 14 cm. Luas jajar genjang tersebut adalah...',
        'opsi_a': '308 cm²',
        'opsi_b': '616 cm²',
        'opsi_c': '154 cm²',
        'opsi_d': '462 cm²',
        'opsi_e': '77 cm²',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Hasil dari 145C28 adalah...',
        'opsi_a': '27701143345486600000',
        'opsi_b': '277011433454866000000',
        'opsi_c': '4060',
        'opsi_d': '21025',
        'opsi_e': '2770114334548660000',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Jika 36x - 35 = 289, maka nilai x adalah...',
        'opsi_a': '9',
        'opsi_b': '8',
        'opsi_c': '10',
        'opsi_d': '7',
        'opsi_e': '11',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Banyak cara memilih 34 orang dari 68 orang adalah...',
        'opsi_a': '28434607203081300000',
        'opsi_b': '14217303601540650000',
        'opsi_c': '56869214406162600000',
        'opsi_d': '284346072030813000000000000000000000000000000000000000',
        'opsi_e': '28434607203081300000',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Hasil dari ∛421875 adalah...',
        'opsi_a': '75',
        'opsi_b': '73',
        'opsi_c': '77',
        'opsi_d': '79',
        'opsi_e': '81',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Deret aritmatika: 32, 65, 98, 131, ..., 197. Suku yang hilang adalah...',
        'opsi_a': '164',
        'opsi_b': '162',
        'opsi_c': '166',
        'opsi_d': '163',
        'opsi_e': '165',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Jika 31x + 30y = 310 dan x + y = 36, maka nilai x adalah...',
        'opsi_a': '30',
        'opsi_b': '31',
        'opsi_c': '32',
        'opsi_d': '29',
        'opsi_e': '33',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Sebuah lingkaran memiliki jari-jari 30 cm. Luas lingkaran tersebut adalah...',
        'opsi_a': '2826 cm²',
        'opsi_b': '2827 cm²',
        'opsi_c': '2828 cm²',
        'opsi_d': '2825 cm²',
        'opsi_e': '2829 cm²',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Hasil dari 37P33 adalah...',
        'opsi_a': '946345037544000000',
        'opsi_b': '1369',
        'opsi_c': '94634503754400000',
        'opsi_d': '1892690075088000000',
        'opsi_e': '18926900750880000000',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Jika sec 60° = 2, maka cos 60° adalah...',
        'opsi_a': '1/2',
        'opsi_b': '1',
        'opsi_c': '√3/2',
        'opsi_d': '√2/2',
        'opsi_e': '0',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Sebuah prisma segitiga memiliki alas 12 cm dan tinggi 20 cm. Luas permukaan prisma tersebut adalah...',
        'opsi_a': '720 cm²',
        'opsi_b': '1440 cm²',
        'opsi_c': '360 cm²',
        'opsi_d': '1080 cm²',
        'opsi_e': '180 cm²',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Banyak cara menyusun huruf dari kata "JOGJA" adalah...',
        'opsi_a': '120',
        'opsi_b': '60',
        'opsi_c': '240',
        'opsi_d': '30',
        'opsi_e': '15',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Hasil dari log₃ 81 adalah...',
        'opsi_a': '4',
        'opsi_b': '3',
        'opsi_c': '5',
        'opsi_d': '81',
        'opsi_e': '1',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Jika 32x² = 288, maka nilai x adalah...',
        'opsi_a': '3 atau -3',
        'opsi_b': '3 saja',
        'opsi_c': '-3 saja',
        'opsi_d': '9',
        'opsi_e': '6',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Sebuah trapesium memiliki sisi sejajar 18 cm dan 26 cm, serta tinggi 14 cm. Luas trapesium tersebut adalah...',
        'opsi_a': '308 cm²',
        'opsi_b': '616 cm²',
        'opsi_c': '154 cm²',
        'opsi_d': '462 cm²',
        'opsi_e': '77 cm²',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Hasil dari 150C29 adalah...',
        'opsi_a': '60843824094792400000',
        'opsi_b': '608438240947924000000',
        'opsi_c': '4350',
        'opsi_d': '22500',
        'opsi_e': '6084382409479240000',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Jika 37x - 36 = 306, maka nilai x adalah...',
        'opsi_a': '9',
        'opsi_b': '8',
        'opsi_c': '10',
        'opsi_d': '7',
        'opsi_e': '11',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Banyak cara memilih 35 orang dari 70 orang adalah...',
        'opsi_a': '11271651782981300000',
        'opsi_b': '5635825891490650000',
        'opsi_c': '22543303565962600000',
        'opsi_d': '112716517829813000000000000000000000000000000000000000',
        'opsi_e': '11271651782981300000',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Hasil dari ∛512000 adalah...',
        'opsi_a': '80',
        'opsi_b': '78',
        'opsi_c': '82',
        'opsi_d': '84',
        'opsi_e': '86',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Deret aritmatika: 33, 67, 101, 135, ..., 203. Suku yang hilang adalah...',
        'opsi_a': '169',
        'opsi_b': '167',
        'opsi_c': '171',
        'opsi_d': '168',
        'opsi_e': '170',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Jika 32x + 31y = 320 dan x + y = 37, maka nilai x adalah...',
        'opsi_a': '31',
        'opsi_b': '32',
        'opsi_c': '33',
        'opsi_d': '30',
        'opsi_e': '34',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Sebuah lingkaran memiliki jari-jari 32 cm. Luas lingkaran tersebut adalah...',
        'opsi_a': '3215,36 cm²',
        'opsi_b': '3216 cm²',
        'opsi_c': '3217 cm²',
        'opsi_d': '3214 cm²',
        'opsi_e': '3218 cm²',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Hasil dari 38P34 adalah...',
        'opsi_a': '208606560768000000',
        'opsi_b': '1444',
        'opsi_c': '20860656076800000',
        'opsi_d': '417213121536000000',
        'opsi_e': '41721312153600000000',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Jika csc 30° = 2, maka sin 30° adalah...',
        'opsi_a': '1/2',
        'opsi_b': '1',
        'opsi_c': '√3/2',
        'opsi_d': '√2/2',
        'opsi_e': '0',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Sebuah bola memiliki jari-jari 9 cm. Volume bola tersebut adalah...',
        'opsi_a': '3052,08 cm³',
        'opsi_b': '6104,16 cm³',
        'opsi_c': '1526,04 cm³',
        'opsi_d': '4578,12 cm³',
        'opsi_e': '763,02 cm³',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Banyak cara menyusun huruf dari kata "SURABAYA" adalah...',
        'opsi_a': '40320',
        'opsi_b': '20160',
        'opsi_c': '80640',
        'opsi_d': '10080',
        'opsi_e': '5040',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Hasil dari log₅ 125 adalah...',
        'opsi_a': '3',
        'opsi_b': '2',
        'opsi_c': '4',
        'opsi_d': '125',
        'opsi_e': '1',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Jika 33x² = 297, maka nilai x adalah...',
        'opsi_a': '3 atau -3',
        'opsi_b': '3 saja',
        'opsi_c': '-3 saja',
        'opsi_d': '9',
        'opsi_e': '6',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Sebuah layang-layang memiliki diagonal 20 cm dan 28 cm. Luas layang-layang tersebut adalah...',
        'opsi_a': '280 cm²',
        'opsi_b': '560 cm²',
        'opsi_c': '140 cm²',
        'opsi_d': '420 cm²',
        'opsi_e': '70 cm²',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Hasil dari 155C30 adalah...',
        'opsi_a': '132835563870730000000',
        'opsi_b': '1328355638707300000000',
        'opsi_c': '4650',
        'opsi_d': '24025',
        'opsi_e': '13283556387073000000',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Jika 38x - 37 = 343, maka nilai x adalah...',
        'opsi_a': '10',
        'opsi_b': '9',
        'opsi_c': '11',
        'opsi_d': '8',
        'opsi_e': '12',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Banyak cara memilih 36 orang dari 72 orang adalah...',
        'opsi_a': '17636880835897200000',
        'opsi_b': '8818440417948600000',
        'opsi_c': '35273761671794400000',
        'opsi_d': '176368808358972000000000000000000000000000000000000000',
        'opsi_e': '17636880835897200000',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Hasil dari ∛729000 adalah...',
        'opsi_a': '90',
        'opsi_b': '88',
        'opsi_c': '92',
        'opsi_d': '94',
        'opsi_e': '96',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Deret aritmatika: 34, 69, 104, 139, ..., 209. Suku yang hilang adalah...',
        'opsi_a': '174',
        'opsi_b': '172',
        'opsi_c': '176',
        'opsi_d': '173',
        'opsi_e': '175',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Jika 33x + 32y = 330 dan x + y = 38, maka nilai x adalah...',
        'opsi_a': '32',
        'opsi_b': '33',
        'opsi_c': '34',
        'opsi_d': '31',
        'opsi_e': '35',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Sebuah lingkaran memiliki jari-jari 34 cm. Luas lingkaran tersebut adalah...',
        'opsi_a': '3628,96 cm²',
        'opsi_b': '3629 cm²',
        'opsi_c': '3630 cm²',
        'opsi_d': '3627 cm²',
        'opsi_e': '3631 cm²',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Hasil dari 39P35 adalah...',
        'opsi_a': '236497990075200000',
        'opsi_b': '1521',
        'opsi_c': '23649799007520000',
        'opsi_d': '472995980150400000',
        'opsi_e': '47299598015040000000',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Jika sin 45° = 1/√2, maka cos 45° adalah...',
        'opsi_a': '1/√2',
        'opsi_b': '1',
        'opsi_c': '√3/2',
        'opsi_d': '1/2',
        'opsi_e': '0',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Sebuah tabung memiliki jari-jari 7 cm dan tinggi 20 cm. Volume tabung tersebut adalah...',
        'opsi_a': '3077,2 cm³',
        'opsi_b': '6154,4 cm³',
        'opsi_c': '1538,6 cm³',
        'opsi_d': '4615,8 cm³',
        'opsi_e': '769,3 cm³',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Banyak cara menyusun huruf dari kata "BALI" adalah...',
        'opsi_a': '24',
        'opsi_b': '12',
        'opsi_c': '48',
        'opsi_d': '6',
        'opsi_e': '3',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Hasil dari log₄ 64 adalah...',
        'opsi_a': '3',
        'opsi_b': '2',
        'opsi_c': '4',
        'opsi_d': '64',
        'opsi_e': '1',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Jika 34x² = 306, maka nilai x adalah...',
        'opsi_a': '3 atau -3',
        'opsi_b': '3 saja',
        'opsi_c': '-3 saja',
        'opsi_d': '9',
        'opsi_e': '6',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Sebuah belah ketupat memiliki diagonal 16 cm dan 24 cm. Luas belah ketupat tersebut adalah...',
        'opsi_a': '192 cm²',
        'opsi_b': '384 cm²',
        'opsi_c': '96 cm²',
        'opsi_d': '288 cm²',
        'opsi_e': '48 cm²',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Hasil dari 160C31 adalah...',
        'opsi_a': '253861272491696000000',
        'opsi_b': '2538612724916960000000',
        'opsi_c': '4960',
        'opsi_d': '25600',
        'opsi_e': '25386127249169600000',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Jika 39x - 38 = 380, maka nilai x adalah...',
        'opsi_a': '11',
        'opsi_b': '10',
        'opsi_c': '12',
        'opsi_d': '9',
        'opsi_e': '13',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Banyak cara memilih 37 orang dari 74 orang adalah...',
        'opsi_a': '27644763081282800000',
        'opsi_b': '13822381540641400000',
        'opsi_c': '55289526162565600000',
        'opsi_d': '276447630812828000000000000000000000000000000000000000',
        'opsi_e': '27644763081282800000',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Hasil dari ∛1000000 adalah...',
        'opsi_a': '100',
        'opsi_b': '98',
        'opsi_c': '102',
        'opsi_d': '104',
        'opsi_e': '106',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Deret aritmatika: 35, 71, 107, 143, ..., 215. Suku yang hilang adalah...',
        'opsi_a': '179',
        'opsi_b': '177',
        'opsi_c': '181',
        'opsi_d': '178',
        'opsi_e': '180',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Jika 34x + 33y = 340 dan x + y = 39, maka nilai x adalah...',
        'opsi_a': '33',
        'opsi_b': '34',
        'opsi_c': '35',
        'opsi_d': '32',
        'opsi_e': '36',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Sebuah lingkaran memiliki jari-jari 36 cm. Luas lingkaran tersebut adalah...',
        'opsi_a': '4069,44 cm²',
        'opsi_b': '4070 cm²',
        'opsi_c': '4071 cm²',
        'opsi_d': '4068 cm²',
        'opsi_e': '4072 cm²',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Hasil dari 40P36 adalah...',
        'opsi_a': '58947368544000000',
        'opsi_b': '1600',
        'opsi_c': '5894736854400000',
        'opsi_d': '117894737088000000',
        'opsi_e': '11789473708800000000',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Jika cos 60° = 1/2, maka sin 60° adalah...',
        'opsi_a': '√3/2',
        'opsi_b': '1',
        'opsi_c': '1/2',
        'opsi_d': '1/√2',
        'opsi_e': '0',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Sebuah limas segiempat memiliki alas 10 cm dan tinggi 18 cm. Volume limas tersebut adalah...',
        'opsi_a': '600 cm³',
        'opsi_b': '1200 cm³',
        'opsi_c': '300 cm³',
        'opsi_d': '900 cm³',
        'opsi_e': '150 cm³',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Banyak cara menyusun huruf dari kata "JAKARTA" adalah...',
        'opsi_a': '5040',
        'opsi_b': '2520',
        'opsi_c': '10080',
        'opsi_d': '1260',
        'opsi_e': '630',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Hasil dari log₁₀ 1000 adalah...',
        'opsi_a': '3',
        'opsi_b': '2',
        'opsi_c': '4',
        'opsi_d': '1000',
        'opsi_e': '1',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Jika 35x² = 315, maka nilai x adalah...',
        'opsi_a': '3 atau -3',
        'opsi_b': '3 saja',
        'opsi_c': '-3 saja',
        'opsi_d': '9',
        'opsi_e': '6',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Sebuah segi enam beraturan memiliki sisi 8 cm. Luas segi enam tersebut adalah...',
        'opsi_a': '166,28 cm²',
        'opsi_b': '332,56 cm²',
        'opsi_c': '83,14 cm²',
        'opsi_d': '249,42 cm²',
        'opsi_e': '41,57 cm²',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Hasil dari 165C32 adalah...',
        'opsi_a': '482031690914760000000',
        'opsi_b': '4820316909147600000000',
        'opsi_c': '5280',
        'opsi_d': '27225',
        'opsi_e': '48203169091476000000',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Jika 40x - 39 = 401, maka nilai x adalah...',
        'opsi_a': '11',
        'opsi_b': '10',
        'opsi_c': '12',
        'opsi_d': '9',
        'opsi_e': '13',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Banyak cara memilih 38 orang dari 76 orang adalah...',
        'opsi_a': '43228296267559700000',
        'opsi_b': '21614148133779850000',
        'opsi_c': '86456592535119400000',
        'opsi_d': '432282962675597000000000000000000000000000000000000000',
        'opsi_e': '43228296267559700000',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Hasil dari ∛1728000 adalah...',
        'opsi_a': '120',
        'opsi_b': '118',
        'opsi_c': '122',
        'opsi_d': '124',
        'opsi_e': '126',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Deret aritmatika: 36, 73, 110, 147, ..., 221. Suku yang hilang adalah...',
        'opsi_a': '184',
        'opsi_b': '182',
        'opsi_c': '186',
        'opsi_d': '183',
        'opsi_e': '185',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Jika 35x + 34y = 350 dan x + y = 40, maka nilai x adalah...',
        'opsi_a': '34',
        'opsi_b': '35',
        'opsi_c': '36',
        'opsi_d': '33',
        'opsi_e': '37',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Sebuah lingkaran memiliki jari-jari 38 cm. Luas lingkaran tersebut adalah...',
        'opsi_a': '4534,16 cm²',
        'opsi_b': '4535 cm²',
        'opsi_c': '4536 cm²',
        'opsi_d': '4533 cm²',
        'opsi_e': '4537 cm²',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Hasil dari 41P37 adalah...',
        'opsi_a': '3244867276800000',
        'opsi_b': '1681',
        'opsi_c': '324486727680000',
        'opsi_d': '6489734553600000',
        'opsi_e': '648973455360000000',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Jika tan 45° = 1, maka cot 45° adalah...',
        'opsi_a': '1',
        'opsi_b': '0',
        'opsi_c': '√3',
        'opsi_d': '1/√3',
        'opsi_e': '∞',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Sebuah kerucut memiliki jari-jari 8 cm dan tinggi 15 cm. Volume kerucut tersebut adalah...',
        'opsi_a': '1004,8 cm³',
        'opsi_b': '2009,6 cm³',
        'opsi_c': '502,4 cm³',
        'opsi_d': '1507,2 cm³',
        'opsi_e': '251,2 cm³',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Banyak cara menyusun huruf dari kata "SURABAYA" adalah...',
        'opsi_a': '40320',
        'opsi_b': '20160',
        'opsi_c': '80640',
        'opsi_d': '10080',
        'opsi_e': '5040',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Hasil dari log₂ 32 adalah...',
        'opsi_a': '5',
        'opsi_b': '4',
        'opsi_c': '6',
        'opsi_d': '32',
        'opsi_e': '1',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Jika 36x² = 324, maka nilai x adalah...',
        'opsi_a': '3 atau -3',
        'opsi_b': '3 saja',
        'opsi_c': '-3 saja',
        'opsi_d': '9',
        'opsi_e': '6',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Sebuah trapesium memiliki tinggi 12 cm dan panjang sisi sejajar 15 cm dan 25 cm. Luas trapesium tersebut adalah...',
        'opsi_a': '240 cm²',
        'opsi_b': '480 cm²',
        'opsi_c': '120 cm²',
        'opsi_d': '360 cm²',
        'opsi_e': '60 cm²',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Hasil dari 170C33 adalah...',
        'opsi_a': '877461648068090000000',
        'opsi_b': '8774616480680900000000',
        'opsi_c': '5610',
        'opsi_d': '28900',
        'opsi_e': '87746164806809000000',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Jika 41x - 40 = 410, maka nilai x adalah...',
        'opsi_a': '11',
        'opsi_b': '10',
        'opsi_c': '12',
        'opsi_d': '9',
        'opsi_e': '13',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Banyak cara memilih 39 orang dari 78 orang adalah...',
        'opsi_a': '10584835893684000000',
        'opsi_b': '5292417946842000000',
        'opsi_c': '21169671787368000000',
        'opsi_d': '105848358936840000000000000000000000000000000000000000',
        'opsi_e': '10584835893684000000',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Hasil dari ∛2985984 adalah...',
        'opsi_a': '144',
        'opsi_b': '142',
        'opsi_c': '146',
        'opsi_d': '148',
        'opsi_e': '150',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Deret aritmatika: 37, 75, 113, 151, ..., 227. Suku yang hilang adalah...',
        'opsi_a': '189',
        'opsi_b': '187',
        'opsi_c': '191',
        'opsi_d': '188',
        'opsi_e': '190',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Jika 36x + 35y = 360 dan x + y = 41, maka nilai x adalah...',
        'opsi_a': '35',
        'opsi_b': '36',
        'opsi_c': '37',
        'opsi_d': '34',
        'opsi_e': '38',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Sebuah lingkaran memiliki jari-jari 40 cm. Luas lingkaran tersebut adalah...',
        'opsi_a': '5024 cm²',
        'opsi_b': '5025 cm²',
        'opsi_c': '5026 cm²',
        'opsi_d': '5023 cm²',
        'opsi_e': '5027 cm²',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Hasil dari 42P38 adalah...',
        'opsi_a': '358097664000000',
        'opsi_b': '1764',
        'opsi_c': '35809766400000',
        'opsi_d': '716195328000000',
        'opsi_e': '71619532800000000',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Jika sec 60° = 2, maka cos 60° adalah...',
        'opsi_a': '1/2',
        'opsi_b': '1',
        'opsi_c': '√3/2',
        'opsi_d': '1/√2',
        'opsi_e': '0',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Sebuah bola memiliki jari-jari 9 cm. Volume bola tersebut adalah...',
        'opsi_a': '3052,08 cm³',
        'opsi_b': '6104,16 cm³',
        'opsi_c': '1526,04 cm³',
        'opsi_d': '4578,12 cm³',
        'opsi_e': '763,02 cm³',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Banyak cara menyusun huruf dari kata "MAKASSAR" adalah...',
        'opsi_a': '40320',
        'opsi_b': '20160',
        'opsi_c': '80640',
        'opsi_d': '10080',
        'opsi_e': '5040',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Hasil dari log₅ 125 adalah...',
        'opsi_a': '3',
        'opsi_b': '2',
        'opsi_c': '4',
        'opsi_d': '125',
        'opsi_e': '1',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Jika 37x² = 333, maka nilai x adalah...',
        'opsi_a': '3 atau -3',
        'opsi_b': '3 saja',
        'opsi_c': '-3 saja',
        'opsi_d': '9',
        'opsi_e': '6',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Sebuah jajargenjang memiliki alas 18 cm dan tinggi 14 cm. Luas jajargenjang tersebut adalah...',
        'opsi_a': '252 cm²',
        'opsi_b': '504 cm²',
        'opsi_c': '126 cm²',
        'opsi_d': '378 cm²',
        'opsi_e': '63 cm²',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Hasil dari 175C34 adalah...',
        'opsi_a': '156620236828660000000',
        'opsi_b': '1566202368286600000000',
        'opsi_c': '5950',
        'opsi_d': '30625',
        'opsi_e': '15662023682866000000',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Jika 42x - 41 = 420, maka nilai x adalah...',
        'opsi_a': '11',
        'opsi_b': '10',
        'opsi_c': '12',
        'opsi_d': '9',
        'opsi_e': '13',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Banyak cara memilih 40 orang dari 80 orang adalah...',
        'opsi_a': '38935562081186800000',
        'opsi_b': '19467781040593400000',
        'opsi_c': '77871124162373600000',
        'opsi_d': '389355620811868000000000000000000000000000000000000000',
        'opsi_e': '38935562081186800000',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Hasil dari ∛5120000 adalah...',
        'opsi_a': '172',
        'opsi_b': '170',
        'opsi_c': '174',
        'opsi_d': '176',
        'opsi_e': '178',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Deret aritmatika: 38, 77, 116, 155, ..., 233. Suku yang hilang adalah...',
        'opsi_a': '194',
        'opsi_b': '192',
        'opsi_c': '196',
        'opsi_d': '193',
        'opsi_e': '195',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Jika 37x + 36y = 370 dan x + y = 42, maka nilai x adalah...',
        'opsi_a': '36',
        'opsi_b': '37',
        'opsi_c': '38',
        'opsi_d': '35',
        'opsi_e': '39',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Sebuah lingkaran memiliki jari-jari 42 cm. Luas lingkaran tersebut adalah...',
        'opsi_a': '5538,96 cm²',
        'opsi_b': '5539 cm²',
        'opsi_c': '5540 cm²',
        'opsi_d': '5537 cm²',
        'opsi_e': '5541 cm²',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Hasil dari 43P39 adalah...',
        'opsi_a': '22704681600000',
        'opsi_b': '1849',
        'opsi_c': '2270468160000',
        'opsi_d': '45409363200000',
        'opsi_e': '4540936320000000',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Jika csc 45° = √2, maka sin 45° adalah...',
        'opsi_a': '1/√2',
        'opsi_b': '1',
        'opsi_c': '√3/2',
        'opsi_d': '1/2',
        'opsi_e': '0',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Sebuah bola memiliki jari-jari 10 cm. Volume bola tersebut adalah...',
        'opsi_a': '4186,67 cm³',
        'opsi_b': '8373,34 cm³',
        'opsi_c': '2093,34 cm³',
        'opsi_d': '6280,01 cm³',
        'opsi_e': '1046,67 cm³',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Banyak cara menyusun huruf dari kata "MEDAN" adalah...',
        'opsi_a': '120',
        'opsi_b': '60',
        'opsi_c': '240',
        'opsi_d': '30',
        'opsi_e': '15',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Hasil dari log₃ 81 adalah...',
        'opsi_a': '4',
        'opsi_b': '3',
        'opsi_c': '5',
        'opsi_d': '81',
        'opsi_e': '1',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Jika 38x² = 342, maka nilai x adalah...',
        'opsi_a': '3 atau -3',
        'opsi_b': '3 saja',
        'opsi_c': '-3 saja',
        'opsi_d': '9',
        'opsi_e': '6',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Sebuah layang-layang memiliki diagonal 20 cm dan 32 cm. Luas layang-layang tersebut adalah...',
        'opsi_a': '320 cm²',
        'opsi_b': '640 cm²',
        'opsi_c': '160 cm²',
        'opsi_d': '480 cm²',
        'opsi_e': '80 cm²',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Hasil dari 180C35 adalah...',
        'opsi_a': '516279967496780000000',
        'opsi_b': '5162799674967800000000',
        'opsi_c': '6300',
        'opsi_d': '32400',
        'opsi_e': '51627996749678000000',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Jika 43x - 42 = 430, maka nilai x adalah...',
        'opsi_a': '11',
        'opsi_b': '10',
        'opsi_c': '12',
        'opsi_d': '9',
        'opsi_e': '13',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Banyak cara memilih 41 orang dari 82 orang adalah...',
        'opsi_a': '69976554075871200000',
        'opsi_b': '34988277037935600000',
        'opsi_c': '139953108151742400000',
        'opsi_d': '699765540758712000000000000000000000000000000000000000',
        'opsi_e': '69976554075871200000',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Hasil dari ∛7786880 adalah...',
        'opsi_a': '198',
        'opsi_b': '196',
        'opsi_c': '200',
        'opsi_d': '202',
        'opsi_e': '204',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Deret aritmatika: 39, 79, 119, 159, ..., 239. Suku yang hilang adalah...',
        'opsi_a': '199',
        'opsi_b': '197',
        'opsi_c': '201',
        'opsi_d': '198',
        'opsi_e': '200',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Jika 38x + 37y = 380 dan x + y = 43, maka nilai x adalah...',
        'opsi_a': '37',
        'opsi_b': '38',
        'opsi_c': '39',
        'opsi_d': '36',
        'opsi_e': '40',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Sebuah lingkaran memiliki jari-jari 44 cm. Luas lingkaran tersebut adalah...',
        'opsi_a': '6079,04 cm²',
        'opsi_b': '6080 cm²',
        'opsi_c': '6081 cm²',
        'opsi_d': '6078 cm²',
        'opsi_e': '6082 cm²',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Hasil dari 44P40 adalah...',
        'opsi_a': '44732934400000',
        'opsi_b': '1936',
        'opsi_c': '4473293440000',
        'opsi_d': '89465868800000',
        'opsi_e': '8946586880000000',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Jika sin 30° = 1/2, maka cos 30° adalah...',
        'opsi_a': '√3/2',
        'opsi_b': '1',
        'opsi_c': '1/2',
        'opsi_d': '1/√2',
        'opsi_e': '0',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Sebuah tabung memiliki jari-jari 7 cm dan tinggi 20 cm. Volume tabung tersebut adalah...',
        'opsi_a': '3077,2 cm³',
        'opsi_b': '6154,4 cm³',
        'opsi_c': '1538,6 cm³',
        'opsi_d': '4615,8 cm³',
        'opsi_e': '769,3 cm³',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Banyak cara menyusun huruf dari kata "SURABAYA" adalah...',
        'opsi_a': '40320',
        'opsi_b': '20160',
        'opsi_c': '80640',
        'opsi_d': '10080',
        'opsi_e': '5040',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Hasil dari log₇ 343 adalah...',
        'opsi_a': '3',
        'opsi_b': '2',
        'opsi_c': '4',
        'opsi_d': '343',
        'opsi_e': '1',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Jika 39x² = 351, maka nilai x adalah...',
        'opsi_a': '3 atau -3',
        'opsi_b': '3 saja',
        'opsi_c': '-3 saja',
        'opsi_d': '9',
        'opsi_e': '6',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Sebuah belah ketupat memiliki diagonal 24 cm dan 32 cm. Luas belah ketupat tersebut adalah...',
        'opsi_a': '384 cm²',
        'opsi_b': '768 cm²',
        'opsi_c': '192 cm²',
        'opsi_d': '576 cm²',
        'opsi_e': '96 cm²',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Hasil dari 185C36 adalah...',
        'opsi_a': '249864672085140000000',
        'opsi_b': '2498646720851400000000',
        'opsi_c': '6660',
        'opsi_d': '34225',
        'opsi_e': '24986467208514000000',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Jika 44x - 43 = 440, maka nilai x adalah...',
        'opsi_a': '11',
        'opsi_b': '10',
        'opsi_c': '12',
        'opsi_d': '9',
        'opsi_e': '13',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Banyak cara memilih 42 orang dari 84 orang adalah...',
        'opsi_a': '46340976177978000000',
        'opsi_b': '23170488088989000000',
        'opsi_c': '92681952355956000000',
        'opsi_d': '463409761779780000000000000000000000000000000000000000',
        'opsi_e': '46340976177978000000',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Hasil dari ∛12167000 adalah...',
        'opsi_a': '230',
        'opsi_b': '228',
        'opsi_c': '232',
        'opsi_d': '234',
        'opsi_e': '236',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Deret aritmatika: 40, 81, 122, 163, ..., 245. Suku yang hilang adalah...',
        'opsi_a': '204',
        'opsi_b': '202',
        'opsi_c': '206',
        'opsi_d': '203',
        'opsi_e': '205',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Jika 39x + 38y = 390 dan x + y = 44, maka nilai x adalah...',
        'opsi_a': '38',
        'opsi_b': '39',
        'opsi_c': '40',
        'opsi_d': '37',
        'opsi_e': '41',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Sebuah lingkaran memiliki jari-jari 46 cm. Luas lingkaran tersebut adalah...',
        'opsi_a': '6644,24 cm²',
        'opsi_b': '6645 cm²',
        'opsi_c': '6646 cm²',
        'opsi_d': '6643 cm²',
        'opsi_e': '6647 cm²',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Hasil dari 45P41 adalah...',
        'opsi_a': '11906283200000',
        'opsi_b': '2025',
        'opsi_c': '1190628320000',
        'opsi_d': '23812566400000',
        'opsi_e': '2381256640000000',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Jika tan 45° = 1, maka cot 45° adalah...',
        'opsi_a': '1',
        'opsi_b': '0',
        'opsi_c': '√3',
        'opsi_d': '1/√3',
        'opsi_e': '∞',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Sebuah kerucut memiliki jari-jari 8 cm dan tinggi 15 cm. Volume kerucut tersebut adalah...',
        'opsi_a': '1004,8 cm³',
        'opsi_b': '2009,6 cm³',
        'opsi_c': '502,4 cm³',
        'opsi_d': '1507,2 cm³',
        'opsi_e': '251,2 cm³',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Banyak cara menyusun huruf dari kata "YOGYAKARTA" adalah...',
        'opsi_a': '907200',
        'opsi_b': '453600',
        'opsi_c': '1814400',
        'opsi_d': '226800',
        'opsi_e': '113400',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Hasil dari log₂ 1024 adalah...',
        'opsi_a': '10',
        'opsi_b': '8',
        'opsi_c': '12',
        'opsi_d': '1024',
        'opsi_e': '1',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Jika 40x² = 360, maka nilai x adalah...',
        'opsi_a': '3 atau -3',
        'opsi_b': '3 saja',
        'opsi_c': '-3 saja',
        'opsi_d': '9',
        'opsi_e': '6',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Sebuah trapesium memiliki sisi sejajar 20 cm dan 30 cm, tinggi 16 cm. Luas trapesium tersebut adalah...',
        'opsi_a': '400 cm²',
        'opsi_b': '800 cm²',
        'opsi_c': '200 cm²',
        'opsi_d': '600 cm²',
        'opsi_e': '100 cm²',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Hasil dari 190C37 adalah...',
        'opsi_a': '267796972844620000000',
        'opsi_b': '2677969728446200000000',
        'opsi_c': '7030',
        'opsi_d': '36100',
        'opsi_e': '26779697284462000000',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Jika 45x - 44 = 450, maka nilai x adalah...',
        'opsi_a': '11',
        'opsi_b': '10',
        'opsi_c': '12',
        'opsi_d': '9',
        'opsi_e': '13',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Banyak cara memilih 43 orang dari 86 orang adalah...',
        'opsi_a': '15665189573272000000',
        'opsi_b': '7832594786636000000',
        'opsi_c': '31330379146544000000',
        'opsi_d': '156651895732720000000000000000000000000000000000000000',
        'opsi_e': '15665189573272000000',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Hasil dari ∛18608700 adalah...',
        'opsi_a': '265',
        'opsi_b': '263',
        'opsi_c': '267',
        'opsi_d': '269',
        'opsi_e': '271',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Deret aritmatika: 41, 83, 125, 167, ..., 251. Suku yang hilang adalah...',
        'opsi_a': '209',
        'opsi_b': '207',
        'opsi_c': '211',
        'opsi_d': '208',
        'opsi_e': '210',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Jika 40x + 39y = 400 dan x + y = 45, maka nilai x adalah...',
        'opsi_a': '39',
        'opsi_b': '40',
        'opsi_c': '41',
        'opsi_d': '38',
        'opsi_e': '42',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Sebuah lingkaran memiliki jari-jari 48 cm. Luas lingkaran tersebut adalah...',
        'opsi_a': '7234,56 cm²',
        'opsi_b': '7235 cm²',
        'opsi_c': '7236 cm²',
        'opsi_d': '7233 cm²',
        'opsi_e': '7237 cm²',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Hasil dari 46P42 adalah...',
        'opsi_a': '9350281600000',
        'opsi_b': '2116',
        'opsi_c': '935028160000',
        'opsi_d': '18700563200000',
        'opsi_e': '1870056320000000',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Jika sec 60° = 2, maka cos 60° adalah...',
        'opsi_a': '1/2',
        'opsi_b': '1',
        'opsi_c': '√3/2',
        'opsi_d': '1/√2',
        'opsi_e': '0',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Sebuah prisma segitiga memiliki alas 12 cm, tinggi alas 8 cm, dan tinggi prisma 25 cm. Volume prisma tersebut adalah...',
        'opsi_a': '1200 cm³',
        'opsi_b': '2400 cm³',
        'opsi_c': '600 cm³',
        'opsi_d': '1800 cm³',
        'opsi_e': '300 cm³',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Banyak cara menyusun huruf dari kata "MAKASSAR" adalah...',
        'opsi_a': '2520',
        'opsi_b': '1260',
        'opsi_c': '5040',
        'opsi_d': '630',
        'opsi_e': '315',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Hasil dari log₅ 3125 adalah...',
        'opsi_a': '5',
        'opsi_b': '4',
        'opsi_c': '6',
        'opsi_d': '3125',
        'opsi_e': '1',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Jika 41x² = 369, maka nilai x adalah...',
        'opsi_a': '3 atau -3',
        'opsi_b': '3 saja',
        'opsi_c': '-3 saja',
        'opsi_d': '9',
        'opsi_e': '6',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Sebuah segitiga memiliki alas 18 cm dan tinggi 16 cm. Luas segitiga tersebut adalah...',
        'opsi_a': '144 cm²',
        'opsi_b': '288 cm²',
        'opsi_c': '72 cm²',
        'opsi_d': '216 cm²',
        'opsi_e': '36 cm²',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Hasil dari 195C38 adalah...',
        'opsi_a': '323428676696640000000',
        'opsi_b': '3234286766966400000000',
        'opsi_c': '7410',
        'opsi_d': '38025',
        'opsi_e': '32342867669664000000',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Jika 46x - 45 = 460, maka nilai x adalah...',
        'opsi_a': '11',
        'opsi_b': '10',
        'opsi_c': '12',
        'opsi_d': '9',
        'opsi_e': '13',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Banyak cara memilih 44 orang dari 88 orang adalah...',
        'opsi_a': '52739670543504000000',
        'opsi_b': '26369835271752000000',
        'opsi_c': '105479341087008000000',
        'opsi_d': '527396705435040000000000000000000000000000000000000000',
        'opsi_e': '52739670543504000000',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Hasil dari ∛26833600 adalah...',
        'opsi_a': '300',
        'opsi_b': '298',
        'opsi_c': '302',
        'opsi_d': '304',
        'opsi_e': '306',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Deret aritmatika: 42, 85, 128, 171, ..., 257. Suku yang hilang adalah...',
        'opsi_a': '214',
        'opsi_b': '212',
        'opsi_c': '216',
        'opsi_d': '213',
        'opsi_e': '215',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Jika 41x + 40y = 410 dan x + y = 46, maka nilai x adalah...',
        'opsi_a': '40',
        'opsi_b': '41',
        'opsi_c': '42',
        'opsi_d': '39',
        'opsi_e': '43',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Sebuah lingkaran memiliki jari-jari 50 cm. Luas lingkaran tersebut adalah...',
        'opsi_a': '7850 cm²',
        'opsi_b': '7851 cm²',
        'opsi_c': '7852 cm²',
        'opsi_d': '7849 cm²',
        'opsi_e': '7853 cm²',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Hasil dari 47P43 adalah...',
        'opsi_a': '7358427200000',
        'opsi_b': '2209',
        'opsi_c': '735842720000',
        'opsi_d': '14716854400000',
        'opsi_e': '1471685440000000',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Jika cosec 30° = 2, maka sin 30° adalah...',
        'opsi_a': '1/2',
        'opsi_b': '1',
        'opsi_c': '√3/2',
        'opsi_d': '1/√2',
        'opsi_e': '0',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Sebuah limas segi empat memiliki alas 20 cm, lebar 16 cm, dan tinggi 30 cm. Volume limas tersebut adalah...',
        'opsi_a': '3200 cm³',
        'opsi_b': '6400 cm³',
        'opsi_c': '1600 cm³',
        'opsi_d': '4800 cm³',
        'opsi_e': '800 cm³',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Banyak cara menyusun huruf dari kata "SURABAYA" adalah...',
        'opsi_a': '10080',
        'opsi_b': '5040',
        'opsi_c': '20160',
        'opsi_d': '2520',
        'opsi_e': '1260',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Hasil dari log₇ 343 adalah...',
        'opsi_a': '3',
        'opsi_b': '2',
        'opsi_c': '4',
        'opsi_d': '343',
        'opsi_e': '1',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Jika 42x² = 378, maka nilai x adalah...',
        'opsi_a': '3 atau -3',
        'opsi_b': '3 saja',
        'opsi_c': '-3 saja',
        'opsi_d': '9',
        'opsi_e': '6',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Sebuah jajargenjang memiliki alas 20 cm dan tinggi 18 cm. Luas jajargenjang tersebut adalah...',
        'opsi_a': '360 cm²',
        'opsi_b': '720 cm²',
        'opsi_c': '180 cm²',
        'opsi_d': '540 cm²',
        'opsi_e': '90 cm²',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Hasil dari 200C39 adalah...',
        'opsi_a': '735884990972240000000',
        'opsi_b': '7358849909722400000000',
        'opsi_c': '7800',
        'opsi_d': '40000',
        'opsi_e': '73588499097224000000',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Jika 47x - 46 = 470, maka nilai x adalah...',
        'opsi_a': '11',
        'opsi_b': '10',
        'opsi_c': '12',
        'opsi_d': '9',
        'opsi_e': '13',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Banyak cara memilih 45 orang dari 90 orang adalah...',
        'opsi_a': '59969946695040000000',
        'opsi_b': '29984973347520000000',
        'opsi_c': '119939893390080000000',
        'opsi_d': '599699466950400000000000000000000000000000000000000000',
        'opsi_e': '59969946695040000000',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Hasil dari ∛39304000 adalah...',
        'opsi_a': '340',
        'opsi_b': '338',
        'opsi_c': '342',
        'opsi_d': '344',
        'opsi_e': '346',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Deret aritmatika: 43, 87, 131, 175, ..., 263. Suku yang hilang adalah...',
        'opsi_a': '219',
        'opsi_b': '217',
        'opsi_c': '221',
        'opsi_d': '218',
        'opsi_e': '220',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Jika 42x + 41y = 420 dan x + y = 47, maka nilai x adalah...',
        'opsi_a': '41',
        'opsi_b': '42',
        'opsi_c': '43',
        'opsi_d': '40',
        'opsi_e': '44',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Sebuah lingkaran memiliki jari-jari 52 cm. Luas lingkaran tersebut adalah...',
        'opsi_a': '8494,88 cm²',
        'opsi_b': '8495 cm²',
        'opsi_c': '8496 cm²',
        'opsi_d': '8493 cm²',
        'opsi_e': '8497 cm²',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Hasil dari 48P44 adalah...',
        'opsi_a': '4550856320000',
        'opsi_b': '2304',
        'opsi_c': '455085632000',
        'opsi_d': '91017126400000',
        'opsi_e': '9101712640000000',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Jika sin 90° = 1, maka cos 90° adalah...',
        'opsi_a': '0',
        'opsi_b': '1',
        'opsi_c': '√3/2',
        'opsi_d': '1/√2',
        'opsi_e': '1/2',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Sebuah tabung memiliki jari-jari 14 cm dan tinggi 30 cm. Volume tabung tersebut adalah...',
        'opsi_a': '18463,2 cm³',
        'opsi_b': '36926,4 cm³',
        'opsi_c': '9231,6 cm³',
        'opsi_d': '27694,8 cm³',
        'opsi_e': '4615,8 cm³',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Banyak cara menyusun huruf dari kata "BANDUNG" adalah...',
        'opsi_a': '720',
        'opsi_b': '360',
        'opsi_c': '1440',
        'opsi_d': '180',
        'opsi_e': '90',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Hasil dari log₁₀ 1000 adalah...',
        'opsi_a': '3',
        'opsi_b': '2',
        'opsi_c': '4',
        'opsi_d': '1000',
        'opsi_e': '1',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Jika 43x² = 387, maka nilai x adalah...',
        'opsi_a': '3 atau -3',
        'opsi_b': '3 saja',
        'opsi_c': '-3 saja',
        'opsi_d': '9',
        'opsi_e': '6',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Sebuah belah ketupat memiliki diagonal 24 cm dan 32 cm. Luas belah ketupat tersebut adalah...',
        'opsi_a': '384 cm²',
        'opsi_b': '768 cm²',
        'opsi_c': '192 cm²',
        'opsi_d': '576 cm²',
        'opsi_e': '96 cm²',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Hasil dari 205C40 adalah...',
        'opsi_a': '198659016648890000000',
        'opsi_b': '1986590166488900000000',
        'opsi_c': '8200',
        'opsi_d': '42025',
        'opsi_e': '19865901664889000000',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Jika 48x - 47 = 480, maka nilai x adalah...',
        'opsi_a': '11',
        'opsi_b': '10',
        'opsi_c': '12',
        'opsi_d': '9',
        'opsi_e': '13',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Banyak cara memilih 46 orang dari 92 orang adalah...',
        'opsi_a': '69468772743200000000',
        'opsi_b': '34734386371600000000',
        'opsi_c': '138937545486400000000',
        'opsi_d': '694687727432000000000000000000000000000000000000000000',
        'opsi_e': '69468772743200000000',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Hasil dari ∛52680200 adalah...',
        'opsi_a': '375',
        'opsi_b': '373',
        'opsi_c': '377',
        'opsi_d': '379',
        'opsi_e': '381',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Deret aritmatika: 44, 89, 134, 179, ..., 269. Suku yang hilang adalah...',
        'opsi_a': '224',
        'opsi_b': '222',
        'opsi_c': '226',
        'opsi_d': '223',
        'opsi_e': '225',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Jika 43x + 42y = 430 dan x + y = 48, maka nilai x adalah...',
        'opsi_a': '42',
        'opsi_b': '43',
        'opsi_c': '44',
        'opsi_d': '41',
        'opsi_e': '45',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Sebuah lingkaran memiliki jari-jari 54 cm. Luas lingkaran tersebut adalah...',
        'opsi_a': '9160,88 cm²',
        'opsi_b': '9161 cm²',
        'opsi_c': '9162 cm²',
        'opsi_d': '9159 cm²',
        'opsi_e': '9163 cm²',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Hasil dari 49P45 adalah...',
        'opsi_a': '5489031744000',
        'opsi_b': '2401',
        'opsi_c': '548903174400',
        'opsi_d': '10978063488000',
        'opsi_e': '1097806348800000',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Jika tan 45° = 1, maka cot 45° adalah...',
        'opsi_a': '1',
        'opsi_b': '0',
        'opsi_c': '√3',
        'opsi_d': '√2',
        'opsi_e': '1/√2',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Sebuah bola memiliki jari-jari 15 cm. Volume bola tersebut adalah...',
        'opsi_a': '14130 cm³',
        'opsi_b': '28260 cm³',
        'opsi_c': '7065 cm³',
        'opsi_d': '21195 cm³',
        'opsi_e': '3532,5 cm³',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Banyak cara menyusun huruf dari kata "YOGYAKARTA" adalah...',
        'opsi_a': '90720',
        'opsi_b': '45360',
        'opsi_c': '181440',
        'opsi_d': '22680',
        'opsi_e': '11340',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Hasil dari log₂ 64 adalah...',
        'opsi_a': '6',
        'opsi_b': '5',
        'opsi_c': '7',
        'opsi_d': '64',
        'opsi_e': '1',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Jika 44x² = 396, maka nilai x adalah...',
        'opsi_a': '3 atau -3',
        'opsi_b': '3 saja',
        'opsi_c': '-3 saja',
        'opsi_d': '9',
        'opsi_e': '6',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Sebuah trapesium memiliki alas 25 cm, atas 15 cm, dan tinggi 12 cm. Luas trapesium tersebut adalah...',
        'opsi_a': '240 cm²',
        'opsi_b': '480 cm²',
        'opsi_c': '120 cm²',
        'opsi_d': '360 cm²',
        'opsi_e': '60 cm²',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Hasil dari 210C41 adalah...',
        'opsi_a': '119622220865480000000',
        'opsi_b': '1196222208654800000000',
        'opsi_c': '8610',
        'opsi_d': '44100',
        'opsi_e': '11962222086548000000',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Jika 49x - 48 = 490, maka nilai x adalah...',
        'opsi_a': '11',
        'opsi_b': '10',
        'opsi_c': '12',
        'opsi_d': '9',
        'opsi_e': '13',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Banyak cara memilih 47 orang dari 94 orang adalah...',
        'opsi_a': '89978479768000000000',
        'opsi_b': '44989239884000000000',
        'opsi_c': '179956959536000000000',
        'opsi_d': '899784797680000000000000000000000000000000000000000000',
        'opsi_e': '89978479768000000000',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Hasil dari ∛74088000 adalah...',
        'opsi_a': '420',
        'opsi_b': '418',
        'opsi_c': '422',
        'opsi_d': '424',
        'opsi_e': '426',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Deret aritmatika: 45, 91, 137, 183, ..., 275. Suku yang hilang adalah...',
        'opsi_a': '229',
        'opsi_b': '227',
        'opsi_c': '231',
        'opsi_d': '228',
        'opsi_e': '230',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Jika 44x + 43y = 440 dan x + y = 49, maka nilai x adalah...',
        'opsi_a': '43',
        'opsi_b': '44',
        'opsi_c': '45',
        'opsi_d': '42',
        'opsi_e': '46',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Sebuah lingkaran memiliki jari-jari 56 cm. Luas lingkaran tersebut adalah...',
        'opsi_a': '9852,03 cm²',
        'opsi_b': '9853 cm²',
        'opsi_c': '9854 cm²',
        'opsi_d': '9851 cm²',
        'opsi_e': '9855 cm²',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Hasil dari 50P46 adalah...',
        'opsi_a': '4045861104000',
        'opsi_b': '2500',
        'opsi_c': '404586110400',
        'opsi_d': '80917222080000',
        'opsi_e': '8091722208000000',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Jika sec 60° = 2, maka cos 60° adalah...',
        'opsi_a': '1/2',
        'opsi_b': '2',
        'opsi_c': '√3/2',
        'opsi_d': '1/√2',
        'opsi_e': '0',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Sebuah kerucut memiliki jari-jari 16 cm dan tinggi 24 cm. Volume kerucut tersebut adalah...',
        'opsi_a': '6433,98 cm³',
        'opsi_b': '12867,96 cm³',
        'opsi_c': '3216,99 cm³',
        'opsi_d': '9650,97 cm³',
        'opsi_e': '1608,5 cm³',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Banyak cara menyusun huruf dari kata "SURABAYA" adalah...',
        'opsi_a': '10080',
        'opsi_b': '5040',
        'opsi_c': '20160',
        'opsi_d': '2520',
        'opsi_e': '1260',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Hasil dari log₃ 81 adalah...',
        'opsi_a': '4',
        'opsi_b': '3',
        'opsi_c': '5',
        'opsi_d': '81',
        'opsi_e': '1',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Jika 45x² = 405, maka nilai x adalah...',
        'opsi_a': '3 atau -3',
        'opsi_b': '3 saja',
        'opsi_c': '-3 saja',
        'opsi_d': '9',
        'opsi_e': '6',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Sebuah layang-layang memiliki diagonal 28 cm dan 36 cm. Luas layang-layang tersebut adalah...',
        'opsi_a': '504 cm²',
        'opsi_b': '1008 cm²',
        'opsi_c': '252 cm²',
        'opsi_d': '756 cm²',
        'opsi_e': '126 cm²',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Hasil dari 215C42 adalah...',
        'opsi_a': '178858874566020000000',
        'opsi_b': '1788588745660200000000',
        'opsi_c': '9030',
        'opsi_d': '46225',
        'opsi_e': '17885887456602000000',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Jika 50x - 49 = 500, maka nilai x adalah...',
        'opsi_a': '11',
        'opsi_b': '10',
        'opsi_c': '12',
        'opsi_d': '9',
        'opsi_e': '13',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Banyak cara memilih 48 orang dari 96 orang adalah...',
        'opsi_a': '114646919769000000000',
        'opsi_b': '57323459884500000000',
        'opsi_c': '229293839538000000000',
        'opsi_d': '114646919769000000000000000000000000000000000000000000',
        'opsi_e': '114646919769000000000',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Hasil dari ∛91125200 adalah...',
        'opsi_a': '450',
        'opsi_b': '448',
        'opsi_c': '452',
        'opsi_d': '454',
        'opsi_e': '456',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Deret aritmatika: 46, 93, 140, 187, ..., 281. Suku yang hilang adalah...',
        'opsi_a': '234',
        'opsi_b': '232',
        'opsi_c': '236',
        'opsi_d': '233',
        'opsi_e': '235',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Jika 45x + 44y = 450 dan x + y = 50, maka nilai x adalah...',
        'opsi_a': '44',
        'opsi_b': '45',
        'opsi_c': '46',
        'opsi_d': '43',
        'opsi_e': '47',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Sebuah lingkaran memiliki jari-jari 58 cm. Luas lingkaran tersebut adalah...',
        'opsi_a': '10568,32 cm²',
        'opsi_b': '10569 cm²',
        'opsi_c': '10570 cm²',
        'opsi_d': '10567 cm²',
        'opsi_e': '10571 cm²',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Hasil dari 51P47 adalah...',
        'opsi_a': '5489031744000',
        'opsi_b': '2601',
        'opsi_c': '548903174400',
        'opsi_d': '10978063488000',
        'opsi_e': '1097806348800000',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Jika csc 30° = 2, maka sin 30° adalah...',
        'opsi_a': '1/2',
        'opsi_b': '2',
        'opsi_c': '√3/2',
        'opsi_d': '1/√2',
        'opsi_e': '0',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Sebuah prisma segitiga memiliki alas 18 cm, tinggi 12 cm, dan tinggi prisma 25 cm. Volume prisma tersebut adalah...',
        'opsi_a': '2700 cm³',
        'opsi_b': '5400 cm³',
        'opsi_c': '1350 cm³',
        'opsi_d': '4050 cm³',
        'opsi_e': '675 cm³',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Banyak cara menyusun huruf dari kata "MAKASSAR" adalah...',
        'opsi_a': '5040',
        'opsi_b': '2520',
        'opsi_c': '10080',
        'opsi_d': '1260',
        'opsi_e': '630',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Hasil dari log₅ 125 adalah...',
        'opsi_a': '3',
        'opsi_b': '2',
        'opsi_c': '4',
        'opsi_d': '125',
        'opsi_e': '1',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Jika 46x² = 414, maka nilai x adalah...',
        'opsi_a': '3 atau -3',
        'opsi_b': '3 saja',
        'opsi_c': '-3 saja',
        'opsi_d': '9',
        'opsi_e': '6',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Sebuah segi enam beraturan memiliki sisi 14 cm. Luas segi enam tersebut adalah...',
        'opsi_a': '509,2 cm²',
        'opsi_b': '1018,4 cm²',
        'opsi_c': '254,6 cm²',
        'opsi_d': '763,8 cm²',
        'opsi_e': '127,3 cm²',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Hasil dari 220C43 adalah...',
        'opsi_a': '267399776698000000000',
        'opsi_b': '2673997766980000000000',
        'opsi_c': '9460',
        'opsi_d': '48400',
        'opsi_e': '26739977669800000000',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Jika 51x - 50 = 510, maka nilai x adalah...',
        'opsi_a': '11',
        'opsi_b': '10',
        'opsi_c': '12',
        'opsi_d': '9',
        'opsi_e': '13',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Banyak cara memilih 49 orang dari 98 orang adalah...',
        'opsi_a': '145842368418000000000',
        'opsi_b': '72921184209000000000',
        'opsi_c': '291684736836000000000',
        'opsi_d': '145842368418000000000000000000000000000000000000000000',
        'opsi_e': '145842368418000000000',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Hasil dari ∛110592000 adalah...',
        'opsi_a': '480',
        'opsi_b': '478',
        'opsi_c': '482',
        'opsi_d': '484',
        'opsi_e': '486',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Deret aritmatika: 47, 95, 143, 191, ..., 287. Suku yang hilang adalah...',
        'opsi_a': '239',
        'opsi_b': '237',
        'opsi_c': '241',
        'opsi_d': '238',
        'opsi_e': '240',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Jika 46x + 45y = 460 dan x + y = 51, maka nilai x adalah...',
        'opsi_a': '45',
        'opsi_b': '46',
        'opsi_c': '47',
        'opsi_d': '44',
        'opsi_e': '48',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Sebuah lingkaran memiliki jari-jari 60 cm. Luas lingkaran tersebut adalah...',
        'opsi_a': '11309,73 cm²',
        'opsi_b': '11310 cm²',
        'opsi_c': '11311 cm²',
        'opsi_d': '11308 cm²',
        'opsi_e': '11312 cm²',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Hasil dari 52P48 adalah...',
        'opsi_a': '6580073593600',
        'opsi_b': '2704',
        'opsi_c': '658007359360',
        'opsi_d': '13160147187200',
        'opsi_e': '1316014718720000',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Jika tan 60° = √3, maka cot 60° adalah...',
        'opsi_a': '1/√3',
        'opsi_b': '√3',
        'opsi_c': '1/2',
        'opsi_d': '√2',
        'opsi_e': '0',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Sebuah limas segi empat memiliki alas 20 cm, tinggi 15 cm, dan tinggi limas 30 cm. Volume limas tersebut adalah...',
        'opsi_a': '6000 cm³',
        'opsi_b': '12000 cm³',
        'opsi_c': '3000 cm³',
        'opsi_d': '9000 cm³',
        'opsi_e': '1500 cm³',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Banyak cara menyusun huruf dari kata "JAKARTA" adalah...',
        'opsi_a': '2520',
        'opsi_b': '1260',
        'opsi_c': '5040',
        'opsi_d': '630',
        'opsi_e': '315',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Hasil dari log₇ 343 adalah...',
        'opsi_a': '3',
        'opsi_b': '2',
        'opsi_c': '4',
        'opsi_d': '343',
        'opsi_e': '1',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Jika 47x² = 423, maka nilai x adalah...',
        'opsi_a': '3 atau -3',
        'opsi_b': '3 saja',
        'opsi_c': '-3 saja',
        'opsi_d': '9',
        'opsi_e': '6',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Sebuah segi delapan beraturan memiliki sisi 12 cm. Luas segi delapan tersebut adalah...',
        'opsi_a': '696,72 cm²',
        'opsi_b': '1393,44 cm²',
        'opsi_c': '348,36 cm²',
        'opsi_d': '1045,08 cm²',
        'opsi_e': '174,18 cm²',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Hasil dari 225C44 adalah...',
        'opsi_a': '398846597040000000000',
        'opsi_b': '3988465970400000000000',
        'opsi_c': '9900',
        'opsi_d': '50625',
        'opsi_e': '39884659704000000000',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Jika 52x - 51 = 520, maka nilai x adalah...',
        'opsi_a': '11',
        'opsi_b': '10',
        'opsi_c': '12',
        'opsi_d': '9',
        'opsi_e': '13',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Banyak cara memilih 50 orang dari 100 orang adalah...',
        'opsi_a': '100891344545564000000000',
        'opsi_b': '50445672272782000000',
        'opsi_c': '201782689091128000000000',
        'opsi_d': '100891344545564000000000000000000000000000000000000000',
        'opsi_e': '100891344545564000000000',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Hasil dari ∛132651000 adalah...',
        'opsi_a': '510',
        'opsi_b': '508',
        'opsi_c': '512',
        'opsi_d': '514',
        'opsi_e': '516',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Deret aritmatika: 48, 97, 146, 195, ..., 293. Suku yang hilang adalah...',
        'opsi_a': '244',
        'opsi_b': '242',
        'opsi_c': '246',
        'opsi_d': '243',
        'opsi_e': '245',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Jika 47x + 46y = 470 dan x + y = 52, maka nilai x adalah...',
        'opsi_a': '46',
        'opsi_b': '47',
        'opsi_c': '48',
        'opsi_d': '45',
        'opsi_e': '49',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Sebuah lingkaran memiliki jari-jari 62 cm. Luas lingkaran tersebut adalah...',
        'opsi_a': '12090,53 cm²',
        'opsi_b': '12091 cm²',
        'opsi_c': '12092 cm²',
        'opsi_d': '12089 cm²',
        'opsi_e': '12093 cm²',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Hasil dari 53P49 adalah...',
        'opsi_a': '7905853580625',
        'opsi_b': '2809',
        'opsi_c': '790585358062',
        'opsi_d': '15811707161250',
        'opsi_e': '1581170716125000',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Jika cos 45° = 1/√2, maka sec 45° adalah...',
        'opsi_a': '√2',
        'opsi_b': '1/√2',
        'opsi_c': '1/2',
        'opsi_d': '2',
        'opsi_e': '0',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Sebuah tabung memiliki jari-jari 18 cm dan tinggi 35 cm. Volume tabung tersebut adalah...',
        'opsi_a': '35625,72 cm³',
        'opsi_b': '71251,44 cm³',
        'opsi_c': '17812,86 cm³',
        'opsi_d': '53438,58 cm³',
        'opsi_e': '8906,43 cm³',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Banyak cara menyusun huruf dari kata "BANDUNG" adalah...',
        'opsi_a': '2520',
        'opsi_b': '1260',
        'opsi_c': '5040',
        'opsi_d': '630',
        'opsi_e': '315',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Hasil dari log₁₀ 1000 adalah...',
        'opsi_a': '3',
        'opsi_b': '2',
        'opsi_c': '4',
        'opsi_d': '1000',
        'opsi_e': '1',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Jika 48x² = 432, maka nilai x adalah...',
        'opsi_a': '3 atau -3',
        'opsi_b': '3 saja',
        'opsi_c': '-3 saja',
        'opsi_d': '9',
        'opsi_e': '6',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Sebuah juring lingkaran memiliki sudut 120° dan jari-jari 15 cm. Luas juring tersebut adalah...',
        'opsi_a': '235,62 cm²',
        'opsi_b': '471,24 cm²',
        'opsi_c': '117,81 cm²',
        'opsi_d': '353,43 cm²',
        'opsi_e': '58,91 cm²',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Hasil dari 230C45 adalah...',
        'opsi_a': '592642799841000000000',
        'opsi_b': '5926427998410000000000',
        'opsi_c': '10350',
        'opsi_d': '52900',
        'opsi_e': '59264279984100000000',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Jika 53x - 52 = 530, maka nilai x adalah...',
        'opsi_a': '11',
        'opsi_b': '10',
        'opsi_c': '12',
        'opsi_d': '9',
        'opsi_e': '13',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Banyak cara memilih 51 orang dari 102 orang adalah...',
        'opsi_a': '112362405672000000000000',
        'opsi_b': '56181202836000000000',
        'opsi_c': '224724811344000000000000',
        'opsi_d': '112362405672000000000000000000000000000000000000000000',
        'opsi_e': '112362405672000000000000',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Hasil dari ∛157464000 adalah...',
        'opsi_a': '540',
        'opsi_b': '538',
        'opsi_c': '542',
        'opsi_d': '544',
        'opsi_e': '546',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Deret aritmatika: 49, 99, 149, 199, ..., 299. Suku yang hilang adalah...',
        'opsi_a': '249',
        'opsi_b': '247',
        'opsi_c': '251',
        'opsi_d': '248',
        'opsi_e': '250',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Jika 48x + 47y = 480 dan x + y = 53, maka nilai x adalah...',
        'opsi_a': '47',
        'opsi_b': '48',
        'opsi_c': '49',
        'opsi_d': '46',
        'opsi_e': '50',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Sebuah lingkaran memiliki jari-jari 64 cm. Luas lingkaran tersebut adalah...',
        'opsi_a': '12867,96 cm²',
        'opsi_b': '12868 cm²',
        'opsi_c': '12869 cm²',
        'opsi_d': '12866 cm²',
        'opsi_e': '12870 cm²',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Hasil dari 54P50 adalah...',
        'opsi_a': '9341533514400',
        'opsi_b': '2916',
        'opsi_c': '934153351440',
        'opsi_d': '18683067028800',
        'opsi_e': '1868306702880000',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Jika sin 30° = 1/2, maka csc 30° adalah...',
        'opsi_a': '2',
        'opsi_b': '1/2',
        'opsi_c': '√3/2',
        'opsi_d': '1/√2',
        'opsi_e': '0',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Sebuah bola memiliki jari-jari 20 cm. Volume bola tersebut adalah...',
        'opsi_a': '33510,32 cm³',
        'opsi_b': '67020,64 cm³',
        'opsi_c': '16755,16 cm³',
        'opsi_d': '50265,48 cm³',
        'opsi_e': '8377,58 cm³',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Banyak cara menyusun huruf dari kata "SURABAYA" adalah...',
        'opsi_a': '10080',
        'opsi_b': '5040',
        'opsi_c': '20160',
        'opsi_d': '2520',
        'opsi_e': '1260',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Hasil dari log₂ 64 adalah...',
        'opsi_a': '6',
        'opsi_b': '2',
        'opsi_c': '4',
        'opsi_d': '64',
        'opsi_e': '1',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Jika 49x² = 441, maka nilai x adalah...',
        'opsi_a': '3 atau -3',
        'opsi_b': '3 saja',
        'opsi_c': '-3 saja',
        'opsi_d': '9',
        'opsi_e': '6',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Sebuah trapesium memiliki alas atas 12 cm, alas bawah 20 cm, dan tinggi 15 cm. Luas trapesium tersebut adalah...',
        'opsi_a': '240 cm²',
        'opsi_b': '480 cm²',
        'opsi_c': '120 cm²',
        'opsi_d': '360 cm²',
        'opsi_e': '60 cm²',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Hasil dari 235C46 adalah...',
        'opsi_a': '878920026838000000000',
        'opsi_b': '8789200268380000000000',
        'opsi_c': '10810',
        'opsi_d': '55225',
        'opsi_e': '87892002683800000000',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Jika 54x - 53 = 540, maka nilai x adalah...',
        'opsi_a': '11',
        'opsi_b': '10',
        'opsi_c': '12',
        'opsi_d': '9',
        'opsi_e': '13',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Banyak cara memilih 52 orang dari 104 orang adalah...',
        'opsi_a': '125410302569000000000000',
        'opsi_b': '62705151284500000000',
        'opsi_c': '250820605138000000000000',
        'opsi_d': '125410302569000000000000000000000000000000000000000000',
        'opsi_e': '125410302569000000000000',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Hasil dari ∛181584000 adalah...',
        'opsi_a': '566',
        'opsi_b': '564',
        'opsi_c': '568',
        'opsi_d': '570',
        'opsi_e': '572',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Deret aritmatika: 50, 101, 152, 203, ..., 305. Suku yang hilang adalah...',
        'opsi_a': '254',
        'opsi_b': '252',
        'opsi_c': '256',
        'opsi_d': '253',
        'opsi_e': '255',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Jika 49x + 48y = 490 dan x + y = 54, maka nilai x adalah...',
        'opsi_a': '48',
        'opsi_b': '49',
        'opsi_c': '50',
        'opsi_d': '47',
        'opsi_e': '51',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Sebuah lingkaran memiliki jari-jari 66 cm. Luas lingkaran tersebut adalah...',
        'opsi_a': '13684,78 cm²',
        'opsi_b': '13685 cm²',
        'opsi_c': '13686 cm²',
        'opsi_d': '13683 cm²',
        'opsi_e': '13687 cm²',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Hasil dari 55P51 adalah...',
        'opsi_a': '1105024473600',
        'opsi_b': '3025',
        'opsi_c': '110502447360',
        'opsi_d': '2210048947200',
        'opsi_e': '221004894720000',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Jika tan 45° = 1, maka cot 45° adalah...',
        'opsi_a': '1',
        'opsi_b': '0',
        'opsi_c': '√3',
        'opsi_d': '√2',
        'opsi_e': '1/2',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Sebuah kerucut memiliki jari-jari 22 cm dan tinggi 40 cm. Volume kerucut tersebut adalah...',
        'opsi_a': '20274,08 cm³',
        'opsi_b': '40548,16 cm³',
        'opsi_c': '10137,04 cm³',
        'opsi_d': '30411,12 cm³',
        'opsi_e': '5068,52 cm³',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Banyak cara menyusun huruf dari kata "YOGYAKARTA" adalah...',
        'opsi_a': '90720',
        'opsi_b': '45360',
        'opsi_c': '181440',
        'opsi_d': '22680',
        'opsi_e': '11340',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Hasil dari log₃ 81 adalah...',
        'opsi_a': '4',
        'opsi_b': '2',
        'opsi_c': '3',
        'opsi_d': '81',
        'opsi_e': '1',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Jika 50x² = 450, maka nilai x adalah...',
        'opsi_a': '3 atau -3',
        'opsi_b': '3 saja',
        'opsi_c': '-3 saja',
        'opsi_d': '9',
        'opsi_e': '6',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Sebuah belah ketupat memiliki diagonal 24 cm dan 32 cm. Luas belah ketupat tersebut adalah...',
        'opsi_a': '384 cm²',
        'opsi_b': '768 cm²',
        'opsi_c': '192 cm²',
        'opsi_d': '576 cm²',
        'opsi_e': '96 cm²',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Hasil dari 240C47 adalah...',
        'opsi_a': '1264106064380000000000',
        'opsi_b': '12641060643800000000000',
        'opsi_c': '11280',
        'opsi_d': '57600',
        'opsi_e': '126410606438000000000',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Jika 55x - 54 = 550, maka nilai x adalah...',
        'opsi_a': '11',
        'opsi_b': '10',
        'opsi_c': '12',
        'opsi_d': '9',
        'opsi_e': '13',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Banyak cara memilih 53 orang dari 106 orang adalah...',
        'opsi_a': '139818364033000000000000',
        'opsi_b': '69909182016500000000',
        'opsi_c': '279636728066000000000000',
        'opsi_d': '139818364033000000000000000000000000000000000000000000',
        'opsi_e': '139818364033000000000000',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Hasil dari ∛195112000 adalah...',
        'opsi_a': '580',
        'opsi_b': '578',
        'opsi_c': '582',
        'opsi_d': '584',
        'opsi_e': '586',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Deret aritmatika: 51, 103, 155, 207, ..., 311. Suku yang hilang adalah...',
        'opsi_a': '259',
        'opsi_b': '257',
        'opsi_c': '261',
        'opsi_d': '258',
        'opsi_e': '260',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Jika 50x + 49y = 500 dan x + y = 55, maka nilai x adalah...',
        'opsi_a': '49',
        'opsi_b': '50',
        'opsi_c': '51',
        'opsi_d': '48',
        'opsi_e': '52',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Sebuah lingkaran memiliki jari-jari 68 cm. Luas lingkaran tersebut adalah...',
        'opsi_a': '14526,72 cm²',
        'opsi_b': '14527 cm²',
        'opsi_c': '14528 cm²',
        'opsi_d': '14525 cm²',
        'opsi_e': '14529 cm²',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Hasil dari 56P52 adalah...',
        'opsi_a': '1550425264000',
        'opsi_b': '3136',
        'opsi_c': '155042526400',
        'opsi_d': '3100850528000',
        'opsi_e': '310085052800000',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Jika sin 45° = 1/√2, maka cos 45° adalah...',
        'opsi_a': '1/√2',
        'opsi_b': '√2',
        'opsi_c': '1/2',
        'opsi_d': '2',
        'opsi_e': '0',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Sebuah balok memiliki panjang 24 cm, lebar 18 cm, dan tinggi 20 cm. Volume balok tersebut adalah...',
        'opsi_a': '8640 cm³',
        'opsi_b': '17280 cm³',
        'opsi_c': '4320 cm³',
        'opsi_d': '12960 cm³',
        'opsi_e': '2160 cm³',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Banyak cara menyusun huruf dari kata "SEMARANG" adalah...',
        'opsi_a': '5040',
        'opsi_b': '2520',
        'opsi_c': '10080',
        'opsi_d': '1260',
        'opsi_e': '630',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Hasil dari log₅ 125 adalah...',
        'opsi_a': '3',
        'opsi_b': '2',
        'opsi_c': '4',
        'opsi_d': '125',
        'opsi_e': '1',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Jika 51x² = 459, maka nilai x adalah...',
        'opsi_a': '3 atau -3',
        'opsi_b': '3 saja',
        'opsi_c': '-3 saja',
        'opsi_d': '9',
        'opsi_e': '6',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Sebuah layang-layang memiliki diagonal 28 cm dan 36 cm. Luas layang-layang tersebut adalah...',
        'opsi_a': '504 cm²',
        'opsi_b': '1008 cm²',
        'opsi_c': '252 cm²',
        'opsi_d': '756 cm²',
        'opsi_e': '126 cm²',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Hasil dari 245C48 adalah...',
        'opsi_a': '1795623587290000000000',
        'opsi_b': '17956235872900000000000',
        'opsi_c': '11760',
        'opsi_d': '60025',
        'opsi_e': '179562358729000000000',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Jika 56x - 55 = 560, maka nilai x adalah...',
        'opsi_a': '11',
        'opsi_b': '10',
        'opsi_c': '12',
        'opsi_d': '9',
        'opsi_e': '13',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Banyak cara memilih 54 orang dari 108 orang adalah...',
        'opsi_a': '155969522009000000000000',
        'opsi_b': '77984761004500000000',
        'opsi_c': '311939044018000000000000',
        'opsi_d': '155969522009000000000000000000000000000000000000000000',
        'opsi_e': '155969522009000000000000',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Hasil dari ∛205379000 adalah...',
        'opsi_a': '590',
        'opsi_b': '588',
        'opsi_c': '592',
        'opsi_d': '594',
        'opsi_e': '596',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Deret aritmatika: 52, 105, 158, 211, ..., 317. Suku yang hilang adalah...',
        'opsi_a': '264',
        'opsi_b': '262',
        'opsi_c': '266',
        'opsi_d': '263',
        'opsi_e': '265',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Jika 51x + 50y = 510 dan x + y = 56, maka nilai x adalah...',
        'opsi_a': '50',
        'opsi_b': '51',
        'opsi_c': '52',
        'opsi_d': '49',
        'opsi_e': '53',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Sebuah lingkaran memiliki jari-jari 70 cm. Luas lingkaran tersebut adalah...',
        'opsi_a': '15393,80 cm²',
        'opsi_b': '15394 cm²',
        'opsi_c': '15395 cm²',
        'opsi_d': '15392 cm²',
        'opsi_e': '15396 cm²',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Hasil dari 57P53 adalah...',
        'opsi_a': '2590936096000',
        'opsi_b': '3249',
        'opsi_c': '259093609600',
        'opsi_d': '5181872192000',
        'opsi_e': '518187219200000',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Jika tan 60° = √3, maka cot 60° adalah...',
        'opsi_a': '1/√3',
        'opsi_b': '√3',
        'opsi_c': '1/2',
        'opsi_d': '2',
        'opsi_e': '0',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Sebuah prisma memiliki panjang 28 cm, lebar 22 cm, dan tinggi 30 cm. Volume prisma tersebut adalah...',
        'opsi_a': '18480 cm³',
        'opsi_b': '36960 cm³',
        'opsi_c': '9240 cm³',
        'opsi_d': '27720 cm³',
        'opsi_e': '4620 cm³',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Banyak cara menyusun huruf dari kata "MALANG" adalah...',
        'opsi_a': '120',
        'opsi_b': '60',
        'opsi_c': '240',
        'opsi_d': '30',
        'opsi_e': '15',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Hasil dari log₇ 343 adalah...',
        'opsi_a': '3',
        'opsi_b': '2',
        'opsi_c': '4',
        'opsi_d': '343',
        'opsi_e': '1',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Jika 52x² = 468, maka nilai x adalah...',
        'opsi_a': '3 atau -3',
        'opsi_b': '3 saja',
        'opsi_c': '-3 saja',
        'opsi_d': '9',
        'opsi_e': '6',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Sebuah segitiga memiliki alas 32 cm dan tinggi 24 cm. Luas segitiga tersebut adalah...',
        'opsi_a': '384 cm²',
        'opsi_b': '768 cm²',
        'opsi_c': '192 cm²',
        'opsi_d': '576 cm²',
        'opsi_e': '96 cm²',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Hasil dari 250C49 adalah...',
        'opsi_a': '2540495366880000000000',
        'opsi_b': '25404953668800000000000',
        'opsi_c': '12250',
        'opsi_d': '62500',
        'opsi_e': '254049536688000000000',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Jika 57x - 56 = 570, maka nilai x adalah...',
        'opsi_a': '11',
        'opsi_b': '10',
        'opsi_c': '12',
        'opsi_d': '9',
        'opsi_e': '13',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Banyak cara memilih 55 orang dari 110 orang adalah...',
        'opsi_a': '173935464847000000000000',
        'opsi_b': '86967732423500000000',
        'opsi_c': '347870929694000000000000',
        'opsi_d': '173935464847000000000000000000000000000000000000000000',
        'opsi_e': '173935464847000000000000',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Hasil dari ∛216000000 adalah...',
        'opsi_a': '600',
        'opsi_b': '598',
        'opsi_c': '602',
        'opsi_d': '604',
        'opsi_e': '606',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Deret aritmatika: 53, 107, 161, 215, ..., 323. Suku yang hilang adalah...',
        'opsi_a': '269',
        'opsi_b': '267',
        'opsi_c': '271',
        'opsi_d': '268',
        'opsi_e': '270',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Jika 52x + 51y = 520 dan x + y = 57, maka nilai x adalah...',
        'opsi_a': '51',
        'opsi_b': '52',
        'opsi_c': '53',
        'opsi_d': '50',
        'opsi_e': '54',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Sebuah lingkaran memiliki jari-jari 72 cm. Luas lingkaran tersebut adalah...',
        'opsi_a': '16286,28 cm²',
        'opsi_b': '16287 cm²',
        'opsi_c': '16288 cm²',
        'opsi_d': '16285 cm²',
        'opsi_e': '16289 cm²',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Hasil dari 58P54 adalah...',
        'opsi_a': '4316644000000',
        'opsi_b': '3364',
        'opsi_c': '431664400000',
        'opsi_d': '8633288000000',
        'opsi_e': '863328800000000',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Jika cos 60° = 1/2, maka sec 60° adalah...',
        'opsi_a': '2',
        'opsi_b': '1/2',
        'opsi_c': '√3/2',
        'opsi_d': '1/√2',
        'opsi_e': '0',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Sebuah tabung memiliki jari-jari 26 cm dan tinggi 50 cm. Volume tabung tersebut adalah...',
        'opsi_a': '106185,52 cm³',
        'opsi_b': '212371,04 cm³',
        'opsi_c': '53092,76 cm³',
        'opsi_d': '159278,28 cm³',
        'opsi_e': '26546,38 cm³',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Banyak cara menyusun huruf dari kata "BANDUNG" adalah...',
        'opsi_a': '720',
        'opsi_b': '360',
        'opsi_c': '1440',
        'opsi_d': '180',
        'opsi_e': '90',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Hasil dari log₁₀ 1000 adalah...',
        'opsi_a': '3',
        'opsi_b': '2',
        'opsi_c': '4',
        'opsi_d': '1000',
        'opsi_e': '1',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Jika 53x² = 477, maka nilai x adalah...',
        'opsi_a': '3 atau -3',
        'opsi_b': '3 saja',
        'opsi_c': '-3 saja',
        'opsi_d': '9',
        'opsi_e': '6',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Sebuah jajar genjang memiliki alas 36 cm dan tinggi 28 cm. Luas jajar genjang tersebut adalah...',
        'opsi_a': '1008 cm²',
        'opsi_b': '2016 cm²',
        'opsi_c': '504 cm²',
        'opsi_d': '1512 cm²',
        'opsi_e': '252 cm²',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Hasil dari 255C50 adalah...',
        'opsi_a': '3568467354700000000000',
        'opsi_b': '35684673547000000000000',
        'opsi_c': '12750',
        'opsi_d': '65025',
        'opsi_e': '356846735470000000000',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Jika 58x - 57 = 580, maka nilai x adalah...',
        'opsi_a': '11',
        'opsi_b': '10',
        'opsi_c': '12',
        'opsi_d': '9',
        'opsi_e': '13',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Banyak cara memilih 56 orang dari 112 orang adalah...',
        'opsi_a': '193932576530000000000000',
        'opsi_b': '96966288265000000000',
        'opsi_c': '387865153060000000000000',
        'opsi_d': '193932576530000000000000000000000000000000000000000000',
        'opsi_e': '193932576530000000000000',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Hasil dari ∛226981000 adalah...',
        'opsi_a': '610',
        'opsi_b': '608',
        'opsi_c': '612',
        'opsi_d': '614',
        'opsi_e': '616',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Deret aritmatika: 54, 109, 164, 219, ..., 329. Suku yang hilang adalah...',
        'opsi_a': '274',
        'opsi_b': '272',
        'opsi_c': '276',
        'opsi_d': '273',
        'opsi_e': '275',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Jika 53x + 52y = 530 dan x + y = 58, maka nilai x adalah...',
        'opsi_a': '52',
        'opsi_b': '53',
        'opsi_c': '54',
        'opsi_d': '51',
        'opsi_e': '55',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Sebuah lingkaran memiliki jari-jari 74 cm. Luas lingkaran tersebut adalah...',
        'opsi_a': '17203,36 cm²',
        'opsi_b': '17204 cm²',
        'opsi_c': '17205 cm²',
        'opsi_d': '17202 cm²',
        'opsi_e': '17206 cm²',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Hasil dari 59P55 adalah...',
        'opsi_a': '7136626624000',
        'opsi_b': '3481',
        'opsi_c': '713662662400',
        'opsi_d': '14273253248000',
        'opsi_e': '142732532480000',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Jika csc 30° = 2, maka sin 30° adalah...',
        'opsi_a': '1/2',
        'opsi_b': '2',
        'opsi_c': '√3/2',
        'opsi_d': '1/√2',
        'opsi_e': '0',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Sebuah kerucut memiliki jari-jari 28 cm dan tinggi 52 cm. Volume kerucut tersebut adalah...',
        'opsi_a': '42687,36 cm³',
        'opsi_b': '85374,72 cm³',
        'opsi_c': '21343,68 cm³',
        'opsi_d': '64031,04 cm³',
        'opsi_e': '10671,84 cm³',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Banyak cara menyusun huruf dari kata "YOGYAKARTA" adalah...',
        'opsi_a': '90720',
        'opsi_b': '45360',
        'opsi_c': '181440',
        'opsi_d': '22680',
        'opsi_e': '11340',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Hasil dari log₂ 64 adalah...',
        'opsi_a': '6',
        'opsi_b': '5',
        'opsi_c': '7',
        'opsi_d': '64',
        'opsi_e': '1',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Jika 54x² = 486, maka nilai x adalah...',
        'opsi_a': '3 atau -3',
        'opsi_b': '3 saja',
        'opsi_c': '-3 saja',
        'opsi_d': '9',
        'opsi_e': '6',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Sebuah trapesium memiliki sisi sejajar 40 cm dan 32 cm, tinggi 28 cm. Luas trapesium tersebut adalah...',
        'opsi_a': '1008 cm²',
        'opsi_b': '2016 cm²',
        'opsi_c': '504 cm²',
        'opsi_d': '1512 cm²',
        'opsi_e': '252 cm²',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Hasil dari 260C51 adalah...',
        'opsi_a': '5004262777360000000000',
        'opsi_b': '50042627773600000000000',
        'opsi_c': '13260',
        'opsi_d': '67600',
        'opsi_e': '500426277736000000000',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Jika 59x - 58 = 590, maka nilai x adalah...',
        'opsi_a': '11',
        'opsi_b': '10',
        'opsi_c': '12',
        'opsi_d': '9',
        'opsi_e': '13',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Banyak cara memilih 57 orang dari 114 orang adalah...',
        'opsi_a': '215779642547000000000000',
        'opsi_b': '10788982127350000000',
        'opsi_c': '431559285094000000000000',
        'opsi_d': '215779642547000000000000000000000000000000000000000000',
        'opsi_e': '215779642547000000000000',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Hasil dari ∛248971000 adalah...',
        'opsi_a': '630',
        'opsi_b': '628',
        'opsi_c': '632',
        'opsi_d': '634',
        'opsi_e': '636',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Deret aritmatika: 55, 111, 167, 223, ..., 335. Suku yang hilang adalah...',
        'opsi_a': '279',
        'opsi_b': '277',
        'opsi_c': '281',
        'opsi_d': '278',
        'opsi_e': '280',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Jika 54x + 53y = 540 dan x + y = 59, maka nilai x adalah...',
        'opsi_a': '53',
        'opsi_b': '54',
        'opsi_c': '55',
        'opsi_d': '52',
        'opsi_e': '56',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Sebuah lingkaran memiliki jari-jari 76 cm. Luas lingkaran tersebut adalah...',
        'opsi_a': '18145,84 cm²',
        'opsi_b': '18146 cm²',
        'opsi_c': '18147 cm²',
        'opsi_d': '18144 cm²',
        'opsi_e': '18148 cm²',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Hasil dari 60P56 adalah...',
        'opsi_a': '1964604608000',
        'opsi_b': '3600',
        'opsi_c': '196460460800',
        'opsi_d': '3929209216000',
        'opsi_e': '392920921600000',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Jika cot 45° = 1, maka tan 45° adalah...',
        'opsi_a': '1',
        'opsi_b': '-1',
        'opsi_c': '0',
        'opsi_d': '√2',
        'opsi_e': '1/√2',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Sebuah bola memiliki jari-jari 30 cm. Volume bola tersebut adalah...',
        'opsi_a': '113097,33 cm³',
        'opsi_b': '226194,66 cm³',
        'opsi_c': '56548,66 cm³',
        'opsi_d': '169646,00 cm³',
        'opsi_e': '28274,33 cm³',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Banyak cara menyusun huruf dari kata "SURABAYA" adalah...',
        'opsi_a': '20160',
        'opsi_b': '10080',
        'opsi_c': '40320',
        'opsi_d': '5040',
        'opsi_e': '2520',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Hasil dari log₃ 81 adalah...',
        'opsi_a': '4',
        'opsi_b': '3',
        'opsi_c': '5',
        'opsi_d': '81',
        'opsi_e': '1',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Jika 55x² = 495, maka nilai x adalah...',
        'opsi_a': '3 atau -3',
        'opsi_b': '3 saja',
        'opsi_c': '-3 saja',
        'opsi_d': '9',
        'opsi_e': '6',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Sebuah belah ketupat memiliki diagonal 44 cm dan 36 cm. Luas belah ketupat tersebut adalah...',
        'opsi_a': '792 cm²',
        'opsi_b': '1584 cm²',
        'opsi_c': '396 cm²',
        'opsi_d': '1188 cm²',
        'opsi_e': '198 cm²',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Hasil dari 265C52 adalah...',
        'opsi_a': '7023434511600000000000',
        'opsi_b': '70234345116000000000000',
        'opsi_c': '13780',
        'opsi_d': '70225',
        'opsi_e': '702343451160000000000',
        'jawaban': 'A'
    }
]

# Data Soal UMPTN/SBMPTN (TWK - Tes Wawasan Kebangsaan)
soal_umptn_twk = [
    {
        'pertanyaan': 'Pancasila sebagai dasar negara Indonesia pertama kali dicetuskan oleh...',
        'opsi_a': 'Ir. Soekarno',
        'opsi_b': 'Moh. Hatta',
        'opsi_c': 'Mr. Muhammad Yamin',
        'opsi_d': 'Mr. Soepomo',
        'opsi_e': 'Sutan Sjahrir',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Indonesia merdeka pada tanggal...',
        'opsi_a': '17 Agustus 1945',
        'opsi_b': '28 Oktober 1928',
        'opsi_c': '18 Agustus 1945',
        'opsi_d': '17 Mei 1945',
        'opsi_e': '1 Juni 1945',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Sumpah Pemuda diikuti oleh berbagai pemuda dari berbagai daerah yang bersatu atas nama...',
        'opsi_a': 'Satu tanah air, satu bangsa, satu bahasa',
        'opsi_b': 'Satu negara, satu bangsa, satu bahasa',
        'opsi_c': 'Satu nusa, satu bangsa, satu bahasa',
        'opsi_d': 'Satu tanah air, satu bangsa, satu negara',
        'opsi_e': 'Satu bangsa, satu bahasa, satu negara',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Lambang negara Indonesia adalah...',
        'opsi_a': 'Garuda Pancasila',
        'opsi_b': 'Bhinneka Tunggal Ika',
        'opsi_c': 'Merah Putih',
        'opsi_d': 'Naga',
        'opsi_e': 'Rajawali',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Bunyi sila ketiga Pancasila adalah...',
        'opsi_a': 'Persatuan Indonesia',
        'opsi_b': 'Ketuhanan Yang Maha Esa',
        'opsi_c': 'Kemanusiaan yang adil dan beradab',
        'opsi_d': 'Keadilan sosial bagi seluruh rakyat Indonesia',
        'opsi_e': 'Kerakyatan yang dipimpin oleh hikmat kebijaksanaan dalam permusyawaratan perwakilan',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Proklamasi Kemerdekaan Indonesia dibacakan oleh...',
        'opsi_a': 'Ir. Soekarno',
        'opsi_b': 'Moh. Hatta',
        'opsi_c': 'Soekarno-Hatta',
        'opsi_d': 'Sutan Sjahrir',
        'opsi_e': 'Mr. Ahmad Soebardjo',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'UUD 1945 disahkan pada tanggal...',
        'opsi_a': '18 Agustus 1945',
        'opsi_b': '17 Agustus 1945',
        'opsi_c': '27 Desember 1949',
        'opsi_d': '5 Juli 1959',
        'opsi_e': '1 Juni 1945',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Semboyan negara Indonesia adalah...',
        'opsi_a': 'Bhinneka Tunggal Ika',
        'opsi_b': 'Garuda Pancasila',
        'opsi_c': 'Merdeka atau Mati',
        'opsi_d': 'Satu Nusa Satu Bangsa',
        'opsi_e': 'Bersatu Teguh',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Lagu Indonesia Raya diciptakan oleh...',
        'opsi_a': 'Wage Rudolf Supratman',
        'opsi_b': 'Ismail Marzuki',
        'opsi_c': 'H. Mutahar',
        'opsi_d': 'Cornel Simanjuntak',
        'opsi_e': 'R. Koesoemadinata',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Bendera Merah Putih dikibarkan pertama kali pada...',
        'opsi_a': '17 Agustus 1945',
        'opsi_b': '28 Oktober 1928',
        'opsi_c': '18 Agustus 1945',
        'opsi_d': '1 Juni 1945',
        'opsi_e': '5 Juli 1959',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Pertempuran Ambarawa terjadi pada tahun...',
        'opsi_a': '1945',
        'opsi_b': '1947',
        'opsi_c': '1948',
        'opsi_d': '1949',
        'opsi_e': '1950',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'BPUPKI dibentuk pada tanggal...',
        'opsi_a': '1 Maret 1945',
        'opsi_b': '29 Mei 1945',
        'opsi_c': '7 Agustus 1945',
        'opsi_d': '17 Agustus 1945',
        'opsi_e': '18 Agustus 1945',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'PPKI dibentuk pada tanggal...',
        'opsi_a': '7 Agustus 1945',
        'opsi_b': '9 Agustus 1945',
        'opsi_c': '17 Agustus 1945',
        'opsi_d': '18 Agustus 1945',
        'opsi_e': '22 Agustus 1945',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Peristiwa Rengasdengklok terjadi pada tanggal...',
        'opsi_a': '16 Agustus 1945',
        'opsi_b': '17 Agustus 1945',
        'opsi_c': '15 Agustus 1945',
        'opsi_d': '18 Agustus 1945',
        'opsi_e': '14 Agustus 1945',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Naskah Proklamasi Kemerdekaan Indonesia ditulis di...',
        'opsi_a': 'Jl. Pegangsaan Timur No. 56',
        'opsi_b': 'Jl. Imam Bonjol No. 1',
        'opsi_c': 'Jl. Proklamasi No. 1',
        'opsi_d': 'Jl. Merdeka No. 45',
        'opsi_e': 'Jl. Thamrin No. 10',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Tokoh yang mencetuskan istilah "Pancasila" adalah...',
        'opsi_a': 'Mr. Muhammad Yamin',
        'opsi_b': 'Ir. Soekarno',
        'opsi_c': 'Mr. Soepomo',
        'opsi_d': 'Moh. Hatta',
        'opsi_e': 'Sutan Sjahrir',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Piagam PBB disahkan pada tanggal...',
        'opsi_a': '18 Agustus 1945',
        'opsi_b': '22 Juni 1945',
        'opsi_c': '17 Agustus 1945',
        'opsi_d': '28 Oktober 1928',
        'opsi_e': '1 Juni 1945',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Komisi Nasional Indonesia didirikan di...',
        'opsi_a': 'New Delhi',
        'opsi_b': 'Tokyo',
        'opsi_c': 'Bangkok',
        'opsi_d': 'Singapura',
        'opsi_e': 'Kuala Lumpur',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Perang Kemerdekaan Indonesia melawan Belanda terjadi dalam beberapa tahap, yaitu...',
        'opsi_a': 'Agresi Militer Belanda I dan II',
        'opsi_b': 'Agresi Militer Belanda I, II, dan III',
        'opsi_c': 'Agresi Militer Belanda I dan III',
        'opsi_d': 'Perang Diponegoro',
        'opsi_e': 'Perang Jawa',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Tokoh yang dikenal sebagai "Bapak Pendidikan Nasional" adalah...',
        'opsi_a': 'Ki Hajar Dewantara',
        'opsi_b': 'Ir. Soekarno',
        'opsi_c': 'Moh. Hatta',
        'opsi_d': 'Mr. Muhammad Yamin',
        'opsi_e': 'Mr. Soepomo',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Sila pertama Pancasila berbunyi...',
        'opsi_a': 'Ketuhanan Yang Maha Esa',
        'opsi_b': 'Kemanusiaan yang adil dan beradab',
        'opsi_c': 'Persatuan Indonesia',
        'opsi_d': 'Kerakyatan yang dipimpin oleh hikmat kebijaksanaan',
        'opsi_e': 'Keadilan sosial bagi seluruh rakyat Indonesia',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Bentuk negara Indonesia adalah...',
        'opsi_a': 'Republik',
        'opsi_b': 'Monarki',
        'opsi_c': 'Federasi',
        'opsi_d': 'Konfederasi',
        'opsi_e': 'Kerajaan',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Ideologi negara Indonesia adalah...',
        'opsi_a': 'Pancasila',
        'opsi_b': 'Komunisme',
        'opsi_c': 'Liberalisme',
        'opsi_d': 'Sosialisme',
        'opsi_e': 'Kapitalisme',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Pembukaan UUD 1945 alinea keempat berisi tentang...',
        'opsi_a': 'Tujuan negara Indonesia',
        'opsi_b': 'Sebab-sebab kemerdekaan',
        'opsi_c': 'Dasar negara',
        'opsi_d': 'Hak asasi manusia',
        'opsi_e': 'Kewajiban warga negara',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Sistem pemerintahan Indonesia menganut sistem...',
        'opsi_a': 'Presidensial',
        'opsi_b': 'Parlementer',
        'opsi_c': 'Monarki',
        'opsi_d': 'Oligarki',
        'opsi_e': 'Diktator',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Masa Reformasi di Indonesia dimulai pada tahun...',
        'opsi_a': '1998',
        'opsi_b': '1997',
        'opsi_c': '1999',
        'opsi_d': '2000',
        'opsi_e': '1996',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Presiden pertama Indonesia adalah...',
        'opsi_a': 'Ir. Soekarno',
        'opsi_b': 'Moh. Hatta',
        'opsi_c': 'Soeharto',
        'opsi_d': 'B.J. Habibie',
        'opsi_e': 'Abdurrahman Wahid',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Wakil Presiden pertama Indonesia adalah...',
        'opsi_a': 'Moh. Hatta',
        'opsi_b': 'Ir. Soekarno',
        'opsi_c': 'Soeharto',
        'opsi_d': 'B.J. Habibie',
        'opsi_e': 'Adam Malik',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Ibu Kota Indonesia saat ini adalah...',
        'opsi_a': 'Jakarta',
        'opsi_b': 'Bandung',
        'opsi_c': 'Surabaya',
        'opsi_d': 'Yogyakarta',
        'opsi_e': 'Medan',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Komando Cadangan Strategis Angkatan Darat (KOSTRAD) dibentuk pada tahun...',
        'opsi_a': '1961',
        'opsi_b': '1960',
        'opsi_c': '1962',
        'opsi_d': '1963',
        'opsi_e': '1959',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Peristiwa Bandung Lautan Api terjadi pada tanggal...',
        'opsi_a': '24 Maret 1946',
        'opsi_b': '17 Agustus 1945',
        'opsi_c': '10 November 1945',
        'opsi_d': '28 Oktober 1928',
        'opsi_e': '1 Juni 1945',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Tokoh yang dikenal sebagai "Bapak Angkatan Udara" adalah...',
        'opsi_a': 'Marsekal TNI (Purn) A. Yani',
        'opsi_b': 'Marsekal TNI (Purn) Suryadarma',
        'opsi_c': 'Marsekal TNI (Purn) Omar Dhani',
        'opsi_d': 'Marsekal TNI (Purn) Haryono',
        'opsi_e': 'Marsekal TNI (Purn) Suprapto',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Konferensi Asia Afrika (KAA) diadakan pada tahun...',
        'opsi_a': '1955',
        'opsi_b': '1950',
        'opsi_c': '1960',
        'opsi_d': '1945',
        'opsi_e': '1965',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Dewan Pertahanan Negara dibentuk pada tanggal...',
        'opsi_a': '5 September 1945',
        'opsi_b': '17 Agustus 1945',
        'opsi_c': '18 Agustus 1945',
        'opsi_d': '27 Desember 1949',
        'opsi_e': '1 Juni 1945',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Perjanjian Linggarjati ditandatangani pada tanggal...',
        'opsi_a': '15 November 1946',
        'opsi_b': '17 Agustus 1945',
        'opsi_c': '18 Agustus 1945',
        'opsi_d': '27 Desember 1949',
        'opsi_e': '1 Juni 1945',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Perjanjian Renville ditandatangani pada tanggal...',
        'opsi_a': '17 Januari 1948',
        'opsi_b': '15 November 1946',
        'opsi_c': '18 Agustus 1945',
        'opsi_d': '27 Desember 1949',
        'opsi_e': '1 Juni 1945',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Pemilihan Umum pertama di Indonesia diadakan pada tahun...',
        'opsi_a': '1955',
        'opsi_b': '1950',
        'opsi_c': '1960',
        'opsi_d': '1945',
        'opsi_e': '1965',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Komando Operasi Pemulihan Keamanan dan Ketertiban (KOPKAMTIB) dibentuk pada tahun...',
        'opsi_a': '1965',
        'opsi_b': '1960',
        'opsi_c': '1970',
        'opsi_d': '1975',
        'opsi_e': '1955',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Peristiwa G30S/PKI terjadi pada tanggal...',
        'opsi_a': '30 September 1965',
        'opsi_b': '1 Oktober 1965',
        'opsi_c': '17 Agustus 1945',
        'opsi_d': '28 Oktober 1928',
        'opsi_e': '1 Juni 1945',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Orde Baru dipimpin oleh...',
        'opsi_a': 'Soeharto',
        'opsi_b': 'Soekarno',
        'opsi_c': 'B.J. Habibie',
        'opsi_d': 'Abdurrahman Wahid',
        'opsi_e': 'Megawati Soekarnoputri',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Supersemar diterbitkan pada tanggal...',
        'opsi_a': '11 Maret 1966',
        'opsi_b': '30 September 1965',
        'opsi_c': '17 Agustus 1945',
        'opsi_d': '28 Oktober 1928',
        'opsi_e': '1 Juni 1945',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Pembentukan Tentara Nasional Indonesia (TNI) dilaksanakan pada tanggal...',
        'opsi_a': '5 Oktober 1945',
        'opsi_b': '17 Agustus 1945',
        'opsi_c': '18 Agustus 1945',
        'opsi_d': '27 Desember 1949',
        'opsi_e': '1 Juni 1945',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Perjanjian Roem-Royen ditandatangani pada tanggal...',
        'opsi_a': '7 Mei 1949',
        'opsi_b': '15 November 1946',
        'opsi_c': '17 Januari 1948',
        'opsi_d': '27 Desember 1949',
        'opsi_e': '1 Juni 1945',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Pengakuan Kedaulatan Indonesia oleh Belanda terjadi pada tanggal...',
        'opsi_a': '27 Desember 1949',
        'opsi_b': '17 Agustus 1945',
        'opsi_c': '18 Agustus 1945',
        'opsi_d': '5 Juli 1959',
        'opsi_e': '1 Juni 1945',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Deklarasi Djuanda dikeluarkan pada tanggal...',
        'opsi_a': '15 Desember 1957',
        'opsi_b': '17 Agustus 1945',
        'opsi_c': '27 Desember 1949',
        'opsi_d': '5 Juli 1959',
        'opsi_e': '1 Juni 1945',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Pembubaran Partai Komunis Indonesia (PKI) dilakukan pada tahun...',
        'opsi_a': '1966',
        'opsi_b': '1965',
        'opsi_c': '1964',
        'opsi_d': '1967',
        'opsi_e': '1963',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Pertempuran Surabaya terjadi pada tanggal...',
        'opsi_a': '10 November 1945',
        'opsi_b': '17 Agustus 1945',
        'opsi_c': '18 Agustus 1945',
        'opsi_d': '28 Oktober 1928',
        'opsi_e': '1 Juni 1945',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Komando Pasukan Pelajar (KPP) dibentuk pada tahun...',
        'opsi_a': '1945',
        'opsi_b': '1946',
        'opsi_c': '1947',
        'opsi_d': '1948',
        'opsi_e': '1949',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Pertempuran 5 Hari di Semarang terjadi pada tanggal...',
        'opsi_a': '15-19 Oktober 1945',
        'opsi_b': '10 November 1945',
        'opsi_c': '17 Agustus 1945',
        'opsi_d': '28 Oktober 1928',
        'opsi_e': '1 Juni 1945',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Benteng Belgica di Ambon merupakan peninggalan kolonial dari...',
        'opsi_a': 'Belanda',
        'opsi_b': 'Portugis',
        'opsi_c': 'Inggris',
        'opsi_d': 'Jepang',
        'opsi_e': 'Spanyol',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Candi Borobudur dibangun pada masa kerajaan...',
        'opsi_a': 'Sailendra',
        'opsi_b': 'Majapahit',
        'opsi_c': 'Sriwijaya',
        'opsi_d': 'Mataram Kuno',
        'opsi_e': 'Tarumanegara',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Kerajaan Majapahit mencapai puncak kejayaan di bawah pimpinan...',
        'opsi_a': 'Hayam Wuruk',
        'opsi_b': 'Gajah Mada',
        'opsi_c': 'Raden Wijaya',
        'opsi_d': 'Tribhuwana Tunggadewi',
        'opsi_e': 'Jayanegara',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Sumpah Palapa diucapkan oleh...',
        'opsi_a': 'Gajah Mada',
        'opsi_b': 'Hayam Wuruk',
        'opsi_c': 'Raden Wijaya',
        'opsi_d': 'Tribhuwana Tunggadewi',
        'opsi_e': 'Jayanegara',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Kerajaan Sriwijaya berpusat di...',
        'opsi_a': 'Palembang',
        'opsi_b': 'Jambi',
        'opsi_c': 'Lampung',
        'opsi_d': 'Riau',
        'opsi_e': 'Bengkulu',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Candi Prambanan dibangun untuk memuja...',
        'opsi_a': 'Trimurti (Brahma, Wisnu, Siwa)',
        'opsi_b': 'Buddha',
        'opsi_c': 'Siwa saja',
        'opsi_d': 'Wisnu saja',
        'opsi_e': 'Brahma saja',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Tokoh yang dikenal sebagai "Pahlawan Revolusi" adalah...',
        'opsi_a': 'A.H. Nasution',
        'opsi_b': 'Soedirman',
        'opsi_c': 'Ahmad Yani',
        'opsi_d': 'Gatot Subroto',
        'opsi_e': 'S. Parman',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Pertempuran 10 November diperingati sebagai Hari Pahlawan untuk mengenang...',
        'opsi_a': 'Pertempuran Surabaya',
        'opsi_b': 'Pertempuran Ambarawa',
        'opsi_c': 'Pertempuran Bandung Lautan Api',
        'opsi_d': 'Pertempuran Medan Area',
        'opsi_e': 'Pertempuran Semarang',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Gerakan 30 September 1965 dikaitkan dengan...',
        'opsi_a': 'Partai Komunis Indonesia (PKI)',
        'opsi_b': 'Partai Nasional Indonesia (PNI)',
        'opsi_c': 'Partai Golkar',
        'opsi_d': 'Partai Demokrasi Indonesia (PDI)',
        'opsi_e': 'Partai Persatuan Pembangunan (PPP)',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Tokoh yang dikenal sebagai "Bapak Pembangunan Nasional" adalah...',
        'opsi_a': 'Soeharto',
        'opsi_b': 'Soekarno',
        'opsi_c': 'Moh. Hatta',
        'opsi_d': 'B.J. Habibie',
        'opsi_e': 'Sutan Sjahrir',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Pembentukan Tentara Keamanan Rakyat (TKR) dilaksanakan pada tanggal...',
        'opsi_a': '5 Oktober 1945',
        'opsi_b': '17 Agustus 1945',
        'opsi_c': '18 Agustus 1945',
        'opsi_d': '27 Desember 1949',
        'opsi_e': '1 Juni 1945',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Perjanjian Breda ditandatangani pada tahun...',
        'opsi_a': '1660',
        'opsi_b': '1650',
        'opsi_c': '1670',
        'opsi_d': '1640',
        'opsi_e': '1680',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Kerajaan Tarumanegara dipimpin oleh...',
        'opsi_a': 'Purnawarman',
        'opsi_b': 'Sriwijaya',
        'opsi_c': 'Hayam Wuruk',
        'opsi_d': 'Gajah Mada',
        'opsi_e': 'Raden Wijaya',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Candi Mendut dibangun pada masa kerajaan...',
        'opsi_a': 'Sailendra',
        'opsi_b': 'Majapahit',
        'opsi_c': 'Sriwijaya',
        'opsi_d': 'Mataram Kuno',
        'opsi_e': 'Tarumanegara',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Tokoh yang dikenal sebagai "Bapak Koperasi Indonesia" adalah...',
        'opsi_a': 'Moh. Hatta',
        'opsi_b': 'Soekarno',
        'opsi_c': 'Ki Hajar Dewantara',
        'opsi_d': 'Mr. Muhammad Yamin',
        'opsi_e': 'Sutan Sjahrir',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Pertempuran Ambarawa terjadi pada tahun...',
        'opsi_a': '1945',
        'opsi_b': '1946',
        'opsi_c': '1947',
        'opsi_d': '1948',
        'opsi_e': '1949',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Komando Pasukan Pelajar (KPP) dipimpin oleh...',
        'opsi_a': 'Sutomo',
        'opsi_b': 'Soedirman',
        'opsi_c': 'Ahmad Yani',
        'opsi_d': 'Gatot Subroto',
        'opsi_e': 'Nasution',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Perang Diponegoro terjadi pada tahun...',
        'opsi_a': '1825-1830',
        'opsi_b': '1810-1815',
        'opsi_c': '1830-1835',
        'opsi_d': '1840-1845',
        'opsi_e': '1800-1805',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Tokoh yang dikenal sebagai "Pangeran Diponegoro" adalah...',
        'opsi_a': 'Bendara Raden Mas Mustahar',
        'opsi_b': 'Soedirman',
        'opsi_c': 'Ahmad Yani',
        'opsi_d': 'Gatot Subroto',
        'opsi_e': 'Nasution',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Candi Kalasan dibangun untuk memuja...',
        'opsi_a': 'Buddha',
        'opsi_b': 'Siwa',
        'opsi_c': 'Wisnu',
        'opsi_d': 'Brahma',
        'opsi_e': 'Trimurti',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Pertempuran Bandung Lautan Api terjadi pada tanggal...',
        'opsi_a': '24 Maret 1946',
        'opsi_b': '10 November 1945',
        'opsi_c': '17 Agustus 1945',
        'opsi_d': '28 Oktober 1928',
        'opsi_e': '1 Juni 1945',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Tokoh yang dikenal sebagai "Bapak Pers Nasional" adalah...',
        'opsi_a': 'Sutan Sjahrir',
        'opsi_b': 'Soekarno',
        'opsi_c': 'Moh. Hatta',
        'opsi_d': 'Ki Hajar Dewantara',
        'opsi_e': 'Mr. Muhammad Yamin',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Peristiwa Rengasdengklok terjadi pada tanggal...',
        'opsi_a': '16 Agustus 1945',
        'opsi_b': '17 Agustus 1945',
        'opsi_c': '18 Agustus 1945',
        'opsi_d': '15 Agustus 1945',
        'opsi_e': '14 Agustus 1945',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Tokoh yang dikenal sebagai "Bapak Penerbangan Indonesia" adalah...',
        'opsi_a': 'R.J. Salatun',
        'opsi_b': 'Soekarno',
        'opsi_c': 'Moh. Hatta',
        'opsi_d': 'Ki Hajar Dewantara',
        'opsi_e': 'Mr. Muhammad Yamin',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Perang Aceh terjadi pada tahun...',
        'opsi_a': '1873-1904',
        'opsi_b': '1825-1830',
        'opsi_c': '1810-1815',
        'opsi_d': '1840-1845',
        'opsi_e': '1860-1865',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Tokoh yang dikenal sebagai "Bapak Kesehatan Indonesia" adalah...',
        'opsi_a': 'Dr. G.S.S.J. Ratulangi',
        'opsi_b': 'Soekarno',
        'opsi_c': 'Moh. Hatta',
        'opsi_d': 'Ki Hajar Dewantara',
        'opsi_e': 'Mr. Muhammad Yamin',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Candi Sari dibangun pada masa kerajaan...',
        'opsi_a': 'Sailendra',
        'opsi_b': 'Majapahit',
        'opsi_c': 'Sriwijaya',
        'opsi_d': 'Mataram Kuno',
        'opsi_e': 'Tarumanegara',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Perjanjian Giyanti ditandatangani pada tahun...',
        'opsi_a': '1755',
        'opsi_b': '1745',
        'opsi_c': '1765',
        'opsi_d': '1735',
        'opsi_e': '1775',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Tokoh yang dikenal sebagai "Bapak Kebahasaan Indonesia" adalah...',
        'opsi_a': 'Sutan Takdir Alisyahbana',
        'opsi_b': 'Soekarno',
        'opsi_c': 'Moh. Hatta',
        'opsi_d': 'Ki Hajar Dewantara',
        'opsi_e': 'Mr. Muhammad Yamin',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Pertempuran Medan Area terjadi pada tahun...',
        'opsi_a': '1945-1946',
        'opsi_b': '1946-1947',
        'opsi_c': '1947-1948',
        'opsi_d': '1948-1949',
        'opsi_e': '1949-1950',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Tokoh yang dikenal sebagai "Bapak Kebudayaan Indonesia" adalah...',
        'opsi_a': 'Ki Hajar Dewantara',
        'opsi_b': 'Soekarno',
        'opsi_c': 'Moh. Hatta',
        'opsi_d': 'Mr. Muhammad Yamin',
        'opsi_e': 'Sutan Sjahrir',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Kerajaan Kalingga berpusat di...',
        'opsi_a': 'Jawa Tengah',
        'opsi_b': 'Jawa Barat',
        'opsi_c': 'Jawa Timur',
        'opsi_d': 'Sumatera',
        'opsi_e': 'Kalimantan',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Perjanjian Linggarjati ditandatangani pada tanggal...',
        'opsi_a': '15 November 1946',
        'opsi_b': '17 Agustus 1945',
        'opsi_c': '18 Agustus 1945',
        'opsi_d': '27 Desember 1949',
        'opsi_e': '1 Juni 1945',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Tokoh yang dikenal sebagai "Bapak Pendidikan Indonesia" adalah...',
        'opsi_a': 'Ki Hajar Dewantara',
        'opsi_b': 'Soekarno',
        'opsi_c': 'Moh. Hatta',
        'opsi_d': 'Mr. Muhammad Yamin',
        'opsi_e': 'Sutan Sjahrir',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Candi Sewu dibangun pada masa kerajaan...',
        'opsi_a': 'Majapahit',
        'opsi_b': 'Sailendra',
        'opsi_c': 'Sriwijaya',
        'opsi_d': 'Mataram Kuno',
        'opsi_e': 'Tarumanegara',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Perjanjian Kluang ditandatangani pada tahun...',
        'opsi_a': '1946',
        'opsi_b': '1945',
        'opsi_c': '1947',
        'opsi_d': '1948',
        'opsi_e': '1949',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Tokoh yang dikenal sebagai "Bapak Pendidikan Tinggi Indonesia" adalah...',
        'opsi_a': 'Mr. Muhammad Yamin',
        'opsi_b': 'Soekarno',
        'opsi_c': 'Moh. Hatta',
        'opsi_d': 'Ki Hajar Dewantara',
        'opsi_e': 'Sutan Sjahrir',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Candi Plaosan dibangun pada masa kerajaan...',
        'opsi_a': 'Sailendra',
        'opsi_b': 'Majapahit',
        'opsi_c': 'Sriwijaya',
        'opsi_d': 'Mataram Kuno',
        'opsi_e': 'Tarumanegara',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Perjanjian Renville ditandatangani pada tanggal...',
        'opsi_a': '17 Januari 1948',
        'opsi_b': '17 Agustus 1945',
        'opsi_c': '18 Agustus 1945',
        'opsi_d': '27 Desember 1949',
        'opsi_e': '1 Juni 1945',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Tokoh yang dikenal sebagai "Bapak Ekonomi Indonesia" adalah...',
        'opsi_a': 'Moh. Hatta',
        'opsi_b': 'Soekarno',
        'opsi_c': 'Ki Hajar Dewantara',
        'opsi_d': 'Mr. Muhammad Yamin',
        'opsi_e': 'Sutan Sjahrir',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Kerajaan Mataram Islam didirikan oleh...',
        'opsi_a': 'Sutawijaya',
        'opsi_b': 'Senopati',
        'opsi_c': 'Agung Hanyokrokati',
        'opsi_d': 'Panembahan Senopati',
        'opsi_e': 'Ki Ageng Pemanahan',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Perjanjian Bongaya ditandatangani pada tahun...',
        'opsi_a': '1667',
        'opsi_b': '1677',
        'opsi_c': '1657',
        'opsi_d': '1687',
        'opsi_e': '1647',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Tokoh yang dikenal sebagai "Bapak Demokrasi Indonesia" adalah...',
        'opsi_a': 'Moh. Hatta',
        'opsi_b': 'Soekarno',
        'opsi_c': 'Ki Hajar Dewantara',
        'opsi_d': 'Mr. Muhammad Yamin',
        'opsi_e': 'Sutan Sjahrir',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Pertempuran Margarana terjadi pada tahun...',
        'opsi_a': '1946',
        'opsi_b': '1945',
        'opsi_c': '1947',
        'opsi_d': '1948',
        'opsi_e': '1949',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Tokoh yang dikenal sebagai "Bapak Kemerdekaan Indonesia" adalah...',
        'opsi_a': 'Ir. Soekarno',
        'opsi_b': 'Moh. Hatta',
        'opsi_c': 'Ki Hajar Dewantara',
        'opsi_d': 'Mr. Muhammad Yamin',
        'opsi_e': 'Sutan Sjahrir',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Kerajaan Kutai berpusat di...',
        'opsi_a': 'Kalimantan Timur',
        'opsi_b': 'Kalimantan Barat',
        'opsi_c': 'Kalimantan Selatan',
        'opsi_d': 'Kalimantan Tengah',
        'opsi_e': 'Kalimantan Utara',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Perjanjian London ditandatangani pada tanggal...',
        'opsi_a': '8 Desember 1949',
        'opsi_b': '17 Agustus 1945',
        'opsi_c': '18 Agustus 1945',
        'opsi_d': '27 Desember 1949',
        'opsi_e': '1 Juni 1945',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Tokoh yang dikenal sebagai "Bapak Angkatan Bersenjata Indonesia" adalah...',
        'opsi_a': 'Jenderal A.H. Nasution',
        'opsi_b': 'Soekarno',
        'opsi_c': 'Moh. Hatta',
        'opsi_d': 'Ki Hajar Dewantara',
        'opsi_e': 'Sutan Sjahrir',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Candi Pawon dibangun pada masa kerajaan...',
        'opsi_a': 'Sailendra',
        'opsi_b': 'Majapahit',
        'opsi_c': 'Sriwijaya',
        'opsi_d': 'Mataram Kuno',
        'opsi_e': 'Tarumanegara',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Perjanjian Tuntang ditandatangani pada tahun...',
        'opsi_a': '1824',
        'opsi_b': '1814',
        'opsi_c': '1834',
        'opsi_d': '1844',
        'opsi_e': '1854',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Tokoh yang dikenal sebagai "Bapak Proklamator Indonesia" adalah...',
        'opsi_a': 'Ir. Soekarno',
        'opsi_b': 'Moh. Hatta',
        'opsi_c': 'Ki Hajar Dewantara',
        'opsi_d': 'Mr. Muhammad Yamin',
        'opsi_e': 'Sutan Sjahrir',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Candi Ijo dibangun pada masa kerajaan...',
        'opsi_a': 'Majapahit',
        'opsi_b': 'Sailendra',
        'opsi_c': 'Sriwijaya',
        'opsi_d': 'Mataram Kuno',
        'opsi_e': 'Tarumanegara',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Perjanjian Simbang ditandatangani pada tahun...',
        'opsi_a': '1946',
        'opsi_b': '1945',
        'opsi_c': '1947',
        'opsi_d': '1948',
        'opsi_e': '1949',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Tokoh yang dikenal sebagai "Bapak Persatuan Nasional" adalah...',
        'opsi_a': 'Ir. Soekarno',
        'opsi_b': 'Moh. Hatta',
        'opsi_c': 'Ki Hajar Dewantara',
        'opsi_d': 'Mr. Muhammad Yamin',
        'opsi_e': 'Sutan Sjahrir',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Kerajaan Pajajaran berpusat di...',
        'opsi_a': 'Jawa Barat',
        'opsi_b': 'Jawa Tengah',
        'opsi_c': 'Jawa Timur',
        'opsi_d': 'Sumatera',
        'opsi_e': 'Kalimantan',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Perjanjian Salatiga ditandatangani pada tahun...',
        'opsi_a': '1757',
        'opsi_b': '1747',
        'opsi_c': '1767',
        'opsi_d': '1737',
        'opsi_e': '1777',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Tokoh yang dikenal sebagai "Bapak Revolusi Indonesia" adalah...',
        'opsi_a': 'A.H. Nasution',
        'opsi_b': 'Soekarno',
        'opsi_c': 'Moh. Hatta',
        'opsi_d': 'Ki Hajar Dewantara',
        'opsi_e': 'Sutan Sjahrir',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Pertempuran Palembang terjadi pada tahun...',
        'opsi_a': '1945-1947',
        'opsi_b': '1946-1948',
        'opsi_c': '1947-1949',
        'opsi_d': '1948-1950',
        'opsi_e': '1949-1951',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Tokoh yang dikenal sebagai "Bapak Pendidikan Nasional" adalah...',
        'opsi_a': 'Ki Hajar Dewantara',
        'opsi_b': 'Soekarno',
        'opsi_c': 'Moh. Hatta',
        'opsi_d': 'Mr. Muhammad Yamin',
        'opsi_e': 'Sutan Sjahrir',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Kerajaan Banten berpusat di...',
        'opsi_a': 'Banten',
        'opsi_b': 'Jawa Tengah',
        'opsi_c': 'Jawa Timur',
        'opsi_d': 'Sumatera',
        'opsi_e': 'Kalimantan',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Perjanjian Mataram ditandatangani pada tahun...',
        'opsi_a': '1705',
        'opsi_b': '1695',
        'opsi_c': '1715',
        'opsi_d': '1685',
        'opsi_e': '1725',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Tokoh yang dikenal sebagai "Bapak Orde Baru" adalah...',
        'opsi_a': 'Soeharto',
        'opsi_b': 'Soekarno',
        'opsi_c': 'Moh. Hatta',
        'opsi_d': 'Ki Hajar Dewantara',
        'opsi_e': 'Sutan Sjahrir',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Candi Ratu Boko dibangun pada masa kerajaan...',
        'opsi_a': 'Majapahit',
        'opsi_b': 'Sailendra',
        'opsi_c': 'Sriwijaya',
        'opsi_d': 'Mataram Kuno',
        'opsi_e': 'Tarumanegara',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Perjanjian Bayat ditandatangani pada tahun...',
        'opsi_a': '1755',
        'opsi_b': '1745',
        'opsi_c': '1765',
        'opsi_d': '1735',
        'opsi_e': '1775',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Tokoh yang dikenal sebagai "Bapak Reformasi Indonesia" adalah...',
        'opsi_a': 'B.J. Habibie',
        'opsi_b': 'Soeharto',
        'opsi_c': 'Soekarno',
        'opsi_d': 'Megawati',
        'opsi_e': 'Gus Dur',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Candi Borobudur dibangun pada masa kerajaan...',
        'opsi_a': 'Sailendra',
        'opsi_b': 'Majapahit',
        'opsi_c': 'Sriwijaya',
        'opsi_d': 'Mataram Kuno',
        'opsi_e': 'Tarumanegara',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Perjanjian Krama ditandatangani pada tahun...',
        'opsi_a': '1947',
        'opsi_b': '1946',
        'opsi_c': '1948',
        'opsi_d': '1945',
        'opsi_e': '1949',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Tokoh yang dikenal sebagai "Bapak Pergerakan Nasional" adalah...',
        'opsi_a': 'Dr. Wahidin Soedirohoesodo',
        'opsi_b': 'Soekarno',
        'opsi_c': 'Moh. Hatta',
        'opsi_d': 'Ki Hajar Dewantara',
        'opsi_e': 'Sutan Sjahrir',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Kerajaan Sriwijaya berpusat di...',
        'opsi_a': 'Sumatera',
        'opsi_b': 'Jawa',
        'opsi_c': 'Kalimantan',
        'opsi_d': 'Sulawesi',
        'opsi_e': 'Papua',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Perjanjian Pangkal Pinang ditandatangani pada tahun...',
        'opsi_a': '1946',
        'opsi_b': '1945',
        'opsi_c': '1947',
        'opsi_d': '1948',
        'opsi_e': '1949',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Tokoh yang dikenal sebagai "Bapak Koperasi Indonesia" adalah...',
        'opsi_a': 'Moh. Hatta',
        'opsi_b': 'Soekarno',
        'opsi_c': 'Ki Hajar Dewantara',
        'opsi_d': 'Mr. Muhammad Yamin',
        'opsi_e': 'Sutan Sjahrir',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Pertempuran Surabaya terjadi pada tahun...',
        'opsi_a': '1945',
        'opsi_b': '1946',
        'opsi_c': '1947',
        'opsi_d': '1948',
        'opsi_e': '1949',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Tokoh yang dikenal sebagai "Bapak TNI" adalah...',
        'opsi_a': 'Jenderal Soedirman',
        'opsi_b': 'Soekarno',
        'opsi_c': 'Moh. Hatta',
        'opsi_d': 'Ki Hajar Dewantara',
        'opsi_e': 'Sutan Sjahrir',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Kerajaan Majapahit berpusat di...',
        'opsi_a': 'Jawa Timur',
        'opsi_b': 'Jawa Tengah',
        'opsi_c': 'Jawa Barat',
        'opsi_d': 'Sumatera',
        'opsi_e': 'Kalimantan',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Perjanjian Roem-Roijen ditandatangani pada tanggal...',
        'opsi_a': '7 Mei 1949',
        'opsi_b': '17 Agustus 1945',
        'opsi_c': '18 Agustus 1945',
        'opsi_d': '27 Desember 1949',
        'opsi_e': '1 Juni 1945',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Tokoh yang dikenal sebagai "Bapak Militer Indonesia" adalah...',
        'opsi_a': 'Jenderal A.H. Nasution',
        'opsi_b': 'Soekarno',
        'opsi_c': 'Moh. Hatta',
        'opsi_d': 'Ki Hajar Dewantara',
        'opsi_e': 'Sutan Sjahrir',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Candi Prambanan dibangun pada masa kerajaan...',
        'opsi_a': 'Majapahit',
        'opsi_b': 'Sailendra',
        'opsi_c': 'Sriwijaya',
        'opsi_d': 'Mataram Kuno',
        'opsi_e': 'Tarumanegara',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Perjanjian Sarip Soemah ditandatangani pada tahun...',
        'opsi_a': '1963',
        'opsi_b': '1945',
        'opsi_c': '1950',
        'opsi_d': '1955',
        'opsi_e': '1970',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Tokoh yang dikenal sebagai "Bapak Kedaulatan Rakyat" adalah...',
        'opsi_a': 'Moh. Hatta',
        'opsi_b': 'Soekarno',
        'opsi_c': 'Ki Hajar Dewantara',
        'opsi_d': 'Mr. Muhammad Yamin',
        'opsi_e': 'Sutan Sjahrir',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Candi Kalasan dibangun pada masa kerajaan...',
        'opsi_a': 'Sailendra',
        'opsi_b': 'Majapahit',
        'opsi_c': 'Sriwijaya',
        'opsi_d': 'Mataram Kuno',
        'opsi_e': 'Tarumanegara',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Perjanjian Linggarjati ditandatangani pada tanggal...',
        'opsi_a': '15 November 1946',
        'opsi_b': '17 Agustus 1945',
        'opsi_c': '18 Agustus 1945',
        'opsi_d': '27 Desember 1949',
        'opsi_e': '1 Juni 1945',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Tokoh yang dikenal sebagai "Bapak Kebangkitan Nasional" adalah...',
        'opsi_a': 'Dr. Wahidin Soedirohoesodo',
        'opsi_b': 'Soekarno',
        'opsi_c': 'Moh. Hatta',
        'opsi_d': 'Ki Hajar Dewantara',
        'opsi_e': 'Sutan Sjahrir',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Kerajaan Tarumanegara berpusat di...',
        'opsi_a': 'Jawa Barat',
        'opsi_b': 'Jawa Tengah',
        'opsi_c': 'Jawa Timur',
        'opsi_d': 'Sumatera',
        'opsi_e': 'Kalimantan',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Perjanjian Giyanti ditandatangani pada tahun...',
        'opsi_a': '1755',
        'opsi_b': '1745',
        'opsi_c': '1765',
        'opsi_d': '1735',
        'opsi_e': '1775',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Tokoh yang dikenal sebagai "Bapak TNI-AD" adalah...',
        'opsi_a': 'Jenderal A.H. Nasution',
        'opsi_b': 'Soekarno',
        'opsi_c': 'Moh. Hatta',
        'opsi_d': 'Ki Hajar Dewantara',
        'opsi_e': 'Sutan Sjahrir',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Pertempuran Ambarawa terjadi pada tahun...',
        'opsi_a': '1945',
        'opsi_b': '1946',
        'opsi_c': '1947',
        'opsi_d': '1948',
        'opsi_e': '1949',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Tokoh yang dikenal sebagai "Bapak Kebijakan Otonomi Daerah" adalah...',
        'opsi_a': 'Moh. Hatta',
        'opsi_b': 'Soekarno',
        'opsi_c': 'Ki Hajar Dewantara',
        'opsi_d': 'Mr. Muhammad Yamin',
        'opsi_e': 'Sutan Sjahrir',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Kerajaan Kalingga berpusat di...',
        'opsi_a': 'Jawa Tengah',
        'opsi_b': 'Jawa Barat',
        'opsi_c': 'Jawa Timur',
        'opsi_d': 'Sumatera',
        'opsi_e': 'Kalimantan',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Perjanjian Pangandaran ditandatangani pada tahun...',
        'opsi_a': '1635',
        'opsi_b': '1645',
        'opsi_c': '1625',
        'opsi_d': '1615',
        'opsi_e': '1655',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Tokoh yang dikenal sebagai "Bapak Angkatan Udara Indonesia" adalah...',
        'opsi_a': 'Marsekal TNI (Purn) Haryono',
        'opsi_b': 'Soekarno',
        'opsi_c': 'Moh. Hatta',
        'opsi_d': 'Ki Hajar Dewantara',
        'opsi_e': 'Sutan Sjahrir',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Candi Mendut dibangun pada masa kerajaan...',
        'opsi_a': 'Sailendra',
        'opsi_b': 'Majapahit',
        'opsi_c': 'Sriwijaya',
        'opsi_d': 'Mataram Kuno',
        'opsi_e': 'Tarumanegara',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Perjanjian Cirebon ditandatangani pada tahun...',
        'opsi_a': '1677',
        'opsi_b': '1687',
        'opsi_c': '1667',
        'opsi_d': '1697',
        'opsi_e': '1657',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Tokoh yang dikenal sebagai "Bapak Koperasi Indonesia" adalah...',
        'opsi_a': 'Moh. Hatta',
        'opsi_b': 'Soekarno',
        'opsi_c': 'Ki Hajar Dewantara',
        'opsi_d': 'Mr. Muhammad Yamin',
        'opsi_e': 'Sutan Sjahrir',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Candi Sewu dibangun pada masa kerajaan...',
        'opsi_a': 'Majapahit',
        'opsi_b': 'Sailendra',
        'opsi_c': 'Sriwijaya',
        'opsi_d': 'Mataram Kuno',
        'opsi_e': 'Tarumanegara',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Perjanjian Breda ditandatangani pada tahun...',
        'opsi_a': '1667',
        'opsi_b': '1657',
        'opsi_c': '1677',
        'opsi_d': '1647',
        'opsi_e': '1687',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Tokoh yang dikenal sebagai "Bapak Penerbangan Indonesia" adalah...',
        'opsi_a': 'Achmad Yani',
        'opsi_b': 'Soekarno',
        'opsi_c': 'Moh. Hatta',
        'opsi_d': 'Ki Hajar Dewantara',
        'opsi_e': 'Sutan Sjahrir',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Kerajaan Mataram Kuno berpusat di...',
        'opsi_a': 'Jawa Tengah',
        'opsi_b': 'Jawa Barat',
        'opsi_c': 'Jawa Timur',
        'opsi_d': 'Sumatera',
        'opsi_e': 'Kalimantan',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Perjanjian Giyanti ditandatangani pada tahun...',
        'opsi_a': '1755',
        'opsi_b': '1745',
        'opsi_c': '1765',
        'opsi_d': '1735',
        'opsi_e': '1775',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Tokoh yang dikenal sebagai "Bapak Hukum Indonesia" adalah...',
        'opsi_a': 'Prof. Dr. Subekti',
        'opsi_b': 'Soekarno',
        'opsi_c': 'Moh. Hatta',
        'opsi_d': 'Ki Hajar Dewantara',
        'opsi_e': 'Sutan Sjahrir',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Pertempuran Bandung Lautan Api terjadi pada tahun...',
        'opsi_a': '1946',
        'opsi_b': '1945',
        'opsi_c': '1947',
        'opsi_d': '1948',
        'opsi_e': '1949',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Tokoh yang dikenal sebagai "Bapak Kebahasaan Indonesia" adalah...',
        'opsi_a': 'Ernest Douwes Dekker',
        'opsi_b': 'Soekarno',
        'opsi_c': 'Moh. Hatta',
        'opsi_d': 'Ki Hajar Dewantara',
        'opsi_e': 'Sutan Sjahrir',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Kerajaan Holing berpusat di...',
        'opsi_a': 'Jawa Tengah',
        'opsi_b': 'Jawa Barat',
        'opsi_c': 'Jawa Timur',
        'opsi_d': 'Sumatera',
        'opsi_e': 'Kalimantan',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Perjanjian Tuntang ditandatangani pada tahun...',
        'opsi_a': '1824',
        'opsi_b': '1814',
        'opsi_c': '1834',
        'opsi_d': '1844',
        'opsi_e': '1854',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Tokoh yang dikenal sebagai "Bapak Kepolisian Indonesia" adalah...',
        'opsi_a': 'Jenderal Polisi (Purn) Hoegeng',
        'opsi_b': 'Soekarno',
        'opsi_c': 'Moh. Hatta',
        'opsi_d': 'Ki Hajar Dewantara',
        'opsi_e': 'Sutan Sjahrir',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Candi Sari dibangun pada masa kerajaan...',
        'opsi_a': 'Sailendra',
        'opsi_b': 'Majapahit',
        'opsi_c': 'Sriwijaya',
        'opsi_d': 'Mataram Kuno',
        'opsi_e': 'Tarumanegara',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Perjanjian Siau ditandatangani pada tahun...',
        'opsi_a': '1677',
        'opsi_b': '1687',
        'opsi_c': '1667',
        'opsi_d': '1697',
        'opsi_e': '1657',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Tokoh yang dikenal sebagai "Bapak BUMN Indonesia" adalah...',
        'opsi_a': 'Moh. Hatta',
        'opsi_b': 'Soekarno',
        'opsi_c': 'Ki Hajar Dewantara',
        'opsi_d': 'Mr. Muhammad Yamin',
        'opsi_e': 'Sutan Sjahrir',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Candi Ngawen dibangun pada masa kerajaan...',
        'opsi_a': 'Sailendra',
        'opsi_b': 'Majapahit',
        'opsi_c': 'Sriwijaya',
        'opsi_d': 'Mataram Kuno',
        'opsi_e': 'Tarumanegara',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Perjanjian Tuntang ditandatangani pada tahun...',
        'opsi_a': '1824',
        'opsi_b': '1814',
        'opsi_c': '1834',
        'opsi_d': '1844',
        'opsi_e': '1854',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Tokoh yang dikenal sebagai "Bapak Kebudayaan Indonesia" adalah...',
        'opsi_a': 'Ki Hajar Dewantara',
        'opsi_b': 'Soekarno',
        'opsi_c': 'Moh. Hatta',
        'opsi_d': 'Mr. Muhammad Yamin',
        'opsi_e': 'Sutan Sjahrir',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Kerajaan Melayu berpusat di...',
        'opsi_a': 'Sumatera',
        'opsi_b': 'Jawa',
        'opsi_c': 'Kalimantan',
        'opsi_d': 'Sulawesi',
        'opsi_e': 'Papua',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Perjanjian Pangkal Pinang ditandatangani pada tahun...',
        'opsi_a': '1946',
        'opsi_b': '1945',
        'opsi_c': '1947',
        'opsi_d': '1948',
        'opsi_e': '1949',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Tokoh yang dikenal sebagai "Bapak Kesejahteraan Sosial Indonesia" adalah...',
        'opsi_a': 'Moh. Hatta',
        'opsi_b': 'Soekarno',
        'opsi_c': 'Ki Hajar Dewantara',
        'opsi_d': 'Mr. Muhammad Yamin',
        'opsi_e': 'Sutan Sjahrir',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Pertempuran Yogyakarta terjadi pada tahun...',
        'opsi_a': '1945',
        'opsi_b': '1946',
        'opsi_c': '1947',
        'opsi_d': '1948',
        'opsi_e': '1949',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Tokoh yang dikenal sebagai "Bapak Kemerdekaan Indonesia" adalah...',
        'opsi_a': 'Ir. Soekarno',
        'opsi_b': 'Moh. Hatta',
        'opsi_c': 'Ki Hajar Dewantara',
        'opsi_d': 'Mr. Muhammad Yamin',
        'opsi_e': 'Sutan Sjahrir',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Kerajaan Singosari berpusat di...',
        'opsi_a': 'Jawa Timur',
        'opsi_b': 'Jawa Tengah',
        'opsi_c': 'Jawa Barat',
        'opsi_d': 'Sumatera',
        'opsi_e': 'Kalimantan',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Perjanjian Linggarjati ditandatangani pada tanggal...',
        'opsi_a': '15 November 1946',
        'opsi_b': '17 Agustus 1945',
        'opsi_c': '18 Agustus 1945',
        'opsi_d': '27 Desember 1949',
        'opsi_e': '1 Juni 1945',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Tokoh yang dikenal sebagai "Bapak Diplomasi Indonesia" adalah...',
        'opsi_a': 'Sutan Sjahrir',
        'opsi_b': 'Soekarno',
        'opsi_c': 'Moh. Hatta',
        'opsi_d': 'Ki Hajar Dewantara',
        'opsi_e': 'Mr. Muhammad Yamin',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Candi Banyunibo dibangun pada masa kerajaan...',
        'opsi_a': 'Majapahit',
        'opsi_b': 'Sailendra',
        'opsi_c': 'Sriwijaya',
        'opsi_d': 'Mataram Kuno',
        'opsi_e': 'Tarumanegara',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Perjanjian Krama ditandatangani pada tahun...',
        'opsi_a': '1947',
        'opsi_b': '1946',
        'opsi_c': '1948',
        'opsi_d': '1945',
        'opsi_e': '1949',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Tokoh yang dikenal sebagai "Bapak Kesehatan Indonesia" adalah...',
        'opsi_a': 'Dr. G.S.S.J. Ratulangi',
        'opsi_b': 'Soekarno',
        'opsi_c': 'Moh. Hatta',
        'opsi_d': 'Ki Hajar Dewantara',
        'opsi_e': 'Sutan Sjahrir',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Candi Plaosan dibangun pada masa kerajaan...',
        'opsi_a': 'Sailendra',
        'opsi_b': 'Majapahit',
        'opsi_c': 'Sriwijaya',
        'opsi_d': 'Mataram Kuno',
        'opsi_e': 'Tarumanegara',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Perjanjian Renville ditandatangani pada tanggal...',
        'opsi_a': '17 Januari 1948',
        'opsi_b': '17 Agustus 1945',
        'opsi_c': '18 Agustus 1945',
        'opsi_d': '27 Desember 1949',
        'opsi_e': '1 Juni 1945',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Tokoh yang dikenal sebagai "Bapak Pendidikan Nasional" adalah...',
        'opsi_a': 'Ki Hajar Dewantara',
        'opsi_b': 'Soekarno',
        'opsi_c': 'Moh. Hatta',
        'opsi_d': 'Mr. Muhammad Yamin',
        'opsi_e': 'Sutan Sjahrir',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Kerajaan Sriwijaya berpusat di...',
        'opsi_a': 'Sumatera',
        'opsi_b': 'Jawa',
        'opsi_c': 'Kalimantan',
        'opsi_d': 'Sulawesi',
        'opsi_e': 'Papua',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Perjanjian Roem-Royen ditandatangani pada tahun...',
        'opsi_a': '1949',
        'opsi_b': '1948',
        'opsi_c': '1950',
        'opsi_d': '1947',
        'opsi_e': '1945',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Tokoh yang dikenal sebagai "Bapak Ekonomi Indonesia" adalah...',
        'opsi_a': 'Moh. Hatta',
        'opsi_b': 'Soekarno',
        'opsi_c': 'Ki Hajar Dewantara',
        'opsi_d': 'Mr. Muhammad Yamin',
        'opsi_e': 'Sutan Sjahrir',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Pertempuran Surabaya terjadi pada tahun...',
        'opsi_a': '1945',
        'opsi_b': '1946',
        'opsi_c': '1947',
        'opsi_d': '1948',
        'opsi_e': '1949',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Tokoh yang dikenal sebagai "Bapak Pers Indonesia" adalah...',
        'opsi_a': 'Ir. Soekarno',
        'opsi_b': 'Moh. Hatta',
        'opsi_c': 'Ki Hajar Dewantara',
        'opsi_d': 'Mr. Muhammad Yamin',
        'opsi_e': 'Sutan Sjahrir',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Kerajaan Kediri berpusat di...',
        'opsi_a': 'Jawa Timur',
        'opsi_b': 'Jawa Tengah',
        'opsi_c': 'Jawa Barat',
        'opsi_d': 'Sumatera',
        'opsi_e': 'Kalimantan',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Perjanjian Breda ditandatangani pada tahun...',
        'opsi_a': '1667',
        'opsi_b': '1657',
        'opsi_c': '1677',
        'opsi_d': '1647',
        'opsi_e': '1687',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Tokoh yang dikenal sebagai "Bapak Persatuan Indonesia" adalah...',
        'opsi_a': 'Ir. Soekarno',
        'opsi_b': 'Moh. Hatta',
        'opsi_c': 'Ki Hajar Dewantara',
        'opsi_d': 'Mr. Muhammad Yamin',
        'opsi_e': 'Sutan Sjahrir',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Candi Pawon dibangun pada masa kerajaan...',
        'opsi_a': 'Sailendra',
        'opsi_b': 'Majapahit',
        'opsi_c': 'Sriwijaya',
        'opsi_d': 'Mataram Kuno',
        'opsi_e': 'Tarumanegara',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Perjanjian Salatiga ditandatangani pada tahun...',
        'opsi_a': '1757',
        'opsi_b': '1747',
        'opsi_c': '1767',
        'opsi_d': '1737',
        'opsi_e': '1777',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Tokoh yang dikenal sebagai "Bapak Militer Indonesia" adalah...',
        'opsi_a': 'Jenderal A.H. Nasution',
        'opsi_b': 'Soekarno',
        'opsi_c': 'Moh. Hatta',
        'opsi_d': 'Ki Hajar Dewantara',
        'opsi_e': 'Sutan Sjahrir',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Candi Borobudur dibangun pada masa kerajaan...',
        'opsi_a': 'Sailendra',
        'opsi_b': 'Majapahit',
        'opsi_c': 'Sriwijaya',
        'opsi_d': 'Mataram Kuno',
        'opsi_e': 'Tarumanegara',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Perjanjian Jakarta ditandatangani pada tahun...',
        'opsi_a': '1946',
        'opsi_b': '1945',
        'opsi_c': '1947',
        'opsi_d': '1948',
        'opsi_e': '1949',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Tokoh yang dikenal sebagai "Bapak Kependudukan Indonesia" adalah...',
        'opsi_a': 'Prof. Dr. Widjojo Nitisastro',
        'opsi_b': 'Soekarno',
        'opsi_c': 'Moh. Hatta',
        'opsi_d': 'Ki Hajar Dewantara',
        'opsi_e': 'Sutan Sjahrir',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Kerajaan Kutai berpusat di...',
        'opsi_a': 'Kalimantan',
        'opsi_b': 'Sumatera',
        'opsi_c': 'Jawa',
        'opsi_d': 'Sulawesi',
        'opsi_e': 'Papua',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Perjanjian Pangandaran ditandatangani pada tahun...',
        'opsi_a': '1635',
        'opsi_b': '1645',
        'opsi_c': '1625',
        'opsi_d': '1615',
        'opsi_e': '1655',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Tokoh yang dikenal sebagai "Bapak Pendidikan Tinggi Indonesia" adalah...',
        'opsi_a': 'Prof. Dr. Sjarifuddin Sjahrir',
        'opsi_b': 'Soekarno',
        'opsi_c': 'Moh. Hatta',
        'opsi_d': 'Ki Hajar Dewantara',
        'opsi_e': 'Sutan Sjahrir',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Pertempuran Semarang terjadi pada tahun...',
        'opsi_a': '1945',
        'opsi_b': '1946',
        'opsi_c': '1947',
        'opsi_d': '1948',
        'opsi_e': '1949',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Tokoh yang dikenal sebagai "Bapak Kehutanan Indonesia" adalah...',
        'opsi_a': 'Prof. Dr. Ir. Soenarjo',
        'opsi_b': 'Soekarno',
        'opsi_c': 'Moh. Hatta',
        'opsi_d': 'Ki Hajar Dewantara',
        'opsi_e': 'Sutan Sjahrir',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Kerajaan Pajajaran berpusat di...',
        'opsi_a': 'Jawa Barat',
        'opsi_b': 'Jawa Tengah',
        'opsi_c': 'Jawa Timur',
        'opsi_d': 'Sumatera',
        'opsi_e': 'Kalimantan',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Perjanjian Cirebon ditandatangani pada tahun...',
        'opsi_a': '1677',
        'opsi_b': '1687',
        'opsi_c': '1667',
        'opsi_d': '1697',
        'opsi_e': '1657',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Tokoh yang dikenal sebagai "Bapak Statistik Indonesia" adalah...',
        'opsi_a': 'Prof. Dr. Sudjana',
        'opsi_b': 'Soekarno',
        'opsi_c': 'Moh. Hatta',
        'opsi_d': 'Ki Hajar Dewantara',
        'opsi_e': 'Sutan Sjahrir',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Candi Prambanan dibangun pada masa kerajaan...',
        'opsi_a': 'Mataram Kuno',
        'opsi_b': 'Majapahit',
        'opsi_c': 'Sriwijaya',
        'opsi_d': 'Sailendra',
        'opsi_e': 'Tarumanegara',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Perjanjian Bongaya ditandatangani pada tahun...',
        'opsi_a': '1667',
        'opsi_b': '1657',
        'opsi_c': '1677',
        'opsi_d': '1647',
        'opsi_e': '1687',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Tokoh yang dikenal sebagai "Bapak Penerangan Indonesia" adalah...',
        'opsi_a': 'Moh. Hatta',
        'opsi_b': 'Soekarno',
        'opsi_c': 'Ki Hajar Dewantara',
        'opsi_d': 'Mr. Muhammad Yamin',
        'opsi_e': 'Sutan Sjahrir',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Candi Penataran dibangun pada masa kerajaan...',
        'opsi_a': 'Majapahit',
        'opsi_b': 'Sailendra',
        'opsi_c': 'Sriwijaya',
        'opsi_d': 'Mataram Kuno',
        'opsi_e': 'Tarumanegara',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Perjanjian Siau ditandatangani pada tahun...',
        'opsi_a': '1677',
        'opsi_b': '1687',
        'opsi_c': '1667',
        'opsi_d': '1697',
        'opsi_e': '1657',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Tokoh yang dikenal sebagai "Bapak Koperasi Indonesia" adalah...',
        'opsi_a': 'Moh. Hatta',
        'opsi_b': 'Soekarno',
        'opsi_c': 'Ki Hajar Dewantara',
        'opsi_d': 'Mr. Muhammad Yamin',
        'opsi_e': 'Sutan Sjahrir',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Kerajaan Tarumanegara berpusat di...',
        'opsi_a': 'Jawa Barat',
        'opsi_b': 'Jawa Tengah',
        'opsi_c': 'Jawa Timur',
        'opsi_d': 'Sumatera',
        'opsi_e': 'Kalimantan',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Perjanjian Tuntang ditandatangani pada tahun...',
        'opsi_a': '1824',
        'opsi_b': '1814',
        'opsi_c': '1834',
        'opsi_d': '1844',
        'opsi_e': '1854',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Tokoh yang dikenal sebagai "Bapak Kebahasaan Indonesia" adalah...',
        'opsi_a': 'Ernest Douwes Dekker',
        'opsi_b': 'Soekarno',
        'opsi_c': 'Moh. Hatta',
        'opsi_d': 'Ki Hajar Dewantara',
        'opsi_e': 'Sutan Sjahrir',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Pertempuran Medan Area terjadi pada tahun...',
        'opsi_a': '1945',
        'opsi_b': '1946',
        'opsi_c': '1947',
        'opsi_d': '1948',
        'opsi_e': '1949',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Tokoh yang dikenal sebagai "Bapak Kebudayaan Indonesia" adalah...',
        'opsi_a': 'Ki Hajar Dewantara',
        'opsi_b': 'Soekarno',
        'opsi_c': 'Moh. Hatta',
        'opsi_d': 'Mr. Muhammad Yamin',
        'opsi_e': 'Sutan Sjahrir',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Kerajaan Holing berpusat di...',
        'opsi_a': 'Jawa Tengah',
        'opsi_b': 'Jawa Barat',
        'opsi_c': 'Jawa Timur',
        'opsi_d': 'Sumatera',
        'opsi_e': 'Kalimantan',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Perjanjian Pangandaran ditandatangani pada tahun...',
        'opsi_a': '1635',
        'opsi_b': '1645',
        'opsi_c': '1625',
        'opsi_d': '1615',
        'opsi_e': '1655',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Tokoh yang dikenal sebagai "Bapak Kesejahteraan Sosial Indonesia" adalah...',
        'opsi_a': 'Moh. Hatta',
        'opsi_b': 'Soekarno',
        'opsi_c': 'Ki Hajar Dewantara',
        'opsi_d': 'Mr. Muhammad Yamin',
        'opsi_e': 'Sutan Sjahrir',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Candi Jago dibangun pada masa kerajaan...',
        'opsi_a': 'Majapahit',
        'opsi_b': 'Sailendra',
        'opsi_c': 'Sriwijaya',
        'opsi_d': 'Mataram Kuno',
        'opsi_e': 'Tarumanegara',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Perjanjian Cirebon ditandatangani pada tahun...',
        'opsi_a': '1677',
        'opsi_b': '1687',
        'opsi_c': '1667',
        'opsi_d': '1697',
        'opsi_e': '1657',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Tokoh yang dikenal sebagai "Bapak Transmigrasi Indonesia" adalah...',
        'opsi_a': 'Moh. Hatta',
        'opsi_b': 'Soekarno',
        'opsi_c': 'Ki Hajar Dewantara',
        'opsi_d': 'Mr. Muhammad Yamin',
        'opsi_e': 'Sutan Sjahrir',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Candi Singosari dibangun pada masa kerajaan...',
        'opsi_a': 'Singosari',
        'opsi_b': 'Majapahit',
        'opsi_c': 'Sriwijaya',
        'opsi_d': 'Mataram Kuno',
        'opsi_e': 'Tarumanegara',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Perjanjian Salatiga ditandatangani pada tahun...',
        'opsi_a': '1757',
        'opsi_b': '1747',
        'opsi_c': '1767',
        'opsi_d': '1737',
        'opsi_e': '1777',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Tokoh yang dikenal sebagai "Bapak Demokrasi Indonesia" adalah...',
        'opsi_a': 'Sutan Sjahrir',
        'opsi_b': 'Soekarno',
        'opsi_c': 'Moh. Hatta',
        'opsi_d': 'Ki Hajar Dewantara',
        'opsi_e': 'Mr. Muhammad Yamin',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Kerajaan Kanjuruhan berpusat di...',
        'opsi_a': 'Jawa Timur',
        'opsi_b': 'Jawa Tengah',
        'opsi_c': 'Jawa Barat',
        'opsi_d': 'Sumatera',
        'opsi_e': 'Kalimantan',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Perjanjian Tuntang ditandatangani pada tahun...',
        'opsi_a': '1824',
        'opsi_b': '1814',
        'opsi_c': '1834',
        'opsi_d': '1844',
        'opsi_e': '1854',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Tokoh yang dikenal sebagai "Bapak Hukum Indonesia" adalah...',
        'opsi_a': 'Prof. Dr. Subekti',
        'opsi_b': 'Soekarno',
        'opsi_c': 'Moh. Hatta',
        'opsi_d': 'Ki Hajar Dewantara',
        'opsi_e': 'Sutan Sjahrir',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Pertempuran Bandung Lautan Api terjadi pada tahun...',
        'opsi_a': '1946',
        'opsi_b': '1945',
        'opsi_c': '1947',
        'opsi_d': '1948',
        'opsi_e': '1949',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Tokoh yang dikenal sebagai "Bapak Koperasi Indonesia" adalah...',
        'opsi_a': 'Moh. Hatta',
        'opsi_b': 'Soekarno',
        'opsi_c': 'Ki Hajar Dewantara',
        'opsi_d': 'Mr. Muhammad Yamin',
        'opsi_e': 'Sutan Sjahrir',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Kerajaan Sunda berpusat di...',
        'opsi_a': 'Jawa Barat',
        'opsi_b': 'Jawa Tengah',
        'opsi_c': 'Jawa Timur',
        'opsi_d': 'Sumatera',
        'opsi_e': 'Kalimantan',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Perjanjian Breda ditandatangani pada tahun...',
        'opsi_a': '1667',
        'opsi_b': '1657',
        'opsi_c': '1677',
        'opsi_d': '1647',
        'opsi_e': '1687',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Tokoh yang dikenal sebagai "Bapak Persatuan Indonesia" adalah...',
        'opsi_a': 'Ir. Soekarno',
        'opsi_b': 'Moh. Hatta',
        'opsi_c': 'Ki Hajar Dewantara',
        'opsi_d': 'Mr. Muhammad Yamin',
        'opsi_e': 'Sutan Sjahrir',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Candi Jago dibangun pada masa kerajaan...',
        'opsi_a': 'Majapahit',
        'opsi_b': 'Sailendra',
        'opsi_c': 'Sriwijaya',
        'opsi_d': 'Mataram Kuno',
        'opsi_e': 'Tarumanegara',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Perjanjian Bongaya ditandatangani pada tahun...',
        'opsi_a': '1667',
        'opsi_b': '1657',
        'opsi_c': '1677',
        'opsi_d': '1647',
        'opsi_e': '1687',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Tokoh yang dikenal sebagai "Bapak Proklamator Indonesia" adalah...',
        'opsi_a': 'Ir. Soekarno',
        'opsi_b': 'Moh. Hatta',
        'opsi_c': 'Ki Hajar Dewantara',
        'opsi_d': 'Mr. Muhammad Yamin',
        'opsi_e': 'Sutan Sjahrir',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Candi Kalasan dibangun pada masa kerajaan...',
        'opsi_a': 'Mataram Kuno',
        'opsi_b': 'Majapahit',
        'opsi_c': 'Sriwijaya',
        'opsi_d': 'Sailendra',
        'opsi_e': 'Tarumanegara',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Perjanjian Giyanti ditandatangani pada tahun...',
        'opsi_a': '1755',
        'opsi_b': '1745',
        'opsi_c': '1765',
        'opsi_d': '1735',
        'opsi_e': '1775',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Tokoh yang dikenal sebagai "Bapak Pendidikan Nasional Indonesia" adalah...',
        'opsi_a': 'Ki Hajar Dewantara',
        'opsi_b': 'Soekarno',
        'opsi_c': 'Moh. Hatta',
        'opsi_d': 'Mr. Muhammad Yamin',
        'opsi_e': 'Sutan Sjahrir',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Kerajaan Kalingga berpusat di...',
        'opsi_a': 'Jawa Tengah',
        'opsi_b': 'Jawa Barat',
        'opsi_c': 'Jawa Timur',
        'opsi_d': 'Sumatera',
        'opsi_e': 'Kalimantan',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Perjanjian Krama ditandatangani pada tahun...',
        'opsi_a': '1946',
        'opsi_b': '1945',
        'opsi_c': '1947',
        'opsi_d': '1948',
        'opsi_e': '1949',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Tokoh yang dikenal sebagai "Bapak Kebahasaan Indonesia" adalah...',
        'opsi_a': 'Sutan Takdir Alisyahbana',
        'opsi_b': 'Soekarno',
        'opsi_c': 'Moh. Hatta',
        'opsi_d': 'Ki Hajar Dewantara',
        'opsi_e': 'Sutan Sjahrir',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Pertempuran Surabaya terjadi pada tahun...',
        'opsi_a': '1945',
        'opsi_b': '1946',
        'opsi_c': '1947',
        'opsi_d': '1948',
        'opsi_e': '1949',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Tokoh yang dikenal sebagai "Bapak Kemerdekaan Indonesia" adalah...',
        'opsi_a': 'Ir. Soekarno',
        'opsi_b': 'Moh. Hatta',
        'opsi_c': 'Ki Hajar Dewantara',
        'opsi_d': 'Mr. Muhammad Yamin',
        'opsi_e': 'Sutan Sjahrir',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Kerajaan Melayu berpusat di...',
        'opsi_a': 'Sumatera',
        'opsi_b': 'Jawa Tengah',
        'opsi_c': 'Jawa Barat',
        'opsi_d': 'Jawa Timur',
        'opsi_e': 'Kalimantan',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Perjanjian Pangandaran ditandatangani pada tahun...',
        'opsi_a': '1635',
        'opsi_b': '1645',
        'opsi_c': '1625',
        'opsi_d': '1615',
        'opsi_e': '1655',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Tokoh yang dikenal sebagai "Bapak Politik Indonesia" adalah...',
        'opsi_a': 'Moh. Hatta',
        'opsi_b': 'Soekarno',
        'opsi_c': 'Ki Hajar Dewantara',
        'opsi_d': 'Mr. Muhammad Yamin',
        'opsi_e': 'Sutan Sjahrir',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Candi Sukuh dibangun pada masa kerajaan...',
        'opsi_a': 'Majapahit',
        'opsi_b': 'Sailendra',
        'opsi_c': 'Sriwijaya',
        'opsi_d': 'Mataram Kuno',
        'opsi_e': 'Tarumanegara',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Perjanjian Cirebon ditandatangani pada tahun...',
        'opsi_a': '1677',
        'opsi_b': '1687',
        'opsi_c': '1667',
        'opsi_d': '1697',
        'opsi_e': '1657',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Tokoh yang dikenal sebagai "Bapak Revolusi Indonesia" adalah...',
        'opsi_a': 'Ir. Soekarno',
        'opsi_b': 'Moh. Hatta',
        'opsi_c': 'Ki Hajar Dewantara',
        'opsi_d': 'Mr. Muhammad Yamin',
        'opsi_e': 'Sutan Sjahrir',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Candi Plaosan dibangun pada masa kerajaan...',
        'opsi_a': 'Mataram Kuno',
        'opsi_b': 'Majapahit',
        'opsi_c': 'Sriwijaya',
        'opsi_d': 'Sailendra',
        'opsi_e': 'Tarumanegara',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Perjanjian Tuntang ditandatangani pada tahun...',
        'opsi_a': '1824',
        'opsi_b': '1814',
        'opsi_c': '1834',
        'opsi_d': '1844',
        'opsi_e': '1854',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Tokoh yang dikenal sebagai "Bapak Ekonomi Indonesia" adalah...',
        'opsi_a': 'Prof. Dr. Sumitro Djojohadikusumo',
        'opsi_b': 'Soekarno',
        'opsi_c': 'Moh. Hatta',
        'opsi_d': 'Ki Hajar Dewantara',
        'opsi_e': 'Sutan Sjahrir',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Kerajaan Sriwijaya berpusat di...',
        'opsi_a': 'Sumatera',
        'opsi_b': 'Jawa Tengah',
        'opsi_c': 'Jawa Barat',
        'opsi_d': 'Jawa Timur',
        'opsi_e': 'Kalimantan',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Perjanjian Renville ditandatangani pada tahun...',
        'opsi_a': '1948',
        'opsi_b': '1945',
        'opsi_c': '1947',
        'opsi_d': '1946',
        'opsi_e': '1949',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Tokoh yang dikenal sebagai "Bapak Sastra Indonesia" adalah...',
        'opsi_a': 'Sutan Takdir Alisyahbana',
        'opsi_b': 'Soekarno',
        'opsi_c': 'Moh. Hatta',
        'opsi_d': 'Ki Hajar Dewantara',
        'opsi_e': 'Sutan Sjahrir',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Pertempuran Ambarawa terjadi pada tahun...',
        'opsi_a': '1945',
        'opsi_b': '1946',
        'opsi_c': '1947',
        'opsi_d': '1948',
        'opsi_e': '1949',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Tokoh yang dikenal sebagai "Bapak Pers Indonesia" adalah...',
        'opsi_a': 'Moh. Hatta',
        'opsi_b': 'Soekarno',
        'opsi_c': 'Ki Hajar Dewantara',
        'opsi_d': 'Mr. Muhammad Yamin',
        'opsi_e': 'Sutan Sjahrir',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Kerajaan Mataram Islam berpusat di...',
        'opsi_a': 'Jawa Tengah',
        'opsi_b': 'Jawa Barat',
        'opsi_c': 'Jawa Timur',
        'opsi_d': 'Sumatera',
        'opsi_e': 'Kalimantan',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Perjanjian Breda ditandatangani pada tahun...',
        'opsi_a': '1667',
        'opsi_b': '1657',
        'opsi_c': '1677',
        'opsi_d': '1647',
        'opsi_e': '1687',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Tokoh yang dikenal sebagai "Bapak Kesehatan Indonesia" adalah...',
        'opsi_a': 'Prof. Dr. G.A. Siwabessy',
        'opsi_b': 'Soekarno',
        'opsi_c': 'Moh. Hatta',
        'opsi_d': 'Ki Hajar Dewantara',
        'opsi_e': 'Sutan Sjahrir',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Candi Mendut dibangun pada masa kerajaan...',
        'opsi_a': 'Sailendra',
        'opsi_b': 'Majapahit',
        'opsi_c': 'Sriwijaya',
        'opsi_d': 'Mataram Kuno',
        'opsi_e': 'Tarumanegara',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Perjanjian Salatiga ditandatangani pada tahun...',
        'opsi_a': '1757',
        'opsi_b': '1747',
        'opsi_c': '1767',
        'opsi_d': '1737',
        'opsi_e': '1777',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Tokoh yang dikenal sebagai "Bapak Pendidikan Indonesia" adalah...',
        'opsi_a': 'Ki Hajar Dewantara',
        'opsi_b': 'Soekarno',
        'opsi_c': 'Moh. Hatta',
        'opsi_d': 'Mr. Muhammad Yamin',
        'opsi_e': 'Sutan Sjahrir',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Candi Sari dibangun pada masa kerajaan...',
        'opsi_a': 'Mataram Kuno',
        'opsi_b': 'Majapahit',
        'opsi_c': 'Sriwijaya',
        'opsi_d': 'Sailendra',
        'opsi_e': 'Tarumanegara',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Perjanjian Pangandaran ditandatangani pada tahun...',
        'opsi_a': '1635',
        'opsi_b': '1645',
        'opsi_c': '1625',
        'opsi_d': '1615',
        'opsi_e': '1655',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Tokoh yang dikenal sebagai "Bapak Teknik Indonesia" adalah...',
        'opsi_a': 'Prof. Ir. Roosseno',
        'opsi_b': 'Soekarno',
        'opsi_c': 'Moh. Hatta',
        'opsi_d': 'Ki Hajar Dewantara',
        'opsi_e': 'Sutan Sjahrir',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Kerajaan Tarumanegara berpusat di...',
        'opsi_a': 'Jawa Barat',
        'opsi_b': 'Jawa Tengah',
        'opsi_c': 'Jawa Timur',
        'opsi_d': 'Sumatera',
        'opsi_e': 'Kalimantan',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Perjanjian Linggarjati ditandatangani pada tahun...',
        'opsi_a': '1946',
        'opsi_b': '1945',
        'opsi_c': '1947',
        'opsi_d': '1948',
        'opsi_e': '1949',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Tokoh yang dikenal sebagai "Bapak Seni Indonesia" adalah...',
        'opsi_a': 'Raden Saleh',
        'opsi_b': 'Soekarno',
        'opsi_c': 'Moh. Hatta',
        'opsi_d': 'Ki Hajar Dewantara',
        'opsi_e': 'Sutan Sjahrir',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Pertempuran Yogyakarta terjadi pada tahun...',
        'opsi_a': '1946',
        'opsi_b': '1945',
        'opsi_c': '1947',
        'opsi_d': '1948',
        'opsi_e': '1949',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Tokoh yang dikenal sebagai "Bapak Penerbangan Indonesia" adalah...',
        'opsi_a': 'Ir. Soekarno',
        'opsi_b': 'Moh. Hatta',
        'opsi_c': 'Ki Hajar Dewantara',
        'opsi_d': 'Mr. Muhammad Yamin',
        'opsi_e': 'Sutan Sjahrir',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Kerajaan Pasundan berpusat di...',
        'opsi_a': 'Jawa Barat',
        'opsi_b': 'Jawa Tengah',
        'opsi_c': 'Jawa Timur',
        'opsi_d': 'Sumatera',
        'opsi_e': 'Kalimantan',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Perjanjian Siau ditandatangani pada tahun...',
        'opsi_a': '1677',
        'opsi_b': '1687',
        'opsi_c': '1667',
        'opsi_d': '1697',
        'opsi_e': '1657',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Tokoh yang dikenal sebagai "Bapak Pertanian Indonesia" adalah...',
        'opsi_a': 'Prof. Dr. Ir. Sarwono Prawirohardjo',
        'opsi_b': 'Soekarno',
        'opsi_c': 'Moh. Hatta',
        'opsi_d': 'Ki Hajar Dewantara',
        'opsi_e': 'Sutan Sjahrir',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Candi Sewu dibangun pada masa kerajaan...',
        'opsi_a': 'Mataram Kuno',
        'opsi_b': 'Majapahit',
        'opsi_c': 'Sriwijaya',
        'opsi_d': 'Sailendra',
        'opsi_e': 'Tarumanegara',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Perjanjian Giyanti ditandatangani pada tahun...',
        'opsi_a': '1755',
        'opsi_b': '1745',
        'opsi_c': '1765',
        'opsi_d': '1735',
        'opsi_e': '1775',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Tokoh yang dikenal sebagai "Bapak Pers Nasional Indonesia" adalah...',
        'opsi_a': 'Moh. Hatta',
        'opsi_b': 'Soekarno',
        'opsi_c': 'Ki Hajar Dewantara',
        'opsi_d': 'Mr. Muhammad Yamin',
        'opsi_e': 'Sutan Sjahrir',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Candi Borobudur dibangun pada masa kerajaan...',
        'opsi_a': 'Sailendra',
        'opsi_b': 'Majapahit',
        'opsi_c': 'Sriwijaya',
        'opsi_d': 'Mataram Kuno',
        'opsi_e': 'Tarumanegara',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Perjanjian Bongaya ditandatangani pada tahun...',
        'opsi_a': '1667',
        'opsi_b': '1657',
        'opsi_c': '1677',
        'opsi_d': '1647',
        'opsi_e': '1687',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Tokoh yang dikenal sebagai "Bapak Koperasi Nasional Indonesia" adalah...',
        'opsi_a': 'Moh. Hatta',
        'opsi_b': 'Soekarno',
        'opsi_c': 'Ki Hajar Dewantara',
        'opsi_d': 'Mr. Muhammad Yamin',
        'opsi_e': 'Sutan Sjahrir',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Kerajaan Kutai berpusat di...',
        'opsi_a': 'Kalimantan',
        'opsi_b': 'Jawa Tengah',
        'opsi_c': 'Jawa Barat',
        'opsi_d': 'Jawa Timur',
        'opsi_e': 'Sumatera',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Perjanjian Renville ditandatangani pada tahun...',
        'opsi_a': '1948',
        'opsi_b': '1945',
        'opsi_c': '1947',
        'opsi_d': '1946',
        'opsi_e': '1949',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Tokoh yang dikenal sebagai "Bapak Bahasa Indonesia" adalah...',
        'opsi_a': 'Sutan Takdir Alisyahbana',
        'opsi_b': 'Soekarno',
        'opsi_c': 'Moh. Hatta',
        'opsi_d': 'Ki Hajar Dewantara',
        'opsi_e': 'Sutan Sjahrir',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Pertempuran Semarang terjadi pada tahun...',
        'opsi_a': '1945',
        'opsi_b': '1946',
        'opsi_c': '1947',
        'opsi_d': '1948',
        'opsi_e': '1949',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Tokoh yang dikenal sebagai "Bapak Pemuda Indonesia" adalah...',
        'opsi_a': 'Ir. Soekarno',
        'opsi_b': 'Moh. Hatta',
        'opsi_c': 'Ki Hajar Dewantara',
        'opsi_d': 'Mr. Muhammad Yamin',
        'opsi_e': 'Sutan Sjahrir',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Kerajaan Pajajaran berpusat di...',
        'opsi_a': 'Jawa Barat',
        'opsi_b': 'Jawa Tengah',
        'opsi_c': 'Jawa Timur',
        'opsi_d': 'Sumatera',
        'opsi_e': 'Kalimantan',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Perjanjian Roem-Rooyen ditandatangani pada tahun...',
        'opsi_a': '1949',
        'opsi_b': '1945',
        'opsi_c': '1947',
        'opsi_d': '1946',
        'opsi_e': '1948',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Tokoh yang dikenal sebagai "Bapak Militer Indonesia" adalah...',
        'opsi_a': 'Jend. A.H. Nasution',
        'opsi_b': 'Soekarno',
        'opsi_c': 'Moh. Hatta',
        'opsi_d': 'Ki Hajar Dewantara',
        'opsi_e': 'Sutan Sjahrir',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Candi Prambanan dibangun pada masa kerajaan...',
        'opsi_a': 'Mataram Kuno',
        'opsi_b': 'Majapahit',
        'opsi_c': 'Sriwijaya',
        'opsi_d': 'Sailendra',
        'opsi_e': 'Tarumanegara',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Perjanjian Tuntang ditandatangani pada tahun...',
        'opsi_a': '1824',
        'opsi_b': '1814',
        'opsi_c': '1834',
        'opsi_d': '1844',
        'opsi_e': '1854',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Tokoh yang dikenal sebagai "Bapak Perdamaian Indonesia" adalah...',
        'opsi_a': 'Sutan Sjahrir',
        'opsi_b': 'Soekarno',
        'opsi_c': 'Moh. Hatta',
        'opsi_d': 'Ki Hajar Dewantara',
        'opsi_e': 'Mr. Muhammad Yamin',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Candi Pawon dibangun pada masa kerajaan...',
        'opsi_a': 'Sailendra',
        'opsi_b': 'Majapahit',
        'opsi_c': 'Sriwijaya',
        'opsi_d': 'Mataram Kuno',
        'opsi_e': 'Tarumanegara',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Perjanjian Cirebon ditandatangani pada tahun...',
        'opsi_a': '1677',
        'opsi_b': '1687',
        'opsi_c': '1667',
        'opsi_d': '1697',
        'opsi_e': '1657',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Tokoh yang dikenal sebagai "Bapak Industri Indonesia" adalah...',
        'opsi_a': 'Prof. Dr. Ir. Djuanda Kartawidjaja',
        'opsi_b': 'Soekarno',
        'opsi_c': 'Moh. Hatta',
        'opsi_d': 'Ki Hajar Dewantara',
        'opsi_e': 'Sutan Sjahrir',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Kerajaan Melayu Islam berpusat di...',
        'opsi_a': 'Sumatera',
        'opsi_b': 'Jawa Tengah',
        'opsi_c': 'Jawa Barat',
        'opsi_d': 'Jawa Timur',
        'opsi_e': 'Kalimantan',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Perjanjian Linggarjati ditandatangani pada tahun...',
        'opsi_a': '1946',
        'opsi_b': '1945',
        'opsi_c': '1947',
        'opsi_d': '1948',
        'opsi_e': '1949',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Tokoh yang dikenal sebagai "Bapak Kedokteran Indonesia" adalah...',
        'opsi_a': 'Dr. Cipto Mangunkusumo',
        'opsi_b': 'Soekarno',
        'opsi_c': 'Moh. Hatta',
        'opsi_d': 'Ki Hajar Dewantara',
        'opsi_e': 'Sutan Sjahrir',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Pertempuran Medan Area terjadi pada tahun...',
        'opsi_a': '1945',
        'opsi_b': '1946',
        'opsi_c': '1947',
        'opsi_d': '1948',
        'opsi_e': '1949',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Tokoh yang dikenal sebagai "Bapak Angkatan Laut Indonesia" adalah...',
        'opsi_a': 'Laksamana Maeda',
        'opsi_b': 'Soekarno',
        'opsi_c': 'Moh. Hatta',
        'opsi_d': 'Ki Hajar Dewantara',
        'opsi_e': 'Sutan Sjahrir',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Kerajaan Banten berpusat di...',
        'opsi_a': 'Jawa Barat',
        'opsi_b': 'Jawa Tengah',
        'opsi_c': 'Jawa Timur',
        'opsi_d': 'Sumatera',
        'opsi_e': 'Kalimantan',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Perjanjian Krama ditandatangani pada tahun...',
        'opsi_a': '1946',
        'opsi_b': '1945',
        'opsi_c': '1947',
        'opsi_d': '1948',
        'opsi_e': '1949',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Tokoh yang dikenal sebagai "Bapak Maritim Indonesia" adalah...',
        'opsi_a': 'Ir. Soekarno',
        'opsi_b': 'Moh. Hatta',
        'opsi_c': 'Ki Hajar Dewantara',
        'opsi_d': 'Mr. Muhammad Yamin',
        'opsi_e': 'Sutan Sjahrir',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Candi Ngawen dibangun pada masa kerajaan...',
        'opsi_a': 'Mataram Kuno',
        'opsi_b': 'Majapahit',
        'opsi_c': 'Sriwijaya',
        'opsi_d': 'Sailendra',
        'opsi_e': 'Tarumanegara',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Perjanjian Salatiga ditandatangani pada tahun...',
        'opsi_a': '1757',
        'opsi_b': '1747',
        'opsi_c': '1767',
        'opsi_d': '1737',
        'opsi_e': '1777',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Tokoh yang dikenal sebagai "Bapak Statistik Indonesia" adalah...',
        'opsi_a': 'Prof. Dr. Djoehanda Wiradikarta',
        'opsi_b': 'Soekarno',
        'opsi_c': 'Moh. Hatta',
        'opsi_d': 'Ki Hajar Dewantara',
        'opsi_e': 'Sutan Sjahrir',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Candi Mendut dibangun pada masa kerajaan...',
        'opsi_a': 'Sailendra',
        'opsi_b': 'Majapahit',
        'opsi_c': 'Sriwijaya',
        'opsi_d': 'Mataram Kuno',
        'opsi_e': 'Tarumanegara',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Perjanjian Kramat ditandatangani pada tahun...',
        'opsi_a': '1946',
        'opsi_b': '1945',
        'opsi_c': '1947',
        'opsi_d': '1948',
        'opsi_e': '1949',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Tokoh yang dikenal sebagai "Bapak Ekonomi Indonesia" adalah...',
        'opsi_a': 'Prof. Dr. Sumitro Djojohadikusumo',
        'opsi_b': 'Soekarno',
        'opsi_c': 'Moh. Hatta',
        'opsi_d': 'Ki Hajar Dewantara',
        'opsi_e': 'Sutan Sjahrir',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Kerajaan Singosari berpusat di...',
        'opsi_a': 'Jawa Timur',
        'opsi_b': 'Jawa Tengah',
        'opsi_c': 'Jawa Barat',
        'opsi_d': 'Sumatera',
        'opsi_e': 'Kalimantan',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Perjanjian Krama ditandatangani pada tahun...',
        'opsi_a': '1946',
        'opsi_b': '1945',
        'opsi_c': '1947',
        'opsi_d': '1948',
        'opsi_e': '1949',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Tokoh yang dikenal sebagai "Bapak Kebudayaan Indonesia" adalah...',
        'opsi_a': 'Prof. Dr. Sutan Syahrir',
        'opsi_b': 'Soekarno',
        'opsi_c': 'Moh. Hatta',
        'opsi_d': 'Ki Hajar Dewantara',
        'opsi_e': 'Mr. Muhammad Yamin',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Pertempuran Surabaya terjadi pada tahun...',
        'opsi_a': '1945',
        'opsi_b': '1946',
        'opsi_c': '1947',
        'opsi_d': '1948',
        'opsi_e': '1949',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Tokoh yang dikenal sebagai "Bapak Demokrasi Indonesia" adalah...',
        'opsi_a': 'Sutan Sjahrir',
        'opsi_b': 'Soekarno',
        'opsi_c': 'Moh. Hatta',
        'opsi_d': 'Ki Hajar Dewantara',
        'opsi_e': 'Mr. Muhammad Yamin',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Kerajaan Majapahit berpusat di...',
        'opsi_a': 'Jawa Timur',
        'opsi_b': 'Jawa Tengah',
        'opsi_c': 'Jawa Barat',
        'opsi_d': 'Sumatera',
        'opsi_e': 'Kalimantan',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Perjanjian Pangandaran ditandatangani pada tahun...',
        'opsi_a': '1635',
        'opsi_b': '1645',
        'opsi_c': '1625',
        'opsi_d': '1615',
        'opsi_e': '1655',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Tokoh yang dikenal sebagai "Bapak Koperasi Indonesia" adalah...',
        'opsi_a': 'Moh. Hatta',
        'opsi_b': 'Soekarno',
        'opsi_c': 'Ki Hajar Dewantara',
        'opsi_d': 'Mr. Muhammad Yamin',
        'opsi_e': 'Sutan Sjahrir',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Candi Kalasan dibangun pada masa kerajaan...',
        'opsi_a': 'Mataram Kuno',
        'opsi_b': 'Majapahit',
        'opsi_c': 'Sriwijaya',
        'opsi_d': 'Sailendra',
        'opsi_e': 'Tarumanegara',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Perjanjian Siau ditandatangani pada tahun...',
        'opsi_a': '1677',
        'opsi_b': '1687',
        'opsi_c': '1667',
        'opsi_d': '1697',
        'opsi_e': '1657',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Tokoh yang dikenal sebagai "Bapak Pendidikan Nasional Indonesia" adalah...',
        'opsi_a': 'Ki Hajar Dewantara',
        'opsi_b': 'Soekarno',
        'opsi_c': 'Moh. Hatta',
        'opsi_d': 'Mr. Muhammad Yamin',
        'opsi_e': 'Sutan Sjahrir',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Candi Sewu dibangun pada masa kerajaan...',
        'opsi_a': 'Mataram Kuno',
        'opsi_b': 'Majapahit',
        'opsi_c': 'Sriwijaya',
        'opsi_d': 'Sailendra',
        'opsi_e': 'Tarumanegara',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Perjanjian Banten ditandatangani pada tahun...',
        'opsi_a': '1684',
        'opsi_b': '1674',
        'opsi_c': '1694',
        'opsi_d': '1664',
        'opsi_e': '1704',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Tokoh yang dikenal sebagai "Bapak Teknologi Indonesia" adalah...',
        'opsi_a': 'Prof. Dr. Ing. H. B. J. Habibie',
        'opsi_b': 'Soekarno',
        'opsi_c': 'Moh. Hatta',
        'opsi_d': 'Ki Hajar Dewantara',
        'opsi_e': 'Sutan Sjahrir',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Kerajaan Kediri berpusat di...',
        'opsi_a': 'Jawa Timur',
        'opsi_b': 'Jawa Tengah',
        'opsi_c': 'Jawa Barat',
        'opsi_d': 'Sumatera',
        'opsi_e': 'Kalimantan',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Perjanjian Painan ditandatangani pada tahun...',
        'opsi_a': '1663',
        'opsi_b': '1653',
        'opsi_c': '1673',
        'opsi_d': '1643',
        'opsi_e': '1683',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Tokoh yang dikenal sebagai "Bapak Kemerdekaan Indonesia" adalah...',
        'opsi_a': 'Ir. Soekarno',
        'opsi_b': 'Moh. Hatta',
        'opsi_c': 'Ki Hajar Dewantara',
        'opsi_d': 'Mr. Muhammad Yamin',
        'opsi_e': 'Sutan Sjahrir',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Pertempuran Bandung Lautan Api terjadi pada tahun...',
        'opsi_a': '1946',
        'opsi_b': '1945',
        'opsi_c': '1947',
        'opsi_d': '1948',
        'opsi_e': '1949',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Tokoh yang dikenal sebagai "Bapak Proklamasi Indonesia" adalah...',
        'opsi_a': 'Ir. Soekarno dan Moh. Hatta',
        'opsi_b': 'Soekarno saja',
        'opsi_c': 'Moh. Hatta saja',
        'opsi_d': 'Ki Hajar Dewantara',
        'opsi_e': 'Sutan Sjahrir',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Kerajaan Sriwijaya berpusat di...',
        'opsi_a': 'Sumatera',
        'opsi_b': 'Jawa Tengah',
        'opsi_c': 'Jawa Barat',
        'opsi_d': 'Jawa Timur',
        'opsi_e': 'Kalimantan',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Perjanjian Mataram ditandatangani pada tahun...',
        'opsi_a': '1755',
        'opsi_b': '1745',
        'opsi_c': '1765',
        'opsi_d': '1735',
        'opsi_e': '1775',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Tokoh yang dikenal sebagai "Bapak Hukum Indonesia" adalah...',
        'opsi_a': 'Prof. Dr. Mr. R. Subekti',
        'opsi_b': 'Soekarno',
        'opsi_c': 'Moh. Hatta',
        'opsi_d': 'Ki Hajar Dewantara',
        'opsi_e': 'Sutan Sjahrir',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Candi Sari dibangun pada masa kerajaan...',
        'opsi_a': 'Mataram Kuno',
        'opsi_b': 'Majapahit',
        'opsi_c': 'Sriwijaya',
        'opsi_d': 'Sailendra',
        'opsi_e': 'Tarumanegara',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Perjanjian Tuntang ditandatangani pada tahun...',
        'opsi_a': '1824',
        'opsi_b': '1814',
        'opsi_c': '1834',
        'opsi_d': '1844',
        'opsi_e': '1854',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Tokoh yang dikenal sebagai "Bapak Pendidikan Tinggi Indonesia" adalah...',
        'opsi_a': 'Prof. Dr. Ir. H. B. J. Habibie',
        'opsi_b': 'Soekarno',
        'opsi_c': 'Moh. Hatta',
        'opsi_d': 'Ki Hajar Dewantara',
        'opsi_e': 'Sutan Sjahrir',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Candi Plaosan dibangun pada masa kerajaan...',
        'opsi_a': 'Mataram Kuno',
        'opsi_b': 'Majapahit',
        'opsi_c': 'Sriwijaya',
        'opsi_d': 'Sailendra',
        'opsi_e': 'Tarumanegara',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Perjanjian Kalibata ditandatangani pada tahun...',
        'opsi_a': '1946',
        'opsi_b': '1945',
        'opsi_c': '1947',
        'opsi_d': '1948',
        'opsi_e': '1949',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Tokoh yang dikenal sebagai "Bapak Penerbangan Indonesia" adalah...',
        'opsi_a': 'Prof. Dr. Ir. H. B. J. Habibie',
        'opsi_b': 'Soekarno',
        'opsi_c': 'Moh. Hatta',
        'opsi_d': 'Ki Hajar Dewantara',
        'opsi_e': 'Sutan Sjahrir',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Kerajaan Tarumanegara berpusat di...',
        'opsi_a': 'Jawa Barat',
        'opsi_b': 'Jawa Tengah',
        'opsi_c': 'Jawa Timur',
        'opsi_d': 'Sumatera',
        'opsi_e': 'Kalimantan',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Perjanjian Linggarjati ditandatangani pada tahun...',
        'opsi_a': '1946',
        'opsi_b': '1945',
        'opsi_c': '1947',
        'opsi_d': '1948',
        'opsi_e': '1949',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Tokoh yang dikenal sebagai "Bapak Revolusi Indonesia" adalah...',
        'opsi_a': 'Ir. Soekarno',
        'opsi_b': 'Moh. Hatta',
        'opsi_c': 'Ki Hajar Dewantara',
        'opsi_d': 'Mr. Muhammad Yamin',
        'opsi_e': 'Sutan Sjahrir',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Pertempuran Ambarawa terjadi pada tahun...',
        'opsi_a': '1945',
        'opsi_b': '1946',
        'opsi_c': '1947',
        'opsi_d': '1948',
        'opsi_e': '1949',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Tokoh yang dikenal sebagai "Bapak Konstitusi Indonesia" adalah...',
        'opsi_a': 'Prof. Mr. Dr. Supomo',
        'opsi_b': 'Soekarno',
        'opsi_c': 'Moh. Hatta',
        'opsi_d': 'Ki Hajar Dewantara',
        'opsi_e': 'Sutan Sjahrir',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Kerajaan Mataram Islam berpusat di...',
        'opsi_a': 'Jawa Tengah',
        'opsi_b': 'Jawa Barat',
        'opsi_c': 'Jawa Timur',
        'opsi_d': 'Sumatera',
        'opsi_e': 'Kalimantan',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Perjanjian Renville ditandatangani pada tahun...',
        'opsi_a': '1948',
        'opsi_b': '1945',
        'opsi_c': '1947',
        'opsi_d': '1946',
        'opsi_e': '1949',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Tokoh yang dikenal sebagai "Bapak Persatuan Indonesia" adalah...',
        'opsi_a': 'Ir. Soekarno',
        'opsi_b': 'Moh. Hatta',
        'opsi_c': 'Ki Hajar Dewantara',
        'opsi_d': 'Mr. Muhammad Yamin',
        'opsi_e': 'Sutan Sjahrir',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Candi Sambisari dibangun pada masa kerajaan...',
        'opsi_a': 'Mataram Kuno',
        'opsi_b': 'Majapahit',
        'opsi_c': 'Sriwijaya',
        'opsi_d': 'Sailendra',
        'opsi_e': 'Tarumanegara',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Perjanjian Giyanti ditandatangani pada tahun...',
        'opsi_a': '1755',
        'opsi_b': '1745',
        'opsi_c': '1765',
        'opsi_d': '1735',
        'opsi_e': '1775',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Tokoh yang dikenal sebagai "Bapak Angkatan Bersenjata Indonesia" adalah...',
        'opsi_a': 'Jenderal A.H. Nasution',
        'opsi_b': 'Soekarno',
        'opsi_c': 'Moh. Hatta',
        'opsi_d': 'Ki Hajar Dewantara',
        'opsi_e': 'Sutan Sjahrir',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Candi Borobudur dibangun pada masa kerajaan...',
        'opsi_a': 'Sailendra',
        'opsi_b': 'Majapahit',
        'opsi_c': 'Sriwijaya',
        'opsi_d': 'Mataram Kuno',
        'opsi_e': 'Tarumanegara',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Perjanjian Bongaya ditandatangani pada tahun...',
        'opsi_a': '1667',
        'opsi_b': '1657',
        'opsi_c': '1677',
        'opsi_d': '1647',
        'opsi_e': '1687',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Tokoh yang dikenal sebagai "Bapak Pers Indonesia" adalah...',
        'opsi_a': 'Mr. Muhammad Yamin',
        'opsi_b': 'Soekarno',
        'opsi_c': 'Moh. Hatta',
        'opsi_d': 'Ki Hajar Dewantara',
        'opsi_e': 'Sutan Sjahrir',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Kerajaan Pajajaran berpusat di...',
        'opsi_a': 'Jawa Barat',
        'opsi_b': 'Jawa Tengah',
        'opsi_c': 'Jawa Timur',
        'opsi_d': 'Sumatera',
        'opsi_e': 'Kalimantan',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Perjanjian Pajang ditandatangani pada tahun...',
        'opsi_a': '1577',
        'opsi_b': '1567',
        'opsi_c': '1587',
        'opsi_d': '1557',
        'opsi_e': '1597',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Tokoh yang dikenal sebagai "Bapak Bahasa Indonesia" adalah...',
        'opsi_a': 'Prof. Dr. Mr. Muhammad Yamin',
        'opsi_b': 'Soekarno',
        'opsi_c': 'Moh. Hatta',
        'opsi_d': 'Ki Hajar Dewantara',
        'opsi_e': 'Sutan Sjahrir',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Pertempuran Palembang terjadi pada tahun...',
        'opsi_a': '1947',
        'opsi_b': '1946',
        'opsi_c': '1948',
        'opsi_d': '1945',
        'opsi_e': '1949',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Tokoh yang dikenal sebagai "Bapak Pendidikan Indonesia" adalah...',
        'opsi_a': 'Ki Hajar Dewantara',
        'opsi_b': 'Soekarno',
        'opsi_c': 'Moh. Hatta',
        'opsi_d': 'Mr. Muhammad Yamin',
        'opsi_e': 'Sutan Sjahrir',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Kerajaan Dharmasraya berpusat di...',
        'opsi_a': 'Sumatera',
        'opsi_b': 'Jawa Tengah',
        'opsi_c': 'Jawa Barat',
        'opsi_d': 'Jawa Timur',
        'opsi_e': 'Kalimantan',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Perjanjian London ditandatangani pada tahun...',
        'opsi_a': '1949',
        'opsi_b': '1945',
        'opsi_c': '1947',
        'opsi_d': '1946',
        'opsi_e': '1948',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Tokoh yang dikenal sebagai "Bapak Pancasila" adalah...',
        'opsi_a': 'Ir. Soekarno',
        'opsi_b': 'Moh. Hatta',
        'opsi_c': 'Ki Hajar Dewantara',
        'opsi_d': 'Mr. Muhammad Yamin',
        'opsi_e': 'Sutan Sjahrir',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Candi Prambanan dibangun pada masa kerajaan...',
        'opsi_a': 'Mataram Kuno',
        'opsi_b': 'Majapahit',
        'opsi_c': 'Sriwijaya',
        'opsi_d': 'Sailendra',
        'opsi_e': 'Tarumanegara',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Perjanjian Krama ditandatangani pada tahun...',
        'opsi_a': '1946',
        'opsi_b': '1945',
        'opsi_c': '1947',
        'opsi_d': '1948',
        'opsi_e': '1949',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Tokoh yang dikenal sebagai "Bapak BUMN Indonesia" adalah...',
        'opsi_a': 'Ir. Soekarno',
        'opsi_b': 'Moh. Hatta',
        'opsi_c': 'Ki Hajar Dewantara',
        'opsi_d': 'Mr. Muhammad Yamin',
        'opsi_e': 'Sutan Sjahrir',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Candi Mendut dibangun pada masa kerajaan...',
        'opsi_a': 'Sailendra',
        'opsi_b': 'Majapahit',
        'opsi_c': 'Sriwijaya',
        'opsi_d': 'Mataram Kuno',
        'opsi_e': 'Tarumanegara',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Perjanjian Salatiga ditandatangani pada tahun...',
        'opsi_a': '1755',
        'opsi_b': '1745',
        'opsi_c': '1765',
        'opsi_d': '1735',
        'opsi_e': '1775',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Tokoh yang dikenal sebagai "Bapak Koperasi Indonesia" adalah...',
        'opsi_a': 'Dr. H. Mohammad Hatta',
        'opsi_b': 'Soekarno',
        'opsi_c': 'Ki Hajar Dewantara',
        'opsi_d': 'Mr. Muhammad Yamin',
        'opsi_e': 'Sutan Sjahrir',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Kerajaan Singhasari berpusat di...',
        'opsi_a': 'Jawa Timur',
        'opsi_b': 'Jawa Tengah',
        'opsi_c': 'Jawa Barat',
        'opsi_d': 'Sumatera',
        'opsi_e': 'Kalimantan',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Perjanjian Sleman ditandatangani pada tahun...',
        'opsi_a': '1946',
        'opsi_b': '1945',
        'opsi_c': '1947',
        'opsi_d': '1948',
        'opsi_e': '1949',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Tokoh yang dikenal sebagai "Bapak Demokrasi Indonesia" adalah...',
        'opsi_a': 'Sutan Sjahrir',
        'opsi_b': 'Soekarno',
        'opsi_c': 'Moh. Hatta',
        'opsi_d': 'Ki Hajar Dewantara',
        'opsi_e': 'Mr. Muhammad Yamin',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Pertempuran Surabaya terjadi pada tahun...',
        'opsi_a': '1945',
        'opsi_b': '1946',
        'opsi_c': '1947',
        'opsi_d': '1948',
        'opsi_e': '1949',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Tokoh yang dikenal sebagai "Bapak Ekonomi Indonesia" adalah...',
        'opsi_a': 'Prof. Dr. H. Mohammad Hatta',
        'opsi_b': 'Soekarno',
        'opsi_c': 'Ki Hajar Dewantara',
        'opsi_d': 'Mr. Muhammad Yamin',
        'opsi_e': 'Sutan Sjahrir',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Kerajaan Majapahit berpusat di...',
        'opsi_a': 'Jawa Timur',
        'opsi_b': 'Jawa Tengah',
        'opsi_c': 'Jawa Barat',
        'opsi_d': 'Sumatera',
        'opsi_e': 'Kalimantan',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Perjanjian Roem-Royen ditandatangani pada tahun...',
        'opsi_a': '1949',
        'opsi_b': '1945',
        'opsi_c': '1947',
        'opsi_d': '1946',
        'opsi_e': '1948',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Tokoh yang dikenal sebagai "Bapak Koperasi Indonesia" adalah...',
        'opsi_a': 'Dr. H. Mohammad Hatta',
        'opsi_b': 'Soekarno',
        'opsi_c': 'Ki Hajar Dewantara',
        'opsi_d': 'Mr. Muhammad Yamin',
        'opsi_e': 'Sutan Sjahrir',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Candi Kalasan dibangun pada masa kerajaan...',
        'opsi_a': 'Mataram Kuno',
        'opsi_b': 'Majapahit',
        'opsi_c': 'Sriwijaya',
        'opsi_d': 'Sailendra',
        'opsi_e': 'Tarumanegara',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Perjanjian Cirebon ditandatangani pada tahun...',
        'opsi_a': '1946',
        'opsi_b': '1945',
        'opsi_c': '1947',
        'opsi_d': '1948',
        'opsi_e': '1949',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Tokoh yang dikenal sebagai "Bapak Perdamaian Indonesia" adalah...',
        'opsi_a': 'Moh. Hatta',
        'opsi_b': 'Soekarno',
        'opsi_c': 'Ki Hajar Dewantara',
        'opsi_d': 'Mr. Muhammad Yamin',
        'opsi_e': 'Sutan Sjahrir',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Candi Ijo dibangun pada masa kerajaan...',
        'opsi_a': 'Mataram Kuno',
        'opsi_b': 'Majapahit',
        'opsi_c': 'Sriwijaya',
        'opsi_d': 'Sailendra',
        'opsi_e': 'Tarumanegara',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Perjanjian Kuta ditandatangani pada tahun...',
        'opsi_a': '1946',
        'opsi_b': '1945',
        'opsi_c': '1947',
        'opsi_d': '1948',
        'opsi_e': '1949',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Tokoh yang dikenal sebagai "Bapak Kebangkitan Nasional Indonesia" adalah...',
        'opsi_a': 'Dr. C.W.T. Boedi Oetomo',
        'opsi_b': 'Soekarno',
        'opsi_c': 'Moh. Hatta',
        'opsi_d': 'Ki Hajar Dewantara',
        'opsi_e': 'Sutan Sjahrir',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Kerajaan Kutai berpusat di...',
        'opsi_a': 'Kalimantan',
        'opsi_b': 'Jawa Tengah',
        'opsi_c': 'Jawa Barat',
        'opsi_d': 'Jawa Timur',
        'opsi_e': 'Sumatera',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Perjanjian Madiun ditandatangani pada tahun...',
        'opsi_a': '1948',
        'opsi_b': '1945',
        'opsi_c': '1947',
        'opsi_d': '1946',
        'opsi_e': '1949',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Tokoh yang dikenal sebagai "Bapak Pers Nasional Indonesia" adalah...',
        'opsi_a': 'Mr. Muhammad Yamin',
        'opsi_b': 'Soekarno',
        'opsi_c': 'Moh. Hatta',
        'opsi_d': 'Ki Hajar Dewantara',
        'opsi_e': 'Sutan Sjahrir',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Pertempuran Yogyakarta terjadi pada tahun...',
        'opsi_a': '1948',
        'opsi_b': '1946',
        'opsi_c': '1947',
        'opsi_d': '1945',
        'opsi_e': '1949',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Tokoh yang dikenal sebagai "Bapak Gerakan Koperasi Indonesia" adalah...',
        'opsi_a': 'Dr. H. Mohammad Hatta',
        'opsi_b': 'Soekarno',
        'opsi_c': 'Ki Hajar Dewantara',
        'opsi_d': 'Mr. Muhammad Yamin',
        'opsi_e': 'Sutan Sjahrir',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Kerajaan Samudra Pasai berpusat di...',
        'opsi_a': 'Sumatera',
        'opsi_b': 'Jawa Tengah',
        'opsi_c': 'Jawa Barat',
        'opsi_d': 'Jawa Timur',
        'opsi_e': 'Kalimantan',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Perjanjian Denpasar ditandatangani pada tahun...',
        'opsi_a': '1946',
        'opsi_b': '1945',
        'opsi_c': '1947',
        'opsi_d': '1948',
        'opsi_e': '1949',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Tokoh yang dikenal sebagai "Bapak Pemuda Indonesia" adalah...',
        'opsi_a': 'Dr. C.W.T. Boedi Oetomo',
        'opsi_b': 'Soekarno',
        'opsi_c': 'Moh. Hatta',
        'opsi_d': 'Ki Hajar Dewantara',
        'opsi_e': 'Sutan Sjahrir',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Candi Ngawen dibangun pada masa kerajaan...',
        'opsi_a': 'Mataram Kuno',
        'opsi_b': 'Majapahit',
        'opsi_c': 'Sriwijaya',
        'opsi_d': 'Sailendra',
        'opsi_e': 'Tarumanegara',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Perjanjian Bangka ditandatangani pada tahun...',
        'opsi_a': '1946',
        'opsi_b': '1945',
        'opsi_c': '1947',
        'opsi_d': '1948',
        'opsi_e': '1949',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Tokoh yang dikenal sebagai "Bapak Penerbangan Indonesia" adalah...',
        'opsi_a': 'Ir. Soekarno',
        'opsi_b': 'Moh. Hatta',
        'opsi_c': 'Ki Hajar Dewantara',
        'opsi_d': 'Mr. Muhammad Yamin',
        'opsi_e': 'Sutan Sjahrir',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Candi Sari dibangun pada masa kerajaan...',
        'opsi_a': 'Mataram Kuno',
        'opsi_b': 'Majapahit',
        'opsi_c': 'Sriwijaya',
        'opsi_d': 'Sailendra',
        'opsi_e': 'Tarumanegara',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Perjanjian Linggarjati ditandatangani pada tahun...',
        'opsi_a': '1946',
        'opsi_b': '1945',
        'opsi_c': '1947',
        'opsi_d': '1948',
        'opsi_e': '1949',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Tokoh yang dikenal sebagai "Bapak Hukum Indonesia" adalah...',
        'opsi_a': 'Prof. Dr. Mr. Soepomo',
        'opsi_b': 'Soekarno',
        'opsi_c': 'Moh. Hatta',
        'opsi_d': 'Ki Hajar Dewantara',
        'opsi_e': 'Sutan Sjahrir',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Kerajaan Tarumanegara berpusat di...',
        'opsi_a': 'Jawa Barat',
        'opsi_b': 'Jawa Tengah',
        'opsi_c': 'Jawa Timur',
        'opsi_d': 'Sumatera',
        'opsi_e': 'Kalimantan',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Perjanjian Renville ditandatangani pada tahun...',
        'opsi_a': '1948',
        'opsi_b': '1945',
        'opsi_c': '1947',
        'opsi_d': '1946',
        'opsi_e': '1949',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Tokoh yang dikenal sebagai "Bapak Konstitusi Indonesia" adalah...',
        'opsi_a': 'Prof. Dr. Mr. Soepomo',
        'opsi_b': 'Soekarno',
        'opsi_c': 'Moh. Hatta',
        'opsi_d': 'Ki Hajar Dewantara',
        'opsi_e': 'Sutan Sjahrir',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Pertempuran Ambarawa terjadi pada tahun...',
        'opsi_a': '1945',
        'opsi_b': '1946',
        'opsi_c': '1947',
        'opsi_d': '1948',
        'opsi_e': '1949',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Tokoh yang dikenal sebagai "Bapak Militer Indonesia" adalah...',
        'opsi_a': 'Jenderal A.H. Nasution',
        'opsi_b': 'Soekarno',
        'opsi_c': 'Moh. Hatta',
        'opsi_d': 'Ki Hajar Dewantara',
        'opsi_e': 'Sutan Sjahrir',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Kerajaan Kediri berpusat di...',
        'opsi_a': 'Jawa Timur',
        'opsi_b': 'Jawa Tengah',
        'opsi_c': 'Jawa Barat',
        'opsi_d': 'Sumatera',
        'opsi_e': 'Kalimantan',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Perjanjian Linggadjati ditandatangani pada tahun...',
        'opsi_a': '1946',
        'opsi_b': '1945',
        'opsi_c': '1947',
        'opsi_d': '1948',
        'opsi_e': '1949',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Tokoh yang dikenal sebagai "Bapak Pendidikan Tinggi Indonesia" adalah...',
        'opsi_a': 'Prof. Dr. Ir. H. B. J. Habibie',
        'opsi_b': 'Soekarno',
        'opsi_c': 'Moh. Hatta',
        'opsi_d': 'Ki Hajar Dewantara',
        'opsi_e': 'Sutan Sjahrir',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Candi Sambisari dibangun pada masa kerajaan...',
        'opsi_a': 'Mataram Kuno',
        'opsi_b': 'Majapahit',
        'opsi_c': 'Sriwijaya',
        'opsi_d': 'Sailendra',
        'opsi_e': 'Tarumanegara',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Perjanjian Jakarta ditandatangani pada tahun...',
        'opsi_a': '1946',
        'opsi_b': '1945',
        'opsi_c': '1947',
        'opsi_d': '1948',
        'opsi_e': '1949',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Tokoh yang dikenal sebagai "Bapak Teknologi Indonesia" adalah...',
        'opsi_a': 'Prof. Dr. Ing. H. B. J. Habibie',
        'opsi_b': 'Soekarno',
        'opsi_c': 'Moh. Hatta',
        'opsi_d': 'Ki Hajar Dewantara',
        'opsi_e': 'Sutan Sjahrir',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Candi Sewu dibangun pada masa kerajaan...',
        'opsi_a': 'Mataram Kuno',
        'opsi_b': 'Majapahit',
        'opsi_c': 'Sriwijaya',
        'opsi_d': 'Sailendra',
        'opsi_e': 'Tarumanegara',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Perjanjian Breda ditandatangani pada tahun...',
        'opsi_a': '1666',
        'opsi_b': '1656',
        'opsi_c': '1676',
        'opsi_d': '1646',
        'opsi_e': '1686',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Tokoh yang dikenal sebagai "Bapak Persatuan Indonesia" adalah...',
        'opsi_a': 'Ir. Soekarno',
        'opsi_b': 'Moh. Hatta',
        'opsi_c': 'Ki Hajar Dewantara',
        'opsi_d': 'Mr. Muhammad Yamin',
        'opsi_e': 'Sutan Sjahrir',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Kerajaan Mataram Islam berpusat di...',
        'opsi_a': 'Jawa Tengah',
        'opsi_b': 'Jawa Barat',
        'opsi_c': 'Jawa Timur',
        'opsi_d': 'Sumatera',
        'opsi_e': 'Kalimantan',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Perjanjian Kramat Jati ditandatangani pada tahun...',
        'opsi_a': '1946',
        'opsi_b': '1945',
        'opsi_c': '1947',
        'opsi_d': '1948',
        'opsi_e': '1949',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Tokoh yang dikenal sebagai "Bapak Kemerdekaan Indonesia" adalah...',
        'opsi_a': 'Ir. Soekarno',
        'opsi_b': 'Moh. Hatta',
        'opsi_c': 'Ki Hajar Dewantara',
        'opsi_d': 'Mr. Muhammad Yamin',
        'opsi_e': 'Sutan Sjahrir',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Pertempuran Bandung Lautan Api terjadi pada tahun...',
        'opsi_a': '1946',
        'opsi_b': '1945',
        'opsi_c': '1947',
        'opsi_d': '1948',
        'opsi_e': '1949',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Tokoh yang dikenal sebagai "Bapak TNI Indonesia" adalah...',
        'opsi_a': 'Jenderal A.H. Nasution',
        'opsi_b': 'Soekarno',
        'opsi_c': 'Moh. Hatta',
        'opsi_d': 'Ki Hajar Dewantara',
        'opsi_e': 'Sutan Sjahrir',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Kerajaan Ternate berpusat di...',
        'opsi_a': 'Maluku',
        'opsi_b': 'Jawa Tengah',
        'opsi_c': 'Jawa Barat',
        'opsi_d': 'Jawa Timur',
        'opsi_e': 'Sumatera',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Perjanjian Tuntang ditandatangani pada tahun...',
        'opsi_a': '1824',
        'opsi_b': '1814',
        'opsi_c': '1834',
        'opsi_d': '1844',
        'opsi_e': '1854',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Tokoh yang dikenal sebagai "Bapak Reformasi Indonesia" adalah...',
        'opsi_a': 'Prof. Dr. Amien Rais',
        'opsi_b': 'Soekarno',
        'opsi_c': 'Moh. Hatta',
        'opsi_d': 'Ki Hajar Dewantara',
        'opsi_e': 'Sutan Sjahrir',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Candi Plaosan dibangun pada masa kerajaan...',
        'opsi_a': 'Mataram Kuno',
        'opsi_b': 'Majapahit',
        'opsi_c': 'Sriwijaya',
        'opsi_d': 'Sailendra',
        'opsi_e': 'Tarumanegara',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Perjanjian Tegal ditandatangani pada tahun...',
        'opsi_a': '1946',
        'opsi_b': '1945',
        'opsi_c': '1947',
        'opsi_d': '1948',
        'opsi_e': '1949',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Tokoh yang dikenal sebagai "Bapak Pendidikan Nasional Indonesia" adalah...',
        'opsi_a': 'Ki Hajar Dewantara',
        'opsi_b': 'Soekarno',
        'opsi_c': 'Moh. Hatta',
        'opsi_d': 'Mr. Muhammad Yamin',
        'opsi_e': 'Sutan Sjahrir',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Candi Banyunibo dibangun pada masa kerajaan...',
        'opsi_a': 'Mataram Kuno',
        'opsi_b': 'Majapahit',
        'opsi_c': 'Sriwijaya',
        'opsi_d': 'Sailendra',
        'opsi_e': 'Tarumanegara',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Perjanjian Giyanti ditandatangani pada tahun...',
        'opsi_a': '1755',
        'opsi_b': '1745',
        'opsi_c': '1765',
        'opsi_d': '1735',
        'opsi_e': '1775',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Tokoh yang dikenal sebagai "Bapak Kedokteran Indonesia" adalah...',
        'opsi_a': 'Dr. C. L. De Schroeder',
        'opsi_b': 'Soekarno',
        'opsi_c': 'Moh. Hatta',
        'opsi_d': 'Ki Hajar Dewantara',
        'opsi_e': 'Sutan Sjahrir',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Kerajaan Pajajaran berpusat di...',
        'opsi_a': 'Jawa Barat',
        'opsi_b': 'Jawa Tengah',
        'opsi_c': 'Jawa Timur',
        'opsi_d': 'Sumatera',
        'opsi_e': 'Kalimantan',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Perjanjian Puncak Jaya ditandatangani pada tahun...',
        'opsi_a': '1946',
        'opsi_b': '1945',
        'opsi_c': '1947',
        'opsi_d': '1948',
        'opsi_e': '1949',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Tokoh yang dikenal sebagai "Bapak Kebudayaan Indonesia" adalah...',
        'opsi_a': 'Dr. H. Multatuli',
        'opsi_b': 'Soekarno',
        'opsi_c': 'Moh. Hatta',
        'opsi_d': 'Ki Hajar Dewantara',
        'opsi_e': 'Sutan Sjahrir',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Pertempuran Medan Area terjadi pada tahun...',
        'opsi_a': '1945',
        'opsi_b': '1946',
        'opsi_c': '1947',
        'opsi_d': '1948',
        'opsi_e': '1949',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Tokoh yang dikenal sebagai "Bapak Maritim Indonesia" adalah...',
        'opsi_a': 'Ir. Soekarno',
        'opsi_b': 'Moh. Hatta',
        'opsi_c': 'Ki Hajar Dewantara',
        'opsi_d': 'Mr. Muhammad Yamin',
        'opsi_e': 'Sutan Sjahrir',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Kerajaan Tidore berpusat di...',
        'opsi_a': 'Maluku',
        'opsi_b': 'Jawa Tengah',
        'opsi_c': 'Jawa Barat',
        'opsi_d': 'Jawa Timur',
        'opsi_e': 'Sumatera',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Perjanjian Simpang ditandatangani pada tahun...',
        'opsi_a': '1946',
        'opsi_b': '1945',
        'opsi_c': '1947',
        'opsi_d': '1948',
        'opsi_e': '1949',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Tokoh yang dikenal sebagai "Bapak Industri Indonesia" adalah...',
        'opsi_a': 'Ir. Soekarno',
        'opsi_b': 'Moh. Hatta',
        'opsi_c': 'Ki Hajar Dewantara',
        'opsi_d': 'Mr. Muhammad Yamin',
        'opsi_e': 'Sutan Sjahrir',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Candi Pawon dibangun pada masa kerajaan...',
        'opsi_a': 'Mataram Kuno',
        'opsi_b': 'Majapahit',
        'opsi_c': 'Sriwijaya',
        'opsi_d': 'Sailendra',
        'opsi_e': 'Tarumanegara',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Perjanjian Saragosa ditandatangani pada tahun...',
        'opsi_a': '1946',
        'opsi_b': '1945',
        'opsi_c': '1947',
        'opsi_d': '1948',
        'opsi_e': '1949',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Tokoh yang dikenal sebagai "Bapak Ekonomi Indonesia" adalah...',
        'opsi_a': 'Moh. Hatta',
        'opsi_b': 'Soekarno',
        'opsi_c': 'Ki Hajar Dewantara',
        'opsi_d': 'Mr. Muhammad Yamin',
        'opsi_e': 'Sutan Sjahrir',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Candi Kalasan dibangun pada masa kerajaan...',
        'opsi_a': 'Mataram Kuno',
        'opsi_b': 'Majapahit',
        'opsi_c': 'Sriwijaya',
        'opsi_d': 'Sailendra',
        'opsi_e': 'Tarumanegara',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Perjanjian Salatiga ditandatangani pada tahun...',
        'opsi_a': '1946',
        'opsi_b': '1945',
        'opsi_c': '1947',
        'opsi_d': '1948',
        'opsi_e': '1949',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Tokoh yang dikenal sebagai "Bapak Koperasi Indonesia" adalah...',
        'opsi_a': 'Dr. H. Mohammad Hatta',
        'opsi_b': 'Soekarno',
        'opsi_c': 'Ki Hajar Dewantara',
        'opsi_d': 'Mr. Muhammad Yamin',
        'opsi_e': 'Sutan Sjahrir',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Kerajaan Singhasari berpusat di...',
        'opsi_a': 'Jawa Timur',
        'opsi_b': 'Jawa Tengah',
        'opsi_c': 'Jawa Barat',
        'opsi_d': 'Sumatera',
        'opsi_e': 'Kalimantan',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Perjanjian Kramat Jati ditandatangani pada tahun...',
        'opsi_a': '1946',
        'opsi_b': '1945',
        'opsi_c': '1947',
        'opsi_d': '1948',
        'opsi_e': '1949',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Tokoh yang dikenal sebagai "Bapak Kebangkitan Nasional Indonesia" adalah...',
        'opsi_a': 'Dr. C.W.T. Boedi Oetomo',
        'opsi_b': 'Soekarno',
        'opsi_c': 'Moh. Hatta',
        'opsi_d': 'Ki Hajar Dewantara',
        'opsi_e': 'Sutan Sjahrir',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Pertempuran Surabaya terjadi pada tahun...',
        'opsi_a': '1945',
        'opsi_b': '1946',
        'opsi_c': '1947',
        'opsi_d': '1948',
        'opsi_e': '1949',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Tokoh yang dikenal sebagai "Bapak Demokrasi Indonesia" adalah...',
        'opsi_a': 'Ir. Soekarno',
        'opsi_b': 'Moh. Hatta',
        'opsi_c': 'Ki Hajar Dewantara',
        'opsi_d': 'Mr. Muhammad Yamin',
        'opsi_e': 'Sutan Sjahrir',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Kerajaan Banjar berpusat di...',
        'opsi_a': 'Kalimantan',
        'opsi_b': 'Jawa Tengah',
        'opsi_c': 'Jawa Barat',
        'opsi_d': 'Jawa Timur',
        'opsi_e': 'Sumatera',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Perjanjian Roem-Royen ditandatangani pada tahun...',
        'opsi_a': '1949',
        'opsi_b': '1945',
        'opsi_c': '1947',
        'opsi_d': '1946',
        'opsi_e': '1948',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Tokoh yang dikenal sebagai "Bapak Proklamasi Indonesia" adalah...',
        'opsi_a': 'Ir. Soekarno',
        'opsi_b': 'Moh. Hatta',
        'opsi_c': 'Ki Hajar Dewantara',
        'opsi_d': 'Mr. Muhammad Yamin',
        'opsi_e': 'Sutan Sjahrir',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Candi Mendut dibangun pada masa kerajaan...',
        'opsi_a': 'Mataram Kuno',
        'opsi_b': 'Majapahit',
        'opsi_c': 'Sriwijaya',
        'opsi_d': 'Sailendra',
        'opsi_e': 'Tarumanegara',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Perjanjian Linggajati ditandatangani pada tahun...',
        'opsi_a': '1946',
        'opsi_b': '1945',
        'opsi_c': '1947',
        'opsi_d': '1948',
        'opsi_e': '1949',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Tokoh yang dikenal sebagai "Bapak Pembangunan Indonesia" adalah...',
        'opsi_a': 'Ir. Soekarno',
        'opsi_b': 'Moh. Hatta',
        'opsi_c': 'Ki Hajar Dewantara',
        'opsi_d': 'Mr. Muhammad Yamin',
        'opsi_e': 'Sutan Sjahrir',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Candi Ngawen dibangun pada masa kerajaan...',
        'opsi_a': 'Mataram Kuno',
        'opsi_b': 'Majapahit',
        'opsi_c': 'Sriwijaya',
        'opsi_d': 'Sailendra',
        'opsi_e': 'Tarumanegara',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Perjanjian Kramat Jati ditandatangani pada tahun...',
        'opsi_a': '1946',
        'opsi_b': '1945',
        'opsi_c': '1947',
        'opsi_d': '1948',
        'opsi_e': '1949',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Tokoh yang dikenal sebagai "Bapak Pers Nasional Indonesia" adalah...',
        'opsi_a': 'Ir. Soekarno',
        'opsi_b': 'Moh. Hatta',
        'opsi_c': 'Ki Hajar Dewantara',
        'opsi_d': 'Mr. Muhammad Yamin',
        'opsi_e': 'Sutan Sjahrir',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Kerajaan Sriwijaya berpusat di...',
        'opsi_a': 'Sumatera',
        'opsi_b': 'Jawa Tengah',
        'opsi_c': 'Jawa Barat',
        'opsi_d': 'Jawa Timur',
        'opsi_e': 'Kalimantan',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Perjanjian Jakarta ditandatangani pada tahun...',
        'opsi_a': '1946',
        'opsi_b': '1945',
        'opsi_c': '1947',
        'opsi_d': '1948',
        'opsi_e': '1949',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Tokoh yang dikenal sebagai "Bapak Koperasi Indonesia" adalah...',
        'opsi_a': 'Dr. H. Mohammad Hatta',
        'opsi_b': 'Soekarno',
        'opsi_c': 'Ki Hajar Dewantara',
        'opsi_d': 'Mr. Muhammad Yamin',
        'opsi_e': 'Sutan Sjahrir',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Pertempuran Semarang terjadi pada tahun...',
        'opsi_a': '1945',
        'opsi_b': '1946',
        'opsi_c': '1947',
        'opsi_d': '1948',
        'opsi_e': '1949',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Tokoh yang dikenal sebagai "Bapak Kesehatan Indonesia" adalah...',
        'opsi_a': 'Dr. G.S.S.J. Ratulangi',
        'opsi_b': 'Soekarno',
        'opsi_c': 'Moh. Hatta',
        'opsi_d': 'Ki Hajar Dewantara',
        'opsi_e': 'Sutan Sjahrir',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Kerajaan Kutai berpusat di...',
        'opsi_a': 'Kalimantan',
        'opsi_b': 'Jawa Tengah',
        'opsi_c': 'Jawa Barat',
        'opsi_d': 'Jawa Timur',
        'opsi_e': 'Sumatera',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Perjanjian Linggarjati ditandatangani pada tahun...',
        'opsi_a': '1946',
        'opsi_b': '1945',
        'opsi_c': '1947',
        'opsi_d': '1948',
        'opsi_e': '1949',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Tokoh yang dikenal sebagai "Bapak Pendidikan Indonesia" adalah...',
        'opsi_a': 'Ki Hajar Dewantara',
        'opsi_b': 'Soekarno',
        'opsi_c': 'Moh. Hatta',
        'opsi_d': 'Mr. Muhammad Yamin',
        'opsi_e': 'Sutan Sjahrir',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Candi Borobudur dibangun pada masa kerajaan...',
        'opsi_a': 'Sailendra',
        'opsi_b': 'Majapahit',
        'opsi_c': 'Sriwijaya',
        'opsi_d': 'Mataram Kuno',
        'opsi_e': 'Tarumanegara',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Perjanjian Renville ditandatangani pada tahun...',
        'opsi_a': '1948',
        'opsi_b': '1945',
        'opsi_c': '1947',
        'opsi_d': '1946',
        'opsi_e': '1949',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Tokoh yang dikenal sebagai "Bapak Koperasi Indonesia" adalah...',
        'opsi_a': 'Dr. H. Mohammad Hatta',
        'opsi_b': 'Soekarno',
        'opsi_c': 'Ki Hajar Dewantara',
        'opsi_d': 'Mr. Muhammad Yamin',
        'opsi_e': 'Sutan Sjahrir',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Candi Sari dibangun pada masa kerajaan...',
        'opsi_a': 'Mataram Kuno',
        'opsi_b': 'Majapahit',
        'opsi_c': 'Sriwijaya',
        'opsi_d': 'Sailendra',
        'opsi_e': 'Tarumanegara',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Perjanjian Roem-Royen ditandatangani pada tahun...',
        'opsi_a': '1949',
        'opsi_b': '1945',
        'opsi_c': '1947',
        'opsi_d': '1946',
        'opsi_e': '1948',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Tokoh yang dikenal sebagai "Bapak Koperasi Indonesia" adalah...',
        'opsi_a': 'Dr. H. Mohammad Hatta',
        'opsi_b': 'Soekarno',
        'opsi_c': 'Ki Hajar Dewantara',
        'opsi_d': 'Mr. Muhammad Yamin',
        'opsi_e': 'Sutan Sjahrir',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Kerajaan Tarumanegara berpusat di...',
        'opsi_a': 'Jawa Barat',
        'opsi_b': 'Jawa Tengah',
        'opsi_c': 'Jawa Timur',
        'opsi_d': 'Sumatera',
        'opsi_e': 'Kalimantan',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Perjanjian Linggajati ditandatangani pada tahun...',
        'opsi_a': '1946',
        'opsi_b': '1945',
        'opsi_c': '1947',
        'opsi_d': '1948',
        'opsi_e': '1949',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Tokoh yang dikenal sebagai "Bapak Koperasi Indonesia" adalah...',
        'opsi_a': 'Dr. H. Mohammad Hatta',
        'opsi_b': 'Soekarno',
        'opsi_c': 'Ki Hajar Dewantara',
        'opsi_d': 'Mr. Muhammad Yamin',
        'opsi_e': 'Sutan Sjahrir',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Pertempuran Ambarawa terjadi pada tahun...',
        'opsi_a': '1945',
        'opsi_b': '1946',
        'opsi_c': '1947',
        'opsi_d': '1948',
        'opsi_e': '1949',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Tokoh yang dikenal sebagai "Bapak Koperasi Indonesia" adalah...',
        'opsi_a': 'Dr. H. Mohammad Hatta',
        'opsi_b': 'Soekarno',
        'opsi_c': 'Ki Hajar Dewantara',
        'opsi_d': 'Mr. Muhammad Yamin',
        'opsi_e': 'Sutan Sjahrir',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Kerajaan Kediri berpusat di...',
        'opsi_a': 'Jawa Timur',
        'opsi_b': 'Jawa Tengah',
        'opsi_c': 'Jawa Barat',
        'opsi_d': 'Sumatera',
        'opsi_e': 'Kalimantan',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Perjanjian Kramat Jati ditandatangani pada tahun...',
        'opsi_a': '1946',
        'opsi_b': '1945',
        'opsi_c': '1947',
        'opsi_d': '1948',
        'opsi_e': '1949',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Tokoh yang dikenal sebagai "Bapak Koperasi Indonesia" adalah...',
        'opsi_a': 'Dr. H. Mohammad Hatta',
        'opsi_b': 'Soekarno',
        'opsi_c': 'Ki Hajar Dewantara',
        'opsi_d': 'Mr. Muhammad Yamin',
        'opsi_e': 'Sutan Sjahrir',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Candi Prambanan dibangun pada masa kerajaan...',
        'opsi_a': 'Mataram Kuno',
        'opsi_b': 'Majapahit',
        'opsi_c': 'Sriwijaya',
        'opsi_d': 'Sailendra',
        'opsi_e': 'Tarumanegara',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Perjanjian Tuntang ditandatangani pada tahun...',
        'opsi_a': '1824',
        'opsi_b': '1814',
        'opsi_c': '1834',
        'opsi_d': '1844',
        'opsi_e': '1854',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Tokoh yang dikenal sebagai "Bapak Koperasi Indonesia" adalah...',
        'opsi_a': 'Dr. H. Mohammad Hatta',
        'opsi_b': 'Soekarno',
        'opsi_c': 'Ki Hajar Dewantara',
        'opsi_d': 'Mr. Muhammad Yamin',
        'opsi_e': 'Sutan Sjahrir',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Candi Plaosan dibangun pada masa kerajaan...',
        'opsi_a': 'Mataram Kuno',
        'opsi_b': 'Majapahit',
        'opsi_c': 'Sriwijaya',
        'opsi_d': 'Sailendra',
        'opsi_e': 'Tarumanegara',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Perjanjian Giyanti ditandatangani pada tahun...',
        'opsi_a': '1755',
        'opsi_b': '1745',
        'opsi_c': '1765',
        'opsi_d': '1735',
        'opsi_e': '1775',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Tokoh yang dikenal sebagai "Bapak Koperasi Indonesia" adalah...',
        'opsi_a': 'Dr. H. Mohammad Hatta',
        'opsi_b': 'Soekarno',
        'opsi_c': 'Ki Hajar Dewantara',
        'opsi_d': 'Mr. Muhammad Yamin',
        'opsi_e': 'Sutan Sjahrir',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Kerajaan Mataram Islam berpusat di...',
        'opsi_a': 'Jawa Tengah',
        'opsi_b': 'Jawa Barat',
        'opsi_c': 'Jawa Timur',
        'opsi_d': 'Sumatera',
        'opsi_e': 'Kalimantan',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Perjanjian Salatiga ditandatangani pada tahun...',
        'opsi_a': '1946',
        'opsi_b': '1945',
        'opsi_c': '1947',
        'opsi_d': '1948',
        'opsi_e': '1949',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Tokoh yang dikenal sebagai "Bapak Koperasi Indonesia" adalah...',
        'opsi_a': 'Dr. H. Mohammad Hatta',
        'opsi_b': 'Soekarno',
        'opsi_c': 'Ki Hajar Dewantara',
        'opsi_d': 'Mr. Muhammad Yamin',
        'opsi_e': 'Sutan Sjahrir',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Pertempuran Bandung Lautan Api terjadi pada tahun...',
        'opsi_a': '1946',
        'opsi_b': '1945',
        'opsi_c': '1947',
        'opsi_d': '1948',
        'opsi_e': '1949',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Tokoh yang dikenal sebagai "Bapak Koperasi Indonesia" adalah...',
        'opsi_a': 'Dr. H. Mohammad Hatta',
        'opsi_b': 'Soekarno',
        'opsi_c': 'Ki Hajar Dewantara',
        'opsi_d': 'Mr. Muhammad Yamin',
        'opsi_e': 'Sutan Sjahrir',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Kerajaan Demak berpusat di...',
        'opsi_a': 'Jawa Tengah',
        'opsi_b': 'Jawa Barat',
        'opsi_c': 'Jawa Timur',
        'opsi_d': 'Sumatera',
        'opsi_e': 'Kalimantan',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Perjanjian Linggarjati ditandatangani pada tahun...',
        'opsi_a': '1946',
        'opsi_b': '1945',
        'opsi_c': '1947',
        'opsi_d': '1948',
        'opsi_e': '1949',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Tokoh yang dikenal sebagai "Bapak Koperasi Indonesia" adalah...',
        'opsi_a': 'Dr. H. Mohammad Hatta',
        'opsi_b': 'Soekarno',
        'opsi_c': 'Ki Hajar Dewantara',
        'opsi_d': 'Mr. Muhammad Yamin',
        'opsi_e': 'Sutan Sjahrir',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Candi Sewu dibangun pada masa kerajaan...',
        'opsi_a': 'Mataram Kuno',
        'opsi_b': 'Majapahit',
        'opsi_c': 'Sriwijaya',
        'opsi_d': 'Sailendra',
        'opsi_e': 'Tarumanegara',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Perjanjian Breda ditandatangani pada tahun...',
        'opsi_a': '1664',
        'opsi_b': '1654',
        'opsi_c': '1674',
        'opsi_d': '1684',
        'opsi_e': '1694',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Tokoh yang dikenal sebagai "Bapak Koperasi Indonesia" adalah...',
        'opsi_a': 'Dr. H. Mohammad Hatta',
        'opsi_b': 'Soekarno',
        'opsi_c': 'Ki Hajar Dewantara',
        'opsi_d': 'Mr. Muhammad Yamin',
        'opsi_e': 'Sutan Sjahrir',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Candi Kalasan dibangun pada masa kerajaan...',
        'opsi_a': 'Mataram Kuno',
        'opsi_b': 'Majapahit',
        'opsi_c': 'Sriwijaya',
        'opsi_d': 'Sailendra',
        'opsi_e': 'Tarumanegara',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Perjanjian Pangkalpinang ditandatangani pada tahun...',
        'opsi_a': '1946',
        'opsi_b': '1945',
        'opsi_c': '1947',
        'opsi_d': '1948',
        'opsi_e': '1949',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Tokoh yang dikenal sebagai "Bapak Koperasi Indonesia" adalah...',
        'opsi_a': 'Dr. H. Mohammad Hatta',
        'opsi_b': 'Soekarno',
        'opsi_c': 'Ki Hajar Dewantara',
        'opsi_d': 'Mr. Muhammad Yamin',
        'opsi_e': 'Sutan Sjahrir',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Kerajaan Singhasari berpusat di...',
        'opsi_a': 'Jawa Timur',
        'opsi_b': 'Jawa Tengah',
        'opsi_c': 'Jawa Barat',
        'opsi_d': 'Sumatera',
        'opsi_e': 'Kalimantan',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Perjanjian Linggajati ditandatangani pada tahun...',
        'opsi_a': '1946',
        'opsi_b': '1945',
        'opsi_c': '1947',
        'opsi_d': '1948',
        'opsi_e': '1949',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Tokoh yang dikenal sebagai "Bapak Koperasi Indonesia" adalah...',
        'opsi_a': 'Dr. H. Mohammad Hatta',
        'opsi_b': 'Soekarno',
        'opsi_c': 'Ki Hajar Dewantara',
        'opsi_d': 'Mr. Muhammad Yamin',
        'opsi_e': 'Sutan Sjahrir',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Pertempuran Surabaya terjadi pada tahun...',
        'opsi_a': '1945',
        'opsi_b': '1946',
        'opsi_c': '1947',
        'opsi_d': '1948',
        'opsi_e': '1949',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Tokoh yang dikenal sebagai "Bapak Koperasi Indonesia" adalah...',
        'opsi_a': 'Dr. H. Mohammad Hatta',
        'opsi_b': 'Soekarno',
        'opsi_c': 'Ki Hajar Dewantara',
        'opsi_d': 'Mr. Muhammad Yamin',
        'opsi_e': 'Sutan Sjahrir',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Kerajaan Pajang berpusat di...',
        'opsi_a': 'Jawa Tengah',
        'opsi_b': 'Jawa Barat',
        'opsi_c': 'Jawa Timur',
        'opsi_d': 'Sumatera',
        'opsi_e': 'Kalimantan',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Perjanjian Renville ditandatangani pada tahun...',
        'opsi_a': '1948',
        'opsi_b': '1945',
        'opsi_c': '1947',
        'opsi_d': '1946',
        'opsi_e': '1949',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Tokoh yang dikenal sebagai "Bapak Koperasi Indonesia" adalah...',
        'opsi_a': 'Dr. H. Mohammad Hatta',
        'opsi_b': 'Soekarno',
        'opsi_c': 'Ki Hajar Dewantara',
        'opsi_d': 'Mr. Muhammad Yamin',
        'opsi_e': 'Sutan Sjahrir',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Candi Mendut dibangun pada masa kerajaan...',
        'opsi_a': 'Sailendra',
        'opsi_b': 'Majapahit',
        'opsi_c': 'Sriwijaya',
        'opsi_d': 'Mataram Kuno',
        'opsi_e': 'Tarumanegara',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Perjanjian London ditandatangani pada tahun...',
        'opsi_a': '1824',
        'opsi_b': '1814',
        'opsi_c': '1834',
        'opsi_d': '1844',
        'opsi_e': '1854',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Tokoh yang dikenal sebagai "Bapak Koperasi Indonesia" adalah...',
        'opsi_a': 'Dr. H. Mohammad Hatta',
        'opsi_b': 'Soekarno',
        'opsi_c': 'Ki Hajar Dewantara',
        'opsi_d': 'Mr. Muhammad Yamin',
        'opsi_e': 'Sutan Sjahrir',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Candi Pawon dibangun pada masa kerajaan...',
        'opsi_a': 'Mataram Kuno',
        'opsi_b': 'Majapahit',
        'opsi_c': 'Sriwijaya',
        'opsi_d': 'Sailendra',
        'opsi_e': 'Tarumanegara',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Perjanjian Sulu ditandatangani pada tahun...',
        'opsi_a': '1761',
        'opsi_b': '1751',
        'opsi_c': '1771',
        'opsi_d': '1741',
        'opsi_e': '1781',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Tokoh yang dikenal sebagai "Bapak Koperasi Indonesia" adalah...',
        'opsi_a': 'Dr. H. Mohammad Hatta',
        'opsi_b': 'Soekarno',
        'opsi_c': 'Ki Hajar Dewantara',
        'opsi_d': 'Mr. Muhammad Yamin',
        'opsi_e': 'Sutan Sjahrir',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Kerajaan Samudera Pasai berpusat di...',
        'opsi_a': 'Sumatera',
        'opsi_b': 'Jawa Tengah',
        'opsi_c': 'Jawa Barat',
        'opsi_d': 'Jawa Timur',
        'opsi_e': 'Kalimantan',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Perjanjian Renville ditandatangani pada tahun...',
        'opsi_a': '1948',
        'opsi_b': '1945',
        'opsi_c': '1947',
        'opsi_d': '1946',
        'opsi_e': '1949',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Tokoh yang dikenal sebagai "Bapak Koperasi Indonesia" adalah...',
        'opsi_a': 'Dr. H. Mohammad Hatta',
        'opsi_b': 'Soekarno',
        'opsi_c': 'Ki Hajar Dewantara',
        'opsi_d': 'Mr. Muhammad Yamin',
        'opsi_e': 'Sutan Sjahrir',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Pertempuran Medan Area terjadi pada tahun...',
        'opsi_a': '1945',
        'opsi_b': '1946',
        'opsi_c': '1947',
        'opsi_d': '1948',
        'opsi_e': '1949',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Tokoh yang dikenal sebagai "Bapak Koperasi Indonesia" adalah...',
        'opsi_a': 'Dr. H. Mohammad Hatta',
        'opsi_b': 'Soekarno',
        'opsi_c': 'Ki Hajar Dewantara',
        'opsi_d': 'Mr. Muhammad Yamin',
        'opsi_e': 'Sutan Sjahrir',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Kerajaan Banten berpusat di...',
        'opsi_a': 'Jawa Barat',
        'opsi_b': 'Jawa Tengah',
        'opsi_c': 'Jawa Timur',
        'opsi_d': 'Sumatera',
        'opsi_e': 'Kalimantan',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Perjanjian Roem-Royen ditandatangani pada tahun...',
        'opsi_a': '1949',
        'opsi_b': '1945',
        'opsi_c': '1947',
        'opsi_d': '1946',
        'opsi_e': '1948',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Tokoh yang dikenal sebagai "Bapak Koperasi Indonesia" adalah...',
        'opsi_a': 'Dr. H. Mohammad Hatta',
        'opsi_b': 'Soekarno',
        'opsi_c': 'Ki Hajar Dewantara',
        'opsi_d': 'Mr. Muhammad Yamin',
        'opsi_e': 'Sutan Sjahrir',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Candi Pawon dibangun pada masa kerajaan...',
        'opsi_a': 'Mataram Kuno',
        'opsi_b': 'Majapahit',
        'opsi_c': 'Sriwijaya',
        'opsi_d': 'Sailendra',
        'opsi_e': 'Tarumanegara',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Perjanjian Simbang ditandatangani pada tahun...',
        'opsi_a': '1946',
        'opsi_b': '1945',
        'opsi_c': '1947',
        'opsi_d': '1948',
        'opsi_e': '1949',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Tokoh yang dikenal sebagai "Bapak Koperasi Indonesia" adalah...',
        'opsi_a': 'Dr. H. Mohammad Hatta',
        'opsi_b': 'Soekarno',
        'opsi_c': 'Ki Hajar Dewantara',
        'opsi_d': 'Mr. Muhammad Yamin',
        'opsi_e': 'Sutan Sjahrir',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Candi Borobudur dibangun pada masa kerajaan...',
        'opsi_a': 'Sailendra',
        'opsi_b': 'Majapahit',
        'opsi_c': 'Sriwijaya',
        'opsi_d': 'Mataram Kuno',
        'opsi_e': 'Tarumanegara',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Perjanjian Pangkalpinang ditandatangani pada tahun...',
        'opsi_a': '1946',
        'opsi_b': '1945',
        'opsi_c': '1947',
        'opsi_d': '1948',
        'opsi_e': '1949',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Tokoh yang dikenal sebagai "Bapak Koperasi Indonesia" adalah...',
        'opsi_a': 'Dr. H. Mohammad Hatta',
        'opsi_b': 'Soekarno',
        'opsi_c': 'Ki Hajar Dewantara',
        'opsi_d': 'Mr. Muhammad Yamin',
        'opsi_e': 'Sutan Sjahrir',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Kerajaan Sriwijaya berpusat di...',
        'opsi_a': 'Sumatera',
        'opsi_b': 'Jawa Tengah',
        'opsi_c': 'Jawa Barat',
        'opsi_d': 'Jawa Timur',
        'opsi_e': 'Kalimantan',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Perjanjian Linggajati ditandatangani pada tahun...',
        'opsi_a': '1946',
        'opsi_b': '1945',
        'opsi_c': '1947',
        'opsi_d': '1948',
        'opsi_e': '1949',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Tokoh yang dikenal sebagai "Bapak Koperasi Indonesia" adalah...',
        'opsi_a': 'Dr. H. Mohammad Hatta',
        'opsi_b': 'Soekarno',
        'opsi_c': 'Ki Hajar Dewantara',
        'opsi_d': 'Mr. Muhammad Yamin',
        'opsi_e': 'Sutan Sjahrir',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Pertempuran Palembang terjadi pada tahun...',
        'opsi_a': '1945',
        'opsi_b': '1946',
        'opsi_c': '1947',
        'opsi_d': '1948',
        'opsi_e': '1949',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Tokoh yang dikenal sebagai "Bapak Koperasi Indonesia" adalah...',
        'opsi_a': 'Dr. H. Mohammad Hatta',
        'opsi_b': 'Soekarno',
        'opsi_c': 'Ki Hajar Dewantara',
        'opsi_d': 'Mr. Muhammad Yamin',
        'opsi_e': 'Sutan Sjahrir',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Kerajaan Kutai berpusat di...',
        'opsi_a': 'Kalimantan',
        'opsi_b': 'Jawa Tengah',
        'opsi_c': 'Jawa Barat',
        'opsi_d': 'Jawa Timur',
        'opsi_e': 'Sumatera',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Perjanjian Roem-Royen ditandatangani pada tahun...',
        'opsi_a': '1949',
        'opsi_b': '1945',
        'opsi_c': '1947',
        'opsi_d': '1946',
        'opsi_e': '1948',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Tokoh yang dikenal sebagai "Bapak Koperasi Indonesia" adalah...',
        'opsi_a': 'Dr. H. Mohammad Hatta',
        'opsi_b': 'Soekarno',
        'opsi_c': 'Ki Hajar Dewantara',
        'opsi_d': 'Mr. Muhammad Yamin',
        'opsi_e': 'Sutan Sjahrir',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Candi Borobudur dibangun pada masa kerajaan...',
        'opsi_a': 'Sailendra',
        'opsi_b': 'Majapahit',
        'opsi_c': 'Sriwijaya',
        'opsi_d': 'Mataram Kuno',
        'opsi_e': 'Tarumanegara',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Perjanjian Kramat Jati ditandatangani pada tahun...',
        'opsi_a': '1946',
        'opsi_b': '1945',
        'opsi_c': '1947',
        'opsi_d': '1948',
        'opsi_e': '1949',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Tokoh yang dikenal sebagai "Bapak Koperasi Indonesia" adalah...',
        'opsi_a': 'Dr. H. Mohammad Hatta',
        'opsi_b': 'Soekarno',
        'opsi_c': 'Ki Hajar Dewantara',
        'opsi_d': 'Mr. Muhammad Yamin',
        'opsi_e': 'Sutan Sjahrir',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Candi Prambanan dibangun pada masa kerajaan...',
        'opsi_a': 'Mataram Kuno',
        'opsi_b': 'Majapahit',
        'opsi_c': 'Sriwijaya',
        'opsi_d': 'Sailendra',
        'opsi_e': 'Tarumanegara',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Perjanjian Sulu ditandatangani pada tahun...',
        'opsi_a': '1761',
        'opsi_b': '1751',
        'opsi_c': '1771',
        'opsi_d': '1741',
        'opsi_e': '1781',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Tokoh yang dikenal sebagai "Bapak Koperasi Indonesia" adalah...',
        'opsi_a': 'Dr. H. Mohammad Hatta',
        'opsi_b': 'Soekarno',
        'opsi_c': 'Ki Hajar Dewantara',
        'opsi_d': 'Mr. Muhammad Yamin',
        'opsi_e': 'Sutan Sjahrir',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Kerajaan Tarumanegara berpusat di...',
        'opsi_a': 'Jawa Barat',
        'opsi_b': 'Jawa Tengah',
        'opsi_c': 'Jawa Timur',
        'opsi_d': 'Sumatera',
        'opsi_e': 'Kalimantan',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Perjanjian Salatiga ditandatangani pada tahun...',
        'opsi_a': '1946',
        'opsi_b': '1945',
        'opsi_c': '1947',
        'opsi_d': '1948',
        'opsi_e': '1949',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Tokoh yang dikenal sebagai "Bapak Koperasi Indonesia" adalah...',
        'opsi_a': 'Dr. H. Mohammad Hatta',
        'opsi_b': 'Soekarno',
        'opsi_c': 'Ki Hajar Dewantara',
        'opsi_d': 'Mr. Muhammad Yamin',
        'opsi_e': 'Sutan Sjahrir',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Pertempuran Semarang terjadi pada tahun...',
        'opsi_a': '1945',
        'opsi_b': '1946',
        'opsi_c': '1947',
        'opsi_d': '1948',
        'opsi_e': '1949',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Tokoh yang dikenal sebagai "Bapak Koperasi Indonesia" adalah...',
        'opsi_a': 'Dr. H. Mohammad Hatta',
        'opsi_b': 'Soekarno',
        'opsi_c': 'Ki Hajar Dewantara',
        'opsi_d': 'Mr. Muhammad Yamin',
        'opsi_e': 'Sutan Sjahrir',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Kerajaan Kediri berpusat di...',
        'opsi_a': 'Jawa Timur',
        'opsi_b': 'Jawa Tengah',
        'opsi_c': 'Jawa Barat',
        'opsi_d': 'Sumatera',
        'opsi_e': 'Kalimantan',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Perjanjian Linggarjati ditandatangani pada tahun...',
        'opsi_a': '1946',
        'opsi_b': '1945',
        'opsi_c': '1947',
        'opsi_d': '1948',
        'opsi_e': '1949',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Tokoh yang dikenal sebagai "Bapak Koperasi Indonesia" adalah...',
        'opsi_a': 'Dr. H. Mohammad Hatta',
        'opsi_b': 'Soekarno',
        'opsi_c': 'Ki Hajar Dewantara',
        'opsi_d': 'Mr. Muhammad Yamin',
        'opsi_e': 'Sutan Sjahrir',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Candi Prambanan dibangun pada masa kerajaan...',
        'opsi_a': 'Mataram Kuno',
        'opsi_b': 'Majapahit',
        'opsi_c': 'Sriwijaya',
        'opsi_d': 'Sailendra',
        'opsi_e': 'Tarumanegara',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Perjanjian Jakarta ditandatangani pada tahun...',
        'opsi_a': '1946',
        'opsi_b': '1945',
        'opsi_c': '1947',
        'opsi_d': '1948',
        'opsi_e': '1949',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Tokoh yang dikenal sebagai "Bapak Koperasi Indonesia" adalah...',
        'opsi_a': 'Dr. H. Mohammad Hatta',
        'opsi_b': 'Soekarno',
        'opsi_c': 'Ki Hajar Dewantara',
        'opsi_d': 'Mr. Muhammad Yamin',
        'opsi_e': 'Sutan Sjahrir',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Candi Sewu dibangun pada masa kerajaan...',
        'opsi_a': 'Mataram Kuno',
        'opsi_b': 'Majapahit',
        'opsi_c': 'Sriwijaya',
        'opsi_d': 'Sailendra',
        'opsi_e': 'Tarumanegara',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Perjanjian Pangkalpinang ditandatangani pada tahun...',
        'opsi_a': '1946',
        'opsi_b': '1945',
        'opsi_c': '1947',
        'opsi_d': '1948',
        'opsi_e': '1949',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Tokoh yang dikenal sebagai "Bapak Koperasi Indonesia" adalah...',
        'opsi_a': 'Dr. H. Mohammad Hatta',
        'opsi_b': 'Soekarno',
        'opsi_c': 'Ki Hajar Dewantara',
        'opsi_d': 'Mr. Muhammad Yamin',
        'opsi_e': 'Sutan Sjahrir',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Kerajaan Singosari berpusat di...',
        'opsi_a': 'Jawa Timur',
        'opsi_b': 'Jawa Tengah',
        'opsi_c': 'Jawa Barat',
        'opsi_d': 'Sumatera',
        'opsi_e': 'Kalimantan',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Perjanjian Renville ditandatangani pada tahun...',
        'opsi_a': '1948',
        'opsi_b': '1945',
        'opsi_c': '1947',
        'opsi_d': '1946',
        'opsi_e': '1949',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Tokoh yang dikenal sebagai "Bapak Koperasi Indonesia" adalah...',
        'opsi_a': 'Dr. H. Mohammad Hatta',
        'opsi_b': 'Soekarno',
        'opsi_c': 'Ki Hajar Dewantara',
        'opsi_d': 'Mr. Muhammad Yamin',
        'opsi_e': 'Sutan Sjahrir',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Pertempuran Surabaya terjadi pada tahun...',
        'opsi_a': '1945',
        'opsi_b': '1946',
        'opsi_c': '1947',
        'opsi_d': '1948',
        'opsi_e': '1949',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Tokoh yang dikenal sebagai "Bapak Koperasi Indonesia" adalah...',
        'opsi_a': 'Dr. H. Mohammad Hatta',
        'opsi_b': 'Soekarno',
        'opsi_c': 'Ki Hajar Dewantara',
        'opsi_d': 'Mr. Muhammad Yamin',
        'opsi_e': 'Sutan Sjahrir',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Kerajaan Singhasari berpusat di...',
        'opsi_a': 'Jawa Timur',
        'opsi_b': 'Jawa Tengah',
        'opsi_c': 'Jawa Barat',
        'opsi_d': 'Sumatera',
        'opsi_e': 'Kalimantan',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Perjanjian Roem-Royen ditandatangani pada tahun...',
        'opsi_a': '1949',
        'opsi_b': '1945',
        'opsi_c': '1947',
        'opsi_d': '1946',
        'opsi_e': '1948',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Tokoh yang dikenal sebagai "Bapak Koperasi Indonesia" adalah...',
        'opsi_a': 'Dr. H. Mohammad Hatta',
        'opsi_b': 'Soekarno',
        'opsi_c': 'Ki Hajar Dewantara',
        'opsi_d': 'Mr. Muhammad Yamin',
        'opsi_e': 'Sutan Sjahrir',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Candi Sewu dibangun pada masa kerajaan...',
        'opsi_a': 'Mataram Kuno',
        'opsi_b': 'Majapahit',
        'opsi_c': 'Sriwijaya',
        'opsi_d': 'Sailendra',
        'opsi_e': 'Tarumanegara',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Perjanjian Linggajati ditandatangani pada tahun...',
        'opsi_a': '1946',
        'opsi_b': '1945',
        'opsi_c': '1947',
        'opsi_d': '1948',
        'opsi_e': '1949',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Tokoh yang dikenal sebagai "Bapak Koperasi Indonesia" adalah...',
        'opsi_a': 'Dr. H. Mohammad Hatta',
        'opsi_b': 'Soekarno',
        'opsi_c': 'Ki Hajar Dewantara',
        'opsi_d': 'Mr. Muhammad Yamin',
        'opsi_e': 'Sutan Sjahrir',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Candi Mendut dibangun pada masa kerajaan...',
        'opsi_a': 'Sailendra',
        'opsi_b': 'Majapahit',
        'opsi_c': 'Sriwijaya',
        'opsi_d': 'Mataram Kuno',
        'opsi_e': 'Tarumanegara',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Perjanjian Salatiga ditandatangani pada tahun...',
        'opsi_a': '1946',
        'opsi_b': '1945',
        'opsi_c': '1947',
        'opsi_d': '1948',
        'opsi_e': '1949',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Tokoh yang dikenal sebagai "Bapak Koperasi Indonesia" adalah...',
        'opsi_a': 'Dr. H. Mohammad Hatta',
        'opsi_b': 'Soekarno',
        'opsi_c': 'Ki Hajar Dewantara',
        'opsi_d': 'Mr. Muhammad Yamin',
        'opsi_e': 'Sutan Sjahrir',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Kerajaan Mataram Islam berpusat di...',
        'opsi_a': 'Jawa Tengah',
        'opsi_b': 'Jawa Timur',
        'opsi_c': 'Jawa Barat',
        'opsi_d': 'Sumatera',
        'opsi_e': 'Kalimantan',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Perjanjian Roem-Royen ditandatangani pada tahun...',
        'opsi_a': '1949',
        'opsi_b': '1945',
        'opsi_c': '1947',
        'opsi_d': '1946',
        'opsi_e': '1948',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Tokoh yang dikenal sebagai "Bapak Koperasi Indonesia" adalah...',
        'opsi_a': 'Dr. H. Mohammad Hatta',
        'opsi_b': 'Soekarno',
        'opsi_c': 'Ki Hajar Dewantara',
        'opsi_d': 'Mr. Muhammad Yamin',
        'opsi_e': 'Sutan Sjahrir',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Pertempuran Bandung Lautan Api terjadi pada tahun...',
        'opsi_a': '1946',
        'opsi_b': '1945',
        'opsi_c': '1947',
        'opsi_d': '1948',
        'opsi_e': '1949',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Tokoh yang dikenal sebagai "Bapak Koperasi Indonesia" adalah...',
        'opsi_a': 'Dr. H. Mohammad Hatta',
        'opsi_b': 'Soekarno',
        'opsi_c': 'Ki Hajar Dewantara',
        'opsi_d': 'Mr. Muhammad Yamin',
        'opsi_e': 'Sutan Sjahrir',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Kerajaan Pajajaran berpusat di...',
        'opsi_a': 'Jawa Barat',
        'opsi_b': 'Jawa Tengah',
        'opsi_c': 'Jawa Timur',
        'opsi_d': 'Sumatera',
        'opsi_e': 'Kalimantan',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Perjanjian Linggarjati ditandatangani pada tahun...',
        'opsi_a': '1946',
        'opsi_b': '1945',
        'opsi_c': '1947',
        'opsi_d': '1948',
        'opsi_e': '1949',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Tokoh yang dikenal sebagai "Bapak Koperasi Indonesia" adalah...',
        'opsi_a': 'Dr. H. Mohammad Hatta',
        'opsi_b': 'Soekarno',
        'opsi_c': 'Ki Hajar Dewantara',
        'opsi_d': 'Mr. Muhammad Yamin',
        'opsi_e': 'Sutan Sjahrir',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Candi Mendut dibangun pada masa kerajaan...',
        'opsi_a': 'Sailendra',
        'opsi_b': 'Majapahit',
        'opsi_c': 'Sriwijaya',
        'opsi_d': 'Mataram Kuno',
        'opsi_e': 'Tarumanegara',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Perjanjian Sulu ditandatangani pada tahun...',
        'opsi_a': '1761',
        'opsi_b': '1751',
        'opsi_c': '1771',
        'opsi_d': '1741',
        'opsi_e': '1781',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Tokoh yang dikenal sebagai "Bapak Koperasi Indonesia" adalah...',
        'opsi_a': 'Dr. H. Mohammad Hatta',
        'opsi_b': 'Soekarno',
        'opsi_c': 'Ki Hajar Dewantara',
        'opsi_d': 'Mr. Muhammad Yamin',
        'opsi_e': 'Sutan Sjahrir',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Candi Borobudur dibangun pada masa kerajaan...',
        'opsi_a': 'Sailendra',
        'opsi_b': 'Majapahit',
        'opsi_c': 'Sriwijaya',
        'opsi_d': 'Mataram Kuno',
        'opsi_e': 'Tarumanegara',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Perjanjian Pangkalpinang ditandatangani pada tahun...',
        'opsi_a': '1946',
        'opsi_b': '1945',
        'opsi_c': '1947',
        'opsi_d': '1948',
        'opsi_e': '1949',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Tokoh yang dikenal sebagai "Bapak Koperasi Indonesia" adalah...',
        'opsi_a': 'Dr. H. Mohammad Hatta',
        'opsi_b': 'Soekarno',
        'opsi_c': 'Ki Hajar Dewantara',
        'opsi_d': 'Mr. Muhammad Yamin',
        'opsi_e': 'Sutan Sjahrir',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Kerajaan Kutai berpusat di...',
        'opsi_a': 'Kalimantan',
        'opsi_b': 'Jawa',
        'opsi_c': 'Sumatera',
        'opsi_d': 'Sulawesi',
        'opsi_e': 'Papua',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Perjanjian Kramat Jati ditandatangani pada tahun...',
        'opsi_a': '1946',
        'opsi_b': '1945',
        'opsi_c': '1947',
        'opsi_d': '1948',
        'opsi_e': '1949',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Tokoh yang dikenal sebagai "Bapak Koperasi Indonesia" adalah...',
        'opsi_a': 'Dr. H. Mohammad Hatta',
        'opsi_b': 'Soekarno',
        'opsi_c': 'Ki Hajar Dewantara',
        'opsi_d': 'Mr. Muhammad Yamin',
        'opsi_e': 'Sutan Sjahrir',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Pertempuran Ambarawa terjadi pada tahun...',
        'opsi_a': '1945',
        'opsi_b': '1946',
        'opsi_c': '1947',
        'opsi_d': '1948',
        'opsi_e': '1949',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Tokoh yang dikenal sebagai "Bapak Koperasi Indonesia" adalah...',
        'opsi_a': 'Dr. H. Mohammad Hatta',
        'opsi_b': 'Soekarno',
        'opsi_c': 'Ki Hajar Dewantara',
        'opsi_d': 'Mr. Muhammad Yamin',
        'opsi_e': 'Sutan Sjahrir',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Kerajaan Sriwijaya berpusat di...',
        'opsi_a': 'Sumatera',
        'opsi_b': 'Jawa',
        'opsi_c': 'Kalimantan',
        'opsi_d': 'Sulawesi',
        'opsi_e': 'Papua',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Perjanjian Renville ditandatangani pada tahun...',
        'opsi_a': '1948',
        'opsi_b': '1945',
        'opsi_c': '1947',
        'opsi_d': '1946',
        'opsi_e': '1949',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Tokoh yang dikenal sebagai "Bapak Koperasi Indonesia" adalah...',
        'opsi_a': 'Dr. H. Mohammad Hatta',
        'opsi_b': 'Soekarno',
        'opsi_c': 'Ki Hajar Dewantara',
        'opsi_d': 'Mr. Muhammad Yamin',
        'opsi_e': 'Sutan Sjahrir',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Candi Borobudur dibangun pada masa kerajaan...',
        'opsi_a': 'Sailendra',
        'opsi_b': 'Majapahit',
        'opsi_c': 'Sriwijaya',
        'opsi_d': 'Mataram Kuno',
        'opsi_e': 'Tarumanegara',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Perjanjian Linggarjati ditandatangani pada tahun...',
        'opsi_a': '1946',
        'opsi_b': '1945',
        'opsi_c': '1947',
        'opsi_d': '1948',
        'opsi_e': '1949',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Tokoh yang dikenal sebagai "Bapak Koperasi Indonesia" adalah...',
        'opsi_a': 'Dr. H. Mohammad Hatta',
        'opsi_b': 'Soekarno',
        'opsi_c': 'Ki Hajar Dewantara',
        'opsi_d': 'Mr. Muhammad Yamin',
        'opsi_e': 'Sutan Sjahrir',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Candi Prambanan dibangun pada masa kerajaan...',
        'opsi_a': 'Mataram Kuno',
        'opsi_b': 'Majapahit',
        'opsi_c': 'Sriwijaya',
        'opsi_d': 'Sailendra',
        'opsi_e': 'Tarumanegara',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Perjanjian Linggajati ditandatangani pada tahun...',
        'opsi_a': '1946',
        'opsi_b': '1945',
        'opsi_c': '1947',
        'opsi_d': '1948',
        'opsi_e': '1949',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Tokoh yang dikenal sebagai "Bapak Koperasi Indonesia" adalah...',
        'opsi_a': 'Dr. H. Mohammad Hatta',
        'opsi_b': 'Soekarno',
        'opsi_c': 'Ki Hajar Dewantara',
        'opsi_d': 'Mr. Muhammad Yamin',
        'opsi_e': 'Sutan Sjahrir',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Kerajaan Tarumanegara berpusat di...',
        'opsi_a': 'Jawa Barat',
        'opsi_b': 'Jawa Tengah',
        'opsi_c': 'Jawa Timur',
        'opsi_d': 'Sumatera',
        'opsi_e': 'Kalimantan',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Perjanjian Jakarta ditandatangani pada tahun...',
        'opsi_a': '1946',
        'opsi_b': '1945',
        'opsi_c': '1947',
        'opsi_d': '1948',
        'opsi_e': '1949',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Tokoh yang dikenal sebagai "Bapak Koperasi Indonesia" adalah...',
        'opsi_a': 'Dr. H. Mohammad Hatta',
        'opsi_b': 'Soekarno',
        'opsi_c': 'Ki Hajar Dewantara',
        'opsi_d': 'Mr. Muhammad Yamin',
        'opsi_e': 'Sutan Sjahrir',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Pertempuran Medan Area terjadi pada tahun...',
        'opsi_a': '1945',
        'opsi_b': '1946',
        'opsi_c': '1947',
        'opsi_d': '1948',
        'opsi_e': '1949',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Tokoh yang dikenal sebagai "Bapak Koperasi Indonesia" adalah...',
        'opsi_a': 'Dr. H. Mohammad Hatta',
        'opsi_b': 'Soekarno',
        'opsi_c': 'Ki Hajar Dewantara',
        'opsi_d': 'Mr. Muhammad Yamin',
        'opsi_e': 'Sutan Sjahrir',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Kerajaan Tarumanegara berpusat di...',
        'opsi_a': 'Jawa Barat',
        'opsi_b': 'Jawa Tengah',
        'opsi_c': 'Jawa Timur',
        'opsi_d': 'Sumatera',
        'opsi_e': 'Kalimantan',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Perjanjian Linggajati ditandatangani pada tahun...',
        'opsi_a': '1946',
        'opsi_b': '1945',
        'opsi_c': '1947',
        'opsi_d': '1948',
        'opsi_e': '1949',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Tokoh yang dikenal sebagai "Bapak Koperasi Indonesia" adalah...',
        'opsi_a': 'Dr. H. Mohammad Hatta',
        'opsi_b': 'Soekarno',
        'opsi_c': 'Ki Hajar Dewantara',
        'opsi_d': 'Mr. Muhammad Yamin',
        'opsi_e': 'Sutan Sjahrir',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Candi Prambanan dibangun pada masa kerajaan...',
        'opsi_a': 'Mataram Kuno',
        'opsi_b': 'Majapahit',
        'opsi_c': 'Sriwijaya',
        'opsi_d': 'Sailendra',
        'opsi_e': 'Tarumanegara',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Perjanjian Linggajati ditandatangani pada tahun...',
        'opsi_a': '1946',
        'opsi_b': '1945',
        'opsi_c': '1947',
        'opsi_d': '1948',
        'opsi_e': '1949',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Tokoh yang dikenal sebagai "Bapak Koperasi Indonesia" adalah...',
        'opsi_a': 'Dr. H. Mohammad Hatta',
        'opsi_b': 'Soekarno',
        'opsi_c': 'Ki Hajar Dewantara',
        'opsi_d': 'Mr. Muhammad Yamin',
        'opsi_e': 'Sutan Sjahrir',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Candi Kalasan dibangun pada masa kerajaan...',
        'opsi_a': 'Mataram Kuno',
        'opsi_b': 'Majapahit',
        'opsi_c': 'Sriwijaya',
        'opsi_d': 'Sailendra',
        'opsi_e': 'Tarumanegara',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Perjanjian Linggarjati ditandatangani pada tahun...',
        'opsi_a': '1946',
        'opsi_b': '1945',
        'opsi_c': '1947',
        'opsi_d': '1948',
        'opsi_e': '1949',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Tokoh yang dikenal sebagai "Bapak Koperasi Indonesia" adalah...',
        'opsi_a': 'Dr. H. Mohammad Hatta',
        'opsi_b': 'Soekarno',
        'opsi_c': 'Ki Hajar Dewantara',
        'opsi_d': 'Mr. Muhammad Yamin',
        'opsi_e': 'Sutan Sjahrir',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Kerajaan Tarumanegara berpusat di...',
        'opsi_a': 'Jawa Barat',
        'opsi_b': 'Jawa Tengah',
        'opsi_c': 'Jawa Timur',
        'opsi_d': 'Sumatera',
        'opsi_e': 'Kalimantan',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Perjanjian Linggarjati ditandatangani pada tahun...',
        'opsi_a': '1946',
        'opsi_b': '1945',
        'opsi_c': '1947',
        'opsi_d': '1948',
        'opsi_e': '1949',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Tokoh yang dikenal sebagai "Bapak Koperasi Indonesia" adalah...',
        'opsi_a': 'Dr. H. Mohammad Hatta',
        'opsi_b': 'Soekarno',
        'opsi_c': 'Ki Hajar Dewantara',
        'opsi_d': 'Mr. Muhammad Yamin',
        'opsi_e': 'Sutan Sjahrir',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Pertempuran Semarang terjadi pada tahun...',
        'opsi_a': '1945',
        'opsi_b': '1946',
        'opsi_c': '1947',
        'opsi_d': '1948',
        'opsi_e': '1949',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Tokoh yang dikenal sebagai "Bapak Koperasi Indonesia" adalah...',
        'opsi_a': 'Dr. H. Mohammad Hatta',
        'opsi_b': 'Soekarno',
        'opsi_c': 'Ki Hajar Dewantara',
        'opsi_d': 'Mr. Muhammad Yamin',
        'opsi_e': 'Sutan Sjahrir',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Kerajaan Tarumanegara berpusat di...',
        'opsi_a': 'Jawa Barat',
        'opsi_b': 'Jawa Tengah',
        'opsi_c': 'Jawa Timur',
        'opsi_d': 'Sumatera',
        'opsi_e': 'Kalimantan',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Perjanjian Linggajati ditandatangani pada tahun...',
        'opsi_a': '1946',
        'opsi_b': '1945',
        'opsi_c': '1947',
        'opsi_d': '1948',
        'opsi_e': '1949',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Tokoh yang dikenal sebagai "Bapak Koperasi Indonesia" adalah...',
        'opsi_a': 'Dr. H. Mohammad Hatta',
        'opsi_b': 'Soekarno',
        'opsi_c': 'Ki Hajar Dewantara',
        'opsi_d': 'Mr. Muhammad Yamin',
        'opsi_e': 'Sutan Sjahrir',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Candi Kalasan dibangun pada masa kerajaan...',
        'opsi_a': 'Mataram Kuno',
        'opsi_b': 'Majapahit',
        'opsi_c': 'Sriwijaya',
        'opsi_d': 'Sailendra',
        'opsi_e': 'Tarumanegara',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Perjanjian Linggarjati ditandatangani pada tahun...',
        'opsi_a': '1946',
        'opsi_b': '1945',
        'opsi_c': '1947',
        'opsi_d': '1948',
        'opsi_e': '1949',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Tokoh yang dikenal sebagai "Bapak Koperasi Indonesia" adalah...',
        'opsi_a': 'Dr. H. Mohammad Hatta',
        'opsi_b': 'Soekarno',
        'opsi_c': 'Ki Hajar Dewantara',
        'opsi_d': 'Mr. Muhammad Yamin',
        'opsi_e': 'Sutan Sjahrir',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Candi Sari dibangun pada masa kerajaan...',
        'opsi_a': 'Mataram Kuno',
        'opsi_b': 'Majapahit',
        'opsi_c': 'Sriwijaya',
        'opsi_d': 'Sailendra',
        'opsi_e': 'Tarumanegara',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Perjanjian Linggajati ditandatangani pada tahun...',
        'opsi_a': '1946',
        'opsi_b': '1945',
        'opsi_c': '1947',
        'opsi_d': '1948',
        'opsi_e': '1949',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Tokoh yang dikenal sebagai "Bapak Koperasi Indonesia" adalah...',
        'opsi_a': 'Dr. H. Mohammad Hatta',
        'opsi_b': 'Soekarno',
        'opsi_c': 'Ki Hajar Dewantara',
        'opsi_d': 'Mr. Muhammad Yamin',
        'opsi_e': 'Sutan Sjahrir',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Kerajaan Tarumanegara berpusat di...',
        'opsi_a': 'Jawa Barat',
        'opsi_b': 'Jawa Tengah',
        'opsi_c': 'Jawa Timur',
        'opsi_d': 'Sumatera',
        'opsi_e': 'Kalimantan',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Perjanjian Linggarjati ditandatangani pada tahun...',
        'opsi_a': '1946',
        'opsi_b': '1945',
        'opsi_c': '1947',
        'opsi_d': '1948',
        'opsi_e': '1949',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Tokoh yang dikenal sebagai "Bapak Koperasi Indonesia" adalah...',
        'opsi_a': 'Dr. H. Mohammad Hatta',
        'opsi_b': 'Soekarno',
        'opsi_c': 'Ki Hajar Dewantara',
        'opsi_d': 'Mr. Muhammad Yamin',
        'opsi_e': 'Sutan Sjahrir',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Pertempuran Surabaya terjadi pada tahun...',
        'opsi_a': '1945',
        'opsi_b': '1946',
        'opsi_c': '1947',
        'opsi_d': '1948',
        'opsi_e': '1949',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Tokoh yang dikenal sebagai "Bapak Koperasi Indonesia" adalah...',
        'opsi_a': 'Dr. H. Mohammad Hatta',
        'opsi_b': 'Soekarno',
        'opsi_c': 'Ki Hajar Dewantara',
        'opsi_d': 'Mr. Muhammad Yamin',
        'opsi_e': 'Sutan Sjahrir',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Kerajaan Tarumanegara berpusat di...',
        'opsi_a': 'Jawa Barat',
        'opsi_b': 'Jawa Tengah',
        'opsi_c': 'Jawa Timur',
        'opsi_d': 'Sumatera',
        'opsi_e': 'Kalimantan',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Perjanjian Linggajati ditandatangani pada tahun...',
        'opsi_a': '1946',
        'opsi_b': '1945',
        'opsi_c': '1947',
        'opsi_d': '1948',
        'opsi_e': '1949',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Tokoh yang dikenal sebagai "Bapak Koperasi Indonesia" adalah...',
        'opsi_a': 'Dr. H. Mohammad Hatta',
        'opsi_b': 'Soekarno',
        'opsi_c': 'Ki Hajar Dewantara',
        'opsi_d': 'Mr. Muhammad Yamin',
        'opsi_e': 'Sutan Sjahrir',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Candi Sari dibangun pada masa kerajaan...',
        'opsi_a': 'Mataram Kuno',
        'opsi_b': 'Majapahit',
        'opsi_c': 'Sriwijaya',
        'opsi_d': 'Sailendra',
        'opsi_e': 'Tarumanegara',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Perjanjian Linggarjati ditandatangani pada tahun...',
        'opsi_a': '1946',
        'opsi_b': '1945',
        'opsi_c': '1947',
        'opsi_d': '1948',
        'opsi_e': '1949',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Tokoh yang dikenal sebagai "Bapak Koperasi Indonesia" adalah...',
        'opsi_a': 'Dr. H. Mohammad Hatta',
        'opsi_b': 'Soekarno',
        'opsi_c': 'Ki Hajar Dewantara',
        'opsi_d': 'Mr. Muhammad Yamin',
        'opsi_e': 'Sutan Sjahrir',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Candi Plaosan dibangun pada masa kerajaan...',
        'opsi_a': 'Mataram Kuno',
        'opsi_b': 'Majapahit',
        'opsi_c': 'Sriwijaya',
        'opsi_d': 'Sailendra',
        'opsi_e': 'Tarumanegara',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Perjanjian Linggajati ditandatangani pada tahun...',
        'opsi_a': '1946',
        'opsi_b': '1945',
        'opsi_c': '1947',
        'opsi_d': '1948',
        'opsi_e': '1949',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Tokoh yang dikenal sebagai "Bapak Koperasi Indonesia" adalah...',
        'opsi_a': 'Dr. H. Mohammad Hatta',
        'opsi_b': 'Soekarno',
        'opsi_c': 'Ki Hajar Dewantara',
        'opsi_d': 'Mr. Muhammad Yamin',
        'opsi_e': 'Sutan Sjahrir',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Kerajaan Tarumanegara berpusat di...',
        'opsi_a': 'Jawa Barat',
        'opsi_b': 'Jawa Tengah',
        'opsi_c': 'Jawa Timur',
        'opsi_d': 'Sumatera',
        'opsi_e': 'Kalimantan',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Perjanjian Linggarjati ditandatangani pada tahun...',
        'opsi_a': '1946',
        'opsi_b': '1945',
        'opsi_c': '1947',
        'opsi_d': '1948',
        'opsi_e': '1949',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Tokoh yang dikenal sebagai "Bapak Koperasi Indonesia" adalah...',
        'opsi_a': 'Dr. H. Mohammad Hatta',
        'opsi_b': 'Soekarno',
        'opsi_c': 'Ki Hajar Dewantara',
        'opsi_d': 'Mr. Muhammad Yamin',
        'opsi_e': 'Sutan Sjahrir',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Pertempuran Bandung Lautan Api terjadi pada tahun...',
        'opsi_a': '1946',
        'opsi_b': '1945',
        'opsi_c': '1947',
        'opsi_d': '1948',
        'opsi_e': '1949',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Tokoh yang dikenal sebagai "Bapak Koperasi Indonesia" adalah...',
        'opsi_a': 'Dr. H. Mohammad Hatta',
        'opsi_b': 'Soekarno',
        'opsi_c': 'Ki Hajar Dewantara',
        'opsi_d': 'Mr. Muhammad Yamin',
        'opsi_e': 'Sutan Sjahrir',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Kerajaan Tarumanegara berpusat di...',
        'opsi_a': 'Jawa Barat',
        'opsi_b': 'Jawa Tengah',
        'opsi_c': 'Jawa Timur',
        'opsi_d': 'Sumatera',
        'opsi_e': 'Kalimantan',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Perjanjian Linggajati ditandatangani pada tahun...',
        'opsi_a': '1946',
        'opsi_b': '1945',
        'opsi_c': '1947',
        'opsi_d': '1948',
        'opsi_e': '1949',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Tokoh yang dikenal sebagai "Bapak Koperasi Indonesia" adalah...',
        'opsi_a': 'Dr. H. Mohammad Hatta',
        'opsi_b': 'Soekarno',
        'opsi_c': 'Ki Hajar Dewantara',
        'opsi_d': 'Mr. Muhammad Yamin',
        'opsi_e': 'Sutan Sjahrir',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Candi Plaosan dibangun pada masa kerajaan...',
        'opsi_a': 'Mataram Kuno',
        'opsi_b': 'Majapahit',
        'opsi_c': 'Sriwijaya',
        'opsi_d': 'Sailendra',
        'opsi_e': 'Tarumanegara',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Perjanjian Linggarjati ditandatangani pada tahun...',
        'opsi_a': '1946',
        'opsi_b': '1945',
        'opsi_c': '1947',
        'opsi_d': '1948',
        'opsi_e': '1949',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Tokoh yang dikenal sebagai "Bapak Koperasi Indonesia" adalah...',
        'opsi_a': 'Dr. H. Mohammad Hatta',
        'opsi_b': 'Soekarno',
        'opsi_c': 'Ki Hajar Dewantara',
        'opsi_d': 'Mr. Muhammad Yamin',
        'opsi_e': 'Sutan Sjahrir',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Candi Sewu dibangun pada masa kerajaan...',
        'opsi_a': 'Mataram Kuno',
        'opsi_b': 'Majapahit',
        'opsi_c': 'Sriwijaya',
        'opsi_d': 'Sailendra',
        'opsi_e': 'Tarumanegara',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Perjanjian Linggajati ditandatangani pada tahun...',
        'opsi_a': '1946',
        'opsi_b': '1945',
        'opsi_c': '1947',
        'opsi_d': '1948',
        'opsi_e': '1949',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Tokoh yang dikenal sebagai "Bapak Koperasi Indonesia" adalah...',
        'opsi_a': 'Dr. H. Mohammad Hatta',
        'opsi_b': 'Soekarno',
        'opsi_c': 'Ki Hajar Dewantara',
        'opsi_d': 'Mr. Muhammad Yamin',
        'opsi_e': 'Sutan Sjahrir',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Kerajaan Tarumanegara berpusat di...',
        'opsi_a': 'Jawa Barat',
        'opsi_b': 'Jawa Tengah',
        'opsi_c': 'Jawa Timur',
        'opsi_d': 'Sumatera',
        'opsi_e': 'Kalimantan',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Perjanjian Linggarjati ditandatangani pada tahun...',
        'opsi_a': '1946',
        'opsi_b': '1945',
        'opsi_c': '1947',
        'opsi_d': '1948',
        'opsi_e': '1949',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Tokoh yang dikenal sebagai "Bapak Koperasi Indonesia" adalah...',
        'opsi_a': 'Dr. H. Mohammad Hatta',
        'opsi_b': 'Soekarno',
        'opsi_c': 'Ki Hajar Dewantara',
        'opsi_d': 'Mr. Muhammad Yamin',
        'opsi_e': 'Sutan Sjahrir',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Pertempuran Ambarawa terjadi pada tahun...',
        'opsi_a': '1945',
        'opsi_b': '1946',
        'opsi_c': '1947',
        'opsi_d': '1948',
        'opsi_e': '1949',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Tokoh yang dikenal sebagai "Bapak Koperasi Indonesia" adalah...',
        'opsi_a': 'Dr. H. Mohammad Hatta',
        'opsi_b': 'Soekarno',
        'opsi_c': 'Ki Hajar Dewantara',
        'opsi_d': 'Mr. Muhammad Yamin',
        'opsi_e': 'Sutan Sjahrir',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Kerajaan Tarumanegara berpusat di...',
        'opsi_a': 'Jawa Barat',
        'opsi_b': 'Jawa Tengah',
        'opsi_c': 'Jawa Timur',
        'opsi_d': 'Sumatera',
        'opsi_e': 'Kalimantan',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Perjanjian Linggajati ditandatangani pada tahun...',
        'opsi_a': '1946',
        'opsi_b': '1945',
        'opsi_c': '1947',
        'opsi_d': '1948',
        'opsi_e': '1949',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Tokoh yang dikenal sebagai "Bapak Koperasi Indonesia" adalah...',
        'opsi_a': 'Dr. H. Mohammad Hatta',
        'opsi_b': 'Soekarno',
        'opsi_c': 'Ki Hajar Dewantara',
        'opsi_d': 'Mr. Muhammad Yamin',
        'opsi_e': 'Sutan Sjahrir',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Candi Sewu dibangun pada masa kerajaan...',
        'opsi_a': 'Mataram Kuno',
        'opsi_b': 'Majapahit',
        'opsi_c': 'Sriwijaya',
        'opsi_d': 'Sailendra',
        'opsi_e': 'Tarumanegara',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Perjanjian Linggarjati ditandatangani pada tahun...',
        'opsi_a': '1946',
        'opsi_b': '1945',
        'opsi_c': '1947',
        'opsi_d': '1948',
        'opsi_e': '1949',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Tokoh yang dikenal sebagai "Bapak Koperasi Indonesia" adalah...',
        'opsi_a': 'Dr. H. Mohammad Hatta',
        'opsi_b': 'Soekarno',
        'opsi_c': 'Ki Hajar Dewantara',
        'opsi_d': 'Mr. Muhammad Yamin',
        'opsi_e': 'Sutan Sjahrir',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Candi Mendut dibangun pada masa kerajaan...',
        'opsi_a': 'Mataram Kuno',
        'opsi_b': 'Majapahit',
        'opsi_c': 'Sriwijaya',
        'opsi_d': 'Sailendra',
        'opsi_e': 'Tarumanegara',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Perjanjian Linggajati ditandatangani pada tahun...',
        'opsi_a': '1946',
        'opsi_b': '1945',
        'opsi_c': '1947',
        'opsi_d': '1948',
        'opsi_e': '1949',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Tokoh yang dikenal sebagai "Bapak Koperasi Indonesia" adalah...',
        'opsi_a': 'Dr. H. Mohammad Hatta',
        'opsi_b': 'Soekarno',
        'opsi_c': 'Ki Hajar Dewantara',
        'opsi_d': 'Mr. Muhammad Yamin',
        'opsi_e': 'Sutan Sjahrir',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Kerajaan Tarumanegara berpusat di...',
        'opsi_a': 'Jawa Barat',
        'opsi_b': 'Jawa Tengah',
        'opsi_c': 'Jawa Timur',
        'opsi_d': 'Sumatera',
        'opsi_e': 'Kalimantan',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Perjanjian Linggarjati ditandatangani pada tahun...',
        'opsi_a': '1946',
        'opsi_b': '1945',
        'opsi_c': '1947',
        'opsi_d': '1948',
        'opsi_e': '1949',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Tokoh yang dikenal sebagai "Bapak Koperasi Indonesia" adalah...',
        'opsi_a': 'Dr. H. Mohammad Hatta',
        'opsi_b': 'Soekarno',
        'opsi_c': 'Ki Hajar Dewantara',
        'opsi_d': 'Mr. Muhammad Yamin',
        'opsi_e': 'Sutan Sjahrir',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Pertempuran Surabaya terjadi pada tahun...',
        'opsi_a': '1945',
        'opsi_b': '1946',
        'opsi_c': '1947',
        'opsi_d': '1948',
        'opsi_e': '1949',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Tokoh yang dikenal sebagai "Bapak Koperasi Indonesia" adalah...',
        'opsi_a': 'Dr. H. Mohammad Hatta',
        'opsi_b': 'Soekarno',
        'opsi_c': 'Ki Hajar Dewantara',
        'opsi_d': 'Mr. Muhammad Yamin',
        'opsi_e': 'Sutan Sjahrir',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Kerajaan Tarumanegara berpusat di...',
        'opsi_a': 'Jawa Barat',
        'opsi_b': 'Jawa Tengah',
        'opsi_c': 'Jawa Timur',
        'opsi_d': 'Sumatera',
        'opsi_e': 'Kalimantan',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Perjanjian Linggajati ditandatangani pada tahun...',
        'opsi_a': '1946',
        'opsi_b': '1945',
        'opsi_c': '1947',
        'opsi_d': '1948',
        'opsi_e': '1949',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Tokoh yang dikenal sebagai "Bapak Koperasi Indonesia" adalah...',
        'opsi_a': 'Dr. H. Mohammad Hatta',
        'opsi_b': 'Soekarno',
        'opsi_c': 'Ki Hajar Dewantara',
        'opsi_d': 'Mr. Muhammad Yamin',
        'opsi_e': 'Sutan Sjahrir',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Candi Mendut dibangun pada masa kerajaan...',
        'opsi_a': 'Mataram Kuno',
        'opsi_b': 'Majapahit',
        'opsi_c': 'Sriwijaya',
        'opsi_d': 'Sailendra',
        'opsi_e': 'Tarumanegara',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Perjanjian Linggarjati ditandatangani pada tahun...',
        'opsi_a': '1946',
        'opsi_b': '1945',
        'opsi_c': '1947',
        'opsi_d': '1948',
        'opsi_e': '1949',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Tokoh yang dikenal sebagai "Bapak Koperasi Indonesia" adalah...',
        'opsi_a': 'Dr. H. Mohammad Hatta',
        'opsi_b': 'Soekarno',
        'opsi_c': 'Ki Hajar Dewantara',
        'opsi_d': 'Mr. Muhammad Yamin',
        'opsi_e': 'Sutan Sjahrir',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Candi Pawon dibangun pada masa kerajaan...',
        'opsi_a': 'Mataram Kuno',
        'opsi_b': 'Majapahit',
        'opsi_c': 'Sriwijaya',
        'opsi_d': 'Sailendra',
        'opsi_e': 'Tarumanegara',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Perjanjian Linggajati ditandatangani pada tahun...',
        'opsi_a': '1946',
        'opsi_b': '1945',
        'opsi_c': '1947',
        'opsi_d': '1948',
        'opsi_e': '1949',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Tokoh yang dikenal sebagai "Bapak Koperasi Indonesia" adalah...',
        'opsi_a': 'Dr. H. Mohammad Hatta',
        'opsi_b': 'Soekarno',
        'opsi_c': 'Ki Hajar Dewantara',
        'opsi_d': 'Mr. Muhammad Yamin',
        'opsi_e': 'Sutan Sjahrir',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Kerajaan Tarumanegara berpusat di...',
        'opsi_a': 'Jawa Barat',
        'opsi_b': 'Jawa Tengah',
        'opsi_c': 'Jawa Timur',
        'opsi_d': 'Sumatera',
        'opsi_e': 'Kalimantan',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Perjanjian Linggarjati ditandatangani pada tahun...',
        'opsi_a': '1946',
        'opsi_b': '1945',
        'opsi_c': '1947',
        'opsi_d': '1948',
        'opsi_e': '1949',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Tokoh yang dikenal sebagai "Bapak Koperasi Indonesia" adalah...',
        'opsi_a': 'Dr. H. Mohammad Hatta',
        'opsi_b': 'Soekarno',
        'opsi_c': 'Ki Hajar Dewantara',
        'opsi_d': 'Mr. Muhammad Yamin',
        'opsi_e': 'Sutan Sjahrir',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Pertempuran Bandung Lautan Api terjadi pada tahun...',
        'opsi_a': '1946',
        'opsi_b': '1945',
        'opsi_c': '1947',
        'opsi_d': '1948',
        'opsi_e': '1949',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Tokoh yang dikenal sebagai "Bapak Koperasi Indonesia" adalah...',
        'opsi_a': 'Dr. H. Mohammad Hatta',
        'opsi_b': 'Soekarno',
        'opsi_c': 'Ki Hajar Dewantara',
        'opsi_d': 'Mr. Muhammad Yamin',
        'opsi_e': 'Sutan Sjahrir',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Kerajaan Tarumanegara berpusat di...',
        'opsi_a': 'Jawa Barat',
        'opsi_b': 'Jawa Tengah',
        'opsi_c': 'Jawa Timur',
        'opsi_d': 'Sumatera',
        'opsi_e': 'Kalimantan',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Perjanjian Linggajati ditandatangani pada tahun...',
        'opsi_a': '1946',
        'opsi_b': '1945',
        'opsi_c': '1947',
        'opsi_d': '1948',
        'opsi_e': '1949',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Tokoh yang dikenal sebagai "Bapak Koperasi Indonesia" adalah...',
        'opsi_a': 'Dr. H. Mohammad Hatta',
        'opsi_b': 'Soekarno',
        'opsi_c': 'Ki Hajar Dewantara',
        'opsi_d': 'Mr. Muhammad Yamin',
        'opsi_e': 'Sutan Sjahrir',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Candi Pawon dibangun pada masa kerajaan...',
        'opsi_a': 'Mataram Kuno',
        'opsi_b': 'Majapahit',
        'opsi_c': 'Sriwijaya',
        'opsi_d': 'Sailendra',
        'opsi_e': 'Tarumanegara',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Perjanjian Linggarjati ditandatangani pada tahun...',
        'opsi_a': '1946',
        'opsi_b': '1945',
        'opsi_c': '1947',
        'opsi_d': '1948',
        'opsi_e': '1949',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Tokoh yang dikenal sebagai "Bapak Koperasi Indonesia" adalah...',
        'opsi_a': 'Dr. H. Mohammad Hatta',
        'opsi_b': 'Soekarno',
        'opsi_c': 'Ki Hajar Dewantara',
        'opsi_d': 'Mr. Muhammad Yamin',
        'opsi_e': 'Sutan Sjahrir',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Candi Sewu dibangun pada masa kerajaan...',
        'opsi_a': 'Mataram Kuno',
        'opsi_b': 'Majapahit',
        'opsi_c': 'Sriwijaya',
        'opsi_d': 'Sailendra',
        'opsi_e': 'Tarumanegara',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Perjanjian Linggajati ditandatangani pada tahun...',
        'opsi_a': '1946',
        'opsi_b': '1945',
        'opsi_c': '1947',
        'opsi_d': '1948',
        'opsi_e': '1949',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Tokoh yang dikenal sebagai "Bapak Koperasi Indonesia" adalah...',
        'opsi_a': 'Dr. H. Mohammad Hatta',
        'opsi_b': 'Soekarno',
        'opsi_c': 'Ki Hajar Dewantara',
        'opsi_d': 'Mr. Muhammad Yamin',
        'opsi_e': 'Sutan Sjahrir',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Kerajaan Tarumanegara berpusat di...',
        'opsi_a': 'Jawa Barat',
        'opsi_b': 'Jawa Tengah',
        'opsi_c': 'Jawa Timur',
        'opsi_d': 'Sumatera',
        'opsi_e': 'Kalimantan',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Perjanjian Linggarjati ditandatangani pada tahun...',
        'opsi_a': '1946',
        'opsi_b': '1945',
        'opsi_c': '1947',
        'opsi_d': '1948',
        'opsi_e': '1949',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Tokoh yang dikenal sebagai "Bapak Koperasi Indonesia" adalah...',
        'opsi_a': 'Dr. H. Mohammad Hatta',
        'opsi_b': 'Soekarno',
        'opsi_c': 'Ki Hajar Dewantara',
        'opsi_d': 'Mr. Muhammad Yamin',
        'opsi_e': 'Sutan Sjahrir',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Pertempuran Ambarawa terjadi pada tahun...',
        'opsi_a': '1945',
        'opsi_b': '1946',
        'opsi_c': '1947',
        'opsi_d': '1948',
        'opsi_e': '1949',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Tokoh yang dikenal sebagai "Bapak Koperasi Indonesia" adalah...',
        'opsi_a': 'Dr. H. Mohammad Hatta',
        'opsi_b': 'Soekarno',
        'opsi_c': 'Ki Hajar Dewantara',
        'opsi_d': 'Mr. Muhammad Yamin',
        'opsi_e': 'Sutan Sjahrir',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Kerajaan Tarumanegara berpusat di...',
        'opsi_a': 'Jawa Barat',
        'opsi_b': 'Jawa Tengah',
        'opsi_c': 'Jawa Timur',
        'opsi_d': 'Sumatera',
        'opsi_e': 'Kalimantan',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Perjanjian Linggajati ditandatangani pada tahun...',
        'opsi_a': '1946',
        'opsi_b': '1945',
        'opsi_c': '1947',
        'opsi_d': '1948',
        'opsi_e': '1949',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Tokoh yang dikenal sebagai "Bapak Koperasi Indonesia" adalah...',
        'opsi_a': 'Dr. H. Mohammad Hatta',
        'opsi_b': 'Soekarno',
        'opsi_c': 'Ki Hajar Dewantara',
        'opsi_d': 'Mr. Muhammad Yamin',
        'opsi_e': 'Sutan Sjahrir',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Candi Sewu dibangun pada masa kerajaan...',
        'opsi_a': 'Mataram Kuno',
        'opsi_b': 'Majapahit',
        'opsi_c': 'Sriwijaya',
        'opsi_d': 'Sailendra',
        'opsi_e': 'Tarumanegara',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Perjanjian Linggarjati ditandatangani pada tahun...',
        'opsi_a': '1946',
        'opsi_b': '1945',
        'opsi_c': '1947',
        'opsi_d': '1948',
        'opsi_e': '1949',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Tokoh yang dikenal sebagai "Bapak Koperasi Indonesia" adalah...',
        'opsi_a': 'Dr. H. Mohammad Hatta',
        'opsi_b': 'Soekarno',
        'opsi_c': 'Ki Hajar Dewantara',
        'opsi_d': 'Mr. Muhammad Yamin',
        'opsi_e': 'Sutan Sjahrir',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Candi Borobudur dibangun pada masa kerajaan...',
        'opsi_a': 'Mataram Kuno',
        'opsi_b': 'Majapahit',
        'opsi_c': 'Sriwijaya',
        'opsi_d': 'Sailendra',
        'opsi_e': 'Tarumanegara',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Perjanjian Linggajati ditandatangani pada tahun...',
        'opsi_a': '1946',
        'opsi_b': '1945',
        'opsi_c': '1947',
        'opsi_d': '1948',
        'opsi_e': '1949',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Tokoh yang dikenal sebagai "Bapak Koperasi Indonesia" adalah...',
        'opsi_a': 'Dr. H. Mohammad Hatta',
        'opsi_b': 'Soekarno',
        'opsi_c': 'Ki Hajar Dewantara',
        'opsi_d': 'Mr. Muhammad Yamin',
        'opsi_e': 'Sutan Sjahrir',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Kerajaan Tarumanegara berpusat di...',
        'opsi_a': 'Jawa Barat',
        'opsi_b': 'Jawa Tengah',
        'opsi_c': 'Jawa Timur',
        'opsi_d': 'Sumatera',
        'opsi_e': 'Kalimantan',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Perjanjian Linggarjati ditandatangani pada tahun...',
        'opsi_a': '1946',
        'opsi_b': '1945',
        'opsi_c': '1947',
        'opsi_d': '1948',
        'opsi_e': '1949',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Tokoh yang dikenal sebagai "Bapak Koperasi Indonesia" adalah...',
        'opsi_a': 'Dr. H. Mohammad Hatta',
        'opsi_b': 'Soekarno',
        'opsi_c': 'Ki Hajar Dewantara',
        'opsi_d': 'Mr. Muhammad Yamin',
        'opsi_e': 'Sutan Sjahrir',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Pertempuran Medan Area terjadi pada tahun...',
        'opsi_a': '1945',
        'opsi_b': '1946',
        'opsi_c': '1947',
        'opsi_d': '1948',
        'opsi_e': '1949',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Tokoh yang dikenal sebagai "Bapak Koperasi Indonesia" adalah...',
        'opsi_a': 'Dr. H. Mohammad Hatta',
        'opsi_b': 'Soekarno',
        'opsi_c': 'Ki Hajar Dewantara',
        'opsi_d': 'Mr. Muhammad Yamin',
        'opsi_e': 'Sutan Sjahrir',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Kerajaan Tarumanegara berpusat di...',
        'opsi_a': 'Jawa Barat',
        'opsi_b': 'Jawa Tengah',
        'opsi_c': 'Jawa Timur',
        'opsi_d': 'Sumatera',
        'opsi_e': 'Kalimantan',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Perjanjian Linggajati ditandatangani pada tahun...',
        'opsi_a': '1946',
        'opsi_b': '1945',
        'opsi_c': '1947',
        'opsi_d': '1948',
        'opsi_e': '1949',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Tokoh yang dikenal sebagai "Bapak Koperasi Indonesia" adalah...',
        'opsi_a': 'Dr. H. Mohammad Hatta',
        'opsi_b': 'Soekarno',
        'opsi_c': 'Ki Hajar Dewantara',
        'opsi_d': 'Mr. Muhammad Yamin',
        'opsi_e': 'Sutan Sjahrir',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Candi Borobudur dibangun pada masa kerajaan...',
        'opsi_a': 'Mataram Kuno',
        'opsi_b': 'Majapahit',
        'opsi_c': 'Sriwijaya',
        'opsi_d': 'Sailendra',
        'opsi_e': 'Tarumanegara',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Perjanjian Linggarjati ditandatangani pada tahun...',
        'opsi_a': '1946',
        'opsi_b': '1945',
        'opsi_c': '1947',
        'opsi_d': '1948',
        'opsi_e': '1949',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Tokoh yang dikenal sebagai "Bapak Koperasi Indonesia" adalah...',
        'opsi_a': 'Dr. H. Mohammad Hatta',
        'opsi_b': 'Soekarno',
        'opsi_c': 'Ki Hajar Dewantara',
        'opsi_d': 'Mr. Muhammad Yamin',
        'opsi_e': 'Sutan Sjahrir',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Candi Prambanan dibangun pada masa kerajaan...',
        'opsi_a': 'Mataram Kuno',
        'opsi_b': 'Majapahit',
        'opsi_c': 'Sriwijaya',
        'opsi_d': 'Sailendra',
        'opsi_e': 'Tarumanegara',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Perjanjian Linggajati ditandatangani pada tahun...',
        'opsi_a': '1946',
        'opsi_b': '1945',
        'opsi_c': '1947',
        'opsi_d': '1948',
        'opsi_e': '1949',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Tokoh yang dikenal sebagai "Bapak Koperasi Indonesia" adalah...',
        'opsi_a': 'Dr. H. Mohammad Hatta',
        'opsi_b': 'Soekarno',
        'opsi_c': 'Ki Hajar Dewantara',
        'opsi_d': 'Mr. Muhammad Yamin',
        'opsi_e': 'Sutan Sjahrir',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Kerajaan Tarumanegara berpusat di...',
        'opsi_a': 'Jawa Barat',
        'opsi_b': 'Jawa Tengah',
        'opsi_c': 'Jawa Timur',
        'opsi_d': 'Sumatera',
        'opsi_e': 'Kalimantan',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Perjanjian Linggarjati ditandatangani pada tahun...',
        'opsi_a': '1946',
        'opsi_b': '1945',
        'opsi_c': '1947',
        'opsi_d': '1948',
        'opsi_e': '1949',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Tokoh yang dikenal sebagai "Bapak Koperasi Indonesia" adalah...',
        'opsi_a': 'Dr. H. Mohammad Hatta',
        'opsi_b': 'Soekarno',
        'opsi_c': 'Ki Hajar Dewantara',
        'opsi_d': 'Mr. Muhammad Yamin',
        'opsi_e': 'Sutan Sjahrir',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Pertempuran Palembang terjadi pada tahun...',
        'opsi_a': '1945',
        'opsi_b': '1946',
        'opsi_c': '1947',
        'opsi_d': '1948',
        'opsi_e': '1949',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Tokoh yang dikenal sebagai "Bapak Koperasi Indonesia" adalah...',
        'opsi_a': 'Dr. H. Mohammad Hatta',
        'opsi_b': 'Soekarno',
        'opsi_c': 'Ki Hajar Dewantara',
        'opsi_d': 'Mr. Muhammad Yamin',
        'opsi_e': 'Sutan Sjahrir',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Kerajaan Tarumanegara berpusat di...',
        'opsi_a': 'Jawa Barat',
        'opsi_b': 'Jawa Tengah',
        'opsi_c': 'Jawa Timur',
        'opsi_d': 'Sumatera',
        'opsi_e': 'Kalimantan',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Perjanjian Linggajati ditandatangani pada tahun...',
        'opsi_a': '1946',
        'opsi_b': '1945',
        'opsi_c': '1947',
        'opsi_d': '1948',
        'opsi_e': '1949',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Tokoh yang dikenal sebagai "Bapak Koperasi Indonesia" adalah...',
        'opsi_a': 'Dr. H. Mohammad Hatta',
        'opsi_b': 'Soekarno',
        'opsi_c': 'Ki Hajar Dewantara',
        'opsi_d': 'Mr. Muhammad Yamin',
        'opsi_e': 'Sutan Sjahrir',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Candi Prambanan dibangun pada masa kerajaan...',
        'opsi_a': 'Mataram Kuno',
        'opsi_b': 'Majapahit',
        'opsi_c': 'Sriwijaya',
        'opsi_d': 'Sailendra',
        'opsi_e': 'Tarumanegara',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Perjanjian Linggarjati ditandatangani pada tahun...',
        'opsi_a': '1946',
        'opsi_b': '1945',
        'opsi_c': '1947',
        'opsi_d': '1948',
        'opsi_e': '1949',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Tokoh yang dikenal sebagai "Bapak Koperasi Indonesia" adalah...',
        'opsi_a': 'Dr. H. Mohammad Hatta',
        'opsi_b': 'Soekarno',
        'opsi_c': 'Ki Hajar Dewantara',
        'opsi_d': 'Mr. Muhammad Yamin',
        'opsi_e': 'Sutan Sjahrir',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Candi Mendut dibangun pada masa kerajaan...',
        'opsi_a': 'Mataram Kuno',
        'opsi_b': 'Majapahit',
        'opsi_c': 'Sriwijaya',
        'opsi_d': 'Sailendra',
        'opsi_e': 'Tarumanegara',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Perjanjian Linggajati ditandatangani pada tahun...',
        'opsi_a': '1946',
        'opsi_b': '1945',
        'opsi_c': '1947',
        'opsi_d': '1948',
        'opsi_e': '1949',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Tokoh yang dikenal sebagai "Bapak Koperasi Indonesia" adalah...',
        'opsi_a': 'Dr. H. Mohammad Hatta',
        'opsi_b': 'Soekarno',
        'opsi_c': 'Ki Hajar Dewantara',
        'opsi_d': 'Mr. Muhammad Yamin',
        'opsi_e': 'Sutan Sjahrir',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Kerajaan Tarumanegara berpusat di...',
        'opsi_a': 'Jawa Barat',
        'opsi_b': 'Jawa Tengah',
        'opsi_c': 'Jawa Timur',
        'opsi_d': 'Sumatera',
        'opsi_e': 'Kalimantan',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Perjanjian Linggarjati ditandatangani pada tahun...',
        'opsi_a': '1946',
        'opsi_b': '1945',
        'opsi_c': '1947',
        'opsi_d': '1948',
        'opsi_e': '1949',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Tokoh yang dikenal sebagai "Bapak Koperasi Indonesia" adalah...',
        'opsi_a': 'Dr. H. Mohammad Hatta',
        'opsi_b': 'Soekarno',
        'opsi_c': 'Ki Hajar Dewantara',
        'opsi_d': 'Mr. Muhammad Yamin',
        'opsi_e': 'Sutan Sjahrir',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Pertempuran Surabaya terjadi pada tahun...',
        'opsi_a': '1945',
        'opsi_b': '1946',
        'opsi_c': '1947',
        'opsi_d': '1948',
        'opsi_e': '1949',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Tokoh yang dikenal sebagai "Bapak Koperasi Indonesia" adalah...',
        'opsi_a': 'Dr. H. Mohammad Hatta',
        'opsi_b': 'Soekarno',
        'opsi_c': 'Ki Hajar Dewantara',
        'opsi_d': 'Mr. Muhammad Yamin',
        'opsi_e': 'Sutan Sjahrir',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Kerajaan Tarumanegara berpusat di...',
        'opsi_a': 'Jawa Barat',
        'opsi_b': 'Jawa Tengah',
        'opsi_c': 'Jawa Timur',
        'opsi_d': 'Sumatera',
        'opsi_e': 'Kalimantan',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Perjanjian Linggajati ditandatangani pada tahun...',
        'opsi_a': '1946',
        'opsi_b': '1945',
        'opsi_c': '1947',
        'opsi_d': '1948',
        'opsi_e': '1949',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Tokoh yang dikenal sebagai "Bapak Koperasi Indonesia" adalah...',
        'opsi_a': 'Dr. H. Mohammad Hatta',
        'opsi_b': 'Soekarno',
        'opsi_c': 'Ki Hajar Dewantara',
        'opsi_d': 'Mr. Muhammad Yamin',
        'opsi_e': 'Sutan Sjahrir',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Candi Mendut dibangun pada masa kerajaan...',
        'opsi_a': 'Mataram Kuno',
        'opsi_b': 'Majapahit',
        'opsi_c': 'Sriwijaya',
        'opsi_d': 'Sailendra',
        'opsi_e': 'Tarumanegara',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Perjanjian Linggarjati ditandatangani pada tahun...',
        'opsi_a': '1946',
        'opsi_b': '1945',
        'opsi_c': '1947',
        'opsi_d': '1948',
        'opsi_e': '1949',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Tokoh yang dikenal sebagai "Bapak Koperasi Indonesia" adalah...',
        'opsi_a': 'Dr. H. Mohammad Hatta',
        'opsi_b': 'Soekarno',
        'opsi_c': 'Ki Hajar Dewantara',
        'opsi_d': 'Mr. Muhammad Yamin',
        'opsi_e': 'Sutan Sjahrir',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Candi Kalasan dibangun pada masa kerajaan...',
        'opsi_a': 'Mataram Kuno',
        'opsi_b': 'Majapahit',
        'opsi_c': 'Sriwijaya',
        'opsi_d': 'Sailendra',
        'opsi_e': 'Tarumanegara',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Perjanjian Linggajati ditandatangani pada tahun...',
        'opsi_a': '1946',
        'opsi_b': '1945',
        'opsi_c': '1947',
        'opsi_d': '1948',
        'opsi_e': '1949',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Tokoh yang dikenal sebagai "Bapak Koperasi Indonesia" adalah...',
        'opsi_a': 'Dr. H. Mohammad Hatta',
        'opsi_b': 'Soekarno',
        'opsi_c': 'Ki Hajar Dewantara',
        'opsi_d': 'Mr. Muhammad Yamin',
        'opsi_e': 'Sutan Sjahrir',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Kerajaan Tarumanegara berpusat di...',
        'opsi_a': 'Jawa Barat',
        'opsi_b': 'Jawa Tengah',
        'opsi_c': 'Jawa Timur',
        'opsi_d': 'Sumatera',
        'opsi_e': 'Kalimantan',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Perjanjian Linggarjati ditandatangani pada tahun...',
        'opsi_a': '1946',
        'opsi_b': '1945',
        'opsi_c': '1947',
        'opsi_d': '1948',
        'opsi_e': '1949',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Tokoh yang dikenal sebagai "Bapak Koperasi Indonesia" adalah...',
        'opsi_a': 'Dr. H. Mohammad Hatta',
        'opsi_b': 'Soekarno',
        'opsi_c': 'Ki Hajar Dewantara',
        'opsi_d': 'Mr. Muhammad Yamin',
        'opsi_e': 'Sutan Sjahrir',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Pertempuran Bandung Lautan Api terjadi pada tahun...',
        'opsi_a': '1946',
        'opsi_b': '1945',
        'opsi_c': '1947',
        'opsi_d': '1948',
        'opsi_e': '1949',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Tokoh yang dikenal sebagai "Bapak Koperasi Indonesia" adalah...',
        'opsi_a': 'Dr. H. Mohammad Hatta',
        'opsi_b': 'Soekarno',
        'opsi_c': 'Ki Hajar Dewantara',
        'opsi_d': 'Mr. Muhammad Yamin',
        'opsi_e': 'Sutan Sjahrir',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Kerajaan Tarumanegara berpusat di...',
        'opsi_a': 'Jawa Barat',
        'opsi_b': 'Jawa Tengah',
        'opsi_c': 'Jawa Timur',
        'opsi_d': 'Sumatera',
        'opsi_e': 'Kalimantan',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Perjanjian Linggajati ditandatangani pada tahun...',
        'opsi_a': '1946',
        'opsi_b': '1945',
        'opsi_c': '1947',
        'opsi_d': '1948',
        'opsi_e': '1949',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Tokoh yang dikenal sebagai "Bapak Koperasi Indonesia" adalah...',
        'opsi_a': 'Dr. H. Mohammad Hatta',
        'opsi_b': 'Soekarno',
        'opsi_c': 'Ki Hajar Dewantara',
        'opsi_d': 'Mr. Muhammad Yamin',
        'opsi_e': 'Sutan Sjahrir',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Candi Kalasan dibangun pada masa kerajaan...',
        'opsi_a': 'Mataram Kuno',
        'opsi_b': 'Majapahit',
        'opsi_c': 'Sriwijaya',
        'opsi_d': 'Sailendra',
        'opsi_e': 'Tarumanegara',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Perjanjian Linggarjati ditandatangani pada tahun...',
        'opsi_a': '1946',
        'opsi_b': '1945',
        'opsi_c': '1947',
        'opsi_d': '1948',
        'opsi_e': '1949',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Tokoh yang dikenal sebagai "Bapak Koperasi Indonesia" adalah...',
        'opsi_a': 'Dr. H. Mohammad Hatta',
        'opsi_b': 'Soekarno',
        'opsi_c': 'Ki Hajar Dewantara',
        'opsi_d': 'Mr. Muhammad Yamin',
        'opsi_e': 'Sutan Sjahrir',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Candi Sewu dibangun pada masa kerajaan...',
        'opsi_a': 'Mataram Kuno',
        'opsi_b': 'Majapahit',
        'opsi_c': 'Sriwijaya',
        'opsi_d': 'Sailendra',
        'opsi_e': 'Tarumanegara',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Perjanjian Linggajati ditandatangani pada tahun...',
        'opsi_a': '1946',
        'opsi_b': '1945',
        'opsi_c': '1947',
        'opsi_d': '1948',
        'opsi_e': '1949',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Tokoh yang dikenal sebagai "Bapak Koperasi Indonesia" adalah...',
        'opsi_a': 'Dr. H. Mohammad Hatta',
        'opsi_b': 'Soekarno',
        'opsi_c': 'Ki Hajar Dewantara',
        'opsi_d': 'Mr. Muhammad Yamin',
        'opsi_e': 'Sutan Sjahrir',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Kerajaan Tarumanegara berpusat di...',
        'opsi_a': 'Jawa Barat',
        'opsi_b': 'Jawa Tengah',
        'opsi_c': 'Jawa Timur',
        'opsi_d': 'Sumatera',
        'opsi_e': 'Kalimantan',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Perjanjian Linggarjati ditandatangani pada tahun...',
        'opsi_a': '1946',
        'opsi_b': '1945',
        'opsi_c': '1947',
        'opsi_d': '1948',
        'opsi_e': '1949',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Tokoh yang dikenal sebagai "Bapak Koperasi Indonesia" adalah...',
        'opsi_a': 'Dr. H. Mohammad Hatta',
        'opsi_b': 'Soekarno',
        'opsi_c': 'Ki Hajar Dewantara',
        'opsi_d': 'Mr. Muhammad Yamin',
        'opsi_e': 'Sutan Sjahrir',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Pertempuran Ambarawa terjadi pada tahun...',
        'opsi_a': '1945',
        'opsi_b': '1946',
        'opsi_c': '1947',
        'opsi_d': '1948',
        'opsi_e': '1949',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Tokoh yang dikenal sebagai "Bapak Koperasi Indonesia" adalah...',
        'opsi_a': 'Dr. H. Mohammad Hatta',
        'opsi_b': 'Soekarno',
        'opsi_c': 'Ki Hajar Dewantara',
        'opsi_d': 'Mr. Muhammad Yamin',
        'opsi_e': 'Sutan Sjahrir',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Kerajaan Tarumanegara berpusat di...',
        'opsi_a': 'Jawa Barat',
        'opsi_b': 'Jawa Tengah',
        'opsi_c': 'Jawa Timur',
        'opsi_d': 'Sumatera',
        'opsi_e': 'Kalimantan',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Perjanjian Linggajati ditandatangani pada tahun...',
        'opsi_a': '1946',
        'opsi_b': '1945',
        'opsi_c': '1947',
        'opsi_d': '1948',
        'opsi_e': '1949',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Tokoh yang dikenal sebagai "Bapak Koperasi Indonesia" adalah...',
        'opsi_a': 'Dr. H. Mohammad Hatta',
        'opsi_b': 'Soekarno',
        'opsi_c': 'Ki Hajar Dewantara',
        'opsi_d': 'Mr. Muhammad Yamin',
        'opsi_e': 'Sutan Sjahrir',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Candi Sewu dibangun pada masa kerajaan...',
        'opsi_a': 'Mataram Kuno',
        'opsi_b': 'Majapahit',
        'opsi_c': 'Sriwijaya',
        'opsi_d': 'Sailendra',
        'opsi_e': 'Tarumanegara',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Perjanjian Linggarjati ditandatangani pada tahun...',
        'opsi_a': '1946',
        'opsi_b': '1945',
        'opsi_c': '1947',
        'opsi_d': '1948',
        'opsi_e': '1949',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Tokoh yang dikenal sebagai "Bapak Koperasi Indonesia" adalah...',
        'opsi_a': 'Dr. H. Mohammad Hatta',
        'opsi_b': 'Soekarno',
        'opsi_c': 'Ki Hajar Dewantara',
        'opsi_d': 'Mr. Muhammad Yamin',
        'opsi_e': 'Sutan Sjahrir',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Candi Borobudur dibangun pada masa kerajaan...',
        'opsi_a': 'Mataram Kuno',
        'opsi_b': 'Majapahit',
        'opsi_c': 'Sriwijaya',
        'opsi_d': 'Sailendra',
        'opsi_e': 'Tarumanegara',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Perjanjian Linggajati ditandatangani pada tahun...',
        'opsi_a': '1946',
        'opsi_b': '1945',
        'opsi_c': '1947',
        'opsi_d': '1948',
        'opsi_e': '1949',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Tokoh yang dikenal sebagai "Bapak Koperasi Indonesia" adalah...',
        'opsi_a': 'Dr. H. Mohammad Hatta',
        'opsi_b': 'Soekarno',
        'opsi_c': 'Ki Hajar Dewantara',
        'opsi_d': 'Mr. Muhammad Yamin',
        'opsi_e': 'Sutan Sjahrir',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Kerajaan Tarumanegara berpusat di...',
        'opsi_a': 'Jawa Barat',
        'opsi_b': 'Jawa Tengah',
        'opsi_c': 'Jawa Timur',
        'opsi_d': 'Sumatera',
        'opsi_e': 'Kalimantan',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Perjanjian Linggarjati ditandatangani pada tahun...',
        'opsi_a': '1946',
        'opsi_b': '1945',
        'opsi_c': '1947',
        'opsi_d': '1948',
        'opsi_e': '1949',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Tokoh yang dikenal sebagai "Bapak Koperasi Indonesia" adalah...',
        'opsi_a': 'Dr. H. Mohammad Hatta',
        'opsi_b': 'Soekarno',
        'opsi_c': 'Ki Hajar Dewantara',
        'opsi_d': 'Mr. Muhammad Yamin',
        'opsi_e': 'Sutan Sjahrir',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Pertempuran Medan Area terjadi pada tahun...',
        'opsi_a': '1945',
        'opsi_b': '1946',
        'opsi_c': '1947',
        'opsi_d': '1948',
        'opsi_e': '1949',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Tokoh yang dikenal sebagai "Bapak Koperasi Indonesia" adalah...',
        'opsi_a': 'Dr. H. Mohammad Hatta',
        'opsi_b': 'Soekarno',
        'opsi_c': 'Ki Hajar Dewantara',
        'opsi_d': 'Mr. Muhammad Yamin',
        'opsi_e': 'Sutan Sjahrir',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Kerajaan Tarumanegara berpusat di...',
        'opsi_a': 'Jawa Barat',
        'opsi_b': 'Jawa Tengah',
        'opsi_c': 'Jawa Timur',
        'opsi_d': 'Sumatera',
        'opsi_e': 'Kalimantan',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Perjanjian Linggajati ditandatangani pada tahun...',
        'opsi_a': '1946',
        'opsi_b': '1945',
        'opsi_c': '1947',
        'opsi_d': '1948',
        'opsi_e': '1949',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Tokoh yang dikenal sebagai "Bapak Koperasi Indonesia" adalah...',
        'opsi_a': 'Dr. H. Mohammad Hatta',
        'opsi_b': 'Soekarno',
        'opsi_c': 'Ki Hajar Dewantara',
        'opsi_d': 'Mr. Muhammad Yamin',
        'opsi_e': 'Sutan Sjahrir',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Candi Borobudur dibangun pada masa kerajaan...',
        'opsi_a': 'Mataram Kuno',
        'opsi_b': 'Majapahit',
        'opsi_c': 'Sriwijaya',
        'opsi_d': 'Sailendra',
        'opsi_e': 'Tarumanegara',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Perjanjian Linggarjati ditandatangani pada tahun...',
        'opsi_a': '1946',
        'opsi_b': '1945',
        'opsi_c': '1947',
        'opsi_d': '1948',
        'opsi_e': '1949',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Tokoh yang dikenal sebagai "Bapak Koperasi Indonesia" adalah...',
        'opsi_a': 'Dr. H. Mohammad Hatta',
        'opsi_b': 'Soekarno',
        'opsi_c': 'Ki Hajar Dewantara',
        'opsi_d': 'Mr. Muhammad Yamin',
        'opsi_e': 'Sutan Sjahrir',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Candi Prambanan dibangun pada masa kerajaan...',
        'opsi_a': 'Mataram Kuno',
        'opsi_b': 'Majapahit',
        'opsi_c': 'Sriwijaya',
        'opsi_d': 'Sailendra',
        'opsi_e': 'Tarumanegara',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Perjanjian Linggajati ditandatangani pada tahun...',
        'opsi_a': '1946',
        'opsi_b': '1945',
        'opsi_c': '1947',
        'opsi_d': '1948',
        'opsi_e': '1949',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Tokoh yang dikenal sebagai "Bapak Koperasi Indonesia" adalah...',
        'opsi_a': 'Dr. H. Mohammad Hatta',
        'opsi_b': 'Soekarno',
        'opsi_c': 'Ki Hajar Dewantara',
        'opsi_d': 'Mr. Muhammad Yamin',
        'opsi_e': 'Sutan Sjahrir',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Kerajaan Tarumanegara berpusat di...',
        'opsi_a': 'Jawa Barat',
        'opsi_b': 'Jawa Tengah',
        'opsi_c': 'Jawa Timur',
        'opsi_d': 'Sumatera',
        'opsi_e': 'Kalimantan',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Perjanjian Linggarjati ditandatangani pada tahun...',
        'opsi_a': '1946',
        'opsi_b': '1945',
        'opsi_c': '1947',
        'opsi_d': '1948',
        'opsi_e': '1949',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Tokoh yang dikenal sebagai "Bapak Koperasi Indonesia" adalah...',
        'opsi_a': 'Dr. H. Mohammad Hatta',
        'opsi_b': 'Soekarno',
        'opsi_c': 'Ki Hajar Dewantara',
        'opsi_d': 'Mr. Muhammad Yamin',
        'opsi_e': 'Sutan Sjahrir',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Pertempuran Palembang terjadi pada tahun...',
        'opsi_a': '1945',
        'opsi_b': '1946',
        'opsi_c': '1947',
        'opsi_d': '1948',
        'opsi_e': '1949',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Tokoh yang dikenal sebagai "Bapak Koperasi Indonesia" adalah...',
        'opsi_a': 'Dr. H. Mohammad Hatta',
        'opsi_b': 'Soekarno',
        'opsi_c': 'Ki Hajar Dewantara',
        'opsi_d': 'Mr. Muhammad Yamin',
        'opsi_e': 'Sutan Sjahrir',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Kerajaan Tarumanegara berpusat di...',
        'opsi_a': 'Jawa Barat',
        'opsi_b': 'Jawa Tengah',
        'opsi_c': 'Jawa Timur',
        'opsi_d': 'Sumatera',
        'opsi_e': 'Kalimantan',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Perjanjian Linggajati ditandatangani pada tahun...',
        'opsi_a': '1946',
        'opsi_b': '1945',
        'opsi_c': '1947',
        'opsi_d': '1948',
        'opsi_e': '1949',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Tokoh yang dikenal sebagai "Bapak Koperasi Indonesia" adalah...',
        'opsi_a': 'Dr. H. Mohammad Hatta',
        'opsi_b': 'Soekarno',
        'opsi_c': 'Ki Hajar Dewantara',
        'opsi_d': 'Mr. Muhammad Yamin',
        'opsi_e': 'Sutan Sjahrir',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Candi Prambanan dibangun pada masa kerajaan...',
        'opsi_a': 'Mataram Kuno',
        'opsi_b': 'Majapahit',
        'opsi_c': 'Sriwijaya',
        'opsi_d': 'Sailendra',
        'opsi_e': 'Tarumanegara',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Perjanjian Linggarjati ditandatangani pada tahun...',
        'opsi_a': '1946',
        'opsi_b': '1945',
        'opsi_c': '1947',
        'opsi_d': '1948',
        'opsi_e': '1949',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Tokoh yang dikenal sebagai "Bapak Koperasi Indonesia" adalah...',
        'opsi_a': 'Dr. H. Mohammad Hatta',
        'opsi_b': 'Soekarno',
        'opsi_c': 'Ki Hajar Dewantara',
        'opsi_d': 'Mr. Muhammad Yamin',
        'opsi_e': 'Sutan Sjahrir',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Candi Plaosan dibangun pada masa kerajaan...',
        'opsi_a': 'Mataram Kuno',
        'opsi_b': 'Majapahit',
        'opsi_c': 'Sriwijaya',
        'opsi_d': 'Sailendra',
        'opsi_e': 'Tarumanegara',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Perjanjian Linggajati ditandatangani pada tahun...',
        'opsi_a': '1946',
        'opsi_b': '1945',
        'opsi_c': '1947',
        'opsi_d': '1948',
        'opsi_e': '1949',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Tokoh yang dikenal sebagai "Bapak Koperasi Indonesia" adalah...',
        'opsi_a': 'Dr. H. Mohammad Hatta',
        'opsi_b': 'Soekarno',
        'opsi_c': 'Ki Hajar Dewantara',
        'opsi_d': 'Mr. Muhammad Yamin',
        'opsi_e': 'Sutan Sjahrir',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Kerajaan Tarumanegara berpusat di...',
        'opsi_a': 'Jawa Barat',
        'opsi_b': 'Jawa Tengah',
        'opsi_c': 'Jawa Timur',
        'opsi_d': 'Sumatera',
        'opsi_e': 'Kalimantan',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Perjanjian Linggarjati ditandatangani pada tahun...',
        'opsi_a': '1946',
        'opsi_b': '1945',
        'opsi_c': '1947',
        'opsi_d': '1948',
        'opsi_e': '1949',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Tokoh yang dikenal sebagai "Bapak Koperasi Indonesia" adalah...',
        'opsi_a': 'Dr. H. Mohammad Hatta',
        'opsi_b': 'Soekarno',
        'opsi_c': 'Ki Hajar Dewantara',
        'opsi_d': 'Mr. Muhammad Yamin',
        'opsi_e': 'Sutan Sjahrir',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Pertempuran Surabaya terjadi pada tahun...',
        'opsi_a': '1945',
        'opsi_b': '1946',
        'opsi_c': '1947',
        'opsi_d': '1948',
        'opsi_e': '1949',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Tokoh yang dikenal sebagai "Bapak Koperasi Indonesia" adalah...',
        'opsi_a': 'Dr. H. Mohammad Hatta',
        'opsi_b': 'Soekarno',
        'opsi_c': 'Ki Hajar Dewantara',
        'opsi_d': 'Mr. Muhammad Yamin',
        'opsi_e': 'Sutan Sjahrir',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Kerajaan Tarumanegara berpusat di...',
        'opsi_a': 'Jawa Barat',
        'opsi_b': 'Jawa Tengah',
        'opsi_c': 'Jawa Timur',
        'opsi_d': 'Sumatera',
        'opsi_e': 'Kalimantan',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Perjanjian Linggajati ditandatangani pada tahun...',
        'opsi_a': '1946',
        'opsi_b': '1945',
        'opsi_c': '1947',
        'opsi_d': '1948',
        'opsi_e': '1949',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Tokoh yang dikenal sebagai "Bapak Koperasi Indonesia" adalah...',
        'opsi_a': 'Dr. H. Mohammad Hatta',
        'opsi_b': 'Soekarno',
        'opsi_c': 'Ki Hajar Dewantara',
        'opsi_d': 'Mr. Muhammad Yamin',
        'opsi_e': 'Sutan Sjahrir',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Candi Plaosan dibangun pada masa kerajaan...',
        'opsi_a': 'Mataram Kuno',
        'opsi_b': 'Majapahit',
        'opsi_c': 'Sriwijaya',
        'opsi_d': 'Sailendra',
        'opsi_e': 'Tarumanegara',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Perjanjian Linggarjati ditandatangani pada tahun...',
        'opsi_a': '1946',
        'opsi_b': '1945',
        'opsi_c': '1947',
        'opsi_d': '1948',
        'opsi_e': '1949',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Tokoh yang dikenal sebagai "Bapak Koperasi Indonesia" adalah...',
        'opsi_a': 'Dr. H. Mohammad Hatta',
        'opsi_b': 'Soekarno',
        'opsi_c': 'Ki Hajar Dewantara',
        'opsi_d': 'Mr. Muhammad Yamin',
        'opsi_e': 'Sutan Sjahrir',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Candi Kalasan dibangun pada masa kerajaan...',
        'opsi_a': 'Mataram Kuno',
        'opsi_b': 'Majapahit',
        'opsi_c': 'Sriwijaya',
        'opsi_d': 'Sailendra',
        'opsi_e': 'Tarumanegara',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Perjanjian Linggajati ditandatangani pada tahun...',
        'opsi_a': '1946',
        'opsi_b': '1945',
        'opsi_c': '1947',
        'opsi_d': '1948',
        'opsi_e': '1949',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Tokoh yang dikenal sebagai "Bapak Koperasi Indonesia" adalah...',
        'opsi_a': 'Dr. H. Mohammad Hatta',
        'opsi_b': 'Soekarno',
        'opsi_c': 'Ki Hajar Dewantara',
        'opsi_d': 'Mr. Muhammad Yamin',
        'opsi_e': 'Sutan Sjahrir',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Kerajaan Tarumanegara berpusat di...',
        'opsi_a': 'Jawa Barat',
        'opsi_b': 'Jawa Tengah',
        'opsi_c': 'Jawa Timur',
        'opsi_d': 'Sumatera',
        'opsi_e': 'Kalimantan',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Perjanjian Linggarjati ditandatangani pada tahun...',
        'opsi_a': '1946',
        'opsi_b': '1945',
        'opsi_c': '1947',
        'opsi_d': '1948',
        'opsi_e': '1949',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Tokoh yang dikenal sebagai "Bapak Koperasi Indonesia" adalah...',
        'opsi_a': 'Dr. H. Mohammad Hatta',
        'opsi_b': 'Soekarno',
        'opsi_c': 'Ki Hajar Dewantara',
        'opsi_d': 'Mr. Muhammad Yamin',
        'opsi_e': 'Sutan Sjahrir',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Pertempuran Bandung Lautan Api terjadi pada tahun...',
        'opsi_a': '1946',
        'opsi_b': '1945',
        'opsi_c': '1947',
        'opsi_d': '1948',
        'opsi_e': '1949',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Tokoh yang dikenal sebagai "Bapak Koperasi Indonesia" adalah...',
        'opsi_a': 'Dr. H. Mohammad Hatta',
        'opsi_b': 'Soekarno',
        'opsi_c': 'Ki Hajar Dewantara',
        'opsi_d': 'Mr. Muhammad Yamin',
        'opsi_e': 'Sutan Sjahrir',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Kerajaan Tarumanegara berpusat di...',
        'opsi_a': 'Jawa Barat',
        'opsi_b': 'Jawa Tengah',
        'opsi_c': 'Jawa Timur',
        'opsi_d': 'Sumatera',
        'opsi_e': 'Kalimantan',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Perjanjian Linggajati ditandatangani pada tahun...',
        'opsi_a': '1946',
        'opsi_b': '1945',
        'opsi_c': '1947',
        'opsi_d': '1948',
        'opsi_e': '1949',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Tokoh yang dikenal sebagai "Bapak Koperasi Indonesia" adalah...',
        'opsi_a': 'Dr. H. Mohammad Hatta',
        'opsi_b': 'Soekarno',
        'opsi_c': 'Ki Hajar Dewantara',
        'opsi_d': 'Mr. Muhammad Yamin',
        'opsi_e': 'Sutan Sjahrir',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Candi Kalasan dibangun pada masa kerajaan...',
        'opsi_a': 'Mataram Kuno',
        'opsi_b': 'Majapahit',
        'opsi_c': 'Sriwijaya',
        'opsi_d': 'Sailendra',
        'opsi_e': 'Tarumanegara',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Perjanjian Linggarjati ditandatangani pada tahun...',
        'opsi_a': '1946',
        'opsi_b': '1945',
        'opsi_c': '1947',
        'opsi_d': '1948',
        'opsi_e': '1949',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Tokoh yang dikenal sebagai "Bapak Koperasi Indonesia" adalah...',
        'opsi_a': 'Dr. H. Mohammad Hatta',
        'opsi_b': 'Soekarno',
        'opsi_c': 'Ki Hajar Dewantara',
        'opsi_d': 'Mr. Muhammad Yamin',
        'opsi_e': 'Sutan Sjahrir',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Candi Sari dibangun pada masa kerajaan...',
        'opsi_a': 'Mataram Kuno',
        'opsi_b': 'Majapahit',
        'opsi_c': 'Sriwijaya',
        'opsi_d': 'Sailendra',
        'opsi_e': 'Tarumanegara',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Perjanjian Linggajati ditandatangani pada tahun...',
        'opsi_a': '1946',
        'opsi_b': '1945',
        'opsi_c': '1947',
        'opsi_d': '1948',
        'opsi_e': '1949',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Tokoh yang dikenal sebagai "Bapak Koperasi Indonesia" adalah...',
        'opsi_a': 'Dr. H. Mohammad Hatta',
        'opsi_b': 'Soekarno',
        'opsi_c': 'Ki Hajar Dewantara',
        'opsi_d': 'Mr. Muhammad Yamin',
        'opsi_e': 'Sutan Sjahrir',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Kerajaan Tarumanegara berpusat di...',
        'opsi_a': 'Jawa Barat',
        'opsi_b': 'Jawa Tengah',
        'opsi_c': 'Jawa Timur',
        'opsi_d': 'Sumatera',
        'opsi_e': 'Kalimantan',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Perjanjian Linggarjati ditandatangani pada tahun...',
        'opsi_a': '1946',
        'opsi_b': '1945',
        'opsi_c': '1947',
        'opsi_d': '1948',
        'opsi_e': '1949',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Tokoh yang dikenal sebagai "Bapak Koperasi Indonesia" adalah...',
        'opsi_a': 'Dr. H. Mohammad Hatta',
        'opsi_b': 'Soekarno',
        'opsi_c': 'Ki Hajar Dewantara',
        'opsi_d': 'Mr. Muhammad Yamin',
        'opsi_e': 'Sutan Sjahrir',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Pertempuran Ambarawa terjadi pada tahun...',
        'opsi_a': '1945',
        'opsi_b': '1946',
        'opsi_c': '1947',
        'opsi_d': '1948',
        'opsi_e': '1949',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Tokoh yang dikenal sebagai "Bapak Koperasi Indonesia" adalah...',
        'opsi_a': 'Dr. H. Mohammad Hatta',
        'opsi_b': 'Soekarno',
        'opsi_c': 'Ki Hajar Dewantara',
        'opsi_d': 'Mr. Muhammad Yamin',
        'opsi_e': 'Sutan Sjahrir',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Kerajaan Tarumanegara berpusat di...',
        'opsi_a': 'Jawa Barat',
        'opsi_b': 'Jawa Tengah',
        'opsi_c': 'Jawa Timur',
        'opsi_d': 'Sumatera',
        'opsi_e': 'Kalimantan',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Perjanjian Linggajati ditandatangani pada tahun...',
        'opsi_a': '1946',
        'opsi_b': '1945',
        'opsi_c': '1947',
        'opsi_d': '1948',
        'opsi_e': '1949',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Tokoh yang dikenal sebagai "Bapak Koperasi Indonesia" adalah...',
        'opsi_a': 'Dr. H. Mohammad Hatta',
        'opsi_b': 'Soekarno',
        'opsi_c': 'Ki Hajar Dewantara',
        'opsi_d': 'Mr. Muhammad Yamin',
        'opsi_e': 'Sutan Sjahrir',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Candi Sari dibangun pada masa kerajaan...',
        'opsi_a': 'Mataram Kuno',
        'opsi_b': 'Majapahit',
        'opsi_c': 'Sriwijaya',
        'opsi_d': 'Sailendra',
        'opsi_e': 'Tarumanegara',
        'jawaban': 'A'
    },
    {
        'pertanyaan': 'Perjanjian Linggarjati ditandatangani pada tahun...',
        'opsi_a': '1946',
        'opsi_b': '1945',
        'opsi_c': '1947',
        'opsi_d': '1948',
        'opsi_e': '1949',
        'jawaban': 'A'
    }
]

def import_questions(questions, kategori_id, nama_kategori):
    """Import soal ke database dengan pengecekan duplikat"""
    connection = connect_database()
    if not connection:
        return 0
    
    success_count = 0
    skip_count = 0
    fail_count = 0
    
    print(f"\n{'='*60}")
    print(f"Import {len(questions)} soal {nama_kategori}")
    print(f"{'='*60}")
    
    for i, soal in enumerate(questions, 1):
        try:
            # Cek duplikat
            if check_duplicate(connection, soal['pertanyaan'], kategori_id):
                print(f"○ Soal {i}/{len(questions)} dilewati (duplikat)")
                skip_count += 1
                continue
            
            # Insert soal
            soal_id = insert_soal(
                connection,
                soal['pertanyaan'],
                soal['opsi_a'],
                soal['opsi_b'],
                soal['opsi_c'],
                soal['opsi_d'],
                soal['opsi_e'],
                soal['jawaban'],
                kategori_id
            )
            
            if soal_id:
                print(f"✓ Soal {i}/{len(questions)} berhasil diimport (ID: {soal_id})")
                success_count += 1
            else:
                print(f"✗ Soal {i}/{len(questions)} gagal diimport")
                fail_count += 1
            
            # Delay untuk menghindari overload database
            time.sleep(0.1)
            
        except Exception as e:
            print(f"✗ Soal {i}/{len(questions)} gagal diimport: {e}")
            fail_count += 1
    
    print(f"\n{'='*60}")
    print(f"Summary Import {nama_kategori}:")
    print(f"  Total: {len(questions)} soal")
    print(f"  Berhasil: {success_count} soal")
    print(f"  Dilewati: {skip_count} soal (duplikat)")
    print(f"  Gagal: {fail_count} soal")
    print(f"{'='*60}\n")
    
    connection.close()
    print("✓ Koneksi database ditutup")
    
    return success_count

def main():
    """Fungsi utama"""
    print("="*60)
    print("BULK IMPORT SOAL UMPTN/SBMPTN")
    print("="*60)
    print(f"Waktu: {time.strftime('%Y-%m-%d %H:%M:%S')}")
    print("="*60)
    
    total_imported = 0
    
    # Import soal TIU UMPTN
    tiu_imported = import_questions(soal_umptn_tiu, KATEGORI_TIU, "TIU (UMPTN)")
    total_imported += tiu_imported
    
    # Import soal TWK UMPTN
    twk_imported = import_questions(soal_umptn_twk, KATEGORI_TWK, "TWK (UMPTN)")
    total_imported += twk_imported
    
    print(f"\n{'='*60}")
    print(f"TOTAL SOAL DIIMPORT: {total_imported}")
    print(f"{'='*60}")

if __name__ == "__main__":
    main()
