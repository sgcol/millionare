<template>
<b-form>
<b-tabs>
	<b-tab title="运行参数">
		<b-form-group label="在线人数">
			<p>{{online}}</p>
		</b-form-group>
		<b-form-group label="获胜策略">
			<b-form-radio-group stacked v-model="strategy" :options="[{text:'随机', value:0}, {text:'必胜', value:1}]">
				<b-form-radio value="2">
					<b-form-group label="指定结果" label-cols-sm="4" :invalid-feedback="spec_result_error" :state="spec_result_state">
						<b-form-input v-model="spec_result" @update="strategy=2" placeholder="输入7,8,9，3盘结果分别是7,8,9" :state="spec_result_state"></b-form-input>
					</b-form-group>
				</b-form-radio>
			</b-form-radio-group>
		</b-form-group>
		<b-form-group label="下注抽水" >
			<b-form-input v-model="feeRate" :formatter="feeFormatter"></b-form-input>
		</b-form-group>
		<b-form-group label="取现抽水" invalid-feedback="格式: n%+d" :state="wfState">
			<b-form-input v-model="withdrawFee" :state="wfState"></b-form-input>
		</b-form-group>
	</b-tab>
	<b-tab title="老师配置">
		<b-form-group label="老师WhatsUp" >
			<b-form-input v-model="whatsup"></b-form-input>
		</b-form-group>
	</b-tab>
	<!-- <b-tab title="提款配置"></b-tab>
	<b-tab title="审核提款"><approve-withdraw /></b-tab> -->
</b-tabs>
<b-button block v-on:click="submit" variant="info">Submit</b-button>
</b-form>
</template>

<script>
import {openLink} from './auth.js'
// import approveWithdraw from './approve-withdraw'

export default {
	name:'serverlet',
	components:{
		// approveWithdraw,
	},
	data() {
		return {
			online:null,
			strategy:0,
			spec_result:null,
			feeRate:'2%',
			withdrawFee:'5%',
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
			whatsup:null,
		}
	},
	computed:{
		spec_result_state() {
			if (this.strategy!=2) return null;
			if (!this.spec_result) return null;
			var temp=this.spec_result.split(/[\s,，]+/);
			for (var i=0; i<temp.length; i++) {
				var v=temp[i], n=Number(v);
				if (v===''||v==null) return false;
				if (isNaN(n)) return false;
				if (n<0 || n>9) return false;
			}
			return true;
		},
		spec_result_error() {
			if (!this.spec_result) return null;
			var temp=this.spec_result.split(/[\s,，]+/);
			var last=temp[temp.length-1];
			if (last=='' || last==null) return '结尾必须是数字';
			for (var i=0; i<temp.length; i++) {
				var v=temp[i], n=Number(v);
				if (v===''||v==null) return `第${i+1}个数字是空的`;
				if (isNaN(n)) return `第${i+1}个不是数字`;
				if (n<0 || n>9) return `第${i+1}个数字不在0～9之间`;
			}
			return null;
		},
		wfState() {
			if (this.withdrawFee.length==0) return false;
			var parts=this.withdrawFee.split('%');
			if (parts.length>2) return false;
			for (var i=0; i<parts.length; i++) {
				parts[i]=Number(parts[i]);
				if (isNaN(parts[i])) return false;
			}
			if (parts.length==2 && parts[0]>=100) return false;
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
			var strategy=this.strategy, feeRate=Number(this.feeRate.slice(0, -1))/100, whatsup=this.whatsup;
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
			if (strategy==2) {
				if (!this.spec_result_state) return;
				strategy=undefined;
				var temp_result=this.spec_result.split(/[\s,，]+/);
			}
			openLink((socket)=>{
				socket.emit('setsettings', {strategy, temp_result, feeRate, withdrawPercent:(wfs[0]||0)/100, withdrawFixed:wfs[1]||0, whatsup}, (err)=>{
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
				if (setting.withdrawFixed!=null) {
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