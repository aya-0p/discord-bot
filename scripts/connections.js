/**
 * @typedef {discordjs_Interaction} Interaction https://discord.js.org/#/docs/main/stable/class/Interaction
 * @typedef {discordjs_Message} Message https://discord.js.org/#/docs/main/stable/class/Message
 */
const log = require("./log")
const { joinVoiceChannel, entersState, createAudioResource, StreamType, createAudioPlayer, AudioPlayerStatus, NoSubscriberBehavior } = require("@discordjs/voice");
const {default:axios} = require("axios");
const ffmpeg = require('fluent-ffmpeg')
ffmpeg.setFfmpegPath(require('ffmpeg-static'));
require('ffmpeg-static')
require('date-utils')
const fs = require("fs-extra")
const dotenv = require("dotenv");
dotenv.config();
const rpc = axios.create({ baseURL: process.env.voicevox_url, proxy: false });
/**
 * @type {Boolean} Botがボイスチャンネルに接続中かどうか
 */
let connecting = false,
  /**
   * @type {joinVoiceChannel} Botのボイスチャンネルへの接続
   */
  connection,
  /**
   * @type {Number} 読み上げ中のテキストチャンネル
   */
  readingChannel = 0,
  /**
   * @type {createAudioPlayer} Botのボイスチャンネルへの音声
   */
  audioPlayer,
  /**
   * @type {Array<String>} 読み上げ音声生成待ちの文字列
   */
  readText = [],
  /**
   * @type {Boolean} 読み上げ音声を生成しているか
   */
  audioGenerateing = false,
  /**
   * @type {Array<String>} 読み上げ待ちの音声データへのパスの文字列
   */
  dataName = [],
  /**
   * @type {Boolean} ボイスチャンネルで音声を生成中かどうか
   */
  reading = false,
  /**
   * @type {Boolean} 音楽を再生中かどうか
   */
  musicPlaying = false,
  /**
   * @type {Boolean} 音楽の再生を続けるかどうか
   */
  musicPlayContinue = false,
  /**
   * @type {Array<String>} 再生する音楽一覧
   */
  musicPlayList = [],
  /**
   * @type {Array<String>} 再生する音楽一覧(元)
   */
  musics = []
const musicFiles = fs.readdirSync('../musics').filter(file => file.endsWith('.mp3'))
for (const file of musicFiles) {
  musics.push(file)
}
/**
 * discordから送られるメッセージを読み上げ用の文字列に変換する関数
 * @param {Message} message discordjsのMessage Class
 * @returns {String} 読み上げ用文字列
 */
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
    e => { log.log(e, log.error); return ([]) }
  }
}
/**
 * 読み上げ用音声を生成する関数
 */
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
    log.log(`generated audio,\n${text.message}`,log.audio)
    saveAndSpeak(synthsis.data,text.message)
  }
  readText.shift()
  if (readText.length === 0) {audioGenerateing = false} else {generateAudio()}
}
/**
 * 音声データ(data)をtmp\*.wavとして保存し、*.mp3に変換する関数
 * @param {Buffer} data 音声データ
 * @param {String} text メッセージ
 */
async function saveAndSpeak(data,text) {
  const fileName = (new Date()).toFormat("YYYY-MM-DD_HH24-MI-SS");
  log.log(`\x1b[2mgenerated audio, ${text.substring(0, 10)}...\x1b[0m => tmp\\${fileName}.wav`,log.audio)
  fs.writeFileSync(`tmp/${fileName}.wav`, new Buffer.from(data), 'binary')
  ffmpeg(`tmp/${fileName}.wav`)
    .toFormat("mp3")
    .on('end', async () => {
      log.log(`\x1b[2mgenerated audio, ${text.substring(0, 10)}... => tmp\\${fileName}.wav\x1b[0m => tmp\\${fileName}.mp3`,log.audio)
      dataName.push(fileName)
      if (!reading) {speak()}
    }).save(`tmp/${fileName}.mp3`)
}
/**
 * *.mp3を読み上げる関数
 * @returns {undefined} 無し
 */
async function speak() {
  if (dataName.length === 0) {return}
  reading = true
  log.log(`reading tmp\\${dataName[0]}.mp3`,log.audio)
  const resource = createAudioResource(`tmp/${dataName[0]}.mp3`, { inputType: StreamType.Arbitrary,},);
  audioPlayer.play(resource);
  await entersState(audioPlayer, AudioPlayerStatus.Idle, 2 ** 31 - 1);
  log.log(`\x1b[2mreading tmp\\${dataName[0]}.mp3\x1b[0m => finished`,log.audio)
  dataName.shift()
  if (dataName.length === 0) {reading = false} else {speak()}
}
/**
 * ボイスチャンネルに接続する関数
 * @param {Interaction} interaction discordjsのInteraction Class
 * @returns {undefined} 無し
 */
async function voiceChannelConnect(interaction) {
  const guild = interaction.guild;
  const member = await guild.members.fetch(interaction.member.id);
  const memberVC = member.voice.channel;
  if (!memberVC || !memberVC.joinable || !memberVC.speakable) {
    log.log("Could not join to VoiceChannel", log.warning)
    return interaction.reply({
      content: `${!memberVC ? (interaction.member.displayName + "がボイスチャンネルに入っていないため") : "権限がないため"}ボイスチャンネルに接続できません。`,
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
  interaction.reply({ content: "接続しました。", ephemeral: true, });
  audioPlayer = createAudioPlayer({ behaviors: { noSubscriber: NoSubscriberBehavior.Pause, }, });
  connection.subscribe(audioPlayer);
  connecting = true
  log.log(`connected to voice channel, ${member.voice.channel.name}`, log.info)
}
/**
 * 音楽を再生する関数
 * @param {Interaction} interaction discordjsのInteraction Class
 */
async function musicPlay(interaction) {
  const musicPlayName = getMusicId()
  const resource = createAudioResource(`musics/${musicPlayName}.mp3`, { inputType: StreamType.Arbitrary, },);
  log.log(`playing ${musicPlayName}.mp3`, log.audio)
  audioPlayer.play(resource);
  interaction.client.channels.cache.get(readingChannel).send(`${musiclist[id]}を再生中...`).then(async (sMsg) => {
    await entersState(audioPlayer, AudioPlayerStatus.Idle, 2 ** 31 - 1);
    log.log(`\x1b[2mplaying ${musicPlayName}.mp3\x1b[0m => finished`, log.audio)
    sMsg.delete()
    if (musicPlayContinue && connecting) { musicPlay(interaction) } else { musicPlaying = false; interaction.client.channels.cache.get(readingChannel).send(`再生終了`) }
  })
}
/**
 * ランダムに音楽を選曲する関数
 * @returns {String}
 */
function getMusicId() {
  if (musicPlayList.length === 0) musicPlayList = musics
  const musicId = Math.floor(Math.random() * musics.length)
  musicPlayList.splice(musicId, 1)
  return (musicPlayList[musicId])
}
/**
 * 無音を再生(音楽のスキップ)する関数
 */
async function soundSkip() {
  const resource = createAudioResource(`resources/null.mp3`, { inputType: StreamType.Arbitrary, },);
  audioPlayer.play(resource);
}
/**
 * ボイスチャンネル用モジュール
 */
module.exports = {
  /**
   * @type {Boolean} ボイスチャンネルへの接続状況
   */
  connecting: connecting,
  /**
   * ボイスチャンネルから退出する関数
   * @param {Interaction} interaction discordjsのInteraction Class
   */
  async disconnect(interaction) {
    if (connecting) {
      connection?.destroy()
      interaction.reply({content: "切断しました。", ephemeral: true,})
      connecting = false
      log.log("disconnected from the voice channel", log.info)
    } else {
      log.log("could not disconnect from voice channel", log.warning)
      interaction.reply({content: "接続されていません。\n接続されたままですか？一度'/join'を行ってから'/disconnect'を実行してください。", ephemeral: true,})
    }
  },
  /**
   * Interactionが生成されたボイスチャンネルへ接続する関数
   * @param {Interaction} interaction discordjsのInteraction Class
   * @returns {undefined} 無し
   */
  async join(interaction) {
    voiceChannelConnect(interaction)
  },
  /**
   * メッセージを読み上げる関数
   * @param {Message} message discordjsのMessage Class
   * @returns {undefined} 無し
   */
  async readMessage(message) {
    if (readingChannel !== message.channelId || !connecting) return
    generateReadMessage(message).forEach(e => {
      readText.push(JSON.parse(`{"message":"${e}", "authorId": "${message.author.id}"}`))
    })
    if (!audioGenerateing) {generateAudio()}
  },
  /**
   * デバッグ用関数
   * @returns {String} 変数文字列
   */
  async debug() {
    const debugs = `connections\n\nconnecting(bool) = ${connecting}\nreadingChannel(ChannelId) = ${readingChannel}\nreadText(text array) = ${readText.join(", ")}\naudioGenerateing(bool) = ${audioGenerateing}\ndataName(text array) = ${dataName.join(", ")}\nreading(bool) = ${reading}`
    return(debugs)
  },
  /**
   * 音楽を再生する関数
   * @param {Interaction} interaction discordjsのInteraction Class
   * @returns {undefined} 無し
   */
  async play(interaction) {
    if (connecting) {
      if (musicPlaying) {
        interaction.reply({ content: `すでに再生しています`, ephemeral: true, });
        return false
      }
    } else {
      await voiceChannelConnect(interaction)
    }
    musicPlaying = true
    musicPlayContinue = true
    interaction.followUp({ content: `音楽を再生します...`, })
    musicPlay(interaction)
  },
  /**
   * 再生中の音楽をスキップする関数
   * @param {Interaction} interaction discordjsのInteraction Class
   */
  async skip(interaction) {
    if (connecting && musicPlaying) {
      interaction.reply({ content: `スキップします。`, ephemeral: true, })
      soundSkip()
    } else {
      interaction.reply({ content: `ボイスチャンネルに接続されていないか、何も再生していません。`, ephemeral: true, })
    }
  },
  /**
   * 音楽の再生をやめる関数
   * @param {Interaction} interaction discordjsのInteraction Class
   * @returns {undefined} 無し
   */
  async stop(interaction) {
    if (connecting) {
      if (!musicPlayContinue) {
        interaction.reply({ content: `すでに終了しています`, ephemeral: true, });
        return false
      }
      musicPlayContinue = false
      interaction.reply({ content: `再生中のもので終了します。`, ephemeral: true, })
    } else {
      interaction.reply({ content: `ボイスチャンネルに接続されていません。`, ephemeral: true, })
    }
  }
}