# Деплой: Supabase Cloud + Vercel

Разовая ручная настройка ниже занимает ~15 минут. После неё деплой полностью
автоматический: пуш в `main` → Vercel сам собирает и выкатывает приложение
(встроенная git-интеграция, отдельный workflow не нужен), а миграции БД
применяет GitHub Action `.github/workflows/deploy-migrations.yml`. Руками
после настройки нужно только мержить PR.

## 1. Supabase Cloud (разово)

1. Создайте проект на [supabase.com](https://supabase.com/dashboard) (регион — ближе к игрокам, например Frankfurt). Задайте и сохраните пароль БД — понадобится для GitHub Action.
2. Локально свяжите проект и примените текущие миграции первый раз вручную:

   ```bash
   supabase login
   supabase link --project-ref <project-ref>   # ref виден в Project Settings → General
   supabase db push
   ```

3. Включите анонимную авторизацию (по умолчанию выключена в облаке, в отличие от локального стенда):
   Authentication → Sign In / Providers → **Anonymous sign-ins** → Enable.
4. Проверьте, что бакет `activity-photos` создался (Storage) — он идёт миграцией `00000000000004_storage.sql`, публичный на чтение.
5. Возьмите ключи в Project Settings → API:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` → `SUPABASE_SERVICE_ROLE_KEY` (секрет, не публиковать)
6. Создайте Personal Access Token для CLI: [supabase.com/dashboard/account/tokens](https://supabase.com/dashboard/account/tokens) → New token.

## 2. GitHub Actions — автодеплой миграций (разово)

В настройках репозитория **Settings → Secrets and variables → Actions** добавьте:

| Secret | Значение |
|---|---|
| `SUPABASE_ACCESS_TOKEN` | personal access token из шага 1.6 |
| `SUPABASE_PROJECT_ID` | project ref (тот же `<project-ref>`, что и в `supabase link`) |
| `SUPABASE_DB_PASSWORD` | пароль БД, заданный при создании проекта |

Дальше при каждом пуше в `main`, затрагивающем `supabase/migrations/**`,
workflow сам приме́нит новые миграции к облачной базе. Ручной `supabase db
push` больше не нужен. Запустить вручную (например, для первого раза вместо
шага 1.2) можно через вкладку **Actions → Deploy Supabase migrations → Run
workflow**.

## 3. VAPID-ключи (если ещё не сгенерированы)

```bash
npx web-push generate-vapid-keys
```

`Public Key` → `NEXT_PUBLIC_VAPID_PUBLIC_KEY`, `Private Key` → `VAPID_PRIVATE_KEY`. Использовать те же ключи, что в текущем `.env.local`, можно и в проде — тогда не придётся ничего менять на стороне уже подписавшихся клиентов при повторных деплоях.

## 4. Vercel (разово)

1. Импортируйте репозиторий на [vercel.com/new](https://vercel.com/new) — это и есть подключение git-интеграции, дальше каждый пуш в `main` деплоится сам, а PR получают preview-ссылки.
2. В Project Settings → Environment Variables добавьте (для Production и Preview):

   | Переменная | Значение |
   |---|---|
   | `NEXT_PUBLIC_SUPABASE_URL` | из шага 1.5 |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | из шага 1.5 |
   | `SUPABASE_SERVICE_ROLE_KEY` | из шага 1.5 (Sensitive) |
   | `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | из шага 3 |
   | `VAPID_PRIVATE_KEY` | из шага 3 (Sensitive) |
   | `VAPID_SUBJECT` | `mailto:you@example.com` |
   | `NEXT_PUBLIC_APP_URL` | боевой домен, например `https://queststory.vercel.app` — используется в ссылках/QR игроков, обновить после первого деплоя, когда домен известен |

3. Деплой запустится автоматически. Команда сборки уже задана в `package.json` (`next build --webpack`) — она обходит несовместимость Turbopack с PWA-плагином, трогать не нужно.
4. После первого деплоя, если домен отличается от угаданного заранее — обновите `NEXT_PUBLIC_APP_URL` и сделайте Redeploy, иначе QR-коды и ссылки-приглашения будут вести на неверный адрес.

## 5. Проверка после деплоя

- Зарегистрировать аккаунт ведущего на `/login`, создать тестовую игру, раздать роль себе, открыть ссылку в приватном окне — весь путь должен работать так же, как локально.
- **PWA на iPhone**: Safari → открыть ссылку игрока → «Поделиться» → «На экран Домой» → открыть с домашнего экрана → разрешить уведомления. Только так на iOS работает push.
- **PWA на Android**: Chrome сам предложит установить приложение (баннер или значок в адресной строке); push работает и без установки, но с ней — надёжнее.
- Lighthouse (Chrome DevTools → Lighthouse → PWA) — сборка уже проходит installability-чеклист, но полезно перепроверить на боевом домене с HTTPS.

## Что дальше — уже без ручных действий

После разовой настройки выше рабочий цикл такой: правите код (сами или через
меня) → пуш/мерж в `main` → Vercel деплоит приложение, GitHub Action (если
менялись миграции) обновляет схему БД. Ничего вручную запускать не нужно.

## Что не входит в этот сервис

- Оплата/биллинг — не требуется, Supabase free tier и Vercel Hobby достаточно для одной команды ведущих на старте.
- Резервное копирование — Supabase Cloud делает автоматические бэкапы на платных планах; на Free плане стоит периодически выгружать `pg_dump` вручную перед важными играми.
