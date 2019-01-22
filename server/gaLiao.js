/// @ts-check
/// <reference path="../types.d.ts" />

const throttle = require('lodash.throttle');

var MAX_HISTORY_COUNT = 100
var globalCounter = 0

/**
 * @typedef {ServerToUser.Chat['messages'][0]} GaLiaoMessage
 */

class GaLiaoRoom {
  /**
   * 创建尬聊房间
   * @param {SocketIO.Server} io
   */
  constructor(io) {
    this.io = io
    this.roomName = "chat" + globalCounter++
    this.room = io.to(this.roomName)

    /** @type {GaLiaoMessage[]} */
    this.queuedMsgs = []

    /** @type {GaLiaoMessage[]} */
    this.historyMsgs = []

    this.flush = throttle(this.flush, 300)
  }

  /**
   * 发送消息到用户端
   */
  flush() {
    let { queuedMsgs, historyMsgs } = this
    /** @type {ServerToUser.Chat} */
    let payload = {
      messages: queuedMsgs
    }
    this.queuedMsgs = []
    this.historyMsgs = historyMsgs.concat(queuedMsgs).splice(-MAX_HISTORY_COUNT)
    this.room.emit('chat', payload)
  }

  /**
   * 发送一条消息
   * @param {Omit<GaLiaoMessage, "key">} msg
   */
  send(msg) {
    this.queuedMsgs.push({
      key: "m" + (++globalCounter).toString(36),
      ...msg
    })
    this.flush()
  }

  /**
   * 检查消息是不是复读的
   * @param {string} text
   */
  isRepeat(text) {
    return this.historyMsgs.slice(-10).some(msg => msg.text === text)
  }
}

module.exports = GaLiaoRoom
