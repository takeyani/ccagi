-- ========================================
-- アンケート機能
-- ========================================

create table public.surveys (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  description text,
  target_type text not null default 'general'
    check (target_type in ('general', 'product', 'lot')),
  target_id uuid,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_surveys_target on public.surveys (target_type, target_id);

alter table public.surveys enable row level security;
create policy "Allow public select" on public.surveys for select using (true);
create policy "Allow public insert" on public.surveys for insert with check (true);
create policy "Allow authenticated update" on public.surveys for update using (true) with check (true);
create policy "Allow authenticated delete" on public.surveys for delete using (true);

-- アンケート質問
create table public.survey_questions (
  id uuid primary key default uuid_generate_v4(),
  survey_id uuid not null references public.surveys(id) on delete cascade,
  sort_order integer not null default 0,
  question_text text not null,
  question_type text not null default 'text'
    check (question_type in ('text', 'radio', 'checkbox', 'rating')),
  options jsonb default '[]'::jsonb,
  is_required boolean not null default false,
  created_at timestamptz not null default now()
);

create index idx_survey_questions_survey on public.survey_questions (survey_id);

alter table public.survey_questions enable row level security;
create policy "Allow public select" on public.survey_questions for select using (true);
create policy "Allow public insert" on public.survey_questions for insert with check (true);
create policy "Allow authenticated update" on public.survey_questions for update using (true) with check (true);
create policy "Allow authenticated delete" on public.survey_questions for delete using (true);

-- アンケート回答
create table public.survey_responses (
  id uuid primary key default uuid_generate_v4(),
  survey_id uuid not null references public.surveys(id) on delete cascade,
  respondent_name text,
  respondent_email text,
  created_at timestamptz not null default now()
);

create index idx_survey_responses_survey on public.survey_responses (survey_id);

alter table public.survey_responses enable row level security;
create policy "Allow public select" on public.survey_responses for select using (true);
create policy "Allow public insert" on public.survey_responses for insert with check (true);

-- アンケート回答詳細
create table public.survey_answers (
  id uuid primary key default uuid_generate_v4(),
  response_id uuid not null references public.survey_responses(id) on delete cascade,
  question_id uuid not null references public.survey_questions(id) on delete cascade,
  answer_text text,
  answer_options jsonb default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create index idx_survey_answers_response on public.survey_answers (response_id);

alter table public.survey_answers enable row level security;
create policy "Allow public select" on public.survey_answers for select using (true);
create policy "Allow public insert" on public.survey_answers for insert with check (true);

-- ========================================
-- 掲示板機能
-- ========================================

create table public.board_threads (
  id uuid primary key default uuid_generate_v4(),
  target_type text not null check (target_type in ('product', 'lot')),
  target_id uuid not null,
  title text not null,
  author_name text not null,
  author_email text,
  created_at timestamptz not null default now()
);

create index idx_board_threads_target on public.board_threads (target_type, target_id);

alter table public.board_threads enable row level security;
create policy "Allow public select" on public.board_threads for select using (true);
create policy "Allow public insert" on public.board_threads for insert with check (true);
create policy "Allow authenticated delete" on public.board_threads for delete using (true);

-- 掲示板投稿
create table public.board_posts (
  id uuid primary key default uuid_generate_v4(),
  thread_id uuid not null references public.board_threads(id) on delete cascade,
  author_name text not null,
  author_email text,
  body text not null,
  created_at timestamptz not null default now()
);

create index idx_board_posts_thread on public.board_posts (thread_id);

alter table public.board_posts enable row level security;
create policy "Allow public select" on public.board_posts for select using (true);
create policy "Allow public insert" on public.board_posts for insert with check (true);
create policy "Allow authenticated delete" on public.board_posts for delete using (true);
