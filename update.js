const fs = require("fs-extra")
const {default:axios} = require("axios");
const unzipper = require('unzipper');
const { exec } = require('child_process');
try {fs.removeSync('tmp')} catch {console.log("tmp does not exist")}
try {fs.removeSync('scripts')} catch {console.log("scripts does not exist")}
try {fs.removeSync('commands')} catch {console.log("commands does not exist")}
try {fs.unlinkSync('index.js')} catch {console.log("index.js does not exist")}
try {fs.unlinkSync('package.json')} catch {console.log("package.json does not exist")}
try {fs.unlinkSync('package-lock.json')} catch {console.log("package-lock.json does not exist")}
try {fs.mkdirsSync('tmp/update')} catch {console.log("tmp/update does exist")}
axios.get("https://github.com/aya-0p/discord-bot/archive/refs/heads/main.zip", {responseType: 'arraybuffer'}).then(res => {
  try {fs.writeFileSync(`tmp/main.zip`, new Buffer.from(res.data), 'binary')} catch {console.log("tmp/main.zip does exist")}
  try {
    const a = fs.createReadStream('tmp/main.zip')
    const b = unzipper.Extract({ path: 'tmp/update' })
    a.pipe(b)
    b.on("close",()=>{
      try {fs.copy('tmp/update/discord-bot-main/scripts','scripts')} catch {console.log("tmp/update/discord-bot-main/scripts not exist")}
      try {fs.copy('tmp/update/discord-bot-main/commands','commands')} catch {console.log("tmp/update/discord-bot-main/commands does not exist")}
      try {fs.copyFile('tmp/update/discord-bot-main/index.js','index.js')} catch {console.log("tmp/update/discord-bot-main/index.js does not exist")}
      try {fs.copyFile('tmp/update/discord-bot-main/package.json','package.json')} catch {console.log("tmp/update/discord-bot-main/package.json does not exist")}
      try {fs.copyFile('tmp/update/discord-bot-main/package-lock.json','package-lock.json')} catch {console.log("tmp/update/discord-bot-main/package-lock.json does not exist")}
      exec('npm install',(a,b,c)=>{console.log(`${b}`)})
    })
  } catch {console.log("could not unzip")}
})