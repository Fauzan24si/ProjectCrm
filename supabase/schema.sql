-- ============================================================================
-- FurniCRM — SKEMA DATABASE MASTER (Supabase / PostgreSQL)
-- ============================================================================
-- Jalankan SELURUH file ini di Supabase Dashboard > SQL Editor > New query > Run.
--
-- File ini membuat ULANG seluruh database secara bersih dan berurutan:
--   1. users
--   2. products
--   3. wishlists      (user_id -> users, product_id -> products)
--   4. orders         (user_id -> users, null = guest)
--   5. order_items    (order_id -> orders, product_id -> products)
--
-- PERINGATAN: bagian DROP di bawah akan MENGHAPUS tabel beserta datanya.
-- Hapus / komentari blok DROP bila Anda tidak ingin kehilangan data lama.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 0. Bersihkan tabel lama (urutan terbalik karena foreign key).
-- ----------------------------------------------------------------------------
drop table if exists public.order_items cascade;
drop table if exists public.orders cascade;
drop table if exists public.wishlists cascade;
drop table if exists public.products cascade;
drop table if exists public.users cascade;

-- ----------------------------------------------------------------------------
-- 1. USERS
--    Dipakai: services/auth.js, services/users.js
--    Catatan: membership ikut disimpan, tapi selalu dihitung ulang dari
--    total_spent di sisi aplikasi (lib/membership.js).
-- ----------------------------------------------------------------------------
create table public.users (
  id          bigint generated always as identity primary key,
  name        text not null,
  email       text not null unique,
  password    text not null,                 -- SHA-256 hash (lihat auth.js)
  role        text not null default 'user',  -- 'user' | 'admin'
  phone       text,
  gender      text,                          -- 'male' | 'female' | null
  age         integer,
  image       text,
  address     text,                          -- alamat pengiriman default
  total_spent numeric not null default 0,    -- akumulasi transaksi (Rupiah)
  membership  text not null default 'bronze',-- 'bronze' | 'silver' | 'gold'
  created_at  timestamptz not null default now()
);

create index idx_users_email on public.users (email);
create index idx_users_role on public.users (role);

-- ----------------------------------------------------------------------------
-- 2. PRODUCTS
--    Dipakai: services/products.js, Shop.jsx (discount_percentage)
-- ----------------------------------------------------------------------------
create table public.products (
  id                  bigint generated always as identity primary key,
  title               text not null,
  category            text,
  price               numeric not null default 0,
  stock               integer not null default 0,
  brand               text,
  description         text,
  thumbnail           text,
  discount_percentage numeric default 0,
  variants            jsonb default '[]'::jsonb,  -- grup varian: [{name, options:[{label, priceDelta}]}]
  created_at          timestamptz not null default now()
);

create index idx_products_category on public.products (category);
create index idx_products_created_at on public.products (created_at desc);

-- ----------------------------------------------------------------------------
-- 3. WISHLISTS
--    Dipakai: services/wishlist.js (embedded select products(*))
-- ----------------------------------------------------------------------------
create table public.wishlists (
  id          bigint generated always as identity primary key,
  user_id     bigint not null references public.users(id) on delete cascade,
  product_id  bigint not null references public.products(id) on delete cascade,
  created_at  timestamptz not null default now(),
  unique (user_id, product_id)
);

create index idx_wishlists_user_id on public.wishlists (user_id);
create index idx_wishlists_product_id on public.wishlists (product_id);

-- ----------------------------------------------------------------------------
-- 4. ORDERS  (header transaksi)
--    Dipakai: services/orders.js, api/midtrans/token.js, api/midtrans/notification.js
--    user_id NULL = pembelian oleh guest (tidak dapat poin).
--    status: 'pending' (default) | 'paid' | 'failed'
-- ----------------------------------------------------------------------------
create table public.orders (
  id             bigint generated always as identity primary key,
  order_number   text not null unique,            -- = order_id Midtrans
  user_id        bigint references public.users(id) on delete set null,
  customer_name  text,
  customer_email text,
  gross_amount   numeric not null default 0,
  status         text not null default 'pending', -- pending | paid | failed
  payment_type   text,                            -- mis. 'qris', 'bank_transfer'
  shipping_address text,                          -- alamat pengiriman penerima
  recipient_phone  text,                          -- no HP penerima
  track_pin        text,                          -- 4 digit terakhir no HP (PIN lacak guest)
  invoice_sent_at  timestamptz,                   -- waktu email invoice terkirim (idempotensi)
  snap_token     text,                            -- token Snap untuk lanjut bayar
  created_at     timestamptz not null default now()
);

create index idx_orders_user_id on public.orders (user_id);
create index idx_orders_status on public.orders (status);
create index idx_orders_created_at on public.orders (created_at desc);

-- ----------------------------------------------------------------------------
-- 5. ORDER_ITEMS  (rincian item per order)
--    Dipakai: services/orders.js, api/midtrans/token.js
-- ----------------------------------------------------------------------------
create table public.order_items (
  id         bigint generated always as identity primary key,
  order_id   bigint not null references public.orders(id) on delete cascade,
  product_id bigint references public.products(id) on delete set null,
  title      text,
  variant    text,                          -- label varian yang dipilih, mis. "Warna: Biru, Ukuran: L"
  price      numeric not null default 0,
  qty        integer not null default 1
);

create index idx_order_items_order_id on public.order_items (order_id);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ----------------------------------------------------------------------------
-- Aplikasi memanggil Supabase REST langsung dari client memakai ANON KEY,
-- jadi untuk DEMO kita izinkan akses publik. INI TIDAK AMAN untuk produksi:
-- siapa pun dengan anon key bisa baca/tulis seluruh tabel (termasuk hash
-- password di users). Untuk produksi, pindahkan auth ke backend / Supabase
-- Auth lalu perketat policy ini.
-- ============================================================================
alter table public.users      enable row level security;
alter table public.products   enable row level security;
alter table public.wishlists  enable row level security;
alter table public.orders     enable row level security;
alter table public.order_items enable row level security;

create policy "demo users access"       on public.users       for all using (true) with check (true);
create policy "demo products access"     on public.products    for all using (true) with check (true);
create policy "demo wishlists access"    on public.wishlists   for all using (true) with check (true);
create policy "demo orders access"       on public.orders      for all using (true) with check (true);
create policy "demo order_items access"  on public.order_items for all using (true) with check (true);

-- ============================================================================
-- SEED DATA AWAL
-- ----------------------------------------------------------------------------
-- Password di-hash SHA-256 (sama seperti auth.js). Nilai di bawah adalah
-- SHA-256 dari teks 'guest@guest.site' dan 'admin123'.
--   guest@guest.site -> 6646d1134dfc907aca75cd49d95863bb551c9b3c4b79229afa4332788df2ef54
--   admin123         -> 240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9
-- (Anda bisa ganti nanti lewat fitur register di aplikasi.)
-- ============================================================================
insert into public.users (name, email, password, role, total_spent, membership)
values
  ('Admin FurniCRM', 'admin@furnicrm.site',
   '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9',
   'admin', 0, 'bronze'),
  ('Guest Member', 'guest@guest.site',
   '6646d1134dfc907aca75cd49d95863bb551c9b3c4b79229afa4332788df2ef54',
   'user', 0, 'bronze');

-- Contoh produk (opsional, hapus jika tidak perlu).
insert into public.products (title, category, price, stock, brand, description, thumbnail, discount_percentage)
values
  ('Modern Sofa', 'furniture', 4500000, 12, 'FurniCo', 'Sofa modern 3 dudukan, nyaman dan elegan.', 'https://placehold.co/400x300?text=Sofa', 0),
  ('Wooden Dining Table', 'furniture', 6800000, 8, 'FurniCo', 'Meja makan kayu solid untuk 6 orang.', 'https://placehold.co/400x300?text=Table', 10),
  ('Office Chair', 'furniture', 1250000, 25, 'ErgoSeat', 'Kursi kerja ergonomis dengan penyangga punggung.', 'https://placehold.co/400x300?text=Chair', 0);
