-- Часть целей игрок может отмечать сам, не дожидаясь ведущего.

alter table goals
  add column player_can_complete boolean not null default false;

-- Игрок не имеет прямого select-доступа к goals (см. 0002 — цели отдаются
-- только через get_visible_goals), поэтому проверку player_can_complete
-- внутри RLS-политики player_goal_progress нужно делать через security
-- definer функцию, а не обычный EXISTS-подзапрос — иначе он всегда будет
-- видеть 0 строк и политика молча заблокирует даже разрешённые цели.
create function public.goal_allows_player_complete(p_goal_id uuid) returns boolean
  language sql stable security definer set search_path = public as $$
  select exists (select 1 from goals where id = p_goal_id and player_can_complete);
$$;

revoke all on function public.goal_allows_player_complete(uuid) from public;
grant execute on function public.goal_allows_player_complete(uuid) to authenticated;

create policy "player completes allowed goals" on player_goal_progress
  for all using (
    is_own_player(player_id) and goal_allows_player_complete(goal_id)
  ) with check (
    is_own_player(player_id) and goal_allows_player_complete(goal_id)
  );

-- get_visible_goals меняет форму возвращаемой таблицы — пересоздаём.
drop function if exists public.get_visible_goals(uuid);

create function public.get_visible_goals(p_player_id uuid)
returns table (
  id uuid,
  title text,
  description text,
  role_id uuid,
  unlock_round_id uuid,
  goal_position integer,
  completed boolean,
  completed_at timestamptz,
  player_can_complete boolean
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
      pgp.completed_at,
      goals.player_can_complete
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
