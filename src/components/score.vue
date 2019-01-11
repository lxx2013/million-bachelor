<template>
  <div class="score">
    <section class="card">
      <div class="title">
        <div class="title-mid">总得分榜</div>
      </div>
      <div class="table-title">
        <div class="left">头像</div>
        <div class="mid">昵称</div>
        <div class="right">答对题数</div>
      </div>
      <ul>
        <li v-for="(user,index) in score.users" :key="index">
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
import WaterBack from "./WaterBack.vue"
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
  data() {
    return {
      water: 0,
      timer: [],
    }
  },
  methods: {

  },
  mounted() {
    this.water = (15000 - this.score.time) / 150
    this.timer[1] = setInterval(() => {
      this.water += 102 / ((1000 / 33) * 15);
      if (this.water >= 100) {
        clearInterval(this.timer[1]);
      }
    }, 33);
  }
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
      }
    }
  }

  .water-back {
    z-index -1
  }
}
</style>

