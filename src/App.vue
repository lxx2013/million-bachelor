<template>
  <div id="app">
    <Questions v-if="!isWaiting" :quiz="quiz" :count="count" :colors="colors"></Questions>
    <water-back :percent="water" color="#1787ff" class="water-back"></water-back>
    <Waiting v-if="isWaiting" keep-alive></Waiting>
  </div>
</template>

<script>
import WaterBack from "./components/WaterBack";
import Questions from "./components/questions";
import Waiting from "./components/waiting";
import socket from "./socket";

export default {
  name: "App",
  components: {
    WaterBack,
    Questions,
    Waiting
  },
  data() {
    return {
      quiz: {},
      water: 20,
      isWaiting: true,
      timer: {},
      count: [],
      colors: { default: "rgba(255,255,255,0.92)", correct: "green", wrong: "rgba(255,255,255,0.5)" }
    };
  },
  methods: {
    wait() {
      this.isWaiting = true;
      this.setTimer(true)
    },
    /**
     * 通过 this.timer 定时器 控制水流 this.water 的高度
     * @param {boolean} isWaiting - true 时就上下波动,false 从下到上
     * @param {number}  limit - 达到 limit 秒数后就 callback
     */
    setTimer(isWaiting, limit ,callback) {
      clearInterval(this.timer);
      if (isWaiting) {
        var count = 0.08;
        this.timer = setInterval(() => {
          count += 0.02;
          this.water = 20 + 5 * Math.sin(count);
          if(limit && count >= (1000/33)*limit*0.02 ){
            clearInterval(this.timer);
            callback()
          }
        }, 33);
      } else {
        this.water = 0;
        clearInterval(this.timer);
        this.timer = setInterval(() => {
          this.water += 102 / ((1000 / 33) * limit);
          if (this.water >= 100) {
            clearInterval(this.timer);
            callback()
          }
        }, 33);
      }
    }
  },
  computed: {},
  mounted() {
    this.wait();
    socket.emit("client connected", "Setsuna");
    socket.on("server patchAnswer", count => {
      Vue.set(this, "count", count);
      this.isWaiting = false;
      this.setTimer(true,10,this.wait)
    });
    socket.on("server wait", () => {
      this.wait();
    });
    socket.on("server patchQuestion", singleQuestion => {
      if (typeof navigator.vibrate === "function") navigator.vibrate(500);
      Vue.set(this, "count", []);
      this.quiz = singleQuestion;
      this.isWaiting = false;
      this.setTimer(false,15,this.wait)
    });
  }
};
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

.water-back {
  z-index -1
  height 100vh
  overflow hidden
}
</style>
