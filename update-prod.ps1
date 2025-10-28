Param(
  [int]$Port = 3001,
  [string]$ComposeFile = "docker-compose.yml"
)

$ErrorActionPreference = 'Stop'

function Write-Step($msg) {
  Write-Host ("[update-prod] " + $msg)
}

try {
  Write-Step "Verificando Docker"
  docker --version | Out-Null
} catch {
  Write-Error "Docker não está disponível. Abra o Docker Desktop e tente novamente."
  exit 1
}

# Garantir que o script rode no diretório do projeto
try {
  Set-Location $PSScriptRoot
} catch {
  Write-Error "Falha ao posicionar no diretório do script: $PSScriptRoot"
  exit 1
}

try {
  Write-Step "Atualizando imagem (docker compose pull)"
  docker compose -f $ComposeFile pull | Out-Host

  Write-Step "Subindo produção (docker compose up -d)"
  docker compose -f $ComposeFile up -d | Out-Host
} catch {
  Write-Error "Falha ao atualizar/subir produção: $($_.Exception.Message)"
  exit 1
}

# Tentar validar HTTP até responder
$maxAttempts = 20
$attempt = 0
$ok = $false

Write-Step "Validando HTTP em http://localhost:$Port/"
while ($attempt -lt $maxAttempts) {
  Start-Sleep -Seconds 2
  try {
    $resp = Invoke-WebRequest -Uri "http://localhost:$Port/" -UseBasicParsing
    Write-Host ("StatusCode: {0}" -f $resp.StatusCode)
    if ($resp.Content) {
      Write-Host ("BodyLength: {0}" -f $resp.Content.Length)
    } else {
      Write-Host "BodyLength: 0"
    }
    $ok = $true
    break
  } catch {
    Write-Step ("Aguardando container... tentativa {0}" -f ($attempt + 1))
  }
  $attempt++
}

if (-not $ok) {
  Write-Error "Container não respondeu na porta $Port dentro do tempo esperado."
  exit 1
}

Write-Step "Concluído com sucesso."
exit 0