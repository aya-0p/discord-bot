/**
 * /ay help
 */
module.exports = {
  /**
   * @type {ApplicationCommandData} https://discord.js.org/#/docs/main/stable/typedef/ApplicationCommandData
   */
  data: {
  name: "help",
    description: "コマンドの使い方を表示",
    type: "SUB_COMMAND",
  },
  /**
   * コマンド実行時に実行される関数
   * @param {discordjs_Interaction} interaction https://discord.js.org/#/docs/main/stable/class/Interaction
   */
  async execute(interaction) {
    interaction.reply({ content: `こちらをご覧ください\nhttps://github.com/aya-0p/discord-bot/blob/main/How-to-use.md`,ephemeral: true,})
  }
}