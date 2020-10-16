<template>
    <b-modal ref="modal1" id='modal-rule' size="xl" :title="$t('About Millionare')" ok-only :ok-title="$t('CLOSE')">
		<p>{{$t('3 minutes 1 issue, 2 minutes and 30 seconds to order, 30 seconds to show the lottery result. It opens all day. The total number of trade is 480 issues.')}}</p>
		<p>{{$t('If you spend 10000 rupiah to trade, after deducting 200 rupiah service fee, your contract amount is 9800 rupiah:')}}</p>
		<p>{{$t('1. JOIN GREEN: if the result shows 1,3,7,9, you will get (9800*2) 19600 rupiah;')}}</p>
		<p>{{$t('If the result shows 5, you will get (9800*1.5) 14700 rupiah.')}}</p>
		<p>{{$t('2. JOIN RED: if the result shows 2,4,6,8, you will get (9800*2) 19600 rupiah; If the result shows 0, you will get (9800*1.5) 14700 rupiah.')}}</p>
		<p>{{$t('3. JOIN VIOLET: if the result shows 0 or 5, you will get (9800*4.5) 44100 rupiah.')}}</p>
		<p>{{$t('4. SELECT NUMBER: if the result is the same as the number you selected, you will get (9800*9) 88200 rupiah.')}}</p>
    </b-modal>
</template>

<script>
export default {
	name:'rule',
	methods:{
		show() {
			this.$children[0].show();
		},
		hide() {
			this.$children[0].hide();
		}
	}
}
</script>

<style scoped>
p {
    margin: 20px;
}
</style>