const connections = require("../scripts/connections")
module.exports = {
  data: {
    name: "join",
    description: "ボイスチャンネルに参加",
    type: "SUB_COMMAND"
  },
  async execute(interaction) {
    connections.join(interaction)
  }
}