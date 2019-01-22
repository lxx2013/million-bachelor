<template>
  <div class="wechatWall">
    <transition-group name="list" tag="ul">
      <li v-for="msg in messages" :key="msg.key">
        <div class="avatar" :style="'background-image:url('+msg.avatar+')'">
          <div
            class="repeats"
            v-show="msg.repeats>0"
            :class="{'jump':jumps[msg.key]}"
          >+{{msg.repeats}}</div>
        </div>
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
      fontSize: { 0: '6vw', 24: '4vw', 42: '4vw', 51: '3.4vw', 10000: '3vw' },
      jumps: {}, //控制复读机"+1"脚标的跳动 类型: { key: boolean },
      repeats:{},/** 纪录复读机"+1"脚标的次数 类型: { key: number }.
                  *  从msg 中剥离出来以减少跳动现象, 即在 watch变化时,不应比较 val[index].xx == oldVal[index].xx,
                  *  而应比较 val.key.xx == this.repeats.key.xx */
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
  },
  watch: {
    'messages': {
      handler: function (val, oldVal) {
        var that = this
        val.forEach((x, index) => {
          if( x.repeats <= 0){
            this.repeats[x.key] = x.repeats
          }
          else if (x.repeats !== this.repeats[x.key]) {
            this.repeats[x.key] = x.repeats
            Vue.set(that.jumps,x.key,true)
            setTimeout(() => {
              Vue.set(that.jumps,x.key,false)
            }, 300)
          }
        })
      },
      deep: true
    }
  }
}
</script>

<style scoped lang="stylus">
.list-move {
  transition all 1s
}

.list-enter-active, .list-leave-active {
  transition all 1s
}

.list-leave-active {
  position absolute
}

.list-enter {
  opacity 0
  transform translateY(150%) scale(0.7, 0.5) rotateZ(20deg)
}

.list-leave-to {
  opacity 0
  transform translateY(-150%) scale(0.7, 0.5) rotateZ(20deg)
}

.wechatWall {
  background #729afb
  width 100vw
  height 100vh

  ul {
    list-style none
    display flex
    flex-direction column
    justify-content space-around
    height 100vh
    align-items center

    li {
      height 30vh
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
        position relative

        .repeats {
          position absolute
          right 0
          top 0
          padding 2px 5px 0 3px
          height 4vw
          line-height 4vw
          border-radius 4vw
          background red
          color white
          font-weight 700
          font-size 2.8vw
          transition all 0.3s ease-in-out

          &.jump {
            transform scale(1.2)
          }
        }
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
