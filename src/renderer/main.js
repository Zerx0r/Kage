import Vue from 'vue'
import axios from 'axios'
// import { remote } from 'electron'

import App from './App'
import router from './router'
import store from './store'
// Element UI import
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import locale from 'element-ui/lib/locale/lang/en'
// fontawsome import
import { library } from '@fortawesome/fontawesome-svg-core'
import { fas } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
// vue-progressbar
import VueProgressBar from 'vue-progressbar'

Vue.use(ElementUI, {locale})

library.add(fas)
Vue.component('font-awesome-icon', FontAwesomeIcon)

const options = {
  color: '#409eff',
  failedColor: 'red',
  thickness: '2px',
  transition: {
    speed: '0.4s',
    opacity: '0.6s',
    termination: 300
  },
  autoRevert: true,
  location: 'top',
  inverse: false
}
Vue.use(VueProgressBar, options)

// remote.globalShortcut.register('CommandOrControl+Shift+K', () => {
//   remote.BrowserWindow.getFocusedWindow().webContents.openDevTools()
// })
//
// window.addEventListener('beforeunload', () => {
//   remote.globalShortcut.unregisterAll()
// })

if (!process.env.IS_WEB) Vue.use(require('vue-electron'))
Vue.http = Vue.prototype.$http = axios
Vue.config.productionTip = false
Vue.config.silent = true

/* eslint-disable no-new */
new Vue({
  components: { App },
  router,
  store,
  template: '<App/>'
}).$mount('#app')
