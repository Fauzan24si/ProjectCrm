import { useState, useEffect } from 'react';
import InputField from '../Reusable/InputField';
import SelectField from '../Reusable/SelectField';
import Button from '../Reusable/Button';
import { PRODUCT_CATEGORIES } from '../services/products';

const emptyForm = {
  title: '',
  category: 'furniture',
  price: '',
  stock: '',
  brand: '',
  sku: '',
  rating: '',
  discount_percentage: '',
  thumbnail: '',
  description: '',
};

/**
 * Form tambah/edit produk. Dipakai di dalam Modal.
 * - `initialData` mengisi form untuk mode edit.
 * - `onSubmit(payload)` dipanggil saat form valid.
 */
const ProductForm = ({ initialData = null, onSubmit, onCancel, loading = false }) => {
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (initialData) {
      setForm({
        title: initialData.title ?? '',
        category: initialData.category ?? 'furniture',
        price: initialData.price ?? '',
        stock: initialData.stock ?? '',
        brand: initialData.brand ?? '',
        sku: initialData.sku ?? '',
        rating: initialData.rating ?? '',
        discount_percentage: initialData.discount_percentage ?? '',
        thumbnail: initialData.thumbnail ?? '',
        description: initialData.description ?? '',
      });
    } else {
      setForm(emptyForm);
    }
    setFormError('');
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormError('');

    if (!form.title.trim()) {
      setFormError('Nama produk wajib diisi.');
      return;
    }
    if (form.price === '' || Number(form.price) < 0) {
      setFormError('Harga harus berupa angka yang valid.');
      return;
    }
    if (form.stock === '' || Number(form.stock) < 0) {
      setFormError('Stok harus berupa angka yang valid.');
      return;
    }
    if (form.rating !== '' && (Number(form.rating) < 0 || Number(form.rating) > 5)) {
      setFormError('Rating harus di antara 0 dan 5.');
      return;
    }

    onSubmit({
      title: form.title.trim(),
      category: form.category,
      price: Number(form.price),
      stock: Number(form.stock),
      brand: form.brand.trim(),
      sku: form.sku.trim(),
      rating: form.rating === '' ? null : Number(form.rating),
      discount_percentage:
        form.discount_percentage === '' ? 0 : Number(form.discount_percentage),
      thumbnail: form.thumbnail.trim(),
      description: form.description.trim(),
    });
  };

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      {formError && <div style={styles.error}>{formError}</div>}

      <InputField
        label="Nama Produk"
        name="title"
        value={form.title}
        onChange={handleChange}
        placeholder="Contoh: Sofa Minimalis"
        required
      />

      <SelectField
        label="Kategori"
        name="category"
        value={form.category}
        onChange={handleChange}
        options={PRODUCT_CATEGORIES.map((c) => ({ value: c, label: c }))}
      />

      <div style={styles.row}>
        <InputField
          label="Harga (Rp)"
          type="number"
          name="price"
          value={form.price}
          onChange={handleChange}
          placeholder="0"
          min="0"
          step="0.01"
          required
        />
        <InputField
          label="Stok"
          type="number"
          name="stock"
          value={form.stock}
          onChange={handleChange}
          placeholder="0"
          min="0"
          required
        />
      </div>

      <InputField
        label="Brand"
        name="brand"
        value={form.brand}
        onChange={handleChange}
        placeholder="Contoh: IKEA"
      />

      <div style={styles.row}>
        <InputField
          label="SKU"
          name="sku"
          value={form.sku}
          onChange={handleChange}
          placeholder="Contoh: SOF-001"
        />
        <InputField
          label="Rating (0-5)"
          type="number"
          name="rating"
          value={form.rating}
          onChange={handleChange}
          placeholder="0"
          min="0"
          max="5"
          step="0.1"
        />
        <InputField
          label="Diskon (%)"
          type="number"
          name="discount_percentage"
          value={form.discount_percentage}
          onChange={handleChange}
          placeholder="0"
          min="0"
          max="100"
          step="0.01"
        />
      </div>

      <InputField
        label="URL Thumbnail"
        name="thumbnail"
        value={form.thumbnail}
        onChange={handleChange}
        placeholder="https://..."
      />

      <div className="reusable-input-group">
        <label htmlFor="description" className="reusable-input-label">
          Deskripsi
        </label>
        <textarea
          id="description"
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="Deskripsi singkat produk..."
          rows={3}
          className="reusable-input"
          style={{ resize: 'vertical', fontFamily: 'inherit' }}
        />
      </div>

      <div style={styles.actions}>
        <Button type="button" variant="ghost" onClick={onCancel} disabled={loading}>
          Batal
        </Button>
        <Button type="submit" variant="admin" disabled={loading}>
          {loading ? 'Menyimpan...' : initialData ? 'Simpan Perubahan' : 'Tambah Produk'}
        </Button>
      </div>
    </form>
  );
};

const styles = {
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
  },
  row: {
    display: 'flex',
    gap: '12px',
  },
  actions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '8px',
    marginTop: '8px',
  },
  error: {
    backgroundColor: '#fef2f2',
    color: '#dc2626',
    padding: '10px 12px',
    borderRadius: '6px',
    fontSize: '13px',
    border: '1px solid #fecaca',
  },
};

export default ProductForm;
