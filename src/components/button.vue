<template>
  <div class="button" @click="click" tabindex="0">
    <slot></slot>
    <div v-if="info.length>0" class="info">{{info}}</div>
    <div class="tooltip" :style="`left:${xx}px; bottom:${yy}px`" :key="tooltip">{{tooltip}}</div>
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
      info:'',
      clickTimes: 0,
      tooltip:'',
      xx:0,
      yy:0,
      tooltipContent: [
        "已经选了就不能再选了哦",
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
  methods: {
    click(event) {
      console.log(event)

      if (this.question){
        this.$emit('emitClick',this.index)
        this.info = "已选择"
        this.showTooltip(event)
      }
      if(this.answer){
        this.showTooltip(event)
      }
    },
    showTooltip(ev) {
      this.clickTimes++
      this.xx = ev.layerX
      this.yy = ev.layerY
      if(this.clickTimes == 1){
        this.tooltip = "提交成功"
      }
      else if (this.clickTimes == 2) {
        //第2~4次点击, 判断是否和第一次点击相同, 设置 tooltip 为相应字符串
        this.tooltip = this.tooltipContent[0]
      }
      else {
        //第三次及后续点击, 显示社会主义核心价值观
        this.tooltip = this.tooltipContent[(Math.random() * 24 >> 1) + 1]
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
  box-shadow 0 0 20px 1px rgba(0, 0, 0, 0.2)
  position relative


  &:active {
    transform translateY(5px)
  }

  .info{
    color grey
    font-size 0.8em
    position absolute
    right 0%
    top 50%
    transform translate(-50%,-50%)
  }
  .tooltip{
    padding 5px 10px
    position absolute
    animation jump 1s ease
    animation-fill-mode both
    color white
    pointer-events none
    background-color rgba(0,0,0,0.8)
  }
}
@keyframes jump {
  0%{
    opacity 0
    transform: translateY(20px) rotateX(-45deg)
  }
  25%, 75%{
    opacity 1
    transform: translateY(0px) rotateX(0deg)
  }
  100%{
    opacity 0
    transform: translateY(-20px) rotateX(45deg)
  }
}
</style>
