<template>
	<div>
		<b-form inline>
			<b-form-input class="mb-2 mr-sm-2 mb-sm-0" placeholder="id" v-model="query.phone"/>
			<label for="example-datepicker">From</label>
			<b-form-datepicker v-model="query.from" value-as-date reset-button class="mb-2 mr-sm-1 mb-sm-0"></b-form-datepicker>
			<label for="example-datepicker">To</label>
			<b-form-datepicker v-model="query.to" value-as-date reset-button class="mb-2 mr-sm-2 mb-sm-0"></b-form-datepicker>
			<label>订单状态</label><b-form-select v-model="query.used" :options="[{value:true, text:'已完成'}, {value:false, text:'未完成'}, {value:null, text:'所有'}]" />
			<b-button variant="primary" class="mb-1 mb-sm-0" @click="refreshData">查</b-button>
		</b-form>
		<b-table
			id="order-list"
			ref="orderList"		
			show-empty
			small
			:items="queryorder"
			:fields="order.fields"
			sort-by="time"
			:sort-desc="true"
			:per-page="order.perPage"
			:current-page="order.currentPage"
		>
		<template #custom-foot="data">
			<b-td v-for="(fld, idx) in data.fields" :key="idx">
				<b v-if="fld.label=='id'">Total</b>
				<b v-else-if="fld.label=='金额'">{{sum.money}}</b>
				<b v-else></b>
			</b-td>
		</template>
		</b-table>
		<b-pagination
			v-model="order.currentPage"
			:total-rows="order.total"
			:per-page="order.perPage"
			aria-controls="order-list"
			class="float-right"
		/>
	</div>
</template>

<script>
import {dateTimeString, nullAsZero} from '../etc'
import {openLink} from './auth'

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
	name:'orders',
	data() {
		return {
			fund:null,
			query:{
				phone:null, from:null, end:null, used:true,
			},
			sum:{},
			order:{total:0, rows:null, perPage:25, currentPage:1, fields:[
				{key:'phone', label:'id'},
				{key:'time', label:'时间', formatter:dateTimeString, sortable: true},
				{key:'snapshot.balance', label:'充值前', formatter:nullAsZero},
				{key:'money', label:'金额'},
				{key:'used', label:'结果'},
			]},
		}
	},
	methods:{
		refreshData() {
			this.$refs.orderList.refresh();
		},
		queryorder(ctx, cb) {
			var self=this;
			sock.emit('$list', {target:'bills', query:filteredObject(self.query, v=>!!v), offset:self.order.perPage*(self.order.currentPage-1), limit:self.order.perPage, sort:ctx.sortBy, order:ctx.sortDesc?'desc':'asc'}, (err, {rows, total, sum})=>{
				self.order.total=total;
				self.sum=sum||{};
				cb(rows);				
			})
		},
	}
}
</script>