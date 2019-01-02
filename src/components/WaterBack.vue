<template>
  <div class="waterback">
    <div class="waterback-back" :style="`height:${percent}%`">
      <div class="water" :style="`background-color: ${color}`"></div>
      <div class="water-shadow"></div>
      <svg
        viewBox="0,0,200,100"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g style="opacity:0.4">
          <path
            d="M0 50 Q 50 0 100 50 Q 150 100 200 50  Q 250 0 300 50  Q 350 100 400 50  L400 120 0 120 Z"
            :fill="color"
          />
          <animateTransform
            attributeName="transform"
            attributeType="XML"
            type="translate"
            from="0 0"
            to="-200 0"
            dur="1.2s"
            repeatCount="indefinite"
          />
        </g>
        <g style="opacity:0.4">
          <path
            d="M0 50 Q 50 0 100 50 Q 150 100 200 50  Q 250 0 300 50  Q 350 100 400 50  L400 120 0 120 Z"
            :fill="color"
          />
          <animateTransform
            attributeName="transform"
            attributeType="XML"
            type="translate"
            from="0 0"
            to="-200 0"
            dur="1.3s"
            repeatCount="indefinite"
          />
        </g>
        <g>
          <path
            d="M0 50 Q 50 0 100 50 Q 150 100 200 50  Q 250 0 300 50  Q 350 100 400 50  L400 120 0 120 Z"
            :fill="color"
          />
          <animateTransform
            attributeName="transform"
            attributeType="XML"
            type="translate"
            from="0 0"
            to="-200 0"
            dur="1s"
            repeatCount="indefinite"
          />
        </g>
      </svg>
    </div>

    <slot />
  </div>
</template>

<script>
export default {
  name: "water-back",
  props: ["percent", "color"]
};
</script>

<style scoped lang="stylus">
.waterback {
  position:fixed
  top:0
  bottom:0
  left:0
  right:0
}

.waterback-back {
  position: absolute;
  overflow: hidden;
  left: 0;
  right: 0;
  bottom: 0;
}

.water {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  top: 30px;
  width: 100%;
  height: 100%;
  transition: background-position 2s;
}
.water-shadow{
  background: linear-gradient(to bottom,transparent, rgba(0, 0, 0, 0.3)) no-repeat;
  position:absolute;
  top:30px;
  left:0;
  right:0;
  bottom:0;
  height:120vh;
}

svg {
  width: 100%;
  height: 35px;
  position: absolute;
  top: 0;
  left: 0;
}
</style>
