@echo off
title Build AI Alarm Pro APK
echo ========================================
echo   Building AI Alarm Pro Mobile APK
echo ========================================
powershell -ExecutionPolicy Bypass -File .\build-apk.ps1
pause
