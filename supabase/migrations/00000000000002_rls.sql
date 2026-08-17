-- Квестория — row level security и вспомогательные функции

alter table games enable row level security;
alter table rounds enable row level security;
alter table roles enable row level security;
alter table goals enable row level security;
alter table players enable row level security;
alter table player_goal_progress enable row level security;
alter table messages enable row level security;
alter table effect_templates enable row level security;
alter table player_effects enable row level security;
alter table activity_templates enable row level security;
alter table activity_runs enable row level security;
alter table activity_submissions enable row level security;
alter table push_subscriptions enable row level security;

-- Ведущий видит/редактирует только свои игры.
create function public.is_game_owner(p_game_id uuid) returns boolean
  language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from games where id = p_game_id and owner_id = auth.uid()
  );
$$;

-- Игрок действует только под своей же строкой в players (анонимная сессия, привязанная при входе).
create function public.is_own_player(p_player_id uuid) returns boolean
  language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from players where id = p_player_id and auth_user_id = auth.uid()
  );
$$;

revoke all on function public.is_game_owner(uuid) from public;
revoke all on function public.is_own_player(uuid) from public;
grant execute on function public.is_game_owner(uuid) to authenticated;
grant execute on function public.is_own_player(uuid) to authenticated;

-- games ----------------------------------------------------------------
create policy "owner manages games" on games
  for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());

create policy "player reads own game" on games
  for select using (
    exists (select 1 from players p where p.game_id = games.id and p.auth_user_id = auth.uid())
  );

-- rounds -----------------------------------------------------------------
create policy "owner manages rounds" on rounds
  for all using (is_game_owner(game_id)) with check (is_game_owner(game_id));

create policy "player reads rounds" on rounds
  for select using (
    exists (select 1 from players p where p.game_id = rounds.game_id and p.auth_user_id = auth.uid())
  );

-- roles ------------------------------------------------------------------
create policy "owner manages roles" on roles
  for all using (is_game_owner(game_id)) with check (is_game_owner(game_id));

create policy "player reads own role" on roles
  for select using (
    exists (select 1 from players p where p.role_id = roles.id and p.auth_user_id = auth.uid())
  );

-- goals --------------------------------------------------------------------
-- Игроки НЕ читают эту таблицу напрямую (раунды блокировки целей проверяются
-- в get_visible_goals). Только ведущий имеет прямой доступ.
create policy "owner manages goals" on goals
  for all using (is_game_owner(game_id)) with check (is_game_owner(game_id));

-- players --------------------------------------------------------------------
create policy "owner manages players" on players
  for all using (is_game_owner(game_id)) with check (is_game_owner(game_id));

create policy "player reads own row" on players
  for select using (auth_user_id = auth.uid());

-- player_goal_progress ---------------------------------------------------
create policy "owner manages progress" on player_goal_progress
  for all using (
    exists (select 1 from players p where p.id = player_goal_progress.player_id and is_game_owner(p.game_id))
  ) with check (
    exists (select 1 from players p where p.id = player_goal_progress.player_id and is_game_owner(p.game_id))
  );

create policy "player reads own progress" on player_goal_progress
  for select using (is_own_player(player_id));

-- messages -----------------------------------------------------------------
create policy "owner manages messages" on messages
  for all using (is_game_owner(game_id)) with check (is_game_owner(game_id));

create policy "player reads own messages" on messages
  for select using (
    exists (
      select 1 from players p
      where p.game_id = messages.game_id
        and p.auth_user_id = auth.uid()
        and (messages.player_id is null or messages.player_id = p.id)
    )
  );

-- effect_templates -----------------------------------------------------------
create policy "owner manages effect templates" on effect_templates
  for all using (is_game_owner(game_id)) with check (is_game_owner(game_id));

create policy "player reads effect templates" on effect_templates
  for select using (
    exists (select 1 from players p where p.game_id = effect_templates.game_id and p.auth_user_id = auth.uid())
  );

-- player_effects ------------------------------------------------------------
create policy "owner manages player effects" on player_effects
  for all using (
    exists (select 1 from players p where p.id = player_effects.player_id and is_game_owner(p.game_id))
  ) with check (
    exists (select 1 from players p where p.id = player_effects.player_id and is_game_owner(p.game_id))
  );

create policy "player reads own effects" on player_effects
  for select using (is_own_player(player_id));

-- activity_templates / activity_runs -----------------------------------------
-- Игроки не читают эти таблицы напрямую (в шаблонах может быть правильный
-- PIN-код). Актуальная активность отдаётся через серверный route handler.
create policy "owner manages activity templates" on activity_templates
  for all using (is_game_owner(game_id)) with check (is_game_owner(game_id));

create policy "owner manages activity runs" on activity_runs
  for all using (is_game_owner(game_id)) with check (is_game_owner(game_id));

-- activity_submissions --------------------------------------------------------
create policy "owner manages submissions" on activity_submissions
  for all using (
    exists (select 1 from activity_runs r where r.id = activity_submissions.activity_run_id and is_game_owner(r.game_id))
  ) with check (
    exists (select 1 from activity_runs r where r.id = activity_submissions.activity_run_id and is_game_owner(r.game_id))
  );

create policy "player reads own submissions" on activity_submissions
  for select using (is_own_player(player_id));

create policy "player submits own activity entries" on activity_submissions
  for insert with check (
    is_own_player(player_id)
    and exists (select 1 from activity_runs r where r.id = activity_run_id and r.status = 'active')
  );

-- push_subscriptions -----------------------------------------------------------
create policy "owner reads subscriptions" on push_subscriptions
  for select using (
    exists (select 1 from players p where p.id = push_subscriptions.player_id and is_game_owner(p.game_id))
  );

create policy "player manages own subscription" on push_subscriptions
  for all using (is_own_player(player_id)) with check (is_own_player(player_id));

-- RPC: claim_player -----------------------------------------------------------
-- Вызывается сразу после анонимного входа игрока по персональной ссылке.
-- Bypасс RLS нужен, потому что до привязки auth_user_id строка ещё никому не видна.
create function public.claim_player(p_join_token text, p_display_name text)
returns players
language plpgsql security definer set search_path = public as $$
declare
  v_player players;
begin
  if auth.uid() is null then
    raise exception 'not authenticated';
  end if;

  select * into v_player from players where join_token = p_join_token for update;

  if not found then
    raise exception 'invite not found';
  end if;

  if v_player.auth_user_id is not null and v_player.auth_user_id <> auth.uid() then
    raise exception 'invite already claimed';
  end if;

  update players
  set auth_user_id = auth.uid(),
      display_name = p_display_name,
      joined_at = coalesce(joined_at, now())
  where id = v_player.id
  returning * into v_player;

  return v_player;
end;
$$;

revoke all on function public.claim_player(text, text) from public;
grant execute on function public.claim_player(text, text) to authenticated, anon;

-- RPC: get_visible_goals -------------------------------------------------------
-- Отдаёт игроку только цели, открытые текущим раундом (общие + цели его роли).
create function public.get_visible_goals(p_player_id uuid)
returns table (
  id uuid,
  title text,
  description text,
  role_id uuid,
  unlock_round_id uuid,
  goal_position integer,
  completed boolean,
  completed_at timestamptz
)
language plpgsql stable security definer set search_path = public as $$
declare
  v_player players;
  v_current_position integer;
begin
  if not (is_own_player(p_player_id) or exists (
    select 1 from players p where p.id = p_player_id and is_game_owner(p.game_id)
  )) then
    raise exception 'not authorized';
  end if;

  select * into v_player from players where players.id = p_player_id;

  select r.position into v_current_position
  from games g join rounds r on r.id = g.current_round_id
  where g.id = v_player.game_id;

  return query
    select
      goals.id,
      goals.title,
      goals.description,
      goals.role_id,
      goals.unlock_round_id,
      goals.position as goal_position,
      coalesce(pgp.completed, false),
      pgp.completed_at
    from goals
    left join rounds unlock_round on unlock_round.id = goals.unlock_round_id
    left join player_goal_progress pgp
      on pgp.goal_id = goals.id and pgp.player_id = p_player_id
    where goals.game_id = v_player.game_id
      and (goals.role_id is null or goals.role_id = v_player.role_id)
      and (
        goals.unlock_round_id is null
        or (v_current_position is not null and unlock_round.position <= v_current_position)
      )
    order by goals.position;
end;
$$;

revoke all on function public.get_visible_goals(uuid) from public;
grant execute on function public.get_visible_goals(uuid) to authenticated;

-- Realtime: транслируем изменения (RLS всё равно фильтрует по подписчику).
alter publication supabase_realtime add table
  games, rounds, roles, players, player_goal_progress, messages,
  effect_templates, player_effects, activity_runs, activity_submissions;
