# Week 6 — JavaScript DOM, Event Handling, dan Fetch API

Tugas individu PPAW Week 6. Dua halaman web statis (HTML + CSS + JavaScript native, tanpa library) yang terhubung lewat navigasi di bagian atas.

**Nama:** M Dzaky Rafi Al Aziz
**NIM:** 20240140185
**Kelas:** D

## Halaman

### 1. Etalase Produk (`public/index.html`)

Mengambil data produk dari [dummyjson.com/products](https://dummyjson.com/products) memakai **Fetch API**, lalu menampilkannya ke halaman lewat **DOM**.

- Setiap produk tampil sebagai kartu: gambar, kategori, nama, harga, rating, dan stok
- Status **loading** (kerangka kartu) saat data dimuat
- Penanganan **error** (status HTTP bukan 200, jaringan gagal, atau timeout 10 detik) lengkap dengan tombol **Coba lagi**
- Cari produk berdasarkan nama dan filter berdasarkan kategori
- Tombol **Lihat detail** pada kartu untuk membuka deskripsi produk

### 2. Hitung Diskon (`public/form.html`)

Form interaktif untuk menghitung harga setelah diskon.

| Field         | Aturan validasi                                 |
|---------------|-------------------------------------------------|
| Nama produk   | wajib, 3–50 karakter, harus mengandung huruf    |
| Harga satuan  | wajib, angka bulat, Rp 1.000 – Rp 100.000.000   |
| Diskon (%)    | wajib, angka 0 – 90                             |
| Jumlah barang | wajib, angka bulat 1 – 999                      |

Penerapan DOM dan Event Handling:

- `input` — validasi sambil mengetik, pesan error muncul di bawah kolom, dan pratinjau total diperbarui langsung
- `click` — tombol diskon cepat (10%, 25%, 50%, 70%), tombol hapus riwayat, dan tombol hapus semua
- `submit` — validasi akhir, hitung, lalu simpan hasil ke daftar riwayat (halaman tidak reload)
- `reset` — membersihkan field, pesan error, dan pratinjau
- Riwayat dibuat dengan `createElement`, dan tersimpan di `localStorage` sehingga tidak hilang saat halaman dimuat ulang

## Struktur Folder

```
Week6-KelasX-NIMLengkap/
├── public/
│   ├── index.html      # halaman Etalase Produk (Fetch API)
│   ├── form.html       # halaman Hitung Diskon (DOM & Event Handling)
│   ├── css/
│   │   ├── style.css   # gaya utama, dipakai kedua halaman
│   │   └── form.css    # gaya khusus form (dimuat setelah style.css)
│   └── js/
│       ├── index.js    # fetch, loading, error, cari, dan filter produk
│       └── form.js     # validasi, perhitungan, dan riwayat
└── README.md
```

## Cara Menjalankan

Buka `public/index.html` di browser. Tidak perlu install apa pun, tetapi halaman Etalase butuh koneksi internet untuk mengambil data produk.

## Pengujian

- [x] Fetch API berhasil mengambil data produk dari DummyJSON
- [x] Nama dan harga produk tampil di halaman web
- [x] Form menerima dan memproses input pengguna
- [x] DOM dan Event Handling diterapkan pada form
- [x] Validasi dan umpan balik form berfungsi
- [x] Tidak ada error yang mengganggu fungsi utama

Hasil nya
<img width="1919" height="942" alt="image" src="https://github.com/user-attachments/assets/298f5c28-5757-44a2-bcdd-cc22b306a38e" />

