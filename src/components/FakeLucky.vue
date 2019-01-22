<template>
  <WaterBack class="fakelucky" :percent="linePercent/3+50" color="#ff9">
    <div class="percentLine">
      <div class="fill" :style="`height:${linePercent}%`"></div>
    </div>

    <div class="maybe guyCard" v-show="!done">
      <img :src="current.avatar" class="avatar">
      <p class="name">{{ current.name }}</p>
    </div>

    <div class="confirmed">
      <div class="guyCard" v-for="winner in winnersShown" :key="winner.id">
        <img :src="winner.avatar" class="avatar">
        <p class="name">{{ winner.name }}</p>
      </div>
    </div>
  </WaterBack>
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
      const ACCEL = 0.1;
      this.linePercent = (this.linePercent + 100 * ACCEL) / (ACCEL + 1);

      if (this.linePercent >= 99) {
        this.linePercent = 0;
        this.winnerCnt++;

        if (this.winnerCnt == this.winners.length) {
          clearInterval(this.timer1);
          clearInterval(this.timer2);
          this.done = true;
        }
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
  background: #aa3;
  position: absolute;
  left: 0;
  top: 0;
  width: 100vw;
  height: 100vh;
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
    transform: translate(10px, -7px);
  }

  40% {
    transform: translate(-8px, 3px);
  }

  60% {
    transform: translate(-3px, 2px);
  }

  80% {
    transform: translate(5px, -6px);
  }
}

@keyframes boomin {
  0% {
    max-width: 0;
  }

  100% {
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
  animation: shake 0.3s infinite;
}

.confirmed {
  display: flex;
  flex-wrap: wrap;

  .guyCard {
    text-shadow: 0 0 10px #FF9, 0 0 10px #FF9, 0 0 10px #FF9, 0 0 10px #FF9, 0 0 10px #FF9, 0 0 10px #FF9, 0 0 10px #FF9, 0 0 10px #FF9;
  }
}
</style>
