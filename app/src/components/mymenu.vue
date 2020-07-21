<template>
	<div>
		<b-modal ref="menu" hide-header hide-footer>
			<form>
				<b-button variant="outline-primary" block v-b-modal.topup>Top up</b-button>
				<b-button variant="outline-primary" block>Withdraw</b-button>
				<b-button variant="outline-primary" v-if="me.isAdmin" block>管理后台</b-button>
				<b-button variant="outline-primary" block v-on:click="signout">Sign out</b-button>
				<b-button variant="outline-primary" block v-on:click="hide" style="margin-top:40px">Close</b-button>
			</form>
		</b-modal>
		<b-modal id="topup" title="Top Up" hide-footer>
			<form>
				<b-row>
					<b-col sm="6">
						<label for="balance" style="color:grey; font-size:24px">Current Balance</label>
					</b-col>
					<b-col sm="6">
						<b-form-input id="balance" readonly v-bind:value="me?Number(me.balance).toFixed(2): '-'"></b-form-input>
					</b-col>
				</b-row>
			</form>
			<b-form-group label="Select amount:" style="margin-top:12px">
				<b-form-radio-group id="pricelist" buttons button-variant="outline-primary" v-model="amount" name="select_amount" style="display:inline">
					<b-form-radio v-for="money in [100, 200, 500]" :key="money" :value="money">{{money}}</b-form-radio>
					<b-form-radio v-for="money in [1000, 2000, 5000]" :key="money" :value="money">{{money}}</b-form-radio>
					<!-- <b-form-radio v-bind:value="money">{{money}}</b-form-radio> -->
					<!-- <b-row>
						<b-col sm="4" v-for="money in [15000, 25000, 50000]" :key="money">
							<b-form-radio button button-variant="outline-primary" v-bind:value="money">{{money}}</b-form-radio>
						</b-col>
					</b-row> -->
				</b-form-radio-group>
			</b-form-group>
			<form class="mt-5">
				<b-button block v-on:click="recharge" variant="primary">Recharge</b-button>
			</form>
		</b-modal>
	</div>
</template>

<script>
import {docCookies, eventBus, openLink} from '../client.js'
import { mapState } from 'vuex'

export default {
	name:'mymenu',
	components:{
	},
	computed:mapState({
		status: state=>state.status,
		me: state => state.me,
	}),
	data(){
		return {amount:100}
	},
	methods:{
		show() {
			this.$refs.menu.show();
		},
		hide() {
			this.$refs.menu.hide();
		},
		signout() {
			this.hide();
			docCookies.removeItem('token');
			eventBus.$emit('relogin');
		},
		recharge() {
			var amount=this.amount;
			openLink((socket)=>{
				socket.emit('recharge', amount, (err, pack)=>{
					if (err) return alert(err);
					if (pack.jumpto) location.href=pack.jumpto;
				});
			})
		}
	}
}
</script>
<style scoped>
	#pricelist>label {
		margin: 20px 6px 0;
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