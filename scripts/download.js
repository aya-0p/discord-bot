const {default:axios} = require("axios");
const fs = require("fs-extra")
const { log2 } = require("./log.js")
require('date-utils')
exports.download = async function download(url,fileName, i, ext) {
  ext = ext ?? ""
  fileName = fileName ?? "file"
  await axios.get(url, {responseType: 'arraybuffer'})
    .then(res => {
      const dt = new Date();
      const time = dt.toFormat("YYYY-MM-DD_HH24-MI-SS");
      fs.writeFile(`saves/${time}_${i+1}_${fileName}${ext}`, new Buffer.from(res.data), 'binary');})
    .catch(() => {log2("File did not save","error")})
  
}