exports.list = function list() {
  const settings = require("../settings.json")
  let replaces = []
  settings.replaces.regex.forEach(e => {
    replaces.push(`${e.before}(正規表現)=>${e.after}`)
  })
  settings.replaces.text.forEach(e => {
    replaces.push(`${e.before}=>${e.after}`)
  })
  return(replaces.join("\n"))
}