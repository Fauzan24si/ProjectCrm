import supabase from '../lib/supabase';

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
