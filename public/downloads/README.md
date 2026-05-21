# Windows installers

Place the current DoubleMark setup executable here:

- `DoubleMarkSetup-2.1.1.exe` — latest release (must match `public/updates/update.json` and `versions.json`)

After publishing a new version, move the previous installer to `public/downloads/archive/`.

## SHA256 before release

```powershell
Get-FileHash -Algorithm SHA256 .\public\downloads\DoubleMarkSetup-2.1.1.exe
```

Replace `PUT_SHA256_HASH_HERE` in `public/updates/update.json` and `public/updates/versions.json` before production deploy.
