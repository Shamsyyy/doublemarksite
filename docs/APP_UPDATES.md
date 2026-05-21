# DoubleMark — выпуск обновления Windows-приложения

## 1. Собрать установщик

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\build-installer.ps1
```

Ожидаемый артефакт: `dist/installer/DoubleMarkSetup-2.1.1.exe`

## 2. SHA256

```powershell
Get-FileHash -Algorithm SHA256 .\public\downloads\DoubleMarkSetup-2.1.1.exe
```

## 3. Разместить файлы на сайте

- Актуальная версия: `public/downloads/DoubleMarkSetup-2.1.1.exe`
- Предыдущую актуальную перенести в: `public/downloads/archive/DoubleMarkSetup-2.1.0.exe`

## 4. Обновить JSON

- `public/updates/update.json` — поле `version`, `installerUrl`, `sha256`, `notes`
- `public/updates/versions.json` — `latest` и массив `versions` (актуальная + архив)

`latest` в `versions.json` должен совпадать с `version` в `update.json`.

## 5. Проверка перед push

```bash
npm run build
npm run test
npm run release:check
```

## 6. Проверка URL после deploy

- https://shamsyyy.github.io/doublemarksite/updates/update.json
- https://shamsyyy.github.io/doublemarksite/updates/versions.json
- https://shamsyyy.github.io/doublemarksite/downloads/DoubleMarkSetup-2.1.1.exe
- https://shamsyyy.github.io/doublemarksite/download (страница скачивания)

## 7. Git

```bash
git add public/downloads public/updates src/lib/appVersions.ts src/pages/DownloadPage.tsx src/styles.css docs APP_UPDATES.md
git commit -m "feat: app versions, download page, and update manifests for GitHub Pages"
git push origin main
```

## 8. Проверка из приложения

После зелёного GitHub Actions deploy — проверить автообновление по `update.json` и скачивание с сайта.
