import { createApp } from 'vue'
import '@/styles/style.css'
import App from './App.vue'
import { router } from './router'
import store from './store'
import { storeConfig } from '@/store/config'
import { Lazyload } from 'vant'
import 'vant/lib/index.css'

import { longPress } from '@/directive/longPress.ts'

const configStore = storeConfig(store)

configStore.createBaseParams()

createApp(App)
  .use(router)
  .use(store)
  .use(Lazyload)
  .directive('long-press', longPress)
  .mount('#app')
