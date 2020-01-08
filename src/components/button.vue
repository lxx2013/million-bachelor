<template>
  <div class="button" :style="buttonStyle" @click="click" tabindex="0" ontouchstart>
    <slot></slot>
    <div v-if="info.length>0" class="info">{{info}}</div>
    <div
      v-if="tooltip.length>0"
      class="tooltip"
      :style="`left:${xx}px; bottom:${yy+30}px`"
      :key="tooltip"
    >{{tooltip}}</div>
    <div class="resurrection" v-if="answer && answer.correctAnswer == index">{{answer.resurrectionNumber}}人复活</div>
  </div>
</template>

<script>
export default {
  name: "Button",
  props: {
    index: {
      type: Number | String
    },
    question: {
      type: Object,
      default: () => { return {} }
    },
    answer: {
      type: Object,
      defautl: () => { return {} }
    }
  },
  data() {
    return {
      clickTimes: 0,
      tooltip: '',
      xx: 0,
      yy: 0,
      tooltipContent: [
        "富强",
        "民主",
        "文明",
        "和谐",
        "自由",
        "平等",
        "公正",
        "法治",
        "爱国",
        "敬业",
        "诚信",
        "友善"
      ]
    }
  },
  computed: {
    info(){
      if(this.answer){
        return `${this.answer.optionNumbers[this.index]}人`
      }
      return ''
    },
    percent() {
      if (this.answer) {
        var sum = this.answer.optionNumbers.reduce((a,b)=>a+b)
        return this.answer.optionNumbers[this.index]/sum *95+5
      }
    },
    buttonStyle() {
      if (this.question && (this.question.yourAnswer == this.index || this.question.selected && this.question.selectedIndex == this.index)) {
        return `background: #6c51f0 !important ;color:white`
      }
      if (this.answer) {
        var answer = this.answer.yourAnswer
        if (answer == this.index && answer != this.answer.correctAnswer) {
          return `background:linear-gradient(to right,#efc4d3 ,#efc4d3 ${this.percent}%,#fefefe ${this.percent+1}%)!important`
        }
        else if (this.index == this.answer.correctAnswer) {
          return `background:linear-gradient(to right,#73bce5,#73bce5 ${this.percent}%,#fefefe ${this.percent+1}%) !important;`
        }
        else{
          return `background:linear-gradient(to right,#ddd,#ddd ${this.percent}%,#fefefe ${this.percent+1}%) !important;`
        }
      }
    }
  },
  methods: {
    click(event) {
      if (this.question) {
        if (!this.question.answerable) {
          this.showTooltip(event, "已经不能提交了噢")
        }
        else if (this.question.selected) {
          this.showTooltip(event, "已经选择过了就不能再选了哦")
        }
        else {
          this.$emit('emitClick', this.index)
          this.question.selected = true
          this.showTooltip(event, "已提交,继续点有彩蛋")
        }
      }
      if (this.answer) {
        this.showTooltip(event)
      }
    },
    showTooltip(ev, msg) {
      this.clickTimes++
      this.xx = ev.layerX
      this.yy = ev.layerY
      if (this.clickTimes == 1) {
        this.tooltip = msg || this.tooltipContent[Math.random() * 24 >> 1]
      }
      else if(this.clickTimes % 10 == 0){
        this.tooltip = `哇,你居然点击了${this.clickTimes}次!`
      }else{
        //第三次及后续点击, 显示社会主义核心价值观
        this.tooltip = this.tooltipContent[Math.random() * 24 >> 1]
      }
    }
  }
};
</script>
<style lang="stylus" scoped>
.button {
  cursor pointer
  perspective 600px
  width 100%
  padding 0.8em 4em
  border-radius 4em
  margin 4vh 0
  background #fefefe
  box-shadow 0 0px 10px 1px rgba(0, 0, 0, 0.2)
  position relative
  transform translateZ(0px)

  &:active {
    transform translateY(5px)
  }

  &:focus {
    outline none
  }

  .info {
    color grey
    font-size 0.8em
    position absolute
    right 0%
    top 50%
    transform translate(-50%, -50%)
  }

  .tooltip {
    padding 0px 3px
    border-radius 4px
    position absolute
    line-height 1.3em
    height 1.2em
    font-weight 400
    font-size 14px
    animation jump 1s ease
    animation-fill-mode both
    color white
    pointer-events none
    background-color rgba(0, 0, 0, 0.8)
    white-space nowrap
  }
  .resurrection{
    position absolute
    line-height  1.5em
    border-radius 0.75em
    padding 0 0.6em
    color white
    font-weight 400
    right 0%
    top 0
    transform translate(-50%,-50%)
    background linear-gradient(to right,#df765d,#d5788f)
  }
}

@keyframes jump {
  0% {
    opacity 0
    transform translateY(20px) rotateX(-45deg)
  }

  25%, 75% {
    opacity 1
    transform translateY(0px) rotateX(0deg)
  }

  100% {
    opacity 0
    transform translateY(-20px) rotateX(45deg)
  }
}
</style>
