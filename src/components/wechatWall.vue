<template>
  <div class="wechatWall">
    <transition-group name="list" tag="ul">
      <li v-for="msg in messages" :key="msg.key">
        <div class="avatar" :style="'background-image:url('+msg.avatar+')'"></div>
        <div class="text" :style="'font-size:'+size(msg.text)">{{msg.text}}</div>
      </li>
    </transition-group>
  </div>
</template>

<script>
export default {
  name: "wechatWall",
  props: {
    messages: {
      type: Array,
      default: [],
    }
  },
  components: {},
  data() {
    return {
      fontSize: { 0: '6vw', 22: '6vw', 33: '4.8vw', 55: '4vw' ,10000:'3vw'}
    }
  },
  methods: {
    size(text) {
      let length = text && text.length || 0
      for (let i in this.fontSize) {
        if (length < i) {
          return this.fontSize[i]
        }
      }
    }
  }
}
</script>

<style scoped lang="stylus">
.list-move{
  transition all 1s
}
.list-enter-active,.list-leave-active{
  transition all 1s
}
.list-leave-active {
  position absolute
}

.list-enter {
  opacity 0
  transform translate3d(0, 150%, -200px)
}

.list-leave-to {
  opacity 0
  transform translate3d(15%,-150%,-200px)
}

.wechatWall {
  background #729afb
  perspective 600px
  width 100vw
  height 100vh
  ul {
    list-style none
    display flex
    flex-direction column
    justify-content space-around
    height 100vh
    padding 10vh 0
    align-items center

    li {
      height 18vw
      width 80vw
      background white
      display flex
      flex-direction row
      align-items center
      justify-content flex-start
      border-radius 2vw
      overflow hidden
      .avatar {
        flex 0 0 15vw
        background-size cover
        width 15vw
        height 15vw
        border-radius 50%
        margin 0 2vw
      }

      .text {
        font-size 5vw
        text-align left
        text-overflow ellipsis
        max-height 18vw
        padding-right 2vw
      }
    }
  }
}
</style>
