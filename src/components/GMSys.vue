<template>
  <v-container>
    <v-layout row wrap>
      <v-flex pa-1>
        <v-card>
          <v-card-title class="red darken-2 white--text">尬聊统计</v-card-title>
          <v-card-text>
            <p>
              <v-btn @click="socketEmit('fetchStat', 'galiao'),galiaoStat='抓取中...'">
                <v-icon left>refresh</v-icon>抓取最新数据
              </v-btn>
            </p>
            <pre v-text="stats.galiao||'请点击抓取按钮'"></pre>
          </v-card-text>
        </v-card>
      </v-flex>

      <v-flex pa-1>
        <v-card>
          <v-card-title class="purple darken-2 white--text">重置统计</v-card-title>
          <v-card-text>
            <v-btn @click="socketEmit('resetStat', {luckyBlackList:true})">重置抽奖黑名单</v-btn>
            <v-btn @click="socketEmit('resetStat', {galiaoStat:true})">重置尬聊统计</v-btn>
          </v-card-text>
        </v-card>
      </v-flex>

      <v-flex pa-1>
        <v-card>
          <v-card-title class="green darken-2 white--text">修改密码</v-card-title>
          <v-card-text>
            <v-layout>
              <v-text-field
                v-model="password"
                type="password"
                label="管理员密码"
                hint="请提供一个管理员密码"
                counter
                @keypress.enter.prevent="adminPasswd"
              ></v-text-field>
              <v-btn color="primary" :disabled="!password" @click="adminPasswd">修改</v-btn>
            </v-layout>
          </v-card-text>
        </v-card>
      </v-flex>
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
      password: "",
      stats: {}
    };
  },
  mounted() {
    socket.on("lucky", this.onServerUpdate);
    socket.on("fetchStatRespond", o => {
      this.$set(this.stats, o.type, o.text);
    });
  },
  methods: {
    adminPasswd() {
      let { password } = this;
      if (!password) return;
      socket.emit("adminPasswd", { password });
    },
    socketEmit(event, payload) {
      socket.emit(event, payload);
    }
  }
};
</script>

<style>
</style>
