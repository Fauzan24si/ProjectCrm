import supabase from '../lib/supabase';
import supabaseAuth from '../lib/supabaseAuth';

const STORAGE_KEY = 'auth_user';
export async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Registrasi user baru.
 * @returns {Promise<object>} user yang baru dibuat (tanpa password)
 */
export async function register({ name, email, password, role = 'user' }) {
  const cleanEmail = email.trim().toLowerCase();

  // Cek apakah email sudah terdaftar
  const existing = await supabase.get('/users', {
    params: { email: `eq.${cleanEmail}`, select: 'id' },
  });
  if (existing.data && existing.data.length > 0) {
    throw new Error('Email sudah terdaftar.');
  }

  const passwordHash = await hashPassword(password);

  const response = await supabase.post(
    '/users',
    [{ name, email: cleanEmail, password: passwordHash, role, total_spent: 0, membership: 'bronze' }],
    { headers: { Prefer: 'return=representation' } }
  );

  const user = Array.isArray(response.data) ? response.data[0] : response.data;
  return sanitizeUser(user);
}

/**
 * Login user dengan email + password.
 * @returns {Promise<object>} user yang sudah login (tanpa password)
 */
export async function login({ email, password }) {
  const cleanEmail = email.trim().toLowerCase();
  const passwordHash = await hashPassword(password);

  const response = await supabase.get('/users', {
    params: {
      email: `eq.${cleanEmail}`,
      select: 'id,name,email,role,password,created_at',
    },
  });

  const found = response.data && response.data[0];
  if (!found) {
    throw new Error('Email tidak ditemukan.');
  }
  if (found.password !== passwordHash) {
    throw new Error('Password salah.');
  }

  const user = sanitizeUser(found);
  setCurrentUser(user);
  return user;
}

/**
 * Kirim OTP registrasi ke email (via serverless /api/auth/send-otp -> Resend).
 * @param {string} email
 */
export async function sendRegisterOtp(email) {
  const res = await fetch('/api/auth/send-otp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: email.trim().toLowerCase() }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || 'Gagal mengirim OTP.');
  }
  return data;
}

/**
 * Verifikasi OTP & buat akun (via serverless /api/auth/verify-otp).
 * Setelah sukses, user otomatis di-set sebagai sesi login.
 * @returns {Promise<object>} user (tanpa password)
 */
export async function verifyRegisterOtp({ name, email, password, otp }) {
  const res = await fetch('/api/auth/verify-otp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password,
      otp,
    }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || 'Verifikasi OTP gagal.');
  }
  return sanitizeUser(data.user);
}

/**
 * Logout: hapus sesi lokal.
 */
export function logout() {
  localStorage.removeItem(STORAGE_KEY);
}

/**
 * Ambil user yang sedang login dari localStorage.
 */
export function getCurrentUser() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setCurrentUser(user) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
}

export function isAuthenticated() {
  return !!getCurrentUser();
}

/** Buang field password sebelum dipakai/disimpan di client. */
function sanitizeUser(user) {
  if (!user) return user;
  // eslint-disable-next-line no-unused-vars
  const { password, ...rest } = user;
  return rest;
}

/**
 * Mulai Google OAuth flow via Supabase.
 * Redirect ke Google login, lalu kembali ke /auth/callback.
 */
export async function loginWithGoogle() {
  const { error } = await supabaseAuth.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  });
  if (error) throw new Error(error.message);
}

/**
 * Dipanggil di halaman /auth/callback setelah redirect dari Google.
 * Ambil session Supabase, cek/buat user di tabel users, lalu set sesi lokal.
 * @returns {Promise<object>} user
 */
export async function handleOAuthCallback() {
  const { data: { session }, error } = await supabaseAuth.auth.getSession();
  if (error || !session) throw new Error('Gagal mendapatkan sesi OAuth.');

  const { user: oauthUser } = session;
  const email = oauthUser.email.toLowerCase();
  const name = oauthUser.user_metadata?.full_name || oauthUser.user_metadata?.name || email.split('@')[0];

  // Cek apakah user sudah ada di tabel users
  const existing = await supabase.get('/users', {
    params: { email: `eq.${email}`, select: 'id,name,email,role,created_at,membership,total_spent' },
  });

  let user;
  if (existing.data && existing.data.length > 0) {
    user = existing.data[0];
  } else {
    // Buat user baru tanpa password (oauth user)
    const response = await supabase.post(
      '/users',
      [{ name, email, password: '', role: 'user', total_spent: 0, membership: 'bronze' }],
      { headers: { Prefer: 'return=representation' } }
    );
    user = Array.isArray(response.data) ? response.data[0] : response.data;
  }

  const sanitized = sanitizeUser(user);
  setCurrentUser(sanitized);
  return sanitized;
}
