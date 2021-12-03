const fs = require("fs-extra")
fs.writeFileSync('settings.json','{"voice":{"default":1},"replaces":{"text":[],"regex":[]}}','utf8')
fs.writeFileSync(".env",'# discord token\ntoken=\n\n# show "debug" log\ndebug=false\n\n# discord server id\nserver=\n\n# VOICEVOX server url and port\nvoicevox_url=http://localhost:50021\n\n# log everything\nlogall=true','utf8')
fs.writeFileSync('replys.json','[]','utf8')
fs.writeFileSync(".log",'\n','utf8')
fs.mkdir('saves',{ recursive: true }, () => {});
console.log("Open '.env' and write token, server id")
console.log("Install ffmpeg and VOICEVOX")