# Sha's Yoghurt - Use Case Scenario & Sequence Diagram

Aktor: **Admin/Owner** (login wajib, `<<include>>` Login).
Objek sequence: **Admin** (Actor), **Form...** (Boundary), **Ctrl...** (Control), **Database** (Entity/Database).

---

## BAGIAN A - USE CASE SCENARIO

### UC-01 Kelola Tagihan
| Item | Isi |
|---|---|
| Aktor | Admin/Owner |
| Kondisi Awal | Admin sudah login; data Mitra sudah ada |

| No | Aksi Aktor | Respon Sistem |
|---|---|---|
| 1 | Memilih menu Kelola Tagihan | Menampilkan daftar tagihan per mitra beserta status |
| 2 | Klik Tambah, pilih Mitra, isi tanggal & nominal | Menampilkan form tagihan dengan nominal terisi otomatis dari data distribusi/penjualan |
| 3 | Klik Simpan | Memvalidasi input (mitra dipilih, tanggal valid, nominal angka > 0) |
| 4 | - | Valid: menyimpan ke database, menampilkan "Tagihan berhasil disimpan" |
| 4a | - | Tidak valid: menampilkan pesan kesalahan, data tidak disimpan |
| 5 | (Opsional) Ubah status / hapus tagihan | Memperbarui atau menghapus data, daftar diperbarui |

### UC-02 Kelola Mitra
| Item | Isi |
|---|---|
| Aktor | Admin/Owner |
| Kondisi Awal | Admin sudah login |

| No | Aksi Aktor | Respon Sistem |
|---|---|---|
| 1 | Memilih menu Kelola Data Mitra | Menampilkan daftar toko mitra |
| 2 | Klik Tambah, isi nama toko, alamat, kontak | Menampilkan form mitra |
| 3 | Klik Simpan | Memvalidasi: wajib diisi, kontak numerik, nama toko belum terdaftar |
| 4 | - | Valid: menyimpan ke database, menampilkan konfirmasi |
| 4a | - | Tidak valid / duplikat: menampilkan pesan kesalahan |
| 5 | (Opsional) Ubah / hapus mitra | Memperbarui/menghapus data (hapus ditolak bila masih punya stok distribusi) |

### UC-03 Update Varian Produk
| Item | Isi |
|---|---|
| Aktor | Admin/Owner |
| Kondisi Awal | Admin sudah login |

| No | Aksi Aktor | Respon Sistem |
|---|---|---|
| 1 | Memilih menu Kelola Varian Produk | Menampilkan daftar varian (stroberi, lici, dll.), kemasan, harga, stok |
| 2 | Memilih varian / Tambah varian, ubah nama, kemasan, harga | Menampilkan form varian |
| 3 | Klik Simpan | Memvalidasi: nama tidak kosong, harga angka > 0, kemasan dipilih |
| 4 | - | Valid: menyimpan ke database, katalog ikut diperbarui |
| 4a | - | Tidak valid: menampilkan pesan kesalahan |

### UC-04 Catat Distribusi Stok
| Item | Isi |
|---|---|
| Aktor | Admin/Owner |
| Kondisi Awal | Admin sudah login; data Mitra dan Produk tersedia; stok produksi > 0 |

| No | Aksi Aktor | Respon Sistem |
|---|---|---|
| 1 | Memilih menu Catatan Distribusi Stock | Menampilkan riwayat distribusi |
| 2 | Klik Tambah, pilih Mitra, Produk, isi tanggal & jumlah kirim | Menampilkan form distribusi dan stok tersedia |
| 3 | Klik Simpan | Memvalidasi: semua terisi, jumlah integer > 0, jumlah <= stok tersedia |
| 4 | - | Valid: menyimpan distribusi, mengurangi stok pusat, menambah stok toko mitra |
| 4a | - | Stok tidak cukup / tidak valid: menampilkan pesan, tidak disimpan |

### UC-05 Rekap Penjualan
| Item | Isi |
|---|---|
| Aktor | Admin/Owner |
| Kondisi Awal | Admin sudah login; ada data distribusi ke mitra |

| No | Aksi Aktor | Respon Sistem |
|---|---|---|
| 1 | Memilih menu Rekap Penjualan Stock | Menampilkan form filter (periode, mitra) |
| 2 | Memilih periode & mitra, klik Tampilkan | Memvalidasi periode (tanggal awal <= akhir) |
| 3 | - | Valid: mengambil data dari database, menghitung terjual = kirim - retur - sisa, menampilkan rekap |
| 3a | - | Tidak valid / data kosong: menampilkan pesan |
| 4 | (Opsional) Input sisa stok / retur lalu Simpan | Memvalidasi angka >= 0 dan <= jumlah kirim, menyimpan ke database |
| 5 | (Opsional) Klik Cetak Laporan | Menghasilkan laporan siap cetak |

---

## BAGIAN B - SEQUENCE DIAGRAM

Pola umum 5 fungsi (semua memakai `alt` untuk validasi):

Lifeline: `Admin` (Actor) | `FormX` (Boundary) | `CtrlX` (Control) | `Database` (Entity)

### SD-01 Kelola Tagihan
Lifeline: Admin, FormTagihan, CtrlTagihan, Database
| # | Dari | Ke | Pesan |
|---|---|---|---|
| 1 | Admin | FormTagihan | pilihMenuTagihan() |
| 2 | FormTagihan | CtrlTagihan | getDaftarTagihan() |
| 3 | CtrlTagihan | Database | SELECT tagihan, mitra |
| 4 | Database | CtrlTagihan | dataTagihan (return) |
| 5 | CtrlTagihan | FormTagihan | tampilDaftar() (return) |
| 6 | Admin | FormTagihan | isiForm(mitra, tanggal, nominal) |
| 7 | Admin | FormTagihan | klikSimpan() |
| 8 | FormTagihan | CtrlTagihan | simpanTagihan(data) |
| 9 | CtrlTagihan | CtrlTagihan | validasiInput(data) (self-message) |
| | | | **alt [valid]** |
| 10 | CtrlTagihan | Database | INSERT tagihan |
| 11 | Database | CtrlTagihan | sukses (return) |
| 12 | CtrlTagihan | FormTagihan | pesanBerhasil() |
| | | | **[else tidak valid]** |
| 13 | CtrlTagihan | FormTagihan | pesanError("input tidak valid") |

### SD-02 Kelola Mitra
Lifeline: Admin, FormMitra, CtrlMitra, Database
| # | Dari | Ke | Pesan |
|---|---|---|---|
| 1 | Admin | FormMitra | pilihMenuMitra() |
| 2 | FormMitra | CtrlMitra | getDaftarMitra() |
| 3 | CtrlMitra | Database | SELECT mitra |
| 4 | Database | CtrlMitra | dataMitra (return) |
| 5 | CtrlMitra | FormMitra | tampilDaftar() (return) |
| 6 | Admin | FormMitra | isiForm(nama, alamat, kontak) lalu klikSimpan() |
| 7 | FormMitra | CtrlMitra | simpanMitra(data) |
| 8 | CtrlMitra | CtrlMitra | validasiInput(data) (self) |
| 9 | CtrlMitra | Database | cekDuplikat(namaToko) |
| 10 | Database | CtrlMitra | hasilCek (return) |
| | | | **alt [valid & tidak duplikat]** |
| 11 | CtrlMitra | Database | INSERT mitra |
| 12 | Database | CtrlMitra | sukses (return) |
| 13 | CtrlMitra | FormMitra | pesanBerhasil() |
| | | | **[else]** |
| 14 | CtrlMitra | FormMitra | pesanError() |

### SD-03 Update Varian Produk
Lifeline: Admin, FormProduk, CtrlProduk, Database
| # | Dari | Ke | Pesan |
|---|---|---|---|
| 1 | Admin | FormProduk | pilihMenuVarian() |
| 2 | FormProduk | CtrlProduk | getDaftarVarian() |
| 3 | CtrlProduk | Database | SELECT produk |
| 4 | Database | CtrlProduk | dataProduk (return) |
| 5 | CtrlProduk | FormProduk | tampilDaftar() (return) |
| 6 | Admin | FormProduk | ubahData(nama, kemasan, harga) lalu klikSimpan() |
| 7 | FormProduk | CtrlProduk | updateVarian(data) |
| 8 | CtrlProduk | CtrlProduk | validasiInput(data) (self) |
| | | | **alt [valid]** |
| 9 | CtrlProduk | Database | UPDATE produk |
| 10 | Database | CtrlProduk | sukses (return) |
| 11 | CtrlProduk | FormProduk | pesanBerhasil() |
| | | | **[else]** |
| 12 | CtrlProduk | FormProduk | pesanError() |

### SD-04 Catat Distribusi Stok
Lifeline: Admin, FormDistribusi, CtrlDistribusi, Database
| # | Dari | Ke | Pesan |
|---|---|---|---|
| 1 | Admin | FormDistribusi | pilihMenuDistribusi() |
| 2 | FormDistribusi | CtrlDistribusi | getDataMitraProduk() |
| 3 | CtrlDistribusi | Database | SELECT mitra, produk, stok |
| 4 | Database | CtrlDistribusi | dataMitra, dataProduk (return) |
| 5 | CtrlDistribusi | FormDistribusi | tampilForm() (return) |
| 6 | Admin | FormDistribusi | isiForm(mitra, produk, tanggal, jumlah) lalu klikSimpan() |
| 7 | FormDistribusi | CtrlDistribusi | catatDistribusi(data) |
| 8 | CtrlDistribusi | CtrlDistribusi | validasiInput(data) (self) |
| 9 | CtrlDistribusi | Database | cekStok(idProduk) |
| 10 | Database | CtrlDistribusi | stokTersedia (return) |
| | | | **alt [valid & jumlah <= stok]** |
| 11 | CtrlDistribusi | Database | INSERT distribusi |
| 12 | CtrlDistribusi | Database | UPDATE stok produk |
| 13 | Database | CtrlDistribusi | sukses (return) |
| 14 | CtrlDistribusi | FormDistribusi | pesanBerhasil() |
| | | | **[else]** |
| 15 | CtrlDistribusi | FormDistribusi | pesanError("stok tidak cukup / input salah") |

### SD-05 Rekap Penjualan
Lifeline: Admin, FormRekap, CtrlPenjualan, Database
| # | Dari | Ke | Pesan |
|---|---|---|---|
| 1 | Admin | FormRekap | pilihMenuRekap() |
| 2 | Admin | FormRekap | isiFilter(periode, mitra) lalu klikTampilkan() |
| 3 | FormRekap | CtrlPenjualan | getRekap(filter) |
| 4 | CtrlPenjualan | CtrlPenjualan | validasiInput(filter) (self) |
| | | | **alt [valid]** |
| 5 | CtrlPenjualan | Database | SELECT distribusi, retur, sisa stok |
| 6 | Database | CtrlPenjualan | dataRekap (return) |
| 7 | CtrlPenjualan | CtrlPenjualan | hitungTerjual() (self) |
| 8 | CtrlPenjualan | FormRekap | tampilRekap() (return) |
| 9 | Admin | FormRekap | inputSisaStok(nilai) lalu klikSimpan() |
| 10 | FormRekap | CtrlPenjualan | simpanRekap(data) |
| 11 | CtrlPenjualan | Database | INSERT/UPDATE penjualan |
| 12 | Database | CtrlPenjualan | sukses (return) |
| 13 | CtrlPenjualan | FormRekap | pesanBerhasil() |
| | | | **[else]** |
| 14 | CtrlPenjualan | FormRekap | pesanError() |

### Cara membuat di PowerDesigner
1. File > New Model > Object-Oriented Model > **Sequence Diagram**.
2. Toolbox: tambahkan **Actor** (Admin), **Object** untuk Form (stereotype `<<boundary>>`), Ctrl (`<<control>>`), Database (`<<entity>>`).
3. Gunakan **Message** (panah penuh) untuk pemanggilan, **Return** (panah putus-putus) untuk respon, **Self-message** untuk validasi.
4. Bungkus langkah valid/tidak valid dengan **Fragment** bertipe `alt`, dengan operand `[valid]` dan `[else]`.
5. Buat satu diagram per fungsi (SD-01 sampai SD-05).
