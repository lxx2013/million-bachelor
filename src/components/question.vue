<template>
  <div class="question">
    <div class="top">
      <div class="top-left">
        <i class="material-icons">favorite</i>
        复活卡{{question.chance}}
      </div>
      <div class="top-right">
        ●
        {{question.peopleLeft}}人
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
      <div class="options" v-for="(option,index) in question.options" :key="index">
        <div class="button" @click="select(index)">
          <MarkdownText :value="option"/>
        </div>
      </div>
    </section>
    {{question}}
  </div>
</template>
<script>
import Clock from "./clock.vue";
import socket from '../socket'
import MarkdownText from "./MarkdownText.vue";

export default {
  name: 'question',
  components: {
    MarkdownText,
    Clock,
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
    }
  },
  methods: {
    select(index) {
      socket.emit('answer', { answer: index, time: 1000 })
    }
  },
  mounted() {
    this.leftTime = this.question.time/1000
    this.timer = setInterval(()=>{
      this.leftTime = this.leftTime - 1
      if(this.leftTime <=0 ){
        clearInterval(this.timer)
      }
    },1000)
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
      width 20vw
      color white
      background-color pink
    }

    .top-right:first-letter {
      color green
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

    .options {
      .button {
        width 100%
        padding 0.8em 4em
        border-radius 4em
        margin 4vh 0
        background #fefefe
        box-shadow 0 0 20px 1px rgba(0, 0, 0, 0.2)
      }
    }
  }
}
</style>
