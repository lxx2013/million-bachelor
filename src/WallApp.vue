<template>
  <div class="WallApp">
    <Lottery v-show="isLottery"></Lottery>
    <Wall v-show="!isLottery"></Wall>
  </div>
</template>

<script>
import Wall from "./components/Wall.vue"
import Lottery from "./components/Lottery.vue"

export default {
  name: 'WallApp',
  components: { Wall, Lottery },
  data() {
    return {
      isLottery : true,
    }
  },
  mounted() {
    //等待 server 的切换到抽奖事件
    this.isLottery = true
  }
}
</script>

<style lang="stylus">
.WallApp{
  position fixed
  top 0
  left 0
  right 0
  bottom 0
}
* {
  margin 0
  padding 0
  box-sizing border-box
}
</style>
