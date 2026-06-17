import axios from 'axios';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Hapus trailing slash agar base URL tidak menghasilkan path ganda (//rest/v1)
const BASE_URL = (SUPABASE_URL || '').replace(/\/+$/, '');

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  // eslint-disable-next-line no-console
  console.warn(
    '[supabase] VITE_SUPABASE_URL atau VITE_SUPABASE_ANON_KEY belum di-set. Cek file .env kamu.'
  );
}

/**
 * Axios instance untuk Supabase REST API (PostgREST).
 * Base URL: <project>/rest/v1/
 */
const supabase = axios.create({
  baseURL: `${BASE_URL}/rest/v1`,
  headers: {
    apikey: SUPABASE_ANON_KEY,
    Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    'Content-Type': 'application/json',
  },
});

export { SUPABASE_URL, SUPABASE_ANON_KEY };
export default supabase;
