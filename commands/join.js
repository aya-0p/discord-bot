const connections = require("../scripts/connections")
module.exports = {
  /**
   * @type {ApplicationCommandData} https://discord.js.org/#/docs/main/stable/typedef/ApplicationCommandData
   */
  data: {
    name: "join",
    description: "ボイスチャンネルに参加",
    type: "SUB_COMMAND"
  },
  /**
   * コマンド実行時に実行される関数
   * @param {discordjs_Interaction} interaction https://discord.js.org/#/docs/main/stable/class/Interaction
   */
  async execute(interaction) {
    connections.join(interaction)
  }
}