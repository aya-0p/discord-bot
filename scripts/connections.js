const { log2 } = require("./log")
const logStatus = require("../jsons/logStatus.json")
const { joinVoiceChannel, entersState, createAudioResource, StreamType, createAudioPlayer, AudioPlayerStatus, NoSubscriberBehavior } = require("@discordjs/voice");
const {default:axios} = require("axios");
const ffmpeg = require('fluent-ffmpeg')
ffmpeg.setFfmpegPath(require('ffmpeg-static'));
require('ffmpeg-static')
require('date-utils')
const fs = require("fs-extra")
const dotenv = require("dotenv");
dotenv.config();
const rpc = axios.create({ baseURL: process.env.voicevox_url, proxy:false});
let connecting = false,connection,readingChannel = 0,audioPlayer,readText = [],audioGenerateing = false,dataName = [],reading = false

function generateReadMessage(message) {
  try {
    let returnMessage1 = `${message.member.displayName}さん、${message}`
    require("../jsons/settings.json").replaces.regex.forEach(r => {
      const rep = new RegExp(r.before, "g")
      returnMessage1 = returnMessage1.replaceAll(rep, r.after)
    })
    require("../jsons/settings.json").replaces.text.forEach(t => {
      returnMessage1 = returnMessage1.replaceAll(t.before, t.after)
    })
    const reg = new RegExp("https?://[\\w!\\?/\\+\\-_~=;\\.,\\*&@#\\$%\\(\\)'\\[\\]]+", "g")
    returnMessage1 = returnMessage1.replaceAll(reg, "")
    returnMessage1 = returnMessage1.replaceAll("\\", "")
    const msg = returnMessage1.split("\n")
    return (msg);
  } catch {
    e => { log2(e, logStatus.error); return ([]) }
  }
}

async function generateAudio() {
  audioGenerateing = true
  const text = readText[0]
  if (text?.message && text?.authorId) {
    const voiceId = require("../jsons/settings.json").voice[text.authorId] ?? require("../jsons/settings.json").voice.default
    const audio_query = await rpc.post('audio_query?text=' + encodeURI(text.message) + "&speaker=" + voiceId);
    const synthsis = await rpc.post("synthesis?speaker=" + voiceId, JSON.stringify(audio_query.data), {
      responseType: 'arraybuffer',
      headers: {
        "accept": "audio/wav",
        "Content-Type": "application/json"
      }
    });
    log2(`generated audio,\n${text.message}`,logStatus.audio)
    saveAndSpeak(synthsis.data,text.message)
  }
  readText.shift()
  if (readText.length === 0) {audioGenerateing = false} else {generateAudio()}
}

async function saveAndSpeak(data,text) { //genAudio()からのデータをいったん*.wavにした後、*.mp3に変換しspeak()
  const fileName = (new Date()).toFormat("YYYY-MM-DD_HH24-MI-SS");
  log2(`\x1b[2mgenerated audio, ${text.substring(0, 10)}...\x1b[0m => tmp\\${fileName}.wav`,logStatus.audio)
  fs.writeFileSync(`tmp/${fileName}.wav`, new Buffer.from(data), 'binary')
  ffmpeg(`tmp/${fileName}.wav`)
    .toFormat("mp3")
    .on('end', async () => {
      log2(`\x1b[2mgenerated audio, ${text.substring(0, 10)}... => tmp\\${fileName}.wav\x1b[0m => tmp\\${fileName}.mp3`,logStatus.audio)
      dataName.push(fileName)
      if (!reading) {speak()}
    }).save(`tmp/${fileName}.mp3`)
}

async function speak() { //*.mp3を読み上げ
  if (dataName.length === 0) {return false}
  reading = true
  log2(`reading tmp\\${dataName[0]}.mp3`,logStatus.audio)
  const resource = createAudioResource(`tmp/${dataName[0]}.mp3`, { inputType: StreamType.Arbitrary,},);
  audioPlayer.play(resource);
  await entersState(audioPlayer, AudioPlayerStatus.Idle, 2 ** 31 - 1);
  log2(`\x1b[2mreading tmp\\${dataName[0]}.mp3\x1b[0m => finished`,logStatus.audio)
  dataName.shift()
  if (dataName.length === 0) {reading = false} else {speak()}
}

module.exports = {
  connecting: connecting,
  async disconnect(interaction) {
    if (connecting) {
      connection?.destroy()
      interaction.reply({content: "切断しました。", ephemeral: true,})
      connecting = false
      log2("disconnected from the voice channel", logStatus.info)
    } else {
      log2("could not disconnect from voice channel", logStatus.warning)
      interaction.reply({content: "接続されていません。\n接続されたままですか？一度'/join'を行ってから'/disconnect'を実行してください。", ephemeral: true,})
    }
  },
  async join(interaction) {
    const guild = interaction.guild;
    const member = await guild.members.fetch(interaction.member.id);
    const memberVC = member.voice.channel;
    if (!memberVC || !memberVC.joinable || !memberVC.speakable) {
      log2("Could not join to VoiceChannel", logStatus.warning)
      return interaction.reply({
        content: `${!memberVC?(interaction.member.displayName+"がボイスチャンネルに入っていないため"):"権限がないため"}ボイスチャンネルに接続できません。`,
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
    readingChannel = interaction.channelId;
    interaction.reply({content: "接続しました。", ephemeral: true,});
    audioPlayer = createAudioPlayer({behaviors: {noSubscriber: NoSubscriberBehavior.Pause,},});
    connection.subscribe(audioPlayer);
    connecting = true
    log2(`connected to voice channel, ${member.voice.channel.name}`, logStatus.info)
  },
  async readMessage(message) {
    if (readingChannel !== message.channelId || !connecting) {return false}
    generateReadMessage(message).forEach(e => {
      readText.push(JSON.parse(`{"message":"${e}", "authorId": "${message.author.id}"}`))
    })
    if (!audioGenerateing) {generateAudio()}
  }
}