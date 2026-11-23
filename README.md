# Kerangka Proyek: Sistem Manajemen SHA'S YOGHURT

Proyek ini dibangun berdasarkan Class Diagram yang telah dianalisis. Struktur ini menggunakan pendekatan **Laravel (PHP)** sebagai framework utama karena efisiensi dalam menangani fitur CRUD dan sistem otentikasi.

## Struktur Direktori Utama
```text
/shas-yoghurt-management
├── app/
│   ├── Models/           # Berisi: User, Admin, Mitra, Produk, Tagihan, Distribusi
│   ├── Http/Controllers/ # Logika bisnis untuk setiap entitas
├── database/
│   ├── migrations/       # Schema database untuk semua tabel
├── resources/
│   ├── views/            # UI (Blade templates)
├── routes/
│   └── web.php           # Routing aplikasi
└── .env                  # Konfigurasi database
```

## Langkah 1: Definisi Model (Basis Data)
Sesuai dengan Class Diagram, berikut adalah rancangan tabel yang akan kita buat:

1.  **Users** (`id`, `username`, `password`, `nama`, `role`)
2.  **Mitras** (`id`, `nama_toko`, `alamat`, `kontak`)
3.  **Produks** (`id`, `nama_varian`, `kemasan`, `harga`, `stok`)
4.  **Tagihans** (`id`, `mitra_id`, `tanggal`, `total_tagihan`, `status`)
5.  **Distribusis** (`id`, `produk_id`, `mitra_id`, `tanggal_kirim`, `jumlah_kirim`)

## Langkah 2: Inisialisasi Proyek
Jika Anda sudah menginstal Laravel, Anda bisa memulai dengan perintah berikut di terminal:

```bash
# 1. Buat proyek baru
composer create-project laravel/laravel shas-yoghurt-management

# 2. Pindah ke folder proyek
cd shas-yoghurt-management

# 3. Buat model dan migration untuk setiap entitas
php artisan make:model Mitra -m
php artisan make:model Produk -m
php artisan make:model Tagihan -m
php artisan make:model Distribusi -m
```

## Langkah 3: Konfigurasi Database
Buka file `.env` dan sesuaikan koneksi database Anda:
```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=shas_yoghurt_db
DB_USERNAME=root
DB_PASSWORD=
```

---

**Apa langkah selanjutnya yang Anda inginkan?**
1. **Buat file migrasi**: Saya akan buatkan kode untuk tabel-tabel di atas agar bisa langsung di-*migrate* ke MySQL.
2. **Buat Controller dasar**: Saya buatkan logika CRUD untuk salah satu modul (misal: *Kelola Mitra*).
3. **Setup Tampilan**: Saya buatkan contoh layout dasar menggunakan Bootstrap.

*Saran: Kita mulai dengan **nomor 1 (Migrasi Database)** agar struktur data Anda sudah siap terlebih dahulu.*
