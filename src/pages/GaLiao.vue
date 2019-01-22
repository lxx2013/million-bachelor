<template>
  <div class="galiao">
    <div class="msgs" ref="msgBox">
      <div class="emptyNotice">等待主持人发题时，可以在这里尬聊一波...</div>
      <transition-group tag="div">
        <div class="msgItem" v-for="msg in msgs" :key="msg.key">
          <img :src="msg.avatar" class="avatar">
          <!-- <div class="nickname">{{ msg.nickname }}</div> -->
          <div class="text" @click="text=msg.text" @dblclick="send(msg.text)">
            {{ msg.text }}
            <div class="repeat" v-if="msg.repeat" :key="msg.key+msg.repeat">+{{ msg.repeat }}</div>
          </div>
        </div>
      </transition-group>
    </div>
    <div class="sendBox">
      <input
        ref="inputBox"
        type="text"
        v-model="text"
        @keypress.enter="send"
        :placeholder="placeholder"
        @dblclick="send('666')"
      >
      <button class="sendBtn" @click="send">发言</button>
    </div>
  </div>
</template>

<script>
/// <reference path="../../types.d.ts" />

import Vue from "vue";
import socket from "../socket";
import { getPlaceHolder } from "../lib/getPlaceHolder.js";

const UA = window.navigator.userAgent.toLowerCase();

const MAX_HISTORY_COUNT = 50;

export default {
  name: "GaLiao",
  data() {
    return {
      msgs: [],
      text: "",
      placeholder: "点击这里输入...",
      stopScrollingAt: 0
    };
  },
  mounted() {
    socket.on("chat", this.handleChat);
  },
  beforeDestroy() {
    socket.off("chat", this.handleChat);
  },
  methods: {
    /** @param {ServerToUser.Chat} msg */
    handleChat(msg) {
      for (let inMsg of msg.messages) {
        let isRepeat = this.msgs.slice(-10).some(msg => {
          if (msg.text !== inMsg.text) return false;
          msg.repeat++;
          return true;
        });
        if (!isRepeat) {
          this.msgs.push({ ...inMsg, repeat: 0 });
        }
      }
      this.msgs = this.msgs.slice(-MAX_HISTORY_COUNT);
      setTimeout(() => this.scrollToBottom(), 50);
      this.stopScrollingAt = +new Date() + 800;
    },
    scrollToBottom() {
      var mbox = this.$refs.msgBox;
      mbox.scrollTop = mbox.scrollHeight;
      if (this.stopScrollingAt > +new Date())
        setTimeout(() => this.scrollToBottom(), 50);
    },
    send(text) {
      this.placeholder = getPlaceHolder();
      text = typeof text === "string" ? text : this.text.trim();
      if (!text) return;

      socket.emit("chat", {
        text
      });

      this.text = "";
    }
  }
};
</script>

<style scoped lang="stylus">
.galiao {
  box-sizing: border-box;
  position: absolute;
  left: 0;
  top: 0;
  height: 100vh;
  width: 100vw;
  display: flex;
  flex-direction: column;

  .msgs {
    background-color: #fafafa;
    background: linear-gradient(to bottom, #fafafa, #F6F6F6) no-repeat 0 bottom;
    background-size: 100% 60px;
    flex-grow: 1;
    overflow-y: scroll;
    overflow-x: hidden;
    -webkit-overflow-scrolling: touch;
    flex-direction: column;
    display: flex;
  }

  .sendBox {
    border-top: 1px solid #fafafa;
    background: #fafafa;
    padding: 5px;
    box-sizing: border-box;
    height: 48px;
    display: flex;
    flex-basis: 48px;
    flex-shrink: 0;

    input {
      flex-grow: 1;
      border: 0;
      font-size: inherit;
      padding: 5px;
      min-height: 1em;
      user-select: auto;
    }

    .sendBtn {
      background: #1787FF;
      color: #ffffff;
      border-radius: 5px;
      border: 0;
      padding: 5px 20px;
      cursor: pointer;
    }
  }
}

.emptyNotice {
  text-align: center;
  flex-grow: 1;
  padding: 20px;
  margin: auto;
  color: #999;
}

@keyframes zoomin {
  from {
    opacity: 0;
    transform: translateX(-40px) scale(0.4);
  }

  to {
    opacity: 1;
  }
}

@keyframes flyup {
  from {
    transform: translateY(50px);
    opacity: 1;
  }

  to {
    opacity: 0;
  }
}

@keyframes leaveAni {
  from {
    opacity: 1;
  }

  to {
    transform: translateY(-20px);
    opacity: 0;
  }
}

.msgItem {
  text-align: left;
  padding: 10px;
  padding-left: 68px;
  position: relative;
  flex-shrink: 0;

  &.v-enter {
    opacity: 0;
  }

  &.v-enter-to {
    transform-origin: left bottom;
    animation-fill-mode: both;
    animation: zoomin 0.5s;
  }

  &.v-move {
    animation-fill-mode: both;
    animation: flyup 0.5s;
  }

  &.v-leave-active {
    animation: leaveAni 0.5s;
    animation-fill-mode: both;
  }

  img.avatar {
    position: absolute;
    left: 10px;
    top: 10px;
    height: 38px;
    width: 38px;
    border-radius: 5px;
    box-shadow: 0 1px 5px #EEE;
  }

  .text {
    padding: 10px;
    background: #FFF;
    border-radius: 5px;
    word-break: break-all;
    display: inline-block;
    position: relative;
    box-shadow: 0 1px 5px #EEE;
    cursor: pointer;

    .repeat {
      position: absolute;
      right: -10px;
      font-size: 12px;
      padding: 2px 4px;
      top: -10px;
      color: #ffffff;
      background: #F66;
      border-radius: 4px;
      transform-origin: left bottom;
      animation: zoomin 0.2s 1;
    }

    &:before {
      content: ' ';
      width: 0;
      height: 0;
      border: 8px solid transparent;
      border-right-color: #FFF;
      position: absolute;
      right: 100%;
      top: 10px;
    }

    &:hover, &:active {
      color: #1787FF;
    }
  }

  .nickname {
    font-size: 85%;
    color: #FFF;
  }
}
</style>
