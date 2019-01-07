<template>
  <v-container fluid grid-list-xl>
    <audio :src="bgmFile" ref="bgm" preload="auto"/>

    <v-layout row wrap>
      <v-flex xs12 v-if="isMobile">
        <v-card>
          <v-layout row wrap>
            <v-flex d-flex xs12>
              <v-btn
                :disabled="status === 1 && index < total"
                @click="e('nextQuestion')"
                style="height:64px"
                :class="{'light-green lighten-2': currentQuestionStated && index < total}"
              >
                <div>
                  <v-icon large medium>help</v-icon>
                  <div>发送下一道题</div>
                </div>
              </v-btn>
              <v-btn
                :disabled="status === 2"
                @click="e('showAnswer')"
                style="height:64px"
                :class="{'light-green lighten-2': !currentQuestionStated}"
              >
                <div>
                  <v-icon large medium>gavel</v-icon>
                  <div>发送答案</div>
                </div>
              </v-btn>
            </v-flex>
            <v-flex d-flex xs12>
              <v-btn :disabled="status === 0" @click="e('showWait')">进入等待画面</v-btn>
              <v-btn :disabled="status === 3" @click="e('showScore')">发送得分榜</v-btn>
              <v-btn @click="e('reset',true)">重置</v-btn>
            </v-flex>
          </v-layout>
        </v-card>
      </v-flex>

      <v-flex xs12 v-else>
        <v-btn :disabled="status === 1" @click="e('nextQuestion')">发送下一道题</v-btn>
        <v-btn :disabled="status === 2" @click="e('showAnswer')">发送答案</v-btn>
        <v-btn :disabled="status === 0" @click="e('showWait')">进入等待画面</v-btn>
        <v-btn :disabled="status === 3" @click="e('showScore')">发送得分榜</v-btn>
        <v-btn @click="e('reset')">重置</v-btn>
      </v-flex>

      <v-flex xs12 md7>
        <v-card>
          <v-card-title class="green">
            <v-icon large left>message</v-icon>
            <span class="title font-weight-light">题目</span>
          </v-card-title>

          <v-card-text v-if="question">
            <p style="font-size: 1.3em">
              <MarkdownText :value="question.question"/>
            </p>
            <div>
              <v-btn
                v-for="(opt, idx) in question.options"
                :key="idx"
                :class="{'light-green lighten-2': question.answer.index==idx}"
              >
                <MarkdownText :value="`${opt} (${optionNumbers[idx]})`"/>
              </v-btn>
            </div>
            <div>
              <MarkdownText :value="question.answer.hint"/>
            </div>
          </v-card-text>
          <v-card-text v-else>
            <p>还没有开始游戏...请点击顶部的重置，然后开始发题</p>
          </v-card-text>
        </v-card>
      </v-flex>

      <v-flex xs12 md5>
        <v-card>
          <v-card-title class="blue lighten-2">
            <v-icon large left>pie_chart</v-icon>
            <span class="title font-weight-light">{{ statusText }}</span>
          </v-card-title>

          <v-layout>
            <v-flex xs4 text-xs-center>
              <v-card flat>
                <v-card-title>当前题目</v-card-title>
                <v-card-text>
                  <v-progress-circular
                    :size="80"
                    :width="10"
                    :value="100*index/total"
                    color="teal"
                  >{{ index }}/{{ total }}</v-progress-circular>
                </v-card-text>
              </v-card>
            </v-flex>

            <v-flex xs4 text-xs-center>
              <v-card flat>
                <v-card-title>场上人数</v-card-title>
                <v-card-text>
                  <v-progress-circular
                    :size="80"
                    :width="10"
                    :value="100*peopleLeft/players.length"
                    color="purple"
                  >{{ peopleLeft }}/{{ players.length }}</v-progress-circular>
                </v-card-text>
              </v-card>
            </v-flex>

            <v-flex xs4 text-xs-center>
              <v-card flat>
                <v-card-title>复活人数</v-card-title>
                <v-card-text>
                  <v-progress-circular
                    :size="80"
                    :width="10"
                    :value="100*resurrectionNumber/peopleLeft"
                    color="red"
                  >{{ resurrectionNumber }}/{{ peopleLeft }}</v-progress-circular>
                </v-card-text>
              </v-card>
            </v-flex>
          </v-layout>
        </v-card>
      </v-flex>
    </v-layout>

    <div v-if="!isMobile">
      <GMGuy v-for="player in players" :key="player.openid" :player="player"/>
    </div>
  </v-container>
</template>

<script>
/// <reference path="../../types.d.ts" />
import GMGuy from "./GMGuy.vue";
import MarkdownText from "./MarkdownText.vue";

import socket from "../socket";

export default {
  components: { GMGuy, MarkdownText },
  data() {
    /** @type {ServerToAdmin.Status} */
    var emptyStatus = {
      status: 0,
      resurrectionNumber: 0,
      peopleLeft: 0,
      index: 0,
      total: 1,
      question: null,
      currentQuestionStated: false,
      optionNumbers: [],
      players: []
    };
    return {
      ...emptyStatus,
      isMobile: true,
      bgmFile: require("../assets/questionBGM.ogg")
    };
  },
  watch: {
    status(ns) {
      if (ns === 1) {
        try {
          this.$refs.bgm.play();
        } catch (err) {}
      }
    }
  },
  computed: {
    statusText() {
      let { status } = this;
      if (status === 0) return "空闲";
      if (status === 1) return "用户作答";
      if (status === 2) return "秀答案";
      if (status === 3) return "最终积分榜";
      return `未知的状态 ${status}`;
    }
  },
  mounted() {
    const useStatus = data => {
      Object.assign(this.$data, data);
    };
    this.useStatus = useStatus;
    socket.on("status", useStatus);
    socket.emit("getStatus");

    this.windowResize = () => {
      this.isMobile = window.innerWidth < 700;
    };
    window.addEventListener("resize", this.windowResize, false);
    this.windowResize();
  },
  destroyed() {
    window.removeEventListener("resize", this.windowResize, false);
    socket.off("status", this.useStatus);
  },
  methods: {
    e(event, requireConfirm) {
      if (requireConfirm && !confirm("确认要操作？")) return;
      socket.emit(event);
    }
  }
};
</script>

<style scoped>
.scoreboard {
  border-collapse: collapse;
  width: 100%;
}

.scoreboard th,
.scoreboard td {
  padding: 5px 20px;
}

.scoreboard tr:nth-child(even) {
  background: #eee;
}

.scoreboard tr:hover {
  border-bottom: 1px solid #999;
}
</style>
