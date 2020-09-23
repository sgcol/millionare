import Vue from 'vue'
import Vuex from 'vuex'
import { BootstrapVue, BIcon, BIconChevronRight, BIconChevronLeft ,BIconBoxArrowInLeft} from 'bootstrap-vue'
import './custom.scss'
import i18n from './lang'

// Install BootstrapVue
Vue.use(BootstrapVue)

// Optionally install the BootstrapVue icon components plugin
Vue.component('BIcon', BIcon)
Vue.component('BIconChevronRight', BIconChevronRight)
Vue.component('BIconChevronLeft', BIconChevronLeft)
Vue.component('BIconBoxArrowInLeft', BIconBoxArrowInLeft)

Vue.use(Vuex);
import App from './App.vue'

Vue.config.productionTip = false

const store =new Vuex.Store({
	state:{
		me:{
			balance:null,
			_id:null,
			paytm_id:null,
			name:null,
			icon:null
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
		fb:{
			connected:null,
			logout:null
		}
	},
	mutations:{
		fb(state, value) {
			state.fb.connected=value.connected;
			state.fb.logout=value.logout;
		},
		countdown(state) {
			if (state.countdown>0) state.countdown--;
			if (state.countdown<=30) state.status='stop_betting';
		},
		setMe(state, d) {
			state.me=d;
		},
		setSetNo(state, setno) {
			state.setno=setno;
		},
		addContract(state, contract) {
			state.me.balance-=contract.betting;
			state.orders.push(contract);
		}
	}
})
var v=window.v=new Vue({
	el:'#app',
	store,
	$eventBus:new Vue(),
	i18n,
	render: h => h(App),
	// render: h=>h(signup),

})

console.log(v.$store)

