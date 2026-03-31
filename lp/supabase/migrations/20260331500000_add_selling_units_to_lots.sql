-- 購入単位拡張: 箱・ケース・パレット単位での販売対応

alter table public.lots
  add column selling_unit text not null default '個'
    check (selling_unit in ('個', '箱', 'ケース', 'パレット')),
  add column units_per_case integer,
  add column cases_per_pallet integer,
  add column min_order_units integer not null default 1;

-- コメント
comment on column public.lots.selling_unit is '販売単位（個/箱/ケース/パレット）';
comment on column public.lots.units_per_case is '1箱あたりの個数';
comment on column public.lots.cases_per_pallet is '1パレットあたりの箱数';
comment on column public.lots.min_order_units is '最小注文単位数';

-- シードデータは seed.sql に記載
