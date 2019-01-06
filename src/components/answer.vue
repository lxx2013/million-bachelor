<template>
<div class="answer">{{answer}}</div>
</template>
<script>
export default{
  name:'answer',
  props:{
    answer:{
      type:Object,
      default: ()=>{return {}}
    }
  }
}
</script>

<style lang="stylus">
</style>
