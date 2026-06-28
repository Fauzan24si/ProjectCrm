-- ============================================================================
-- MIGRASI: Landing Page Dinamis (Best Seller, Testimoni, Produk Unggulan)
-- ----------------------------------------------------------------------------
-- Jalankan di Supabase Dashboard > SQL Editor SEBELUM memakai fitur React.
-- Bersifat IDEMPOTEN & NON-DESTRUKTIF:
--   - CREATE TABLE IF NOT EXISTS
--   - ADD COLUMN IF NOT EXISTS
--   - CREATE OR REPLACE FUNCTION
-- TIDAK ada DROP TABLE pada tabel existing.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Tabel baru: testimonials
-- ----------------------------------------------------------------------------
create table if not exists public.testimonials (
  id            bigint generated always as identity primary key,
  user_id       bigint references public.users(id) on delete set null,
  customer_name text not null,
  avatar        text,
  rating        integer not null default 5 check (rating between 1 and 5),
  content       text not null,
  status        text not null default 'approved', -- pending | approved | rejected
  created_at    timestamptz not null default now()
);

create index if not exists idx_testimonials_status on public.testimonials (status);
create index if not exists idx_testimonials_created_at on public.testimonials (created_at desc);

-- ----------------------------------------------------------------------------
-- 2. Penambahan kolom products.is_featured (produk unggulan)
-- ----------------------------------------------------------------------------
alter table public.products
  add column if not exists is_featured boolean not null default false;

create index if not exists idx_products_is_featured on public.products (is_featured);

-- ----------------------------------------------------------------------------
-- 3. RPC: get_best_sellers(limit_count int)
--    Mengembalikan baris produk + sold_count (qty terjual dari order paid)
--    + wishlist_count (jumlah wishlist), diurutkan dari yang terlaris.
--    SECURITY DEFINER agar bisa agregasi lintas tabel tanpa policy rumit.
-- ----------------------------------------------------------------------------
create or replace function public.get_best_sellers(limit_count int default 8)
returns table (
  id                  bigint,
  title               text,
  category            text,
  price               numeric,
  stock               integer,
  brand               text,
  description         text,
  thumbnail           text,
  discount_percentage numeric,
  variants            jsonb,
  is_featured         boolean,
  created_at          timestamptz,
  sold_count          bigint,
  wishlist_count      bigint
)
language sql
security definer
set search_path = public
as $$
  select
    p.id,
    p.title,
    p.category,
    p.price,
    p.stock,
    p.brand,
    p.description,
    p.thumbnail,
    p.discount_percentage,
    p.variants,
    p.is_featured,
    p.created_at,
    coalesce(s.sold_count, 0) as sold_count,
    coalesce(w.wishlist_count, 0) as wishlist_count
  from public.products p
  left join (
    select oi.product_id, sum(oi.qty)::bigint as sold_count
    from public.order_items oi
    join public.orders o on o.id = oi.order_id
    where o.status = 'paid'
    group by oi.product_id
  ) s on s.product_id = p.id
  left join (
    select product_id, count(*)::bigint as wishlist_count
    from public.wishlists
    group by product_id
  ) w on w.product_id = p.id
  order by coalesce(s.sold_count, 0) desc,
           coalesce(w.wishlist_count, 0) desc,
           p.created_at desc
  limit greatest(limit_count, 1);
$$;

-- Izinkan pemanggilan RPC lewat anon key (pola demo existing).
grant execute on function public.get_best_sellers(int) to anon, authenticated;

-- ----------------------------------------------------------------------------
-- 4. Row Level Security untuk objek baru (mengikuti pola demo existing)
-- ----------------------------------------------------------------------------
alter table public.testimonials enable row level security;

drop policy if exists "demo testimonials access" on public.testimonials;
create policy "demo testimonials access" on public.testimonials
  for all using (true) with check (true);

-- ----------------------------------------------------------------------------
-- 5. Seed contoh testimoni (hanya jika tabel masih kosong)
-- ----------------------------------------------------------------------------
insert into public.testimonials (customer_name, avatar, rating, content, status)
select * from (values
  ('Rina Wijaya', null, 5,
   'Kualitas sofanya jauh di atas ekspektasi. Bahannya kokoh dan jahitannya rapi. Pengiriman juga cepat sampai Bandung!',
   'approved'),
  ('Andre Kurniawan', null, 5,
   'Beli meja dan kursi untuk kafe saya. Desainnya elegan dan pelanggan banyak yang memuji. Pasti pesan lagi di sini.',
   'approved'),
  ('Siti Nurhaliza', null, 4,
   'Lemari penyimpanannya luas dan kuat. Perakitannya mudah karena panduan lengkap. Sangat memuaskan untuk harganya.',
   'approved')
) as seed(customer_name, avatar, rating, content, status)
where not exists (select 1 from public.testimonials);
