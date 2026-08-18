-- Игрок может сам "выйти" из роли (освобождает слот для повторного захода по
-- той же ссылке), и у раунда появляется отметка времени старта — чтобы
-- ведущий видел, сколько раунд уже идёт против плановой длительности.

alter table games
  add column current_round_started_at timestamptz;

create function public.leave_player(p_player_id uuid)
returns void
language plpgsql security definer set search_path = public as $$
begin
  if not is_own_player(p_player_id) then
    raise exception 'not authorized';
  end if;

  update players
  set auth_user_id = null, display_name = null, joined_at = null
  where id = p_player_id;
end;
$$;

revoke all on function public.leave_player(uuid) from public;
grant execute on function public.leave_player(uuid) to authenticated;
