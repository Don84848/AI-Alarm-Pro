Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Building AI Alarm Pro Mobile APK" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan

# 1. Build Web Assets
Write-Host "`n[1/3] Building Web Production Assets..." -ForegroundColor Yellow
npm run build

# 2. Sync with Android Project
Write-Host "`n[2/3] Syncing with Capacitor Android..." -ForegroundColor Yellow
npx cap sync android

# 3. Compile Native APK
Write-Host "`n[3/3] Compiling Android APK with Gradle..." -ForegroundColor Yellow
Set-Location android

# Find Java if installed
if (Test-Path "C:\Program Files\Microsoft\jdk-17*") {
    $jdkPath = (Get-ChildItem "C:\Program Files\Microsoft\jdk-17*" | Select-Object -First 1).FullName
    $env:JAVA_HOME = $jdkPath
    $env:PATH = "$jdkPath\bin;$env:PATH"
    Write-Host "Using JDK at: $jdkPath" -ForegroundColor Cyan
}

if (Test-Path ".\gradlew.bat") {
    cmd /c gradlew.bat assembleDebug
    
    $apkSource = "app\build\outputs\apk\debug\app-debug.apk"
    if (Test-Path $apkSource) {
        Set-Location ..
        New-Item -ItemType Directory -Force -Path "release" | Out-Null
        Copy-Item "android\$apkSource" -Destination "release\AI-Alarm-Pro.apk" -Force
        Write-Host "`n========================================" -ForegroundColor Green
        Write-Host " SUCCESS! APK Generated Successfully:" -ForegroundColor Green
        Write-Host " Path: release\AI-Alarm-Pro.apk" -ForegroundColor Cyan
        Write-Host "========================================" -ForegroundColor Green
    } else {
        Set-Location ..
        Write-Host "`nNote: To compile the final APK binary directly, Android SDK Command Line Tools or Android Studio is used." -ForegroundColor Yellow
        Write-Host "You can open this project in Android Studio with:" -ForegroundColor Cyan
        Write-Host "  npx cap open android" -ForegroundColor White
    }
} else {
    Set-Location ..
}
