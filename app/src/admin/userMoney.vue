<template>
<div>
	<b-form>
		<b-form-group class="mt-1" label="用户手机">
			<b-input-group class="ml-1 mr-1">
				<b-form-input v-model="phone" required></b-form-input>
				<b-input-group-append><b-button type="submit" variant="info" v-on:click="findUser">Find</b-button></b-input-group-append>
			</b-input-group>
		</b-form-group>
	</b-form>
	<b-form-group v-show="Object.keys(userdata).length">
		<b-container fluid>
			<b-row class="my-1">
				<b-col sm="6">
					<label for="phone">phone <code>{{ userdata.phone }}</code></label>
				</b-col>
				<b-col sm="6">
					<b-form-checkbox v-model="blocked" name="check-button" switch>
						禁用账号 <b>(Blocked: {{ blocked }})</b>
					</b-form-checkbox>
				</b-col>
			</b-row>
			<b-row class="my-1">
				<b-col sm="6">
					<label for="balance">balance <code>{{ userdata.balance||0 }}</code>:</label>
				</b-col>
				<b-col sm="6">
					<b-input-group>
						<b-form-input id="m_balance"></b-form-input>
						<b-input-group-append><b-button variant="info" v-on:click="modifyBalance">Add</b-button></b-input-group-append>
					</b-input-group>
				</b-col>
			</b-row>
			<b-row class="my-1" v-for="(id, idx) in paytm_ids" :key="idx">
				<b-col sm="6">
					<label :for="`paytm_id${idx}`">paytm_id <code>{{ id }}</code>:</label>
				</b-col>
				<b-col sm="6">
					<b-input-group>
						<b-form-input :id="`paytm_id${idx}`"></b-form-input>
						<b-input-group-append>
							<b-button-group>
								<b-button :data-idx="idx" variant="info" @click="chgPaytm">改</b-button>
								<b-button :data-idx="idx" variant="danger" @click="delPaytm">删</b-button>
							</b-button-group>
						</b-input-group-append>
					</b-input-group>
				</b-col>
			</b-row>
			<b-row class="my-1">
				<b-col sm="6">
					<label :for="`bi`">Bank Info <code></code>:</label>
				</b-col>
				<b-col sm="6">
					<b-card>
						<b-card-text>{{bankCode}}</b-card-text>
						<b-card-text>{{accountName}}</b-card-text>
						<b-card-text>{{accountNo}}</b-card-text>
						<b-card-text>{{bankphone}}</b-card-text>
						<b-button class="float-right" variant="danger">删</b-button>
					</b-card>
				</b-col>
			</b-row>
			<b-row>
				<b-col sm="6">
					<label for="promotions">拜师送4500</label>
				</b-col>
				<b-col>
					<b-button variant="primary" @click="handle_promotion_baishi" :disabled="!enable_baishi4500">完成</b-button>
				</b-col>
			</b-row>
			<b-row>
				<!-- <b-form label="提款记录">
					<b-table striped hover :items="withdrawRecords"></b-table>
				</b-form> -->
			</b-row>
		</b-container>
	</b-form-group>
</div>
</template>

<script>
import {openLink} from '../client.js'
import auth from "./auth"
import {get} from 'object-path'
import TDGA from '../stat'

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
				openLink((socket)=>{
					socket.emit('disableuser', self.phone, date, stdret((err) =>{
						if (err) return alert(err);
						self.$set(self.userdata, 'block', date);
					}))
				})
			}
		},
		paytm_ids() {
			if (Array.isArray(this.userdata.paytm_id)) return this.userdata.paytm_id;
			return [this.userdata.paytm_id];
		},
		bankCode() {
			return get(this.userdata, 'bankInfo.bankCode');
		},
		accountName() {
			return get(this.userdata, 'bankInfo.accountName');
		},
		accountNo() {
			return get(this.userdata, 'bankInfo.accountNo');
		},
		bankphone() {
			return get(this.userdata, 'bankInfo.phone');
		},
	},
	data() {
		return {
			phone:null,
			userdata:{bankInfo:{}},
			enable_baishi4500:false,
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
			openLink((socket)=>{
				socket.emit('queryuser', phone, stdret((err, ud)=>{
					if (err) return alert(err);
					self.manipulatedata(ud);
					socket.emit('list', {target:'promotions', query:{phone}}, (err, promotions)=>{
						if (err) return;
						if (promotions.includes('baishi4500')) self.enable_baishi4500=true;
					})
				}))
			})
		},
		modifyBalance() {
			var delta=Number(document.getElementById('m_balance').value);
			if (Number.isNaN(delta)) return;
			var phone=this.phone, self=this;
			openLink((socket)=>{
				socket.emit('modifybalance', phone, delta, stdret((err, chg)=>{
					if (err) return alert(err);
					self.manipulatedata(chg);
					// for talkingdata
					TDGA.Account({
						accountId : phone,
					});
					TDGA.onReward(delta, '管理员操作');
				}))
			})
		},
		chgPaytm(e) {
			var idx=e.target.dataset.idx;
			var new_id=document.getElementById(`paytm_id${idx}`).value;
			if (!Array.isArray(this.userdata.paytm_id)) idx=null
			var self=this;

			openLink((socket)=>{
				socket.emit('changepaytm', self.phone, idx, new_id, stdret((err, chg)=>{
					if (err) return alert(err);
					self.manipulatedata(chg);
				}))
			})
		},
		delPaytm(e) {
			var idx=e.target.dataset.idx;
			var id=document.getElementById(`paytm_id${idx}`).value;
			var self=this;

			openLink((socket)=>{
				socket.emit('delpaytm', self.phone, id, stdret((err)=>{
					if (err) return alert(err);
					self.$set(self.userdata, 'paytm_id', null);
				}))
			})
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
	}
}
</script>