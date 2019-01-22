<template>
  <div class="WallApp">
    <Lottery v-show="isLottery" :players="luckyStart.players" :winners="luckyStart.winners"></Lottery>
    <Wall v-show="!isLottery"></Wall>
  </div>
</template>

<script>
import Wall from "./components/Wall.vue"
import Lottery from "./components/Lottery.vue"
import socket from "./socket.js"

export default {
  name: 'WallApp',
  components: { Wall, Lottery },
  data() {
    return {
      isLottery: true,
      luckyStart:{ players:[],winners:[]},
    }
  },
  mounted() {
    socket.on('luckyStart', (luckyStart) => {
      this.isLottery = true
      this.luckyStart = luckyStart
    })
  }
}
</script>

<style lang="stylus">
.WallApp {
  position fixed
  top 0
  left 0
  right 0
  bottom 0
}

* {
  margin 0
  padding 0
  box-sizing border-box
}
</style>
