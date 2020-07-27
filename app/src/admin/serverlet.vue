<template>
<div>
	<p>在线人数<span>{{online}}</span></p>
	<b-form-group label="获胜策略">
		<b-form-radio-group v-model="strategy" :options="[{text:'随机', value:0}, {text:'必胜', value:1}]"></b-form-radio-group>
	</b-form-group>
	<b-form-group label="下注抽水">
		<b-form-input v-model="feeRate"></b-form-input>
	</b-form-group>
	<b-form-group label="取现抽水">
		<b-form-input v-model="withdrawFee"></b-form-input>
	</b-form-group>
	<b-form-group>
		<b-button block v-on:click="submit" variant="info">Submit</b-button>
	</b-form-group>
</div>
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
			strategy:null,
			feeRate:0.02,
			withdrawFee:0.05
		}
	},
	methods:{
		submit() {
			var strategy=this.strategy, feeRate=Number(this.feeRate), withdrawFee=Number(this.withdrawFee);
			openLink((socket)=>{
				socket.emit('setsettings', {strategy, feeRate, withdrawFee}, (err)=>{
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
				Object.assign(self, setting);
			}))
		})
	}
}
</script>