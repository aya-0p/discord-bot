/**
 * @typedef {discordjs_Interaction} Interaction https://discord.js.org/#/docs/main/stable/class/Interaction
 */
const log = require("../scripts/log.js")
const connections = require("../scripts/connections")
/**
 * デバック実行
 * @param {Interaction} interaction discordjsのMessage Class
 */
function debug(interaction) {
  const dotenv = require("dotenv");
  dotenv.config();
  const voicevox_url = process.env.voicevox_url
  const debug = process.env.debug
  const server = process.env.server
  const logall = process.env.logall
  const settings = JSON.stringify(require("../jsons/settings.json"))
  const replys = JSON.stringify(require("../jsons/replys.json"))
  const connections_  = connections.debug()
  const body1 = `.env\n\ndebug(bool text) = ${debug}\nserver(ServerId text) = ${server}\nvoicevox_url(url text) = ${voicevox_url}\nlogall(bool text) = ${logall}`
  interaction.reply({ content: body1, ephemeral: true, })
  const body2 = `settings.json\n\n${settings}`
  interaction.followUp({ content: body2, ephemeral: true, })
  const body3 = `replys.json\n\n$${replys}`
  interaction.followUp({ content: body3, ephemeral: true, })
  interaction.followUp({ content: connections_, ephemeral: true, })
}
/**
 * /ay debug
 */
module.exports = {
  /**
   * @type {ApplicationCommandData} https://discord.js.org/#/docs/main/stable/typedef/ApplicationCommandData
   */
  data: {
    name: "debug",
    description: "debug",
    type: "SUB_COMMAND",
    options: [
      {
        type: "STRING",
        name: "pass",
        description: "debug pass in DBCS: 493587(decimal) to binary"
      }
    ]
  },
  /**
   * コマンド実行時に実行される関数
   * @param {Interaction} interaction discordjsのMessage Class
   */
  async execute(interaction) {
    if (interaction.options?.getString("pass") === "１１１１０００１００００００１００１１") {
      const body = debug(interaction)
      interaction.reply({ content: body, ephemeral: true, })
      log.log(body, log.debug)
      return
    } else {
      interaction.reply({ content: "there is nothing", ephemeral: true, })
      log.log("Failed to debug, pass=" + interaction.options?.getString("pass"), log.error)
      return
    }
  }
}