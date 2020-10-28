<template>
	<b-modal ref="broad" hide-footer no-close-on-backdrop>
		<b-carousel
		:interval="promotions.length?5000:0"
		:controls="promotions.length>1"
		:indicators="promotions.length>1"
		background="#ababab"
		img-width=240
		>
			<b-carousel-slide v-if="promotions.includes('free4500')">
				<template #img>
				<a href="#" @click="handler_free4500"><img src="../assets/free4500.png" style="width:100%"></a>
				</template>
			</b-carousel-slide>
			<!-- <b-carousel-slide v-if="promotions.includes('baishi4500')">
				<template #img>
				<a href="https://wa.me/6283109828548"><img src="../assets/baishi4500.png" style="width:100%"></a>
				</template>
			</b-carousel-slide> -->
		</b-carousel>
	</b-modal>
</template>

<script>
import {openLink, eventBus} from '../client';
import TDGA from '../stat'

const avaible=['free4500', 'baishi4500'];

var sock=openLink();

export default {
	name: "Promotions",
	data() {
		return {
			promotions:[]
		}
	},
	methods:{
		handler_free4500(e) {
			e.preventDefault();
			var self=this;
			sock.emit('upd', {target:'promotions', name:'free4500'}, (err)=>{
				if (err) alert(self.$i18n.t(err));
				self.$refs.broad.hide();
				TDGA.onReward(4500, 'free4500');
				TDGA.onEvent('free4500', JSON.stringify({reward:4500}));
			});
		}
	},
	mounted() {
		var self=this;
		eventBus.$on('logined', ()=>{
			sock.emit('list', {target:'promotions'}, (err, p)=>{
				if (err) return alert(this.$i18n.t(err));
				if (p) {
					self.promotions=p.filter(value => avaible.includes(value));
					if (self.promotions.length) self.$refs.broad.show();
				}
			})
		})
	}
}
</script>