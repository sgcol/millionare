<template>
	<div>
		<b-modal ref="menu" hide-header hide-footer>
			<form>
				<b-button variant="outline-primary" block @click="showtopup">{{$t('Top up')}}</b-button>
				<b-button variant="outline-primary" block @click="showwithdraw">{{$t('Withdraw')}}</b-button>
				<b-button variant="outline-primary" block @click="showlang">{{$t('Language')}}</b-button>
				<b-button variant="outline-primary" block @click="showRule">{{$t('Rules')}}</b-button>
				<b-button variant="outline-primary" block v-if="isFBLogined()" @click="signoutfromfb">{{$t('Logout from Facebook')}}</b-button>
				<b-button variant="outline-primary" block v-on:click="signout" v-else>{{$t('Sign out')}}</b-button>
				<b-button variant="outline-primary" block v-on:click="hide" style="margin-top:40px">{{$t('Close')}}</b-button>
			</form>
		</b-modal>
		<b-modal ref="topup" id="topup" title="Top Up" hide-footer>
			<form>
				<b-row>
					<b-col sm="6">
						<label for="balance" style="color:grey; font-size:24px">{{$t('Current Balance')}}</label>
					</b-col>
					<b-col sm="6">
						<b-form-input id="balance" readonly v-bind:value="me?Number(me.balance).toFixed(2): '-'"></b-form-input>
					</b-col>
				</b-row>
			</form>
			<b-form-group :label="$t('Select amount:')" style="margin-top:12px">
				<b-form-radio-group class="pricelist" buttons button-variant="outline-primary" v-model="money" name="select_amount" style="display:inline">
					<b-form-radio v-for="price in pricelist.slice(0, 3)" :key="price" :value="price">{{formatedMoney(price)}}</b-form-radio>
					<b-form-radio v-for="price in pricelist.slice(3)" :key="price" :value="price">{{formatedMoney(price)}}</b-form-radio>
					<b-form-radio value="custom" style="width:90.8%; padding-top:11px;">
						<b-input-group prepend="Rp">
							<b-form-input v-model="amount" type="number" :placeholder="$t('At least Rp 10,000')"></b-form-input>
						</b-input-group>
					</b-form-radio>
					<!-- <b-form-radio v-bind:value="money">{{money}}</b-form-radio> -->
					<!-- <b-row>
						<b-col sm="4" v-for="money in [15000, 25000, 50000]" :key="money">
							<b-form-radio button button-variant="outline-primary" v-bind:value="money">{{money}}</b-form-radio>
						</b-col>
					</b-row> -->
				</b-form-radio-group>
			</b-form-group>
			<form class="mt-5">
				<b-button block v-on:click="recharge" variant="primary">{{$t('Recharge')}}</b-button>
			</form>
		</b-modal>
		<b-modal ref="withdraw" id="withdraw" :title="$t('Withdraw')" hide-footer>
			<withdraw-idr v-if="locale=='in_ID'"></withdraw-idr>
			<b-form v-else>
				<b-form-group>
					<label for="balance" style="color:grey; font-size:24px">{{$t('Withdrawable')}}</label>
					<p style="font-size:24px; margin-top:5px">₹ {{me?Number(me.balance).toFixed(2): '-'}}</p>
				</b-form-group>
				<b-form-group>
					<p style="font-size:20px; color:#147239;">{{$t('Withdraw via ')}}
						<img style="height:20px" src="../assets/ovo.png" v-if="locale=='in_ID'">
						<img style="height:20px" src="../assets/paytm.png" v-else>
					</p>
					<p class="pl-3" style="font-size:20px; color:#147239;" v-if="me.paytm_id">{{me.paytm_id}}</p>
					<b-button v-else size="lg" variant="outline-primary" v-b-modal.paytmid>{{$t('+ Add Paytm ID')}}</b-button>
				</b-form-group>
				<b-form-group :label="$t('Select amount:(₹500-₹50000)')" class="mt-1">
					<b-form-input v-model="$v.withdraw_amount.$model" :state="validateState('withdraw_amount')" aria-describedby="input-amount-live-feedback"></b-form-input>
					<b-form-invalid-feedback id="input-amount-live-feedback">{{$t('The amount must be between 500 and 50,000 and be divisible by 100')}}</b-form-invalid-feedback>
				</b-form-group>
				<ol>
					<li>{{$t('The cash withdrawal amout must be at least ₹500.')}}</li>
					<li>{{$t('Daily cash withdrawal limit of ₹50000.')}}</li>
					<li>{{$t('The amount entered must be an integral multiple of ₹100.')}}</li>
					<li>{{$t('The service charge shall be deducetd by payment channel :5%.')}}</li>
				</ol>
				<b-form-group>
					<b-button block variant="primary" v-on:click="withdraw">{{$t('Withdraw')}}</b-button>
				</b-form-group>
			</b-form>
		</b-modal>
		<b-modal ref="lang" id="lang" :title="$t('Language')" ok-only>
			<b-form>
				<b-form-group :label="$t('Choose your language')">
					<b-form-radio-group
						v-model="selected_lang"
						:options="[{text:'English UK', value:'en'}, {text:'Indonesian', value:'idn'}]"
						stacked
					>
					</b-form-radio-group>
				</b-form-group>
			</b-form>
		</b-modal>
		<b-modal ref="paytmid" id="paytmid" :title="withdrawOrgName()" hide-footer>
			<b-form>
				<b-form-group>
					<label>{{$t('Enter Mobile Number')}}</label>
					<b-form-input v-model="$v.mobile.$model" :state="validateState('mobile')" aria-describedby="input-phone-live-feedback"></b-form-input>
					<b-form-invalid-feedback id="input-phone-live-feedback">{{$t('This is a required field must be 10 numerics starts with 7, 8, or 9')}}</b-form-invalid-feedback>
				</b-form-group>
			<b-form-group class="mt-5">
				<b-button block variant="primary" v-on:click="setpaytmid">{{$t('Save')}}</b-button>
			</b-form-group>
			</b-form>
		</b-modal>
		<Rule ref="ru" id="ru"></Rule>
	</div>
</template>

<script>
import 'url-search-params-polyfill';
import {docCookies, eventBus, openLink} from '../client.js'
import { mapState } from 'vuex'
import { validationMixin } from "vuelidate";
import { required, numeric } from "vuelidate/lib/validators";
import conf from '../conf'
import TDGA from '../stat'
// import Rule from './rule.vue'

var _pricelist=[50000, 200000, 500000,1000000, 2000000, 5000000]
var vueSettings= {
	name:'mymenu',
	mixins: [validationMixin],
	components:{
		Rule:()=>import('./rule.vue'),
		WithdrawIdr:()=>import('./withdraw.idn.vue'),
	},
	computed:{
		...mapState({
			status: state=>state.status,
			me: state => state.me,
			fb: state=>state.fb,
		}),
		money :{
			get: function() {
				if (this.amount==null) return null;
				if (_pricelist.includes(this.amount)) return this.amount;
				return 'custom';
			},
			set: function(v) {
				if (v==null) return;
				if (typeof v!='number') return;
				this.amount=v;
			}
		},
	},
	data(){
		return {pricelist:_pricelist, amount:conf.locale=='in_ID'?50000:100,withdraw_amount:conf.locale=='in_ID'?500000:500, mobile:null, locale:conf.locale, selected_lang:this.$i18n.locale, user_choosed:null}
	},
	watch: {
		selected_lang(v) {
			this.$i18n.locale=v;
		}
	},
	methods:{
		isFBLogined() {
			return this.fb.connected || docCookies.getItem('fb');
		},
		withdrawOrgName() {
			switch (conf.locale) {
				case 'in_ID':
					return this.$i18n.t('Add OVO');
				case 'hi_IN':
					return this.$i18n.t('Add Paytm ID');
				default:
					return this.$i18n.t('Unspecified officer');
			}
		},
		showRule() {
			this.$refs.ru.show();
		},
		formatedMoney(money) {
			if (conf.locale==='in_ID') {
				if (money>1000) return Math.floor(money/1000)+'k';
			}
			return money;
		},
		show() {
			this.$refs.menu.show();
		},
		hide() {
			this.$refs.menu.hide();
		},
		validateState(name) {
			const { $dirty, $error } = this.$v[name];
			return $dirty ? !$error : null;
			// return name;
		},
		showtopup() {
			this.$refs.topup.show();
		},
		showwithdraw() {
			this.$refs.withdraw.show();
		},
		showlang() {
			this.$refs.lang.show();
		},
		signoutfromfb() {
			if (this.fb && this.fb.logout) this.fb.logout();
			docCookies.removeItem('fb');
			this.signout();
		},
		signout() {
			TDGA.onPageLeave();
			this.hide();
			this.$store.commit('setMe', {
				balance:null,
				_id:null,
				paytm_id:null,
				name:null,
				icon:null
			})
			openLink((socket)=>{
				socket.close();
				docCookies.removeItem('token');
				docCookies.removeItem('phone');
				eventBus.$emit('relogin');
			})
		},
		recharge() {
			var sp=new URLSearchParams(location.search);
			var amount=Number(this.amount);
			if (amount<10000) return alert(this.$i18n.t('At least Rp 10,000'));
			openLink((socket)=>{
				socket.emit('recharge', amount, sp.get('td_channelid'), (err, pack)=>{
					if (err) return alert(err);
					// window.TDGA.onChargeSuccess({
					// 	orderId:pack.orderid,
					// 	currencyAmount:amount,
					// 	currencyType:'IDR',
					// 	virtualCurrencyAmount:amount,
					// 	paymentType:''
					// })
					if (pack.jumpto) location.href=pack.jumpto;
				});
			})
		},
		setpaytmid() {
			this.$v.$touch();
			if (this.$v.mobile.$error) return false;
			var id=this.mobile, self=this;
			if (!id) return alert('please input paytm id');
			openLink((socket)=>{
				socket.emit('setpaytmid', id, (err)=>{
					if (err) alert(err);
					self.$refs.paytmid.hide();
				})
			})
		},
		withdraw() {
			this.$v.$touch();
			if (this.$v.withdraw_amount.$error) return false;
			var amount=Number(this.withdraw_amount), self=this;
			if (!amount) return alert('please input amount to withdraw');
			openLink((socket)=>{
				socket.emit('withdraw', amount, (err)=>{
					if (err) alert(err);
					else alert('success');
					self.$refs.withdraw.hide();
				})
			})
		}
	},
	validations:{
		mobile:{
			required,
			numeric,
			isPhoneNumber:(v)=>{
				v=String(v);
				if (v.length!=10) return false;
				if (v[0]==7 || v[0]==8 || v[0]==9) return true;
				return false;
			}
		},
		withdraw_amount:{
			required,
			numeric,
			valid(v) {
				v=Number(v);
				if (v<500) return false;
				if (v>50000) return false;
				if (v%100!=0) return false;
				return true;
			}
		},
	}
}

if (conf.locale=='in_ID') {
	vueSettings.validations={
		mobile:{
			required,
			numeric,
			isPhoneNumber:(v)=>{
				v=String(v);
				if (v.length<7) return false;
				if (v.substring(0, 3)!=='081' ||v.substring(0, 2)!=='81') return false;
				return true;
			}
		},
		withdraw_amount:{
			required,
			numeric,
			valid(v) {
				v=Number(v);
				if (v<500000) return false;
				if (v>50000000) return false;
				if (v%100000!=0) return false;
				return true;
			}
		},		
	}
}
export default vueSettings;

</script>
<style scoped>
	.pricelist>label {
		margin: 20px 6px 0 !important;
		min-width:28%;
		height:60px;
		padding-top:15px;
	}
	/* #pricelist>label:nth-child(4) {
		position: absolute;
		left: 0px;
		top: 80px;
	}
	#pricelist>label:nth-child(5) {
		position: absolute;
		left: 92px; 
		top: 80px;
	}
	#pricelist>label:nth-child(6) {
		position: absolute;
		left: 184px; 
		top: 80px;
	} */

</style>