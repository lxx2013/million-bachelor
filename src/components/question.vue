<template>
  <div class="question">
    {{question}}
    <div class="question">
      <MarkdownText :value="question.question" />
    </div>
    <div class="options" v-for="(option,index) in question.options" :key="index">
      <button  @click="select(index)"><MarkdownText :value="option" /></button>
    </div>
  </div>
</template>
<script>
import socket from '../socket'
import MarkdownText from "./MarkdownText.vue";

export default {
  name: 'question',
  components: {
    MarkdownText,
  },
  props: {
    question: {
      type: Object,
      default: () => { return {} }
    }
  },
  methods: {
    select(index) {
      socket.emit('answer', { answer: index, time: 1000 })
    }
  }
}
</script>

<style lang="stylus">

</style>
