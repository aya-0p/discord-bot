@echo off

mkdir saves
mkdir jsons
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