/**
 * Logika membership berdasarkan total transaksi (dalam Rupiah).
 *
 *   - < Rp 500.000           → Bronze  (default user baru daftar)
 *   - Rp 500.000 - 2.000.000 → Silver
 *   - > Rp 2.000.000         → Gold
 */

export const MEMBERSHIP = {
  BRONZE: 'bronze',
  SILVER: 'silver',
  GOLD: 'gold',
};

const SILVER_MIN = 500_000;
const GOLD_MIN = 2_000_000;

/** Hitung tier membership dari total transaksi. */
export function getMembership(totalSpent = 0) {
  const amount = Number(totalSpent) || 0;
  if (amount > GOLD_MIN) return MEMBERSHIP.GOLD;
  if (amount >= SILVER_MIN) return MEMBERSHIP.SILVER;
  return MEMBERSHIP.BRONZE;
}

/** Metadata tampilan untuk tiap tier (label + warna badge). */
export const MEMBERSHIP_META = {
  [MEMBERSHIP.BRONZE]: { label: 'Bronze', bg: '#FBE5D6', color: '#9C5B1F' },
  [MEMBERSHIP.SILVER]: { label: 'Silver', bg: '#EDF0F4', color: '#5B6675' },
  [MEMBERSHIP.GOLD]: { label: 'Gold', bg: '#FCF3D0', color: '#9A7B14' },
};

/** Ambil metadata badge untuk sebuah membership (atau hitung dari total). */
export function getMembershipMeta(membershipOrTotal) {
  const tier =
    typeof membershipOrTotal === 'number'
      ? getMembership(membershipOrTotal)
      : membershipOrTotal || MEMBERSHIP.BRONZE;
  return MEMBERSHIP_META[tier] || MEMBERSHIP_META[MEMBERSHIP.BRONZE];
}

/** Format angka ke Rupiah. */
export function formatRupiah(value) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(Number(value) || 0);
}
