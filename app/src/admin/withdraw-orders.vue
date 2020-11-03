<template>
	<div>
		<b-form inline>
			<b-form-input class="mb-2 mr-sm-2 mb-sm-0" placeholder="id" v-model="query.phone"/>
			<label for="example-datepicker">From</label>
			<b-form-datepicker v-model="query.from" value-as-date reset-button class="mb-2 mr-sm-1 mb-sm-0"></b-form-datepicker>
			<label for="example-datepicker">To</label>
			<b-form-datepicker v-model="query.to" value-as-date reset-button class="mb-2 mr-sm-2 mb-sm-0"></b-form-datepicker>
			<b-button variant="primary" class="mb-1 mb-sm-0" @click="refreshData">查</b-button>
		</b-form>
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
		<template v-slot:cell(actions)="row">
			<b-button-group size="sm">
				<b-button @click="approval(row.item)" variant="primary" :disabled="!!row.item.tradeno">提</b-button>
				<b-button @click="refund(row.item)" variant="danger" :disabled="!!row.item.tradeno">退</b-button>
			</b-button-group>
			<!-- <b-button size="sm" v-b-modal.modal-chgpwd @click="account.phone=row.item.phone">reset password</b-button> -->
		</template>
		</b-table>
		<b-pagination
			v-model="withdraw.currentPage"
			:total-rows="withdraw.total"
			:per-page="withdraw.perPage"
			aria-controls="withdraw-list"
		/>
	</div>
</template>

<script>
import {dateTimeString, nullAsZero} from '../etc'
import {openLink} from '../client'

const sock=openLink();
const filteredObject = (myObject, accept)=>{
	if (Array.isArray(accept))
		return Object.keys(myObject).reduce(function(r, e) {
			if (accept.includes(myObject[e])) r[e] = myObject[e]
			return r;
		}, {})
	else if (typeof accept ==='function') 
		return Object.keys(myObject).reduce(function(r, e) {
			if (accept(myObject[e])) r[e] = myObject[e]
			return r;
		}, {})
	else return null;
}

export default {
	name:'withdrawOrders',
	data() {
		return {
			query:{
				phone:null, from:null, end:null,
			},
			withdraw:{total:0, rows:null, perPage:25, currentPage:1, fields:[
				{key:'phone', label:'id'},
				{key:'time', label:'时间', formatter:dateTimeString, sortable: true},
				{key:'snapshot.bankName', label:'银行'},
				{key:'snapshot.accountNo', label:'账号'},
				{key:'snapshot.accountName', label:'Owner'},
				{key:'snapshot.balance', label:'资金', formatter:nullAsZero},
				{key:'snapshot.amount', label:'提现'},
				{key:'snapshot.fee', label:'手续费'},
				{key:'tradeno', label:'通道订单'},
				{key:'result.tradeStatus', label:'结果'},
				{key:'actions', label:'操作'},
			]},
		}
	},
	methods:{
		refreshData() {
			this.$refs.withdrawList.refresh();
		},
		queryWithdrawal(ctx, cb) {
			var self=this;
			sock.emit('$list', {target:'withdraw', query:filteredObject(self.query, v=>v!=null), offset:self.withdraw.perPage*(self.withdraw.currentPage-1), limit:self.withdraw.perPage, sort:ctx.sortBy, order:ctx.sortDesc?'desc':'asc'}, (err, rows, total)=>{
				self.withdraw.total=total;
				cb(rows);				
			})
		},
	}
}
</script>