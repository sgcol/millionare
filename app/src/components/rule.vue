<template>
    <b-modal ref="modal1" id='modal-rule' size="xl" :title="$t('About Millionare')" ok-only :ok-title="$t('CLOSE')">
		<!-- <p>{{$t('3 minutes 1 issue, 2 minutes and 30 seconds to order, 30 seconds to show the lottery result. It opens all day. The total number of trade is 480 issues.')}}</p> -->
<!--		<p>{{$t('If you spend 10000 rupiah to trade, after deducting 200 rupiah service fee, your contract amount is 9800 rupiah:')}}</p>-->
		<i18n v-for="r in ['rule0', 'rule1', 'rule2', 'rule3', 'rule4', 'rule5', 'rule6']" :key="r" :path="r" tag="p" :places="{amount, fee, bet, onehalf_bet, double_bet, fourhalf_bet, nineth_bet}" />
		<!-- <i18n path="rule1" tag="p" :places="{amount:10000, fee:200, bet:9800, onehalf_bet:14700, double_bet:2*9800, fourhalf_bet:4.5*9800, nineth_bet:9*9800}" />
		<i18n path="rule2" tag="p" :places="{amount:10000, fee:200, bet:9800, onehalf_bet:14700, double_bet:2*9800, fourhalf_bet:4.5*9800, nineth_bet:9*9800}" />
		<i18n path="rule3" tag="p" :places="{amount:10000, fee:200, bet:9800, onehalf_bet:14700, double_bet:2*9800, fourhalf_bet:4.5*9800, nineth_bet:9*9800}" />
		<p>{{$t('1. JOIN GREEN: if the result shows 1,3,7,9, you will get (9800*2) 19600 rupiah;')}}</p>
		<p>{{$t('If the result shows 5, you will get (9800*1.5) 14700 rupiah.')}}</p>
		<p>{{$t('2. JOIN RED: if the result shows 2,4,6,8, you will get (9800*2) 19600 rupiah; If the result shows 0, you will get (9800*1.5) 14700 rupiah.')}}</p>
		<p>{{$t('3. JOIN VIOLET: if the result shows 0 or 5, you will get (9800*4.5) 44100 rupiah.')}}</p>
		<p>{{$t('4. SELECT NUMBER: if the result is the same as the number you selected, you will get (9800*9) 88200 rupiah.')}}</p> -->
    </b-modal>
</template>

<script>
import {openLink} from '../client'

var sock=openLink();

export default {
	name:'rule',
	methods:{
		show() {
			this.$children[0].show();
		},
		hide() {
			this.$children[0].hide();
		}
	},
	data() {
		return {
			amount:10000,
			fee:null,
			bet:null,
			onehalf_bet:null,
			double_bet:null,
			fourhalf_bet:null,
			nineth_bet:null,
		}
	},
	mounted() {
		var example=this;
		sock.emit('getfeerate', (err, fr)=>{
			if (err) return;
			example.fee=Math.floor(example.amount*fr*100)/100;
			example.bet=example.amount-example.fee;
			example.onehalf_bet=1.5*example.bet;
			example.double_bet=2*example.bet;
			example.fourhalf_bet=4.5*example.bet;
			example.nineth_bet=9*example.bet;
		})
	}
}
</script>

<style scoped>
p {
    margin: 20px;
}
</style>