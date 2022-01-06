const connections = require("../scripts/connections")
/**
 * /ay stop
 */
module.exports = {
  /**
   * @type {ApplicationCommandData} https://discord.js.org/#/docs/main/stable/typedef/ApplicationCommandData
   */
  data: {
    name: "stop",
    description: "次回から音楽を停止",
    type: "SUB_COMMAND"
  },
  /**
   * コマンド実行時に実行される関数
   * @param {discordjs_Interaction} interaction https://discord.js.org/#/docs/main/stable/class/Interaction
   */
  async execute(interaction) {
    connections.stop(interaction)
  }
}