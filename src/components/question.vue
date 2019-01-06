<template>
  <div class="question">
    {{question}}
    <v-btn v-for="(option,index) in question.options" :key="index" @click="select(index)">{{option}}</v-btn>
  </div>
</template>
<script>
import socket from '../socket'

export default {
  name: 'question',
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
