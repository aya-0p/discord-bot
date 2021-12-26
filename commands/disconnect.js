const connections = require("../scripts/connections")
module.exports = {
  data: {
    name: "disconnect",
    description: "ボイスチャンネルから退出",
    type: "SUB_COMMAND"
  },
  async execute(interaction) {
      connections.disconnect(interaction)
  }
}