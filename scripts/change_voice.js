const fs = require("fs-extra")
let settings = require("../jsons/settings.json")
/**
 * 声を変更する関数
 * @param {Number} voiceId 声のID
 * @param {Number} [userId] ユーザーID
 */
exports.changeVoice = function changeVoice(voiceId, userId) {
  if (!userId) { settings.voice.default = voiceId } else { settings.voice[userId] = voiceId }
  fs.writeFileSync('jsons/settings.json', JSON.stringify(settings), 'utf8')
}