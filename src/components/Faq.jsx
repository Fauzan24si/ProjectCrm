import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion';

const faqs = [
  {
    question: 'Apakah furnitur bisa dikirim ke seluruh Indonesia?',
    answer:
      'Ya, kami mengirim ke seluruh wilayah Indonesia. Biaya dan estimasi pengiriman akan ditampilkan otomatis saat checkout sesuai alamat tujuan Anda.',
  },
  {
    question: 'Berapa lama waktu pengiriman pesanan saya?',
    answer:
      'Untuk wilayah Jabodetabek umumnya 2-4 hari kerja, sedangkan luar kota 5-10 hari kerja tergantung lokasi dan ketersediaan stok.',
  },
  {
    question: 'Apakah ada garansi untuk produk yang dibeli?',
    answer:
      'Semua produk kami bergaransi minimal 1 tahun untuk kerusakan produksi. Detail garansi tercantum pada halaman masing-masing produk.',
  },
  {
    question: 'Bagaimana cara melakukan pengembalian (retur)?',
    answer:
      'Anda dapat mengajukan retur dalam 7 hari setelah barang diterima jika produk cacat atau tidak sesuai. Hubungi tim kami melalui halaman kontak untuk memproses retur.',
  },
  {
    question: 'Metode pembayaran apa saja yang tersedia?',
    answer:
      'Kami menerima transfer bank, kartu kredit/debit, serta e-wallet populer. Semua transaksi diproses melalui gateway pembayaran yang aman.',
  },
];

const Faq = () => {
  return (
    <section style={styles.section}>
      <div className="container" style={styles.inner}>
        <div className="text-center">
          <h2 className="section-title">Frequently Asked Questions</h2>
          <p className="section-subtitle">
            Pertanyaan yang sering diajukan seputar produk dan layanan kami.
          </p>
        </div>

        <div style={styles.accordionWrapper}>
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger style={styles.trigger}>
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent style={styles.content}>
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
};

const styles = {
  section: {
    padding: '80px 0',
    backgroundColor: 'var(--bg-color)',
  },
  inner: {
    maxWidth: '860px',
  },
  accordionWrapper: {
    marginTop: '48px',
  },
  trigger: {
    fontSize: '18px',
    fontWeight: '600',
    color: 'var(--text-dark)',
    paddingTop: '22px',
    paddingBottom: '22px',
  },
  content: {
    fontSize: '16px',
    color: 'var(--text-light)',
    lineHeight: '1.7',
    paddingBottom: '22px',
  },
};

export default Faq;
