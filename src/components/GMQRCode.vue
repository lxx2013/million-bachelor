<template>
  <v-container fluid fill-height>
    <canvas style="display: block; margin: auto;" ref="canvas"></canvas>
  </v-container>
</template>

<script>
import * as QRCode from "qrcode";

export default {
  mounted() {
    var canvas = this.$refs.canvas;
    QRCode.toCanvas(
      canvas,
      `${location.protocol}//${location.host}`,
      { errorCorrectionLevel: "L" },
      function(error) {
        canvas.style.height = canvas.style.width =
          Math.min(window.innerHeight * 0.7, window.innerWidth * 0.7) + "px";
      }
    );
  }
};
</script>

<style>
</style>
