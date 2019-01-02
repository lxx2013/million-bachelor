<template>
  <div id="app">
    <img src="./assets/logo.png">
    <!-- <HelloWorld/> -->
    <form><input type="range" v-model="ppp" max=110 min=0 style="height:10px"></form>
    <div>some text here</div>
    <water-back :percent="ppp" color="#1787ff" class="water-back"></water-back>
  </div>
</template>

<script>
import HelloWorld from "./components/HelloWorld";
import WaterBack from "./components/WaterBack";

export default {
  name: "App",
  components: {
    HelloWorld,
    WaterBack
  },
  data() {
    return {
      ppp: 50
    };
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
}
*{
  margin:0
  padding:0
  user-select: none
}
.water-back{
  z-index:-1
  min-height:100vh
  overflow:hidden
}
</style>
