/**
 * Helper varian produk.
 *
 * Struktur `product.variants` (jsonb):
 *   [
 *     { name: 'Warna',  options: [ { label: 'Hitam', priceDelta: 0 }, { label: 'Putih', priceDelta: 50000 } ] },
 *     { name: 'Ukuran', options: [ { label: 'S', priceDelta: 0 }, { label: 'L', priceDelta: 100000 } ] }
 *   ]
 *
 * `selection` = objek { [namaGrup]: labelOpsi }, mis. { Warna: 'Putih', Ukuran: 'L' }.
 */

/** Pastikan variants berupa array yang valid. */
export function normalizeVariants(variants) {
  if (!Array.isArray(variants)) return [];
  return variants
    .filter((g) => g && g.name && Array.isArray(g.options) && g.options.length)
    .map((g) => ({
      name: String(g.name),
      options: g.options
        .filter((o) => o && o.label !== undefined && o.label !== '')
        .map((o) => ({
          label: String(o.label),
          priceDelta: Number(o.priceDelta) || 0,
        })),
    }))
    .filter((g) => g.options.length);
}

/** Total tambahan harga dari pilihan varian. */
export function variantPriceDelta(variants, selection = {}) {
  const groups = normalizeVariants(variants);
  let delta = 0;
  for (const group of groups) {
    const chosen = selection[group.name];
    const opt = group.options.find((o) => o.label === chosen);
    if (opt) delta += opt.priceDelta;
  }
  return delta;
}

/** Harga akhir satuan = harga dasar + selisih varian. */
export function variantUnitPrice(basePrice, variants, selection = {}) {
  return (Number(basePrice) || 0) + variantPriceDelta(variants, selection);
}

/** Label varian terpilih, mis. "Warna: Putih, Ukuran: L" (atau '' bila tidak ada). */
export function variantLabel(variants, selection = {}) {
  const groups = normalizeVariants(variants);
  const parts = [];
  for (const group of groups) {
    const chosen = selection[group.name];
    if (chosen) parts.push(`${group.name}: ${chosen}`);
  }
  return parts.join(', ');
}

/** Apakah semua grup varian sudah dipilih? */
export function isSelectionComplete(variants, selection = {}) {
  const groups = normalizeVariants(variants);
  return groups.every((g) => !!selection[g.name]);
}

/** Pilihan default: opsi pertama tiap grup. */
export function defaultSelection(variants) {
  const groups = normalizeVariants(variants);
  const sel = {};
  for (const group of groups) {
    if (group.options[0]) sel[group.name] = group.options[0].label;
  }
  return sel;
}

/**
 * Kunci unik item keranjang berdasarkan id produk + varian terpilih.
 * Dua varian berbeda dari produk yang sama -> baris keranjang berbeda.
 */
export function cartKey(productId, selection = {}) {
  const entries = Object.entries(selection).sort(([a], [b]) => a.localeCompare(b));
  const suffix = entries.map(([k, v]) => `${k}=${v}`).join('|');
  return suffix ? `${productId}::${suffix}` : String(productId);
}
