-- Полноэкранная карточка персонажа: загруженный ведущим портрет роли
-- и выбор стиля декоративной рамки на уровне игры.
alter table roles
  add column portrait_url text;

alter table games
  add column card_frame text not null default 'none'
  check (card_frame in ('none', 'fantasy', 'noir', 'scifi'));

-- Bucket для портретов персонажей, загружает только ведущий (владелец игры).
insert into storage.buckets (id, name, public)
values ('role-portraits', 'role-portraits', true)
on conflict (id) do nothing;

-- Путь объекта: {gameId}/{roleId}/{filename}.
create policy "owner uploads role portraits"
  on storage.objects for insert
  with check (
    bucket_id = 'role-portraits'
    and exists (
      select 1 from games g
      where g.owner_id = auth.uid()
        and g.id::text = (storage.foldername(name))[1]
    )
  );

create policy "anyone reads role portraits"
  on storage.objects for select
  using (bucket_id = 'role-portraits');

create policy "owner deletes role portraits"
  on storage.objects for delete
  using (
    bucket_id = 'role-portraits'
    and exists (
      select 1 from games g
      where g.owner_id = auth.uid()
        and g.id::text = (storage.foldername(name))[1]
    )
  );
