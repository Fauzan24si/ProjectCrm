import { useState, useEffect } from 'react';
import InputField from '../Reusable/InputField';
import SelectField from '../Reusable/SelectField';
import Button from '../Reusable/Button';
import { PRODUCT_CATEGORIES } from '../services/products';
import { normalizeVariants } from '../lib/variants';

const emptyForm = {
  title: '',
  category: 'furniture',
  price: '',
  stock: '',
  brand: '',
  discount_percentage: '',
  thumbnail: '',
  description: '',
  variants: [],
};

/**
 * Form tambah/edit produk. Dipakai di dalam Modal.
 * - `initialData` mengisi form untuk mode edit.
 * - `onSubmit(payload)` dipanggil saat form valid.
 */
const ProductForm = ({ initialData = null, onSubmit, onCancel, loading = false }) => {
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState('');
  // Section yang sedang terbuka (accordion). Default: info dasar.
  const [openSection, setOpenSection] = useState('basic');

  const toggleSection = (key) =>
    setOpenSection((prev) => (prev === key ? '' : key));

  useEffect(() => {
    if (initialData) {
      setForm({
        title: initialData.title ?? '',
        category: initialData.category ?? 'furniture',
        price: initialData.price ?? '',
        stock: initialData.stock ?? '',
        brand: initialData.brand ?? '',
        discount_percentage: initialData.discount_percentage ?? '',
        thumbnail: initialData.thumbnail ?? '',
        description: initialData.description ?? '',
        variants: normalizeVariants(initialData.variants),
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

  // ─── Varian ───
  const addGroup = () => {
    setForm((prev) => ({
      ...prev,
      variants: [...prev.variants, { name: '', options: [{ label: '', priceDelta: 0 }] }],
    }));
  };
  const removeGroup = (gi) => {
    setForm((prev) => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== gi),
    }));
  };
  const changeGroupName = (gi, name) => {
    setForm((prev) => ({
      ...prev,
      variants: prev.variants.map((g, i) => (i === gi ? { ...g, name } : g)),
    }));
  };
  const addOption = (gi) => {
    setForm((prev) => ({
      ...prev,
      variants: prev.variants.map((g, i) =>
        i === gi ? { ...g, options: [...g.options, { label: '', priceDelta: 0 }] } : g
      ),
    }));
  };
  const removeOption = (gi, oi) => {
    setForm((prev) => ({
      ...prev,
      variants: prev.variants.map((g, i) =>
        i === gi ? { ...g, options: g.options.filter((_, j) => j !== oi) } : g
      ),
    }));
  };
  const changeOption = (gi, oi, field, value) => {
    setForm((prev) => ({
      ...prev,
      variants: prev.variants.map((g, i) =>
        i === gi
          ? {
              ...g,
              options: g.options.map((o, j) =>
                j === oi ? { ...o, [field]: value } : o
              ),
            }
          : g
      ),
    }));
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

    onSubmit({
      title: form.title.trim(),
      category: form.category,
      price: Number(form.price),
      stock: Number(form.stock),
      brand: form.brand.trim(),
      discount_percentage:
        form.discount_percentage === '' ? 0 : Number(form.discount_percentage),
      thumbnail: form.thumbnail.trim(),
      description: form.description.trim(),
      variants: normalizeVariants(form.variants),
    });
  };

  const variantCount = form.variants.length;

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      {formError && <div style={styles.error}>{formError}</div>}

      {/* Nama produk selalu tampil (paling penting) */}
      <InputField
        label="Nama Produk"
        name="title"
        value={form.title}
        onChange={handleChange}
        placeholder="Contoh: Sofa Minimalis"
        required
      />

      {/* ── Section: Info Dasar ── */}
      <Section
        title="Info Dasar"
        subtitle="Kategori, harga, stok"
        open={openSection === 'basic'}
        onToggle={() => toggleSection('basic')}
      >
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

        <div style={styles.row}>
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
          <InputField
            label="Brand"
            name="brand"
            value={form.brand}
            onChange={handleChange}
            placeholder="Contoh: IKEA"
          />
        </div>
      </Section>

      {/* ── Section: Detail & Media ── */}
      <Section
        title="Detail & Media"
        subtitle="Thumbnail, deskripsi"
        open={openSection === 'detail'}
        onToggle={() => toggleSection('detail')}
      >
        <InputField
          label="URL Thumbnail"
          name="thumbnail"
          value={form.thumbnail}
          onChange={handleChange}
          placeholder="https://..."
        />
        {form.thumbnail.trim() && (
          <img
            src={form.thumbnail}
            alt="Preview"
            style={styles.thumbPreview}
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        )}

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
      </Section>

      {/* ── Section: Varian ── */}
      <Section
        title="Varian"
        subtitle={variantCount ? `${variantCount} grup` : 'Opsional'}
        open={openSection === 'variant'}
        onToggle={() => toggleSection('variant')}
      >
        <div style={styles.variantHead}>
          <p style={styles.variantHint}>
            Contoh grup "Warna" dengan opsi "Hitam (+0)", "Putih (+50000)".
            Selisih harga ditambahkan ke harga dasar saat dipilih.
          </p>
          <button type="button" style={styles.variantAddGroup} onClick={addGroup}>
            + Grup
          </button>
        </div>

        {form.variants.map((group, gi) => (
          <div key={gi} style={styles.variantGroup}>
            <div style={styles.variantGroupTop}>
              <input
                className="reusable-input"
                placeholder="Nama grup (mis. Warna)"
                value={group.name}
                onChange={(e) => changeGroupName(gi, e.target.value)}
                style={{ flex: 1 }}
              />
              <button
                type="button"
                style={styles.variantRemoveBtn}
                onClick={() => removeGroup(gi)}
              >
                Hapus
              </button>
            </div>

            {group.options.map((opt, oi) => (
              <div key={oi} style={styles.variantOptionRow}>
                <input
                  className="reusable-input"
                  placeholder="Opsi (mis. Hitam)"
                  value={opt.label}
                  onChange={(e) => changeOption(gi, oi, 'label', e.target.value)}
                  style={{ flex: 1 }}
                />
                <input
                  className="reusable-input"
                  type="number"
                  placeholder="Selisih harga"
                  value={opt.priceDelta}
                  onChange={(e) =>
                    changeOption(gi, oi, 'priceDelta', Number(e.target.value) || 0)
                  }
                  style={{ width: 130 }}
                />
                <button
                  type="button"
                  style={styles.variantOptionDel}
                  onClick={() => removeOption(gi, oi)}
                  title="Hapus opsi"
                >
                  ×
                </button>
              </div>
            ))}

            <button
              type="button"
              style={styles.variantAddOption}
              onClick={() => addOption(gi)}
            >
              + Opsi
            </button>
          </div>
        ))}

        {variantCount === 0 && (
          <p style={styles.variantEmpty}>Belum ada varian. Klik "+ Grup" untuk menambah.</p>
        )}
      </Section>

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

/** Section collapsible (dropdown) untuk merapikan form. */
const Section = ({ title, subtitle, open, onToggle, children }) => (
  <div style={styles.section}>
    <button type="button" style={styles.sectionHeader} onClick={onToggle}>
      <span style={styles.sectionTitle}>{title}</span>
      <span style={styles.sectionRight}>
        {subtitle && <span style={styles.sectionSubtitle}>{subtitle}</span>}
        <span style={{ ...styles.chevron, transform: open ? 'rotate(180deg)' : 'none' }}>
          ⌄
        </span>
      </span>
    </button>
    {open && <div style={styles.sectionBody}>{children}</div>}
  </div>
);

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
  section: {
    border: '1px solid #eaecf0',
    borderRadius: '10px',
    overflow: 'hidden',
  },
  sectionHeader: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    background: '#f9fafb',
    border: 'none',
    padding: '12px 14px',
    cursor: 'pointer',
    fontFamily: 'inherit',
  },
  sectionTitle: { fontSize: '14px', fontWeight: 700, color: '#101828' },
  sectionRight: { display: 'flex', alignItems: 'center', gap: '10px' },
  sectionSubtitle: { fontSize: '12px', color: '#98a2b3', fontWeight: 500 },
  chevron: { fontSize: '14px', color: '#667085', transition: 'transform 0.15s' },
  sectionBody: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
    padding: '14px',
    borderTop: '1px solid #eaecf0',
  },
  thumbPreview: {
    width: '100%',
    maxHeight: '160px',
    objectFit: 'contain',
    borderRadius: '8px',
    border: '1px solid #eaecf0',
    background: '#f9fafb',
  },
  variantEmpty: { margin: 0, fontSize: '13px', color: '#98a2b3', textAlign: 'center', padding: '8px' },
  variantHead: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: '12px',
  },
  variantHint: { margin: 0, fontSize: '12px', color: '#98a2b3', lineHeight: 1.5 },
  variantAddGroup: {
    background: '#101828',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    padding: '6px 12px',
    fontSize: '12px',
    fontWeight: 600,
    cursor: 'pointer',
  },
  variantGroup: {
    border: '1px solid #f2f4f7',
    borderRadius: '8px',
    padding: '12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    background: '#fafafa',
  },
  variantGroupTop: { display: 'flex', gap: '8px', alignItems: 'center' },
  variantOptionRow: { display: 'flex', gap: '8px', alignItems: 'center' },
  variantRemoveBtn: {
    background: '#fef3f2',
    color: '#b42318',
    border: '1px solid #fecdca',
    borderRadius: '6px',
    padding: '6px 10px',
    fontSize: '12px',
    fontWeight: 600,
    cursor: 'pointer',
  },
  variantOptionDel: {
    background: 'transparent',
    color: '#98a2b3',
    border: 'none',
    fontSize: '20px',
    cursor: 'pointer',
    lineHeight: 1,
    padding: '0 6px',
  },
  variantAddOption: {
    alignSelf: 'flex-start',
    background: 'transparent',
    color: '#101828',
    border: '1px dashed #d0d5dd',
    borderRadius: '6px',
    padding: '5px 10px',
    fontSize: '12px',
    fontWeight: 600,
    cursor: 'pointer',
  },
};

export default ProductForm;
