<template>
  <div class="svg-clock">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="22.857142857142858 22.857142857142858 45.714285714285715 45.714285714285715"
      style="transform: rotate(-90deg);-webkit-transform: rotate(-90deg);"
    >
      <circle
        fill="transparent"
        cx="45.714285714285715"
        cy="45.714285714285715"
        r="20"
        stroke-width="5.714285714285714"
        stroke-dasharray="125.664"
        stroke-dashoffset="0"
      ></circle>
      <circle
        fill="transparent"
        cx="45.714285714285715"
        cy="45.714285714285715"
        r="20"
        :stroke="color"
        stroke-width="5.714285714285714"
        :stroke-dasharray="stokeDash"
      ></circle>
    </svg>
    <div class="value">{{parseInt(value)}}</div>
  </div>
</template>
<script>
export default {
  name: "clock",
  props: {
    min: { type: Number | String, default: 0 },
    max: { type: Number | String, default: 100 },
    value: {
      type: Number,
      default: 100
    },
    color: {
      type: String,
      default: "green"
    }
  },
  computed: {
    stokeDash() {
      return 125.665 * (this.value / this.max) + " 1000"
    }
  },
  mounted() {

  }
}
</script>
<style lang="stylus" scoped>
.svg-clock {
  position relative

  .value {
    position absolute
    top 50%
    left 50%
    transform translate(-55%, -55%)
  }

  circle {
    -webkit-transition stroke-dasharray linear 0.98s
    transition stroke-dasharray linear 0.98s
  }
}
</style>
