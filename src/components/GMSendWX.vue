<template>
  <v-container>
    <v-layout>
      <v-flex xs12 md6>
        <v-textarea :rows="10" label="获奖人员的OpenID" v-model.lazy="linesRaw" hint="一行一个"></v-textarea>
      </v-flex>

      <v-flex xs12 md6>
        <v-text-field v-model.lazy="passcode" label="红包口令"></v-text-field>
        <v-text-field v-model.lazy="text" label="提示语"></v-text-field>
        <v-btn :disabled="loading" class="primary" @click="submit">发送给 {{ lines.length }} 人</v-btn>
      </v-flex>
    </v-layout>

    <v-layout style="margin-top:100px;">
      <v-flex xs12 md6>
        <v-text-field v-model.lazy="questionnaireUrl" label="问卷链接"></v-text-field>
      </v-flex>
      <v-flex xs12 md6>
        <v-btn :disabled="loading" class="warning" @click="sendQuestionnaire">发送问卷</v-btn>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
import socket from "../socket";

export default {
  data() {
    return {
      linesRaw: "",
      text: "在第 1 轮答题中脱颖而出",
      passcode: "",
      loading: false,
      questionnaireUrl:'https://wj.qq.com/s2/5247499/0f16'
    };
  },
  computed: {
    lines() {
      return this.linesRaw
        .split("\n")
        .map(x => x.trim())
        .filter(x => !!x);
    }
  },
  methods: {
    submit() {
      let { lines, text, passcode } = this;
      if (!lines.length || !text || !passcode) return alert("请检查你的输入");

      this.loading = true;
      socket.emit("sendCode", { text, openIds: lines, passcode });
      setTimeout(() => {
        this.loading = false;
      }, 500);
    },
    sendQuestionnaire(){
      socket.emit("sendQuestionnaire", this.questionnaireUrl);
    }
  }
};
</script>

<style>
</style>
