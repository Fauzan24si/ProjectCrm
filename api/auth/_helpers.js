/**
 * Helper bersama untuk endpoint auth/OTP (Vercel serverless, Node runtime).
 */
import crypto from 'crypto';

/** SHA-256 hex (samakan dengan hashPassword di client services/auth.js). */
export function sha256(text) {
  return crypto.createHash('sha256').update(String(text)).digest('hex');
}

/** Base URL Supabase REST. */
export function supabaseBase() {
  return (process.env.VITE_SUPABASE_URL || '').replace(/\/+$/, '');
}

/** Header standar Supabase REST memakai anon key. */
export function supabaseHeaders(extra = {}) {
  const key = process.env.VITE_SUPABASE_ANON_KEY;
  return {
    apikey: key,
    Authorization: `Bearer ${key}`,
    'Content-Type': 'application/json',
    ...extra,
  };
}

/** Parse body request (string atau objek). */
export function parseBody(req) {
  if (!req.body) return {};
  return typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body;
}

/** Validasi format email sederhana. */
export function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || ''));
}
