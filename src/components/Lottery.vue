<template>
  <div class="Lottery">
    <transition-group class="container" name="list" tag="div">
      <div
        class="user"
        v-for="(player) in staticPlayers"
        :key="player.id"
        :style="'width:'+userWidth+';height:'+userHeight"
      >
        <div class="avatar" :style="'background-image:url('+player.avatar+')'"></div>
        <div class="name">{{player.name}}</div>
      </div>
    </transition-group>
    <div class="winners">
      <div class="winner-card" :class="{'animation':actives[index]}" v-for="(winner,index) in winners" :key="winner.id">
        <div class="container-blur" >
          <div class="avatar" :style="'background-image:url('+winner.avatar+')'"></div>
          <div class="name">{{winner.name}}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
//有 server 的用户数的话, 删除下面的
import { getPlaceHolderMsg } from "../lib/getPlaceHolder.js"
var defaultUsers = []
for (let j = 0; j < 70; j++) {
  let i = {}
  i.id = Math.random()
  i.avatar = getPlaceHolderMsg().avatar
  i.name = `士兵${Math.random() * 200 >> 1}i 脚后跟发我个天号`
  defaultUsers[j] = i
}

//进入抽奖界面后先随机打乱如下时间,再显示出欧皇,单位 ms
const WinnerDelay = 5000
//每张卡片翻开所用的时间,以及延迟,单位 ms
const cardRevert = 1500
const cardDelay = 500
//最大抽奖人数
const MaxLuckyDogs = 6

export default {
  name: 'Lottery',
  components: {},
  props: {
    players: {
      type: Array,
      default: [],
    },
    winners: {
      type: Array,
      default: [],
    }
  },
  data() {
    return {
      //应 Vue 的要求, 将 props 中的 player 保存后再修改
      staticPlayers: [],
      timers: [],
      actives: [0, 0, 0, 0, 0, 0],
    }
  },
  computed: {
    wLength() { return this.winners.length },
    pLength() { return this.players.length },
    userWidth() {
      return '8vw'
    },
    userHeight() {
      return '8vw'
    },
  },
  methods: {
    /** 打乱 players 以显示随机抽取的效果 */
    shuffle() {
      this.staticPlayers = this.staticPlayers.sort(() => Math.random() > 0.5 ? 1 : -1)
      this.timers.push(setTimeout(() => {
        this.shuffle()
      }, Math.random() * 600 + 400)); //随机打乱的动画效果频数间隔设置为400-1000ms
    },
    /**
     * 开始按顺序展示抽中的幸运儿
     */
    showLuckyDogs(index) {
      if(index >= this.wLength) return
      else{
        Vue.set(this.actives,index, true)
        var that = this
        setTimeout(()=>{
          that.showLuckyDogs(index+1)
        },cardRevert + cardDelay)
      }
    },
    init() {
      this.actives = Array(MaxLuckyDogs).fill(0)
      this.shuffle()
      var that = this
      setTimeout(() => {
        that.timers.forEach(x=>clearTimeout(x))
        that.showLuckyDogs(0)
      }, WinnerDelay)
    }
  },
  watch: {
    players() { this.init() },
    winners() { this.init() }
  },
  mounted() {
    /*** 测试代码,可删掉 */
    this.staticPlayers = [...defaultUsers]
    this.winners = defaultUsers.slice(0, 6)
    /*** 测试代码结束 */
    this.init()

  }
}
</script>

<style scoped lang="stylus">
.list-move {
  transition all 1s
}

.Lottery {
  background #729afb
  width 100%
  height 100%
  display flex
  position relative
  align-items center
  justify-content center

  .container {
    width 90vw
    height 90vh
    overflow auto
    background #fff
    border-radius 3vw
    padding 3vw
    display flex
    flex-wrap wrap
    flex-direction row
    align-items center

    .user {
      position relative
      display flex
      flex-direction column
      align-items center
      justify-content center
      color white
      min-width 2vw
      min-height 2vw
      padding 5px

      .avatar {
        width 100%
        height 100%
        background-size cover
        border-radius 50%
      }

      .name {
        display none
      }
    }
  }
}

@keyframes revert {
  0% {
    opacity 1
    transform translateZ(-600px) rotateY(180deg)
  }
  100% {
    opacity 1
    transform rotateY(0)
  }
}

@keyframes blur {
  0% {
    filter blur(50px)
  }

  100% {
    filter none
  }
}
@keyframes unfold {
  0% { transform:translate(-50%,-50%) scaleX(0) }
  100% { transform:translate(-50%,-50%) scaleX(1) }
}
.Lottery .winners {
  position absolute
  top 50%
  left 50%
  display flex
  flex-flow row nowrap
  padding 5vw 0
  border-radius 10px
  perspective 600px
  animation 2s unfold linear 5s forwards

  .winner-card {
    box-shadow 0 0 5px 0px
    padding 3vw 1vw
    margin 0 1vw
    background white
    opacity 0
    &.animation {
      animation 3s ease revert forwards

      .container-blur {
        animation 2s ease 2s blur forwards
      }
    }

    .container-blur {
      display flex
      flex-direction column
      align-items center
      justify-content space-around
      .avatar {
        background-size cover
        border-radius 50%
        width 10vw
        height 10vw
      }

      .name {
        font-size 20px
        overflow hidden
        width 11vw
        white-space nowrap
        text-overflow ellipsis
        font-weight 500
        text-align center
        margin-top 10px
      }
    }
  }
}
</style>
