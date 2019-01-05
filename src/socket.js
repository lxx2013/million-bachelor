import io from 'socket.io'

// socket.io 的调试信息没卵用
// if (process.env.NODE_ENV !== 'production') {
//   localStorage.debug = '*'
// }

const WS_PATH = "?ref=" + encodeURIComponent(location.pathname)
const WS_SERVER = (process.env.NODE_ENV === "development") ? `http://${location.hostname}:8801/${WS_PATH}` : `https://k-on.live/${WS_PATH}`
const socket = io.connect(WS_SERVER)
export default socket
