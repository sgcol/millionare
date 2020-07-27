import Vue from 'vue'
import VueRouter from 'vue-router'
import Vuex from 'vuex'
import { BootstrapVue, BIcon, BIconChevronRight, BIconChevronLeft ,BIconBoxArrowInLeft} from 'bootstrap-vue'
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'

Vue.use(VueRouter)

// Install BootstrapVue
Vue.use(BootstrapVue)
// Optionally install the BootstrapVue icon components plugin
Vue.component('BIcon', BIcon)
Vue.component('BIconChevronRight', BIconChevronRight)
Vue.component('BIconChevronLeft', BIconChevronLeft)
Vue.component('BIconBoxArrowInLeft', BIconBoxArrowInLeft)

Vue.use(Vuex);
import Admin from './Admin.vue'

Vue.config.productionTip = false

const store =new Vuex.Store({
	state:{
	me:{
		balance:null,
		id:null,
		paytm_id:null
	},
	countdown:null,
	period:null,
	history:[],
	// [{period:'20200708001', price:11978}]
	orders:[],
	//   {_id:'5e367cd897', betting:30, select:7, fee:3, time:new Date(), game:{period:'202007081001', price:null, endtime:new Date()}},
	//   {_id:'5e367cd898', betting:10, select:'Green', fee:1, time:new Date(), game:{period:'202007081002', price:0, endtime:new Date()}},
	//   {_id:'5e367cd899', betting:10, select:'Green', fee:1, time:new Date(), game:{period:'202007081002', price:1, endtime:new Date()}}
	// ]
	status:null,
	},
	mutations:{
	}
})

import {router} from './router'

window.v=new Vue({
	router,
	el:'#app',
	store,
	$eventBus:new Vue(),
	render: h => h(Admin),
	// components:{Admin}
	// render: h=>h(signup),
})

