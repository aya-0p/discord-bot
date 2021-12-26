const { Client, Intents } = require('discord.js')
const {default:axios} = require("axios");
const dotenv = require("dotenv");
const fs = require("fs-extra")
require('date-utils')
const logStatus = require("./jsons/logStatus.json")
const { log2 } = require("./scripts/log")
const replys = require("./scripts/autoreply")
const { download } = require("./scripts/download")
const connections = require('./scripts/connections');
dotenv.config();
const rpc = axios.create({ baseURL: process.env.voicevox_url, proxy:false});
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_VOICE_STATES, Intents.FLAGS.GUILD_PRESENCES] })
const commands = {}
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'))
for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  commands[command.data.name] = command
}
fs.remove('tmp', () => {fs.mkdir('tmp',{ recursive: true }, () => {});});
rpc.get("/version").then(() => {}).catch(() => {console.log("Install and run VOICEVOX.");process.exit(1);})

client.on('ready', () => { //初期処理
  log2(`logged in as ${client.user.tag}`, logStatus.info)
  const data = [{
    name: "ay",
    description: "あやのbotコマンド",
    options: [],
  }];
  for (const commandName in commands) {
    data[0].options.push(commands[commandName].data)
  }
  client.application?.commands.set(data,process.env.server);
  log2('BOT is ready', logStatus.info)
})

client.on('messageCreate', (message) => { //メッセージが作られたとき
  if ( message.author.bot ) { //bot無視
    return;
  }
  if (process.env.logall === "true") {
    log2(`by ${message.author.username} at ${message.createdAt.toFormat("YYYY年MM月DD日HH24時MI分SS秒")} in ${message.channel.name},\n${message.content}`, logStatus.message)
    const attachedFileUrl = message.attachments?.map(attachment => attachment.url)
    if (attachedFileUrl[0] !== undefined) {
      log2(`${attachedFileUrl.join("\\n")}`,logStatus.attachments)
      for (let i=0;i<attachedFileUrl.length;i++) {
        var fileName = attachedFileUrl[i].match(".+/(.+?)([\?#;].*)?$")[1];
        download(attachedFileUrl[i],fileName,i)
      }
    }
  }
  connections.readMessage(message)
  replys.autoReply(message)});

client.on("interactionCreate", async (interaction) => { //interaction
  if ( !interaction.isCommand() ) { //コマンドじゃなければ無視
    return;
  }
  if ( interaction.commandName === 'ay' ) {
    log2(interaction.options.getSubcommand(), logStatus.interaction)
    const command = commands[interaction.options.getSubcommand()];
    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        await interaction.reply({
            content: 'There was an error while executing this command!',
            ephemeral: true,
        })
    }
}});

log2("------------------------------\n---------SCRIPT STARTED-------\n------------------------------",logStatus.info);
client.login(process.env.token); //ログイン
