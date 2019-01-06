// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './AdminApp.vue'
import Vuetify from 'vuetify'
import socket from './socket'

Vue.config.productionTip = false
Vue.use(Vuetify)

socket.on('connect', () => { socket.emit("admin connected", "root"); })

// <link href="https://fonts.lug.ustc.edu.cn/css?family=Roboto:100,300,400,500,700,900|Material+Icons" rel="stylesheet">
var fontLink = document.createElement('link')
fontLink.href = "https://fonts.lug.ustc.edu.cn/css?family=Roboto:100,300,400,500,700,900|Material+Icons"
fontLink.rel = "stylesheet"
document.head.appendChild(fontLink)

/* eslint-disable no-new */
new Vue({
  el: '#app',
  components: { App },
  template: '<App/>'
})
