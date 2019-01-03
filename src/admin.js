// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './AdminApp.vue'
import Vuetify from 'vuetify'
import socket from './socket'

Vue.config.productionTip = false
Vue.use(Vuetify)

socket.on('connect', () => { socket.emit("admin connected", "root"); })

/* eslint-disable no-new */
new Vue({
  el: '#app',
  components: { App },
  template: '<App/>'
})
