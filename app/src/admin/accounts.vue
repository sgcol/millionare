<template>
<div>
	<b-alert dismissible :show="errStatus" @dismissed="errDismissed" variant="warning">{{err}}</b-alert>
	<b-tabs>
		<b-tab title="管理员账号">
			<b-button-toolbar>
				<b-button-group size="sm" class="float-right">
					<b-button v-b-modal.modal-create><b-icon-person-plus /> Create Account</b-button>
				</b-button-group>
			</b-button-toolbar>
			<b-table
				show-empty
				small
				stacked="md"
				:items="items"
				:fields="fields"
			>
				<template v-slot:cell(actions)="row">
					<b-button v-if="row.item.phone!='admin'" size="sm" @click="delaccount(row.item)">delete</b-button>
					<b-button size="sm" v-b-modal.modal-chgpwd @click="account.phone=row.item.phone">reset password</b-button>
				</template>
			</b-table>
		</b-tab>
	</b-tabs>
	<b-modal id="modal-create" title="新建管理员" ok-only ok-title="Create" @ok="addaccount" @show="clearData">
		<b-form>
			<b-form-group label="账号">
				<b-input v-model="account.phone" />
			</b-form-group>
			<b-form-group label="密码">
				<b-input v-model="account.pwd" />
			</b-form-group>
			<b-form-group label="身份">
				<b-form-select v-model="account.acl" :options="[{value:null, text:'选择身份'},'admin', 'manager', 'superuser']"></b-form-select>
			</b-form-group>
		</b-form>
	</b-modal>
	<b-modal id="modal-chgpwd" title="重设密码" ok-only ok-title="Reset" @ok="chgpwd" @show="clearChgPwd">
		<b-form>
			<b-form-group :label="`${account.phone}设置新密码`">
				<b-input v-model="account.pwd" />
			</b-form-group>
		</b-form>
	</b-modal>
</div>
</template>

<script>
import {openLink} from '../client'
import { BIconPersonPlus } from 'bootstrap-vue'
import {router} from './router'
import {dateTimeString} from '../etc'

export default {
	name:'Accounts',
	components:{
		'BIconPersonPlus':BIconPersonPlus
	},
	data() {
		return {
			errStatus:null,
			err:null,
			account:{
				phone:null,
				pwd:null,
				acl:null,
			},
			items:[],
			fields:[
				{key:'phone', label:'账号'},
				{key:'acl', label:'身份', 
				formatter:(v, idx, item)=>
					v||(item.isAdmin?'Admin':'')
				},
				{key:'regTime', label:'注册时间', formatter: dateTimeString},
				{key:'actions', label:'操作'},
			]
		}
	},
	methods:{
		showerr(e) {
			if (e=='access denied') {
				this.errStatus=3;
			} else {
				this.errStatus=true;
			}
			this.err=e;
		},
		clearData() {
			this.account.phone=null;
			this.account.pwd=null;
			this.account.acl=null;
		},
		clearChgPwd() {
			this.account.pwd=null;
		},
		chgpwd() {
			if (!this.account.pwd) return;
			this.updaccount(this.account.phone, {pwd:this.account.pwd});
		},
		errDismissed() {
			if (this.err=='access denied') router.push('/login');
			this.err=null;
			this.errStatus=null;
		},
		refreshData() {
			var sock=openLink(), self=this;
			sock.emit('$list', {target:'users', query:{isAdmin:true}}, (err, list)=>{
				if (err) return self.showerr(err);
				self.items=list;
			})
		},
		delaccount(acc) {
			var sock=openLink(), self=this;
			sock.emit('$del', {target:'users', query:{phone:acc.phone}}, (err)=>{
				if (err) return self.showerr(err);
				self.refreshData()
			})
		},
		addaccount(evt) {
			if (!this.account.phone || !this.account.pwd ||!this.account.acl) return evt.preventDefault();
			var sock=openLink(), self=this;
			sock.emit('$create', {target:'users', content:{...this.account, isAdmin:true}}, (e)=>{
				if (e) return self.showerr(e);
				self.refreshData();
			})
		},
		updaccount(phone, acc) {
			var sock=openLink();
			sock.emit('$upd', {target:'users', query:{phone:phone}, content:acc}, (e)=>{
				if (e) return self.showerr(e);
				alert('success');
			})
		}
	},
	mounted() {
		this.refreshData();
	}
}
</script>