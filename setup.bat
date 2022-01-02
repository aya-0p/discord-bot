@echo off
mkdir tmp
mkdir jsons
curl -o "tmp\1.0.2.zip" "https://github.com/aya-0p/discord-bot/archive/refs/tags/v1.0.2.zip"
call powershell -command "Expand-Archive -Force tmp\1.0.2.zip tmp"
robocopy tmp\discord-bot-1.0.2\ %~dp0 /S /E
rmdir /S /Q tmp
mkdir saves
echo {"voice":{"default":1},"replaces":{"text":[],"regex":[]}} > jsons\settings.json
echo # discord token > .env
echo. >> .env
echo token= >> .env
echo. >> .env
echo. >> .env
echo # show "debug" log >> .env
echo. >> .env
echo debug=false >> .env
echo. >> .env
echo. >> .env
echo # discord server id >> .env
echo. >> .env
echo server= >> .env
echo. >> .env
echo. >> .env
echo # VOICEVOX server url and port >> .env
echo. >> .env
echo voicevox_url=http://localhost:50021 >> .env
echo. >> .env
echo. >> .env
echo # log everything >> .env
echo. >> .env
echo logall=false >> .env
echo [] > jsons\replys.json
echo. > .log
echo ### Open '.env' and write token, server id ###
echo ### Install VOICEVOX ###
npm install
