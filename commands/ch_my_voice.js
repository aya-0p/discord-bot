const log = require("../scripts/log.js")
const { changeVoice } = require("../scripts/change_voice.js")
/**
 * /ay ch_my_voice
 */
module.exports = {
  /**
   * @type {ApplicationCommandData} https://discord.js.org/#/docs/main/stable/typedef/ApplicationCommandData
   */
  data: {
  name: "ch_my_voice",
    description: "自分の声を変更する",
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
  /**
   * コマンド実行時に実行される関数
   * @param {discordjs_Interaction} interaction https://discord.js.org/#/docs/main/stable/class/Interaction
   */
  async execute(interaction) {
    changeVoice(interaction.options.getNumber("id"), interaction.user.id)
    interaction.reply({content: `あなたの声を変更しました`,ephemeral: true,})
    log.log(`changed ${interaction.user.username}'s voice to id:${interaction.options.getNumber("id")}`,log.info)
  }
}