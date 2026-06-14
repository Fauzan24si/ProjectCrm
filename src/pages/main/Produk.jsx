import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiSearch, FiEdit2, FiTrash2, FiEye } from 'react-icons/fi';
import Modal from '../../Reusable/Modal';
import Button from '../../Reusable/Button';
import ProductForm from '../../components/ProductForm';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../../services/products';
import { formatRupiah } from '../../lib/membership';

function Produk() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');

  // Modal state
  const [formModal, setFormModal] = useState({ open: false, mode: 'add', data: null });
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    let active = true;
    getProducts({ limit: 30 })
      .then((data) => {
        if (!active) return;
        setProducts(data.products || []);
        setLoading(false);
      })
      .catch((err) => {
        if (!active) return;
        setError(err.message);
        setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const filtered = products.filter((p) => {
    const q = search.toLowerCase();
    return (
      p.title?.toLowerCase().includes(q) ||
      p.category?.toLowerCase().includes(q) ||
      p.brand?.toLowerCase().includes(q)
    );
  });

  const showFeedback = (msg) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(''), 3000);
  };

  // Ekstrak pesan error dari respons Supabase/axios.
  const apiError = (err) =>
    err.response?.data?.message || err.response?.data?.hint || err.message;

  // ─── CREATE ───
  const handleCreate = async (payload) => {
    setSaving(true);
    try {
      const created = await createProduct(payload);
      setProducts((prev) => [created, ...prev]);
      setFormModal({ open: false, mode: 'add', data: null });
      showFeedback('Produk berhasil ditambahkan.');
    } catch (err) {
      showFeedback(`Gagal menambah produk: ${apiError(err)}`);
    } finally {
      setSaving(false);
    }
  };

  // ─── UPDATE ───
  const handleUpdate = async (payload) => {
    setSaving(true);
    try {
      const updated = await updateProduct(formModal.data.id, payload);
      setProducts((prev) =>
        prev.map((p) => (p.id === formModal.data.id ? { ...p, ...updated } : p))
      );
      setFormModal({ open: false, mode: 'add', data: null });
      showFeedback('Produk berhasil diperbarui.');
    } catch (err) {
      showFeedback(`Gagal memperbarui produk: ${apiError(err)}`);
    } finally {
      setSaving(false);
    }
  };

  // ─── DELETE ───
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setSaving(true);
    try {
      await deleteProduct(deleteTarget.id);
      setProducts((prev) => prev.filter((p) => p.id !== deleteTarget.id));
      setDeleteTarget(null);
      showFeedback('Produk berhasil dihapus.');
    } catch (err) {
      showFeedback(`Gagal menghapus produk: ${apiError(err)}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <style>{tableStyles}</style>

      {error && <div style={styles.error}>Gagal memuat data: {error}</div>}
      {feedback && <div style={styles.feedback}>{feedback}</div>}

      <div className="table-container">
        <div className="table-header-section">
          <div>
            <h1 className="table-main-title">Products</h1>
            <p className="table-sub-title">
              Kelola katalog produk: tambah, ubah, dan hapus.
            </p>
          </div>
          <button
            className="btn-download-all-top"
            onClick={() => setFormModal({ open: true, mode: 'add', data: null })}
          >
            + Add product
          </button>
        </div>

        <div className="table-search-row">
          <div style={styles.searchWrapper}>
            <FiSearch style={styles.searchIcon} size={16} />
            <input
              type="text"
              placeholder="Cari produk..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={styles.searchInput}
            />
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <Table className="theme-table">
            <TableHeader>
              <TableRow>
                <TableHead style={{ paddingLeft: 24 }}>Produk</TableHead>
                <TableHead>Kategori</TableHead>
                <TableHead>Harga</TableHead>
                <TableHead>Stok</TableHead>
                <TableHead>Brand</TableHead>
                <TableHead style={{ width: 160, textAlign: 'right', paddingRight: 24 }}>
                  Aksi
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading &&
                [...Array(6)].map((_, i) => (
                  <TableRow key={`sk-${i}`} className="skeleton-row">
                    <TableCell colSpan={6}>
                      <div className="skeleton-bar" />
                    </TableCell>
                  </TableRow>
                ))}

              {!loading &&
                filtered.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell style={{ paddingLeft: 24 }}>
                      <div className="prod-info-cell">
                        <img
                          src={p.thumbnail}
                          alt={p.title}
                          className="prod-thumb"
                          loading="lazy"
                        />
                        <span className="prod-name-text">{p.title}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-gray capitalize">{p.category}</TableCell>
                    <TableCell className="text-gray">{formatRupiah(p.price)}</TableCell>
                    <TableCell className="text-gray">{p.stock}</TableCell>
                    <TableCell className="text-gray">{p.brand || '-'}</TableCell>
                    <TableCell style={{ paddingRight: 24, textAlign: 'right' }}>
                      <div className="action-cell">
                        <button
                          className="btn-icon"
                          title="Lihat detail"
                          onClick={() => navigate(`/products/${p.id}`)}
                        >
                          <FiEye size={17} />
                        </button>
                        <button
                          className="btn-icon"
                          title="Edit"
                          onClick={() =>
                            setFormModal({ open: true, mode: 'edit', data: p })
                          }
                        >
                          <FiEdit2 size={17} />
                        </button>
                        <button
                          className="btn-icon btn-icon--danger"
                          title="Hapus"
                          onClick={() => setDeleteTarget(p)}
                        >
                          <FiTrash2 size={17} />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}

              {!loading && !error && filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="empty-state">
                    Tidak ada produk yang cocok dengan pencarian.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Modal Add / Edit */}
      <Modal
        isOpen={formModal.open}
        onClose={() => setFormModal({ open: false, mode: 'add', data: null })}
        title={formModal.mode === 'edit' ? 'Edit Produk' : 'Tambah Produk Baru'}
      >
        <ProductForm
          initialData={formModal.mode === 'edit' ? formModal.data : null}
          loading={saving}
          onCancel={() => setFormModal({ open: false, mode: 'add', data: null })}
          onSubmit={formModal.mode === 'edit' ? handleUpdate : handleCreate}
        />
      </Modal>

      {/* Modal Konfirmasi Hapus */}
      <Modal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Hapus Produk"
      >
        <p style={{ marginBottom: 20, color: '#475467' }}>
          Yakin ingin menghapus produk{' '}
          <strong>{deleteTarget?.title}</strong>? Tindakan ini tidak dapat dibatalkan.
        </p>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <Button variant="ghost" onClick={() => setDeleteTarget(null)} disabled={saving}>
            Batal
          </Button>
          <Button variant="primary" onClick={handleDelete} disabled={saving} style={styles.deleteBtn}>
            {saving ? 'Menghapus...' : 'Hapus'}
          </Button>
        </div>
      </Modal>
    </>
  );
}

const styles = {
  searchWrapper: {
    position: 'relative',
    width: '100%',
    maxWidth: '320px',
  },
  searchIcon: {
    position: 'absolute',
    left: '14px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#9ca3af',
    pointerEvents: 'none',
  },
  searchInput: {
    width: '100%',
    padding: '8px 14px 8px 40px',
    background: '#fff',
    border: '1px solid #eaecf0',
    borderRadius: '6px',
    outline: 'none',
    fontSize: '14px',
    color: '#374151',
  },
  error: {
    background: '#fef2f2',
    color: '#dc2626',
    padding: '14px 16px',
    borderRadius: '8px',
    border: '1px solid #fecaca',
    marginBottom: '16px',
    fontSize: '14px',
  },
  feedback: {
    background: '#f0fdf4',
    color: '#16a34a',
    padding: '12px 16px',
    borderRadius: '8px',
    border: '1px solid #bbf7d0',
    marginBottom: '16px',
    fontSize: '14px',
  },
  deleteBtn: {
    background: '#dc2626',
    color: '#fff',
  },
};

const tableStyles = `
  .table-container {
    background: #ffffff;
    border: 1px solid #eaecf0;
    border-radius: 8px;
    box-shadow: 0 1px 3px rgba(16, 24, 40, 0.05);
    overflow: hidden;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  }

  .table-header-section {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    padding: 24px;
    border-bottom: 1px solid #eaecf0;
  }

  .table-main-title {
    font-size: 18px;
    font-weight: 600;
    color: #101828;
    margin: 0 0 4px 0;
  }

  .table-sub-title {
    font-size: 14px;
    color: #667085;
    margin: 0;
  }

  .btn-download-all-top {
    background: #7a5af8;
    color: #ffffff;
    border: none;
    padding: 10px 16px;
    border-radius: 6px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.2s;
  }

  .btn-download-all-top:hover {
    background: #6941c6;
  }

  .table-search-row {
    padding: 16px 24px;
    border-bottom: 1px solid #eaecf0;
    background: #fcfcfd;
  }

  .theme-table {
    width: 100%;
    border-collapse: collapse;
    text-align: left;
  }

  .theme-table thead th {
    padding: 12px 16px;
    font-size: 14px;
    font-weight: 500;
    color: #475467;
    background: #ffffff;
    border-bottom: 1px solid #eaecf0;
  }

  .theme-table tbody tr {
    border-bottom: 1px solid #eaecf0;
    transition: background 0.15s;
  }

  .theme-table tbody tr:hover {
    background: #f9fafb;
  }

  .theme-table tbody tr:last-child {
    border-bottom: none;
  }

  .theme-table tbody td {
    padding: 16px;
    font-size: 14px;
    color: #101828;
    vertical-align: middle;
  }

  .prod-info-cell {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .prod-thumb {
    width: 40px;
    height: 40px;
    border-radius: 8px;
    background: #f2f4f7;
    object-fit: cover;
    flex-shrink: 0;
  }

  .prod-name-text {
    font-weight: 500;
    color: #101828;
  }

  .text-gray {
    color: #475467 !important;
  }

  .capitalize {
    text-transform: capitalize;
  }

  .action-cell {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 6px;
  }

  .btn-icon {
    background: transparent;
    border: none;
    color: #667085;
    cursor: pointer;
    padding: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 6px;
    transition: all 0.15s;
  }

  .btn-icon:hover {
    background: #f2f4f7;
    color: #344054;
  }

  .btn-icon--danger:hover {
    background: #fef2f2;
    color: #dc2626;
  }

  .empty-state {
    text-align: center;
    padding: 32px !important;
    color: #667085 !important;
  }

  .skeleton-row td {
    padding: 20px 16px !important;
  }

  .skeleton-bar {
    height: 20px;
    border-radius: 4px;
    background: linear-gradient(90deg, #f2f4f7 25%, #eaecf0 50%, #f2f4f7 75%);
    background-size: 200% 100%;
    animation: pulse 1.5s infinite;
  }

  @keyframes pulse {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }
`;

export default Produk;
