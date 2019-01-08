<template>
  <div class="galiao">
    <div class="msgs" ref="msgBox">
      <div class="msgItem" v-for="msg in msgs" :key="msg.key">
        <img :src="msg.avatar" class="avatar">
        <div class="nickname">{{ msg.nickname }}</div>
        <div class="text">{{ msg.text }}</div>
      </div>
    </div>
    <div class="sendBox">
      <input
        ref="inputBox"
        type="text"
        v-model="text"
        @keypress.enter="send"
        :placeholder="placeholder"
      >
      <button @click="send">发言</button>
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

function randPick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getPlaceholder() {
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
    send() {
      this.placeholder = getPlaceholder();
      let text = this.text.trim();
      if (!text) return;

      socket.emit("chat", {
        text
      });

      this.text = "";
      this.$refs.inputBox.focus();
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
    background: #FEE;
    flex-grow: 1;
    overflow: auto;
  }

  .sendBox {
    background: #FDD;
    padding: 5px;
    box-sizing: border-box;
    height: 48px;
    display: flex;
    flex-basis: 48px;
    flex-shrink: 0;

    input {
      flex-grow: 1;
    }

    input, button {
      padding: 5px 10px;
    }
  }
}

.msgItem {
  text-align: left;
  padding: 10px;
  padding-left: 52px;
  padding-bottom: 0;
  position: relative;
  min-height: 52px;

  img.avatar {
    position: absolute;
    left: 10px;
    top: 10px;
    height: 32px;
    width: 32px;
  }

  .text {
    padding: 5px;
    background: #FFF;
  }

  .nickname {
    font-size: 85%;
    color: #999;
  }
}
</style>
<template>
  <div class="galiao">
    <div class="msgs" ref="msgBox">
      <div class="msgItem" v-for="msg in msgs" :key="msg.key">
        <img :src="msg.avatar" class="avatar">
        <div class="nickname">{{ msg.nickname }}</div>
        <div class="text">{{ msg.text }}</div>
      </div>
    </div>
    <div class="sendBox">
      <input
        ref="inputBox"
        type="text"
        v-model="text"
        @keypress.enter="send"
        :placeholder="placeholder"
      >
      <button @click="send">发言</button>
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

function randPick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getPlaceholder() {
  return `等待期间，不如聊聊${randPick(NOUN1)}${randPick(NOUN2)}？`;
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
    send() {
      this.placeholder = getPlaceholder();
      let text = this.text.trim();
      if (!text) return;

      socket.emit("chat", {
        text
      });

      this.text = "";
      this.$refs.inputBox.focus();
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
    background: #FEE;
    flex-grow: 1;
    overflow: auto;
  }

  .sendBox {
    background: #FDD;
    padding: 5px;
    box-sizing: border-box;
    height: 48px;
    display: flex;
    flex-basis: 48px;
    flex-shrink: 0;

    input {
      flex-grow: 1;
    }

    input, button {
      padding: 5px 10px;
    }
  }
}

.msgItem {
  text-align: left;
  padding: 10px;
  padding-left: 52px;
  padding-bottom: 0;
  position: relative;
  min-height: 52px;

  img.avatar {
    position: absolute;
    left: 10px;
    top: 10px;
    height: 32px;
    width: 32px;
  }

  .text {
    padding: 5px;
    background: #FFF;
  }

  .nickname {
    font-size: 85%;
    color: #999;
  }
}
</style>
