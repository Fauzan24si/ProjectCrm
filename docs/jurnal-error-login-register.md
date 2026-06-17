# Jurnal Error - Login & Register System

Dokumentasi error yang mungkin terjadi pada fitur Login dan Register beserta solusinya.

---

## Error #1: CORS Policy Error saat Login/Register

### 📋 Deskripsi Error
```
Access to XMLHttpRequest at 'https://qxzpbwfwmtgsfxyrthqu.supabase.co/rest/v1/users' 
from origin 'http://localhost:5173' has been blocked by CORS policy: 
Response to preflight request doesn't pass access control check
```

### 🔍 Kapan Terjadi
- Saat user mencoba login atau register
- Muncul di console browser (Network tab)
- Request ke Supabase REST API gagal

### 💡 Penyebab
1. **CORS tidak dikonfigurasi di Supabase Dashboard**
   - Origin `http://localhost:5173` belum ditambahkan ke allowed origins
   - Default Supabase hanya mengizinkan origin tertentu

2. **API Key tidak valid atau expired**
   - `VITE_SUPABASE_ANON_KEY` di `.env` salah atau sudah kadaluarsa

3. **RLS (Row Level Security) Policy terlalu ketat**
   - Policy di tabel `users` memblokir akses public

### ✅ Solusi

#### Solusi 1: Konfigurasi CORS di Supabase
```bash
1. Buka Supabase Dashboard > Settings > API
2. Scroll ke "CORS Configuration"
3. Tambahkan origin: http://localhost:5173
4. Untuk production, tambahkan domain production Anda
```

#### Solusi 2: Verifikasi API Key
```env
# File: .env
# Pastikan key ini valid dan sesuai dengan project Supabase Anda
VITE_SUPABASE_URL=https://qxzpbwfwmtgsfxyrthqu.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (key asli)
```

#### Solusi 3: Set RLS Policy yang Benar
```sql
-- Di Supabase SQL Editor
-- Policy untuk SELECT (login)
CREATE POLICY "Allow public read access for login"
ON public.users
FOR SELECT
USING (true);

-- Policy untuk INSERT (register)
CREATE POLICY "Allow public insert for registration"
ON public.users
FOR INSERT
WITH CHECK (true);
```

### 🧪 Testing
```javascript
// Test di browser console
fetch('https://qxzpbwfwmtgsfxyrthqu.supabase.co/rest/v1/users?select=id&limit=1', {
  headers: {
    'apikey': 'YOUR_ANON_KEY',
    'Authorization': 'Bearer YOUR_ANON_KEY'
  }
}).then(r => r.json()).then(console.log);
```

---

## Error #2: "Email sudah terdaftar" tetapi User Tidak Bisa Login

### 📋 Deskripsi Error
```
Error saat register: Email sudah terdaftar.
Error saat login: Email tidak ditemukan.
```

### 🔍 Kapan Terjadi
- User mencoba register dengan email yang sudah ada
- Setelah itu mencoba login tapi gagal dengan pesan "Email tidak ditemukan"
- Data terlihat di database tapi tidak bisa diakses

### 💡 Penyebab
1. **Data Inkonsistensi di Database**
   - Ada multiple records dengan email yang sama (seharusnya unique)
   - Email tersimpan dengan format berbeda (uppercase/lowercase/spasi)

2. **Case Sensitivity Issue**
   ```javascript
   // Register: email disimpan sebagai "User@Email.com"
   // Login: query mencari "user@email.com"
   // Result: Tidak match karena case berbeda
   ```

3. **RLS Policy Konflik**
   - Policy SELECT dan INSERT tidak sinkron
   - Data terinsert tapi tidak bisa di-query

### ✅ Solusi

#### Solusi 1: Normalisasi Email (Sudah Diimplementasi)
```javascript
// File: src/services/auth.js
export async function register({ name, email, password, role = 'user' }) {
  const cleanEmail = email.trim().toLowerCase(); // ✅ Sudah benar
  
  // Cek duplikasi
  const existing = await supabase.get('/users', {
    params: { email: `eq.${cleanEmail}`, select: 'id' },
  });
  
  if (existing.data && existing.data.length > 0) {
    throw new Error('Email sudah terdaftar.');
  }
  // ...
}
```

#### Solusi 2: Bersihkan Data Duplikat
```sql
-- Di Supabase SQL Editor
-- Cari email duplikat
SELECT email, COUNT(*) as total 
FROM users 
GROUP BY email 
HAVING COUNT(*) > 1;

-- Hapus duplikat (keep yang terbaru)
DELETE FROM users 
WHERE id NOT IN (
  SELECT MAX(id) 
  FROM users 
  GROUP BY LOWER(email)
);

-- Tambahkan unique constraint
ALTER TABLE users 
ADD CONSTRAINT unique_email UNIQUE (email);

-- Buat index case-insensitive
CREATE UNIQUE INDEX unique_email_lower 
ON users (LOWER(email));
```

#### Solusi 3: Update RLS Policy
```sql
-- Policy yang konsisten untuk SELECT dan INSERT
CREATE POLICY "Enable read for authentication"
ON public.users
FOR SELECT
USING (true);

CREATE POLICY "Enable insert for registration"
ON public.users
FOR INSERT
WITH CHECK (
  NOT EXISTS (
    SELECT 1 FROM users 
    WHERE LOWER(email) = LOWER(NEW.email)
  )
);
```

### 🧪 Testing
```javascript
// Test case sensitivity
const testCases = [
  'test@email.com',
  'Test@Email.com',
  'TEST@EMAIL.COM',
  ' test@email.com ',
];

testCases.forEach(async (email) => {
  const cleaned = email.trim().toLowerCase();
  console.log(`${email} => ${cleaned}`);
});
```

---

## Error #3: Network Request Failed - Timeout Error

### 📋 Deskripsi Error
```
Error saat login: Network Error
atau
Error saat register: timeout of 30000ms exceeded
```

### 🔍 Kapan Terjadi
- Request ke Supabase sangat lambat atau tidak response
- Terjadi setelah klik tombol "Sign In" atau "Sign Up"
- Loading spinner tidak berhenti
- User harus refresh halaman

### 💡 Penyebab
1. **Koneksi Internet Lambat/Terputus**
   - User offline atau koneksi tidak stabil
   - DNS resolution gagal

2. **Supabase API Down/Maintenance**
   - Status Supabase: https://status.supabase.com
   - Region-specific outage

3. **Tidak Ada Timeout Configuration di Axios**
   ```javascript
   // src/lib/supabase.js
   const supabase = axios.create({
     baseURL: `${BASE_URL}/rest/v1`,
     // ❌ Tidak ada timeout setting
   });
   ```

4. **Large Query Response**
   - Query mengambil terlalu banyak data
   - Network bandwidth terbatas

### ✅ Solusi

#### Solusi 1: Tambahkan Timeout Configuration
```javascript
// File: src/lib/supabase.js
import axios from 'axios';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
const BASE_URL = (SUPABASE_URL || '').replace(/\/+$/, '');

const supabase = axios.create({
  baseURL: `${BASE_URL}/rest/v1`,
  timeout: 15000, // ✅ 15 detik timeout
  headers: {
    apikey: SUPABASE_ANON_KEY,
    Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    'Content-Type': 'application/json',
  },
});

// ✅ Tambahkan retry logic
supabase.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config;
    
    // Retry untuk network errors (max 2 kali)
    if (error.code === 'ECONNABORTED' || error.message === 'Network Error') {
      if (!config.__retryCount) {
        config.__retryCount = 0;
      }
      
      if (config.__retryCount < 2) {
        config.__retryCount += 1;
        console.log(`Retrying request... (${config.__retryCount}/2)`);
        return supabase(config);
      }
    }
    
    return Promise.reject(error);
  }
);

export default supabase;
```

#### Solusi 2: Tambahkan Error Handling di UI
```javascript
// File: src/pages/auth/Login.jsx
const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError(false);

  try {
    const user = await login({ 
      email: dataForm.email, 
      password: dataForm.password 
    });
    navigate(user.role === 'admin' ? '/admin/dashboard' : '/member');
  } catch (err) {
    // ✅ Handle berbagai jenis error
    if (err.code === 'ECONNABORTED') {
      setError('Request timeout. Periksa koneksi internet Anda.');
    } else if (err.message === 'Network Error') {
      setError('Tidak dapat terhubung ke server. Periksa koneksi internet Anda.');
    } else {
      setError(err.response?.data?.message || err.message || 'Terjadi kesalahan saat login');
    }
  } finally {
    setLoading(false);
  }
};
```

#### Solusi 3: Implementasi Offline Detection
```javascript
// File: src/hooks/useOnlineStatus.js
import { useState, useEffect } from 'react';

export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}

// Gunakan di Login.jsx
import { useOnlineStatus } from '../../hooks/useOnlineStatus';

const Login = () => {
  const isOnline = useOnlineStatus();
  
  // Show warning jika offline
  {!isOnline && (
    <div style={styles.warning}>
      ⚠️ Anda sedang offline. Periksa koneksi internet Anda.
    </div>
  )}
  
  // Disable button saat offline
  <Button 
    type="submit" 
    variant="primary" 
    disabled={loading || !isOnline}
  >
    Sign In
  </Button>
};
```

#### Solusi 4: Optimasi Query
```javascript
// File: src/services/auth.js
export async function login({ email, password }) {
  const cleanEmail = email.trim().toLowerCase();
  const passwordHash = await hashPassword(password);

  const response = await supabase.get('/users', {
    params: {
      email: `eq.${cleanEmail}`,
      // ✅ Hanya ambil field yang diperlukan
      select: 'id,name,email,role,password',
      limit: 1, // ✅ Batasi hasil
    },
  });

  // ...
}
```

### 🧪 Testing
```javascript
// Test timeout behavior
const testTimeout = async () => {
  try {
    await axios.get('https://httpstat.us/200?sleep=20000', {
      timeout: 5000
    });
  } catch (error) {
    console.log('Error type:', error.code); // ECONNABORTED
    console.log('Timeout detected!');
  }
};

// Test offline detection
window.dispatchEvent(new Event('offline'));
// Lihat apakah UI menampilkan warning

window.dispatchEvent(new Event('online'));
// Lihat apakah warning hilang
```

---

## 📊 Summary

| Error | Severity | Frequency | Impact |
|-------|----------|-----------|--------|
| CORS Policy Error | 🔴 High | Sering di development | Blocking - user tidak bisa login/register |
| Email Duplikat | 🟡 Medium | Jarang | Confusing - data inkonsisten |
| Network Timeout | 🟠 Medium-High | Kadang | Frustrating - user harus refresh |

## 🔗 Resources
- [Supabase CORS Documentation](https://supabase.com/docs/guides/api#cors)
- [Axios Timeout Configuration](https://axios-http.com/docs/req_config)
- [PostgreSQL Case-Insensitive Queries](https://www.postgresql.org/docs/current/citext.html)
- [Supabase RLS Policies](https://supabase.com/docs/guides/auth/row-level-security)
