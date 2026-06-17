-- ============================================================================
-- Skema Tabel Wishlist
-- Jalankan di Supabase Dashboard > SQL Editor
-- ============================================================================

create table if not exists public.wishlists (
  id          bigint generated always as identity primary key,
  user_id     bigint not null references public.users(id) on delete cascade,
  product_id  bigint not null references public.products(id) on delete cascade,
  created_at  timestamptz not null default now(),
  -- Cegah produk yang sama masuk wishlist user lebih dari sekali
  unique (user_id, product_id)
);

-- Index untuk query cepat berdasarkan user
create index if not exists idx_wishlists_user_id on public.wishlists (user_id);

-- ----------------------------------------------------------------------------
-- (Opsional) Row Level Security
-- Aplikasi ini memakai anon key dari client, jadi untuk awal cukup izinkan
-- akses publik. Untuk produksi sebaiknya pakai Supabase Auth + policy ketat.
-- ----------------------------------------------------------------------------
-- alter table public.wishlists enable row level security;
-- create policy "Allow all (dev)" on public.wishlists for all using (true) with check (true);
