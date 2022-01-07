/**
 * @typedef {discordjs_Interaction} Interaction https://discord.js.org/#/docs/main/stable/class/Interaction
 * @typedef {discordjs_Message} Message https://discord.js.org/#/docs/main/stable/class/Message
 */
const log = require("./log")
const { VoiceConnectionStatus, joinVoiceChannel, entersState, createAudioResource, StreamType, createAudioPlayer, AudioPlayerStatus, NoSubscriberBehavior } = require("@discordjs/voice");
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
 * @type {Object} connection変数集合
 */
const read = {
  /**
   * @type {Array<String>} 読み上げ音声生成待ちの文字列
   */
  readText: [],
  /**
   * @type {Boolean} 読み上げ音声を生成しているか
   */
  audioGenerateing: false
}






/**
 * @type {Array<String>} 再生する音楽一覧(元)
 */
const musicFiles = fs.readdirSync('musics').filter(file => file.endsWith('.mp3'))
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
  read.audioGenerateing = true
  const text = read.readText[0]
  if (text?.content && text?.author.id) {
    const voiceId = require("../jsons/settings.json").voice[text.author.id] ?? require("../jsons/settings.json").voice.default
    const audio_query = await rpc.post('audio_query?text=' + encodeURI(text.content) + "&speaker=" + voiceId);
    const synthsis = await rpc.post("synthesis?speaker=" + voiceId, JSON.stringify(audio_query.data), {
      responseType: 'arraybuffer',
      headers: {
        "accept": "audio/wav",
        "Content-Type": "application/json"
      }
    });
    log.log(`generated audio,\n${text.content}`,log.audio)
    saveAndSpeak(synthsis.data, text.content, text.guildId)
  }
  read.readText.shift()
  if (read.readText.length === 0) { read.audioGenerateing = false} else {generateAudio()}
}
/**
 * 音声データ(data)をtmp\*.wavとして保存し、*.mp3に変換する関数
 * @param {Buffer} data 音声データ
 * @param {String} text メッセージ
 */
async function saveAndSpeak(data,text,serverid) {
  const fileName = Math.floor(Math.random() * 10000).toString() +"_"+ (new Date()).toFormat("YYYY-MM-DD_HH24-MI-SS");
  log.log(`\x1b[2mgenerated audio, ${text.substring(0, 10)}...\x1b[0m => tmp\\${fileName}.wav`,log.audio)
  fs.writeFileSync(`tmp/${fileName}.wav`, new Buffer.from(data), 'binary')
  ffmpeg(`tmp/${fileName}.wav`)
    .toFormat("mp3")
    .on('end', async () => {
      log.log(`\x1b[2mgenerated audio, ${text.substring(0, 10)}... => tmp\\${fileName}.wav\x1b[0m => tmp\\${fileName}.mp3`,log.audio)
      read[serverid].dataName.push(fileName)
      if (!read[serverid].reading) { speak(serverid)}
    }).save(`tmp/${fileName}.mp3`)
}
/**
 * *.mp3を読み上げる関数
 * @returns {undefined} 無し
 */
async function speak(serverid) {
  if (read[serverid].dataName.length === 0) {return}
  read[serverid].reading = true
  log.log(`reading tmp\\${read[serverid].dataName[0]}.mp3`,log.audio)
  const resource = createAudioResource(`tmp/${read[serverid].dataName[0]}.mp3`, { inputType: StreamType.Arbitrary,},);
  read[serverid].audioPlayer.play(resource);
  await entersState(read[serverid].audioPlayer, AudioPlayerStatus.Idle, 2 ** 31 - 1);
  log.log(`\x1b[2mreading tmp\\${read[serverid].dataName[0]}.mp3\x1b[0m => finished`,log.audio)
  read[serverid].dataName.shift()
  if (read[serverid].dataName.length === 0) { read[serverid].reading = false } else { speak(serverid)}
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
    interaction.reply({
      content: `${!memberVC ? (interaction.member.displayName + "がボイスチャンネルに入っていないため") : "権限がないため"}ボイスチャンネルに接続できません。`,
      ephemeral: true,
    });
    return false
  }
  read[interaction.guildId] = {
    connecting: true,
    musicPlayList: [],
    connection: joinVoiceChannel({
      guildId: guild.id,
      channelId: memberVC.id,
      adapterCreator: guild.voiceAdapterCreator,
      selfMute: false,
      selfDeaf: false
    }),
    readingChannel: interaction.channelId,
    audioPlayer: createAudioPlayer({ behaviors: { noSubscriber: NoSubscriberBehavior.Pause, }, }),
    dataName: [],
    reading: false,
    musicPlaying: false,
    musicPlayContinue: false,
    musicPlayList: [],
    connectingVoiceChannel: memberVC
  }
  interaction.reply({ content: "接続しました。", ephemeral: true, });
  read[interaction.guildId].connection.subscribe(read[interaction.guildId].audioPlayer);
  log.log(`connected to voice channel, ${member.voice.channel.name}`, log.info)
  return true
}
/**
 * 音楽を再生する関数
 * @param {Interaction} interaction discordjsのInteraction Class
 */
async function musicPlay(interaction) {
  const musicPlayName = getMusicId(interaction)
  if (!musicPlayName) {
    interaction.followUp({ content: `再生する音楽がありません`, ephemeral: true, })
    return
  }
  const resource = createAudioResource(`musics/${musicPlayName}`, { inputType: StreamType.Arbitrary, },);
  log.log(`playing ${musicPlayName}`, log.audio)
  read[interaction.guildId].audioPlayer.play(resource);
  interaction.client.channels.cache.get(read[interaction.guildId].readingChannel).send(`${musicPlayName}を再生中...`).then(async (sMsg) => {
    await entersState(read[interaction.guildId].audioPlayer, AudioPlayerStatus.Idle, 2 ** 31 - 1);
    log.log(`\x1b[2mplaying ${musicPlayName}\x1b[0m => finished`, log.audio)
    sMsg.delete()
    if (read[interaction.guildId].musicPlayContinue && read[interaction.guildId].connecting) { musicPlay(interaction) } else { read[interaction.guildId].musicPlaying = false; interaction.client.channels.cache.get(read[interaction.guildId].readingChannel).send(`再生終了`) }
  })
}
/**
 * ランダムに音楽を選曲する関数
 * @returns {String} 曲名
 */
function getMusicId(interaction) {
  if (read[interaction.guildId].musicPlayList.length === 0) { read[interaction.guildId].musicPlayList = fs.readdirSync('musics').filter(file => file.endsWith('.mp3')) }
  const musicId = Math.floor(Math.random() * read[interaction.guildId].musicPlayList.length)
  const r = read[interaction.guildId].musicPlayList[musicId]
  read[interaction.guildId].musicPlayList.splice(musicId, 1)
  return (r)
}
/**
 * 無音を再生(音楽のスキップ)する関数
 */
async function soundSkip(interaction) {
  const resource = createAudioResource(`resources/null.mp3`, { inputType: StreamType.Arbitrary, },);
  read[interaction.guildId].audioPlayer.play(resource);
}
/**
 * ボイスチャンネルへの接続状況を確認して、接続不要なら切断する
 * @param {Message} message discordjsのMessage Class
 */
async function checkConnection(message) {
  const vCStatus = read[message.guildId]?.connection?.state?.status
  if (vCStatus === VoiceConnectionStatus.Destroyed || vCStatus === VoiceConnectionStatus.Disconnected || vCStatus === undefined) {
    destroyConnection(message)
  } else {
    if (!read[message.guildId]?.connectingVoiceChannel?.members.filter(member => !member.user.bot).size) destroyConnection(message)
  }
}
/**
 * ボイスチャンネルから強制切断
 * @param {Message} message discordjsのMessage Class
 */
async function destroyConnection(message) {
  read[message.guildId].connecting = false
  try { read[message.guildId].connection.destroy() } catch { () => { } }
  log.log(`connection destroyed forcibly at${message.guild.name}`, log.audio)
}
/**
 * ボイスチャンネル用モジュール
 */
module.exports = {
  /**
   * ボイスチャンネルから退出する関数
   * @param {Interaction} interaction discordjsのInteraction Class
   */
  async disconnect(interaction) {
    if (read[interaction.guildId].connecting) {
      read[interaction.guildId].connection?.destroy()
      interaction.reply({content: "切断しました。", ephemeral: true,})
      read[interaction.guildId].connecting = false
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
    if (read[message.guildId]?.connecting) await checkConnection(message)
    if (read[message.guildId]?.readingChannel !== message.channelId || !read[message.guildId]?.connecting) return
    generateReadMessage(message).forEach(e => {
      read.readText.push(message)
    })
    if (!read.audioGenerateing) {generateAudio()}
  },
  /**
   * デバッグ用関数
   * @returns {String} 変数文字列
   */
  async debug() {
    return (read)
  },
  /**
   * 音楽を再生する関数
   * @param {Interaction} interaction discordjsのInteraction Class
   * @returns {undefined} 無し
   */
  async play(interaction) {
    if (read[interaction.guildId]?.connecting) {
      if (read[interaction.guildId].musicPlaying) {
        interaction.reply({ content: `すでに再生しています`, ephemeral: true, });
        return false
      }
    } else {
      if(!await voiceChannelConnect(interaction)) return false
    }
    read[interaction.guildId].musicPlaying = true
    read[interaction.guildId].musicPlayContinue = true
    interaction.followUp({ content: `音楽を再生します...`, })
    musicPlay(interaction)
  },
  /**
   * 再生中の音楽をスキップする関数
   * @param {Interaction} interaction discordjsのInteraction Class
   */
  async skip(interaction) {
    if (read[interaction.guildId].connecting && read[interaction.guildId].musicPlaying) {
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
    if (read[interaction.guildId].connecting) {
      if (!read[interaction.guildId].musicPlayContinue) {
        interaction.reply({ content: `すでに終了しています`, ephemeral: true, });
        return false
      }
      read[interaction.guildId].musicPlayContinue = false
      interaction.reply({ content: `再生中のもので終了します。`, ephemeral: true, })
    } else {
      interaction.reply({ content: `ボイスチャンネルに接続されていません。`, ephemeral: true, })
    }
  }
}