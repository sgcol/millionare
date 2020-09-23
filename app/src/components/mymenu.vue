<template>
	<div>
		<b-modal ref="menu" hide-header hide-footer>
			<form>
				<b-button variant="outline-primary" block v-b-modal.topup>{{$t('Top up')}}</b-button>
				<b-button variant="outline-primary" block v-b-modal.withdraw>{{$t('Withdraw')}}</b-button>
				<b-button variant="outline-primary" block v-if="fb.connected" @click="fb.logout">{{$t('Logout from Facebook')}}</b-button>
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
			<b-form-group label="Select amount:" style="margin-top:12px">
				<b-form-radio-group class="pricelist" buttons button-variant="outline-primary" v-model="amount" name="select_amount" style="display:inline">
					<b-form-radio v-for="money in [50000, 200000, 500000]" :key="money" :value="money">{{formatedMoney(money)}}</b-form-radio>
					<b-form-radio v-for="money in [1000000, 2000000, 5000000]" :key="money" :value="money">{{formatedMoney(money)}}</b-form-radio>
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
			<b-form>
				<b-form-group>
					<label for="balance" style="color:grey; font-size:24px">{{$t('Withdrawable')}}</label>
					<p style="font-size:24px; margin-top:5px">₹ {{me?Number(me.balance).toFixed(2): '-'}}</p>
				</b-form-group>
				<b-form-group>
					<p style="font-size:20px; color:#147239;">{{$t('Withdraw via ')}}<img style="height:20px" :src="$t('../assets/paytm.png')"></p>
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
					<b-button block variant="primary" v-on:click="withdraw">Withdraw</b-button>
				</b-form-group>
			</b-form>
		</b-modal>
		<b-modal ref="paytmid" id="paytmid" :title="$t('Add Paytm ID')" hide-footer>
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
	</div>
</template>

<script>
import {docCookies, eventBus, openLink} from '../client.js'
import { mapState } from 'vuex'
import { validationMixin } from "vuelidate";
import { required, numeric } from "vuelidate/lib/validators";
import i18n from '../lang'

var vueSettings= {
	name:'mymenu',
	mixins: [validationMixin],
	components:{
	},
	computed:mapState({
		status: state=>state.status,
		me: state => state.me,
		fb: state=>state.fb,
	}),
	data(){
		return {amount:100,withdraw_amount:500, mobile:null}
	},
	methods:{
		formatedMoney(money) {
			if (this.$i18n.locale==='idn') {
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
		signout() {
			this.hide();
			openLink((socket)=>{
				socket.close();
				docCookies.removeItem('token');
				eventBus.$emit('relogin');
			})
		},
		recharge() {
			var amount=this.amount;
			openLink((socket)=>{
				socket.emit('recharge', amount, (err, pack)=>{
					if (err) return alert(err);
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

if (i18n.locale=='idn') {
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