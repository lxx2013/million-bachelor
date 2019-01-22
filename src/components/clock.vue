<template>
  <div class="svg-clock">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="-25 -67.68 50 135.36"
      style="transform: rotate(-90deg);-webkit-transform: rotate(-90deg);"
    >
      <path
        d="M0 -35.92 Q 0 -26.92 9.29 -23.22 L 9.29 23.22 Q 0 26.92 0 35.92 Z"
        fill="#fafafa"
      ></path>
      <circle
        fill="#fafafa"
        cx="0"
        cy="0"
        r="25"
      ></circle>
      <circle
        fill="transparent"
        cx="0"
        cy="0"
        r="20"
        :stroke="backColor"
        stroke-width="5"
        stroke-dasharray="125.664"
        stroke-dashoffset="0"
      ></circle>
      <circle
        fill="transparent"
        cx="0"
        cy="0"
        r="20"
        :stroke="color"
        stroke-width="5"
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
    max: { type: Number | String, default: 100 },
    value: {
      type: Number | String,
      default: 100
    },
    color: {
      type: String,
      default: "green"
    },
    backColor:{
      type: String,
      default: '#fafafa'
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
  position absolute
  z-index 1
  top -85%
  left 50%
  width 100%
  height 100%
  transform translate(-50%, -0%)
  .value{
    position absolute
    top 115%
    left 50%
    transform translate(-50%,0)
  }
}
</style>
