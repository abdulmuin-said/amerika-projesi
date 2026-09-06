@echo off
chcp 65001 >nul
setlocal
set "DB_TRANSFER_SCRIPT=%~f0"
powershell.exe -NoLogo -NoProfile -ExecutionPolicy Bypass -Command "$content = [IO.File]::ReadAllText($env:DB_TRANSFER_SCRIPT); $payload = [regex]::Split($content, '(?m)^#==POWERSHELL_PAYLOAD==\r?$', 2)[1]; Invoke-Expression $payload"
set "EXIT_CODE=%ERRORLEVEL%"
echo.
if not "%EXIT_CODE%"=="0" (
    echo =====================================================
    echo ISLEM BASARISIZ OLDU.
    echo Yukaridaki hata mesajini kontrol edin.
    echo =====================================================
) else (
    echo =====================================================
    echo ISLEM BASARIYLA TAMAMLANDI.
    echo =====================================================
)
echo.
echo Pencereyi kapatmak icin herhangi bir tusa basin...
pause >nul
exit /b %EXIT_CODE%
#==POWERSHELL_PAYLOAD==
$ErrorActionPreference = 'Stop'

# ==============================================================================
# NOVALUX STUDIOS - VERİTABANI SUNUCUYA AKTARIM OTOMASYONU
# ==============================================================================
$LocalContainer = 'novacanvas-postgres'
$RemoteHost = 'abdulmuin@canvasia-server'
$RemoteDbContainer = 'novacanvas-postgres'
$RemoteWebContainer = 'novacanvas-backend'
$Database = 'novacanvas_db'
$DatabaseUser = 'postgres'
$ScriptDirectory = Split-Path -Parent $env:DB_TRANSFER_SCRIPT
$BackupDirectory = Join-Path $ScriptDirectory 'NovaLux DB Yedekleri'
$Timestamp = Get-Date -Format 'yyyyMMdd_HHmmss'
$DumpName = "novacanvas_db_$Timestamp.sql"
$LocalDump = Join-Path $BackupDirectory $DumpName
$RemoteRunnerName = "novacanvas_restore_$Timestamp.sh"
$LocalRunner = Join-Path $env:TEMP $RemoteRunnerName

function Invoke-Native {
    param(
        [Parameter(Mandatory = $true)][string]$Command,
        [Parameter(Mandatory = $true)][string[]]$Arguments
    )

    & $Command @Arguments
    if ($LASTEXITCODE -ne 0) {
        throw "Komut basarisiz (kod $LASTEXITCODE): $Command $($Arguments -join ' ')"
    }
}

try {
    Write-Host '=====================================================' -ForegroundColor Cyan
    Write-Host '  NovaLux Studios - Yerelden Sunucuya DB Aktarimi' -ForegroundColor Cyan
    Write-Host '=====================================================' -ForegroundColor Cyan
    Write-Host "Hedef Veritabani: $Database" -ForegroundColor Yellow
    Write-Host "Hedef Sunucu:     $RemoteHost" -ForegroundColor Yellow
    Write-Host 'Bu islem sunucudaki mevcut veritabanini degistirir.'
    Write-Host 'Sunucudaki mevcut DB once tarihli geri donus yedegine alinir.'
    Write-Host 'Sifre kaydedilmez; SCP ve SSH icin iki kez sorulabilir.'
    Write-Host ''

    foreach ($Command in @('scp', 'ssh')) {
        if (-not (Get-Command $Command -ErrorAction SilentlyContinue)) {
            throw "Gerekli komut bulunamadi: $Command"
        }
    }

    New-Item -ItemType Directory -Path $BackupDirectory -Force | Out-Null

    # 1. Yerel Veritabanından Dump Alma (Docker veya Yerel PostgreSQL Servisi)
    Write-Host '[1/6] Yerel DB dump aliniyor...' -ForegroundColor Cyan
    
    $UsedDocker = $false
    try {
        $runningContainers = (& docker ps --format '{{.Names}}' 2>$null)
        if ($runningContainers -and ($runningContainers -split "`r?`n" -contains $LocalContainer)) {
            $UsedDocker = $true
        }
    } catch {
        $UsedDocker = $false
    }

    if ($UsedDocker) {
        Write-Host "  -> Docker container ($LocalContainer) uzerinden dump aliniyor..." -ForegroundColor Gray
        $ContainerDump = "/tmp/$DumpName"
        Invoke-Native 'docker' @(
            'exec', $LocalContainer,
            'pg_dump', '-U', $DatabaseUser, '-d', $Database,
            '--format=plain', '--no-owner', '--no-privileges',
            "--file=$ContainerDump"
        )
        Invoke-Native 'docker' @('cp', "${LocalContainer}:$ContainerDump", $LocalDump)
        Invoke-Native 'docker' @('exec', $LocalContainer, 'rm', '-f', $ContainerDump)
    } else {
        Write-Host '  -> Yerel Windows PostgreSQL servisi uzerinden dump aliniyor (localhost:5432)...' -ForegroundColor Gray
        $env:PGPASSWORD = 'postgres'
        $PgDumpPath = 'pg_dump'
        if (Test-Path 'C:\Program Files\PostgreSQL\18\bin\pg_dump.exe') {
            $PgDumpPath = 'C:\Program Files\PostgreSQL\18\bin\pg_dump.exe'
        } elseif (Test-Path 'C:\Program Files\PostgreSQL\17\bin\pg_dump.exe') {
            $PgDumpPath = 'C:\Program Files\PostgreSQL\17\bin\pg_dump.exe'
        } elseif (Test-Path 'C:\Program Files\PostgreSQL\16\bin\pg_dump.exe') {
            $PgDumpPath = 'C:\Program Files\PostgreSQL\16\bin\pg_dump.exe'
        }
        # --format=plain: SQL metin formati — tum sunucu versiyonlariyla uyumlu
        Invoke-Native $PgDumpPath @(
            '-U', $DatabaseUser, '-h', 'localhost', '-p', '5432', '-d', $Database,
            '--format=plain', '--no-owner', '--no-privileges',
            "--file=$LocalDump"
        )
    }

    $DumpFile = Get-Item -LiteralPath $LocalDump
    if ($DumpFile.Length -le 0) {
        throw "Dump dosyasi bos veya olusturulamadi: $LocalDump"
    }

    # Plain SQL dogrulama: ilk satir SQL yorum satiri (--) olmali
    $FirstLine = (Get-Content -LiteralPath $LocalDump -TotalCount 1)
    if (-not $FirstLine.StartsWith('--')) {
        throw "Olusturulan SQL dump dosyasi gecersiz gorunuyor (ilk satir: $FirstLine)"
    }

    $Hash = (Get-FileHash -LiteralPath $LocalDump -Algorithm SHA256).Hash.ToLowerInvariant()
    Write-Host "Yerel yedek olusturuldu: $LocalDump" -ForegroundColor Green
    Write-Host "Boyut:   $([Math]::Round($DumpFile.Length / 1MB, 2)) MB ($($DumpFile.Length) bayt)"
    Write-Host "SHA-256: $Hash"
    Write-Host ''

    $Confirmation = Read-Host "Sunucudaki $Database silinip bu dump yuklensin mi? Devam icin EVET yazin"
    if ($Confirmation -cne 'EVET') {
        throw 'Islem kullanici tarafindan iptal edildi. Yerel dump korundu.'
    }

    # Sunucu tarafında çalışacak güvenli bash scripti
    $RemoteScript = @'
#!/usr/bin/env bash
set -euo pipefail

DUMP_NAME="$1"
EXPECTED_HASH="$2"
DB_CONTAINER="novacanvas-postgres"
WEB_CONTAINER="novacanvas-backend"
TARGET_DB="novacanvas_db"
REMOTE_DUMP="$HOME/$DUMP_NAME"
STAMP="$(date +%Y%m%d_%H%M%S)"
BEFORE_HOST="$HOME/${TARGET_DB}_before_import_$STAMP.sql"
WEB_STOPPED=0

fail_before_drop() {
    echo "HATA: $1" >&2
    if [ "$WEB_STOPPED" -eq 1 ]; then
        docker start "$WEB_CONTAINER" >/dev/null 2>&1 || true
    fi
    exit 1
}

rollback() {
    echo "Yeni DB uygulanamadi! Eski DB geri yukleniyor..." >&2
    set +e
    docker stop "$WEB_CONTAINER" >/dev/null 2>&1 || true
    WEB_STOPPED=1
    docker exec "$DB_CONTAINER" dropdb --force -U "$DB_USER" "$DB_NAME" 2>/dev/null || true
    docker exec "$DB_CONTAINER" createdb -U "$DB_USER" -O "$DB_USER" "$DB_NAME" 2>/dev/null || true
    docker exec -i "$DB_CONTAINER" psql -U "$DB_USER" -d "$DB_NAME" -v ON_ERROR_STOP=1 \
        < "$BEFORE_HOST" 2>/dev/null
    RESTORE_RESULT=$?
    if [ "$RESTORE_RESULT" -eq 0 ]; then
        docker start "$WEB_CONTAINER" >/dev/null 2>&1 || true
        echo "Eski DB geri yuklendi. Yeni dump iptal edildi." >&2
    else
        echo "KRITIK: Eski DB geri yukleme basarisiz oldu. Web baslatilmadi." >&2
    fi
    exit 1
}

command -v sha256sum >/dev/null 2>&1 || { echo "sha256sum bulunamadi." >&2; exit 1; }
test -s "$REMOTE_DUMP" || { echo "Sunucudaki dump bulunamadi veya bos: $REMOTE_DUMP" >&2; exit 1; }
ACTUAL_HASH="$(sha256sum "$REMOTE_DUMP" | cut -d' ' -f1)"
[ "$ACTUAL_HASH" = "$EXPECTED_HASH" ] || { echo "SHA-256 eslesmedi. Beklenen: $EXPECTED_HASH, Gelen: $ACTUAL_HASH" >&2; exit 1; }

docker inspect "$DB_CONTAINER" >/dev/null 2>&1 || { echo "DB container bulunamadi: $DB_CONTAINER" >&2; exit 1; }
DB_NAME="$(docker exec "$DB_CONTAINER" printenv POSTGRES_DB 2>/dev/null || echo "$TARGET_DB")"
DB_USER="$(docker exec "$DB_CONTAINER" printenv POSTGRES_USER 2>/dev/null || echo "postgres")"

echo '[3/6] Sunucudaki dump dogrulaniyor (SQL format kontrol)...'
head -1 "$REMOTE_DUMP" | grep -q '^--' || { echo "Gecersiz SQL dump dosyasi (SQL yorum basligi bulunamadi)." >&2; exit 1; }

echo '[4/6] Mevcut sunucu DB geri donus icin yedekleniyor...'
if docker inspect "$WEB_CONTAINER" >/dev/null 2>&1; then
    docker stop "$WEB_CONTAINER" >/dev/null 2>&1 || true
    WEB_STOPPED=1
fi

# Sunucu DB'sini plain SQL olarak yedekle (stdout redirection ile host'a)
docker exec "$DB_CONTAINER" pg_dump -U "$DB_USER" -d "$DB_NAME" \
    --format=plain --no-owner --no-privileges \
    > "$BEFORE_HOST" || fail_before_drop 'Mevcut DB yedeklenemedi; drop islemi yapilmadi.'
test -s "$BEFORE_HOST" || fail_before_drop 'Geri donus yedegi bos; drop yapilmadi.'
echo "Geri donus yedegi: $BEFORE_HOST"

echo '[5/6] Hedef DB yenileniyor ve dump yukleniyor...'
# PostgreSQL 17/18'e ozgu fakat eski PostgreSQL (16 ve alti) surumlerinde hata veren parametreleri temizle
sed -i '/transaction_timeout/d' "$REMOTE_DUMP"

docker exec "$DB_CONTAINER" dropdb --force -U "$DB_USER" "$DB_NAME" \
    || fail_before_drop 'Hedef DB silinemedi.'
docker exec "$DB_CONTAINER" createdb -U "$DB_USER" -O "$DB_USER" "$DB_NAME" || rollback

# psql ile plain SQL restore (stdin redirection) -- pg_restore gerekmez
docker exec -i "$DB_CONTAINER" psql -U "$DB_USER" -d "$DB_NAME" -v ON_ERROR_STOP=1 \
    < "$REMOTE_DUMP" || rollback

TABLE_COUNT="$(docker exec "$DB_CONTAINER" psql -U "$DB_USER" -d "$DB_NAME" -At \
    -v ON_ERROR_STOP=1 -c "SELECT count(*) FROM pg_tables WHERE schemaname='public';" 2>/dev/null || echo "0")"
echo "Yuklenen Public Tablo Sayisi: $TABLE_COUNT"

PRODUCT_COUNT="$(docker exec "$DB_CONTAINER" psql -U "$DB_USER" -d "$DB_NAME" -At \
    -v ON_ERROR_STOP=1 -c "SELECT count(*) FROM product;" 2>/dev/null || echo "0")"
echo "Toplam Urun Sayisi: $PRODUCT_COUNT"

echo '[6/6] Web servisleri baslatiliyor...'
if docker inspect "$WEB_CONTAINER" >/dev/null 2>&1; then
    docker start "$WEB_CONTAINER" >/dev/null 2>&1 || rollback
    WEB_STOPPED=0
fi

# Gecici dosyalari temizle
rm -f "$REMOTE_DUMP" >/dev/null 2>&1 || true

echo 'RESTORE_OK'
exit 0
'@

    $RemoteScriptLf = $RemoteScript.Replace("`r`n", "`n").Replace("`r", "`n")
    [IO.File]::WriteAllText($LocalRunner, $RemoteScriptLf, (New-Object Text.UTF8Encoding($false)))

    Write-Host '[2/6] Dump ve restore araci sunucuya gonderiliyor...' -ForegroundColor Cyan
    Write-Host 'SSH parolasi istenebilir.' -ForegroundColor Yellow
    Invoke-Native 'scp' @(
        $LocalDump,
        $LocalRunner,
        "${RemoteHost}:~/"
    )

    Write-Host 'Sunucuda restore baslatiliyor...' -ForegroundColor Cyan
    Write-Host 'SSH parolasi yeniden istenebilir.' -ForegroundColor Yellow
    Invoke-Native 'ssh' @(
        $RemoteHost,
        "sed -i 's/\r$//' ~/$RemoteRunnerName; bash ~/$RemoteRunnerName '$DumpName' '$Hash'; result=`$?; rm -f ~/$RemoteRunnerName; exit `$result"
    )

    Write-Host ''
    Write-Host 'RESTORE_OK - Yerel NovaLux DB sunucuya basariyla aktarildi ve uygulandi!' -ForegroundColor Green
    Write-Host "Yerel yedek korundu: $LocalDump"
}
catch {
    Write-Host ''
    Write-Host "HATA: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}
finally {
    if (Test-Path -LiteralPath $LocalRunner) {
        Remove-Item -LiteralPath $LocalRunner -Force -ErrorAction SilentlyContinue
    }
}
