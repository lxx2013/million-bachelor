<template>
  <div class="fakelucky">
    <h1 :class="{large:done}">幸运抽奖</h1>

    <div class="percentLine">
      <div class="fill" :style="`height:${linePercent}%`"></div>
    </div>

    <div class="maybe" v-show="!done" :class="{freeze}">
      <div class="guyCard">
        <img :src="current.avatar" class="avatar">
        <p class="name">{{ current.name }}</p>
      </div>
    </div>

    <div class="confirmed">
      <div class="guyCard" v-for="winner in winnersShown" :key="winner.id">
        <img :src="winner.avatar" class="avatar">
        <p class="name">{{ winner.name }}</p>
      </div>
    </div>
  </div>
</template>

<script>
import WaterBack from "./WaterBack.vue";

/// <reference path="../../types.d.ts" />

/** @typedef {ServerToWall.LuckyStart} Data */

export default {
  components: { WaterBack },

  props: {
    payload: {
      type: Object
    }
  },

  data() {
    return {
      freeze: false,
      timer1: 0,
      timer2: 0,
      randIdx: 0,
      winnerCnt: 0,
      linePercent: 0,
      done: false
    };
  },

  computed: {
    /** @returns {ServerToWall.LuckyStart["players"]} */
    players() {
      return this.payload.players;
    },
    /** @returns {ServerToWall.LuckyStart["winners"]} */
    winners() {
      return this.payload.winners;
    },
    /** @returns {ServerToWall.LuckyStart["players"][0]} */
    current() {
      if (this.freeze) return this.winners[this.winnerCnt - 1];
      return this.players[this.randIdx];
    },
    /** @returns {ServerToWall.LuckyStart["winners"]} */
    winnersShown() {
      return this.winners.slice(0, this.winnerCnt);
    }
  },

  mounted() {
    this.timer1 = setInterval(this.roll, 40);
    this.timer2 = setInterval(this.roll2, 250);
  },

  methods: {
    roll() {
      if (this.freeze) return;

      const ACCEL = 0.1;
      this.linePercent = (this.linePercent + 100 * ACCEL) / (ACCEL + 1);

      if (this.linePercent >= 99) {
        this.linePercent = 0;
        this.winnerCnt++;

        this.freeze = true;

        setTimeout(() => {
          this.freeze = false;
          if (this.winnerCnt == this.winners.length) {
            clearInterval(this.timer1);
            clearInterval(this.timer2);
            this.done = true;
          }
        }, 1000);
      }
    },
    roll2() {
      this.randIdx =
        (this.randIdx + ~~(Math.random() * 10)) % this.players.length;
    }
  }
};
</script>

<style lang="stylus" scpoed>
.fakelucky {
  background-color: #F33;
  background: linear-gradient(to bottom, #FA6, #F33);
  position: absolute;
  left: 0;
  top: 0;
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-flow: column;
  justify-content: space-between;
}

h1 {
  text-align: center;
  font-family: '微软雅黑';
  color: #FFA;
  text-shadow: 0 1px 4px #F33, 0 1px 4px #F33, 0 1px 10px #F33, 0 1px 24px #F33;
  font-weight: bold;
  letter-spacing: 5px;
  font-size: 4vh;
  transition: font-size 0.4s;
  flex-shrink: 1;

  &.large {
    font-size: 10vh;
    margin: 4vh 0;
  }
}

.percentLine {
  height: 100px;
  width: 10px;
  background: #EEE;

  .fill {
    background: #900;
  }
}

@keyframes shake {
  0%, 100% {
    transform: translate(0, 10px);
  }

  20% {
    transform: translate(10px, -7px) rotate(5deg);
  }

  40% {
    transform: translate(-8px, 3px) scaleY(0.9);
  }

  60% {
    transform: translate(-3px, 2px) rotate(-5deg);
  }

  80% {
    transform: translate(5px, -6px);
  }
}

@keyframes zoomin {
  from {
    transform: scale(1) translateY(-10%) scaleY(0.7);
  }

  80% {
    transform: scale(1.4) translateY(6%);
  }

  to {
    transform: scale(1.5);
    text-shadow: 0 0 10px #FF9, 0 0 10px #FF9, 0 0 10px #FF9, 0 0 30px #FF9, 0 0 50px #FF9;
  }
}

@keyframes boomin {
  0% {
    transform: translateY(-200%);
    max-width: 0;
    opacity 0
  }

  80% {
    transform: translateY(20%);
    max-width: 80vw;
    opacity 0.7
  }

  100% {
    transform: translateY(0);
    max-width: 100vw;
  }
}

.guyCard {
  position: relative;
  animation: boomin 1s;
  overflow: hidden;
  flex-grow: 1;
  padding: 0 20px;

  .name {
    font-size: 5vh;
  }

  img.avatar {
    height: 20vh;
    border-radius: 100%;
  }
}

.maybe {
  display: flex;
  justify-content: space-around;
  z-index: 100;

  .guyCard {
    flex-grow: 0;
    animation: shake 0.3s infinite;
    z-index: 100;
    filter: blur(1px);
  }

  &.freeze {
    .guyCard {
      animation: zoomin 0.5s 1;
      animation-fill-mode: both;
    }
  }
}

.confirmed {
  display: flex;
  flex-wrap: wrap;
  flex-grow: 1;

  .guyCard {
    text-shadow: 0 0 10px #FF9, 0 0 10px #FF9, 0 0 10px #FF9, 0 0 10px #FF9, 0 0 10px #FF9, 0 0 10px #FF9, 0 0 10px #FF9, 0 0 10px #FF9;
  }
}
</style>
