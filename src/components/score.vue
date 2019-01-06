<template>
  <div class="score">{{score}}</div>
</template>
<script>
export default {
  name: 'score',
  props: {
    score: {
      type: Object,
      default: () => { return {} }
    }
  }
}
</script>

<style lang="stylus">
</style>
