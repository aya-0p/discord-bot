const { log2 } = require("../scripts/log.js")
const { changeVoice } = require("../scripts/change_voice.js")
const logStatus = require("../jsons/logStatus.json")
module.exports = {
  data: {
    name: "ch_default_voice",
    description: "デフォルトの声を変更する",
    type: "SUB_COMMAND",
    options: [
      {
        type: "NUMBER",
        name: "id",
        description: "声の名前",
        required: true,
        choices: [
          {value: 0, name: "四国めたん-あまあま"},
          {value: 1, name: "ずんだもん-あまあま"},
          {value: 2, name: "四国めたん-ノーマル"},
          {value: 3, name: "ずんだもん-ノーマル"},
          {value: 4, name: "四国めたん-セクシー"},
          {value: 5, name: "ずんだもん-セクシー"},
          {value: 6, name: "四国めたん-ツンツン"},
          {value: 7, name: "ずんだもん-ツンツン"},
          {value: 8, name: "春日部つむぎ"},
          {value: 9, name: "波音リツ"}
        ]
      }
    ]
  },
  async execute(interaction) {
    changeVoice(interaction.options.getNumber("id"))
    interaction.reply({content: `デフォルトの声を変更しました`,})
    log2(`changed default voice to id:${interaction.options.getNumber("id")}`,logStatus.info)
  }
}