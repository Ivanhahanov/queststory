-- Поштучный выбор черт лица аватара (глаза/рот/причёска и т.п.) поверх
-- случайного avatar_seed — накладывается как доп. query-параметры Dicebear.
alter table roles
  add column avatar_options jsonb not null default '{}'::jsonb;
