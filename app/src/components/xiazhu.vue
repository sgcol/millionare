<template>
<div>
<b-modal ref="modal1" id='modal-betting' size="xl" :hide-header="true" :hide-footer="true">
	<section class="el-drawer__body">
		<div class="drawer-top">
			<div class="drawer-bg" v-bind:class="color">{{$t(title)}}</div>
		</div>
		<div class="drawer-main">
			<p>{{$t('Contract Money')}}</p>
			<b-form-radio-group
				id="btn-bet"
				v-model.number="betting"
				buttons
				button-variant="outline-secondary"
				size="lg"
				name="radio-btn-betting"
			>
                <b-form-radio v-for="money in xiazhulist" :key="money" :value="money" style="min-width:80px">{{formatedMoney(money)}}</b-form-radio>
            </b-form-radio-group>
				<!-- <label role="radio" aria-checked="true" tabindex="0" class="el-radio-button is-active">
					<input type="radio" tabindex="-1" class="el-radio-button__orig-radio" value="10">
					<span class="el-radio-button__inner">10</span>
				</label>
				<label role="radio" tabindex="-1" class="el-radio-button">
					<input type="radio" tabindex="-1" class="el-radio-button__orig-radio" value="100">
					<span class="el-radio-button__inner">100</span>
				</label>
				<label role="radio" tabindex="-1" class="el-radio-button">
					<input type="radio" tabindex="-1" class="el-radio-button__orig-radio" value="1000">
					<span class="el-radio-button__inner">1000</span>
				</label>
				<label role="radio" tabindex="-1" class="el-radio-button">
					<input type="radio" tabindex="-1" class="el-radio-button__orig-radio" value="10000">
					<span class="el-radio-button__inner">10000</span>
				</label> -->
			<p >{{$t('Multiples')}}</p>
			<b-form-radio-group
				id="btn-multiple"
				v-model.number="multiple"
				:options="[3, 5, 10]"
				buttons
				button-variant="outline-secondary"
				size="lg"
				name="radio-btn-multiple"
			></b-form-radio-group>
			<br >
			<b-input-group style="margin-top:20px" size="lg">
				<b-input-group-prepend @click="incMultiple($event, -1)">
					<b-button variant="outline-info">-</b-button>
				</b-input-group-prepend>
				<b-form-input v-model.number="multiple" number min=1 max=999></b-form-input>
				<b-input-group-append>
					<b-button variant="outline-info" @click="incMultiple($event, 1)">+</b-button>
				</b-input-group-append>
			</b-input-group>		
		</div>
		<p  class="drawer-tip">{{$t('Maximum lower singular 999 hands')}}</p>
		<div  class="drawer-btm">
			<div v-on:click="hide">{{$t('Cancel')}}</div>
			<div class="drawer-bg" v-bind:class="color" v-on:click="makeBet">{{$t('Confirm')}}</div>
		</div>
	</section>
</b-modal>
<mymenu ref="mymenu"></mymenu>
</div>
</template>

<script>
import conf from '../conf';
import mymenu from './mymenu.vue'
import { mapState } from 'vuex'
import TDGA from '../stat'

export default {
	name:'xiazhu',
	data(){
		return {
			bet:null,
			betting:null,
			multiple:1
		}
    },
    components:{
		mymenu
    },
	computed:{
		title() {
			if (isNaN(Number(this.bet))) return this.$i18n.t('Join')+' '+this.$i18n.t(this.bet);
			else return this.$i18n.t('Select')+' '+this.$i18n.t(this.bet); 
		},
		color() {
			if (isNaN(Number(this.bet))) return this.bet;
			else return 'Blue';
        },
        xiazhulist() {
            return conf.locale=='in_ID'?[2000, 20000, 200000, 2000000]:[10, 100, 1000, 10000]
        },
		...mapState({
			me: state => state.me,
		}),
	},
	methods:{
        formatedMoney(money) {
			if (conf.locale==='in_ID') {
				if (money>1000) return Math.floor(money/1000)+'k';
			}
			return money;
		},
		show() {
			this.$children[0].show();
		},
		hide() {
			this.$children[0].hide();
        },
        incMultiple(e, delta) {
            var n=Number(this.multiple);
            if (isNaN(n)) {
                if (delta<0) n=1;
                else n=999;
            } else {
                n+=delta;
                if (n<1) n=1;
                if (n>999) n=999;
            }
            this.multiple=n;
        },
		makeBet() {
            var self=this;
            if (this.multiple<1) return alert(this.$i18n.t('At least 1 hand'));
            if (this.multiple>999) return alert(this.$i18n.t('Maximum is 999 hands'));
            if (!this.betting || this.xiazhulist.indexOf(this.betting)<0) this.betting=this.xiazhulist[0];
            var money=this.betting*(this.multiple||1);
            if (money>this.me.balance) {
                alert(this.$i18n.t('Insufficent funds, please recharge first'));
                this.$refs.mymenu.showtopup();
                return;
            }
			window.socket.emit('betting', {select:this.bet, money:this.betting*(this.multiple||1)}, function(err, contract) {
				if (err) {
					alert(self.$i18n.t(err));
					self.hide();
					return;
				}
				window.v.$store.commit('addContract', contract);
                self.hide();
                TDGA.onItemPurchase({
                    item :'投入'+contract.select,
                    itemNumber : contract.betting,
                    priceInVirtualCurrency : 1
                });
			});
		}
	},
}
</script>

<style scoped>
.el-drawer__wrapper {
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    overflow: hidden;
    margin: 0;
}
.el-drawer__container {
    position: relative;
}
.el-drawer.btt, .el-drawer.ttb, .el-drawer__container {
    left: 0;
    right: 0;
    width: 100%;
}
.el-drawer.ltr, .el-drawer.rtl, .el-drawer__container {
    top: 0;
    bottom: 0;
    height: 100%;
}
.el-drawer__open .el-drawer.btt {
    -webkit-animation: btt-drawer-in .3s 1ms;
    animation: btt-drawer-in .3s 1ms;
}
.el-drawer.btt {
    -webkit-animation: btt-drawer-out .3s;
    animation: btt-drawer-out .3s;
    bottom: 0;
}
.el-drawer.btt, .el-drawer.ttb, .el-drawer__container {
    left: 0;
    right: 0;
    width: 100%;
}
.el-drawer {
    position: absolute;
    -webkit-box-sizing: border-box;
    box-sizing: border-box;
    background-color: #fff;
    display: -webkit-box;
    display: -ms-flexbox;
    display: flex;
    -webkit-box-orient: vertical;
    -webkit-box-direction: normal;
    -ms-flex-direction: column;
    flex-direction: column;
    -webkit-box-shadow: 0 8px 10px -5px rgba(0,0,0,.2), 0 16px 24px 2px rgba(0,0,0,.14), 0 6px 30px 5px rgba(0,0,0,.12);
    box-shadow: 0 8px 10px -5px rgba(0,0,0,.2), 0 16px 24px 2px rgba(0,0,0,.14), 0 6px 30px 5px rgba(0,0,0,.12);
    overflow: hidden;
}
.el-drawer__body {
    -webkit-box-flex: 1;
    -ms-flex: 1;
    flex: 1;
}
.drawer-top {
    height: 48px;
    line-height: 48px;
}
.el-drawer__body>* {
    -webkit-box-sizing: border-box;
    box-sizing: border-box;
}
.drawer-bg.Green {
    background: #1eb93d;
}
.drawer-top>div {
    width: 150px;
    text-align: center;
    color: #fff;
    font-size: 22px;
}
.drawer-bg {
    background: #007acc;
}
.drawer-main {
    padding: 20px;
}
.drawer-main>p {
    font-size: 20px;
}
/* .draw-main.btn {
	background-color: transparent;
  border: 1px solid transparent;
  padding: 0.375rem 0.75rem;
	font-size: 20px;
  line-height: 1;
	border-radius: 0.25rem;
	color: inherit;
} */
.el-input-number, .el-radio-group {
    margin: 10px 0;
}
.el-radio-group {
    display: inline-block;
    line-height: 1;
    vertical-align: middle;
    font-size: 0;
}
.el-radio-button, .el-radio-button__inner {
    display: inline-block;
    position: relative;
    outline: 0;
}
.el-radio-button__orig-radio {
    opacity: 0;
    outline: 0;
    position: absolute;
		z-index: -1;
}
.drawer-main .el-radio-button__orig-radio:checked+.el-radio-button__inner {
    background-color: grey;
    border-color: grey;
    -webkit-box-shadow: none;
    box-shadow: none;
}
.drawer-main .el-radio-button__orig-radio:checked+.el-radio-button__inner {
    background-color: grey;
    border-color: grey;
    -webkit-box-shadow: none;
    box-shadow: none;
}
.drawer-main .el-radio-button__inner {
    font-size: 20px;
}
.el-radio-button__orig-radio:checked+.el-radio-button__inner {
    color: #fff;
    background-color: #409eff;
    border-color: #409eff;
    -webkit-box-shadow: -1px 0 0 0 #409eff;
    box-shadow: -1px 0 0 0 #409eff;
}
.el-radio-button:first-child .el-radio-button__inner {
    border-left: 1px solid #dcdfe6;
    border-radius: 4px 0 0 4px;
    -webkit-box-shadow: none!important;
    box-shadow: none!important;
}
.el-radio-button__inner {
    line-height: 1;
    white-space: nowrap;
    vertical-align: middle;
    background: #fff;
    border: 1px solid #dcdfe6;
    font-weight: 500;
    border-left: 0;
    color: #606266;
    -webkit-appearance: none;
    text-align: center;
    -webkit-box-sizing: border-box;
    box-sizing: border-box;
    margin: 0;
    cursor: pointer;
    -webkit-transition: all .3s cubic-bezier(.645,.045,.355,1);
    transition: all .3s cubic-bezier(.645,.045,.355,1);
    padding: 12px 20px;
    font-size: 14px;
    border-radius: 0;
}
.el-radio-button, .el-radio-button__inner {
    display: inline-block;
    position: relative;
    outline: 0;
}
.el-input-number {
    position: relative;
    display: inline-block;
    width: 180px;
    line-height: 38px;
}
.el-input-number__decrease.is-disabled, .el-input-number__increase.is-disabled {
    color: #c0c4cc;
    cursor: not-allowed;
}
.el-input-number__decrease {
    left: 1px;
    border-radius: 4px 0 0 4px;
    border-right: 1px solid #dcdfe6;
}
.el-input-number__decrease, .el-input-number__increase {
    position: absolute;
    z-index: 1;
    top: 1px;
    width: 40px;
    height: auto;
    text-align: center;
    background: #f5f7fa;
    color: #606266;
    cursor: pointer;
    font-size: 13px;
}
[class*=" el-icon-"], [class^=el-icon-] {
    font-family: element-icons!important;
    speak: none;
    font-style: normal;
    font-weight: 400;
    font-variant: normal;
    text-transform: none;
    line-height: 1;
    vertical-align: baseline;
    display: inline-block;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
}
.el-input-number .el-input {
    display: block;
}
.el-input {
    position: relative;
    font-size: 14px;
    display: inline-block;
    width: 100%;
}
.el-input-number .el-input__inner {
    -webkit-appearance: none;
    padding-left: 50px;
    padding-right: 50px;
    text-align: center;
}
.el-input__inner {
    background-color: #fff;
    background-image: none;
    border-radius: 4px;
    border: 1px solid #dcdfe6;
    -webkit-box-sizing: border-box;
    box-sizing: border-box;
    color: #606266;
    display: inline-block;
    font-size: inherit;
    height: 40px;
    line-height: 40px;
    padding: 0 15px;
    -webkit-transition: border-color .2s cubic-bezier(.645,.045,.355,1);
    transition: border-color .2s cubic-bezier(.645,.045,.355,1);
    width: 100%;
}
.el-button, .el-input__inner {
    -webkit-appearance: none;
    outline: 0;
}
.el-input__inner {
    -webkit-appearance: none;
    outline: 0;
}
.drawer-tip {
    margin: -10px 20px 20px 20px;
    text-align: right;
    color: grey;
}
.el-drawer__body>* {
    -webkit-box-sizing: border-box;
    box-sizing: border-box;
}
.el-drawer__body>* {
    -webkit-box-sizing: border-box;
    box-sizing: border-box;
}
.drawer-btm>div:first-child {
    width: 150px;
    background: #f2f2f2;
}
.drawer-btm>div {
    display: inline-block;
    height: 48px;
    line-height: 48px;
    text-align: center;
    font-size: 20px;
}
.drawer-btm>div:nth-child(2) {
    width: calc(100% - 150px);
    color: #fff;
}
.drawer-bg.Green {
    background: #1eb93d;
}
.drawer-btm>div {
    display: inline-block;
    height: 48px;
    line-height: 48px;
    text-align: center;
    font-size: 20px;
}
.drawer-bg {
    background: #007acc;
}
</style>