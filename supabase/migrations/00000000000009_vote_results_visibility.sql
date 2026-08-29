-- Видимость результатов голосования для игроков (group_vote):
-- open — видно, кто как проголосовал; anonymous — видны только итоги;
-- closed — результаты видит только ведущий (как было раньше).
alter table activity_templates
  add column results_visibility text not null default 'closed'
  check (results_visibility in ('open', 'anonymous', 'closed'));
