<template>
  <v-container>
    <div class="qe-actions">
      <v-btn @click="importX">导入</v-btn>
      <v-btn @click="exportX">导出</v-btn>
      <v-btn @click="submit" class="yellow">开始游戏</v-btn>
    </div>

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
import downloadFile from "../lib/downloadFile";

export default {
  data() {
    return {
      panels: [true, true],
      quizList: []
    };
  },
  mounted() {
    const useQuizList = data => (this.quizList = data);
    socket.emit("getQuiz");
    socket.on("getQuiz", useQuizList);
    this.useQuizList = useQuizList;
  },
  destroyed() {
    socket.off("getQuiz", this.useQuizList);
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
    exportX() {
      downloadFile("quiz.json", JSON.stringify(this.quizList));
    },
    importX() {
      uploadFile(text => {
        try {
          this.quizList = JSON.parse(text);
        } catch (err) {
          alert("Failed to Import");
        }
      });
    },
    submit() {
      socket.emit("useQuiz", this.quizList);
      alert("DONE");
    }
  },
  components: {
    GMQuizCard
  }
};

var selectFile = document.createElement("input");
var selectFileCallback = null;
selectFile.type = "file";
selectFile.setAttribute("style", "position:absolute;left:0;top:0;opacity:0.01");
selectFile.addEventListener(
  "change",
  () => {
    var files = selectFile.files;
    if (files.length !== 1) return;

    var reader = new FileReader();
    reader.onload = function() {
      if (typeof selectFileCallback !== "function") return;
      selectFileCallback(reader.result);
      selectFileCallback = null;
    };
    reader.readAsText(files[0]);
  },
  false
);

function uploadFile(callback) {
  selectFileCallback = callback;
  selectFile.value = "";
  selectFile.click();
}

</script>

<style>
.qe-actions {
  position: fixed;
  right: 10px;
  top: 10px;
  z-index: 100;
}
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
