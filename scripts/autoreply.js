exports.autoReply = function autoReply(message) {
  const replys = require("../replys.json")
  let repMsg = ""
  let reg
  let mat = false
  for (i=0; i < replys.length; i++) {
    reg = new RegExp(replys[i].regex)
    if (message.match(reg)) {repMsg = replys[i].answer;mat=true;break;}
  }
  return([repMsg, mat])
}