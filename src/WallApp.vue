<template>
  <div class="galiao">
    <wechatWall :messages="queue.slice(-3)"></wechatWall>
  </div>
</template>

<script>
/// <reference path="../types.d.ts" />

import Vue from "vue";
import socket from "./socket";
import wechatWall from "./components/wechatWall.vue";

function randPick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export default {
  name: "GaLiaoWall",
  components: {
    wechatWall
  },
  data() {
    return {
      msgs: [],
      queue: []
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
      this.queue = this.queue.concat(msg.messages);
    },
  }
};
</script>

<style lang="stylus">
ul, li {
  margin: 0px;
  padding: 0;
  box-sizing: border-box;
}

.galiao {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  max-width: 450px;
  margin: 0 auto;
  box-sizing: border-box;
  position: absolute;
  left: 0;
  top: 0;
  height: 100vh;
  width: 100vw;
  display: flex;
  flex-direction: column;
}
</style>
