<template>
  <div class="galiao">
    <div class="msgs" ref="msgBox">
      <div class="emptyNotice">等待主持人发题时，可以在这里尬聊一波...</div>
      <div class="msgItem" v-for="msg in msgs" :key="msg.key">
        <img :src="msg.avatar" class="avatar">
        <!-- <div class="nickname">{{ msg.nickname }}</div> -->
        <div class="text" @click="text=msg.text" @dblclick="send(msg.text)">{{ msg.text }}</div>
      </div>
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

const MAX_HISTORY_COUNT = 50;
const NOUN1 = "南一楼,南六楼,他,你,上一题,台上,节目,零食,气球".split(",");
const NOUN2 = "好不好玩,帅不帅,美不美,动听不动听,的难度,的姿势,的日常,的表现,的颜色,的吉他".split(
  ","
);
const HINT2 = `双击别人说的话，可以复读
人类的本质，在于双击别人的话
老铁双击666啊
春节快乐，给您拜个早年啦`.split("\n");

function randPick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getPlaceholder() {
  if (Math.random() > 0.6) return randPick(HINT2);
  return `等待时，不如聊聊${randPick(NOUN1)}${randPick(NOUN2)}？`;
}

export default {
  data() {
    return {
      msgs: [],
      text: "",
      placeholder: getPlaceholder()
    };
  },
  mounted() {
    this.handleChat = /** @param {ServerToUser.Chat} msg */ msg => {
      this.msgs = this.msgs.concat(msg.messages).slice(-MAX_HISTORY_COUNT);
      Vue.nextTick(() => this.scrollToBottom());
    };
    socket.on("chat", this.handleChat);
  },
  beforeDestroy() {
    socket.off("chat", this.handleChat);
  },
  methods: {
    scrollToBottom() {
      var mbox = this.$refs.msgBox;
      mbox.scrollTop = mbox.scrollHeight;
    },
    send(text) {
      this.placeholder = getPlaceholder();
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

.msgItem {
  text-align: left;
  padding: 10px;
  padding-left: 68px;
  position: relative;

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
    white-space: pre-wrap;
    word-break: break-all;
    display: inline-block;
    position: relative;
    box-shadow: 0 1px 5px #EEE;
    cursor: pointer;

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
