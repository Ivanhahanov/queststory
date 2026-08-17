-- Bucket for photo-подтверждения в общих активностях.
insert into storage.buckets (id, name, public)
values ('activity-photos', 'activity-photos', true)
on conflict (id) do nothing;

-- Путь объекта: {gameId}/{playerId}/{filename} — игрок пишет только в свою папку,
-- ведущий (владелец игры) видит все фото своей игры. Бакет публичный на чтение,
-- поэтому select-политика нужна только для приличия админ-панели storage.
create policy "players upload own activity photos"
  on storage.objects for insert
  with check (
    bucket_id = 'activity-photos'
    and exists (
      select 1 from players p
      where p.auth_user_id = auth.uid()
        and p.game_id::text = (storage.foldername(name))[1]
        and p.id::text = (storage.foldername(name))[2]
    )
  );

create policy "anyone reads activity photos"
  on storage.objects for select
  using (bucket_id = 'activity-photos');

create policy "owner deletes activity photos"
  on storage.objects for delete
  using (
    bucket_id = 'activity-photos'
    and exists (
      select 1 from games g
      where g.owner_id = auth.uid()
        and g.id::text = (storage.foldername(name))[1]
    )
  );
