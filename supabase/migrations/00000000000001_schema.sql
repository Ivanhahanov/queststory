-- Квестория — базовая схема данных

create table games (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  story_synopsis text not null default '',
  common_goal text not null default '',
  status text not null default 'draft' check (status in ('draft', 'active', 'paused', 'finished')),
  current_round_id uuid,
  active_activity_run_id uuid,
  timer_started_at timestamptz,
  timer_paused_at timestamptz,
  timer_elapsed_seconds integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table rounds (
  id uuid primary key default gen_random_uuid(),
  game_id uuid not null references games (id) on delete cascade,
  position integer not null,
  name text not null,
  description text not null default '',
  planned_duration_seconds integer,
  created_at timestamptz not null default now(),
  unique (game_id, position)
);

alter table games
  add constraint games_current_round_id_fkey
  foreign key (current_round_id) references rounds (id) on delete set null;

create table roles (
  id uuid primary key default gen_random_uuid(),
  game_id uuid not null references games (id) on delete cascade,
  name text not null,
  description text not null default '',
  avatar_style text not null default 'adventurer',
  avatar_seed text not null default gen_random_uuid()::text,
  color text not null default '#e0973f',
  created_at timestamptz not null default now()
);

create table goals (
  id uuid primary key default gen_random_uuid(),
  game_id uuid not null references games (id) on delete cascade,
  role_id uuid references roles (id) on delete cascade,
  title text not null,
  description text not null default '',
  unlock_round_id uuid references rounds (id) on delete set null,
  position integer not null default 0,
  created_at timestamptz not null default now()
);

create table players (
  id uuid primary key default gen_random_uuid(),
  game_id uuid not null references games (id) on delete cascade,
  role_id uuid references roles (id) on delete set null,
  auth_user_id uuid references auth.users (id) on delete set null,
  display_name text,
  join_token text not null unique default replace(gen_random_uuid()::text, '-', ''),
  assigned_at timestamptz,
  joined_at timestamptz,
  created_at timestamptz not null default now()
);

create table player_goal_progress (
  id uuid primary key default gen_random_uuid(),
  player_id uuid not null references players (id) on delete cascade,
  goal_id uuid not null references goals (id) on delete cascade,
  completed boolean not null default false,
  completed_at timestamptz,
  completed_by uuid references auth.users (id),
  unique (player_id, goal_id)
);

create table messages (
  id uuid primary key default gen_random_uuid(),
  game_id uuid not null references games (id) on delete cascade,
  player_id uuid references players (id) on delete cascade,
  sender text not null default 'gm' check (sender in ('gm', 'system')),
  body text not null,
  created_at timestamptz not null default now()
);

create table effect_templates (
  id uuid primary key default gen_random_uuid(),
  game_id uuid not null references games (id) on delete cascade,
  name text not null,
  type text not null check (type in ('status_label', 'secret_clue', 'goal_lock', 'points')),
  color text not null default '#8b5cf6',
  icon text,
  default_text text,
  created_at timestamptz not null default now()
);

create table player_effects (
  id uuid primary key default gen_random_uuid(),
  player_id uuid not null references players (id) on delete cascade,
  effect_template_id uuid not null references effect_templates (id) on delete cascade,
  custom_text text,
  value integer,
  target_goal_id uuid references goals (id) on delete cascade,
  active boolean not null default true,
  applied_by uuid references auth.users (id),
  applied_at timestamptz not null default now(),
  expires_at timestamptz
);

create table activity_templates (
  id uuid primary key default gen_random_uuid(),
  game_id uuid not null references games (id) on delete cascade,
  type text not null check (type in ('pin_code', 'photo_approval', 'group_vote')),
  name text not null,
  instructions text not null default '',
  config jsonb not null default '{}'::jsonb,
  display_mode text not null default 'personal' check (display_mode in ('kiosk', 'personal')),
  linked_goal_id uuid references goals (id) on delete set null,
  created_at timestamptz not null default now()
);

create table activity_runs (
  id uuid primary key default gen_random_uuid(),
  activity_template_id uuid not null references activity_templates (id) on delete cascade,
  game_id uuid not null references games (id) on delete cascade,
  status text not null default 'active' check (status in ('active', 'resolved', 'cancelled')),
  started_at timestamptz not null default now(),
  resolved_at timestamptz,
  result jsonb
);

alter table games
  add constraint games_active_activity_run_id_fkey
  foreign key (active_activity_run_id) references activity_runs (id) on delete set null;

create table activity_submissions (
  id uuid primary key default gen_random_uuid(),
  activity_run_id uuid not null references activity_runs (id) on delete cascade,
  player_id uuid references players (id) on delete cascade,
  payload jsonb not null default '{}'::jsonb,
  status text not null default 'pending' check (status in ('pending', 'correct', 'incorrect', 'approved', 'rejected')),
  reviewed_by uuid references auth.users (id),
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);

create table push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  player_id uuid not null references players (id) on delete cascade,
  endpoint text not null unique,
  keys jsonb not null,
  created_at timestamptz not null default now()
);

create index rounds_game_id_idx on rounds (game_id);
create index roles_game_id_idx on roles (game_id);
create index goals_game_id_idx on goals (game_id);
create index goals_role_id_idx on goals (role_id);
create index players_game_id_idx on players (game_id);
create index players_auth_user_id_idx on players (auth_user_id);
create index player_goal_progress_player_id_idx on player_goal_progress (player_id);
create index messages_game_id_idx on messages (game_id);
create index effect_templates_game_id_idx on effect_templates (game_id);
create index player_effects_player_id_idx on player_effects (player_id);
create index activity_templates_game_id_idx on activity_templates (game_id);
create index activity_runs_game_id_idx on activity_runs (game_id);
create index activity_submissions_activity_run_id_idx on activity_submissions (activity_run_id);
create index push_subscriptions_player_id_idx on push_subscriptions (player_id);

create function public.set_updated_at() returns trigger
  language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger games_set_updated_at
  before update on games
  for each row execute function public.set_updated_at();
