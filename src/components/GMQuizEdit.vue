<template>
  <v-container>
    <v-btn fixed dark fab bottom right color="pink" @click="submit">
      <v-icon>done</v-icon>
    </v-btn>
    <transition-group name="quiz-list" tag="div">
      <GMQuizCard
        class="quiz-list-item"
        v-for="(quiz,index) in quizList"
        :key="quiz.uid"
        :title="`问题 ${index+1}`"
        :quiz="quiz"
        :isFirst="index===0"
        :isLast="index===quizList.length-1"
        @up="quizList.splice(index,1),quizList.splice(index-1,0,quiz)"
        @down="quizList.splice(index,1),quizList.splice(index+1,0,quiz)"
        @delete="quizList.splice(index,1)"
      />
    </transition-group>

    <div style="text-align:center">
      <v-btn color="primary" @click="newQuiz">添加题目</v-btn>
    </div>
  </v-container>
</template>

<script>
import GMQuizCard from "./GMQuizCard.vue";
import socket from "../socket";

export default {
  data() {
    return {
      panels: [true, true],
      quizList: []
    };
  },
  mounted() {
    const useQuizList = data => (this.quizList = data);
    socket.emit("admin getQuiz");
    socket.on("server allQuiz", useQuizList);
    this.useQuizList = useQuizList;
  },
  destroyed() {
    socket.off("server allQuiz", this.useQuizList);
  },
  methods: {
    newQuiz() {
      this.quizList.push({
        uid: Math.round(Math.random() * 1000).toString(36),
        question: "",
        options: ["", "", "", ""],
        answer: {
          index: 0,
          hint: ""
        }
      });
    },
    submit() {
      socket.emit("admin setQuiz", this.quizList);
      alert('DONE')
    }
  },
  components: {
    GMQuizCard
  }
};
</script>

<style>
.quiz-list-item {
  transition: all 0.7s;
}
.quiz-list-enter,
.quiz-list-leave-to {
  opacity: 0;
}
.quiz-list-leave-active {
  position: absolute;
}
</style>
