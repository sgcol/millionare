<template>
<div>
	<b-alert dismissible :show="!!err" @dismissed="errDismissed" variant="warning">{{err}}</b-alert>
	<b-form-group label="在线">
	<b-table
		id="online-list-table" 				
		show-empty
		small
		stacked="md"
		:items="users"
		:fields="userfields"
		:per-page="perPage"
		:current-page="currentPage">
		<template v-slot:cell(recharge)="row">
			{{row.item.recharge}}
			<span v-if="row.item.rechargeTime">
				/{{dateTimeString(row.item.rechargeTime)}}
			</span>
		</template>
		<template v-slot:cell(actions)="row">
			<b-button size="sm" @click="kick(row.item)" v-if="!row.item.isAdmin">kick</b-button>
			<!-- <b-button size="sm" v-b-modal.modal-chgpwd @click="account.phone=row.item.phone">reset password</b-button> -->
		</template>
	</b-table>
	<b-pagination
      v-model="currentPage"
      :total-rows="users?users.length:0"
      :per-page="perPage"
      aria-controls="online-list-table"
    ></b-pagination>
	</b-form-group>
	<b-form-group label="">
		<template v-slot:label>
			<b-list-group flush>
				<b-list-group-item class="d-flex justify-content-between align-items-center">
					Period: {{period}}
					<b-badge variant="primary" pill>{{countdown}}</b-badge>
				</b-list-group-item>
			</b-list-group>
		</template>
		<b-table 				
			show-empty
			small
			:items="setdata"
		>
			<template v-slot:cell()="cell">
				<span v-if="cell.index==0">{{cell.value}}</span>
				<div v-else>
					<p v-for="(contract, index) in cell.value" :key="index">{{contract.name||contract.id}}:{{contract.bet}}</p>
				</div>
			</template>
		</b-table>
	</b-form-group>
</div>
</template>

<script>
import { dateTimeString } from '../etc'
import {openLink} from './auth'
import {router} from './router'
import { mapState } from 'vuex'

const sock=openLink();

export default {
	name: 'GameSet',
	computed:{
		setdata() {
			var slot={}, total={Green:0, Violet:0, Red:0, '0':0, '1':0, '2':0, '3':0, '4':0, '5':0, '6':0, '7':0, '8':0, '9':0};
			if (!this.contracts) return [total];

			this.contracts.forEach((c)=>{
				if (!slot[c.select]) slot[c.select]=[];
				slot[c.select].push({id:c.phone, name:c.name, bet:c.betting});
				if (total[c.select]==null) total[c.select]=c.betting;
				else total[c.select]+=c.betting;
			})

			return [total, slot];
		},
		...mapState({
			status: state=>state.status,
			period: state =>state.period,
			countdown(state) {return Math.floor((state.countdown)/60).pad()+':'+(state.countdown%60).pad()},
		}),
	},
	data() {
		return {
			err:null,
			perPage:15,
			currentPage:1,
			users:null,
			userfields:[
				{key:'phone', label:'id'},
				'name',
				{key:'balance', label:'资金'},
				{key:'recharge', label:'充值'},
				{key:'bet', label:'投注'},
				{key:'win', label:'获利'},
				{key:'regTime', label:'注册时间', formatter:dateTimeString},
				{key:'actions', label:'操作'}
			],
			contracts:null,
		}
	},
	created() {
		var self=this;
		sock.on('userin', (user)=>{
			if (Array.isArray(self.users)) {
				self.users.push(user);
				sock.emit('$list', {target:'bills', query:{phone:user.phone, used:true}, sort:'time', order:'desc', limit:1}, (err, bills)=>{
					bills.forEach(bill=>{
						self.$set(user, 'rechargeTime', bill.time);
					})
				});
			}
		})
		.on('userout', (phone)=>{
			if (Array.isArray(self.users)) {
				var idx=self.users.findIndex(user=>user.phone==phone);
				if (idx>=0) self.users.splice(idx, 1);
			}
		})
		.on('contract', (contract)=>{
			if (Array.isArray(self.contracts)) self.contracts.push(contract)
		})
		.on('statechanged', (o)=>{
			if (o.period!=null && o.period!=self.period) {
				self.contracts=[];
			}
		})

		sock.emit('$list', {target:'online'}, (err, ul)=>{
			if (err) return self.showerr(err);
			self.users=ul;
			sock.emit('$list', {target:'bills', query:{phone:{$in:ul.map(u=>u.phone)}, used:true}, sort:'time', order:'desc', limit:1}, (err, bills)=>{
				bills.forEach(bill=>{
					var user=self.users.find(u=>u.phone==bill.phone);
					user.rechargeTime=bill.time;
				})
			});
		})

		sock.emit('$list', {target:'contracts'}, (err, cs)=>{
			if (err) return self.showerr(err);
			self.contracts=cs;
		})
	},
	methods:{
		showerr(e) {
			this.err=e;
		},
		errDismissed() {
			if (this.err=='access denied') router.push('/login');
			this.err=null;
		},
		kick(user) {
			var self=this;
			sock.emit('kick', user.phone, (err)=>{
				if (err) return self.showerr(err);
				alert('done');
			})
		}
	}
}
</script>