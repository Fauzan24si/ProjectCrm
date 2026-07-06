-- ============================================================================
-- MIGRASI: Voucher & Point Redemption (Furniture)
-- ----------------------------------------------------------------------------
-- Jalankan di Supabase Dashboard > SQL Editor SEBELUM memakai fitur React.
-- IDEMPOTEN & NON-DESTRUKTIF:
--   - ADD COLUMN IF NOT EXISTS
--   - CREATE TABLE IF NOT EXISTS
-- Urutan aman terhadap FK: vouchers & user_vouchers dibuat dulu, baru
-- ALTER TABLE orders yang mereferensikan user_vouchers.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Kolom tambahan pada users
-- ----------------------------------------------------------------------------
alter table public.users
  add column if not exists points integer not null default 0;  -- saldo point member

-- ----------------------------------------------------------------------------
-- 2. Tabel vouchers (katalog voucher redeemable)
-- ----------------------------------------------------------------------------
create table if not exists public.vouchers (
  id              bigint generated always as identity primary key,
  code            text not null unique,
  title           text not null,
  description     text,
  discount_type   text not null default 'fixed',   -- 'fixed' | 'percentage'
  discount_value  numeric not null default 0,
  max_discount    numeric,                          -- batas potongan utk percentage (nullable)
  min_purchase    numeric not null default 0,
  point_cost      integer not null default 0,
  stock           integer,                          -- null = tak terbatas
  is_active       boolean not null default true,
  valid_until     timestamptz,                      -- null = tanpa batas
  created_at      timestamptz not null default now()
);

create index if not exists idx_vouchers_is_active on public.vouchers (is_active);

-- ----------------------------------------------------------------------------
-- 3. Tabel user_vouchers (voucher milik user setelah redeem)
-- ----------------------------------------------------------------------------
create table if not exists public.user_vouchers (
  id          bigint generated always as identity primary key,
  user_id     bigint references public.users(id) on delete cascade,
  voucher_id  bigint references public.vouchers(id) on delete cascade,
  status      text not null default 'active',       -- 'active' | 'used' | 'expired'
  redeemed_at timestamptz not null default now(),
  used_at     timestamptz,
  order_id    bigint references public.orders(id) on delete set null
);

create index if not exists idx_user_vouchers_user_id on public.user_vouchers (user_id);
create index if not exists idx_user_vouchers_voucher_id on public.user_vouchers (voucher_id);
create index if not exists idx_user_vouchers_status on public.user_vouchers (status);

-- ----------------------------------------------------------------------------
-- 4. Tabel point_transactions (ledger point)
-- ----------------------------------------------------------------------------
create table if not exists public.point_transactions (
  id          bigint generated always as identity primary key,
  user_id     bigint references public.users(id) on delete cascade,
  amount      integer not null,                     -- positif = earn, negatif = redeem
  type        text not null,                        -- 'earn' | 'redeem'
  description text,
  created_at  timestamptz not null default now()
);

create index if not exists idx_point_transactions_user_id on public.point_transactions (user_id);

-- ----------------------------------------------------------------------------
-- 5. Kolom tambahan pada orders (potongan voucher) — SETELAH user_vouchers ada
-- ----------------------------------------------------------------------------
alter table public.orders
  add column if not exists discount_amount numeric not null default 0;

alter table public.orders
  add column if not exists user_voucher_id bigint references public.user_vouchers(id) on delete set null;

-- ----------------------------------------------------------------------------
-- 6. Row Level Security (mengikuti pola DEMO existing: akses publik anon key)
--    CATATAN KEAMANAN: TIDAK aman untuk produksi (siapa pun dengan anon key
--    bisa baca/tulis). Untuk produksi perketat policy / pindah ke backend.
-- ----------------------------------------------------------------------------
alter table public.vouchers           enable row level security;
alter table public.user_vouchers      enable row level security;
alter table public.point_transactions enable row level security;

drop policy if exists "demo vouchers access" on public.vouchers;
create policy "demo vouchers access" on public.vouchers
  for all using (true) with check (true);

drop policy if exists "demo user_vouchers access" on public.user_vouchers;
create policy "demo user_vouchers access" on public.user_vouchers
  for all using (true) with check (true);

drop policy if exists "demo point_transactions access" on public.point_transactions;
create policy "demo point_transactions access" on public.point_transactions
  for all using (true) with check (true);

-- ----------------------------------------------------------------------------
-- 7. Seed contoh voucher (hanya bila tabel masih kosong)
-- ----------------------------------------------------------------------------
insert into public.vouchers
  (code, title, description, discount_type, discount_value, max_discount, min_purchase, point_cost, stock, is_active)
select * from (values
  ('DISC50K', 'Potongan Rp50.000', 'Diskon langsung Rp50.000 tanpa minimal khusus.',
   'fixed', 50000, null, 100000, 100, 100, true),
  ('PROMO10', 'Diskon 10%', 'Potongan 10% maksimal Rp100.000.',
   'percentage', 10, 100000, 200000, 200, 50, true),
  ('HEMAT25K', 'Potongan Rp25.000', 'Diskon Rp25.000 untuk pembelian apa pun.',
   'fixed', 25000, null, 0, 50, null, true)
) as seed(code, title, description, discount_type, discount_value, max_discount, min_purchase, point_cost, stock, is_active)
where not exists (select 1 from public.vouchers);
