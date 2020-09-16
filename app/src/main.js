import Vue from 'vue'
import Vuex from 'vuex'
import VueI18n from 'vue-i18n'
import { BootstrapVue, BIcon, BIconChevronRight, BIconChevronLeft ,BIconBoxArrowInLeft} from 'bootstrap-vue'
import './custom.scss'

// Install BootstrapVue
Vue.use(BootstrapVue)
Vue.use(VueI18n)

const i18n=new VueI18n(
	{
		locale:'idn',
		fallbackLocale:'en',
		messages:{
			en: new Proxy ({
				term:'Agree {0}'
			}, {
				get(target, prop) {
					if (typeof prop!=='string') return undefined;
					if (target[prop]) return target[prop];
					return prop
				}
			}),
			revert: new Proxy({
				term:'eergA {0}',
				currency:{
					style:'currency', currency:'IDR'
				}
			}, {
				get(target, prop) {
					if (typeof prop!=='string') return undefined;
					if (target[prop]) return target[prop];
					var reversed=prop.split('').reduce((reversed, character) => character + reversed, '');
					target[prop]=reversed;
					return reversed;
				}
			}),
			idn:require('./lang/idn.js')
		}
	}
)
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

