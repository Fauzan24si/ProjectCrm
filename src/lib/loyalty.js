/**
 * Logika loyalty: reward poin & benefit per tier membership.
 *
 * Poin dihitung dari total transaksi (total_spent):
 *   100 poin untuk setiap Rp 10.000 yang dibelanjakan (= 1 poin per Rp 100).
 */

import { MEMBERSHIP } from './membership';

/** Rasio: Rp 100 = 1 poin (Rp 10.000 = 100 poin). */
const RUPIAH_PER_POINT = 100;

/** Hitung total poin reward dari total transaksi (Rupiah). */
export function calculatePoints(totalSpent = 0) {
  const amount = Number(totalSpent) || 0;
  return Math.floor(amount / RUPIAH_PER_POINT);
}

/**
 * Daftar benefit untuk tiap tier membership.
 * Dipakai untuk menampilkan keuntungan yang didapat member.
 */
export const TIER_BENEFITS = {
  [MEMBERSHIP.BRONZE]: [
    'Akses katalog & wishlist',
    'Kumpulkan 100 poin per Rp 10.000 belanja',
    'Notifikasi promo member',
  ],
  [MEMBERSHIP.SILVER]: [
    'Semua benefit Bronze',
    'Gratis ongkir min. belanja Rp 1.000.000',
    'Diskon member 5%',
    'Akses early sale',
  ],
  [MEMBERSHIP.GOLD]: [
    'Semua benefit Silver',
    'Diskon member 10%',
    'Priority customer support',
    'Hadiah ulang tahun & undangan eksklusif',
  ],
};

/** Ambil daftar benefit untuk sebuah tier. */
export function getTierBenefits(membership) {
  return TIER_BENEFITS[membership] || TIER_BENEFITS[MEMBERSHIP.BRONZE];
}

/** Format angka poin dengan pemisah ribuan. */
export function formatPoints(points) {
  return new Intl.NumberFormat('id-ID').format(Number(points) || 0);
}
