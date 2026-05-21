# DoubleMark — выпуск обновления Windows-приложения

## 1. Собрать установщик

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\build-installer.ps1
```

Артефакт может называться, например: `DoubleMarkSetup-2.1.1-20260521-124531.exe`

## 2. Разместить файлы на сайте

- Актуальная версия: `public/downloads/DoubleMarkSetup-2.1.1-*.exe` (любой суффикс после версии)
- Архив: `public/downloads/archive/DoubleMarkSetup-2.1.0-*.exe`

## 3. Синхронизировать манифест

```bash
npm run downloads:sync
```

Скрипт находит файлы по префиксу `DoubleMarkSetup-<version>`, считает SHA256 и обновляет:

- `public/downloads/manifest.json`
- `public/updates/update.json`
- `public/updates/versions.json`

`npm run build` запускает `downloads:sync` автоматически.

## 4. Проверка перед push

```bash
npm run build
npm run test
npm run release:check
```

## 5. Проверка URL после deploy

- https://shamsyyy.github.io/doublemarksite/updates/update.json
- https://shamsyyy.github.io/doublemarksite/downloads/manifest.json
- ссылка из `installerUrl` в `update.json` (имя файла с датой, если так собрано)
- https://shamsyyy.github.io/doublemarksite/download

## 6. Git и deploy

```bash
git add public/downloads public/updates
git commit -m "chore: publish DoubleMark app update"
git push origin main
```

## 7. Проверка из приложения

После зелёного GitHub Actions — проверить автообновление по `update.json`.
