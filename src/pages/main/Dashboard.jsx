import { FiMoreVertical, FiTrendingUp, FiShoppingBag, FiUsers, FiDollarSign } from 'react-icons/fi';
import Card from '../../Reusable/Card';
import Table from '../../Reusable/Table';

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
    box-shadow: 0 2px 8px rgba(110, 57, 203, 0.05);
    display: flex;
    flex-direction: column;
    gap: 10px;
    cursor: pointer;
    transition: transform 0.2s, box-shadow 0.2s;
  }

  .stat-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 24px rgba(110, 57, 203, 0.12);
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

  .stat-icon.revenue   { background: #EDE4F9; color: #6E39CB; }
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
    background: linear-gradient(90deg, #9B6EE0 0%, #6E39CB 100%);
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
    box-shadow: 0 2px 8px rgba(110, 57, 203, 0.05);
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
    color: #6E39CB;
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
    background: #EDE4F9;
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

  .more-btn:hover { background: #F0EAFA; color: #6E39CB; }

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
  .orders-table tbody tr:hover .order-id { color: #6E39CB; }
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
  .status-badge.processing { background: #EDE4F9; color: #6E39CB; }
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
    background: #F0EAFA;
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

  .product-row:hover .product-name { color: #6E39CB; }

  .product-category {
    font-size: 12px;
    color: #89868D;
    margin: 2px 0 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .product-price { text-align: right; flex-shrink: 0; }
  .product-price p:first-child { font-size: 14px; font-weight: 700; color: #6E39CB; margin: 0; }
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
          <p className="stat-value">$24,560</p>
          <div className="stat-bar"><div className="stat-bar-fill" style={{ width: '72%' }}></div></div>
          <div className="stat-change positive">
            <span>+12.5%</span><span className="muted">vs last month</span>
          </div>
        </Card>

        <Card className="stat-card">
          <div className="stat-card-top">
            <p className="stat-label">Total Orders</p>
            <div className="stat-icon orders"><FiShoppingBag /></div>
          </div>
          <p className="stat-value">1,245</p>
          <div className="stat-bar"><div className="stat-bar-fill" style={{ width: '58%' }}></div></div>
          <div className="stat-change positive">
            <span>+8.2%</span><span className="muted">vs last month</span>
          </div>
        </Card>

        <Card className="stat-card">
          <div className="stat-card-top">
            <p className="stat-label">Total Customers</p>
            <div className="stat-icon customers"><FiUsers /></div>
          </div>
          <p className="stat-value">842</p>
          <div className="stat-bar"><div className="stat-bar-fill" style={{ width: '45%' }}></div></div>
          <div className="stat-change negative">
            <span>-2.4%</span><span className="muted">vs last month</span>
          </div>
        </Card>

        <Card className="stat-card">
          <div className="stat-card-top">
            <p className="stat-label">Conversion Rate</p>
            <div className="stat-icon conversion"><FiTrendingUp /></div>
          </div>
          <p className="stat-value">4.5%</p>
          <div className="stat-bar"><div className="stat-bar-fill" style={{ width: '35%' }}></div></div>
          <div className="stat-change positive">
            <span>+1.2%</span><span className="muted">vs last month</span>
          </div>
        </Card>
      </div>

      {/* Recent Orders & Top Products */}
      <div className="bottom-grid">
        {/* Recent Orders */}
        <Card className="card">
          <div className="card-header">
            <h2 className="card-title">Recent Orders</h2>
            <button className="view-all-btn">View All</button>
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
                <tr>
                  <td className="order-id">#ORD-001</td>
                  <td className="customer-name">John Doe</td>
                  <td className="order-date">Oct 24, 2023</td>
                  <td className="order-amount">$120.00</td>
                  <td><span className="status-badge completed">Completed</span></td>
                </tr>
                <tr>
                  <td className="order-id">#ORD-002</td>
                  <td className="customer-name">Jane Smith</td>
                  <td className="order-date">Oct 23, 2023</td>
                  <td className="order-amount">$450.00</td>
                  <td><span className="status-badge processing">Processing</span></td>
                </tr>
                <tr>
                  <td className="order-id">#ORD-003</td>
                  <td className="customer-name">Michael Johnson</td>
                  <td className="order-date">Oct 23, 2023</td>
                  <td className="order-amount">$89.50</td>
                  <td><span className="status-badge completed">Completed</span></td>
                </tr>
                <tr>
                  <td className="order-id">#ORD-004</td>
                  <td className="customer-name">Emily Davis</td>
                  <td className="order-date">Oct 22, 2023</td>
                  <td className="order-amount">$210.00</td>
                  <td><span className="status-badge cancelled">Cancelled</span></td>
                </tr>
                <tr>
                  <td className="order-id">#ORD-005</td>
                  <td className="customer-name">William Brown</td>
                  <td className="order-date">Oct 21, 2023</td>
                  <td className="order-amount">$55.00</td>
                  <td><span className="status-badge completed">Completed</span></td>
                </tr>
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
            <div className="product-row">
              <img src="https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=150&q=80" alt="Syltherine" className="product-img" />
              <div className="product-info">
                <p className="product-name">Syltherine</p>
                <p className="product-category">Stylish cafe chair</p>
              </div>
              <div className="product-price">
                <p>$2.500.000</p>
                <p>124 sales</p>
              </div>
            </div>

            <div className="product-row">
              <img src="https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1?w=150&q=80" alt="Leviosa" className="product-img" />
              <div className="product-info">
                <p className="product-name">Leviosa</p>
                <p className="product-category">Stylish cafe chair</p>
              </div>
              <div className="product-price">
                <p>$2.500.000</p>
                <p>98 sales</p>
              </div>
            </div>

            <div className="product-row">
              <img src="https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=150&q=80" alt="Lolito" className="product-img" />
              <div className="product-info">
                <p className="product-name">Lolito</p>
                <p className="product-category">Luxury big sofa</p>
              </div>
              <div className="product-price">
                <p>$7.000.000</p>
                <p>74 sales</p>
              </div>
            </div>

            <div className="product-row">
              <img src="https://images.unsplash.com/photo-1533090481720-856c6e3c1fdc?w=150&q=80" alt="Respira" className="product-img" />
              <div className="product-info">
                <p className="product-name">Respira</p>
                <p className="product-category">Outdoor bar table and stool</p>
              </div>
              <div className="product-price">
                <p>$5.000.000</p>
                <p>52 sales</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </>
  );
};

export default Dashboard;
