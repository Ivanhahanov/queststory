-- Игрок не имеет select-доступа к activity_runs (см. 0002 — там намеренно
-- нет player-политики, PIN-коды живут в привязанных шаблонах). Из-за этого
-- проверка "r.status = 'active'" внутри политики player_submits своей же
-- строки activity_submissions всегда видела 0 строк и молча блокировала
-- любую вставку — тот же класс бага, что уже чинили для player_goal_progress
-- в 0000006: обычный EXISTS-подзапрос нужно заменить на security definer.

create function public.is_active_run(p_run_id uuid) returns boolean
  language sql stable security definer set search_path = public as $$
  select exists (select 1 from activity_runs where id = p_run_id and status = 'active');
$$;

revoke all on function public.is_active_run(uuid) from public;
grant execute on function public.is_active_run(uuid) to authenticated;

drop policy "player submits own activity entries" on activity_submissions;

create policy "player submits own activity entries" on activity_submissions
  for insert with check (
    is_own_player(player_id)
    and is_active_run(activity_run_id)
  );
