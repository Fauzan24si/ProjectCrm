import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

/**
 * Komponen pagination reusable.
 *
 * @param {object} props
 * @param {number} props.currentPage - halaman aktif (1-indexed)
 * @param {number} props.totalItems  - total jumlah item (semua halaman)
 * @param {number} props.pageSize    - item per halaman
 * @param {(page:number)=>void} props.onPageChange
 */
function Pagination({ currentPage, totalItems, pageSize, onPageChange }) {
  const totalPages = Math.max(Math.ceil(totalItems / pageSize), 1);
  if (totalPages <= 1) return null;

  const from = (currentPage - 1) * pageSize + 1;
  const to = Math.min(currentPage * pageSize, totalItems);

  // Bangun daftar nomor halaman dengan elipsis (maks ~5 nomor terlihat).
  const pages = [];
  const push = (p) => pages.push(p);
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i += 1) push(i);
  } else {
    push(1);
    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);
    if (start > 2) push('…');
    for (let i = start; i <= end; i += 1) push(i);
    if (end < totalPages - 1) push('…');
    push(totalPages);
  }

  return (
    <>
      <style>{paginationStyles}</style>
      <div className="pg-wrap">
        <span className="pg-info">
          Menampilkan {from}–{to} dari {totalItems}
        </span>
        <div className="pg-controls">
          <button
            type="button"
            className="pg-btn"
            disabled={currentPage <= 1}
            onClick={() => onPageChange(currentPage - 1)}
            aria-label="Halaman sebelumnya"
          >
            <FiChevronLeft size={16} />
          </button>

          {pages.map((p, i) =>
            p === '…' ? (
              <span key={`e-${i}`} className="pg-ellipsis">…</span>
            ) : (
              <button
                key={p}
                type="button"
                className={`pg-btn pg-num ${p === currentPage ? 'active' : ''}`}
                onClick={() => onPageChange(p)}
              >
                {p}
              </button>
            )
          )}

          <button
            type="button"
            className="pg-btn"
            disabled={currentPage >= totalPages}
            onClick={() => onPageChange(currentPage + 1)}
            aria-label="Halaman berikutnya"
          >
            <FiChevronRight size={16} />
          </button>
        </div>
      </div>
    </>
  );
}

const paginationStyles = `
  .pg-wrap {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    flex-wrap: wrap;
    padding: 16px 24px;
    border-top: 1px solid #eaecf0;
    font-family: 'Inter', -apple-system, sans-serif;
  }
  .pg-info { font-size: 13px; color: #667085; }
  .pg-controls { display: flex; align-items: center; gap: 4px; }
  .pg-btn {
    min-width: 34px;
    height: 34px;
    padding: 0 8px;
    border: 1px solid #eaecf0;
    background: #fff;
    border-radius: 8px;
    font-size: 13px;
    font-weight: 600;
    color: #344054;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    transition: background 0.15s, border-color 0.15s;
  }
  .pg-btn:hover:not(:disabled) { background: #f9fafb; border-color: #d0d5dd; }
  .pg-btn:disabled { opacity: 0.45; cursor: not-allowed; }
  .pg-num.active {
    background: #101828;
    border-color: #101828;
    color: #fff;
  }
  .pg-ellipsis { padding: 0 4px; color: #98a2b3; font-size: 13px; }
`;

export default Pagination;
