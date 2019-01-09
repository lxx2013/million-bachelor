<template>
  <div class="question">
    <div class="top">
      <div class="top-left" :class="{'grey' : question.chance < 1}">
        <i class="material-icons">favorite</i>
        <span>复活卡{{question.chance}}</span>
      </div>
      <div class="top-right">
        <b>●</b>
        <span>{{question.peopleLeft}}人</span>
      </div>
    </div>
    <section class="card">
      <div class="back-clock"></div>
      <div class="clock">
        <Clock :value="leftTime" :max="15"></Clock>
      </div>
      <div class="title">
        <div class="title-left">第 {{question.index}} / {{question.total}} 题</div>
        <div class="title-right">出题人 : 柳哥</div>
      </div>
      <div class="content">
        <MarkdownText :value="question.question"/>
      </div>
      <div class="options" v-for="(option,index) in question.options" :key="index" >
        <Button :question="question" :index="index" @emitClick="index=>$emit('emitClick',index)">
          <MarkdownText :value="option" />
        </Button>
      </div>
    </section>
    {{question}}
    <water-back :percent="water" color="#1787ff" class="water-back"></water-back>
  </div>
</template>
<script>
import Clock from "./clock.vue"
import Button from "./button.vue"
import WaterBack from "./WaterBack.vue"
import socket from '../socket'
import MarkdownText from "./MarkdownText.vue"

export default {
  name: 'question',
  components: {
    MarkdownText,
    Clock,
    WaterBack,
    Button,
  },
  props: {
    question: {
      type: Object,
      default: () => { return {} }
    }
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
    this.leftTime = this.question.time/1000
    this.timer[0] = setInterval(()=>{
      this.leftTime = this.leftTime - 1
      if(this.leftTime <=0 ){
        clearInterval(this.timer[0])
      }
    },1000)
    this.water = (15000 - this.question.time) /150
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
.question {
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

      .svg {
        width 3em
        height 3em
        background blue
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
