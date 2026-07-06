import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Client khusus untuk Supabase Auth (OAuth). Terpisah dari axios instance
// yang dipakai untuk REST API agar tidak saling interferensi.
const supabaseAuth = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export default supabaseAuth;
