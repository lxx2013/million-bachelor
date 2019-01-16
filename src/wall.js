import Vue from 'vue'
import WallApp from './WallApp'
Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  el: '#app',
  components: { WallApp },
  template: '<WallApp/>'
})
