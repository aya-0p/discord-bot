/**
 * @typedef {discordjs_Interaction} Interaction https://discord.js.org/#/docs/main/stable/class/Interaction
 */
const log = require("../scripts/log")
const { list } = require("../scripts/list")
const fs = require("fs-extra")
/**
 * 正規表現ありで読み替えを追加する関数
 * @param {String} before 読み替え前の語
 * @param {String} after 読み替え後の語
 * @param {Interaction} interaction discordjsのMessage Class
 */
function addReplaceAsRegex(before, after, interaction) {
  if (after === ".") {after = ""}
  interaction.reply({content: `文字を置き換えて読みます。\n${before} => ${after}`,})
  log.log(`replaces added(Regex),\n${before} => ${after}`, log.info)
  let settings = require("../jsons/settings.json")
  settings.replaces.regex.push(JSON.parse(`{"before": "${before}","after": "${after}"}`));
  try {fs.writeFileSync('jsons/settings.json', JSON.stringify(settings), 'utf8')} catch (err) {log.log("settings did not save", log.error)}
}
/**
 * 正規表現無しで読み替えを追加する関数
 * @param {String} before 読み替え前の語
 * @param {String} after 読み替え後の語
 * @param {Interaction} interaction discordjsのMessage Class
 */
function addReplaceAsText(before, after, interaction) {
  if (after === ".") {after = ""}
  interaction.reply({content: `文字を置き換えて読みます。\n${before} => ${after}`,})
  log.log(`replaces added,\n${before} => ${after}`, log.info)
  let settings = require("../jsons/settings.json")
  settings.replaces.text.push(JSON.parse(`{"before": "${before}","after": "${after}"}`));
  try {fs.writeFileSync('jsons/settings.json', JSON.stringify(settings), 'utf8')} catch (err) {log.log("settings did not save\n"+err, log.error)}
}
/**
 * 読み替えを削除する関数
 * @param {String} before 削除する語
 * @param {Interaction} interaction discordjsのMessage Class
 */
function deleteReplaces(before, interaction) {
  interaction.reply({content: "削除中...",})
  let settings = require("../jsons/settings.json")
  let deleteCount = 0
  settings.replaces.regex.forEach((e,i) => {
    if (e.before === before) {
      log.log(`deleted word, ${settings.replaces.regex[i].before} => ${settings.replaces.regex[i].after}`, log.info);
      interaction.followUp({ content: `削除しました。\n>> ${settings.replaces.regex[i].before} => ${settings.replaces.regex[i].after}`, })
      settings.replaces.regex.splice(i, 1);
      deleteCount++
    }
  })
  settings.replaces.text.forEach((e,i) => {
    if (e.before === before) {
      log.log(`deleted word, ${settings.replaces.text[i].before} => ${settings.replaces.text[i].after}`, log.info);
      interaction.followUp({ content: `削除しました。\n>> ${settings.replaces.text[i].before} => ${settings.replaces.text[i].after}`, })
      settings.replaces.text.splice(i, 1)
      deleteCount++
    }
  })
  if (deleteCount === 0) {
    interaction.editReply({ content: "削除するものが見つかりませんでした。", })
  }
  try {fs.writeFileSync('jsons/settings.json', JSON.stringify(settings), 'utf8')} catch (err) {log.log("settings did not save\n"+err, log.error)}
}
/**
 * 読み替え一覧を表示する関数
 * @param {Interaction} interaction discordjsのMessage Class
 */
function showReplaces(interaction) {
  interaction.reply({ content: `読み替え一覧です。\n${list()}`, ephemeral: true,})
}
/**
 * /ay read
 */
module.exports = {
  /**
   * @type {ApplicationCommandData} https://discord.js.org/#/docs/main/stable/typedef/ApplicationCommandData
   */
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
  /**
   * コマンド実行時に実行される関数
   * @param {Interaction} interaction discordjsのMessage Class
   */
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