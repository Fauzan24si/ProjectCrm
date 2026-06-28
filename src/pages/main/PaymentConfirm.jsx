import PaymentFinish from './PaymentFinish';

/**
 * Halaman konfirmasi pembayaran (order masih `pending`, menunggu pembayaran).
 * Memakai komponen yang sama dengan PaymentFinish, namun dalam mode 'confirm':
 *  - Bila order ternyata sudah dibayar, otomatis dialihkan ke /payment/finish.
 */
export default function PaymentConfirm() {
  return <PaymentFinish mode="confirm" />;
}
