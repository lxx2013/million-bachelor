<template>
  <v-container>
    <v-layout v-if="shown">
      <v-btn :loading="working" color="success" @click="leaveLuckyPhase">退出抽奖环节，回到微信墙</v-btn>
    </v-layout>

    <v-layout v-if="!shown">
      <v-text-field mask="####" v-model.number="count" label="中奖人数"></v-text-field>
      <v-btn :loading="working" color="primary" @click="luckyStart">开始抽奖</v-btn>
    </v-layout>

    <v-layout v-if="!shown">
      <p>当前 {{ playerCount }} 人已经在墙上发布了 {{ messageCount }} 消息</p>
    </v-layout>

    <v-layout v-if="luckyData">
      <GMGuy
        v-for="player in luckyData.winners"
        :key="player.id"
        :player="player"
      >上墙了 {{ player.priority }} 条消息</GMGuy>
    </v-layout>
  </v-container>
</template>

<script>
/// <reference path="../../types.d.ts" />
import GMGuy from "./GMGuy.vue";

import socket from "../socket";

export default {
  components: { GMGuy },
  data() {
    return {
      shown: false,
      working: false,
      count: 5,

      luckyData: null,
      messageCount: 0,
      playerCount: 0
    };
  },
  mounted() {
    socket.on("lucky", this.onServerUpdate);
  },
  destroyed() {
    socket.off("lucky", this.onServerUpdate);
  },
  methods: {
    /** @param {ServerToAdmin.Lucky} incoming */
    onServerUpdate(incoming) {
      Object.assign(this, incoming);
      this.working = false;
    },
    luckyStart() {
      this.working = true;
      socket.emit("luckyStart", { count: this.count });
    },
    leaveLuckyPhase() {
      this.working = false;
      socket.emit("luckyEnd");
    }
  }
};
</script>

<style>
</style>
