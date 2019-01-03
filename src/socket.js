import io from 'socket.io'

// socket.io 的调试信息没卵用
// if (process.env.NODE_ENV !== 'production') {
//   localStorage.debug = '*'
// }

const WS_SERVER = (process.env.NODE_ENV === "development") ? `http://${location.hostname}:8801` : "https://k-on.live"
const socket = io.connect(WS_SERVER)
export default socket
