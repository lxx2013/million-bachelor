<template>
  <v-container>
    <div class="qe-actions">
      <v-btn @click="importX">导入</v-btn>
      <v-btn @click="exportX">导出</v-btn>
      <v-btn @click="submit" class="yellow">使用这套题</v-btn>
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
/// <reference path="../../types.d.ts" />

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
          var wb = XLSX.read(text, { type: 'binary' })
          var data = this.to_json(wb)
          this.quizList = this.ws_to_quizList(data)
        } catch (err) {
          alert("Failed to Import", err);
        }
      });
    },
    submit() {
      socket.emit("useQuiz", this.quizList);
      alert("已启用这套题，请进入流程控制界面。");
    },
    /**
     * 把 js-xlsx 工具的 workbook 读取到的 json 数据转为答题系统需要的题目
     * @returns Server.Question[]
     * */
    ws_to_quizList(data) {
      var rows = []
      if (typeof data == 'string') data = JSON.parse(data)
      if (typeof data == 'object') {
        for (let i in data) {
          rows = rows.concat(data[i])
        }
      }
      rows = rows.filter(x => parseInt(x[0]) >= 0)
      return rows.map((x, index) => {
        return {
          uid: x[1] + index,
          question: x[3],
          author: x[2],
          options: [x[4], x[5], x[6], x[7]],
          answer: { index: this.filterAnwser(x[8],index), hint: "" }
        }
      })
    },
    filterAnwser(str,number){
      str = (str+'').trim().toUpperCase()
      var array = ['A','B','C','D']
      var answer = -1
      array.forEach((x,index)=>{
        if(str.match(x))
          answer = index
      })
      return answer >= 0 ? answer : alert(`第${number+1}题目答案有问题.请手动校正!`)
    },
    to_json(workbook) {
      var result = {};
      workbook.SheetNames.forEach(function (sheetName) {
        var roa = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { header: 1 });
        if (roa.length) result[sheetName] = roa;
      });
      return JSON.stringify(result, 2, 2);
    },
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
    reader.onload = function () {
      if (typeof selectFileCallback !== "function") return;
      selectFileCallback(reader.result);
      selectFileCallback = null;
    };
    reader.readAsBinaryString(files[0]);
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
