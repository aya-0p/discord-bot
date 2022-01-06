const connections = require("../scripts/connections")
/**
 * /ay skip
 */
module.exports = {
  /**
   * @type {ApplicationCommandData} https://discord.js.org/#/docs/main/stable/typedef/ApplicationCommandData
   */
  data: {
    name: "skip",
    description: "音楽をスキップ",
    type: "SUB_COMMAND"
  },
  /**
   * コマンド実行時に実行される関数
   * @param {discordjs_Interaction} interaction https://discord.js.org/#/docs/main/stable/class/Interaction
   */
  async execute(interaction) {
    connections.skip(interaction)
  }
}