# Script de Deploy Automatizado para Vértice - Teatro de Operações (/TO/lab)
# Squad A-Team | Vértice AI

$FtpServer   = "ftp.vertice.hubdigital360.com"
$FtpUser     = "u576215103.vertica"
$FtpPass     = "*9t5*OvjXF"
$FtpRemoteDir= "/TO/lab"
$StagingUrl  = "https://vertice.hubdigital360.com/TO/lab"

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host " 🚀 DEPLOY VÉRTICE-TO (TEATRO DE OPERAÇÕES): $StagingUrl " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

$sourceDir = (Get-Location).Path
$distPath = "$sourceDir\dist"

if (-not (Test-Path $distPath)) {
    Write-Host "❌ Pasta 'dist' nao encontrada. Execute o build primeiro." -ForegroundColor Red
    exit 1
}

function Ensure-FtpDirectory($remoteUrl, $username, $password) {
    try {
        $makeDirReq = [System.Net.FtpWebRequest]::Create($remoteUrl)
        $makeDirReq.Credentials = New-Object System.Net.NetworkCredential($username, $password)
        $makeDirReq.Method = [System.Net.WebRequestMethods+Ftp]::MakeDirectory
        $makeDirReq.UseBinary = $true
        $makeDirReq.KeepAlive = $false
        $resp = $makeDirReq.GetResponse()
        $resp.Close()
    } catch {
        # Diretório já existe
    }
}

function Upload-FtpDirectory($localPath, $remoteUrl, $username, $password) {
    Ensure-FtpDirectory -remoteUrl $remoteUrl -username $username -password $password

    $files = Get-ChildItem -Path $localPath

    foreach ($file in $files) {
        $itemRemoteUrl = "$remoteUrl/$($file.Name)"
        
        if ($file.PSIsContainer) {
            Upload-FtpDirectory -localPath $file.FullName -remoteUrl $itemRemoteUrl -username $username -password $password
        } else {
            Write-Host "  -> Enviando: $($file.Name)" -ForegroundColor Gray
            try {
                $ftpReq = [System.Net.FtpWebRequest]::Create($itemRemoteUrl)
                $ftpReq.Credentials = New-Object System.Net.NetworkCredential($username, $password)
                $ftpReq.Method = [System.Net.WebRequestMethods+Ftp]::UploadFile
                $ftpReq.UseBinary = $true
                $ftpReq.KeepAlive = $false

                $fileBytes = [System.IO.File]::ReadAllBytes($file.FullName)
                $ftpReq.ContentLength = $fileBytes.Length

                $requestStream = $ftpReq.GetRequestStream()
                $requestStream.Write($fileBytes, 0, $fileBytes.Length)
                $requestStream.Close()
                $resp = $ftpReq.GetResponse()
                $resp.Close()
            } catch {
                Write-Host "⚠️ Erro ao enviar $($file.Name): $_" -ForegroundColor Red
            }
        }
    }
}

Write-Host "`n[FTP Upload] Transferindo dist estatico para $FtpRemoteDir..." -ForegroundColor Yellow
$baseUrl = "ftp://$FtpServer$FtpRemoteDir"
Upload-FtpDirectory -localPath $distPath -remoteUrl $baseUrl -username $FtpUser -password $FtpPass

Write-Host "`n==========================================================" -ForegroundColor Green
Write-Host " ✅ DEPLOY DO VÉRTICE-TO FINALIZADO COM SUCESSO! " -ForegroundColor Green
Write-Host " 🌐 Acesse: $StagingUrl " -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Green
