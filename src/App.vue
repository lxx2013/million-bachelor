<template>
  <div id="app">
    <Questions :quiz="quiz" :count="count" :colors="colors" v-on:choose="choose"></Questions>
    <water-back :percent="water" color="#1787ff" class="water-back"></water-back>
    <Waiting v-if="isWaiting" keep-alive></Waiting>
  </div>
</template>

<script>
import WaterBack from "./components/WaterBack";
import Questions from "./components/questions";
import Waiting from "./components/waiting";
import io from "socket.io";

var href = "";
if (process.env.NODE_ENV === "development") {
  href = "http://localhost:8801";
} else {
  href = "https://k-on.live";
}

const socket = io.connect(href);
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
      colors: { default: "#ffffffe0", correct: "green", wrong: "#ffffff80" }
    };
  },
  methods: {
    choose(choiceIndex) {
      if (!this.quiz.isChoosed) {
        socket.emit("client choosed", {
          quizIndex: this.quiz.Index,
          choiceIndex
        });
        this.quiz.isChoosed = 1;
        Vue.set(this.quiz, "choiceIndex", choiceIndex);
        clearInterval(this.timer);
      }
    },
    wait(){
      this.isWaiting = true;
      Vue.set(this, "quiz", {});
      var count = 0.08;
      clearInterval(this.timer);
      this.timer = setInterval(() => {
        count += 0.02;
        this.water = 20 + 5 * Math.sin(count);
      }, 33);
    }
  },
  computed: {},
  mounted() {
    this.wait();
    socket.emit("client connected", "Setsuna");
    socket.on("server patchAnswer", count => {
      Vue.set(this, "count", count);
    })
    socket.on("server wait", () => {
      this.wait()
    })
    socket.on("server patchQuestion", singleQuestion => {
      Vue.set(this, "count", []);
      Vue.set(this, "quiz", singleQuestion);
      this.isWaiting = false;
      this.water = 10;
      var limitSeconds = singleQuestion.limitSeconds || 15;
      clearInterval(this.timer);
      this.timer = setInterval(() => {
        this.water += 100 / ((1000 / 33) * limitSeconds);
        if (this.water >= 110) {
          clearInterval(this.timer);
        }
      }, 33);
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
