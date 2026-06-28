/**
 * Helper voucher (murni, tanpa efek samping).
 *
 * Voucher disimpan di tabel `vouchers`:
 *   discount_type  : 'fixed' | 'percentage'
 *   discount_value : nominal (fixed) atau persen (percentage)
 *   max_discount   : batas potongan untuk percentage (nullable)
 *   min_purchase   : minimal belanja agar voucher valid
 */

/**
 * Hitung nilai potongan voucher terhadap subtotal.
 * Tidak pernah melebihi subtotal dan tidak pernah negatif.
 *
 * @param {object} voucher
 * @param {number} grossAmount - subtotal sebelum diskon
 * @returns {number} nilai potongan (Rupiah)
 */
export function calculateDiscount(voucher, grossAmount) {
  if (!voucher) return 0;
  const gross = Number(grossAmount) || 0;
  const min = Number(voucher.min_purchase) || 0;
  if (gross < min) return 0;

  let discount = 0;
  if (voucher.discount_type === 'percentage') {
    discount = (gross * (Number(voucher.discount_value) || 0)) / 100;
    const max = voucher.max_discount != null ? Number(voucher.max_discount) : null;
    if (max != null && discount > max) discount = max;
  } else {
    // 'fixed'
    discount = Number(voucher.discount_value) || 0;
  }

  // Jaga agar tidak melebihi subtotal & tidak negatif.
  if (discount > gross) discount = gross;
  if (discount < 0) discount = 0;
  return Math.round(discount);
}

/** Apakah voucher memenuhi syarat minimal pembelian untuk subtotal ini? */
export function isVoucherEligible(voucher, grossAmount) {
  if (!voucher) return false;
  return (Number(grossAmount) || 0) >= (Number(voucher.min_purchase) || 0);
}
