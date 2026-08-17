# Деплой: Supabase Cloud + Vercel

## 1. Supabase Cloud

1. Создайте проект на [supabase.com](https://supabase.com/dashboard) (регион — ближе к игрокам, например Frankfurt).
2. Свяжите локальный репозиторий с облачным проектом и примените миграции:

   ```bash
   supabase login
   supabase link --project-ref <project-ref>   # ref виден в Project Settings → General
   supabase db push                             # применяет supabase/migrations/*
   ```

3. Включите анонимную авторизацию (по умолчанию выключена в облаке, в отличие от локального стенда):
   Authentication → Sign In / Providers → **Anonymous sign-ins** → Enable.
4. Проверьте, что бакет `activity-photos` создался (Storage) — он идёт миграцией `00000000000004_storage.sql`, публичный на чтение.
5. Возьмите ключи в Project Settings → API:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` → `SUPABASE_SERVICE_ROLE_KEY` (секрет, не публиковать)

## 2. VAPID-ключи (если ещё не сгенерированы)

```bash
npx web-push generate-vapid-keys
```

`Public Key` → `NEXT_PUBLIC_VAPID_PUBLIC_KEY`, `Private Key` → `VAPID_PRIVATE_KEY`. Использовать те же ключи, что в текущем `.env.local`, можно и в проде — тогда не придётся ничего менять на стороне уже подписавшихся клиентов при повторных деплоях.

## 3. Vercel

1. Импортируйте репозиторий на [vercel.com/new](https://vercel.com/new).
2. В Project Settings → Environment Variables добавьте (для Production и Preview):

   | Переменная | Значение |
   |---|---|
   | `NEXT_PUBLIC_SUPABASE_URL` | из шага 1 |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | из шага 1 |
   | `SUPABASE_SERVICE_ROLE_KEY` | из шага 1 (Sensitive) |
   | `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | из шага 2 |
   | `VAPID_PRIVATE_KEY` | из шага 2 (Sensitive) |
   | `VAPID_SUBJECT` | `mailto:you@example.com` |
   | `NEXT_PUBLIC_APP_URL` | боевой домен, например `https://queststory.vercel.app` — используется в ссылках/QR игроков, обновить после первого деплоя, когда домен известен |

3. Деплой запустится автоматически. Проверить, что сборка использует webpack, а не Turbopack — команда сборки уже задана в `package.json` (`next build --webpack`), трогать не нужно.
4. После первого деплоя, если домен отличается от угаданного заранее — обновите `NEXT_PUBLIC_APP_URL` и передеплойте (Redeploy), иначе QR-коды и ссылки-приглашения будут вести на неверный адрес.

## 4. Проверка после деплоя

- Зарегистрировать аккаунт ведущего на `/login`, создать тестовую игру, раздать роль себе, открыть ссылку в приватном окне — весь путь должен работать так же, как локально.
- **PWA на iPhone**: Safari → открыть ссылку игрока → «Поделиться» → «На экран Домой» → открыть с домашнего экрана → разрешить уведомления. Только так на iOS работает push.
- **PWA на Android**: Chrome сам предложит установить приложение (баннер или значок в адресной строке); push работает и без установки, но с ней — надёжнее.
- Lighthouse (Chrome DevTools → Lighthouse → PWA) — сборка уже проходит installability-чеклист, но полезно перепроверить на боевом домене с HTTPS.

## Что не входит в этот сервис

- Оплата/биллинг — не требуется, Supabase free tier и Vercel Hobby достаточно для одной команды ведущих на старте.
- Резервное копирование — Supabase Cloud делает автоматические бэкапы на платных планах; на Free плане стоит периодически выгружать `pg_dump` вручную перед важными играми.
