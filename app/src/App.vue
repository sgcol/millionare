<template>
	<div id="app">
		<div class="home">
			<div class="home-top">
				<div class="btn btn-primary reverse home-recharge" v-on:click="showTopUp">{{ $t("Top Up") }}</div>
				<div class="btn btn-outline-secondary reverse home-rule" v-on:click="openRule">{{ $t('Rules') }}</div>
				<div class="myicon">
					<!-- <img src="./assets/icon.png"> -->
					<b-avatar size="40px" :src="headicon()" class="mb-2"></b-avatar>
					<b-button variant="outline-primary" v-on:click="showMyMenu">{{$t('Me')}}</b-button>
				</div>
				<div class="info">
					<p >{{$t('Available Balance')}}</p>
					<p>{{conf.locale=='in_ID'?'Rp':'₹'}}
						<span>{{ me?Number(me.balance).toFixed(2):'-' }}</span>
					</p>
					<!-- <p >{{$n(me?Number(me.balance).toFixed(2): '100', 'currency')}}</p> -->
					<!-- <p >{{$t('ID')}} {{ me?me._id:'-'}}</p> -->
					<p >{{username()}}</p>
				</div>
			</div>
			<b-alert :show="me && !!me.whatsup">
				{{me.whatsup}}
			</b-alert>
			<b-alert :show="!!notify" dismissible variant="danger">
				{{notify}}
			</b-alert>
			<div class="game">
				<ul class="game-info">
					<li ><p >{{ $t('Period') }}<i class="el-icon-s-flag"></i></p><p >{{ period}}</p></li>
					<li ><p >{{ $t('Count Down') }}</p><p >{{ countdown }}</p></li>
				</ul>
				<ul class="game-block" v-bind:class="status=='running'?'':'ban'">
					<li v-for="clr in ['Green', 'Violet', 'Red']" :key="clr" class="game-color" v-on:click="bet" v-bind:data-bet="clr">{{$t('Join') }} {{$t(clr)}}</li>
					<li v-for="item in [0, 1, 2, 3, 4, 5, 6, 7,8, 9]" :key="item" class="game-number" v-on:click="bet" v-bind:data-bet="item">
						{{item}}
					</li>
				</ul>
				<div tabindex="-1" class="el-drawer__wrapper" style="display: none;">
					<div role="document" tabindex="-1" class="el-drawer__container">
						<div aria-modal="true" aria-labelledby="el-drawer__title" aria-label="" role="dialog" tabindex="-1" class="el-drawer btt">
						</div>
					</div>
				</div>
			</div>
			<div class="parity-list" v-bind:class="fullscreen?'full':''">
				<div class="pl-top" v-on:click="fullscreen=!fullscreen">
					<span ><b-icon-box-arrow-in-left v-show="fullscreen"></b-icon-box-arrow-in-left>{{$t('Parity Record')}}</span><span  v-show="!fullscreen">{{$t('more')}}<b-icon-chevron-right></b-icon-chevron-right></span>
				</div>
				<ul class="pl-list">
					<li ><span >{{$t('Period')}}</span><span >{{$t('Price')}}</span><span >{{$t('Number')}}</span><span >{{$t('Result')}}</span></li>
					<li v-for="item in recent()" v-bind:key="item.period"><span >{{ item.period||item.no }}</span><span >{{item.price}}</span><span v-bind:class="colors[getResult(item.price)]">{{getResult(item.price)}}</span><span v-html="drawDots(item.price)"></span></li>
				</ul>
			</div>
			<div class="my-list" v-bind:class="fullorders?'full':''">
				<div class="ml-top" v-on:click="fullorders=!fullorders">
					<span ><b-icon-box-arrow-in-left v-show="fullorders"></b-icon-box-arrow-in-left>{{$t('My Parity Order')}}</span><span v-show="!fullorders">{{$t('more')}}<b-icon-chevron-right></b-icon-chevron-right></span>
				</div>
				<ul v-if="recentOrders().length>0">
					<li class="ml-item" v-for="order in recentOrders()" :key="order._id">
						<p>{{$t('₹')}}<b>{{order.betting}}</b></p>
						<p>{{$t('CONTRACTMONEY')}}</p>
						<p>{{$t('Create Time')}} {{dateTimeString(order.time)}}</p>
						<div class="ml-content">
							<p><span>{{$t('Period')}}</span><span>{{order.game.period}}</span></p>
							<p><span>{{$t('Select')}}</span><span><span v-bind:class="String(order.select).toLowerCase()">{{$t(order.select)}}</span></span></p>
							<p><span>{{$t('Status')}}</span><span><span v-bind:class="statusColors[order.status]">{{order.status}}</span></span></p>
							<p><span>{{$t('Pre Pay')}}</span><span>{{order.money}}</span></p>
							<p><span>{{$t('Open Time')}}</span><span>{{timeString(order.game.endtime)}}</span></p>
							<p><span>{{$t('Fee')}}</span><span>{{order.fee}}</span></p>
							<p><span>{{$t('Result')}}</span>
								<template v-if="order.game.price!=null">
									<span style="color: rgb(0, 122, 204);">{{getResult(order.game.price)}}</span>
									<span v-html="drawDots(getResult(order.game.price))"></span>
								</template>
							</p>
							<p><span>{{$t('Amount')}}</span><span>{{order.amount?order.amount.toFixed(2):''}}</span></p>
						</div>
					</li>
				</ul>
				<p v-else>{{$t('no records')}}</p>
			</div>
		</div>
		<mymenu ref="mymenu"></mymenu>
		<xiazhu ref="xz"></xiazhu>
		<rule ref='ru'></rule>
		<signup ref="signup"></signup>
		<!-- <b-modal ref="modal1" title="test" size="xl"></b-modal> -->
	</div>
</template>

<script>
// import HelloWorld from './components/HelloWorld.vue'
// import Vue from 'vue'
import signup from './components/signup.vue'
import xiazhu from './components/xiazhu.vue'
import mymenu from './components/mymenu.vue'

import { mapState } from 'vuex'
import {eventBus, openLink, docCookies} from './client.js'
import conf from './conf'

Number.prototype.pad = function(size) {
	var s = String(this);
	while (s.length < (size || 2)) {s = "0" + s;}
	return s;
}

export default {
	name: 'App',
	components: {
		// HelloWorld
		xiazhu,
		rule:()=>import('./components/rule.vue'),
		signup,
		mymenu
	},
	computed: mapState({
		status: state=>state.status,
		me: state => state.me,
		period: state =>state.period,
		countdown(state) {return Math.floor((state.countdown)/60).pad()+':'+(state.countdown%60).pad()},
	}),
	data(){
		return { 
			colors:['red', 'green', 'red', 'green', 'red', 'green', 'red', 'green', 'red', 'green'] ,
			statusColors:{
				Waiting:'orange', 
				LOSE:'red',
				WIN:'green' 
			},
			fullscreen:false,
			fullorders:false,
			conf:conf,
			notify:null,
		}
	},
	watch :{
		status(new_status, old_status) {
			if (new_status=='stop_betting' && new_status!=old_status) {
				if (this.$refs.xz) this.$refs.xz.hide();
			}
		}
	},
	methods:{
		headicon() {
			if (this.me.icon) return this.me.icon;
			return null;
		},
		username() {
			if (!this.me) return null;
			// if (this.me.name) return this.me.name;
			return this.$i18n.t('ID')+' '+(this.me.phone||'-');
		},
		colorsOfNumber(n) {
			if (n==0) return ['red', 'violet'];
			if (n==5) return ['green', 'violet'];
			if (n%2==0) return ['red'];
			if (n%2==1) return ['green']
			return ['undefined color']
		},
		capitalizeFirstLetter(string) {
			return string.charAt(0).toUpperCase() + string.slice(1);
		},
		dateTimeString :(t)=>{
			t=new Date(t);
			return `${t.getFullYear().pad(4)}-${(t.getMonth()+1).pad()}-${t.getDate().pad()} ${t.getHours().pad()}:${t.getMinutes().pad()}:${t.getSeconds().pad()}`;
		},
		timeString(t) {
			t=new Date(t);
			return `${t.getHours().pad()}:${t.getMinutes().pad()}:${t.getSeconds().pad()}`;
		},
		getResult(p) {
			p=String(p);
			return Number(p.substr(p.length-1, 1))
		},
		drawDots(p) {
			var r=this.getResult(p);
			var ret='';
			switch (r) {
				case 1:
				case 3:
				case 7:
				case 9:
					ret+='<b class="Green"></b>';
					break;
				case 2:
				case 4:
				case 6:
				case 8:
					ret+='<b class="Red"></b>';
					break;
				case 0:
					ret+='</b><b class="Red"></b><b class="Violet">';
					break;
				case 5:
					ret+='<b class="Green"></b><b class="Violet"></b>';
					break;
				default:
					ret='unsupported value '+r;
					break;
			}
			return ret;
		},
		bet(event) {
			// console.log(event);
			if (this.status=='stop_betting') return;
			if (!event.target.dataset ||!event.target.dataset.bet) return;
			// var ComponentClass = Vue.extend(xiazhu)
			// var instance = new ComponentClass()
			// instance.$data.bet=event.target.dataset.bet;
			// instance.$mount() // pass nothing
			// this.$el.appendChild(instance.$el);
			// this.$refs['modal1'].show();
			var xz=this.$refs['xz'];
			xz.bet=event.target.dataset.bet;
			xz.betting=10;
			xz.multiple=1;
			xz.show();
		},
		openRule() {
			this.$refs.ru.show();
		},
		showTopUp() {
			this.$refs.mymenu.showtopup();
		},
		showLogin(showLoginPage) {
			this.$refs.signup.show(showLoginPage);
		},
		showMyMenu() {
			this.$refs.mymenu.show();
		},
		showErr(e) {
			this.err=e;
		},
		checkLoginState() {
			// read token from cookie
			var token=docCookies.getItem('token'), phone=docCookies.getItem('phone');
			if (!phone) return this.showLogin();
			if (!token) return this.showLogin('login')
			openLink()
		},
		recent() {
			// return [{no:'111', price:888}]
			if (!window.v) return [];
			var state=window.v.$store.state;
			if (!state.history) return [];
			var r;
			if (this.fullscreen) r=state.history.slice(0);
			else if (state.history.length>10) r=state.history.slice(state.history.length-10);
			else r=state.history.slice(0);
			r.sort((a, b)=>{
				if (a.period<b.period) return 1;
				if (a.period>b.period) return -1;
				return 0;
			});
			return r;
		},
		recentOrders() {
			if (!window.v) return [];
			var state=window.v.$store.state;
			if (!state.orders) return [];
			var r;
			if (this.fullorders) r=state.orders.slice(0);
			else if (state.orders.length>10) r=state.orders.slice(state.orders.length-10);
			else r=state.orders.slice(0);
			r.sort((a, b)=>{
				if (a.time<b.time) return 1;
				if (a.time>b.time) return -1;
				return 0;
			});
			var self=this;
			r.forEach((item) => {
				item.money=item.betting-item.fee;
				if (item.game.price==null) {
					item.status='Waiting';
					return;
				}
				var game_number=self.getResult(item.game.price);
				if (item.select=='Green') {
					if (game_number%2==1) {
						item.status='WIN';
						if (game_number==5) item.amount=1.5*(item.betting-item.fee);
						else item.amount=2*(item.betting-item.fee);
						return;
					}
				}
				if (item.select=='Red') {
					if (game_number%2==0) {
						item.status='WIN';
						if (game_number==0) item.amount=1.5*(item.betting-item.fee);
						else item.amount=2*(item.betting-item.fee);
						return;
					}
				}
				if (item.select=='Violet') {
					if (game_number==0 || game_number==5) {
						item.status='WIN';
						item.amount=4.5*(item.betting-item.fee);
						return;
					}
				}
				if (item.select==game_number) {
					item.status="WIN";
					item.amount=9*(item.betting-item.fee);
					return;
				}
				item.status='LOSE';
				item.amount=-item.betting;
			});
			return r;
		}

	},
	events:{
	},
	mounted() {
		eventBus.$on('whatsupchgd', (v)=>{alert(v)});
		eventBus.$on('relogin', this.checkLoginState.bind(this));
		// this.$refs.signup.show();
		this.checkLoginState();
		var self=this;
		eventBus.$on('notify', (str)=>{
			self.notify=str;			
		})
		eventBus.$on('connect', (socket)=>{
			self.notify=null;
			if (socket.disable_relogin) return;
			var token=docCookies.getItem('token'), phone=docCookies.getItem('phone');
			if (!phone) return this.showLogin();
			if (!token) return this.showLogin('login')
			socket.emit('login', {phone, t:token}, (err)=>{
				if (err) {
					docCookies.removeItem('token')
					return self.checkLoginState();
				}
			});
		})
	}
}
setInterval(()=>{
	window.v.$store.commit('countdown');
}, 1000);



</script>

<style>
/* #app {
	font-family: Avenir, Helvetica, Arial, sans-serif;
	-webkit-font-smoothing: antialiased;
	-moz-osx-font-smoothing: grayscale;
	text-align: center; 
	color: #2c3e50; 
	margin-top: 0px;
} */
a, article, aside, b, body, button, dd, div, dl, dt, figcaption, figure, footer, h1, h2, h3, h4, h5, h6, header, i, input, li, nav, p, section, select, span, textarea, ul {
		-webkit-box-sizing: border-box;
		box-sizing: border-box;
		padding: 0;
		border: none;
		margin: 0;
		font-family: Georgia,Microsoft Yahei;
		font-size: 14px;
		text-decoration: none;
		-webkit-tap-highlight-color: transparent;
		-webkit-font-smoothing: antialiased;
}
/* .btn {
		width: 90%;
		height: 36px;
		margin: 0 auto;
		border-radius: 18px;
		border: 2px solid #147239;
		background-color: #147239;
		line-height: 32px;
		color: #fff;
		text-align: center;
}
.btn.reverse {
		background-color: #fff;
		color: #147239;
} */
.home {
		position: relative;
		width: 100%;
		padding-bottom: 70px;
}
.home-top {
		position: relative;
		width: 100%;
		height: 120px;
		padding-top: 30px;
		background: url('./assets/top.jpg') 50%/cover;
		color: #fff;
}
.home-top>.btn {
		position: absolute;
		right: 20px;
}
.home-top p {
		margin-left: 20px;
		margin-bottom: 10px;
		line-height:1;
}
.home-top p>span {
	font-size: 18px;
    margin-left: 8px;
}
.myicon {
	position: absolute;
    left: 5px;
    top: 22px;
    text-align: center;
}
.myicon>img{
	width:40px;
	height:40px;
	display:block;
}
.myicon>.btn {
	height: 25px;
    font-size: 12px;
	color: black;
	background-color:#EAC71C;
    border-color: #EAC71C;
	position:absolute;
	padding:2px 10px;
	left:0px;
	top:45px;
}
.info{
    position: absolute;
    left: 35px;
    top: 25px;
}
.home-recharge {
	top: 15px;
	width: 100px;
	color: white;
	border-radius: 6px;
	background-color:#007E00;
	border-color:#007E00;
}
.home-rule {
	top:60px;
	bottom: 27px;
	padding: 2px 6px;
	border: 1px solid #fff;
	border-radius: 6px;
	background-color: transparent;
	color: #fff;
}
.game-info {
	position: relative;
	margin: 20px;
}
.game-info>li {
	display: inline-block;
	width: 50%;
}
.game-info>li:nth-child(2) {
	text-align: right;
}
.game-info p {
	color: grey;
}
.game-info p:last-child {
	margin-top: 5px;
	color: #000;
	font-size: 24px;
}
.game-block {
	display: -webkit-box;
	display: -ms-flexbox;
	display: flex;
	-ms-flex-wrap: wrap;
	flex-wrap: wrap;
	-webkit-box-pack: justify;
	-ms-flex-pack: justify;
	justify-content: space-between;
	margin: 20px;
	margin-top: 30px;
	list-style: none;
}
.game-color:first-child {
	background: #1eb93d;
}
.game-color:nth-child(2) {
	background: #ea3af0;
}
.game-color:nth-child(3) {
	background: #f52828;
}
.game-color {
		width: calc((100% - 20px)/3);
		height: 40px;
		line-height: 40px;
}
.game-number {
		position: relative;
		width: calc((100% - 40px)/5);
		height: 30px;
		line-height: 30px;
		font-size: 18px;
}
.game-block>li {
		margin-bottom: 10px;
		text-align: center;
		color: #fff;
		background: #007acc;
}
.game-block.ban>li {
	background: #b0b0b0;
}
.game-block.ban>li:after,.game-block.ban>li:before {
    display: none
}
.game-number:after, .game-number:before {
		content: "";
		position: absolute;
		bottom: 2px;
		width: 10px;
		height: 10px;
		border-radius: 50%;
}
.game-number:after {
		right: 2px;
}
.game-number:nth-child(4):after, .game-number:nth-child(6):after, .game-number:nth-child(8):after, .game-number:nth-child(10):after, .game-number:nth-child(12):after {
		background: #f52828;
}
.game-number:nth-child(4):before, .game-number:nth-child(9):before {
		right: 14px;
		background: #ea3af0;
}
.game-number:nth-child(5):after, .game-number:nth-child(7):after, .game-number:nth-child(9):after, .game-number:nth-child(11):after, .game-number:nth-child(13):after {
		background: #1eb93d;
}
.parity-list {
		margin-bottom: 10px;
}
.pl-top {
		padding: 0 20px 0 16px;
		border-left: 4px solid #147239;
}
.parity-list.full>.pl-top {
	border-left: 0px;
}
.pl-top>span:first-child {
	font-size:18px;
	color: #147239;
}
.pl-top>span:nth-child(2) {
		float: right;
		color: grey;
}
.pl-list {
		padding: 0 20px;
		margin-top: 10px;
}
.pl-list>li {
		display: -webkit-box;
		display: -ms-flexbox;
		display: flex;
		border-bottom: 1px solid #dadada;
}
.pl-list span {
		display: inline-block;
		height: 40px;
		line-height: 40px;
}
.pl-list span:first-child {
		width: 40%;
}
.pl-list span:nth-child(2) {
		width: 25%;
}
.pl-list span:nth-child(3) {
		width: 20%;
}
.pl-list span:nth-child(4) {
		display: -webkit-box;
		display: -ms-flexbox;
		display: flex;
		-webkit-box-align: center;
		-ms-flex-align: center;
		align-items: center;
		width: 15%;
}
span.red {
		color: #f52828;
}
span.green {
		color: #1eb93d;
}
span.violet {
		color: #ea3af0;
}
span.orange {
	color:orange;
}
.pl-list>li:first-child {
		color: grey;
}
.pl-list>li:first-child>span {
		height: 30px;
		line-height: 30px;
		font-size: 12px;
}
.pl-list b {
		display: inline-block;
		width: 15px;
		height: 15px;
		margin-right: 5px;
		border-radius: 50%;
}
.Green {
		background: #1eb93d!important;
}
.Red {
		background: #f52828!important;
}
.Violet {
	background: #ea3af0!important;
}
.Blue {
	background: #007acc!important;
}
.my-list {
		border-top: 10px solid #f5f5f5;
		padding: 15px 0;
}
.my-list>p {
		text-align: center;
		color: #909090;
}
.ml-top {
		padding: 0 20px 0 16px;
		border-left: 4px solid #147239;
}
.ml-top>span:first-child {
		font-size: 18px;
		color: #147239;
}
.ml-top>span:nth-child(2) {
		float: right;
		color: grey;
}
.ml-item {
    position: relative;
    padding: 0 20px 10px 20px;
    margin-top: 20px;
    border-bottom: 1px solid #e0e0e0;
}
.ml-item>p:first-child {
    margin-bottom: 8px;
}
.ml-item b {
    margin-left: 5px;
    color: orange;
    font-size: 16px;
}
.ml-item>p:nth-child(3) {
    position: absolute;
    right: 20px;
    top: 0;
    color: grey;
    font-size: 12px;
}
.ml-content {
    margin-top: 10px;
}
.ml-content>p {
    display: inline-block;
    width: 50%;
    height: 24px;
    line-height: 24px;
}
.ml-content>p>span:first-child {
    display: inline-block;
    width: 5.5em;
    color: grey;
}
.ml-content b {
		display: inline-block;
		width: 10px;
		height: 10px;
		margin-right: 5px;
		border-radius: 50%;
}
.full {
	position:fixed;
	left:0px;
	top:0px;
	width:100%;
	height:100%;
	background-color: white;
	z-index: 1000;
	overflow: scroll;
}

</style>
