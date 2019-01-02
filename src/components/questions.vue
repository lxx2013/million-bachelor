<template>
  <div class="questions">
    <v-card>
      <v-img
        class="white--text"
        height="100px"
        src="https://cdn.vuetifyjs.com/images/cards/docks.jpg"
      ></v-img>
      <v-card-title>
        <div style="color:grey">第{{quiz.Index}} / {{quiz.Total }} 题</div>
        <div class="questions-title" v-html="quiz.question"></div>
      </v-card-title>
    </v-card>
    <div class="options" v-for="(option,index) in quiz.options" :key="index">
      <v-btn
        color="blue"
        @click="choose(index)"
        style="width:80%;"
        v-html="option"
      ></v-btn>
    </div>
  </div>
</template>

<script>
export default {
  name: "HelloWorld",
  props: {
    quiz: {
      type: Object,
      default: {}
    }
  },
  data() {
    return {
    };
  },
  methods:{
    choose(index){
      this.$emit('choose',index)
    }
  }
};
</script>

<style scoped lang="stylus">
.questions {
  margin 20% 10%

  .options {
    margin 5vh auto
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
