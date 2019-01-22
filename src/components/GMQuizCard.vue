<template>
  <v-flex mb-4>
    <v-card dark style="background-color: #FFF">
      <v-card-title :style="`background-color:${bgcolor}`">
        <v-icon large left>chat</v-icon>
        <span class="title font-weight-light" v-text="title"></span>

        <v-spacer></v-spacer>

        <v-btn v-if="!isFirst" icon @click="$emit('up')">UP</v-btn>
        <v-btn v-if="!isLast" icon @click="$emit('down')">DOWN</v-btn>

        <v-btn icon @click="$emit('delete')">
          <v-icon>delete</v-icon>
        </v-btn>
      </v-card-title>

      <v-card-text>
        <textarea v-model="quiz.question" class="fullfilltext" placeholder="请输入题目"/>

        <div>
          <input
            v-for="(v,idx) in quiz.options"
            :key="idx"
            type="text"
            class="optionInput"
            v-model="quiz.options[idx]"
            @click="quiz.answer.index=idx"
            :class="{isAnswer: quiz.answer.index==idx}"
            :placeholder="`请输入第 ${idx+1} 选项`"
          >
        </div>

        <v-layout style="color:#333">
          <input class="flex" type="text" v-model="quiz.answer.hint" placeholder="（可以设置一个提示）">
          出题人： <input type="text" class="author" v-model="quiz.author" placeholder="匿名">
        </v-layout>
      </v-card-text>
    </v-card>
  </v-flex>
</template>

<script>
const colors = [
  "#1976D2",
  "#303F9F",
  "#512DA8",
  "#0288D1",
  "#0097A7",
  "#00796B",
  "#388E3C",
  "#689F38",
  "#AFB42B",
  "#FFA000",
  "#6D4C41"
];

export default {
  props: {
    isFirst: Boolean,
    isLast: Boolean,
    title: String, // 卡片标题，和题目对象无关
    quiz: Object // 题目内容 { text: "什么什么?", options: ["123", "456", "789", "ABC"], answer: 0 }
  },
  computed: {
    bgcolor() {
      var sum = 0;
      var uid = this.quiz.uid + "";
      for (let i = 0; i < uid.length; i++) sum += uid.charCodeAt(i);
      return colors[sum % colors.length];
    }
  }
};
</script>

<style scoped>
.fullfilltext {
  background: transparent;
  color: #000;
  font-size: 24px;
  margin: 0;
  padding: 0;
  display: block;
  width: 100%;
  height: 4em;
  resize: none;
}

.optionInput {
  box-sizing: border-box;
  width: 48%;
  height: 52px;
  padding: 10px;
  margin: 1%;
  line-height: 24px;
  font-size: 16px;
  text-align: center;
  background: #eee;
  border-radius: 10px;
  color: #000;
  font-weight: normal;
}

.optionInput.isAnswer {
  background: #afa;
  border: 3px solid green;
  font-weight: bold;
}
</style>
