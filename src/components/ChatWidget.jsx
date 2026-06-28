import { useState, useRef, useEffect } from 'react';
import { FiMessageCircle, FiX, FiSend } from 'react-icons/fi';
import { sendChat } from '../services/aiChat';
import { getProducts, getBestSellers } from '../services/products';
import { formatRupiah } from '../lib/membership';

const BASE_SYSTEM_PROMPT =
  'Namamu adalah "Budak Korporat", asisten AI untuk aplikasi CRM furniture. ' +
  'Kepribadianmu: pekerja kantoran yang loyal, sopan, sedikit humor receh khas anak korporat (sesekali menyebut "lapor bos", "siap laksanakan", "demi KPI"), tapi tetap profesional dan membantu. ' +
  'Selalu perkenalkan diri sebagai Budak Korporat jika ditanya siapa kamu. ' +
  'Jawab dengan ringkas, ramah, dan dalam Bahasa Indonesia kecuali diminta lain. ' +
  'Kamu bisa membantu pengguna melihat dan merekomendasikan produk dari katalog toko. ' +
  'Hanya rekomendasikan produk yang ada di dalam daftar katalog yang diberikan. ' +
  'Jika pengguna bertanya tentang produk yang tidak ada di katalog, katakan dengan jujur bahwa produk tersebut tidak tersedia. ' +
  'Saat merekomendasikan, sebutkan nama produk, harga, dan alasan singkat. ' +
  'Jika pengguna bertanya produk terlaris / paling laku / best seller, gunakan data "PRODUK TERLARIS" ' +
  'yang diberikan (berdasarkan jumlah unit terjual nyata). Bila daftar terlaris kosong, ' +
  'barulah katakan belum ada data penjualan. ' +
  'Jika pengguna menanyakan kontak, customer service, nomor telepon, atau WhatsApp, ' +
  'berikan nomor WhatsApp resmi toko: +62 812-6790-5243 ' +
  'beserta tautan langsungnya: https://wa.me/6281267905243';

/** Bangun ringkasan katalog produk untuk konteks AI. */
function buildCatalogContext(products) {
  if (!products || products.length === 0) {
    return 'Katalog produk saat ini kosong.';
  }
  const lines = products.map((p) => {
    const parts = [
      `- ${p.title}`,
      `kategori: ${p.category || '-'}`,
      `harga: ${formatRupiah(p.price)}`,
      `stok: ${p.stock ?? 0}`,
    ];
    if (p.brand) parts.push(`brand: ${p.brand}`);
    if (p.rating != null) parts.push(`rating: ${p.rating}`);
    return parts.join(' | ');
  });
  return `Berikut daftar produk yang tersedia di toko:\n${lines.join('\n')}`;
}

/** Bangun ringkasan produk terlaris (berdasarkan unit terjual) untuk konteks AI. */
function buildBestSellerContext(bestSellers) {
  const sold = (bestSellers || []).filter((p) => Number(p.sold_count) > 0);
  if (sold.length === 0) {
    return 'PRODUK TERLARIS: belum ada data penjualan.';
  }
  const lines = sold.slice(0, 5).map((p, i) => {
    return `${i + 1}. ${p.title} | terjual: ${p.sold_count} unit | harga: ${formatRupiah(p.price)}`;
  });
  return `PRODUK TERLARIS (urut dari paling laku):\n${lines.join('\n')}`;
}

/**
 * Ubah teks menjadi elemen React, dengan URL (http/https) dijadikan link
 * yang bisa diklik. Berguna untuk menampilkan tautan WhatsApp (wa.me).
 */
function renderContent(text) {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const isUrl = /^https?:\/\/[^\s]+$/;
  const parts = String(text).split(urlRegex);
  return parts.map((part, i) => {
    if (isUrl.test(part)) {
      return (
        <a
          key={i}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: '#C15F3C', fontWeight: 600, wordBreak: 'break-all' }}
        >
          {part}
        </a>
      );
    }
    return part;
  });
}

const ChatWidget = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content:
        'Halo, saya Budak Korporat, siap melayani! 🙇 Mau cari atau minta rekomendasi produk? Lapor saja ke saya, contoh: "Rekomendasi sofa untuk ruang tamu kecil".',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [products, setProducts] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const scrollRef = useRef(null);

  // Muat katalog produk & produk terlaris sekali saat widget pertama dibuka.
  useEffect(() => {
    if (!open || products.length > 0) return;
    let active = true;
    getProducts({ limit: 100 })
      .then((data) => {
        if (active) setProducts(data.products || []);
      })
      .catch(() => {
        // Diamkan; AI tetap bisa menjawab tanpa katalog.
      });
    getBestSellers(5)
      .then((data) => {
        if (active) setBestSellers(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        // Diamkan; fitur terlaris opsional.
      });
    return () => {
      active = false;
    };
  }, [open, products.length]);

  // Auto-scroll ke pesan terbaru.
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const handleSend = async (e) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || loading) return;

    const userMsg = { role: 'user', content: text };
    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setInput('');
    setError('');
    setLoading(true);

    try {
      // Bangun system prompt + konteks katalog produk terkini.
      const systemPrompt = {
        role: 'system',
        content: `${BASE_SYSTEM_PROMPT}\n\n${buildCatalogContext(products)}\n\n${buildBestSellerContext(bestSellers)}`,
      };
      const reply = await sendChat([systemPrompt, ...nextMessages]);
      setMessages((prev) => [...prev, { role: 'assistant', content: reply }]);
    } catch (err) {
      setError(err.message || 'Terjadi kesalahan saat menghubungi AI.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.root}>
      {/* Panel chat */}
      {open && (
        <div style={styles.panel}>
          <div style={styles.header}>
            <div style={styles.headerTitle}>
              <FiMessageCircle size={18} />
              <span>Budak Korporat</span>
            </div>
            <button
              style={styles.iconBtn}
              onClick={() => setOpen(false)}
              aria-label="Tutup chat"
            >
              <FiX size={18} />
            </button>
          </div>

          <div style={styles.messages} ref={scrollRef}>
            {messages.map((m, i) => (
              <div
                key={i}
                style={{
                  ...styles.bubble,
                  ...(m.role === 'user' ? styles.bubbleUser : styles.bubbleBot),
                }}
              >
                {renderContent(m.content)}
              </div>
            ))}

            {loading && (
              <div style={{ ...styles.bubble, ...styles.bubbleBot }}>
                <span style={styles.typing}>Mengetik...</span>
              </div>
            )}

            {error && <div style={styles.error}>{error}</div>}
          </div>

          <form style={styles.inputRow} onSubmit={handleSend}>
            <input
              style={styles.input}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Tulis pesan..."
              disabled={loading}
            />
            <button
              type="submit"
              style={styles.sendBtn}
              disabled={loading || !input.trim()}
              aria-label="Kirim"
            >
              <FiSend size={16} />
            </button>
          </form>
        </div>
      )}

      {/* Tombol toggle */}
      <button
        style={styles.toggle}
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? 'Tutup chat' : 'Buka chat'}
      >
        {open ? <FiX size={22} /> : <FiMessageCircle size={22} />}
      </button>
    </div>
  );
};

const styles = {
  root: {
    position: 'fixed',
    bottom: 24,
    right: 24,
    zIndex: 9999,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: 12,
    fontFamily: 'Inter, sans-serif',
  },
  toggle: {
    width: 56,
    height: 56,
    borderRadius: '50%',
    background: '#C15F3C',
    color: '#fff',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 16px rgba(193, 95, 60, 0.45)',
    transition: 'transform 0.15s, background 0.2s',
  },
  panel: {
    width: 500,
    maxWidth: 'calc(100vw - 48px)',
    height: 680,
    maxHeight: 'calc(100vh - 120px)',
    background: '#F5F4EE',
    borderRadius: 16,
    boxShadow: '0 12px 40px rgba(60, 50, 40, 0.18)',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    border: '1px solid #E5E1D6',
  },
  header: {
    background: '#30302E',
    color: '#F5F4EE',
    padding: '14px 16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    fontWeight: 600,
    fontSize: 15,
  },
  iconBtn: {
    background: 'transparent',
    border: 'none',
    color: '#fff',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
  },
  messages: {
    flex: 1,
    overflowY: 'auto',
    padding: 16,
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
    background: '#F5F4EE',
  },
  bubble: {
    maxWidth: '78%',
    padding: '10px 14px',
    borderRadius: 14,
    fontSize: 14,
    lineHeight: 1.5,
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
    boxShadow: '0 1px 2px rgba(60, 50, 40, 0.06)',
  },
  bubbleUser: {
    alignSelf: 'flex-end',
    background: '#C15F3C',
    color: '#fff',
    borderBottomRightRadius: 4,
  },
  bubbleBot: {
    alignSelf: 'flex-start',
    background: '#fff',
    color: '#30302E',
    border: '1px solid #E5E1D6',
    borderBottomLeftRadius: 4,
  },
  typing: {
    color: '#8A8578',
    fontStyle: 'italic',
  },
  error: {
    background: '#FBF0EC',
    color: '#B3492A',
    padding: '8px 12px',
    borderRadius: 8,
    fontSize: 13,
    border: '1px solid #EBCFC4',
  },
  inputRow: {
    display: 'flex',
    gap: 8,
    padding: 10,
    borderTop: '1px solid #E5E1D6',
    background: '#EFEDE4',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    padding: '10px 14px',
    border: '1px solid #DAD5C7',
    borderRadius: 20,
    outline: 'none',
    fontSize: 14,
    color: '#30302E',
    background: '#fff',
  },
  sendBtn: {
    width: 42,
    height: 42,
    borderRadius: '50%',
    background: '#C15F3C',
    color: '#fff',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
};

export default ChatWidget;
