# Ruflo — release workflow для DoubleMark

Проект использует [Ruflo / Claude Flow](https://github.com/ruvnet/claude-flow) (см. `CLAUDE.md`). Ниже — как встроить release-проверки в процесс.

## Агенты (промпты для ручного запуска)

### DoubleMark Release Manager

Проверь перед production deploy:

- `versions.json` загружается, `latest` совпадает с `update.json.version`
- В `installerUrl` нет `PUT_SHA256_HASH_HERE` (или явный TODO в CI)
- Нет ссылок на `shamsyy.github.io`, `dublimarksite`, `DubliMark`
- Пути используют `https://shamsyyy.github.io/doublemarksite/`
- `npm run build` и `npm run test` проходят

Запуск (пример с Claude Code + Ruflo):

```text
Проверь release DoubleMark: versions.json, update.json, ссылки на installers, base path /doublemarksite/, npm test build.
```

### DoubleMark Web QA

После деплоя проверь:

- `/download` открывается
- Блок «Актуальная версия» и «Старые версии»
- Кнопки скачивания ведут на `/doublemarksite/downloads/...`
- Favicon и логотип на месте

## Чеклист (файл)

См. `.ruflo/release-checklist.md` — чеклист для релиза.

## CI (опционально)

Workflow `.github/workflows/ruflo-release-check.yml` запускает `npm run release:check` на PR/push в `main` (не блокирует merge при placeholder SHA256 — только предупреждение).

## Инициализация Ruflo в репозитории

```bash
npx @claude-flow/cli@latest init --wizard
# или
npx @claude-flow/cli@latest swarm init --topology hierarchical --max-agents 8
```

Требуется Node.js и настроенный API key для агентов (см. документацию Ruflo).
