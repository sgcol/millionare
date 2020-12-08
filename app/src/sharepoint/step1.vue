<template>
	<div class="text-center">
		<img src="../assets/box.png" style="width:60%"/>
		<p class="info">Teman Anda memberi Anda Rp4000! </p>
		<p class="info">Cepat dan masuk untuk menerimanya! </p>
		<v-facebook-login app-id="658156324804891" style="margin:auto" @login="fb_login" @sdk-init="handleSdkInit" :options="{cookie:false, status:false,autoLogAppEvents:false}"></v-facebook-login>
		<p>or</p>
		<GoogleLogin :params="{client_id:'647198173064-h0m8nattj0pif2m1401terkbv9vmqnta.apps.googleusercontent.com'}" :onSuccess="onSuccess" class="btn btn-outline-secondary btn-back-white">Signed in with Google</GoogleLogin>
	</div>
</template>

<script>
// import Vue from 'vue'
import conf from '../conf'
import {openLink} from '../client'

export default {
	name: 'Step1',
	components: {
		// HelloWorld
		VFacebookLogin:()=>import('vue-facebook-login-component'),
		GoogleLogin:()=>import('vue-google-login'),
		// BAlert,
	},
	data(){
		return { 
			conf:conf,
			FB:{},
			longop:null,
		}
	},
	methods:{
		decode(str) {
            var ret='', a='a'.charCodeAt(), z='z'.charCodeAt(), Z='Z'.charCodeAt(), A='A'.charCodeAt(), char0='0'.charCodeAt(), char9='9'.charCodeAt(); 
            function toNum(c) {
                if (c<=z && c>=a) return c-a;
                if (c<=Z && c>=A) return 26+c-A;
                if (c>=char0 && c<=char9) return 52+c-char0;
                if (c=='-'.charCodeAt()) return 62;
                if (c=='_'.charCodeAt()) return 63;
                return NaN; 
            }
            for (var i=0; i<str.length; i+=2) {
                var _h=str.charCodeAt(i), _l=str.charCodeAt(i+1);
                var x=toNum(_h)*64+toNum(_l);
                ret+=x.toString(16);
            }
            return ret;
        },
		handleSdkInit({FB}) {
			this.FB=FB;
		},
		fb_login() {
			var self=this;
			this.FB.getLoginStatus(response=>{
				if (response.status!='connected') return console.error(response);
				self.longop=true;
				openLink((socket)=>{
					function errHandler() {
						self.longop=false;
						socket.off('reconnect_failed', errHandler);
						alert(self.$i18n.t('Can not reach the server'));
					}
					socket.on('reconnect_failed', errHandler);
					socket.emit('fber_invited', response.authResponse.accessToken, self.decode(location.search.slice(1)), (err)=>{
						self.handlelogin(err);
					})
				})
			})
		},
		onSuccess(googleUser) {
			var self=this;
			self.longop=true;
			openLink(socket=>{
				function errHandler() {
					self.longop=false;
					socket.off('reconnect_failed', errHandler);
					alert(self.$i18n.t('Can not reach the server'));
				}
				socket.on('reconnect_failed', errHandler);
				socket.emit('gooer_invited', googleUser.getAuthResponse().id_token, self.decode(location.search.slice(1)), (err)=>{
					self.handlelogin(err);
				})
			})
		},
		handlelogin(err) {
			this.longop=false;
			if (err) return alert(err);
			this.$router.push('/step2');
		},
	},
}

</script>

<style scoped>
	.btn-back-white {
		background-color: #fff;
	}
</style>
