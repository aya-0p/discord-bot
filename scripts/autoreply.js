const log = require("./log")
require('date-utils')
/**
 * 自動返信モジュール
 */
module.exports = {
  /**
   * 自動返信する関数
   * @param {discordjs_Message} message https://discord.js.org/#/docs/main/stable/class/Message
   */
  autoReply(message) {
    const replys = require("../jsons/replys.json")
    /**
     * @param {String} 返信メッセージ
     */
    let repMsg = ""
    /**
     * @param {RegExp} 検索文字列
     */
    let reg
    /**
     * @param {Boolean} 自動返信メッセージが存在するか
     */
    let mat = false
    for (i = 0; i < replys.length; i++) {
      reg = new RegExp(replys[i].regex)
      if (message.content.match(reg)) { repMsg = replys[i].answer; mat = true; break; }
    }
    if (mat) {
      message.channel.send(repMsg)
      log.log(`automatically replyed,\n${repMsg}`, log.debug)
    }
    if (message.content.match(/[\s\S]*https:\/\/discord.com\/channels\/\d+\/\d+\/\d+[\s\S]*/)) {
      const url2 = message.content.match(/https:\/\/discord.com\/channels\/\d+\/\d+\/\d+/)[0];
      const urlArr = url2.split("/")
      const msg1 = message.client.channels.cache.get(urlArr[5])
      if (msg1 !== undefined) {
        const msg2_1 = msg1.messages
        msg2_1.fetch(urlArr[6]).then(msg => {
          log.log(`old message requested\nmessaged by ${msg.author.username} at ${msg.createdAt.toFormat("YYYY年MM月DD日HH24時MI分SS秒")} in ${msg.channel.name},\n${msg.content}`, log.debug);
          const embed = {
            "title": "",
            "description": msg.content,
            "color": 5637116,
            "timestamp": msg.createdAt.toISOString(),
            "author": {
              "name": msg.author.username,
              "url": url2,
              "icon_url": msg.author.displayAvatarURL()
            }
          };
          message.channel.send({ content: msg.channel.name, embeds: [embed] });
          log.log("old message(embed message) sent", log.info)
        }).catch(() => { })
      }
    }
  }
}