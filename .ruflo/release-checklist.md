# DoubleMark release checklist

- [ ] Версия в `update.json` и `versions.json` (`latest`) совпадают
- [ ] `installerUrl` указывает на `https://shamsyyy.github.io/doublemarksite/downloads/...`
- [ ] SHA256 заменён с `PUT_SHA256_HASH_HERE` (см. `Get-FileHash` в docs/APP_UPDATES.md)
- [ ] Старая версия перенесена в `public/downloads/archive/`
- [ ] `npm run build` успешен
- [ ] `npm run test` успешен
- [ ] `npm run release:check` без критических ошибок
- [ ] После deploy: `update.json` и `versions.json` открываются в браузере
- [ ] Страница `/download` показывает актуальную и архивные версии
- [ ] Нет ссылок shamsyy / dublimarksite / DubliMark в production paths
