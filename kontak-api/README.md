# kontak-api

REST API sederhana menggunakan Laravel 11, SQLite, dan Laravel Sanctum untuk mengelola data kontak dan nomor telepon.

## Fitur

- Register user
- Login dengan Bearer Token Sanctum
- Logout
- Menampilkan daftar kontak
- Menambah kontak beserta banyak nomor telepon (nested phones)
- Menampilkan detail kontak
- Memperbarui kontak
- Menghapus kontak
- Relasi 1:N `kontak` -> `kontak_phones`

## Persiapan

Pastikan PHP >= 8.2, Composer, dan SQLite tersedia.

## Instalasi

```bash
composer install
cp .env.example .env
php artisan key:generate
```

Windows PowerShell:

```powershell
Copy-Item .env.example .env
php artisan key:generate
```

Buat file SQLite:

```powershell
New-Item database/db_kontak.sqlite -ItemType File
```

Install API + Sanctum:

```bash
php artisan install:api
```

Jalankan migration:

```bash
php artisan migrate
```

Jalankan server:

```bash
php artisan serve --host=0.0.0.0
```

Base URL:

```text
http://127.0.0.1:8000/api
```

## Endpoint

| Method | Endpoint | Auth | Keterangan |
|---|---|---|---|
| POST | `/register` | Tidak | Registrasi user |
| POST | `/login` | Tidak | Login dan mendapatkan token |
| POST | `/logout` | Ya | Menghapus token aktif |
| GET | `/kontak` | Ya | Semua kontak |
| POST | `/kontak` | Ya | Tambah kontak + phones |
| GET | `/kontak/{id}` | Ya | Detail kontak |
| PUT | `/kontak/{id}` | Ya | Update kontak |
| DELETE | `/kontak/{id}` | Ya | Hapus kontak |
