<template>
  <div id="app">
    <Questions :quiz="quiz" v-on:choose="choose"></Questions>
    <water-back :percent="water" color="#1787ff" class="water-back"></water-back>
  </div>
</template>

<script>
import WaterBack from "./components/WaterBack";
import Questions from "./components/questions"
import io from 'socket.io'
const socket = io.connect('http://localhost:3001')
export default {
  name: "App",
  components: {
    WaterBack,
    Questions
  },
  data() {
    return {
      quiz:{},
      water:70
    };
  },
  methods:{
    choose(){
      setTimeout(()=>{
        this.quizIndex++
        if(this.quizIndex >= this.quizs.length){
          alert('over!')
        }
      },3000)
    }
  },
  computed:{

  },
  mounted(){
    socket.emit('client connected','Setsuna')
    socket.on('server patchQuestion', singleQuestion =>{
      console.log(this)
      Vue.set(this,'quiz',singleQuestion)
    })
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
