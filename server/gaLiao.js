/// @ts-check
/// <reference path="../types.d.ts" />

const throttle = require('lodash.throttle');

var MAX_HISTORY_COUNT = 100
var globalCounter = 0

/**
 * @typedef {Server.ChatMessage} GaLiaoMessage
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

    /** @type {(GaLiaoMessage & {repeatedBy: string[]})[]} */
    this.uniqueMsgs = []

    this.flush = throttle(this.flush, 300, { trailing: true })
  }

  /**
   * 发送消息到用户端
   */
  flush() {
    let { queuedMsgs, historyMsgs } = this
    /** @type {ServerToUser.Chat} */
    let payload = {
      messages: queuedMsgs.map(x => ({ ...x, userid: void 0 }))
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
    /** @type {GaLiaoMessage} */
    let msgWithKey = {
      key: "m" + (++globalCounter).toString(36),
      ...msg
    }

    this.queuedMsgs.push(msgWithKey)
    console.log(msg)

    if (!this.uniqueMsgs.some(uniqMsg => {
      if (uniqMsg.text === msg.text) {
        uniqMsg.repeatedBy.push(uniqMsg.userid)
        return true
      }
      return false
    })) {
      this.uniqueMsgs.push({ ...msgWithKey, repeatedBy: [] })
    }

    this.flush()
  }

  /**
   * 检查消息是不是复读的
   * @param {string} text
   */
  isRepeat(text) {
    return this.uniqueMsgs.some(msg => msg.text === text)
  }
}

module.exports = GaLiaoRoom
