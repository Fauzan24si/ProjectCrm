import { useParams, Link } from "react-router-dom"
import { useEffect, useState } from "react"
import axios from "axios"
import { FiArrowLeft, FiStar } from "react-icons/fi"
import Card from "../../Reusable/Card"
import Loading from "../../Reusable/Loading"

export default function ProductDetail() {
  const { id } = useParams()
  const [product, setProduct] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    axios
      .get(`https://dummyjson.com/products/${id}`)
      .then((response) => {
        if (response.status !== 200) {
          setError(response.message)
          return
        }
        setProduct(response.data)
      })
      .catch((err) => {
        setError(err.message)
      })
  }, [id])

  if (error) return <div style={styles.error}>{error}</div>
  if (!product) return <Loading message="Memuat detail produk..." />

  return (
    <>
      <Link to="/products" style={styles.backLink}>
        <FiArrowLeft /> Kembali ke Products
      </Link>

      <Card style={styles.cardOverride}>
        <div style={styles.grid}>
          <div style={styles.imageBox}>
            <img src={product.thumbnail} alt={product.title} style={styles.image} />
          </div>

          <div style={styles.info}>
            <span style={styles.category}>{product.category}</span>
            <h1 style={styles.title}>{product.title}</h1>

            <div style={styles.ratingRow}>
              <FiStar style={{ color: '#f59e0b', fill: '#f59e0b' }} />
              <span style={styles.ratingText}>{product.rating}</span>
              <span style={styles.brandText}>· {product.brand || 'Premium Brand'}</span>
            </div>

            <p style={styles.desc}>{product.description}</p>

            <div style={styles.priceBox}>
              <span style={styles.priceLabel}>Harga</span>
              <span style={styles.price}>
                Rp {(product.price * 15000).toLocaleString('id-ID')}
              </span>
            </div>

            <div style={styles.metaGrid}>
              <div style={styles.metaItem}>
                <span style={styles.metaLabel}>Stock</span>
                <span style={styles.metaValue}>{product.stock}</span>
              </div>
              <div style={styles.metaItem}>
                <span style={styles.metaLabel}>SKU</span>
                <span style={styles.metaValue}>{product.sku || '-'}</span>
              </div>
              <div style={styles.metaItem}>
                <span style={styles.metaLabel}>Diskon</span>
                <span style={styles.metaValue}>{product.discountPercentage}%</span>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </>
  )
}

const styles = {
  backLink: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px',
    fontWeight: 600,
    color: '#054C73',
    textDecoration: 'none',
    marginBottom: '20px',
  },
  cardOverride: {
    borderRadius: '16px',
    border: '1px solid #f3f4f6',
    padding: '28px',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'minmax(260px, 400px) 1fr',
    gap: '32px',
    alignItems: 'start',
  },
  imageBox: {
    background: 'linear-gradient(135deg, #f9fafb, #f3f4f6)',
    borderRadius: '12px',
    padding: '24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '320px',
  },
  image: {
    maxWidth: '100%',
    maxHeight: '320px',
    objectFit: 'contain',
  },
  info: { display: 'flex', flexDirection: 'column' },
  category: {
    fontSize: '11px',
    fontWeight: 700,
    color: '#054C73',
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    marginBottom: '8px',
  },
  title: {
    fontSize: '26px',
    fontWeight: 700,
    color: '#1f2937',
    margin: '0 0 12px',
  },
  ratingRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    marginBottom: '16px',
  },
  ratingText: { fontSize: '14px', fontWeight: 700, color: '#374151' },
  brandText: { fontSize: '13px', color: '#9ca3af' },
  desc: {
    fontSize: '14px',
    color: '#6b7280',
    lineHeight: 1.7,
    margin: '0 0 24px',
  },
  priceBox: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    padding: '16px 20px',
    background: '#DFE9F4',
    borderRadius: '12px',
    marginBottom: '20px',
  },
  priceLabel: { fontSize: '12px', color: '#054C73', fontWeight: 600 },
  price: { fontSize: '24px', fontWeight: 800, color: '#054C73' },
  metaGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '12px',
  },
  metaItem: {
    background: '#f9fafb',
    padding: '12px',
    borderRadius: '10px',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  metaLabel: { fontSize: '11px', color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase' },
  metaValue: { fontSize: '14px', fontWeight: 700, color: '#1f2937' },
  error: { padding: '16px', color: '#dc2626' },
}
