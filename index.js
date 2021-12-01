const { Client, Intents } = require('discord.js')
const { joinVoiceChannel, entersState, createAudioResource, StreamType, createAudioPlayer, AudioPlayerStatus, NoSubscriberBehavior } = require("@discordjs/voice");
const {default:axios} = require("axios");
const dotenv = require("dotenv");
const fs = require("fs-extra")
require('date-utils')
const ffmpeg = require('fluent-ffmpeg')
require('ffmpeg-static')
let settings = require("./settings.json")
const { log2 } = require("./scripts/log.js")
const { changeVoice } = require("./scripts/change_voice.js")
const { autoReply } = require("./scripts/autoreply.js")
let connection,readCh,player,reading = false,dataName = [],vcConnecting = false,readText = [],gening = false
dotenv.config();
const rpc = axios.create({ baseURL: process.env.voicevox_url, proxy:false});
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_VOICE_STATES, Intents.FLAGS.GUILD_PRESENCES] })
fs.remove('tmp', () => {fs.mkdir('tmp', () => {});});


async function postMsgVoice(message) { //受け取ったメッセージを読み上げ用に変換して genAudio()
  genWords(message)
  readText.push(JSON.parse(`{"message":"${genWords(message)}", "uid": "${message.author.id}"}`))
  if (!gening) {genAudio()}
}

function genWords(message) { //メッセージを置き換え
  let returnMessage1 = `${message.member.displayName}さん、${message}`
  settings.replaces.regex.forEach(r => {
    const rep = new RegExp(r.before, "g")
    returnMessage1 = returnMessage1.replaceAll(rep,r.after)
  })
  settings.replaces.text.forEach(t => {
    returnMessage1 = returnMessage1.replaceAll(t.before,t.after)
  })
  const returnMessage = returnMessage1
  return(returnMessage)
}

async function genAudio() { //readText内の文字を読み上げデータに変換しsaveAndSpeak()
  gening = true
  text = readText[0]
  if (!text?.message || !text?.uid) { return false }
  const vId = settings.voice[text.uid] ?? settings.voice.default
  const audio_query = await rpc.post('audio_query?text=' + encodeURI(text.message) + "&speaker=" + vId);
  const synthsis = await rpc.post("synthesis?speaker=1", JSON.stringify(audio_query.data), {
    responseType: 'arraybuffer',
    headers: {
      "accept": "audio/wav",
      "Content-Type": "application/json"
    }
  });
  log2(`generated audio,\n${text.message}`,"debug")
  readText.shift()
  saveAndSpeak(synthsis.data,text.message)
  if (readText.length === 0) {gening = false} else {genAudio()}
}

async function saveAndSpeak(data,text) { //genAudio()からのデータをいったん*.wavにした後、*.mp3に変換しspeak()
  const fileName = (new Date()).toFormat("YYYY-MM-DD_HH24-MI-SS");
  log2(`\x1b[2mgenerated audio, ${text.substring(0, 10)}...\x1b[0m => D:\\Bot\\tmp\\${fileName}.wav`,"debug")
  fs.writeFileSync(`tmp/${fileName}.wav`, new Buffer.from(data), 'binary')
  ffmpeg(`tmp/${fileName}.wav`)
    .toFormat("mp3")
    .on('end', async () => {
      log2(`\x1b[2mgenerated audio, ${text.substring(0, 10)}... => D:\\Bot\\tmp\\${fileName}.wav\x1b[0m => D:\\Bot\\tmp\\${fileName}.mp3`,"debug")
      dataName.push(fileName)
      if (!reading) {speak()}
    }).save(`tmp/${fileName}.mp3`)
}

async function speak() { //*.mp3を読み上げ
  if (dataName.length === 0) {return false}
  reading = true
  log2(`reading D:\\Bot\\tmp\\${dataName[0]}.mp3`,"debug")
  const resource = createAudioResource(`tmp/${dataName[0]}.mp3`, { inputType: StreamType.Arbitrary,},);
  player.play(resource);
  await entersState(player, AudioPlayerStatus.Idle, 2 ** 31 - 1);
  log2(`\x1b[2mreading D:\\Bot\\tmp\\${dataName[0]}.mp3\x1b[0m => finished`,"debug")
  dataName.shift()
  if (dataName.length === 0) {reading = false} else {speak()}
}

async function join(interaction) { //"/join"の処理
  const guild = interaction.guild;
  const member = await guild.members.fetch(interaction.member.id);
  const memberVC = member.voice.channel;
  if (!memberVC) {
    log2("user does not join the voice channel", "debug")
    return interaction.reply({
      content: "接続先のボイスチャンネルが見つかりません。\n自分が先にボイスチャンネルに入ってください。",
      ephemeral: true,
    });
  }
  if (!memberVC.joinable) {
    log2("BOT does not have authority(join) on this voice channel or voice channel is full", "warn")
    return interaction.reply({
      content: "ボイスチャンネルに接続できません。\nボイスチャンネルがいっぱいであるか、権限がありません",
      ephemeral: true,
    });
  }
  if (!memberVC.speakable) {
    log2("BOT does not have authority(speak) on this voice channel", "warn")
    return interaction.reply({
      content: "VCで音声を再生する権限がありません。\n(基本はボットに管理者権限を渡してください。)",
      ephemeral: true,
    });
  }
  connection = joinVoiceChannel({
    guildId: guild.id,
    channelId: memberVC.id,
    adapterCreator: guild.voiceAdapterCreator,
    selfMute: false,
    selfDeaf: false
  });
  readCh = interaction.channelId;
  interaction.reply({
    content: "接続しました。",
    ephemeral: true,
  });
  player = createAudioPlayer({behaviors: {noSubscriber: NoSubscriberBehavior.Pause,},});
  connection.subscribe(player);
  vcConnecting = true
  log2(`connected to voice channel, ${member.voice.channel.name}`, "info")
}

function disconnect() { //"/disconnect"の処理
  let r
  if (vcConnecting) {
    connection?.destroy()
    log2("disconnected to the voice channel", "info")
    readCh = 0;
    r = true
  } else {r = false}
  return r
}

client.on('ready', () => { //初期処理
  log2(`logged in as ${client.user.tag}`, "info")
  const data = [
    require("./commands/join.json"),
    require("./commands/disconnect.json"),
    require("./commands/addword.json"),
    require("./commands/ch_default_voice.json"),
    require("./commands/ch_my_voice.json")
  ];
  const command = client.application?.commands.set(data,process.env.server);
  log2('BOT is ready', "info")
})

client.on('messageCreate', (message) => { //メッセージが作られたとき
  if ( message.author.bot ) { //bot無視
    return;
  }
  if (process.env.logall) {log2(`message received\nmessaged by ${message.author.username} at ${message.createdAt.toFormat("YYYY年MM月DD日HH24時MI分SS秒")} in ${message.channel.name},\n${message.content}`, "debug")}
  if ( readCh == message.channelId && vcConnecting ) { postMsgVoice(message); } //ボイスチャンネルで読み上げ
  const autorep = autoReply(message.content)
  if (autorep[1]) {
    message.channel.send(autorep[0])
    log2(`automatically replyed,\n${autorep[0]}`, "debug")
  }
  if ( message.content.match(/[\s\S]*https:\/\/discord.com\/channels\/\d+\/\d+\/\d+[\s\S]*/) ) { //discordのメッセージurlの時、embedで表示
    const url2 = message.content.match(/https:\/\/discord.com\/channels\/\d+\/\d+\/\d+/)[0];
    const urlArr = url2.split("/")
    const msg1 =  client.channels.cache.get(urlArr[5])
    if ( msg1 !== undefined ) {
      const msg2_1 = msg1.messages
      msg2_1.fetch(urlArr[6]).then(msg => {
        log2(`old message requested\nmessaged by ${msg.author.username} at ${msg.createdAt.toFormat("YYYY年MM月DD日HH24時MI分SS秒")} in ${msg.channel.name},\n${msg.content}`, "debug");
        const embed = {
          "title": "",
          "description": msg.content,
          "color": 5637116,
          "timestamp": msg.createdAt.toISOString(),
          "author": {
            "name": msg.author.username,
            "url": url2,
            "icon_url": msg.author.displayAvatarURL()
        }};
        message.channel.send({ content: msg.channel.name, embeds:[embed] });
        log2("old message(embed message) sent", "info")
      }).catch(msg2 => {})
}}});

client.on("interactionCreate", async (interaction) => { //interaction(/)
  if ( !interaction.isCommand() ) { //コマンドじゃなければ無視
    return;
  }

  if ( interaction.commandName === 'join' ) { //join
    log2('interaction "join" created', "debug")
    join(interaction);
    return;
  }

  if ( interaction.commandName === 'disconnect' ) { //disconnect
    log2('interaction "disconnect" created', "debug");
    if ( disconnect() ) {
      interaction.reply({
        content: "切断しました。",
        ephemeral: true,
    })} else {
      interaction.reply({
        content: "接続されていません。\n接続されたままですか？一度'/join'を行ってから'/exit'を実行してください。",
        ephemeral: true,
    })}
    vcConnecting = false
    return;
  }

  if ( interaction.commandName === 'ch_default_voice' ) {
    settings = changeVoice(interaction.options.getString("id"), settings)
    interaction.reply({content: `デフォルトの声を変更しました`,})
    log2(`changed default voice to id:${interaction.options.getNugetStringmber("id")}`,"info")
  }

  if ( interaction.commandName === 'ch_my_voice' ) {
    settings = changeVoice(interaction.options.getString("id"), settings, interaction.user.id)
    interaction.reply({content: `あなたの声を変更しました`,ephemeral: true,})
    log2(`changed ${interaction.user.name}'s voice to id:${interaction.options.getString("id")}`,"info")
  }
  
  if ( interaction.commandName === 'addword' ) {
    const a = interaction.options.getString("before")
    const b = interaction.options.getString("after")
    interaction.reply({content: `文字を置き換えて読みます。\n${a} => ${b}`,})
    log2(`replaces added(regex is ${interaction.options?.getBoolean("regex")}),\n${a} => ${b}`, "info")
    if (interaction.options?.getBoolean("regex")) {
      settings.replaces.regex.push(JSON.parse(`{"before": "${a}","after": "${b}"}`));
      try {fs.writeFileSync('settings.json', JSON.stringify(settings), 'utf8')} catch (err) {console.log(err)}
    } else {
      settings.replaces.text.push(JSON.parse(`{"before": "${a}","after": "${b}"}`));
      try {fs.writeFileSync('settings.json', JSON.stringify(settings), 'utf8')} catch (err) {console.log(err)}
}}});

log2("------------------------------\n---------SCRIPT STARTED-------\n------------------------------","info");
client.login(process.env.token); //ログイン