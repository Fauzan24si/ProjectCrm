/**
 * Vercel Serverless Function: verifikasi OTP & buat akun user.
 *
 * Alur:
 *  1. Client kirim { name, email, password, otp }.
 *  2. Ambil OTP terbaru untuk email (purpose register), cek expire & attempts.
 *  3. Cocokkan hash OTP. Bila benar -> buat user di tabel users, hapus OTP.
 *
 * Password di-hash SHA-256 (sama seperti client services/auth.js) agar login
 * yang sudah ada tetap kompatibel.
 *
 * Env: RESEND_*, VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY.
 */
import {
  sha256,
  supabaseBase,
  supabaseHeaders,
  parseBody,
  isValidEmail,
} from './_helpers.js';

const MAX_ATTEMPTS = 5;

async function getLatestOtp(email) {
  const url =
    `${supabaseBase()}/rest/v1/email_otps?email=eq.${encodeURIComponent(email)}` +
    `&purpose=eq.register&order=created_at.desc&limit=1`;
  const res = await fetch(url, { headers: supabaseHeaders() });
  if (!res.ok) return null;
  const rows = await res.json();
  return Array.isArray(rows) && rows[0] ? rows[0] : null;
}

async function bumpAttempts(id, attempts) {
  await fetch(`${supabaseBase()}/rest/v1/email_otps?id=eq.${id}`, {
    method: 'PATCH',
    headers: { ...supabaseHeaders(), Prefer: 'return=minimal' },
    body: JSON.stringify({ attempts: attempts + 1 }),
  });
}

async function deleteOtpsFor(email) {
  await fetch(
    `${supabaseBase()}/rest/v1/email_otps?email=eq.${encodeURIComponent(
      email
    )}&purpose=eq.register`,
    { method: 'DELETE', headers: supabaseHeaders() }
  );
}

async function emailExists(email) {
  const url = `${supabaseBase()}/rest/v1/users?email=eq.${encodeURIComponent(
    email
  )}&select=id`;
  const res = await fetch(url, { headers: supabaseHeaders() });
  if (!res.ok) return false;
  const rows = await res.json();
  return Array.isArray(rows) && rows.length > 0;
}

async function createUser({ name, email, passwordHash }) {
  const res = await fetch(`${supabaseBase()}/rest/v1/users`, {
    method: 'POST',
    headers: { ...supabaseHeaders(), Prefer: 'return=representation' },
    body: JSON.stringify([
      {
        name,
        email,
        password: passwordHash,
        role: 'user',
        total_spent: 0,
        membership: 'bronze',
      },
    ]),
  });
  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`Gagal membuat akun (${res.status}): ${detail}`);
  }
  const rows = await res.json();
  const user = Array.isArray(rows) ? rows[0] : rows;
  // Jangan kembalikan password.
  if (user && user.password) delete user.password;
  return user;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { name, email, password, otp } = parseBody(req);
    const cleanEmail = String(email || '').trim().toLowerCase();
    const code = String(otp || '').replace(/\D/g, '');

    if (!name || !isValidEmail(cleanEmail) || !password) {
      return res.status(400).json({ error: 'Data registrasi tidak lengkap.' });
    }
    if (code.length !== 6) {
      return res.status(400).json({ error: 'Kode OTP harus 6 digit.' });
    }
    if (await emailExists(cleanEmail)) {
      return res.status(409).json({ error: 'Email sudah terdaftar.' });
    }

    const record = await getLatestOtp(cleanEmail);
    if (!record) {
      return res.status(400).json({ error: 'OTP tidak ditemukan. Minta kode baru.' });
    }
    if (new Date(record.expires_at).getTime() < Date.now()) {
      await deleteOtpsFor(cleanEmail);
      return res.status(400).json({ error: 'OTP kedaluwarsa. Minta kode baru.' });
    }
    if (Number(record.attempts) >= MAX_ATTEMPTS) {
      await deleteOtpsFor(cleanEmail);
      return res
        .status(429)
        .json({ error: 'Terlalu banyak percobaan. Minta kode baru.' });
    }
    if (record.otp_hash !== sha256(code)) {
      await bumpAttempts(record.id, Number(record.attempts) || 0);
      return res.status(400).json({ error: 'Kode OTP salah.' });
    }

    // OTP valid -> buat user, lalu bersihkan OTP.
    const user = await createUser({
      name: String(name).trim(),
      email: cleanEmail,
      passwordHash: sha256(password),
    });
    await deleteOtpsFor(cleanEmail);

    return res.status(200).json({ ok: true, user });
  } catch (err) {
    return res.status(500).json({ error: `Verifikasi gagal: ${err.message}` });
  }
}
