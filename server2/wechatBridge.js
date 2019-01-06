/// @ts-check

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
  return {
    avatar: "http://profilepicturesdp.com/wp-content/uploads/2018/06/avatar-profile-pictures-3.png",
    name: "蜜汁玩家 " + socket.conn.remoteAddress,
    openid: socket.conn.remoteAddress,
  }
}

/**
 * @param {SocketIO.Socket} socket
 * @returns {Promise<string>}
 */
exports.getAuthRedirectURL = async function (socket) {
  return "http://wx.qq.com/bbccc"
}
