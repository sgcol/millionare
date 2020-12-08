<template>
	<div class="text-center">
		<img src="../assets/box-opened.png" style="width:60%"/>
		<p class="info">Saya memberi Anda Rp4000, buka dan buka tautan untuk menerimanya! Bersenang-senang dan hasilkan uang!</p>
		<b-button variant="primary" size="lg" href="https://static.luckyshopee.com/apk/millionare-vdm.apk">Download</b-button>
	</div>
</template>

<script>
// import Vue from 'vue'
import conf from '../conf'

export default {
	name: 'Step2',
	components: {
	},
	data(){
		return { 
			conf:conf,
			longop:null,
		}
	},
	methods:{
	},
}

</script>

<style scoped>
	.btn-back-white {
		background-color: #fff;
	}
</style>
