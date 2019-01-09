<template>
  <div class="answer">
    <div class="top">
      <div class="top-left" :class="{'grey' : answer.yourChance < 1}">
        <i class="material-icons">favorite</i>
        <span>复活卡{{answer.yourChance}}</span>
      </div>
      <div class="top-right">
        <b>●</b>
        <span>{{answer.peopleLeft}} 人存活</span>
      </div>
    </div>
    <section class="card">
      <div class="back-clock"></div>
      <div class="clock">
        <div class="avatar" :style='"background-image:url("+playerInfo.avatar+")"'></div>
      </div>
      <div class="title">
        <div class="title-left">第 {{answer.index}} / {{answer.total}} 题</div>
        <div class="title-right">出题人 : 柳哥</div>
      </div>
      <div class="content">
        <MarkdownText :value="answer.question"/>
      </div>
      <div class="options" v-for="(option,index) in answer.options" :key="index">
        <Button :answer="answer" :index="index"><MarkdownText :value="option"/></Button>
      </div>
    </section>
    {{answer}}
    <water-back :percent="100" color="#1787ff" class="water-back"></water-back>
  </div>
</template>
<script>
import Button from "./button.vue"
import Clock from "./clock.vue";
import WaterBack from "./WaterBack.vue"
import socket from '../socket'
import MarkdownText from "./MarkdownText.vue";

export default {
  name: 'answer',
  components: {
    MarkdownText,
    Clock,
    WaterBack,
    Button,
  },
  props: {
    answer:{
      type:Object,
      default: ()=>{return {}}
    },
    playerInfo:{
      type:Object,
      default: ()=>{return {}}
    },
  },
  data() {
    return {
      leftTime: 1000,
      water:0,
      timer:[],
    }
  },
  methods: {
    select(index) {
      socket.emit('answer', { answer: index, time: 1000 })
    }
  },
  mounted() {
    this.leftTime = this.answer.time/1000
    this.timer[0] = setInterval(()=>{
      this.leftTime = this.leftTime - 1
      if(this.leftTime <=0 ){
        clearInterval(this.timer[0])
      }
    },1000)
    this.water = (15000 - this.answer.time) /150
    this.timer[1] = setInterval(() => {
          this.water += 102 / ((1000 / 33) * 15);
          if (this.water >= 100) {
            clearInterval(this.timer[1]);
          }
        }, 33);
  }
}
</script>

<style lang="stylus" scoped>
.answer {
  padding 20px

  .top {
    display flex
    flex-direcion row
    justify-content space-between

    .top-left {
      width 100px
      height 33px
      line-height 33px
      border-radius 33px
      color white
      text-align left
      vertical-align center
      background-color rgba(150,150,255,0.8)
      i{
        border-radius 50%
        font-size 20px
        background-color rgba(255,110,142,1)
        width 33px
        height 33px
        line-height 33px
        text-align center
        vertical-align center
      }
      span{
        font-size 14px
        vertical-align top
        padding 0.3em 0 0 0
      }
      &.grey{
        background-color rgba(0,0,0,0.5)
        i{
          background-color rgba(0,0,0,0.2)
        }
      }
    }

    .top-right {
      line-height 33px
      b{
        color rgba(0,255,0,1)
      }
    }
  }

  .card {
    width 100%
    border-radius 10px
    margin-top 5vh
    padding 20px
    background #fafafa
    box-shadow 0 0 20px 1px rgba(0, 0, 0, 0.2), 0 0 10px 1px rgba(0, 0, 0, 0.2)
    font-weight 500
    position relative

    .back-clock {
      position absolute
      top 1.5em
      left 50%
      width 6em
      height 6em
      border-radius 50%
      background #fafafa
      box-shadow 0 0 20px 1px rgba(0, 0, 0, 0.2), 0 0 10px 1px rgba(0, 0, 0, 0.2)
      z-index -1
      transform translate(-50%, -50%) rotate(45deg)
    }

    .clock {
      background blue
      position absolute
      top 0
      left 50%
      width 3em
      height 3em
      border-radius 50%
      transform translate(-50%, -50%)

      .avatar{
        background-size cover
        height 3em
        border-radius 50%
      }

      &:before {
        content ''
        position absolute
        left -1.5em
        width 6em
        height 6em
        border-radius 50%
        background #fafafa
        z-index -1
      }
    }

    .title {
      display flex
      justify-content space-between
      color grey
    }

    .content {
      margin-top 4vh
      text-align left
    }

  }
  .water-back{
    z-index -1
  }
}
</style>

