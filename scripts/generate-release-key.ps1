# Generates a production-ready PKCS12 release keystore for Android release signing
param (
    [string]$KeystorePath = "release.keystore",
    [string]$Alias = "mantra-release-key",
    [string]$StorePass = "mantraRelease2026",
    [string]$DName = "CN=AarambhTech Mantra, OU=Mobile, O=AarambhTech, L=Unknown, ST=Unknown, C=IN"
)

Write-Host "Generating production release keystore..." -ForegroundColor Cyan

keytool -genkeypair -v `
  -storetype PKCS12 `
  -keystore $KeystorePath `
  -alias $Alias `
  -keyalg RSA `
  -keysize 2048 `
  -validity 10000 `
  -sigalg SHA256withRSA `
  -storepass $StorePass `
  -keypass $StorePass `
  -dname $DName

if ($LASTEXITCODE -eq 0) {
    Write-Host "`nSuccessfully created release keystore at: $KeystorePath" -ForegroundColor Green
    Write-Host "Alias: $Alias" -ForegroundColor Green
    Write-Host "Algorithm: RSA 2048 / SHA256withRSA" -ForegroundColor Green
    Write-Host "IMPORTANT: Keep this file and password secure and backed up. It is ignored by git." -ForegroundColor Yellow
} else {
    Write-Error "Failed to generate keystore."
}
