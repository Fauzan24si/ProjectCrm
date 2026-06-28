# Laporan Fitur — Landing Page FurniCRM

Halaman utama (`/`) disusun oleh komponen `Home.jsx` yang merangkai 9 section secara berurutan. Berikut rincian tiap section beserta fitur dan teknologinya.

---

## Ringkasan Susunan

| No | Section | Komponen | Fungsi Utama |
|----|---------|----------|--------------|
| 1 | Hero | `Hero.jsx` | Banner promo carousel auto-slide |
| 2 | Features | `Features.jsx` | 4 keunggulan layanan |
| 3 | Inspiration | `Inspiration.jsx` | Galeri inspirasi ruangan |
| 4 | Beautify Space | `BeautifySpace.jsx` | Banner ajakan (CTA) |
| 5 | Browse Range | `BrowseRange.jsx` | Kategori produk |
| 6 | How It Works | `HowItWorks.jsx` | 3 langkah cara belanja |
| 7 | FAQ | `Faq.jsx` | Pertanyaan umum (accordion) |
| 8 | Testimonials | `Testimonials.jsx` | Ulasan pelanggan + rating |
| 9 | Media Partners | `MediaPartners.jsx` | Logo partner berjalan (marquee) |

---

## Rincian Fitur per Section

### 1. Hero (Banner Promo)
- **Carousel otomatis** menggunakan Embla Carousel + plugin Autoplay (geser tiap 5 detik, berhenti saat kursor di atas, loop tak terbatas).
- Tombol navigasi panah maju/mundur (prev/next).
- **3 slide promo**: New Year Sale (diskon 50%), Bundle Deal (Buy 1 Get 1 living room), Free Shipping (diskon 30% + gratis ongkir).
- Tiap slide punya: badge label, subtitle, judul, deskripsi, dan tombol CTA.
- Desain responsif (menyesuaikan tampilan mobile).

### 2. Features (Keunggulan Layanan)
Empat poin nilai jual dengan ikon:
- **Free Delivery** — gratis ongkir ke kota besar di Indonesia.
- **Support 24/7** — layanan pelanggan kapan saja.
- **100% Authentic** — produk asli berkualitas.
- **Secure Payment** — pembayaran aman multi-metode.

### 3. Inspiration (Galeri Inspirasi)
- Grid responsif berisi gambar inspirasi penataan ruang (living room, bedroom, dining room).
- Judul + subjudul sebagai pengantar.

### 4. Beautify Your Space (Banner CTA)
- Layout dua kolom: teks ajakan + gambar.
- Tombol **Learn More** sebagai call-to-action.

### 5. Browse The Range (Kategori Produk)
- Menampilkan kategori utama: **Dining, Living, Bedroom**.
- Tiap kategori berupa kartu gambar + nama, mengarahkan eksplorasi katalog.

### 6. How It Works (Cara Belanja)
Tiga langkah bernomor dengan ikon:
1. **Purchase Securely** — pilih dan bayar dengan aman.
2. **Ships From Warehouse** — pesanan dikemas & dikirim dari gudang.
3. **Style Your Space** — tata furnitur baru di rumah.

### 7. FAQ (Pertanyaan Umum)
- Komponen **accordion** (shadcn/ui) yang bisa dibuka-tutup (single, collapsible).
- 5 pertanyaan: pengiriman ke seluruh Indonesia, estimasi waktu kirim, garansi produk, prosedur retur, dan metode pembayaran.

### 8. Testimonials (Ulasan Pelanggan)
- **Ringkasan rating rata-rata** dihitung otomatis dari data ulasan, ditampilkan dengan bintang.
- Klaim sosial: "lebih dari 2.000 pelanggan" / "2.143 ulasan".
- Grid **6 kartu testimoni**: rating bintang, komentar, avatar inisial, nama, dan peran pelanggan.

### 9. Media Partners (Logo Partner)
- **Marquee berjalan** (logo bergerak otomatis tanpa henti) dengan efek fade di tepi kiri-kanan.
- Logo: Badut, Hostify, Midtrans, Supabase, Vite.
- Logo digandakan agar animasi loop terlihat mulus.

---

## Elemen Pendukung di Luar Section Home

Landing page dibungkus oleh `MainLayout` sehingga juga memuat:
- **Header / Navbar** — navigasi: Home, Shop, About, Contact, Lacak Order, plus ikon akun, wishlist, dan keranjang.
- **Footer** — informasi toko, tautan, dan langganan newsletter.
- **Chat Widget AI** — tombol chat mengambang di pojok kanan bawah (asisten AI).
- **Progress bar transisi** — indikator tipis di atas layar saat pindah halaman.

---

## Catatan Teknis
- **Teknologi**: React 19, komponen shadcn/ui (Carousel, Accordion), Embla Carousel, react-icons.
- **Styling**: CSS inline per-komponen + variabel tema (`var(--primary)`, dll), responsif via grid `auto-fit`.
- **Konten**: sebagian besar teks/gambar promo masih statis (hardcoded), cocok sebagai etalase; belum tersambung ke data produk dinamis dari database.

---

> Laporan ini disusun dari pembacaan langsung komponen penyusun `Home.jsx`.
