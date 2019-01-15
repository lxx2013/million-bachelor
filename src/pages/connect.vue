<template>
  <div class="connect">
    <div class="container">
      <p>你好,</p>
      <p>{{playerInfo.name}}</p>
      <p><img :src="playerInfo.avatar" alt="" width="30vw"></p>
    </div>
  </div>
</template>

<script>
export default {
  name: "connect",
  props: {
    playerInfo: {
      type: Object,
      default: () => {
        return {};
      }
    }
  }
};
</script>

<style scoped >
.connect {
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
.connect .container{
  display: inline-block;
  line-height: 1.5;
}
.connect p {
  color: white;
  font-size: 30px;
}
</style>
