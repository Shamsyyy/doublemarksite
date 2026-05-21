# Update manifests

- `update.json` — used by the Windows app for auto-update checks
- `versions.json` — used by the website download page and version history

Before production release, replace every `PUT_SHA256_HASH_HERE` with the real SHA256 from:

```powershell
Get-FileHash -Algorithm SHA256 .\public\downloads\DoubleMarkSetup-<version>.exe
```

See `docs/APP_UPDATES.md` for the full release process.
