-- Пол персонажа — чтобы ведущий мог выдавать роли осознанно (и случайно
-- в рамках нужного пола), глядя на игрока, который стоит перед ним.
alter table roles add column gender text not null default 'any' check (gender in ('male', 'female', 'any'));
