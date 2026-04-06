-- reserve_lot_stock: ロットの在庫を予約（チェックアウト時に呼ばれる）
create or replace function public.reserve_lot_stock(
  p_lot_id uuid,
  p_session_id text,
  p_quantity integer
) returns void as $$
begin
  update public.lots
  set stock = stock - p_quantity
  where id = p_lot_id and stock >= p_quantity;

  if not found then
    raise exception 'Insufficient stock for lot %', p_lot_id;
  end if;
end;
$$ language plpgsql security definer;
