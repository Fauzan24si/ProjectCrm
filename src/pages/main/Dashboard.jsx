import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiMoreVertical, FiTrendingUp, FiShoppingBag, FiUsers, FiDollarSign } from 'react-icons/fi';
import Card from '../../Reusable/Card';
import Table from '../../Reusable/Table';
import {
  getDashboardStats,
  getTopProducts,
  getRecentOrders,
  getOrderStatusMeta,
} from '../../services/orders';
import { formatRupiah } from '../../lib/membership';

const formatShortDate = (iso) =>
  iso
    ? new Date(iso).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : '-';

// Petakan status order (lowercase DB) ke kelas badge existing di dashboard.
const statusBadgeClass = (status) => {
  const s = (status || '').toLowerCase();
  if (s === 'completed' || s === 'paid' || s === 'delivered') return 'completed';
  if (s === 'cancelled' || s === 'failed') return 'cancelled';
  return 'processing';
};

const dashboardStyles = `
  /* Stats Cards Grid */
  .stats-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 20px;
    margin-bottom: 28px;
  }

  .stat-card {
    background: #fff;
    padding: 22px 20px 18px;
    border-radius: 14px;
    border: 1px solid #EDEDF0;
    box-shadow: 0 2px 8px rgba(16, 24, 40, 0.05);
    display: flex;
    flex-direction: column;
    gap: 10px;
    cursor: pointer;
    transition: transform 0.2s, box-shadow 0.2s;
  }

  .stat-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 24px rgba(16, 24, 40, 0.12);
  }

  .stat-card-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .stat-label {
    font-size: 13px;
    color: #89868D;
    font-weight: 500;
    margin: 0;
  }

  .stat-icon {
    width: 40px;
    height: 40px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    font-size: 18px;
    transition: transform 0.2s;
  }

  .stat-card:hover .stat-icon { transform: scale(1.08); }

  .stat-icon.revenue   { background: #f2f4f7; color: #101828; }
  .stat-icon.orders    { background: #FFF3E0; color: #E67E22; }
  .stat-icon.customers { background: #E8F5E9; color: #2E7D32; }
  .stat-icon.conversion{ background: #E3F2FD; color: #1565C0; }

  .stat-value {
    font-size: 28px;
    font-weight: 800;
    color: #3A3541;
    margin: 0;
    line-height: 1;
  }

  /* Progress bar under value */
  .stat-bar {
    height: 4px;
    border-radius: 4px;
    background: #EDEDF0;
    overflow: hidden;
  }

  .stat-bar-fill {
    height: 100%;
    border-radius: 4px;
    background: linear-gradient(90deg, #9B6EE0 0%, #101828 100%);
  }

  .stat-change {
    display: flex;
    align-items: center;
    font-size: 12px;
    font-weight: 500;
    gap: 4px;
  }

  .stat-change.positive { color: #22c55e; }
  .stat-change.negative { color: #ef4444; }
  .stat-change span.muted { color: #B4B2B7; font-weight: 400; }

  /* Bottom Grid */
  .bottom-grid {
    display: grid;
    grid-template-columns: 2fr 1fr;
    gap: 24px;
  }

  /* Card */
  .card {
    background: #fff;
    border-radius: 14px;
    border: 1px solid #EDEDF0;
    box-shadow: 0 2px 8px rgba(16, 24, 40, 0.05);
    padding: 22px;
  }

  .card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 20px;
  }

  .card-title {
    font-size: 16px;
    font-weight: 700;
    color: #3A3541;
    margin: 0;
  }

  .view-all-btn {
    font-size: 13px;
    color: #101828;
    font-weight: 600;
    background: none;
    border: none;
    cursor: pointer;
    font-family: 'Lato', sans-serif;
    transition: opacity 0.2s;
    padding: 4px 10px;
    border-radius: 6px;
  }

  .view-all-btn:hover {
    background: #f2f4f7;
    opacity: 1;
  }

  .more-btn {
    padding: 6px;
    background: none;
    border: none;
    color: #89868D;
    cursor: pointer;
    border-radius: 8px;
    transition: background 0.15s;
    display: flex;
    align-items: center;
  }

  .more-btn:hover { background: #f2f4f7; color: #101828; }

  /* Table */
  .orders-table {
    width: 100%;
    border-collapse: collapse;
    text-align: left;
  }

  .orders-table thead th {
    font-size: 11px;
    font-weight: 700;
    color: #B4B2B7;
    text-transform: uppercase;
    letter-spacing: 0.8px;
    padding-bottom: 12px;
    border-bottom: 1px solid #EDEDF0;
  }

  .orders-table tbody tr {
    border-bottom: 1px solid #F7F6FB;
    transition: background 0.15s;
    cursor: pointer;
  }

  .orders-table tbody tr:hover { background: #F7F6FB; }
  .orders-table tbody td { padding: 13px 0; font-size: 14px; }
  .orders-table .order-id { font-weight: 700; color: #3A3541; }
  .orders-table tbody tr:hover .order-id { color: #101828; }
  .orders-table .customer-name { color: #3A3541; }
  .orders-table .order-date { color: #89868D; }
  .orders-table .order-amount { font-weight: 700; color: #3A3541; }

  .status-badge {
    display: inline-block;
    padding: 4px 12px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 600;
  }

  .status-badge.completed  { background: #E8F5E9; color: #2E7D32; }
  .status-badge.processing { background: #f2f4f7; color: #101828; }
  .status-badge.cancelled  { background: #FDECEA; color: #C62828; }

  /* Product Row */
  .product-row {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px;
    margin: 0 -10px;
    border-radius: 10px;
    cursor: pointer;
    transition: background 0.15s;
  }

  .product-row:hover { background: #F7F6FB; }
  .product-row + .product-row { margin-top: 4px; }

  .product-img {
    width: 46px;
    height: 46px;
    border-radius: 10px;
    object-fit: cover;
    flex-shrink: 0;
    background: #f2f4f7;
    transition: transform 0.2s;
  }

  .product-row:hover .product-img { transform: scale(1.06); }
  .product-info { flex: 1; min-width: 0; }

  .product-name {
    font-size: 14px;
    font-weight: 700;
    color: #3A3541;
    margin: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    transition: color 0.15s;
  }

  .product-row:hover .product-name { color: #101828; }

  .product-category {
    font-size: 12px;
    color: #89868D;
    margin: 2px 0 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .product-price { text-align: right; flex-shrink: 0; }
  .product-price p:first-child { font-size: 14px; font-weight: 700; color: #101828; margin: 0; }
  .product-price p:last-child  { font-size: 11px; color: #B4B2B7; margin: 2px 0 0; }

  @media (max-width: 1200px) {
    .stats-grid  { grid-template-columns: repeat(2, 1fr); }
    .bottom-grid { grid-template-columns: 1fr; }
  }

  @media (max-width: 768px) {
    .stats-grid { grid-template-columns: 1fr; }
  }
`;

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    Promise.all([
      getDashboardStats(),
      getRecentOrders(5),
      getTopProducts(4),
    ])
      .then(([s, orders, products]) => {
        if (!active) return;
        setStats(s);
        setRecentOrders(orders);
        setTopProducts(products);
      })
      .catch(() => {
        // Biarkan nilai default (—) bila gagal.
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const dash = (v) => (loading || stats == null ? '—' : v);

  return (
    <>
      <style>{dashboardStyles}</style>

      <h1 className="admin-page-title" style={{ color: '#3A3541' }}>Dashboard Overview</h1>
      <p className="admin-page-subtitle" style={{ color: '#89868D' }}>Welcome back, here's what's happening with your store today.</p>

      {/* Stats Cards */}
      <div className="stats-grid">
        <Card className="stat-card">
          <div className="stat-card-top">
            <p className="stat-label">Total Revenue</p>
            <div className="stat-icon revenue"><FiDollarSign /></div>
          </div>
          <p className="stat-value">{dash(formatRupiah(stats?.total_revenue))}</p>
          <div className="stat-bar"><div className="stat-bar-fill" style={{ width: '72%' }}></div></div>
          <div className="stat-change positive">
            <span>Total</span><span className="muted">pendapatan lunas</span>
          </div>
        </Card>

        <Card className="stat-card">
          <div className="stat-card-top">
            <p className="stat-label">Total Orders</p>
            <div className="stat-icon orders"><FiShoppingBag /></div>
          </div>
          <p className="stat-value">{dash(stats?.total_orders)}</p>
          <div className="stat-bar"><div className="stat-bar-fill" style={{ width: '58%' }}></div></div>
          <div className="stat-change positive">
            <span>Semua</span><span className="muted">status order</span>
          </div>
        </Card>

        <Card className="stat-card">
          <div className="stat-card-top">
            <p className="stat-label">Total Customers</p>
            <div className="stat-icon customers"><FiUsers /></div>
          </div>
          <p className="stat-value">{dash(stats?.total_customers)}</p>
          <div className="stat-bar"><div className="stat-bar-fill" style={{ width: '45%' }}></div></div>
          <div className="stat-change positive">
            <span>Member</span><span className="muted">terdaftar</span>
          </div>
        </Card>

        <Card className="stat-card">
          <div className="stat-card-top">
            <p className="stat-label">Conversion Rate</p>
            <div className="stat-icon conversion"><FiTrendingUp /></div>
          </div>
          <p className="stat-value">{dash(`${stats?.conversion_rate}%`)}</p>
          <div className="stat-bar"><div className="stat-bar-fill" style={{ width: '35%' }}></div></div>
          <div className="stat-change positive">
            <span>Lunas</span><span className="muted">dari total order</span>
          </div>
        </Card>
      </div>

      {/* Recent Orders & Top Products */}
      <div className="bottom-grid">
        {/* Recent Orders */}
        <Card className="card">
          <div className="card-header">
            <h2 className="card-title">Recent Orders</h2>
            <Link to="/orders" className="view-all-btn">View All</Link>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <Table className="orders-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Date</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr>
                    <td colSpan={5} style={{ padding: '20px 0', color: '#89868D' }}>
                      Memuat data...
                    </td>
                  </tr>
                )}
                {!loading && recentOrders.length === 0 && (
                  <tr>
                    <td colSpan={5} style={{ padding: '20px 0', color: '#89868D' }}>
                      Belum ada order.
                    </td>
                  </tr>
                )}
                {!loading &&
                  recentOrders.map((order) => {
                    const meta = getOrderStatusMeta(order.status);
                    return (
                      <tr key={order.orderNumber}>
                        <td className="order-id">{order.orderNumber}</td>
                        <td className="customer-name">{order.customer || 'Guest'}</td>
                        <td className="order-date">{formatShortDate(order.date)}</td>
                        <td className="order-amount">{formatRupiah(order.total)}</td>
                        <td>
                          <span className={`status-badge ${statusBadgeClass(order.status)}`}>
                            {meta.label}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </Table>
          </div>
        </Card>

        {/* Top Products */}
        <Card className="card">
          <div className="card-header">
            <h2 className="card-title">Top Products</h2>
            <button className="more-btn"><FiMoreVertical /></button>
          </div>
          <div>
            {loading && (
              <p style={{ color: '#89868D', fontSize: 14, margin: 0 }}>Memuat data...</p>
            )}
            {!loading && topProducts.length === 0 && (
              <p style={{ color: '#89868D', fontSize: 14, margin: 0 }}>
                Belum ada penjualan.
              </p>
            )}
            {!loading &&
              topProducts.map((p) => (
                <div className="product-row" key={p.productId ?? p.title}>
                  <div className="product-info">
                    <p className="product-name">{p.title}</p>
                    <p className="product-category">{p.totalQty} terjual</p>
                  </div>
                  <div className="product-price">
                    <p>{formatRupiah(p.totalRevenue)}</p>
                    <p>{p.totalQty} sales</p>
                  </div>
                </div>
              ))}
          </div>
        </Card>
      </div>
    </>
  );
};

export default Dashboard;
