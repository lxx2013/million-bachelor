import io from 'socket.io'

// socket.io 的调试信息没卵用
// if (process.env.NODE_ENV !== 'production') {
//   localStorage.debug = '*'
// }

const wechatCodeRE = /wechatCode=([^&]+)/.exec(location.search)
const wechatCode = wechatCodeRE && wechatCodeRE[1] || ""

const USER_TOKEN = localStorage.getItem("millionBachelorID") || ""
const WS_PATH =
  "?ref=" + encodeURIComponent(location.pathname) +
  "&rhost=" + encodeURIComponent(location.href.replace(/\?.*$/, '')) +
  "&wechatCode=" + encodeURIComponent(wechatCode) +
  "&mbid=" + encodeURIComponent(USER_TOKEN)
const WS_SERVER = (process.env.NODE_ENV === "development") ? `http://${location.hostname}:8801/${WS_PATH}` : `https://k-on.live/${WS_PATH}`
const socket = io.connect(WS_SERVER)
socket.on('useMillionBachelorID', utoken => localStorage.setItem("millionBachelorID", utoken))
export default socket
