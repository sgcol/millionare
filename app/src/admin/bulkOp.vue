<template>
	<div>
		<b-form>
			<b-form-group
				label="拜师活动批量处理"
				label-for="textarea-formatter"
				description="参与活动的用户id，每行一个用户"
				class="mb-0"
			>
			<b-form-textarea
				id="textarea-formatter"
				v-model="baishi_userid"
				placeholder="复制id到这里"
			></b-form-textarea>
			</b-form-group>
			<b-button variant="primary" size="lg" @click="baishi">运行拜师</b-button>
		</b-form>
	</div>
</template>

<script>
import {openLink} from './auth'
import TDGA from '../stat'

const sock=openLink();

export default {
	name:'bulk-op',
	data() {
		return {
			baishi_userid:'',
			baisgi_err:[],
		}
	},
	methods:{
		async baishi() {
			var baishi_userlist=this.baishi_userid.split(/\r\n|\r|\n/)//, self=this;

			for (var i=0; i<baishi_userlist.length; i+=10) {
				await Promise.all(baishi_userlist.slice(i, i+10).map((uid)=>uid?new Promise((resolve)=>{
							sock.emit('upd', {target:'promotions', query:{phone:uid}, name:'baishi4500'}, (err)=>{
								if (err) console.error(uid, err);
								else {
									TDGA.Account({
										accountId : uid,
									});
									TDGA.onReward(4000, '拜师送4500');
									TDGA.onEvent('baishi4500', JSON.stringify({user:uid, reward:4000}));
								}
								resolve();
							})
						}):null
					));
			}
			this.$bvModal.msgBoxOk('Done');
		}
	}
}
</script>