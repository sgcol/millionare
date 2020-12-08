import Vue from 'vue'
import VueRouter from 'vue-router'
import { BootstrapVue} from 'bootstrap-vue'
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'

Vue.use(BootstrapVue)
Vue.use(VueRouter)

import App from './App.vue'
import {router} from './router'

Vue.config.productionTip = false

new Vue({
	router,
	el:'#app',
	render: h => h(App),
})

