<template>
  <div class="galiao">
    <wechatWall :messages="msgs"></wechatWall>
  </div>
</template>

<script>
/// <reference path="../types.d.ts" />

import Vue from "vue";
import socket from "./socket";
import wechatWall from "./components/wechatWall.vue";
import { getPlaceHolderMsg } from "./lib/getPlaceHolder.js";

function remove(arr, item) {
  if (arr.length) {
    const index = arr.indexOf(item)
    if (index > -1) {
      return arr.splice(index, 1)
    }
  }
}

/** 默认新消息的持续时间, 单位 ms */
const DEFAULT_TIME = 1000
/** 默认新消息的时间加成, 单位 ms/字 */
const LENGTH_TIME = 200
/** 被复读的消息刷新后的持续时间, 单位 ms */
const REPEAT_TIME = 3000

export default {
  name: "GaLiaoWall",
  components: {
    wechatWall
  },
  data() {
    return {
      msgs: Array.from({ length: 3 }, getPlaceHolderMsg),
      queue: [],
      timer: 0
    };
  },
  mounted() {
    socket.on("chat", this.handleChat);
    this.timer = setTimeout(this.update, 100);
  },
  beforeDestroy() {
    socket.off("chat", this.handleChat);
  },
  methods: {
    /**
     * 接收服务器推送的新信息,处理后放入队列 queue 中
     * @param {ServerToUser.Chat} msg
     */
    handleChat(msg) {
      for (let i of msg.messages) {
        //如果有相同信息, 即复读了, 则立即更新页面, 初始时 timeOut 为正常值, 每额外一次 repeat 都重置时间
        let x = this.msgs.find(x => x.text == i.text) || this.queue.find(x => x.text == i.text)
        if (x) {
          x.repeats++
          x.timeOut = REPEAT_TIME + x.repeats * 500
        }
        //新的信息
        else {
          i.timeOut = DEFAULT_TIME + LENGTH_TIME * i.text.length
          i.repeats = 0
          this.queue.push(i)
        }
      }
    },
    /**
     * 每隔100ms执行一次该函数,检测超时的老消息(采用 LRU 替换策略), 推新消息上墙
     */
    update() {
      for (let i of this.msgs) {
        i.timeOut -= 100
      }
      if (this.queue.length > 0) {
        let i = this.msgs.reduce((a, b) => a.timeOut < b.timeOut ? a : b)
        if (i.timeOut <= 0 || i.isPlaceHolder) {
          remove(this.msgs, i)
          this.msgs.push(this.queue.shift())
        }
      }
      this.timer = setTimeout(this.update, 100);
    }
  }
};
</script>

<style lang="stylus">
ul, li {
  margin 0px
  padding 0
  box-sizing border-box
}

.galiao {
  font-family 'Avenir', Helvetica, Arial, sans-serif
  -webkit-font-smoothing antialiased
  -moz-osx-font-smoothing grayscale
  text-align center
  color #2c3e50
  max-width 450px
  margin 0 auto
  box-sizing border-box
  position absolute
  left 0
  top 0
  height 100vh
  width 100vw
  display flex
  flex-direction column
}
</style>
