<template>
  <div id="app">
    <Connect v-if="is('connect')" :playerInfo="playerInfo"></Connect>
    <Waiting v-show="is('waiting')"></Waiting>
    <Question v-if="is('question')"></Question>
    <Answer v-if="is('answer')"></Answer>
    <Score v-if="is('score')"></Score>
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
      playerInfo: {}
    }
  },
  methods: {
    is(str) {
      return str == this.state
    }
  },
  computed: {},
  mounted() {
    var that = this
    socket.on("connectInfo", o => { that.playerInfo = o })
    socket.on("question", () => { })
    socket.on("wait", () => { })
    socket.on("answer", () => { })
    socket.on("connectInfo", () => { })
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
}

* {
  margin 0
  padding 0
  user-select none
}
</style>
