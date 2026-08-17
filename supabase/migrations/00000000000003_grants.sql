-- Таблицы созданы ролью postgres, у которой default ACL для anon/authenticated/
-- service_role не включает select/insert/update/delete (в отличие от таблиц,
-- создаваемых supabase_admin). RLS без базового GRANT не работает — открываем
-- права здесь, дальнейшую фильтрацию строк делают политики.

grant usage on schema public to anon, authenticated, service_role;

grant select, insert, update, delete on all tables in schema public
  to anon, authenticated, service_role;

alter default privileges in schema public
  grant select, insert, update, delete on tables to anon, authenticated, service_role;
