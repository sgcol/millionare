<template>
<div>
	<b-form>
		<b-form-group class="mt-1" label="用户手机/id">
			<b-input-group class="ml-1 mr-1">
				<b-form-input v-model="phone" required></b-form-input>
				<b-input-group-append><b-button type="submit" variant="info" v-on:click="findUser">Find</b-button></b-input-group-append>
			</b-input-group>
		</b-form-group>
	</b-form>
	<div v-show="Object.keys(userdata).length">
		<b-form-group label="" label-cols="4">
			<template v-slot:label>
				<span>phone <code>{{userdata.phone}}</code></span>
			</template>
			<b-form-checkbox v-model="blocked" name="check-button" switch>
				禁用账号 <b>(Blocked: {{ blocked }})</b>
			</b-form-checkbox>
		</b-form-group>
		<b-form-group label="name" label-cols="4">
			<b-form-input readonly v-model="userdata.name"></b-form-input>
		</b-form-group>
		<b-form-group label="" label-cols="4">
			<template v-slot:label>
				<span>balance <code>{{userdata.balance||0}}</code></span>
			</template>
			<b-input-group>
				<b-form-input id="m_balance"></b-form-input>
				<b-input-group-append><b-button variant="info" v-on:click="modifyBalance">Add</b-button></b-input-group-append>
			</b-input-group>
		</b-form-group>
		<b-form-group label="充值" label-cols="4">
			<b-form-input readonly v-model="userdata.recharge"></b-form-input>
		</b-form-group>
		<b-form-group label="下注" label-cols="4">
			<b-form-input readonly v-model="userdata.bet"></b-form-input>
		</b-form-group>
		<b-form-group label="银行" label-cols="4">
			<b-card>
				<b-card-text>{{bankCode}}</b-card-text>
				<b-card-text>{{accountName}}</b-card-text>
				<b-card-text>{{accountNo}}</b-card-text>
				<b-card-text>{{bankphone}}</b-card-text>
				<b-button class="float-right" variant="danger">删</b-button>
			</b-card>
		</b-form-group>
		<b-form-group label="注册IP" label-cols="4"><b-form-input readonly v-model="userdata.regIP"/></b-form-group>
		<b-form-group label="登录IP" label-cols="4"><b-form-input readonly v-model="userdata.lastIP"/></b-form-group>
		<b-form-group label="活动" label-cols="4">
			<b-form-group label="拜师送4500" label-size="sm" label-cols="4"><b-button size="sm" variant="primary" @click="handle_promotion_baishi" :disabled="!enable_baishi4500">完成</b-button></b-form-group>
		</b-form-group>
		<b-form-group label="充值记录">
			<b-table
				id="recharge-list"
				ref="rechargeList"		
				show-empty
				small
				:items="queryBills"
				:fields="recharge.fields"
				sort-by="time"
				:sort-desc="true"
				:per-page="recharge.perPage"
				:current-page="recharge.currentPage"
			>
			</b-table>
			<b-pagination
				v-model="recharge.currentPage"
				:total-rows="recharge.total"
				:per-page="recharge.perPage"
				aria-controls="recharge-list"
			/>
		</b-form-group>
		<b-form-group label="提现记录">
			<b-table
				id="withdraw-list"
				ref="withdrawList"		
				show-empty
				small
				:items="queryWithdrawal"
				:fields="withdraw.fields"
				sort-by="time"
				:sort-desc="true"
				:per-page="withdraw.perPage"
				:current-page="withdraw.currentPage"
			>
			</b-table>
			<b-pagination
				v-model="withdraw.currentPage"
				:total-rows="withdraw.total"
				:per-page="withdraw.perPage"
				aria-controls="withdraw-list"
			/>
		</b-form-group>
	</div>
</div>
</template>

<script>
import {openLink} from '../client.js'
import auth from "./auth"
import {get} from 'object-path'
import TDGA from '../stat'
import {dateTimeString, nullAsZero} from '../etc'

const stdret=auth.stdret;
var sock=openLink();

export default {
	name:'userMan',
	computed:{
		blocked:{
			get() {
				return new Date(this.userdata.block)>new Date();
			},
			set(v) {
				var self=this;
				var date=v?new Date('2100/01/01'):new Date('1970/01/01');
				sock.emit('disableuser', self.phone, date, stdret((err) =>{
					if (err) return alert(err);
					self.$set(self.userdata, 'block', date);
				}))
			}
		},
		paytm_ids() {
			if (Array.isArray(this.userdata.paytm_id)) return this.userdata.paytm_id;
			return [this.userdata.paytm_id];
		},
		bankCode() {
			return get(this.userdata, 'bankinfo.bankCode');
		},
		accountName() {
			return get(this.userdata, 'bankinfo.accountName');
		},
		accountNo() {
			return get(this.userdata, 'bankinfo.accountNo');
		},
		bankphone() {
			return get(this.userdata, 'bankinfo.phone');
		},
	},
	data() {
		return {
			phone:null,
			userdata:{bankInfo:{}},
			enable_baishi4500:false,
			recharge:{total:0, rows:null, perPage:15, currentPage:1, fields:[
				{key:'time', label:'时间', formatter:dateTimeString, sortable: true},
				{key:'snapshot.balance', label:'资金', formatter:nullAsZero},
				{key:'money', label:'充值'},
			]},
			withdraw:{total:0, rows:null, perPage:15, currentPage:1, fields:[
				{key:'time', label:'时间', formatter:dateTimeString, sortable: true},
				{key:'snapshot.bankName', label:'银行'},
				{key:'snapshot.accountNo', label:'账号'},
				{key:'snapshot.accountName', label:'Owner'},
				{key:'snapshot.balance', label:'资金', formatter:nullAsZero},
				{key:'snapshot.amount', label:'提现'},
				{key:'snapshot.fee', label:'手续费'},
				{key:'result.tradeStatus', label:'结果'},
			]},
		}
	},
	methods:{
		manipulatedata(ud) {
			var self=this;
			for (var k in ud) {
				self.$set(self.userdata, k, ud[k]);
			}
		},
		findUser(e) {
			e.preventDefault();
			if (!this.phone) return;
			var phone=this.phone, self=this;
			sock.emit('$list', {target:'users', query:{phone}}, stdret((err, [ud])=>{
				if (err) return alert(err);
				self.manipulatedata(ud);
				sock.emit('list', {target:'promotions', query:{phone}}, (err, promotions)=>{
					if (err) return;
					if (promotions.includes('baishi4500')) self.enable_baishi4500=true;
				})
			}))
			// this.queryBills();
			this.$refs.rechargeList.refresh();
			this.$refs.withdrawList.refresh();
		},
		queryBills(ctx, cb) {
			var self=this;
			sock.emit('$list', {target:'bills', query:{phone:self.phone}, offset:self.recharge.perPage*(self.recharge.currentPage-1), limit:self.recharge.perPage, sort:ctx.sortBy, order:ctx.sortDesc?'desc':'asc'}, (err, rows, total)=>{
				self.recharge.total=total;
				cb(rows);				
			})
		},
		queryWithdrawal(ctx, cb) {
			var self=this;
			sock.emit('$list', {target:'withdraw', query:{phone:self.phone}, offset:self.withdraw.perPage*(self.withdraw.currentPage-1), limit:self.withdraw.perPage, sort:ctx.sortBy, order:ctx.sortDesc?'desc':'asc'}, (err, rows, total)=>{
				self.withdraw.total=total;
				cb(rows);				
			})
		},
		modifyBalance() {
			var delta=Number(document.getElementById('m_balance').value);
			if (Number.isNaN(delta)) return;
			var phone=this.phone, self=this;
			sock.emit('modifybalance', phone, delta, stdret((err, chg)=>{
				if (err) return alert(err);
				self.manipulatedata(chg);
				// for talkingdata
				TDGA.Account({
					accountId : phone,
				});
				TDGA.onReward(delta, '管理员操作');
			}))
		},
		chgPaytm(e) {
			var idx=e.target.dataset.idx;
			var new_id=document.getElementById(`paytm_id${idx}`).value;
			if (!Array.isArray(this.userdata.paytm_id)) idx=null
			var self=this;

			sock.emit('changepaytm', self.phone, idx, new_id, stdret((err, chg)=>{
				if (err) return alert(err);
				self.manipulatedata(chg);
			}))
		},
		delPaytm(e) {
			var idx=e.target.dataset.idx;
			var id=document.getElementById(`paytm_id${idx}`).value;
			var self=this;

			sock.emit('delpaytm', self.phone, id, stdret((err)=>{
				if (err) return alert(err);
				self.$set(self.userdata, 'paytm_id', null);
			}))
		},
		handle_promotion_baishi(e) {
			e.preventDefault();
			var self=this;
			sock.emit('upd', {target:'promotions', query:{phone:self.phone}, name:'baishi4500'}, (err)=>{
				if (err) return alert(err);
				self.userdata.balance+=4500;
				self.enable_baishi4500=false;
				TDGA.Account({
					accountId : self.phone,
				});
				TDGA.onReward(4500, '拜师送4500');
				TDGA.onEvent('baishi4500', JSON.stringify({user:self.phone, reward:4500}));

			})
		},
	},
	mounted() {
		this.userdata={};
	},
	// watch: {
	// 	'recharge.perPage':function() {
	// 		this.queryBills();
	// 	},
	// 	'recharge.currentPage':function() {
	// 		this.queryBills();
	// 	},
	// }
}
</script>