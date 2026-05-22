# Updates Vercel Production env from .env.local (requires: npx vercel login + vercel link)
param(
  [string]$ProjectRoot = (Split-Path $PSScriptRoot -Parent)
)

Set-Location $ProjectRoot
if (-not (Test-Path ".env.local")) {
  Write-Error ".env.local not found"
  exit 1
}

$vars = @{}
Get-Content ".env.local" | ForEach-Object {
  if ($_ -match '^\s*([A-Z_]+)\s*=\s*"(.*)"\s*$') {
    $vars[$Matches[1]] = $Matches[2]
  }
}

$required = @("DATABASE_URL", "DIRECT_URL", "AUTH_SECRET", "NEXTAUTH_URL", "APP_URL")
foreach ($name in $required) {
  if (-not $vars[$name]) {
    Write-Error "Missing $name in .env.local"
    exit 1
  }
}

$vars["NEXTAUTH_URL"] = "https://pharmacy-supply.vercel.app"
$vars["APP_URL"] = "https://pharmacy-supply.vercel.app"

Write-Host "Linking project (if needed)..."
npx vercel link --yes 2>&1 | Out-Host

foreach ($name in $required) {
  Write-Host "Setting $name ..."
  npx vercel env rm $name production --yes 2>$null
  $vars[$name] | npx vercel env add $name production 2>&1 | Out-Host
}

Write-Host "Done. Redeploy: npx vercel --prod"
