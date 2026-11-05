<#
  Deploy completo: API (sam build + sam deploy) e front (build + S3 + CloudFront).

    .\deploy.ps1              # tudo
    .\deploy.ps1 -FrontOnly   # só o front (a API já está no ar)

  As chaves vêm do .env da raiz (RATE_LIMIT_SECRET obrigatória; chaves de IA opcionais)
  e vão como parâmetros NoEcho do template: nenhum segredo fica no samconfig.toml.
#>
param([switch]$FrontOnly)

$ErrorActionPreference = 'Stop'
$Stack = 'my-planet'
$Region = 'us-east-1'
$Root = $PSScriptRoot

function Invoke-Native([scriptblock]$Command, [string]$Step) {
    & $Command
    if ($LASTEXITCODE -ne 0) { throw "$Step falhou (código $LASTEXITCODE)." }
}

function Read-DotEnv([string]$Path) {
    $values = @{}
    if (-not (Test-Path $Path)) { return $values }
    foreach ($line in Get-Content $Path) {
        if ($line -match '^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$') {
            $values[$Matches[1]] = $Matches[2].Trim('"', "'")
        }
    }
    return $values
}

function Get-StackOutput([string]$Key) {
    $value = aws cloudformation describe-stacks --stack-name $Stack --region $Region `
        --query "Stacks[0].Outputs[?OutputKey=='$Key'].OutputValue" --output text
    if ($LASTEXITCODE -ne 0 -or -not $value -or $value -eq 'None') { throw "Output $Key não encontrado no stack $Stack." }
    return $value.Trim()
}

if (-not $FrontOnly) {
    $env_ = Read-DotEnv (Join-Path $Root '.env')
    if (-not $env_['RATE_LIMIT_SECRET'] -or $env_['RATE_LIMIT_SECRET'].Length -lt 32) {
        throw 'Defina RATE_LIMIT_SECRET no .env (32+ caracteres): python -c "import secrets; print(secrets.token_hex(32))"'
    }
    $overrides = @("RateLimitSecret=$($env_['RATE_LIMIT_SECRET'])")
    foreach ($pair in @(@('NVIDIA_API_KEY', 'NvidiaApiKey'), @('GROQ_API_KEY', 'GroqApiKey'), @('GOOGLE_API_KEY', 'GoogleApiKey'))) {
        if ($env_[$pair[0]]) { $overrides += "$($pair[1])=$($env_[$pair[0]])" }
        else { Write-Warning "$($pair[0]) ausente no .env: esse provedor fica desligado em produção." }
    }

    Write-Host "`n== API: sam build ==" -ForegroundColor Cyan
    Push-Location $Root
    try {
        Invoke-Native { sam build } 'sam build'
        Write-Host "`n== API: sam deploy ==" -ForegroundColor Cyan
        Invoke-Native { sam deploy --no-fail-on-empty-changeset --parameter-overrides @overrides } 'sam deploy'
    } finally { Pop-Location }
}

$apiUrl = (Get-StackOutput 'Url').TrimEnd('/')
$bucket = Get-StackOutput 'FrontBucketName'
$distribution = Get-StackOutput 'FrontDistributionId'
$frontUrl = Get-StackOutput 'FrontUrl'

Write-Host "`n== Front: build apontando para $apiUrl ==" -ForegroundColor Cyan
Push-Location (Join-Path $Root 'web')
try {
    $env:VITE_API_URL = $apiUrl
    Invoke-Native { npm run build } 'npm run build'
} finally {
    Remove-Item Env:VITE_API_URL -ErrorAction SilentlyContinue
    Pop-Location
}

Write-Host "`n== Front: envio para s3://$bucket ==" -ForegroundColor Cyan
$dist = Join-Path $Root 'web\dist'
# Arquivos com hash no nome nunca mudam: cache de 1 ano. O index.html é revalidado sempre.
Invoke-Native { aws s3 sync $dist "s3://$bucket" --delete --exclude index.html --cache-control 'public,max-age=31536000,immutable' --region $Region } 's3 sync'
Invoke-Native { aws s3 cp (Join-Path $dist 'index.html') "s3://$bucket/index.html" --cache-control 'no-cache' --region $Region } 's3 cp index.html'
Invoke-Native { aws cloudfront create-invalidation --distribution-id $distribution --paths '/index.html' --query 'Invalidation.Id' --output text } 'invalidação do CloudFront'

Write-Host "`nNo ar:" -ForegroundColor Green
Write-Host "  Site: $frontUrl"
Write-Host "  API:  $apiUrl"
