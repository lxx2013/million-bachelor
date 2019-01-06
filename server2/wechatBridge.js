/// @ts-check

const stringHash = require('./stringHash')

/**
 * @typedef WechatInfo
 * @property {string} avatar
 * @property {string} name
 * @property {string} openid
 */

/**
 * @param {SocketIO.Socket} socket
 * @returns {Promise<WechatInfo>}
 */
exports.getWechatAccount = async function (socket) {
  // return null

  var hash = Math.abs(stringHash(socket.conn.remoteAddress + "---" + socket.handshake.headers['user-agent']))
  var tempOpenID = hash.toString(16)
  return {
    avatar: "http://profilepicturesdp.com/wp-content/uploads/2018/06/avatar-profile-pictures-" + (1 + hash % 6) + ".png",
    name: "蜜汁玩家 " + tempOpenID,
    openid: tempOpenID,
  }
}

/**
 * @param {SocketIO.Socket} socket
 * @returns {Promise<string>}
 */
exports.getAuthRedirectURL = async function (socket) {
  return "http://wx.qq.com/bbccc"
}
