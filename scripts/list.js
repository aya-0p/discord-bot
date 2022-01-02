/**
 * 読み上げ変換リスト作成する関数
 * @returns {String} 読み上げ変換リスト
 */
exports.list = function list() {
  const settings = require("../jsons/settings.json")
  let replaces = []
  settings.replaces.regex.forEach(e => {
    replaces.push(`${e.before}(正規表現)=>${e.after}`)
  })
  settings.replaces.text.forEach(e => {
    replaces.push(`${e.before}=>${e.after}`)
  })
  return(replaces.join("\n"))
}