import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiMoreVertical, FiSearch } from 'react-icons/fi';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import { getUsers } from '../../services/users';
import { getMembershipMeta, formatRupiah } from '../../lib/membership';

function MembershipBadge({ membership }) {
  const meta = getMembershipMeta(membership);
  return (
    <span
      className="membership-badge"
      style={{ background: meta.bg, color: meta.color }}
    >
      {meta.label}
    </span>
  );
}

function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    let active = true;
    getUsers({ limit: 100, role: 'user' })
      .then((data) => {
        if (!active) return;
        setCustomers(data);
        setLoading(false);
      })
      .catch((err) => {
        if (!active) return;
        setError(err.response?.data?.message || err.message);
        setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const filtered = customers.filter((u) => {
    const q = search.toLowerCase();
    return (
      (u.name || '').toLowerCase().includes(q) ||
      (u.email || '').toLowerCase().includes(q)
    );
  });

  return (
    <>
      <style>{tableStyles}</style>

      {error && <div style={styles.error}>Gagal memuat data: {error}</div>}

      <div className="table-container">
        <div className="table-header-section">
          <div>
            <h1 className="table-main-title">Customers</h1>
            <p className="table-sub-title">
              Daftar pelanggan beserta tier membership mereka.
            </p>
          </div>
        </div>

        <div className="table-search-row">
          <div style={styles.searchWrapper}>
            <FiSearch style={styles.searchIcon} size={16} />
            <input
              type="text"
              placeholder="Cari customer..."
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
                <TableHead style={{ paddingLeft: 24 }}>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Total Transaksi</TableHead>
                <TableHead>Membership</TableHead>
                <TableHead style={{ width: 140, textAlign: 'right', paddingRight: 24 }}></TableHead>
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
                filtered.map((user) => (
                  <TableRow key={user.id} onClick={() => navigate(`/customers/${user.id}`)}>
                    <TableCell style={{ paddingLeft: 24 }}>
                      <div className="user-info-cell">
                        <img
                          src={user.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'U')}&background=DFE9F4&color=054C73`}
                          alt={user.name}
                          className="user-avatar-img"
                        />
                        <span className="user-name-text">{user.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-gray">{user.email}</TableCell>
                    <TableCell className="text-gray">{user.phone || '-'}</TableCell>
                    <TableCell className="text-gray">{formatRupiah(user.total_spent)}</TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <MembershipBadge membership={user.membership} />
                    </TableCell>
                    <TableCell style={{ paddingRight: 24, textAlign: 'right' }}>
                      <div className="action-cell">
                        <button
                          className="btn-action-row"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/customers/${user.id}`);
                          }}
                        >
                          View details
                        </button>
                        <button className="btn-icon" onClick={(e) => e.stopPropagation()}>
                          <FiMoreVertical size={20} />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}

              {!loading && !error && filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="empty-state">
                    Belum ada customer yang cocok dengan pencarian.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
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
    cursor: pointer;
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

  .user-info-cell {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .user-avatar-img {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: #f2f4f7;
    object-fit: cover;
  }

  .user-name-text {
    font-weight: 500;
    color: #101828;
  }

  .text-gray {
    color: #475467 !important;
  }

  .membership-badge {
    display: inline-block;
    padding: 4px 12px;
    border-radius: 999px;
    font-size: 12px;
    font-weight: 700;
    text-transform: capitalize;
  }

  .action-cell {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 12px;
  }

  .btn-action-row {
    background: #344054;
    color: #ffffff;
    border: none;
    padding: 8px 14px;
    border-radius: 6px;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.2s;
  }

  .btn-action-row:hover {
    background: #1d2939;
  }

  .btn-icon {
    background: transparent;
    border: none;
    color: #98a2b3;
    cursor: pointer;
    padding: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
  }

  .btn-icon:hover {
    background: #f2f4f7;
    color: #344054;
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

export default Customers;
