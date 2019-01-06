<template>
  <div class="question">
    {{question}}
    <div class="options" v-for="(option,index) in question.options" :key="index">
      <v-btn  @click="select(index)">{{option}}</v-btn>
    </div>
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
