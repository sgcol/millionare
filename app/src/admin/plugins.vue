<template>
	<b-form>
		<b-form-group label="活动开关">
			<b-form-checkbox-group
				v-model="selected"
				:options="plugins"
				switches
				stacked
				size="lg"
			></b-form-checkbox-group>
		</b-form-group>
	</b-form>    
</template>

<script>
import {openLink} from './auth'

const sock=openLink();

export default {
	name:'plugins',
	data() {
		return {
			selected:[],
			plugins:[],
		}
	},
	methods:{

	},
	mounted() {
		var self=this;
		sock.emit('$list', {target:'plugins'}, (err, list)=>{
			if (err) return alert(err);
			self.plugins=list;
		})
	},
	watch:{
		selected() {
			sock.emit('$upd', {target:'plugins', content:this.selected});
		}
	}
}
</script>