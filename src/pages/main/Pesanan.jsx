import { useEffect, useMemo, useState } from 'react';
import { FiSearch, FiShoppingBag, FiClock, FiTruck, FiCheckCircle } from 'react-icons/fi';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import {
  getAllOrders,
  updateOrderStatus,
  getOrderStatusMeta,
  getNextStatusAction,
} from '../../services/orders';
import Pagination from '../../components/Pagination';

const PAGE_SIZE = 10;

const formatRupiah = (n) => 'Rp ' + Number(n || 0).toLocaleString('id-ID');
const formatDate = (iso) =>
  new Date(iso).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

const STATUS_TABS = [
  { key: 'all', label: 'Semua' },
  { key: 'paid', label: 'Perlu Konfirmasi' },
  { key: 'processing', label: 'Diproses' },
  { key: 'shipped', label: 'Dikirim' },
  { key: 'delivered', label: 'Sampai' },
  { key: 'completed', label: 'Selesai' },
];

function Pesanan() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [updatingId, setUpdatingId] = useState(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const data = await getAllOrders();
      setOrders(data);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const stats = useMemo(() => {
    return {
      total: orders.length,
      needConfirm: orders.filter((o) => o.status === 'paid').length,
      inDelivery: orders.filter((o) =>
        ['processing', 'shipped', 'delivered'].includes(o.status)
      ).length,
      completed: orders.filter((o) => o.status === 'completed').length,
    };
  }, [orders]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return orders.filter((o) => {
      const matchSearch =
        !q ||
        (o.orderNumber || '').toLowerCase().includes(q) ||
        (o.customer || '').toLowerCase().includes(q) ||
        (o.product || '').toLowerCase().includes(q);
      const matchStatus = statusFilter === 'all' || o.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [orders, search, statusFilter]);

  // Reset ke halaman 1 saat filter/pencarian berubah.
  useEffect(() => {
    setPage(1);
  }, [search, statusFilter]);

  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleAdvance = async (order) => {
    const action = getNextStatusAction(order.status);
    if (!action) return;

    setUpdatingId(order.orderNumber);
    try {
      await updateOrderStatus(order.orderNumber, action.next);
      setOrders((prev) =>
        prev.map((o) =>
          o.orderNumber === order.orderNumber ? { ...o, status: action.next } : o
        )
      );
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <>
      <style>{pesananStyles}</style>
      <div className="pesanan-wrap">
        <div className="pesanan-header">
          <h1 className="pesanan-title">Pesanan</h1>
          <p className="pesanan-subtitle">
            Kelola pesanan masuk dan perbarui status pengiriman.
          </p>
        </div>

        {error && <div className="pesanan-error">{error}</div>}

        {/* Stat cards */}
        <div className="pesanan-stats">
          <StatCard icon={FiShoppingBag} label="Total Pesanan" value={stats.total} color="#101828" />
          <StatCard icon={FiClock} label="Perlu Konfirmasi" value={stats.needConfirm} color="#B54708" />
          <StatCard icon={FiTruck} label="Dalam Pengiriman" value={stats.inDelivery} color="#175CD3" />
          <StatCard icon={FiCheckCircle} label="Selesai" value={stats.completed} color="#067647" />
        </div>

        {/* Toolbar */}
        <div className="pesanan-toolbar">
          <div className="pesanan-tabs">
            {STATUS_TABS.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setStatusFilter(tab.key)}
                className={`pesanan-tab ${statusFilter === tab.key ? 'active' : ''}`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div className="pesanan-search">
            <FiSearch size={16} className="pesanan-search-icon" />
            <input
              type="text"
              placeholder="Cari order, customer, produk..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Table */}
        <div className="pesanan-table-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order</TableHead>
                <TableHead>Pelanggan</TableHead>
                <TableHead>Produk</TableHead>
                <TableHead>Tanggal</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-center">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading && (
                <TableRow>
                  <TableCell colSpan={7} className="pesanan-empty">
                    Memuat pesanan...
                  </TableCell>
                </TableRow>
              )}

              {!loading &&
                paged.map((order) => {
                  const meta = getOrderStatusMeta(order.status);
                  const action = getNextStatusAction(order.status);
                  return (
                    <TableRow key={order.orderNumber}>
                      <TableCell className="pesanan-ordernum">{order.orderNumber}</TableCell>
                      <TableCell>
                        <span className="pesanan-cust-name">{order.customer || 'Guest'}</span>
                        {order.email && (
                          <span className="pesanan-cust-email">{order.email}</span>
                        )}
                      </TableCell>
                      <TableCell className="whitespace-normal">
                        <span className="pesanan-product">{order.product}</span>
                        <span className="pesanan-category">{order.category}</span>
                      </TableCell>
                      <TableCell>{formatDate(order.date)}</TableCell>
                      <TableCell className="text-right pesanan-total">
                        {formatRupiah(order.total)}
                      </TableCell>
                      <TableCell className="text-center">
                        <span
                          className="pesanan-badge"
                          style={{ color: meta.color, background: meta.bg }}
                        >
                          {meta.label}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        {action ? (
                          <button
                            type="button"
                            className="pesanan-action-btn"
                            disabled={updatingId === order.orderNumber}
                            onClick={() => handleAdvance(order)}
                          >
                            {updatingId === order.orderNumber ? '...' : action.label}
                          </button>
                        ) : (
                          <span className="pesanan-action-none">—</span>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}

              {!loading && filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="pesanan-empty">
                    Tidak ada pesanan yang cocok.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          {!loading && (
            <Pagination
              currentPage={page}
              totalItems={filtered.length}
              pageSize={PAGE_SIZE}
              onPageChange={setPage}
            />
          )}
        </div>
      </div>
    </>
  );
}

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="pesanan-stat">
      <div className="pesanan-stat-icon" style={{ color, background: `${color}1a` }}>
        <Icon size={20} />
      </div>
      <div>
        <span className="pesanan-stat-label">{label}</span>
        <p className="pesanan-stat-value">{value}</p>
      </div>
    </div>
  );
}

const pesananStyles = `
  .pesanan-wrap { font-family: 'Lato', sans-serif; }
  .pesanan-header { margin-bottom: 22px; }
  .pesanan-title { margin: 0; font-size: 26px; font-weight: 700; color: #101828; }
  .pesanan-subtitle { margin: 4px 0 0; font-size: 14px; color: #667085; }

  .pesanan-error {
    padding: 12px 16px;
    background: #fef3f2;
    color: #b42318;
    border: 1px solid #fecdca;
    border-radius: 10px;
    margin-bottom: 16px;
    font-size: 14px;
  }

  .pesanan-stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 16px;
    margin-bottom: 22px;
  }
  .pesanan-stat {
    display: flex;
    align-items: center;
    gap: 14px;
    background: #fff;
    border: 1px solid #eaecf0;
    border-radius: 14px;
    padding: 16px 18px;
  }
  .pesanan-stat-icon {
    width: 44px;
    height: 44px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }
  .pesanan-stat-label {
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: #98a2b3;
    font-weight: 600;
  }
  .pesanan-stat-value { margin: 2px 0 0; font-size: 22px; font-weight: 700; color: #101828; }

  .pesanan-toolbar {
    display: flex;
    flex-wrap: wrap;
    gap: 14px;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
  }
  .pesanan-tabs { display: flex; flex-wrap: wrap; gap: 6px; }
  .pesanan-tab {
    padding: 7px 14px;
    border: 1px solid #eaecf0;
    background: #fff;
    border-radius: 8px;
    font-size: 13px;
    color: #667085;
    cursor: pointer;
    font-weight: 500;
  }
  .pesanan-tab.active { background: #101828; border-color: #101828; color: #fff; }

  .pesanan-search { position: relative; }
  .pesanan-search-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: #98a2b3; }
  .pesanan-search input {
    padding: 9px 14px 9px 36px;
    border: 1px solid #d0d5dd;
    border-radius: 8px;
    font-size: 13px;
    outline: none;
    min-width: 240px;
  }
  .pesanan-search input:focus { border-color: #101828; box-shadow: 0 0 0 3px rgba(16,24,40,0.12); }

  .pesanan-table-card {
    background: #fff;
    border: 1px solid #eaecf0;
    border-radius: 16px;
    padding: 8px;
    overflow-x: auto;
  }
  .pesanan-table-card thead th {
    font-size: 12px;
    font-weight: 600;
    color: #667085;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    padding: 12px 16px;
    background: #f9fafb;
  }
  .pesanan-table-card tbody td {
    padding: 14px 16px;
    font-size: 14px;
    color: #475467;
    vertical-align: middle;
  }
  .pesanan-table-card tbody tr { border-color: #f3f4f6; }

  .pesanan-ordernum { font-weight: 600; color: #101828; white-space: nowrap; }
  .pesanan-cust-name { display: block; font-weight: 600; color: #101828; }
  .pesanan-cust-email { display: block; font-size: 12px; color: #98a2b3; margin-top: 2px; }
  .pesanan-product { display: block; font-weight: 600; color: #101828; }
  .pesanan-category { display: block; font-size: 12px; color: #98a2b3; margin-top: 2px; }
  .pesanan-total { font-weight: 700; color: #101828; white-space: nowrap; }

  .pesanan-badge {
    display: inline-block;
    font-size: 11px;
    font-weight: 600;
    padding: 3px 12px;
    border-radius: 999px;
    white-space: nowrap;
  }
  .pesanan-action-btn {
    padding: 7px 14px;
    background: #101828;
    color: #fff;
    border: none;
    border-radius: 8px;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    white-space: nowrap;
  }
  .pesanan-action-btn:disabled { opacity: 0.6; cursor: default; }
  .pesanan-action-none { color: #d0d5dd; }

  .pesanan-empty { text-align: center; color: #98a2b3; padding: 32px; }
`;

export default Pesanan;
