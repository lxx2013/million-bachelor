<template>
  <div id="app">
    <Connect v-if="is('connect')" :playerInfo="playerInfo"></Connect>
    <Waiting v-show="is('wait')"></Waiting>
    <Question v-if="is('question')" :question="question" @emitClick="emitClick"></Question>
    <Answer v-if="is('answer')" :answer="answer" :playerInfo="playerInfo"></Answer>
    <Score v-if="is('score')" :score="score"></Score>
  </div>
</template>

<script>
import Connect from "./components/connect"
import Question from "./components/question"
import Waiting from "./components/waiting"
import Answer from "./components/answer"
import Score from "./components/score"
import socket from "./socket"

export default {
  name: "App",
  components: {
    Connect,
    Question,
    Waiting,
    Answer,
    Score
  },
  data() {
    return {
      state: "connect",
      mountTime :'',
      playerInfo: {},
      question: {},
      answer: {},
      score: {}
    }
  },
  methods: {
    is(str) {
      return str == this.state
    },
    emitClick(index){
      socket.emit('answer',{ answer: index, time:(new Date() - this.mountTime)})
    }
  },
  computed: {},
  mounted() {
    var that = this
    that.mountTime = new Date()
    socket.on("connectInfo", o => {
      that.playerInfo = o
      if (o.redirect) {
        localStorage.setItem("millionBachelorID", "")

        if (/android|iphone|ipad/i.test(navigator.userAgent)) location.href = o.redirect
        else alert("请使用微信登录")
      }
    })
    socket.on("question", o => { that.question = o; that.state = "question" })
    socket.on("wait", () => { that.state = "wait" })
    socket.on("answer", o => { that.answer = o; that.state = "answer" })
    socket.on("score", o => { that.score = o; that.state = "score" })
  }
}
</script>

<style lang="stylus">
#app {
  font-family 'Avenir', Helvetica, Arial, sans-serif
  -webkit-font-smoothing antialiased
  -moz-osx-font-smoothing grayscale
  text-align center
  color #2c3e50
  max-width 450px
  margin 0 auto
}
body{
    background #fafafa
}
* {
  margin 0
  padding 0
  user-select none
  box-sizing border-box
}
</style>
