@echo off
mkdir tmp
curl -o "tmp\1.0.3.zip" "https://github.com/aya-0p/discord-bot/archive/refs/tags/v1.0.3.zip"
call powershell -command "Expand-Archive -Force tmp\1.0.3.zip tmp"
robocopy tmp\discord-bot-1.0.3\ %~dp0 /S /E
rmdir /S /Q tmp
npm install
