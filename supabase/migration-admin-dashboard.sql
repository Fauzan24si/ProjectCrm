-- ============================================================================
-- MIGRASI: View agregasi untuk Dashboard Admin (FurniCRM)
-- ----------------------------------------------------------------------------
-- Jalankan di Supabase Dashboard > SQL Editor.
-- TIDAK mengubah/menghapus tabel. Hanya membuat 2 view read-only + grant.
--
-- Verifikasi setelah dijalankan:
--   select * from public.admin_dashboard_stats;
--   select * from public.admin_top_products limit 5;
-- ============================================================================

-- View 1 — satu baris berisi semua kartu statistik dashboard.
-- CATATAN: "paid-like" = semua status yang berarti uang sudah masuk
-- (paid, processing, shipped, delivered, completed). Ini konsisten dengan
-- PAID_STATES di src/services/orders.js, supaya revenue TIDAK hilang ketika
-- admin memajukan status order (paid -> processing -> dst).
create or replace view public.admin_dashboard_stats as
select
  coalesce((
    select sum(gross_amount) from public.orders
    where status in ('paid','processing','shipped','delivered','completed')
  ), 0) as total_revenue,
  (select count(*) from public.orders)                          as total_orders,
  (select count(*) from public.users where role = 'user')       as total_customers,
  case
    when (select count(*) from public.orders) = 0 then 0
    else round(
      (select count(*)::numeric from public.orders
       where status in ('paid','processing','shipped','delivered','completed'))
      / (select count(*) from public.orders) * 100, 1)
  end                                                           as conversion_rate;

-- View 2 — ranking produk terlaris dari order yang sudah dibayar (paid-like).
create or replace view public.admin_top_products as
select
  oi.product_id,
  oi.title,
  sum(oi.qty)              as total_qty,
  sum(oi.price * oi.qty)   as total_revenue
from public.order_items oi
join public.orders o on o.id = oi.order_id
where o.status in ('paid','processing','shipped','delivered','completed')
group by oi.product_id, oi.title
order by total_qty desc;

-- View 3 — total belanja & jumlah order per customer (member terdaftar).
-- Dihitung dari order yang sudah dibayar (paid-like), bukan dari kolom
-- users.total_spent yang sering tidak ter-update.
create or replace view public.admin_customer_spending as
select
  o.user_id,
  count(*)              as order_count,
  sum(o.gross_amount)   as total_spent
from public.orders o
where o.user_id is not null
  and o.status in ('paid','processing','shipped','delivered','completed')
group by o.user_id;

-- Grant select agar PostgREST mengekspos view ke anon (pola demo existing).
grant select on public.admin_dashboard_stats   to anon, authenticated;
grant select on public.admin_top_products       to anon, authenticated;
grant select on public.admin_customer_spending  to anon, authenticated;

-- ----------------------------------------------------------------------------
-- CATATAN KEAMANAN (penting):
-- Pola anon-key-open-access ini TIDAK aman untuk produksi — view dashboard
-- bisa dibaca siapa pun yang punya anon key. Untuk produksi, pindahkan
-- agregasi admin ke RPC `security definer` yang dibatasi role admin, atau
-- lewat backend. Untuk demo, grant di atas cukup & konsisten dengan kebijakan
-- existing.
-- ----------------------------------------------------------------------------
