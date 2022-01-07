@echo off
mkdir tmp
mkdir jsons
mkdir musics

mkdir saves
echo {"voice":{"default":1},"replaces":{"text":[],"regex":[]}} > jsons\settings.json
echo # discord token > .env
echo token= >> .env
echo. >> .env
echo # show debug log >> .env
echo debug=false >> .env
echo. >> .env
echo # VOICEVOX server url and port >> .env
echo voicevox_url=http://localhost:50021 >> .env
echo. >> .env
echo # log everything >> .env
echo logall=false >> .env
echo [] > jsons\replys.json
echo. > .log
echo ### Open '.env' and write token, server id ###
echo ### Install VOICEVOX ###
npm install
