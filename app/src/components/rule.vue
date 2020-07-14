<template>
    <b-modal ref="modal1" id='modal-rule' size="xl" title="About Millionare" ok-only ok-title="CLOSE">
			<p>3 minutes 1 issue, 2 minutes and 30 seconds to order, 30 seconds to show the lottery result. It opens all day. The total number of trade is 480 issues.</p>
			<p>If you spend 100 rupees to trade, after deducting 10 rupees service fee, your contract amount is 90 rupees:</p>
			<p >1. JOIN GREEN: if the result shows 1,3,7,9, you will get (90*2) 180 rupees;</p>
			<p>If the result shows 5, you will get (90*1.5) 145 rupees.</p>
			<p>2. JOIN RED: if the result shows 2,4,6,8, you will get (90*2) 180 rupees; If the result shows 0, you will get (90*1.5) 145 rupees.</p>
			<p>3. JOIN VIOLET: if the result shows 0 or 5, you will get (90*4.5) 405 rupees.</p>
			<p>4. SELECT NUMBER: if the result is the same as the number you selected, you will get (90*9) 810 rupees.</p>
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