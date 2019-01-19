/// @ts-check

const MBIDStorage = require('./mbidStorage')
const axios = require('axios').default
const stringHash = require('./stringHash')

let NOT_USE_WECHAT = true
let appId = ""
let appSecret = ""

const mbidStorage = new MBIDStorage()

const getAccessToken = (function () {
  var lastToken = ""
  var expiresAt = 0

  return async function () {
    let now = +new Date
    if (now < expiresAt) return lastToken

    let resp = await axios(`https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${appId}&secret=${appSecret}`).then(x => x.data)
    lastToken = resp.access_token
    expiresAt = resp.expires_in * 1000 + now

    return lastToken
  }
})()

/**
 * @param {string} _appId
 * @param {string} _appSecret
 * @param {boolean} _emulateWechat 不强制用户使用微信登录
 */
exports.init = function(_appId, _appSecret, _emulateWechat) {
  appId = _appId
  appSecret = _appSecret
  NOT_USE_WECHAT = _emulateWechat
}

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

/**
 * @param {string} touser
 * @param {string} template_id
 * @param {string} url
 * @param {Record<string,string|{value:string,color:string}>} data
 */
exports.sendTemplateMessage = async function (touser, template_id, url, data) {
  let access_token = await getAccessToken()

  let newData = {}
  for (let key in data) {
    let value = data[key]
    if (typeof value === 'string') newData[key] = { value, color: "#173177" }
    else newData[key] = value
  }

  await axios.post(`https://api.weixin.qq.com/cgi-bin/message/template/send?access_token=${access_token}`, {
    touser,
    template_id,
    url,
    topcolor: "#FF0000",
    data: newData,
  })
}
