const { log2 } = require("../scripts/log")
const logStatus = require("../jsons/logStatus.json")
const { list } = require("../scripts/list")
const fs = require("fs-extra")
function addReplaceAsRegex(before, after, interaction) {
  if (after === ".") {after = ""}
  interaction.reply({content: `文字を置き換えて読みます。\n${before} => ${after}`,})
  log2(`replaces added(Regex),\n${before} => ${after}`, logStatus.info)
  let settings = require("../jsons/settings.json")
  settings.replaces.regex.push(JSON.parse(`{"before": "${before}","after": "${after}"}`));
  try {fs.writeFileSync('jsons/settings.json', JSON.stringify(settings), 'utf8')} catch (err) {log2("settings did not save", logStatus.error)}
}
function addReplaceAsText(before, after, interaction) {
  if (after === ".") {after = ""}
  interaction.reply({content: `文字を置き換えて読みます。\n${before} => ${after}`,})
  log2(`replaces added,\n${before} => ${after}`, logStatus.info)
  let settings = require("../jsons/settings.json")
  settings.replaces.text.push(JSON.parse(`{"before": "${before}","after": "${after}"}`));
  try {fs.writeFileSync('jsons/settings.json', JSON.stringify(settings), 'utf8')} catch (err) {log2("settings did not save\n"+err, logStatus.error)}
}
function deleteReplaces(before, interaction) {
  interaction.reply({content: `${before}の読み替えを削除しました。(存在しない場合は削除されていません)`,})
  let settings = require("../jsons/settings.json")
  settings.replaces.regex.forEach((e,i) => {
    if (e.before === before) {
      log2(`deleted word, ${settings.replaces.regex[i].before} => ${settings.replaces.regex[i].after}`,logStatus.info);
      settings.replaces.regex.splice(i,1);
    }
  })
  settings.replaces.text.forEach((e,i) => {
    if (e.before === before) {
      log2(`deleted word, ${settings.replaces.text[i].before} => ${settings.replaces.text[i].after}`,logStatus.info);
      settings.replaces.text.splice(i,1)
    }
  })
  try {fs.writeFileSync('jsons/settings.json', JSON.stringify(settings), 'utf8')} catch (err) {log2("settings did not save\n"+err, logStatus.error)}
}
function showReplaces(interaction) {
  interaction.reply({ content: `読み替え一覧です。\n${list()}`, ephemeral: true,})
}
module.exports = {
  data: {
    name: "read",
    description: "読み替え",
    type: "SUB_COMMAND",
    options: [
      {
        type: "STRING",
        name: "before",
        description: "読み替え前の文字(入力しなければリスト表示)"
      },{
        type: "STRING",
        name: "after",
        description: "読み替え後の文字(入力しなければ削除、'.'で読まない)"
      },{
        type: "BOOLEAN",
        name: "regex",
        description: "正規表現を利用している"
      }
    ]
  },
  async execute(interaction) {
    const before  = interaction.options?.getString("before")
    const after = interaction.options?.getString("after")
    const regex = interaction.options?.getBoolean("regex")
    if (before && after) {
      if (regex) {addReplaceAsRegex(before, after, interaction)} else {addReplaceAsText(before, after, interaction)}
    } else if (before) {
      deleteReplaces(before, interaction)
    } else {
      showReplaces(interaction)
    }
  }
}