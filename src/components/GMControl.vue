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
            <v-flex d-flex xs12 style="padding:0 20px">当前{{connectedPlayerCount}}人在线</v-flex>
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

      <v-flex xs12 v-if="!isMobile">
        <v-card>
          <v-card-title class="orange lighten-3">
            <v-icon large left>group</v-icon>
            <span class="title font-weight-light">玩家 ({{connectedPlayerCount}}人在线)</span>
            <v-btn @click="downloadScoreBoard">保存战况</v-btn>
          </v-card-title>
          <div>
            <GMGuy
              v-for="player in players"
              :key="player.openid"
              :player="player"
              full
            >{{ player.score }} 分，{{ player.life }} 命</GMGuy>
          </div>
        </v-card>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
/// <reference path="../../types.d.ts" />
import GMGuy from "./GMGuy.vue";
import MarkdownText from "./MarkdownText.vue";

import socket from "../socket";
import downloadFile from "../lib/downloadFile";

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
    connectedPlayerCount() {
      let ans = 0;
      this.players.forEach(p => {
        if (p.connected) ans++;
      });
      return ans;
    },
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
    },
    downloadScoreBoard() {
      let date = new Date();
      let filename = `scoreboard-${date.getHours()}-${date.getMinutes()}.html`;
      let bestScore = this.players[0].score;
      let winnerPlayers = this.players.filter(
        player => player.score == bestScore
      );
      let content = `<html><head>
      <meta charset="utf-8">
      <style>
        img.avatar { height: 64px; width: 64px; }
      </style>
      <script>
        function fuckavatar(){
          [].forEach.call(document.querySelectorAll('img.avatar'), function(img){ img.parentElement.removeChild(img) })
          alert("头像去除成功，现在可复制整个页面，然后贴入 Excel 里了");
        }
        function onlyAliveGuys(){
          var ta = document.getElementById('aliveGuys')
          ta.style.display='block'
          ta.textContent=${JSON.stringify(
            winnerPlayers.map(x => x.openid).join("\n")
          )}
        }
      <\/script>
      </head><body>
      <button onclick="fuckavatar()">去掉全部头像</button>
      <button onclick="onlyAliveGuys()">
        只查看存活到第 ${bestScore} 题的人的ID
      </button>

      <textarea id="aliveGuys" style="display:none;width:90%;"></textarea>

      <table border="1">
        <tr> <th colspan=2>战况汇报</th>  <td colspan=3>${date.toLocaleString()}</td> </tr>
        <tr> <th>OpenID</th> <th>头像</th>  <th>名字</th> <th>存活题数</th> <th>当前剩余生命数</th> </tr>
        ${this.players
          .map(
            p => `<tr>
                <td>${p.openid}</td>
                <td><img class="avatar" src="${p.avatar}"></td>
                <td>${p.name}</td>
                <td>${p.score}</td>
                <td>${p.life}</td>
              </tr>`
          )
          .join("\n")}
      </table>
      </body></html>`;
      downloadFile(filename, content);
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
