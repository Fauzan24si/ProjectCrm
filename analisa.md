# Analisa Proyek — FurniCRM (Furniture E‑Commerce + CRM)

Dokumen ini merangkum arsitektur, fitur, alur kerja, struktur kode, basis data, serta catatan kualitas dan rekomendasi untuk proyek ini. Disusun dari hasil pembacaan langsung kode.

---

## 1. Ringkasan Singkat

FurniCRM adalah aplikasi web **toko furniture** sekaligus **CRM/admin panel**, dibangun dengan **React 19 + Vite 8** di sisi klien dan **Supabase (PostgREST)** sebagai basis data. Fungsi backend tambahan (pembayaran, email, AI) berjalan sebagai **Vercel Serverless Functions** di folder `api/`.

Aplikasi melayani tiga peran:
- **Tamu (guest)** — melihat katalog, melacak pesanan via nomor order + PIN.
- **Member (user)** — belanja, checkout, riwayat & lacak pesanan, wishlist, profil, alamat.
- **Admin** — kelola produk (beserta varian), pesanan & fulfillment, pelanggan, pengguna, laporan penjualan.

Integrasi eksternal: **Midtrans Snap** (pembayaran), **Resend** (email OTP, konfirmasi, invoice), dan **endpoint AI OpenAI‑compatible** (chat widget).

---

## 2. Tech Stack

| Lapisan | Teknologi |
|---|---|
| Frontend | React 19, React Router DOM 7, Vite 8 |
| Styling | Tailwind CSS v4 (`@tailwindcss/vite`), shadcn/ui, CSS inline per-komponen |
| Komponen UI | shadcn (button, table, input-otp, sheet, sidebar, dll), Radix UI, lucide-react, react-icons |
| State | React Context (Cart, Wishlist), localStorage |
| HTTP | axios (klien Supabase), fetch (serverless) |
| Database | Supabase / PostgreSQL via PostgREST |
| Serverless | Vercel Functions (Node) di `api/` |
| Pembayaran | Midtrans Snap |
| Email | Resend |
| AI | Endpoint OpenAI-compatible (proxy) |

Script npm: `dev` (Vite), `build`, `lint` (ESLint), `preview`, `seed:admin`.

---

## 3. Struktur Folder

```
ProjectCrm-Anotherside/
├── api/                      # Vercel serverless functions
│   ├── ai.js                 # Proxy AI (sembunyikan API key di server)
│   ├── _lib/email.js         # Helper Resend + template email order
│   ├── auth/
│   │   ├── _helpers.js       # SHA-256, util Supabase REST, validasi
│   │   ├── send-otp.js       # Kirim OTP registrasi via email
│   │   └── verify-otp.js     # Verifikasi OTP & buat akun
│   ├── midtrans/
│   │   ├── token.js          # Buat transaksi Snap + simpan order + email konfirmasi
│   │   └── notification.js   # Webhook status pembayaran + email invoice
│   └── orders/
│       └── send-invoice.js   # Fallback kirim invoice (idempoten)
├── src/
│   ├── components/           # Komponen (Header, Sidebar, ProductForm, ChatWidget, dll)
│   │   └── ui/               # Komponen shadcn (button, table, input-otp, ...)
│   ├── context/              # CartContext, WishlistContext
│   ├── data/                 # products.json, sales.json (dummy lama)
│   ├── layouts/              # MainLayout, AuthLayout, AdminLayout
│   ├── lib/                  # supabase, membership, loyalty, variants, utils
│   ├── pages/
│   │   ├── auth/             # Login, Register (alur OTP)
│   │   └── main/             # Halaman publik, member, admin
│   ├── Reusable/             # Komponen generik lama + Reusable.css
│   ├── services/             # auth, users, products, orders, payment, wishlist, aiChat
│   ├── App.jsx               # Routing + Suspense + RouteProgress
│   └── index.css             # Tailwind + tema + font
└── supabase/                 # schema.sql + file migrasi
```

---

## 4. Arsitektur & Pola Akses Data

- **Klien → Supabase langsung**: `src/lib/supabase.js` adalah instance axios ke `<url>/rest/v1` memakai **anon key**. Service (`users`, `products`, `orders`, `wishlist`) memanggil PostgREST langsung dari browser dengan operator filter (`eq.`, `in.(...)`) dan embedded select (`*,order_items(*)`).
- **Operasi sensitif → Serverless**: hal yang tidak boleh dipercayakan ke klien (perhitungan harga, server key Midtrans, API key Resend/AI, pembuatan akun via OTP) berjalan di `api/`.
- **Routing**: satu `BrowserRouter` dengan lazy-loading semua halaman. Tiga grup rute:
  - Publik (`MainLayout`): `/`, `/shop`, `/shop/:id`, `/about`, `/contact`, `/track`, `/payment/finish`.
  - Auth (`AuthLayout`): `/login`, `/register`.
  - Member (`ProtectedRoute role="user"` + `AdminLayout`): `/member`, `/member/cart`, `/member/transactions`, `/member/track`, `/member/address`, `/member/wishlist`, `/member/profile`.
  - Admin (`ProtectedRoute role="admin"` + `AdminLayout`): `/admin/dashboard`, `/products`, `/products/:id`, `/orders`, `/orders/:id`, `/sales-report`, `/customers`, `/customers/:id`, `/users`, `/users/:abc`.
- **Transisi halaman**: `RouteProgress` (progress bar atas) + fallback Suspense indeterminate, supaya perpindahan terasa mulus.

---

## 5. Modul & Fitur Utama

### 5.1 Autentikasi
- `services/auth.js`: registrasi, login, sesi via `localStorage` (`auth_user`), hash password **SHA-256** (tanpa salt).
- **Registrasi dengan OTP email** (alur 2 langkah): isi data → `send-otp` (Resend) → input OTP 6 digit (shadcn `input-otp`) → `verify-otp` membuat akun di server lalu auto-login.
- `ProtectedRoute` mengarahkan berdasarkan peran (admin → `/admin/dashboard`, user → `/member`).

### 5.2 Katalog & Produk
- Publik: `Shop` (grid + drawer keranjang), `ShopProductDetail` (detail + pemilih varian).
- Admin: `Produk` (CRUD via `ProductForm` dalam modal), `ProductDetail`.
- `ProductForm` memakai **section collapsible** (Info Dasar, Detail & Media, Varian) agar ringkas.
- `services/products.js` melakukan **sanitasi payload** (hanya kolom valid) dan **fallback** otomatis jika kolom `variants` belum dimigrasi.

### 5.3 Varian Produk
- Definisi varian disimpan di `products.variants` (jsonb): grup → opsi → `priceDelta`.
- `lib/variants.js`: util normalisasi, hitung harga satuan, label, kelengkapan pilihan, dan **cart key komposit** (`id::Grup=Opsi`) agar varian berbeda jadi baris keranjang terpisah.
- Harga varian **dihitung ulang di server** (`token.js`) — klien tidak dipercaya. Label varian disimpan di `order_items.variant`.

### 5.4 Keranjang & Checkout
- `CartContext` (localStorage `guest_cart`) menyimpan item ber-`key`, harga satuan (sudah termasuk varian), dan label varian. Ada backfill untuk item lama.
- Checkout (`Keranjang`, drawer `Shop`) **wajib login** dan **wajib alamat + no HP** (diambil dari profil). `payment.js` → `api/midtrans/token.js` membuat order status `pending`, menghitung harga di server, menyimpan order + item, mengirim **email konfirmasi**, lalu mengembalikan Snap token.
- `PaymentFinish` (publik tapi diproteksi login) menampilkan faktur dan menjalankan pembayaran Snap; `completeCheckout` meng-update status, memberi poin member, dan memicu **email invoice** (fallback).

### 5.5 Pesanan & Fulfillment
- Status order: `pending → paid → processing → shipped → delivered → completed` (plus `cancelled`/`failed`).
- Admin `Pesanan` (`/orders`): daftar dari Supabase, filter status + cari, dan tombol memajukan status satu langkah (Konfirmasi → Dikirim → Sampai → Selesai).
- `services/orders.js`: `getAllOrders`, `getOrdersByUser`, `updateOrderStatus`, metadata status, `FULFILLMENT_STEPS`, `getNextStatusAction`.

### 5.6 Pelacakan Pesanan
- **Member** (`/member/track`): daftar pesanan + timeline langkah (gaya DaisyUI steps direplikasi CSS).
- **Tamu** (`/track`): masukkan nomor order → **modal PIN** (4 digit terakhir no HP penerima, via `getOrderForGuest`) → timeline + detail.

### 5.7 Membership & Loyalty
- `lib/membership.js`: tier Bronze/Silver/Gold dari `total_spent`.
- `lib/loyalty.js`: **100 poin per Rp 10.000** (1 poin/Rp100) + benefit tier.
- `MemberDashboard` menghitung tier & poin dari order `paid` aktual (bukan kolom basi).

### 5.8 Email (Resend)
- `api/_lib/email.js`: template + pengiriman. Membaca `RESEND_FROM` atau `EMAIL_FROM`.
- **Konfirmasi**: dikirim saat order dibuat (status pending) dari `token.js`.
- **Invoice**: dikirim saat `paid`, dari **webhook** (`notification.js`) dan **fallback** (`completeCheckout` → `send-invoice`). Idempoten via kolom `invoice_sent_at`.

### 5.9 AI Chat
- `ChatWidget` + `services/aiChat.js`. Dev: proxy Vite `/ai-api`. Prod: serverless `api/ai.js` (key di server). Mendukung respons JSON biasa & SSE.

### 5.10 Wishlist
- `services/wishlist.js` + `WishlistContext`: tabel `wishlists` dengan embedded `products(*)`, unik per (user, product).

---

## 6. Basis Data (Supabase / PostgreSQL)

Tabel inti (`supabase/schema.sql`):
- **users** — id, name, email (unik), password (hash), role, phone, gender, age, image, **address**, total_spent, membership, created_at.
- **products** — id, title, category, price, stock, brand, description, thumbnail, discount_percentage, **variants (jsonb)**, created_at.
- **wishlists** — user_id → users, product_id → products, unik (user_id, product_id).
- **orders** — order_number (unik = order_id Midtrans), user_id (null = guest), customer_name/email, gross_amount, status, payment_type, **shipping_address, recipient_phone, track_pin, invoice_sent_at**, snap_token, created_at.
- **order_items** — order_id → orders, product_id → products, title, **variant**, price, qty.
- **email_otps** — email, otp_hash, purpose, attempts, expires_at (OTP registrasi).

Migrasi inkremental tersedia di `supabase/`:
- `migration-address-trackpin.sql`, `migration-product-variants.sql`, `migration-email-otp.sql`, `migration-order-emails.sql`.

**RLS**: diaktifkan namun policy demo `using(true) with check(true)` — akses publik penuh (lihat catatan keamanan).

---

## 7. Variabel Lingkungan

Klien (prefix `VITE_`, ter-bundle ke browser):
- `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
- `VITE_AI_BASE_URL`, `VITE_AI_PROXY_TARGET`, `VITE_AI_API_KEY`, `VITE_AI_MODEL`
- `VITE_MIDTRANS_CLIENT_KEY`, `VITE_MIDTRANS_IS_PRODUCTION`

Server (tanpa `VITE_`, rahasia):
- `MIDTRANS_SERVER_KEY`, `MIDTRANS_IS_PRODUCTION`
- `RESEND_API_KEY`, `RESEND_FROM` / `EMAIL_FROM`
- (AI prod) `AI_PROXY_TARGET`, `AI_API_KEY`, `AI_MODEL`

---

## 8. Alur Kerja Penting (End‑to‑End)

1. **Registrasi**: form → OTP email (Resend) → verifikasi → akun dibuat → auto-login.
2. **Belanja**: pilih produk (+varian) → keranjang → wajib login + alamat → konfirmasi → order `pending` + email konfirmasi → bayar (Snap) → `paid` + poin + email invoice.
3. **Fulfillment admin**: `paid` → admin konfirmasi (`processing`) → `shipped` → `delivered` → `completed`.
4. **Pelacakan**: member via dashboard; tamu via nomor order + PIN.

---

## 9. Catatan Kualitas & Observasi

**Kekuatan**
- Pemisahan tegas: operasi sensitif di serverless, harga dihitung ulang di server.
- Idempotensi email invoice, fallback ganda (webhook + klien).
- Util varian terpusat dan konsisten dari katalog → keranjang → order → email.
- Lazy-loading rute + indikator progress untuk UX.
- Migrasi DB inkremental terdokumentasi.

**Risiko / Utang Teknis**
- **Keamanan password**: SHA-256 tanpa salt — lemah; sebaiknya bcrypt/argon2.
- **RLS terbuka penuh**: anon key bisa baca/tulis semua tabel (termasuk hash password). Tidak aman untuk produksi.
- **Anon key di browser**: konsekuensi arsitektur "klien → PostgREST langsung". Idealnya melalui backend/Supabase Auth.
- **Data dummy tersisa**: `SalesReport.jsx` dan `OrderDetail.jsx` masih membaca `src/data/sales.json`, belum dari Supabase — tidak konsisten dengan halaman `Pesanan`.
- **Dev vs Vercel**: endpoint `/api/*` (OTP, email, pembayaran) tidak aktif pada `npm run dev`; perlu `vercel dev` atau deploy.
- **Field form tak terpakai**: form produk sempat mengirim `sku`/`rating` yang tak ada kolomnya (sudah disanitasi di service).
- **Styling campuran**: kombinasi Tailwind, shadcn, CSS inline, dan `Reusable.css` — konsisten secara visual tapi beragam pendekatan.

---

## 10. Rekomendasi Lanjutan

1. **Keamanan**: pindah hashing ke bcrypt/argon2 (via serverless), perketat RLS, pertimbangkan Supabase Auth.
2. **Konsistensi data**: migrasikan `SalesReport` & `OrderDetail` ke Supabase, hapus ketergantungan `sales.json`.
3. **Sinkronisasi `total_spent`**: pastikan terisi konsisten saat pembayaran (bukan hanya dihitung di tampilan).
4. **Validasi & error handling**: pusatkan parsing error PostgREST, tambah skema validasi (mis. Zod).
5. **Pengujian**: belum ada test runner; tambahkan unit test untuk `lib/variants`, `lib/loyalty`, dan service order.
6. **DX**: dokumentasikan cara uji lokal serverless (`vercel dev`) di README.

---

> Dokumen analisa ini dihasilkan dari pembacaan struktur dan kode aktual proyek pada kondisi terkini. Perbarui bila arsitektur atau fitur berubah.
