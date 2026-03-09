-- お知らせ
create table public.announcements (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  body text not null,
  is_published boolean not null default false,
  published_at timestamptz,
  created_by uuid not null references auth.users (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.announcements enable row level security;
create policy "Allow auth select" on public.announcements for select using (true);
create policy "Allow auth insert" on public.announcements for insert with check (true);
create policy "Allow auth update" on public.announcements for update using (true);
create policy "Allow auth delete" on public.announcements for delete using (true);

-- メッセージ
create table public.messages (
  id uuid primary key default uuid_generate_v4(),
  thread_id uuid not null,
  sender_id uuid not null references auth.users (id),
  recipient_id uuid not null references auth.users (id),
  body text not null,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.messages enable row level security;
create policy "Allow auth select" on public.messages for select using (true);
create policy "Allow auth insert" on public.messages for insert with check (true);
create policy "Allow auth update" on public.messages for update using (true);

-- タスク
create table public.tasks (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  description text,
  status text not null default '未着手' check (status in ('未着手', '進行中', '完了')),
  priority text not null default '中' check (priority in ('高', '中', '低')),
  assigned_to uuid references auth.users (id),
  assigned_partner_id uuid references public.partners (id),
  due_date date,
  created_by uuid not null references auth.users (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.tasks enable row level security;
create policy "Allow auth select" on public.tasks for select using (true);
create policy "Allow auth insert" on public.tasks for insert with check (true);
create policy "Allow auth update" on public.tasks for update using (true);
create policy "Allow auth delete" on public.tasks for delete using (true);

-- ファイル共有
create table public.shared_files (
  id uuid primary key default uuid_generate_v4(),
  file_name text not null,
  file_path text not null,
  file_size integer,
  mime_type text,
  uploaded_by uuid not null references auth.users (id),
  partner_id uuid references public.partners (id),
  created_at timestamptz not null default now()
);

alter table public.shared_files enable row level security;
create policy "Allow auth select" on public.shared_files for select using (true);
create policy "Allow auth insert" on public.shared_files for insert with check (true);
create policy "Allow auth delete" on public.shared_files for delete using (true);
