<template>
<b-form>
<b-tabs>
	<b-tab title="支付配置">
		<b>必须配置以下参数，否则充值提现都是测试版本</b>
		<p></p>
		<label>下单接口</label>
		<b-form-input v-model="luckyshopee.pay_url"></b-form-input>
		<label>代付接口</label>
		<b-form-input v-model="luckyshopee.withdraw_url"></b-form-input>
		<label>代付检查接口</label>
		<b-form-input v-model="luckyshopee.check_withdraw_url"></b-form-input>
		<label>可用资金接口</label>
		<b-form-input v-model="luckyshopee.check_fund_url"></b-form-input>
		<label>短信接口</label>
		<b-form-input v-model="luckyshopee.sms_url"></b-form-input>
		<label>appId</label>
		<b-form-input v-model="luckyshopee.appId"></b-form-input>
		<label>appKey</label>
		<b-form-input v-model="luckyshopee.appKey"></b-form-input>
		<label>appChannel</label>
		<b-form-input v-model="luckyshopee.appChannel"></b-form-input>
	</b-tab>
	<!-- <b-tab title="提款配置"></b-tab>
	<b-tab title="审核提款"><approve-withdraw /></b-tab> -->
</b-tabs>
<b-button block v-on:click="submit" variant="info">Submit</b-button>
</b-form>
</template>

<script>
import {openLink} from '../admin/auth'
// import approveWithdraw from './approve-withdraw'

export default {
	name:'serverlet',
	components:{
		// approveWithdraw,
	},
	data() {
		return {
			luckyshopee: {
				sms_url:null,
				pay_url:null,
				withdraw_url:null,
				check_withdraw_url:null,
				check_fund_url:null,
				appId:null,
				appKey:null,
				appChannel:null
			},
		}
	},
	computed:{
	},
	methods:{
		submit() {
			var luckyshopee=this.luckyshopee;
			openLink((socket)=>{
				socket.emit('setsettings', {luckyshopee}, (err)=>{
					if (err) return alert(err);
					alert('success');
				})
			})
		}
	},
	mounted(){
		var self=this;
		openLink((socket)=>{
			socket.emit('getsettings', (err, setting) =>{
				if (err) return alert(err);
				var s='';
				if (setting.withdrawPercent) {
					s+=setting.withdrawPercent*100+'%'
				}
				if (setting.withdrawFixed) {
					if (s.length>0) s+='+';
					s+=setting.withdrawFixed;
				}
				if (setting.temp_result && setting.temp_result.length) {
					setting.spec_result=setting.temp_result.join(',');
					setting.strategy=2;
				}
				setting.withdrawFee=s;
				setting.feeRate=setting.feeRate*100+'%';
				Object.assign(self, setting);
			})
		})
	}
}
</script>