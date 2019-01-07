<template>
  <div class="gmguy" :class="{dead: player.life<=0}">
    <div class="badgets">
      <div v-if="!player.connected">掉线</div>
    </div>

    <img :src="player.avatar">

    <div class="name">{{ player.name }}</div>
    <div class="meta">{{ player.score }} 分，{{ player.life }} 命</div>

  </div>
</template>

<script>
export default {
  props: ["player"]
};
</script>

<style scoped>
.gmguy {
  vertical-align: middle;
  position: relative;
  text-align: center;
  width: 128px;
  padding: 10px;
  display: inline-block;
  height: 192px;
  margin: 5px;
  background: #fff;
  box-shadow: 0 1px 2px #999;
  overflow: hidden;
}

.gmguy.dead {
  background: #ccc;
  opacity: 0.5;
}

.badgets {
  position: absolute;
  right: 10px;
  top: 10px;
}

.badgets > div {
  display: inline-block;
  color: #F00;
  background: #FEE;
  padding: 2px 5px ;
  border: 2px solid #F00;
  border-radius: 4px;
}

img {
  width: 64px;
  height: 64px;
  border-radius: 100%;
}

.name {
  font-weight: bold;
}

.meta {
  color: #333;
}
</style>
