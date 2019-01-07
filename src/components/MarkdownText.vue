<template>
  <span v-html="the_html"/>
</template>

<script>
export default {
  props: ["value"],
  computed: {
    the_html() {
      var value = (this.value || "") + "";
      value = value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/\*\*(.+?)\*\*/g, "<b>$1</b>")
        .replace(/\*(.+?)\*/g, "<i>$1</i>")
        .replace(
          /\$(.+?)\$/g,
          (a, b) =>
            `<img src="https://math.jianshu.com/math?formula=${encodeURIComponent(b.trim())}" alt="${b}"></img>`
        );
      return value;
    }
  }
};
</script>

<style>
</style>
