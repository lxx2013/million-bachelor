<template>
  <div class="questions">
    <v-card style="min-height:80px">
      <v-img
        class="white--text"
        height="100px"
        src="https://cdn.vuetifyjs.com/images/cards/docks.jpg"
      ></v-img>
      <v-card-title style="justify-content:flex-start; align-item:flex-start">
        <div
          style="color:grey;width:100%;text-align:left"
        >第 {{quiz.Index>=0 ? quiz.Index+1 : ''}} / {{quiz.Total }} 题</div>
        <div class="questions-title" v-html="quiz.question"></div>
      </v-card-title>
    </v-card>
    <div class="options" v-for="(option,index) in quiz.options" :key="index">
      <v-btn
        :color="computedColor(index)"
        @click="choose(index)"
        style="width:80%;"
        v-html="option"
      ></v-btn>
      <div class="tooltip" v-show="!isAnswer && hasTooltip && index == tooltip.index">
        <span>{{tooltip.content}}</span>
      </div>
      <span class="status" v-if="!isAnswer">{{ index == quiz.choiceIndex ? '已选择' :''}}</span>
      <span class="status" v-if="isAnswer">{{count[index]}}人</span>
      <span class="dies" v-if="isAnswer && index == quiz.answer.index"> {{dies.length}}人复活 </span>
    </div>
  </div>
</template>

<script>
import socket from "../socket";


export default {
  name: "Questions",
  props: {
    quiz: {
      type: Object,
      default: {}
    },
    count: {
      type: Array,
      default: []
    },
    colors: {
      type: Object,
      default: { default: "blue", correct: "green", wrong: "grey" , miss :"#efc4d3" }
    },
    dies:Array,
    chances:Number,
  },
  data() {
    /**
     * 区别几个 index:
     * choiceIndex            用户重复点击的序号
     * this.quiz.choiceIndex  用户第一次选择(即提交的答案序号)
     * this.quiz.answer.index 正确答案的序号
     * this.tooltip.index     需要显示 tooltip 的序号, 其它的不显示
     */
    return {
      tooltip: { index: -1, content: "" },
      clickTimes:0,
      tooltipContent: [
        "再点也不会加分的!",
        "已经选了就不能更改了哦",
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
    };
  },
  computed: {
    isAnswer() {
      return this.count.length > 0;
    },
    hasTooltip() {
      return this.tooltip.content.length > 0;
    },
  },
  methods: {
    computedColor(index){
      if(this.count.length ==0){
        return this.colors.default
      }
      else if(index == this.quiz.answer.index ){
        return this.colors.correct
      }
      else if(index == this.quiz.choiceIndex){
        return this.colors.miss
      }else{
        return this.colors.wrong
      }
    },
    choose(choiceIndex) {
      if(this.chances == 0){
        this.tooltip.index = choiceIndex;
        this.tooltip.content = "无复活机会,不能再提交,请等待下一轮"
        return
      }
      this.clickTimes++
      if(this.clickTimes == 1){
        //第一次点击, 提交答案
        socket.emit("client choosed", {
          quizIndex: this.quiz.Index,
          choiceIndex
        });
        this.tooltip.index = -1;
        Vue.set(this.quiz, "choiceIndex", choiceIndex);
      }
      else if(this.clickTimes <= 4){
        //第2~4次点击, 判断是否和第一次点击相同, 设置 tooltip 为相应字符串
        this.tooltip.content =
            choiceIndex == this.quiz.choiceIndex
              ? this.tooltipContent[0]
              : this.tooltipContent[1];
        this.tooltip.index = choiceIndex;
      }
      else{
        //第三次及后续点击, 显示社会主义核心价值观
        this.tooltip.content = this.tooltipContent[(Math.random()*24>>1) + 2]
        this.tooltip.index = choiceIndex;
      }
    }
  }
};
</script>

<style scoped lang="stylus">
.questions-title {
  margin-top 5px
  text-align left
}

.questions {
  margin 15vw auto 0
  max-width 400px
  padding 0 3vw

  .options {
    margin 5vh auto
    position relative

    .status {
      position absolute
      margin-left -60px
      margin-top 13px
    }

    .tooltip {
      position absolute
      top -50%
      left 10%
      text-transform initial
      transition 0.15s cubic-bezier(0.25, 0.8, 0.5, 1)
      width 80%

      span {
        background #616161
        box-shadow 0px 3px 1px -2px rgba(0, 0, 0, 0.2), 0px 2px 2px 0px rgba(0, 0, 0, 0.14), 0px 1px 5px 0px rgba(0, 0, 0, 0.12)
        padding 5px 8px
        font-size 12px
        color #fff
        border-radius 2px
      }
    }

    .correct {
      background-color green
    }

    .wrong {
      background-color grey
    }
    .dies{
      position absolute
      margin-top:-10px
      margin-left:-50px
      min-width:50px
      height:20px
      background: linear-gradient(to right,#e0755b, #df7892) no-repeat;
      color: white
      border-radius 20px
      padding 0 5px
    }
  }
}

.custom-loader {
  animation loader 1s infinite
  display flex
}

@keyframes loader {
  from {
    transform rotate(0)
  }

  to {
    transform rotate(360deg)
  }
}
</style>
