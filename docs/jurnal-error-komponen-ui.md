# Jurnal Error — Komponen UI shadcn (Spinner, Table, Skeleton)

**Project:** React Furniture Admin / CRM
**Stack:** React 19 + Vite 8 + shadcn/ui (Radix) + Tailwind v4
**Tanggal:** 31 Mei 2026

Jurnal ini mendokumentasikan 3 error pada 3 komponen UI yang baru ditambahkan.
Sengaja dipilih 3 jenis error yang berbeda tingkat keparahannya, supaya terlihat
spektrum debugging dari yang paling kentara sampai yang paling diam-diam.

| # | Komponen | Jenis Error | Kapan Muncul | Kentara? |
|---|----------|-------------|--------------|----------|
| 1 | Spinner  | Crash build-time | Saat `npm run build` / load | Sangat (app mati total) |
| 2 | Table    | Warning runtime  | Saat halaman dirender | Sedang (console error) |
| 3 | Skeleton | Silent visual bug| Saat loading | Tidak (tanpa pesan apa pun) |

---

## Error 1 — Spinner: Salah nama export icon (MISSING_EXPORT)

**Lokasi:** `src/components/ui/spinner.jsx:2`
**Jenis:** 💥 Crash build-time (Rollup/Vite gagal build)

### Kode penyebab
```jsx
import { SpinnerIcon } from "lucide-react"   // ❌ icon ini tidak ada
```

### Pesan error
```
[MISSING_EXPORT] Error: "SpinnerIcon" is not exported by
"node_modules/lucide-react/dist/esm/lucide-react.mjs".

   ╭─[ src/components/ui/spinner.jsx:2:10 ]
   │
 2 │ import { SpinnerIcon } from "lucide-react";
   │          ─────┬─────
   │               ╰─────── Missing export
───╯
✗ Build failed
```

### Penyebab
Mengimpor `SpinnerIcon` dari `lucide-react`, padahal nama itu tidak ada di library.
Karena komponennya bernama `Spinner`, mudah keliru mengira lucide punya `SpinnerIcon`.
Nama icon yang benar untuk loading adalah `Loader2Icon`, `LoaderCircle`, atau `Loader`.

### Solusi
```jsx
import { Loader2Icon } from "lucide-react"   // ✅ valid di lucide-react v1.17.0
// ...
<Loader2Icon role="status" aria-label="Loading"
  className={cn("size-4 animate-spin", className)} {...props} />
```

### Pelajaran
- Nama export icon bisa berbeda antar versi `lucide-react` (catat: versi terpasang **1.17.0**).
- Named export yang salah ketahuan saat build, bukan saat ngetik — selalu jalankan build.

---

## Error 2 — Table: `<div>` di dalam `<tbody>` (DOM nesting invalid)

**Lokasi:** `src/pages/main/Users.jsx` — di dalam `<TableBody>`
**Jenis:** ⚠️ Warning runtime (app tetap jalan, tapi HTML invalid + risiko hydration error)

### Kode penyebab
```jsx
<TableBody>
  <div className="table-rows-wrapper">   {/* ❌ div tidak boleh di dalam tbody */}
    {loading && [...].map(...)}
    {!loading && filtered.map(...)}
  </div>
</TableBody>
```

### Pesan error (browser console)
```
In HTML, <div> cannot be a child of <tbody>.
This will cause a hydration error.

<tbody data-slot="table-body">
>  <div className="table-rows-wrapper">
      <TableRow className="skeleton-row">
>       <tr data-slot="table-row" ...>

<tbody> cannot contain a nested <div>.
```

### Penyebab
Baris-baris tabel dibungkus `<div>` untuk styling/grouping. Padahal elemen `<table>`
punya aturan struktur ketat: `<tbody>` hanya boleh berisi `<tr>`, tidak boleh ada `<div>`.

### Solusi
Hapus `<div>` pembungkus — letakkan `<TableRow>` langsung sebagai anak `<TableBody>`.
Jika butuh styling, beri className pada `<TableBody>`/`<TableRow>` langsung, atau gunakan
`<React.Fragment>` yang tidak menghasilkan elemen DOM.
```jsx
<TableBody>
  {loading && [...].map(...)}
  {!loading && filtered.map(...)}
</TableBody>
```

### Pelajaran
- Elemen tabel HTML tidak sefleksibel `<div>` — `<table> > <tbody> > <tr> > <td>` itu wajib.
- Warning runtime gampang terlewat karena app tetap render; biasakan cek console.

---

## Error 3 — Skeleton: collapse jadi 0px karena ukuran tidak di-set

**Lokasi:** `src/pages/main/Produk.jsx:106`
**Jenis:** 🎨 Silent visual bug (TIDAK ada pesan error/warning sama sekali)

### Kode penyebab
```jsx
<Skeleton />   {/* ❌ tanpa ukuran → tinggi 0px → tidak terlihat */}
```

### Bukti (pengukuran DOM)
```
BARE <Skeleton/> (tanpa ukuran):  height = 0px    ← skeleton "hilang"
<Skeleton style 200px>:           height = 200px  ← normal
```

### Penyebab
Komponen `Skeleton` hanya punya class `animate-pulse rounded-md bg-muted` — **tidak ada
width/height default**. Saat dipakai tanpa ukuran, elemen `<div>` block punya tinggi 0px,
jadi walau ada di DOM, tidak kelihatan sama sekali. Asumsi salah: mengira `<Skeleton />`
sudah punya ukuran placeholder bawaan.

### Solusi
Selalu beri dimensi saat memakai Skeleton, lewat `className` (Tailwind) atau `style`:
```jsx
<Skeleton className="h-[200px] w-full" />
// atau
<Skeleton style={{ width: '100%', height: '200px' }} />
```

### Pelajaran
- Komponen shadcn `Skeleton` sengaja "telanjang" — ukuran wajib dikasih dari pemakainya.
- Bug tanpa pesan error (silent) paling sulit dilacak; cek tinggi/lebar elemen via DevTools
  saat ada elemen yang "tidak muncul padahal ada di DOM".

---

## Ringkasan Pelajaran Umum

1. **Selalu jalankan build & buka console.** Tiga error ini ketahuan lewat 3 cara berbeda:
   build gagal (Spinner), console.error (Table), dan ukur DOM manual (Skeleton).
2. **Baca dokumentasi komponen sebelum pakai** — nama export, aturan struktur, dan
   apakah komponen punya default value.
3. **Error yang diam (silent) lebih berbahaya** daripada yang crash. Crash langsung
   nunjuk lokasi; silent bug butuh investigasi aktif.
