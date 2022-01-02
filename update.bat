@echo off
mkdir tmp
curl -o "tmp\1.0.2.zip" "https://github.com/aya-0p/discord-bot/archive/refs/tags/v1.0.2.zip"
call powershell -command "Expand-Archive -Force tmp\1.0.2.zip tmp"
robocopy tmp\discord-bot-1.0.2\ %~dp0 /S /E
rmdir /S /Q tmp
npm install
