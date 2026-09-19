-- Без REPLICA IDENTITY FULL DELETE-события Realtime несут только id
-- удалённой строки — этого недостаточно, чтобы отфильтровать событие
-- по game_id (WHERE-фильтр подписки) и RLS-политике "player reads own
-- messages". С полной identity в payload.old приходит вся строка.
alter table messages replica identity full;
