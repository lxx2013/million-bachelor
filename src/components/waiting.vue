<template>
  <div class="waiting">
    <div class="container">
      <p>Waiting...</p>
    </div>
  </div>
</template>

<script>
export default {
  name: "Waiting",
  props: {

  }
};
</script>

<style scoped >
.waiting {
  position: fixed;
  z-index: 2;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100vw;
  height: 100vh;
  line-height: 100vh;
  background: rgba(0, 0, 0, 0.9);
  text-align: center;
}
.waiting .container{
  display: inline-block;
  line-height: 1.5;
}
.waiting p {
  color: white;
  font-size: 30px;
}
</style>
