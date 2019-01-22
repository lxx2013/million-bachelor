<template>
  <div class="Lottery">
    <div class="button-container">
    <button @click="userList = userList.sort(()=>Math.random()>0.5?1:-1)">开始抽奖</button>
    <button>停!</button>
    </div>
    <transition-group class="container" name="list" tag="div">
      <div
        class="user"
        :class="{'over':index==over}"
        v-for="(user,index) in userList"
        :key="user.id"
        :style="'width:'+userWidth+';height:'+userHeight"
      >
        <div class="avatar" :style="'background-image:url('+user.avatar+')'"></div>
        <div class="name">{{user.name}}</div>
      </div>
    </transition-group>
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
  i.name = `士兵${Math.random() * 200 >> 1}号`
  defaultUsers[j] = i
}


export default {
  name: 'Lottery',
  components: {},
  data() {
    return {
      userList: defaultUsers,

    }
  },
  computed:{
    over(){
      return this.userList.length / 2 -1
    },
    userWidth(){
      return '8vw'
    },
    userHeight(){
      return '8vw'
    }
  },
  mounted() {
  }
}
</script>

<style scoped lang="stylus">
.button-container{
  width 0
  height 0
  position relative
}
button{
  display absolute
  padding 3px 5px
  top 0px
  left 0
}
.list-move {
  transition all 1s
}

.Lottery {
  background #729afb
  width 100%
  height 100%
  display flex
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
      &.over {
        transform scale(2.0)
        margin 0 4vw
        z-index 1000
        &.name {
          display block
          margin-top 8px
          line-height 16px
          color black
          text-align center
          font-size 30px
        }
      }

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
</style>
