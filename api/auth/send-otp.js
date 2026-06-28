/**
 * Vercel Serverless Function: kirim OTP registrasi ke email via Resend.
 *
 * Alur:
 *  1. Client kirim { email }.
 *  2. Validasi email & cek email belum terdaftar di tabel users.
 *  3. Generate OTP 6 digit, simpan HASH-nya ke tabel email_otps (expire 10 menit).
 *  4. Kirim email berisi OTP lewat Resend API.
 *
 * Env yang dipakai (set di .env dev & Vercel):
 *   RESEND_API_KEY           - API key Resend (rahasia)
 *   RESEND_FROM              - alamat pengirim terverifikasi, mis. "FurniCRM <noreply@domain.com>"
 *   VITE_SUPABASE_URL        - URL Supabase
 *   VITE_SUPABASE_ANON_KEY   - anon key Supabase
 */
import {
  sha256,
  supabaseBase,
  supabaseHeaders,
  parseBody,
  isValidEmail,
} from './_helpers.js';

const OTP_TTL_MINUTES = 10;

async function emailExists(email) {
  const url = `${supabaseBase()}/rest/v1/users?email=eq.${encodeURIComponent(
    email
  )}&select=id`;
  const res = await fetch(url, { headers: supabaseHeaders() });
  if (!res.ok) return false;
  const rows = await res.json();
  return Array.isArray(rows) && rows.length > 0;
}

async function storeOtp(email, code) {
  const base = supabaseBase();
  const headers = supabaseHeaders();

  // Hapus OTP lama untuk email ini (purpose register) agar tidak menumpuk.
  await fetch(
    `${base}/rest/v1/email_otps?email=eq.${encodeURIComponent(
      email
    )}&purpose=eq.register`,
    { method: 'DELETE', headers }
  );

  const expiresAt = new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000).toISOString();
  const res = await fetch(`${base}/rest/v1/email_otps`, {
    method: 'POST',
    headers: { ...headers, Prefer: 'return=minimal' },
    body: JSON.stringify([
      {
        email,
        otp_hash: sha256(code),
        purpose: 'register',
        expires_at: expiresAt,
      },
    ]),
  });
  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`Gagal menyimpan OTP (${res.status}): ${detail}`);
  }
}

async function sendEmail(email, code) {
  const apiKey = process.env.RESEND_API_KEY;
  const from =
    process.env.RESEND_FROM ||
    process.env.EMAIL_FROM ||
    'FurniCRM <onboarding@resend.dev>';

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: [email],
      subject: `Kode verifikasi FurniCRM: ${code}`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;padding:24px;">
          <h2 style="color:#101828;margin:0 0 8px;">Verifikasi Email Anda</h2>
          <p style="color:#475467;font-size:14px;line-height:1.6;margin:0 0 20px;">
            Gunakan kode berikut untuk menyelesaikan registrasi akun FurniCRM Anda.
            Kode berlaku selama ${OTP_TTL_MINUTES} menit.
          </p>
          <div style="font-size:34px;font-weight:700;letter-spacing:10px;color:#101828;
                      background:#f2f4f7;border-radius:12px;padding:18px;text-align:center;">
            ${code}
          </div>
          <p style="color:#98a2b3;font-size:12px;margin:20px 0 0;">
            Jika Anda tidak meminta kode ini, abaikan email ini.
          </p>
        </div>
      `,
    }),
  });

  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`Gagal mengirim email (${res.status}): ${detail}`);
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  if (!process.env.RESEND_API_KEY) {
    return res
      .status(500)
      .json({ error: 'Konfigurasi email belum lengkap. Set RESEND_API_KEY.' });
  }

  try {
    const { email } = parseBody(req);
    const cleanEmail = String(email || '').trim().toLowerCase();

    if (!isValidEmail(cleanEmail)) {
      return res.status(400).json({ error: 'Format email tidak valid.' });
    }
    if (await emailExists(cleanEmail)) {
      return res.status(409).json({ error: 'Email sudah terdaftar.' });
    }

    // OTP 6 digit (100000-999999).
    const code = String(Math.floor(100000 + Math.random() * 900000));

    await storeOtp(cleanEmail, code);
    await sendEmail(cleanEmail, code);

    return res.status(200).json({ ok: true, message: 'OTP terkirim ke email.' });
  } catch (err) {
    return res.status(500).json({ error: `Gagal mengirim OTP: ${err.message}` });
  }
}
