# Jurnal Error - Product Management System

Dokumentasi error yang mungkin terjadi pada fitur manajemen produk (CRUD Products) beserta solusinya.

---

## Error #1: Product Image Not Loading / Broken Thumbnail

### 📋 Deskripsi Error
```
Failed to load resource: the server responded with a status of 404 (Not Found)
GET https://example.com/invalid-image.jpg net::ERR_FAILED
```

### 🔍 Kapan Terjadi
- Thumbnail produk tidak muncul di tabel produk
- Gambar error/broken image icon ditampilkan
- Console browser menunjukkan 404 error untuk URL gambar
- Terjadi saat admin menambah produk dengan URL thumbnail yang salah

### 💡 Penyebab
1. **URL Thumbnail Invalid**
   ```javascript
   // User input URL yang tidak valid
   thumbnail: "htp://broken-url.com/image.jpg"  // ❌ typo protocol
   thumbnail: "www.example.com/img.jpg"          // ❌ missing protocol
   thumbnail: ""                                  // ❌ empty string
   ```

2. **External Image URL Blocked by CORS**
   - Server gambar tidak mengizinkan cross-origin requests
   - Browser memblokir gambar dari domain yang tidak aman

3. **Image URL Expired atau Deleted**
   - URL dari temporary storage (expired links)
   - File sudah dihapus dari server hosting

4. **Tidak Ada Fallback Image**
   ```javascript
   // Tidak ada handling untuk image error
   <img src={p.thumbnail} alt={p.title} />
   ```

### ✅ Solusi

#### Solusi 1: Validasi URL Thumbnail di ProductForm
```javascript
// File: src/components/ProductForm.jsx
const handleSubmit = (e) => {
  e.preventDefault();
  setFormError('');

  // Existing validations...

  // ✅ Tambahkan validasi URL thumbnail
  if (form.thumbnail && !isValidUrl(form.thumbnail)) {
    setFormError('URL Thumbnail tidak valid. Harus dimulai dengan http:// atau https://');
    return;
  }

  onSubmit({...});
};

// Helper function untuk validasi URL
function isValidUrl(string) {
  try {
    const url = new URL(string);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch (_) {
    return false;
  }
}
```

#### Solusi 2: Tambahkan Fallback Image Component
```javascript
// File: src/components/ProductImage.jsx
import { useState } from 'react';

const ProductImage = ({ src, alt, className, fallbackSrc = '/assets/images/placeholder.png' }) => {
  const [imgSrc, setImgSrc] = useState(src);
  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    if (!hasError) {
      setHasError(true);
      setImgSrc(fallbackSrc);
    }
  };

  return (
    <img
      src={imgSrc || fallbackSrc}
      alt={alt}
      className={className}
      onError={handleError}
      loading="lazy"
    />
  );
};

export default ProductImage;
```

#### Solusi 3: Gunakan ProductImage Component di Produk.jsx
```javascript
// File: src/pages/main/Produk.jsx
import ProductImage from '../../components/ProductImage';

// Di dalam TableBody
<TableCell style={{ paddingLeft: 24 }}>
  <div className="prod-info-cell">
    <ProductImage
      src={p.thumbnail}
      alt={p.title}
      className="prod-thumb"
    />
    <span className="prod-name-text">{p.title}</span>
  </div>
</TableCell>
```

#### Solusi 4: Upload ke Supabase Storage (Best Practice)
```javascript
// File: src/services/storage.js
import supabase from '../lib/supabase';

const BUCKET_NAME = 'product-images';

/**
 * Upload image file ke Supabase Storage
 * @param {File} file - File object from input[type="file"]
 * @param {string} folder - Folder name in bucket (optional)
 * @returns {Promise<string>} Public URL of uploaded image
 */
export async function uploadProductImage(file, folder = 'products') {
  if (!file) throw new Error('No file provided');

  // Validate file type
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!validTypes.includes(file.type)) {
    throw new Error('File harus berupa gambar (JPEG, PNG, atau WebP)');
  }

  // Validate file size (max 2MB)
  const maxSize = 2 * 1024 * 1024; // 2MB
  if (file.size > maxSize) {
    throw new Error('Ukuran file maksimal 2MB');
  }

  // Generate unique filename
  const timestamp = Date.now();
  const randomStr = Math.random().toString(36).substring(2, 8);
  const ext = file.name.split('.').pop();
  const fileName = `${folder}/${timestamp}-${randomStr}.${ext}`;

  // Upload to Supabase Storage
  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false
    });

  if (error) throw error;

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(data.path);

  return publicUrl;
}

/**
 * Delete image from Supabase Storage
 */
export async function deleteProductImage(imageUrl) {
  if (!imageUrl) return;
  
  // Extract file path from URL
  const url = new URL(imageUrl);
  const path = url.pathname.split(`/storage/v1/object/public/${BUCKET_NAME}/`)[1];
  
  if (path) {
    await supabase.storage
      .from(BUCKET_NAME)
      .remove([path]);
  }
}
```

#### Solusi 5: Update ProductForm dengan File Upload
```javascript
// File: src/components/ProductForm.jsx
import { uploadProductImage } from '../services/storage';

const ProductForm = ({ initialData, onSubmit, onCancel, loading }) => {
  const [form, setForm] = useState(emptyForm);
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Show preview
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);

    // Upload to storage
    setUploading(true);
    try {
      const url = await uploadProductImage(file);
      setForm(prev => ({ ...prev, thumbnail: url }));
    } catch (err) {
      setFormError(err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Existing fields... */}

      {/* ✅ File upload field */}
      <div className="reusable-input-group">
        <label className="reusable-input-label">Gambar Produk</label>
        <input
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          onChange={handleFileChange}
          disabled={uploading || loading}
          className="reusable-input"
        />
        {uploading && <small style={{ color: '#667085' }}>Uploading...</small>}
        {imagePreview && (
          <img
            src={imagePreview}
            alt="Preview"
            style={{ width: 100, height: 100, objectFit: 'cover', borderRadius: 8, marginTop: 8 }}
          />
        )}
      </div>

      {/* Keep URL input as alternative */}
      <InputField
        label="Atau URL Thumbnail"
        name="thumbnail"
        value={form.thumbnail}
        onChange={handleChange}
        placeholder="https://..."
      />

      {/* ... */}
    </form>
  );
};
```

### 🧪 Testing
```javascript
// Test URL validation
const testUrls = [
  'https://valid-url.com/image.jpg',     // ✅ valid
  'http://valid-url.com/image.jpg',      // ✅ valid
  'www.invalid-url.com/image.jpg',       // ❌ invalid (missing protocol)
  'htp://typo-url.com/image.jpg',        // ❌ invalid (typo)
  '',                                     // ❌ invalid (empty)
];

testUrls.forEach(url => {
  console.log(`${url}: ${isValidUrl(url) ? 'VALID' : 'INVALID'}`);
});

// Test image error handling
<img
  src="https://invalid-url.com/404.jpg"
  onError={(e) => {
    console.log('Image failed to load');
    e.target.src = '/assets/images/placeholder.png';
  }}
/>
```

---

## Error #2: Product Stock Goes Negative After Multiple Orders

### 📋 Deskripsi Error
```
Product stock: -5
Warning: Stock cannot be negative
```

### 🔍 Kapan Terjadi
- Setelah beberapa order dibuat secara bersamaan
- Stock produk menjadi negatif (-1, -5, dst)
- Produk masih bisa dibeli meskipun stock habis
- Terjadi race condition saat multiple users order produk yang sama

### 💡 Penyebab
1. **No Stock Validation Saat Order**
   ```javascript
   // Tidak ada pengecekan stock sebelum order
   await createOrder({
     product_id: productId,
     quantity: 10  // ❌ Tidak cek apakah stock tersedia
   });
   ```

2. **Race Condition di Database**
   ```javascript
   // User A: Read stock = 5
   // User B: Read stock = 5 (simultan)
   // User A: Order 5 items → stock = 0
   // User B: Order 5 items → stock = -5 ❌
   ```

3. **Update Stock Tidak Atomic**
   ```javascript
   // ❌ Non-atomic operation
   const product = await getProduct(id);
   const newStock = product.stock - quantity;
   await updateProduct(id, { stock: newStock });
   ```

4. **Tidak Ada Database Constraint**
   ```sql
   -- Tidak ada CHECK constraint untuk stock
   CREATE TABLE products (
     stock INTEGER  -- ❌ bisa negatif
   );
   ```

### ✅ Solusi

#### Solusi 1: Tambahkan Stock Validation di Frontend
```javascript
// File: src/services/orders.js
export async function createOrder(payload) {
  const { product_id, quantity } = payload;

  // ✅ Validate stock availability first
  const product = await getProduct(product_id);
  
  if (!product) {
    throw new Error('Produk tidak ditemukan');
  }

  if (product.stock < quantity) {
    throw new Error(`Stok tidak cukup. Tersedia: ${product.stock}, Diminta: ${quantity}`);
  }

  // Proceed with order creation
  const order = await supabase.post('/orders', [payload], {
    headers: { Prefer: 'return=representation' },
  });

  return order.data[0];
}
```

#### Solusi 2: Database CHECK Constraint (Prevent Negative Stock)
```sql
-- Di Supabase SQL Editor
-- ✅ Tambahkan constraint untuk mencegah stock negatif
ALTER TABLE products
ADD CONSTRAINT check_stock_non_negative
CHECK (stock >= 0);

-- Test constraint
UPDATE products SET stock = -1 WHERE id = 1;
-- ERROR: new row for relation "products" violates check constraint "check_stock_non_negative"
```

#### Solusi 3: Atomic Stock Update dengan PostgreSQL Function
```sql
-- Di Supabase SQL Editor
-- ✅ Buat function untuk atomic stock decrement
CREATE OR REPLACE FUNCTION decrease_product_stock(
  product_id BIGINT,
  qty INTEGER
)
RETURNS TABLE(success BOOLEAN, message TEXT, new_stock INTEGER)
LANGUAGE plpgsql
AS $$
DECLARE
  current_stock INTEGER;
BEGIN
  -- Lock row untuk prevent race condition
  SELECT stock INTO current_stock
  FROM products
  WHERE id = product_id
  FOR UPDATE;

  -- Check if product exists
  IF NOT FOUND THEN
    RETURN QUERY SELECT FALSE, 'Produk tidak ditemukan', 0;
    RETURN;
  END IF;

  -- Check if stock sufficient
  IF current_stock < qty THEN
    RETURN QUERY SELECT FALSE, 'Stok tidak cukup', current_stock;
    RETURN;
  END IF;

  -- Update stock atomically
  UPDATE products
  SET stock = stock - qty
  WHERE id = product_id;

  RETURN QUERY SELECT TRUE, 'Stok berhasil dikurangi', current_stock - qty;
END;
$$;

-- Cara pakai:
SELECT * FROM decrease_product_stock(1, 5);
```

#### Solusi 4: Implementasi di Backend Service
```javascript
// File: src/services/products.js

/**
 * Decrease product stock atomically
 * @param {number} productId - Product ID
 * @param {number} quantity - Quantity to decrease
 * @returns {Promise<{success: boolean, message: string, newStock: number}>}
 */
export async function decreaseProductStock(productId, quantity) {
  const res = await supabase.rpc('decrease_product_stock', {
    product_id: productId,
    qty: quantity,
  });

  const result = res.data[0];
  
  if (!result.success) {
    throw new Error(result.message);
  }

  return result;
}

// Update createOrder function
export async function createOrder(payload) {
  const { product_id, quantity } = payload;

  try {
    // ✅ Atomic stock decrease
    await decreaseProductStock(product_id, quantity);

    // Create order
    const order = await supabase.post('/orders', [payload], {
      headers: { Prefer: 'return=representation' },
    });

    return order.data[0];
  } catch (error) {
    throw new Error(`Gagal membuat order: ${error.message}`);
  }
}
```

#### Solusi 5: Real-time Stock Warning di UI
```javascript
// File: src/pages/main/Produk.jsx
import { useEffect } from 'react';

function Produk() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    // ✅ Subscribe to real-time stock changes
    const subscription = supabase
      .from('products')
      .on('UPDATE', (payload) => {
        const updated = payload.new;
        
        // Update local state
        setProducts(prev =>
          prev.map(p => p.id === updated.id ? updated : p)
        );

        // Show warning if stock is low
        if (updated.stock < 10 && updated.stock > 0) {
          showNotification(`⚠️ Stock ${updated.title} tinggal ${updated.stock}`);
        }

        // Show alert if stock is 0
        if (updated.stock === 0) {
          showNotification(`🚨 Stock ${updated.title} habis!`, 'error');
        }
      })
      .subscribe();

    return () => subscription.unsubscribe();
  }, []);

  return (
    <Table>
      {/* ... */}
      <TableCell className={p.stock < 10 ? 'low-stock' : ''}>
        {p.stock}
        {p.stock === 0 && <span className="badge-out-of-stock">Habis</span>}
        {p.stock > 0 && p.stock < 10 && <span className="badge-low-stock">Stok Rendah</span>}
      </TableCell>
    </Table>
  );
}
```

### 🧪 Testing
```javascript
// Test race condition scenario
async function testRaceCondition() {
  const productId = 1;
  const quantity = 5;

  // Simulate 10 concurrent orders
  const promises = Array(10).fill(null).map(() =>
    createOrder({ product_id: productId, quantity })
  );

  try {
    await Promise.all(promises);
  } catch (error) {
    console.log('Expected error:', error.message);
  }

  // Check final stock
  const product = await getProduct(productId);
  console.log('Final stock:', product.stock);
  console.assert(product.stock >= 0, 'Stock should never be negative!');
}
```

---

## Error #3: Membership Tier Not Updating After Purchase

### 📋 Deskripsi Error
```
User total_spent: Rp 1,500,000
Expected membership: Silver
Actual membership: Bronze ❌
```

### 🔍 Kapan Terjadi
- User melakukan pembelian dan `total_spent` bertambah
- Tapi badge membership masih menampilkan tier lama
- Di database `total_spent` sudah update tapi `membership` column tidak berubah
- Badge baru muncul setelah user logout-login atau refresh halaman

### 💡 Penyebab
1. **Membership Column Tidak Auto-Update**
   ```javascript
   // ❌ Update total_spent tanpa update membership
   await updateUser(userId, {
     total_spent: newTotalSpent
   });
   // Column membership di database masih 'bronze'
   ```

2. **Frontend State Tidak Sync dengan Database**
   ```javascript
   // State lokal tidak update setelah purchase
   const [user, setUser] = useState(getCurrentUser());
   // Masih pakai data lama dari localStorage
   ```

3. **Membership Calculation Logic Tidak Konsisten**
   ```javascript
   // services/users.js
   function withMembership(user) {
     return { ...user, membership: getMembership(user.total_spent) };
   }

   // Tapi di database, column membership tidak ikut update
   ```

4. **Race Condition: Read Before Update**
   ```javascript
   // Order completed → update total_spent
   // Meanwhile, user profile page masih read data lama
   ```

### ✅ Solusi

#### Solusi 1: Database Trigger untuk Auto-Update Membership
```sql
-- Di Supabase SQL Editor
-- ✅ Buat function untuk calculate membership
CREATE OR REPLACE FUNCTION calculate_membership(total NUMERIC)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
BEGIN
  IF total >= 2000000 THEN
    RETURN 'gold';
  ELSIF total >= 500000 THEN
    RETURN 'silver';
  ELSE
    RETURN 'bronze';
  END IF;
END;
$$;

-- ✅ Buat trigger untuk auto-update membership saat total_spent berubah
CREATE OR REPLACE FUNCTION update_membership_on_total_spent_change()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.membership := calculate_membership(NEW.total_spent);
  RETURN NEW;
END;
$$;

-- Attach trigger ke table users
CREATE TRIGGER trigger_update_membership
BEFORE INSERT OR UPDATE OF total_spent
ON users
FOR EACH ROW
EXECUTE FUNCTION update_membership_on_total_spent_change();

-- Test trigger
UPDATE users SET total_spent = 1500000 WHERE id = 1;
SELECT name, total_spent, membership FROM users WHERE id = 1;
-- membership should be 'silver' now
```

#### Solusi 2: Update Frontend State After Purchase
```javascript
// File: src/services/orders.js
import { getCurrentUser, setCurrentUser } from './auth';
import { getUser } from './users';

export async function completeOrder(orderId, userId) {
  // Process order payment...
  await supabase.patch('/orders', { status: 'completed' }, {
    params: { id: `eq.${orderId}` }
  });

  // ✅ Fetch updated user data (with new total_spent & membership)
  const updatedUser = await getUser(userId);

  // ✅ Update localStorage if this is current user
  const currentUser = getCurrentUser();
  if (currentUser && currentUser.id === userId) {
    setCurrentUser(updatedUser);
  }

  return updatedUser;
}
```

#### Solusi 3: Real-time Membership Badge Update
```javascript
// File: src/components/MembershipBadge.jsx
import { useEffect, useState } from 'react';
import { getMembershipMeta } from '../lib/membership';
import { getCurrentUser } from '../services/auth';

const MembershipBadge = ({ userId }) => {
  const [membership, setMembership] = useState('bronze');

  useEffect(() => {
    // Initial load
    const user = getCurrentUser();
    if (user) {
      setMembership(user.membership || 'bronze');
    }

    // ✅ Subscribe to user changes in real-time
    const subscription = supabase
      .from(`users:id=eq.${userId}`)
      .on('UPDATE', (payload) => {
        const updatedUser = payload.new;
        setMembership(updatedUser.membership);
        
        // Show notification on tier upgrade
        const currentUser = getCurrentUser();
        if (currentUser && currentUser.membership !== updatedUser.membership) {
          showNotification(`🎉 Selamat! Anda naik ke tier ${updatedUser.membership.toUpperCase()}!`);
        }

        // Update localStorage
        setCurrentUser(updatedUser);
      })
      .subscribe();

    return () => subscription.unsubscribe();
  }, [userId]);

  const meta = getMembershipMeta(membership);

  return (
    <span
      style={{
        background: meta.bg,
        color: meta.color,
        padding: '4px 12px',
        borderRadius: '12px',
        fontSize: '12px',
        fontWeight: '600',
      }}
    >
      {meta.label}
    </span>
  );
};

export default MembershipBadge;
```

#### Solusi 4: Force Refresh User Data Setelah Action
```javascript
// File: src/hooks/useCurrentUser.js
import { useState, useEffect } from 'react';
import { getCurrentUser } from '../services/auth';
import { getUser } from '../services/users';

export function useCurrentUser() {
  const [user, setUser] = useState(getCurrentUser());
  const [loading, setLoading] = useState(false);

  const refreshUser = async () => {
    const currentUser = getCurrentUser();
    if (!currentUser) return;

    setLoading(true);
    try {
      // ✅ Fetch fresh data from server
      const freshUser = await getUser(currentUser.id);
      setUser(freshUser);
      setCurrentUser(freshUser); // Update localStorage
    } catch (error) {
      console.error('Failed to refresh user:', error);
    } finally {
      setLoading(false);
    }
  };

  // Auto-refresh on mount
  useEffect(() => {
    refreshUser();
  }, []);

  return { user, loading, refreshUser };
}

// Usage in component
import { useCurrentUser } from '../../hooks/useCurrentUser';

function UserProfile() {
  const { user, refreshUser } = useCurrentUser();

  const handlePurchase = async () => {
    await completeOrder(orderId);
    await refreshUser(); // ✅ Force refresh user data
  };

  return (
    <div>
      <MembershipBadge membership={user.membership} />
      <p>Total Spent: {formatRupiah(user.total_spent)}</p>
    </div>
  );
}
```

#### Solusi 5: API Endpoint untuk Recalculate All Memberships
```sql
-- Di Supabase SQL Editor
-- ✅ Function untuk recalculate semua membership (maintenance)
CREATE OR REPLACE FUNCTION recalculate_all_memberships()
RETURNS TABLE(updated_count INTEGER)
LANGUAGE plpgsql
AS $$
DECLARE
  count INTEGER := 0;
BEGIN
  UPDATE users
  SET membership = calculate_membership(total_spent);

  GET DIAGNOSTICS count = ROW_COUNT;
  RETURN QUERY SELECT count;
END;
$$;

-- Run manually untuk fix data inconsistency
SELECT * FROM recalculate_all_memberships();
```

```javascript
// File: src/services/admin.js
export async function recalculateAllMemberships() {
  const res = await supabase.rpc('recalculate_all_memberships');
  return res.data[0].updated_count;
}

// Usage in admin panel
<Button onClick={async () => {
  const count = await recalculateAllMemberships();
  alert(`${count} user memberships updated`);
}}>
  Recalculate All Memberships
</Button>
```

### 🧪 Testing
```javascript
// Test membership calculation
const testCases = [
  { total_spent: 0, expected: 'bronze' },
  { total_spent: 499999, expected: 'bronze' },
  { total_spent: 500000, expected: 'silver' },
  { total_spent: 1500000, expected: 'silver' },
  { total_spent: 2000000, expected: 'gold' },
  { total_spent: 5000000, expected: 'gold' },
];

testCases.forEach(({ total_spent, expected }) => {
  const result = getMembership(total_spent);
  console.assert(
    result === expected,
    `Expected ${expected} for ${total_spent}, got ${result}`
  );
});

// Test trigger
UPDATE users SET total_spent = 1500000 WHERE id = 1;
SELECT membership FROM users WHERE id = 1;
-- Should return 'silver'
```

---

## 📊 Summary

| Error | Severity | Frequency | Impact |
|-------|----------|-----------|--------|
| Broken Product Images | 🟡 Medium | Sering | Bad UX - produk tidak menarik |
| Negative Stock | 🔴 High | Jarang (race condition) | Critical - data corruption |
| Membership Not Updating | 🟠 Medium | Kadang | Confusing - user tidak dapat reward |

## 🔗 Resources
- [Supabase Storage Documentation](https://supabase.com/docs/guides/storage)
- [PostgreSQL CHECK Constraints](https://www.postgresql.org/docs/current/ddl-constraints.html)
- [PostgreSQL Triggers](https://www.postgresql.org/docs/current/sql-createtrigger.html)
- [Atomic Operations Best Practices](https://www.postgresql.org/docs/current/transaction-iso.html)
- [Supabase Realtime](https://supabase.com/docs/guides/realtime)
