import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiBox, FiFileText } from 'react-icons/fi';
import { getCurrentUser } from '../../services/auth';
import { getUser } from '../../services/users';
import { formatRupiah } from '../../lib/membership';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table';
import {
  getOrdersByUser,
  summarizeOrders,
  getOrderStatusMeta,
} from '../../services/orders';
import Pagination from '../../components/Pagination';

const PAGE_SIZE = 10;

function TransactionHistory() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const navigate = useNavigate();

  useEffect(() => {
    const session = getCurrentUser();
    if (!session) {
      navigate('/login');
      return;
    }

    getUser(session.id)
      .then(async (data) => {
        if (!data) {
          setError('Data member tidak ditemukan.');
        } else {
          const userOrders = await getOrdersByUser(data.id);
          setOrders(userOrders);
        }
        setLoading(false);
      })
      .catch((err) => {
        setError(err.response?.data?.message || err.message);
        setLoading(false);
      });
  }, [navigate]);

  const summary = summarizeOrders(orders);
  const paged = orders.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  if (loading) {
    return (
      <div style={{ padding: 40, textAlign: 'center', color: '#667085' }}>
        Memuat riwayat transaksi...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: 16, background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: 10 }}>
        {error}
      </div>
    );
  }

  return (
    <>
      <style>{historyStyles}</style>
      <div className="history-wrap">
        <div className="history-header">
          <h1 className="history-title">Riwayat Transaksi</h1>
          <p className="history-subtitle">
            Daftar seluruh transaksi pembelian Anda.
          </p>
        </div>

        {/* Ringkasan */}
        <div className="history-stats">
          <div className="history-stat">
            <span className="stat-label">Total Transaksi</span>
            <span className="stat-value">{summary.totalOrders}</span>
          </div>
          <div className="history-stat">
            <span className="stat-label">Transaksi Selesai</span>
            <span className="stat-value">{summary.completedOrders}</span>
          </div>
          <div className="history-stat">
            <span className="stat-label">Total Belanja</span>
            <span className="stat-value">{formatRupiah(summary.totalSpent)}</span>
          </div>
        </div>

        {orders.length === 0 ? (
          <div className="history-empty">
            <FiBox size={40} />
            <p>Belum ada transaksi. Yuk mulai belanja!</p>
            <Link to="/shop" className="history-empty-btn">
              Lihat Katalog
            </Link>
          </div>
        ) : (
          <div className="history-table-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice</TableHead>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Produk</TableHead>
                  <TableHead className="text-center">Qty</TableHead>
                  <TableHead>Pembayaran</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paged.map((order) => {
                  const statusMeta = getOrderStatusMeta(order.status);
                  return (
                    <TableRow key={order.id}>
                      <TableCell className="td-invoice">
                        <FiFileText size={14} /> {order.id}
                      </TableCell>
                      <TableCell>
                        {new Date(order.date).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </TableCell>
                      <TableCell className="whitespace-normal">
                        <span className="td-product">{order.product}</span>
                        <span className="td-category">{order.category}</span>
                      </TableCell>
                      <TableCell className="text-center">{order.qty}</TableCell>
                      <TableCell>{order.payment}</TableCell>
                      <TableCell className="text-right td-total">
                        {formatRupiah(order.total)}
                      </TableCell>
                      <TableCell className="text-center">
                        <span
                          className="status-badge"
                          style={{ color: statusMeta.color, background: statusMeta.bg }}
                        >
                          {statusMeta.label}
                        </span>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
            <Pagination
              currentPage={page}
              totalItems={orders.length}
              pageSize={PAGE_SIZE}
              onPageChange={setPage}
            />
          </div>
        )}
      </div>
    </>
  );
}

const historyStyles = `
  .history-wrap { font-family: 'Lato', sans-serif; }
  .history-header { margin-bottom: 24px; }
  .history-title { margin: 0; font-size: 26px; font-weight: 700; color: #101828; }
  .history-subtitle { margin: 4px 0 0; font-size: 14px; color: #667085; }

  .history-stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 16px;
    margin-bottom: 24px;
  }
  .history-stat {
    background: #fff;
    border: 1px solid #eaecf0;
    border-radius: 14px;
    padding: 18px 20px;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  .history-stat .stat-label {
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: #98a2b3;
    font-weight: 600;
  }
  .history-stat .stat-value { font-size: 22px; font-weight: 700; color: #101828; }

  .history-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    padding: 64px 16px;
    color: #98a2b3;
    background: #fff;
    border: 1px solid #eaecf0;
    border-radius: 16px;
    text-align: center;
  }
  .history-empty p { margin: 0; font-size: 15px; }
  .history-empty-btn {
    margin-top: 8px;
    padding: 10px 24px;
    background: #101828;
    color: #fff;
    border-radius: 8px;
    text-decoration: none;
    font-size: 14px;
    font-weight: 600;
  }

  .history-table-card {
    background: #fff;
    border: 1px solid #eaecf0;
    border-radius: 16px;
    padding: 8px 8px;
    overflow: hidden;
    overflow-x: auto;
  }
  .history-table-card thead th {
    font-size: 12px;
    font-weight: 600;
    color: #667085;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    padding: 12px 16px;
    background: #f9fafb;
  }
  .history-table-card tbody td {
    padding: 14px 16px;
    font-size: 14px;
    color: #475467;
    vertical-align: middle;
  }
  .history-table-card tbody tr { border-color: #f3f4f6; }

  .td-invoice {
    font-weight: 600;
    color: #101828;
    white-space: nowrap;
  }
  .td-invoice svg { display: inline; vertical-align: -2px; margin-right: 6px; }
  .td-product { display: block; font-weight: 600; color: #101828; }
  .td-category { display: block; font-size: 12px; color: #98a2b3; margin-top: 2px; }
  .td-total { font-weight: 700; color: #101828; white-space: nowrap; }

  .status-badge {
    display: inline-block;
    font-size: 11px;
    font-weight: 600;
    padding: 3px 12px;
    border-radius: 999px;
    white-space: nowrap;
  }
`;

export default TransactionHistory;
