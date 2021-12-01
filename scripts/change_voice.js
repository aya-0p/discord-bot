const fs = require("fs-extra")
exports.changeVoice = function changeVoice(voiceId, settings, userId) {
  if (!userId) { settings.voice.default = voiceId } else { settings.voice[userId] = voiceId }
  fs.writeFileSync('settings.json', JSON.stringify(settings), 'utf8')
  return(settings)
}