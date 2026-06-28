-- ============================================================================
-- BACKFILL: Saldo poin member lama dari order yang sudah dibayar
-- ----------------------------------------------------------------------------
-- Sebelum fitur voucher, "poin" hanya dihitung di tampilan (tidak disimpan).
-- Setelah kolom users.points ditambah (default 0), member lama bersaldo 0.
-- Script ini mengisi ulang users.points berdasarkan total belanja nyata.
--
-- Rasio poin: 100 poin per Rp 10.000  ==  1 poin per Rp 100
--   points = floor(total_belanja_paid / 100)
-- (selaras dengan src/lib/loyalty.js: RUPIAH_PER_POINT = 100)
--
-- AMAN dijalankan ulang (idempoten): poin di-SET (bukan ditambah) dari sumber
-- order, lalu ledger lama hasil backfill dihapus & ditulis ulang.
-- Status "paid-like" = paid, processing, shipped, delivered, completed.
-- ============================================================================

-- 1. Hitung total belanja paid-like per user.
with spending as (
  select
    o.user_id,
    coalesce(sum(o.gross_amount), 0) as total_paid
  from public.orders o
  where o.user_id is not null
    and o.status in ('paid','processing','shipped','delivered','completed')
  group by o.user_id
)
-- 2. Set saldo poin = floor(total / 100). Member tanpa order -> 0.
update public.users u
set points = floor(coalesce(s.total_paid, 0) / 100)::int
from (
  select id from public.users where role = 'user'
) targets
left join spending s on s.user_id = targets.id
where u.id = targets.id;

-- 3. Tulis ulang ledger backfill agar konsisten (hapus entri backfill lama dulu).
delete from public.point_transactions where type = 'earn' and description = 'Backfill poin awal';

insert into public.point_transactions (user_id, amount, type, description)
select u.id, u.points, 'earn', 'Backfill poin awal'
from public.users u
where u.role = 'user' and u.points > 0;

-- Verifikasi:
--   select id, name, points from public.users where role = 'user' order by points desc;
