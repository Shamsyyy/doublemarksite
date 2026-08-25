# Open a local tunnel to the VPS Postgres UI (pgweb).
# Usage: powershell -File scripts/open-db.ps1
#
# Then open http://127.0.0.1:8081
# Login: dbadmin / password from the chat (also in VPS /opt/doublemark/.env as PGWEB_AUTH_PASS)

$key = Join-Path $env:USERPROFILE ".ssh\id_ed25519"
$hostName = if ($env:DEPLOY_HOST) { $env:DEPLOY_HOST } else { "46.149.70.172" }
$user = if ($env:DEPLOY_USER) { $env:DEPLOY_USER } else { "root" }

Write-Host "Opening DB UI tunnel -> http://127.0.0.1:8081"
Write-Host "Leave this window open. Close it to disconnect."
Start-Process "http://127.0.0.1:8081"

$sshArgs = @(
  "-N",
  "-L", "8081:127.0.0.1:8081",
  "-o", "ExitOnForwardFailure=yes",
  "-o", "ServerAliveInterval=30"
)
if (Test-Path $key) {
  $sshArgs += @("-i", $key)
}
$sshArgs += "${user}@${hostName}"

ssh @sshArgs
