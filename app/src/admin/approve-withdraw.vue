<template>
	<div>
		<b-alert :show="err?true:false" variant="danger" dismissible @dismissed="dismissCountDown=0" @dismiss-count-down="countDownChanged">{{err}}</b-alert>
		<b-table striped hover :items="items" :fields="fields">
			<template v-slot:cell(Action)="row">
				<b-button size="sm" @click="approve(row.item)" class="mr-1">
					批准
				</b-button>
			</template>
		</b-table>
		</div>
</template>

<script>
import {openLink} from '../client';

export default {
	name:'approveWithdraw',
	computed:{
		fields() {
			if (!this.items || !this.items[0]) return [];
			return Object.keys(this.items[0]).concat(['Action']);
		}
	},
	data() {
		return {
			err:null,
			dismissSecs: 3,
      dismissCountDown: 0,
			items:[
				// {order:'5e34ffd6', money:60000, today:{taken:90000, times:9}, bank:'HSBC', account:'78899'}
			]
		}
	},
	methods:{
		countDownChanged(dismissCountDown) {
			this.dismissCountDown = dismissCountDown
		},
		showAlert(err) {
			this.err=err;
			this.dismissCountDown = this.dismissSecs
		},
		queryData() {
			var sock=openLink(), self=this;
			sock.emit('withdrawlist', (err, list)=>{
				if (err) return self.showAlert(err);
				self.items=list;
			})
		},
		approve(item) {
			var sock=openLink(), self=this;
			sock.emit('admin_approve_withdraw', item._id, (err)=>{
				if (err) return self.showAlert(err);
				self.queryData();
			})
		},
	},
	mounted() {
		this.queryData();
	}
}
</script>