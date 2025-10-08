# Generate Self-Signed SSL Certificate for Development

Write-Host "Generating self-signed SSL certificate..." -ForegroundColor Green

# Create certificate
$cert = New-SelfSignedCertificate `
    -DnsName "localhost" `
    -CertStoreLocation "Cert:\CurrentUser\My" `
    -KeyAlgorithm RSA `
    -KeyLength 2048 `
    -NotAfter (Get-Date).AddYears(1) `
    -KeyUsage DigitalSignature, KeyEncipherment `
    -TextExtension @("2.5.29.37={text}1.3.6.1.5.5.7.3.1")

# Export certificate
$certPath = Join-Path $PSScriptRoot "server.cert"
$keyPath = Join-Path $PSScriptRoot "server.key"

# Export as PFX first
$pfxPath = Join-Path $PSScriptRoot "temp.pfx"
$password = ConvertTo-SecureString -String "temp" -Force -AsPlainText
Export-PfxCertificate -Cert $cert -FilePath $pfxPath -Password $password | Out-Null

# Convert PFX to PEM format for Node.js
$pfxCert = New-Object System.Security.Cryptography.X509Certificates.X509Certificate2($pfxPath, "temp", [System.Security.Cryptography.X509Certificates.X509KeyStorageFlags]::Exportable)

# Export certificate
$certPem = "-----BEGIN CERTIFICATE-----`n"
$certPem += [System.Convert]::ToBase64String($pfxCert.Export([System.Security.Cryptography.X509Certificates.X509ContentType]::Cert), [System.Base64FormattingOptions]::InsertLineBreaks)
$certPem += "`n-----END CERTIFICATE-----"
[System.IO.File]::WriteAllText($certPath, $certPem)

# Export private key
$rsaKey = [System.Security.Cryptography.X509Certificates.RSACertificateExtensions]::GetRSAPrivateKey($pfxCert)
$keyBytes = $rsaKey.ExportRSAPrivateKey()
$keyPem = "-----BEGIN RSA PRIVATE KEY-----`n"
$keyPem += [System.Convert]::ToBase64String($keyBytes, [System.Base64FormattingOptions]::InsertLineBreaks)
$keyPem += "`n-----END RSA PRIVATE KEY-----"
[System.IO.File]::WriteAllText($keyPath, $keyPem)

# Clean up
Remove-Item $pfxPath -Force
Remove-Item "Cert:\CurrentUser\My\$($cert.Thumbprint)" -Force

Write-Host "SSL certificate generated successfully!" -ForegroundColor Green
Write-Host "Certificate: $certPath" -ForegroundColor Cyan
Write-Host "Private Key: $keyPath" -ForegroundColor Cyan
Write-Host ""
Write-Host "Note: Self-signed certificate for development only." -ForegroundColor Yellow
