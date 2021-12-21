const dotenv = require("dotenv");
const fs = require("fs-extra")
require('date-utils')
dotenv.config();
const debug = process.env.debug
exports.log2 = function log2(data, stt) { //log2(): ログを色付きで表示させたりなど
  let status
  switch (stt) {
    case "debug":
      status = `\u001b[36m${stt}`
      break;
    case "info":
      status = `\u001b[32m${stt}`
      break;
    case "warning":
      status = `\u001b[33m${stt}`
      break;
    case "error":
      status = `\u001b[31m${stt}`
      break;
    case "audio":
      status = `\u001b[35m${stt}`
      break;
    case "message":
      status = `\u001b[35m${stt}`
      break;
    case "interaction":
      status = `\u001b[35m${stt}`
      break;
    case "attachments":
      status = `\u001b[35m${stt}`
      break;          
    default:
      break;
  }
  let b = data.split("\n")
  let d = new Date().toFormat("HH24:MI:SS")
  let bdy
  for (let i = 0; i < b.length; i++) {
    if (i == 0) {bdy = `(${(i+1).toString().padStart(2,"0")}/${b.length.toString().padStart(2,"0")}) ${b[i]}`} 
    else {bdy = `\x1b[2m(${(i+1).toString().padStart(2,"0")}/${b.length.toString().padStart(2,"0")}) ${b[i]}\x1b[0m`}
    let bo = `${d} | ${status}: \u001b[0m${bdy}`
    if (debug === "true" || status !== "debug") { console.log(bo) }
    try {
      bu = `${d} | ${stt}: (${(i+1).toString().padStart(2,"0")}/${b.length.toString().padStart(2,"0")}) ${b[i].replaceAll(/\x1b\[../g,"")}`
      fs.appendFileSync('.log', `${bu}\n`, 'utf8')
    } catch (err) {
      console.log(err)
    }
  }
}