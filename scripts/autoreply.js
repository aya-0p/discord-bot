const { log2 } = require("./log")
const logStatus = require("../jsons/logStatus.json")
require('date-utils')
module.exports = {
    autoReply(message) {
    const replys = require("../jsons/replys.json")
    let repMsg = ""
    let reg
    let mat = false
    for (i=0; i < replys.length; i++) {
      reg = new RegExp(replys[i].regex)
      if (message.match(reg)) {repMsg = replys[i].answer;mat=true;break;}
    }
    if (mat) {
      message.channel.send(repMsg)
      log2(`automatically replyed,\n${repMsg}`, logStatus.debug)
    }
    if ( message.content.match(/[\s\S]*https:\/\/discord.com\/channels\/\d+\/\d+\/\d+[\s\S]*/) ) {
      const url2 = message.content.match(/https:\/\/discord.com\/channels\/\d+\/\d+\/\d+/)[0];
      const urlArr = url2.split("/")
      const msg1 =  message.client.channels.cache.get(urlArr[5])
      if ( msg1 !== undefined ) {
        const msg2_1 = msg1.messages
        msg2_1.fetch(urlArr[6]).then(msg => {
          log2(`old message requested\nmessaged by ${msg.author.username} at ${msg.createdAt.toFormat("YYYY年MM月DD日HH24時MI分SS秒")} in ${msg.channel.name},\n${msg.content}`, logStatus.debug);
          const embed = {
            "title": "",
            "description": msg.content,
            "color": 5637116,
            "timestamp": msg.createdAt.toISOString(),
            "author": {
              "name": msg.author.username,
              "url": url2,
              "icon_url": msg.author.displayAvatarURL()
          }};
          message.channel.send({ content: msg.channel.name, embeds:[embed] });
          log2("old message(embed message) sent", logStatus.info)
        }).catch(msg2 => {})
      }
    }
  }
}