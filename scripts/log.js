const dotenv = require("dotenv");
const fs = require("fs-extra")
require('date-utils')
dotenv.config();
const debug = process.env.debug
/**
 * ログモジュール
 */
module.exports = {
  /**
   * ログを色付きで表示、保存する関数
   * @param {String} data ログを残す文字列
   * @param {String} status ログのステータス(debug,info,warning,error,audio,message,interaction,attachments)
   */
  log(data, status) {
    switch (status) {
      case "debug":
        status = `\u001b[36m${status}`
        break;
      case "info":
        status = `\u001b[32m${status}`
        break;
      case "warning":
        status = `\u001b[33m${status}`
        break;
      case "error":
        status = `\u001b[31m${status}`
        break;
      case "audio":
        status = `\u001b[35m${status}`
        break;
      case "message":
        status = `\u001b[35m${status}`
        break;
      case "interaction":
        status = `\u001b[35m${status}`
        break;
      case "attachments":
        status = `\u001b[35m${status}`
        break;
      default:
        break;
    }
    /**
     * @type {Array<String>} 改行で分割したもの
     */
    let splitedDatas = data.split("\n")
    /**
     * @type {String} 時刻
     */
    const theDate = new Date().toFormat("YYYY-MM-DD HH24:MI:SS")
    /**
     * @type {String} 1行ごとのログ内容
     */
    let tempBody
    for (let i = 0; i < splitedDatas.length; i++) {
      if (i == 0) { tempBody = `(${(i + 1).toString().padStart(2, "0")}/${splitedDatas.length.toString().padStart(2, "0")}) ${splitedDatas[i]}` }
      else { tempBody = `\x1b[2m(${(i + 1).toString().padStart(2, "0")}/${splitedDatas.length.toString().padStart(2, "0")}) ${splitedDatas[i]}\x1b[0m` }
      /**
       * @type {String} 表示用ログ内容
       */
      let logShow = `${theDate} | ${status}: \u001b[0m${tempBody}`
      if (debug === "true" || status !== "debug") { console.log(logShow) }
      try {
        /**
         * @type {String} 保存用ログ内容
         */
        let logSave = `${theDate} | ${status}: (${(i + 1).toString().padStart(2, "0")}/${splitedDatas.length.toString().padStart(2, "0")}) ${splitedDatas[i].replaceAll(/\x1b\[../g, "")}`
        fs.appendFileSync('.log', `${logSave}\n`, 'utf8')
      } catch (err) {
        console.log(err)
      }
    }
  },
  /**
   * デバッグ用ログ
   */
  debug: "debug",
  /**
   * 一般ログ
   */
  info: "info",
  /**
   * 警告ログ
   */
  warning: "warning",
  /**
   * エラーログ
   */
  error: "error",
  /**
   * 音声用ログ
   */
  audio: "audio",
  /**
   * メッセージ受信ログ
   */
  message: "message",
  /**
   * インタラクション生成ログ
   */
  interaction: "interaction",
  /**
   * 添付ファイル用ログ
   */
  attachments: "attachments"
}