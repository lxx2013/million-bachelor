<template>
  <v-container>
    <v-btn @click="e('nextQuestion')">发送下一道题</v-btn>
    <v-btn @click="e('showAnswer')">发送答案</v-btn>
    <v-btn @click="e('showWait')">进入等待画面</v-btn>
    <v-btn @click="e('showScore')">发送得分榜</v-btn>
    <v-btn @click="e('reset')">重置</v-btn>

    <table class="scoreboard">
      <tr>
        <th width="30%">玩家</th>
        <th>选项情况</th>
        <th>剩余复活机会</th>
      </tr>
      <tr v-for="row in onlines" :key="row.id">
        <td>{{ row.name }}</td>
        <td>{{ row.choice }}</td>
        <td>{{ row.chances }}</td>
      </tr>
    </table>
  </v-container>
</template>

<script>
import socket from "../socket";

export default {
  data() {
    return { onlines: [] };
  },
  mounted() {
    const useOnlines = data => (this.onlines = data);
    socket.on("server onlines", useOnlines);
    this.useOnlines = useOnlines;
  },
  destroyed() {
    socket.off("server onlines", this.useOnlines);
  },
  methods: {
    e(event) {
      socket.emit(event);
    }
  }
};
</script>

<style scoped>
.scoreboard {
  width: 100%;
}

.scoreboard th,
.scoreboard td {
  padding: 5px 20px;
}

.scoreboard tr:nth-child(even) {
  background: #EEE;
}
</style>
