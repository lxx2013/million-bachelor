/// @ts-check

const MBIDStorage = require('./mbidStorage')
const axios = require('axios').default
const stringHash = require('./stringHash')

const NOT_USE_WECHAT = false
const appId = "wxbfeab713561ea29c"
const appSecret = "2facca9696b23da9d79dda2aca8ef663"

const mbidStorage = new MBIDStorage()

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
  if (NOT_USE_WECHAT) {
    let hash = Math.abs(stringHash(socket.conn.remoteAddress + "---" + socket.handshake.headers['user-agent']))
    let tempOpenID = hash.toString(16)
    return {
      avatar: "http://profilepicturesdp.com/wp-content/uploads/2018/06/avatar-profile-pictures-" + (1 + hash % 6) + ".png",
      name: "蜜汁玩家 " + tempOpenID,
      openid: tempOpenID,
    }
  }


  // 微信检查
  let { mbid, wechatCode } = socket.handshake.query

  /** @type {WechatInfo} */
  let tmpUser = mbidStorage.getItem(mbid)
  if (tmpUser) return tmpUser

  if (!wechatCode) return null

  let resp = await axios.get(`https://api.weixin.qq.com/sns/oauth2/access_token?appid=${appId}&secret=${appSecret}&code=${wechatCode}&grant_type=authorization_code`)
  let { access_token, openid } = resp.data
  if (!openid) return null

  let userInfo = await axios.get(`https://api.weixin.qq.com/sns/userinfo?access_token=${access_token}&openid=${openid}&lang=zh_CN`).then(x => x.data)
  if (userInfo.errcode) return null

  tmpUser = {
    avatar: userInfo.headimgurl,
    name: userInfo.nickname,
    openid,
  }
  mbid = mbidStorage.saveItem(tmpUser)
  socket.emit('useMillionBachelorID', mbid)
  return tmpUser
}

/**
 * @param {SocketIO.Socket} socket
 * @returns {Promise<string>}
 */
exports.getAuthRedirectURL = async function (socket) {
  const state = socket.handshake.query.rhost + "?&wechatCode="
  return `https://open.weixin.qq.com/connect/oauth2/authorize?appid=wxbfeab713561ea29c&redirect_uri=http%3A%2F%2Ft.k-on.live%2FwechatLogin&response_type=code&scope=snsapi_userinfo&state=${encodeURIComponent(state)}#wechat_redirect`
}
