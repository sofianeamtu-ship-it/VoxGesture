@echo off
title VoxGesture — Launching Local Emergency Server...
echo ========================================================
echo   Launching VoxGesture Emergency Bridge (Infomatrix)
echo ========================================================
powershell -ExecutionPolicy Bypass -File "%~dp0server.ps1"
pause
