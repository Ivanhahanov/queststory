-- Цвет платформы за игру — ведущий выбирает в конструкторе, применяется как
-- --primary/--ring на всех экранах конкретной игры (ведущий, игрок, kiosk).
alter table games
  add column accent_color text not null default '#8b5cf6';
