/**
 * 実行概要
 * 1.require
 * 2.初期セットアップ
 * 3.testfile()
 * 4.ログイン
 * 
 * ログインに成功し、準備ができたとき
 * 1.初期処理
 * 2.setUpCommands()
 * 
 * メッセージを受信したとき
 * 1.メッセージが作られたとき
 * 
 * interactionを受信したとき
 * 1.interaction
 */
/**
 * require
 */
const { Client, Intents } = require('discord.js')
const { default: axios } = require("axios");
const dotenv = require("dotenv");
const fs = require("fs-extra")
require('date-utils')
const log = require("./scripts/log")
const replys = require("./scripts/autoreply")
const { download } = require("./scripts/download")
const connections = require('./scripts/connections');
/**
 * 初期セットアップ
 */
dotenv.config();
const rpc = axios.create({ baseURL: process.env.voicevox_url, proxy: false });
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_VOICE_STATES, Intents.FLAGS.GUILD_PRESENCES] })
const commands = {}
/**
 * スクリプトを実行するのに必要なファイル等が存在するかを確認する関数
 */
function testFiles() {
  fs.remove('tmp', () => { fs.mkdir('tmp', { recursive: true }, () => { }); }); //tmp(一時フォルダ)作成
  /**
   * VOICEVOXのバージョンを取得し、サーバーがなければスクリプトを終了する
   */
  rpc.get("/version").then(() => { }).catch(() => {
    console.log("Install and run VOICEVOX.");
    process.exit(1);
  })
  /**
   * settings.jsonの存在確認
   */
  try { require("./jsons/settings.json") } catch { fs.writeFileSync('jsons/settings.json', '{"voice":{"default":1},"replaces":{"text":[],"regex":[]}}', 'utf8') }
  /**
   * .envの存在確認
   */
  /*
  try { require("./.env") } catch {
    log.log(".envが存在しません\nsetup.batを実行してください", log.error);
    process.exit(1)
  }*/
  /**
   * replys.jsonの存在確認
   */
  try { require("./jsons/replys.json") } catch { fs.writeFileSync('jsons/replys.json', '[]', 'utf8') }
  /**
   * .logの存在確認
   */
  try { require("./.log") } catch { fs.writeFileSync('.log', '', 'utf8') }
}
/**
 * コマンドを設定する関数
 */
function setUpCommands() {
  const commandFiles = fs.readdirSync('./commands')
    .filter(file => file.endsWith('.js')) //./commands内のすべての*.jsファイルを取得
  for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    commands[command.data.name] = command
  }
  const data = [{
    name: "ay",
    description: "あやのbotコマンド",
    options: [],
  }];
  for (const commandName in commands) {
    data[0].options.push(commands[commandName].data) //data[0].options にコマンドを追加
  }
  client.application?.commands.set(data); //コマンドをセット
}

client.on('ready', () => { //初期処理
  log.log("Version 1.0.3",log.info)
  log.log(`logged in as ${client.user.tag}`, log.info)
  setUpCommands()
  log.log('BOT is ready', log.info)
})

client.on('messageCreate', (message) => { //メッセージが作られたとき
  if (message.author.bot) { //bot無視
    return;
  }
  if (process.env.logall === "true") {
    log.log(`by ${message.author.username} at ${message.createdAt.toFormat("YYYY年MM月DD日HH24時MI分SS秒")} in ${message.channel.name},${message.guild.name},\n${message.content}`, log.message)
    /**
     * @type {Array<URL>}
     */
    const attachedFileUrl = message.attachments?.map(attachment => attachment.url)
    if (attachedFileUrl[0] !== undefined) {
      log.log(`${attachedFileUrl.join("\\n")}`, log.attachments)
      for (let i = 0; i < attachedFileUrl.length; i++) {
        var fileName = attachedFileUrl[i].match(".+/(.+?)([\?#;].*)?$")[1];
        download(attachedFileUrl[i], fileName, i)
      }
    }
  }
  connections.readMessage(message)
  replys.autoReply(message)
});

client.on("interactionCreate", async (interaction) => { //interaction
  if (!interaction.isCommand()) { //コマンドじゃなければ無視
    return;
  }
  if (interaction.commandName === 'ay') {
    log.log(interaction.options.getSubcommand(), log.interaction)
    const command = commands[interaction.options.getSubcommand()];
    try {
      await command.execute(interaction);
    } catch (error) {
      log.log(error,log.error)
      await interaction.reply({
        content: 'There was an error while executing this command!',
        ephemeral: true,
      })
    }
  }
});

testFiles()
log.log("------------------------------\n---------SCRIPT STARTED-------\n------------------------------", log.info);
client.login(process.env.token); //ログイン
