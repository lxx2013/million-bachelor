<template>
  <div class="questions">
    <v-card style="min-height:80px">
      <v-img
        class="white--text"
        height="100px"
        src="https://cdn.vuetifyjs.com/images/cards/docks.jpg"
      ></v-img>
      <v-card-title style="justify-content:flex-start; align-item:flex-start">
        <div style="color:grey;width:100%;text-align:left">第 {{quiz.Index>=0 ? quiz.Index+1 : ''}} / {{quiz.Total }} 题</div>
        <div class="questions-title" v-html="quiz.question"></div>
      </v-card-title>
    </v-card>
    <div class="options" v-for="(option,index) in quiz.options" :key="index">
      <v-btn
        :color="count.length==0 ? colors.default : (index == quiz.answer.index ? colors.correct : colors.wrong)"
        @click="choose(index)"
        style="width:80%;"
        v-html="option"
      ></v-btn>
      <v-tooltip left v-show="isAnswer&&index == quiz.answer.index" v-model="isAnswer">{{quiz.answer.hint}}}</v-tooltip>
      <span v-if="!isAnswer">{{ index == quiz.choiceIndex ? '已选择' :''}}</span>
      <span v-if="isAnswer">{{count[index]}}人</span>
    </div>
  </div>
</template>

<script>
export default {
  name: "Questions",
  props: {
    quiz: {
      type: Object,
      default: {}
    },
    count:{
      type:Array,
      default:[]
    },
    colors:{
      type:Object,
      default:{default:'blue',correct:'green',wrong:'grey'}
    }
  },
  data() {
    return {
    };
  },
  computed:{
    isAnswer(){
      return this.count.length > 0
    }
  },
  methods:{
    choose(index){
      this.$emit('choose',index)
    }
  }
};
</script>

<style scoped lang="stylus">
.questions-title{
  margin-top:5px
  text-align:left
}
.questions {
  margin 15vw 5vh 0

  .options {
    margin 5vh auto
    span{
      position:absolute
      margin-left:-60px
      margin-top:15px
    }
    .correct{
      background-color: green
    }
    .wrong{
      background-color: grey
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
