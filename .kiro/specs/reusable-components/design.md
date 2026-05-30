# Design — Reusable Components

## Tujuan
Membuat 16 komponen reusable (skeleton minimal) di `src/Reusable/`, dikelompokkan ke 6 kategori sesuai standar tugas, lalu mengintegrasikannya ke halaman dan komponen yang sudah ada tanpa mengubah tampilan asli.

## Keputusan Desain
- **Lokasi**: `src/Reusable/` (struktur flat, semua file di root folder).
- **Styling**: satu file gabungan `src/Reusable/Reusable.css`. Setiap komponen meng-`import './Reusable.css'`.
- **Pola kode**: arrow function + `export default` (mengikuti pola `Header.jsx`, `Footer.jsx`, `Hero.jsx` yang sudah ada).
- **Bentuk skeleton**: minimal — JSX placeholder, props dasar (`children`, `className`, `style`, `...rest`), belum ada logic kompleks. Props lanjutan ditambahkan saat komponen dipakai.
- **Penamaan className CSS**: kebab-case, prefix `reusable-` per komponen untuk menghindari bentrok dengan style global proyek (`container`, `btn`, `btn-primary` di `index.css`).
- **Strategi integrasi**: wrap semantic — komponen reusable hanya menyediakan kerangka, sedangkan inline `style={styles.xxx}` dan class CSS spesifik milik komponen lama tetap menang specificity-nya. Hasilnya, tampilan asli (warna brand `#054C73`, ungu admin `#6E39CB`, gradient stat card, status badge) tidak berubah.

## Struktur File
```
src/Reusable/
├── Reusable.css
├── Container.jsx
├── Header.jsx
├── Footer.jsx
├── NavItem.jsx
├── Sidebar.jsx
├── Card.jsx
├── Cart.jsx
├── Button.jsx
├── InputField.jsx
├── SelectField.jsx
├── Modal.jsx
├── Loading.jsx
├── HeroSection.jsx
├── FeatureSection.jsx
├── ProductSection.jsx
└── Table.jsx
```

## Pengelompokan Komponen

### 1. Layout Component (3)
Komponen kerangka tata letak halaman.

| Komponen | Props | Deskripsi |
|---|---|---|
| `Container` | `children`, `className`, `style` | Wrapper lebar konten standar. Pengganti pola `<div className="container">` yang berulang. |
| `Header` | `children`, `className`, `style` | Kerangka top header / navbar. Isi (logo, nav, icons) diisi via `children`. |
| `Footer` | `children`, `className`, `style` | Kerangka footer halaman. Isi diisi via `children`. |

### 2. Navigation Component (2)
Komponen untuk navigasi.

| Komponen | Props | Deskripsi |
|---|---|---|
| `NavItem` | `children`, `icon`, `active`, `onClick`, `className`, `...rest` | Item navigasi (link). Skeleton menerima icon + children, integrasi router ditambahkan saat dipakai. |
| `Sidebar` | `children`, `className`, `style` | Kerangka sidebar (aside). Isi nav item via `children`. |

### 3. Display / Content Component (3)
Komponen untuk menampilkan konten.

| Komponen | Props | Deskripsi |
|---|---|---|
| `Card` | `children`, `className`, `style`, `...rest` | Kartu generik (padding + radius + shadow). Untuk produk, fitur, stat card, dsb. |
| `Cart` | `children`, `className`, `style` | Kerangka panel/keranjang belanja. Isi item via `children`. |
| `Table` | `children`, `className`, `style`, `...rest` | Wrapper `<table>` dengan style default. Skeleton — children menerima thead/tbody seperti tabel native, sehingga kompatibel dengan tabel existing yang punya cell custom. |

### 4. Form Component (3)
Komponen menerima input pengguna.

| Komponen | Props | Deskripsi |
|---|---|---|
| `Button` | `children`, `type`, `variant`, `onClick`, `className`, `...rest` | Tombol generik. `variant`: `primary` (default, warna brand), `admin` (ungu), `ghost` (transparent + border), `outline`. |
| `InputField` | `label`, `type`, `value`, `onChange`, `placeholder`, `name`, `className`, `...rest` | Input teks dengan label opsional. `type` default `"text"`. |
| `SelectField` | `label`, `value`, `onChange`, `options`, `name`, `placeholder`, `className`, `...rest` | Dropdown. `options` = array `{ value, label }`. |

### 5. Feedback Component (2)
Komponen merespon aksi pengguna.

| Komponen | Props | Deskripsi |
|---|---|---|
| `Modal` | `isOpen`, `onClose`, `title`, `children`, `className` | Dialog overlay. Render `null` saat `isOpen` false. Backdrop click menutup modal. |
| `Loading` | `message`, `fullscreen`, `className` | Indikator loading. Default inline; `fullscreen` membuatnya menutup viewport. |

### 6. Section Component (3)
Komponen yang mewakili satu bagian besar halaman.

| Komponen | Props | Deskripsi |
|---|---|---|
| `HeroSection` | `children`, `className`, `style` | Wrapper hero (background full + konten). Isi heading/CTA via `children`. |
| `FeatureSection` | `title`, `subtitle`, `children`, `className`, `style` | Section dengan title + subtitle + konten (`children`). |
| `ProductSection` | `title`, `subtitle`, `children`, `className`, `style` | Section grid produk/kategori. |

## Implementasi & Penggunaan

Semua 16 komponen sudah terpakai minimal di satu tempat:

| # | Komponen | Dipakai di |
|---|---|---|
| 1 | `Container` | `components/Header.jsx`, `components/Footer.jsx`, `components/Hero.jsx`, `components/Features.jsx` |
| 2 | `Header` | `components/Header.jsx` |
| 3 | `Footer` | `components/Footer.jsx` |
| 4 | `NavItem` | `components/Sidebar.jsx` (item Sales Report) |
| 5 | `Sidebar` | `components/Sidebar.jsx` |
| 6 | `Card` | `pages/NotFound.jsx`, `pages/main/UserDetail.jsx`, `pages/main/Produk.jsx`, `pages/main/ProductDetail.jsx`, `pages/main/Dashboard.jsx` (6×: 4 stat card + 2 panel), `pages/main/CustomerDetail.jsx` |
| 7 | `Cart` | `components/Header.jsx` (dropdown panel saat klik icon cart) |
| 8 | `Table` | `pages/main/Dashboard.jsx` (Recent Orders), `pages/main/Users.jsx`, `pages/main/SalesReport.jsx`, `pages/main/OrderDetail.jsx` (Item Pembelian) |
| 9 | `Button` | `pages/NotFound.jsx`, `pages/main/Produk.jsx`, `pages/auth/Login.jsx`, `components/Hero.jsx`, `pages/main/Users.jsx` |
| 10 | `InputField` | `pages/auth/Login.jsx` |
| 11 | `SelectField` | `pages/main/Produk.jsx` (sort dropdown) |
| 12 | `Modal` | `pages/main/Users.jsx` (dialog "Add user") |
| 13 | `Loading` | `pages/main/UserDetail.jsx`, `pages/main/ProductDetail.jsx` |
| 14 | `HeroSection` | `components/Hero.jsx` |
| 15 | `FeatureSection` | `components/Features.jsx`, `components/HowItWorks.jsx` |
| 16 | `ProductSection` | `components/BrowseRange.jsx`, `components/Inspiration.jsx` |

## Strategi Integrasi (Penting)

Pendekatan yang dipakai: **wrap tanpa mengubah tampilan**. Komponen reusable berperan sebagai kerangka semantic, sementara styling spesifik halaman/komponen lama tetap utuh karena:

1. **Inline `style={styles.xxx}`** di komponen lama menang specificity dibanding default style di `Reusable.css`.
2. **Class CSS spesifik** (mis. `.sidebar`, `.stat-card`, `.btn-primary`) tetap diteruskan via prop `className`. Definisi class tersebut tetap ada di `<style>` template literal masing-masing komponen atau di `index.css`.
3. **Tidak ada warna yang dihilangkan**: brand biru `#054C73` (landing), ungu admin `#6E39CB`, gradient `#9B6EE0 → #6E39CB`, status badge processing/completed/cancelled — semuanya utuh.

Contoh penerapan di `components/Hero.jsx`:
```jsx
<HeroSection style={styles.hero}>
  <Container style={styles.container}>
    <div style={styles.card}>
      <h1 style={styles.title}>Discover Our New Collection</h1>
      <Button variant="primary" className="btn btn-primary" style={styles.btn}>BUY NOW</Button>
    </div>
  </Container>
</HeroSection>
```
`HeroSection` hanya menyediakan `<section>`, sementara `style={styles.hero}` (background image, min-height, dll) dari kode lama tetap dieksekusi.

## Isi `Reusable.css`
Selector dengan prefix `reusable-`:
- `.reusable-container`, `.reusable-header`, `.reusable-footer` — layout dasar
- `.reusable-sidebar`, `.reusable-nav-item`, `.reusable-nav-item--active` — navigation
- `.reusable-card`, `.reusable-cart`, `.reusable-table` — display
- `.reusable-btn` + variant: `--primary`, `--admin`, `--ghost`, `--outline`
- `.reusable-input-group`, `.reusable-input-label`, `.reusable-input`, `.reusable-select` — form
- `.reusable-modal-backdrop`, `.reusable-modal`, `.reusable-modal-title`, `.reusable-modal-body` — modal
- `.reusable-loading`, `.reusable-loading--fullscreen`, `.reusable-spinner` — loading
- `.reusable-hero`, `.reusable-feature-section`, `.reusable-product-section` — section
- `.reusable-section-title`, `.reusable-section-subtitle` — typography section

Default ini hanya aktif jika konsumen tidak memberikan `className`/`style` override. Saat dipakai dengan komponen existing yang punya style sendiri, default tersebut tidak akan tampak.

## Variant Button
| Variant | Warna | Untuk |
|---|---|---|
| `primary` (default) | brand `var(--primary, #054C73)` | Tombol aksi utama landing & detail page |
| `admin` | ungu `#6e39cb` | Tombol di area admin (Produk, Users dialog) |
| `ghost` | transparent + border abu | Tombol sekunder (Kembali, Batal) |
| `outline` | border warna brand | Cadangan untuk tombol outline |

## Out of Scope
- Refactor inline `<style>` template literal panjang (di Dashboard, Users, SalesReport, OrderDetail) menjadi CSS modular — tidak perlu untuk skeleton.
- Logic kompleks (state global, API layer, animasi).
- Unit test.
- Tipe TypeScript / PropTypes.

## Verifikasi
- `npx eslint src/Reusable` → 0 error
- `npm run build` → sukses (~330 ms)
- Semua file yang disentuh: 0 diagnostics
- Tampilan UI tidak berubah (warna brand & ungu admin tetap utuh)
