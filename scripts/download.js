const {default:axios} = require("axios");
const fs = require("fs-extra")
const log = require("./log.js")
require('date-utils')
/**
 * ファイルを ダウンロードする関数(saves/[time]\_[i+1]\_[filename][ext]で保存)
 * @param {URL} url ダウンロードURL
 * @param {String} fileName ダウンロードファイル名
 * @param {Number} [i] 
 * @param {String} [ext] ファイル拡張子(.*)
 */
exports.download = async function download(url,fileName, i, ext) {
  ext = ext ?? ""
  i = i ?? 0
  fileName = fileName ?? "file"
  await axios.get(url, {responseType: 'arraybuffer'})
    .then(res => {
      const dt = new Date();
      const time = dt.toFormat("YYYY-MM-DD_HH24-MI-SS");
      fs.writeFile(`saves/${time}_${i+1}_${fileName}${ext}`, new Buffer.from(res.data), 'binary');})
    .catch(() => {log.log("File did not save",log.error)})
}