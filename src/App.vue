<template>
  <div id="app">
    <Connect v-if="is('connect')" :playerInfo="playerInfo"></Connect>
    <GaLiao v-show="is('wait')"></GaLiao>
    <Question v-if="is('question')" :question="question" @emitClick="emitClick"></Question>
    <Answer v-if="is('answer')" :answer="answer" :playerInfo="playerInfo"></Answer>
    <Score v-if="is('score')" :score="score"></Score>

    <div class="deadNotice" :class="{hidden:!showDeadNotice}">
      <img src="./assets/cry.jpg" alt class="cryBoy">
      <p>{{ deadMsg }}</p>
      <div class="hideNotice" @click="showDeadNotice=false">观战</div>
    </div>
  </div>
</template>

<script>
/// <reference path="../types.d.ts" />

import Connect from "./pages/connect";
import Question from "./pages/question";
import Answer from "./pages/answer";
import Score from "./pages/score";
import GaLiao from "./pages/GaLiao";
import socket from "./socket";

import { getDeadMsg } from "./lib/getPlaceHolder";

export default {
  name: "App",
  components: {
    Connect,
    Question,
    Answer,
    Score,
    GaLiao
  },
  data() {
    return {
      state: "connect",
      mountTime: "",
      dead: false,
      deadMsg: getDeadMsg(),
      showDeadNotice: false,
      playerInfo: {},
      question: {},
      answer: {},
      score: {}
    };
  },
  methods: {
    is(str) {
      return str == this.state;
    },
    emitClick(index) {
      socket.emit("answer", {
        answer: index,
        time: new Date() - this.mountTime
      });
      Vue.set(this.question, "selected", 1);
      Vue.set(this.question, "selectedIndex", index);
    }
  },
  computed: {},
  mounted() {
    var that = this;
    that.mountTime = new Date();
    socket.on("connectInfo", o => {
      that.playerInfo = o;
      if (o.redirect) {
        localStorage.setItem("millionBachelorID", "");

        if (/android|iphone|ipad/i.test(navigator.userAgent))
          location.href = o.redirect;
        else alert("请使用微信登录");
      }
    });
    socket.on("question", o => {
      that.question = o;
      that.state = "question";
      try {
        navigator.vibrate(300)
      } catch(err){
      }
    });
    socket.on("wait", () => {
      that.state = "wait";
    });
    socket.on(
      "answer",
      /** @param {ServerToUser.Answer} o */ o => {
        that.answer = o;
        that.state = "answer";
        if (!this.dead && o.youDead) {
          this.showDeadNotice = true;
          this.deadMsg = getDeadMsg();
        }
        this.dead = o.youDead;
      }
    );
    socket.on("score", o => {
      this.score = o;
      this.state = "score";
    });
  }
};
</script>

<style lang="stylus">
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  max-width: 450px;
  margin: 0 auto;
}

body {
  background: #fafafa;
}

html, body {
  -webkit-text-size-adjust: 100%;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
}

* {
  margin: 0;
  padding: 0;
  user-select: none;
  box-sizing: border-box;
}

.deadNotice {
  z-index: 100;
  position: fixed;
  background: #FAFAFA;
  left: 10px;
  right: 10px;
  top: 20px;
  color: #333;
  padding: 20px;
  line-height: 2;
  border-radius: 5px;
  box-shadow: 0 1px 10px rgba(#000, 0.3);
  transition: 0.4s ease;

  &.hidden {
    pointer-events: none;
    transform: translateY(-200px);
    opacity: 0;
  }

  .cryBoy {
    max-width: 80%;
    max-height: 40vh;
    border-radius: 100%;
  }

  .hideNotice {
    padding: 10px;
    margin-top: 1em;
    background: #1787ff;
    border-radius: 5px;
    cursor: pointer;
    color: #FFF;
  }
}
</style>
