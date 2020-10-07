<template>
<b-form>
<b-tabs>
	<b-tab title="luckyshopee配置">
		<b>必须配置以下参数，否则充值提现都是测试版本</b>
		<p></p>
		<label>下单接口</label>
		<b-form-input v-model="luckyshopee.pay_url"></b-form-input>
		<label>代付接口</label>
		<b-form-input v-model="luckyshopee.withdraw_url"></b-form-input>
		<label>短信接口</label>
		<b-form-input v-model="luckyshopee.sms_url"></b-form-input>
		<label>appId</label>
		<b-form-input v-model="luckyshopee.appId"></b-form-input>
		<label>appKey</label>
		<b-form-input v-model="luckyshopee.appKey"></b-form-input>
		<label>appChannel</label>
		<b-form-input v-model="luckyshopee.appChannel"></b-form-input>
	</b-tab>
	<b-tab title="运行参数">
		<b-form-group label="在线人数">
			<p>{{online}}</p>
		</b-form-group>
		<b-form-group label="获胜策略">
			<b-form-radio-group v-model="strategy" :options="[{text:'随机', value:0}, {text:'必胜', value:1}]"></b-form-radio-group>
		</b-form-group>
		<b-form-group label="下注抽水" >
			<b-form-input v-model="feeRate" :formatter="feeFormatter"></b-form-input>
		</b-form-group>
		<b-form-group label="取现抽水" invalid-feedback="格式: n%+d" :state="wfState">
			<b-form-input v-model="withdrawFee" :state="wfState"></b-form-input>
		</b-form-group>
	</b-tab>
</b-tabs>
<b-button block v-on:click="submit" variant="info">Submit</b-button>
</b-form>
</template>

<script>
import {openLink} from '../client.js'
import auth from './auth'

const stdret=auth.stdret;

export default {
	name:'serverlet',
	data() {
		return {
			online:null,
			strategy:0,
			feeRate:'2%',
			withdrawFee:'5%',
			luckyshopee: {
				sms_url:null,
				pay_url:null,
				withdraw_url:null,
				appId:null,
				appKey:null,
				appChannel:null
			}
		}
	},
	computed:{
		wfState() {
			var parts=this.withdrawFee.split('%');
			if (parts.length>2) return false;
			for (var i=0; i<parts.length; i++) {
				parts[i]=Number(parts[i]);
				if (isNaN(parts[i])) return false;
			}
			return true;
		}
	},
	methods:{
		feeFormatter(v) {
			if (v.slice(-1)=='%') return v;
			return v+'%';
		},
		submit() {
			if (!this.wfState) return;
			var strategy=this.strategy, feeRate=Number(this.feeRate.slice(0, -1))/100, luckyshopee=this.luckyshopee;
			var wfs=(()=>{
				var parts=this.withdrawFee.split('%');
				if (parts.length>2) return false;
				for (var i=0; i<parts.length; i++) {
					parts[i]=Number(parts[i]);
					if (isNaN(parts[i])) return false;
				}
				if (parts.length==1 && this.withdrawFee.slice(-1)!='%') {
					parts[1]=parts[0];
					parts[0]=0;
				}
				return parts;
			})();
			if (!wfs) return;
			openLink((socket)=>{
				socket.emit('setsettings', {strategy, feeRate, withdrawPercent:(wfs[0]||0)/100, withdrawFixed:wfs[1]||0, luckyshopee}, (err)=>{
					if (err) return alert(err);
					alert('success');
				})
			})
		}
	},
	mounted(){
		var self=this;
		openLink((socket)=>{
			socket.emit('getsettings', stdret((err, setting) =>{
				if (err) return alert(err);
				var s='';
				if (setting.withdrawPercent) {
					s+=setting.withdrawPercent*100+'%'
				}
				if (setting.withdrawFixed) {
					if (s.length>0) s+='+';
					s+=setting.withdrawFixed;
				}
				setting.withdrawFee=s;
				setting.feeRate=setting.feeRate*100+'%';
				Object.assign(self, setting);
			}))
		})
	}
}
</script>