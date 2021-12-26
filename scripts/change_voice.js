const fs = require("fs-extra")
let settings = require("../jsons/settings.json")
exports.changeVoice = function changeVoice(voiceId, userId) {
  if (!userId) { settings.voice.default = voiceId } else { settings.voice[userId] = voiceId }
  fs.writeFileSync('jsons/settings.json', JSON.stringify(settings), 'utf8')
}