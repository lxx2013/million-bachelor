<template>
  <div class="score">
    <section class="card">
      <div class="title">
        <div class="title-mid">本轮英雄榜</div>
      </div>
      <div class="table-title">
        <div class="left">头像</div>
        <div class="mid">昵称</div>
        <div class="right">存活题数</div>
      </div>
      <ul>
        <li v-for="(user,index) in score.users" :key="index" :class="{golden: user.score==maxScore}">
          <div class="avatar" :style="'background-image:url('+user.avatar+')'"></div>
          <div class="name">{{user.name}}</div>
          <div class="user-score">{{user.score}}</div>
        </li>
      </ul>
    </section>
    <water-back :percent="100" color="#1787ff" class="water-back"></water-back>
  </div>
</template>
<script>
import WaterBack from "../components/WaterBack.vue"
import socket from '../socket'

export default {
  name: 'score',
  components: {
    WaterBack,
  },
  props: {
    score: {
      type: Object,
      default: () => { return {} }
    },
    playerInfo: {
      type: Object,
      default: () => { return {} }
    },
  },
  computed: {
    maxScore() {
      let bestUser = this.score.users[0]
      return bestUser ? bestUser.score : -1
    }
  },
}
</script>

<style lang="stylus" scoped>
.score {
  padding 20px

  .card {
    width 100%
    border-radius 10px
    margin-top 5vh
    padding 20px
    background #fafafa
    box-shadow 0 0 20px 1px rgba(0, 0, 0, 0.2), 0 0 10px 1px rgba(0, 0, 0, 0.2)
    font-weight 500
    position relative

    .title {
      font-weight 700
      font-size 24px
    }

    .table-title {
      margin-top 20px
      display flex
      justify-content space-between
      color grey
    }

    ul{
      list-style none
      margin-top 1em
      li{
        height 3em
        display flex
        flex-direction row
        justify-content space-between
        align-items center
        padding-right 2em
        .avatar {
          background-size cover
          width 2em
          height 2em
          border-radius 50%
        }
        &.golden {
          color: #F40;
        }
      }
    }
  }

  .water-back {
    z-index -1
  }
}
</style>

