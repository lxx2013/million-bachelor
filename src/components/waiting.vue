<template>
  <div class="waiting">
     <span>Wating...</span>
  </div>
</template>

<script>
export default {
  name: 'Wating'
}
</script>

<style scoped >
.waiting{
  position:fixed;
  z-index:2;
  top:0;
  left:0;
  right:0;
  bottom:0;
  width:100vw;
  height:100vh;
  line-height:100vh;
  background: rgba(0,0,0,0.9);
  text-align: center;
}
.waiting span{
    color:white;
    font-size:30px;
}
</style>
