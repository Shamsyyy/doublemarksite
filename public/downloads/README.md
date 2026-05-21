# Windows installers

Place the current build here. The file name may include a build timestamp, for example:

- `DoubleMarkSetup-2.1.1-20260521-124531.exe`

The site matches any file whose name **starts with** `DoubleMarkSetup-<version>` (same prefix as the version in `versions.json`).

After adding `.exe` files, run:

```bash
npm run downloads:sync
```

This generates `manifest.json`, updates `installerUrl` / `sha256` in `update.json` and `versions.json`, and runs automatically before `npm run build`.

Archive older builds in `public/downloads/archive/` with the same prefix pattern, e.g. `DoubleMarkSetup-2.1.0-*.exe`.
