<template>
	<b-modal id="signup_modal" size='lg' hide-header hide-footer no-close-on-backdrop no-close-on-esc>
		<b-overlay :show="longop" rounded="sm">
			<div style="width: 100%; text-align: center; vertical-align: middle; min-height:280px" v-if="socialLogin">
				<b-iconstack font-scale="7.5" class="mt-4 mb-5">
					<b-icon-person-fill stacked variant="secondary" scale="0.85"></b-icon-person-fill>
					<b-icon-circle stacked variant="secondary"></b-icon-circle>
				</b-iconstack>
				<!-- <b-icon icon="person-circle" font-scale="7.5" variant="secondary" class="mt-4 mb-5"></b-icon> -->
				<v-facebook-login app-id="658156324804891" style="margin:auto" @login="fb_login" @sdk-init="handleSdkInit" v-model="FB_model"></v-facebook-login>
				<p>----------------or---------------</p>
				<GoogleLogin :params="{client_id:'647198173064-h0m8nattj0pif2m1401terkbv9vmqnta.apps.googleusercontent.com'}" :renderParams="{width:215, height:39, longtitle:true}" style="margin:auto"></GoogleLogin>
			</div>
			<b-tabs content-class='mt-3' fill v-model="page" v-else>
				<b-tab :title="$t('Register')">
					<b-form>
						<b-form-group
							id="phone"
							:description="$t(`We'll never share your phone with anyone else.`)"
						>
							<b-form-input
								v-model="$v.mobile.$model"
								type="tel"
								:placeholder="$t('Phone number')"
								:state="validateState('mobile')"
								aria-describedby="input-phone-live-feedback"
							></b-form-input>
							<b-form-invalid-feedback id="input-phone-live-feedback">{{$t('The phone number must be 10 numerics starts with 7, 8, or 9')}}</b-form-invalid-feedback>
						</b-form-group>
						<b-form-group	id="password">
							<b-form-input
								v-model="$v.password.$model"
								type="password"
								:placeholder="$t('Password')"
								:state="validateState('password')"
								aria-describedby="input-password-live-feedback"
							></b-form-input>
							<b-form-invalid-feedback id="input-password-live-feedback">{{$t('The password must be at least 6 characters')}}</b-form-invalid-feedback>
						</b-form-group>
						<b-form-group>
							<b-form-input
								v-model="$v.repeat_password.$model"
								type="password"
								:placeholder="$t('Repeat password')"
								:state="validateState('repeat_password')"
								aria-describedby="input-repeat-password-live-feedback"
							></b-form-input>
							<b-form-invalid-feedback id="input-repeat-password-live-feedback">{{$t('Must be same as password')}}</b-form-invalid-feedback>
						</b-form-group>
						<b-form-group	id="otp">
							<b-input-group>
								<b-form-input
									v-model="otp"
									type="text"
									required
									:placeholder="$t('Enter OTP')"
								></b-form-input>
								<b-input-group-append>
									<b-button variant="outline-info" style="min-width:100px" :disabled="!validateState('mobile')||!!otpSending" v-on:click="sendOTP">{{$t(otpSending?otpSending:'Send OTP')}}</b-button>
								</b-input-group-append>
							</b-input-group>
						</b-form-group>
						<b-form-checkbox
							v-model="agree"
							name="checkbox-1"
							value="acceptedRDA"
							required
						>
							<i18n path="term" tag="label" for="Privacy Policy">
								<!-- Agree <a href='#' v-on:click="showRDA">Privacy Policy</a> -->
								<a href="#" v-on:click="showRDA">{{ $t('Privacy Policy')}} </a>
							</i18n>
						</b-form-checkbox>
						<b-form-group class="text-center">
							<a href="" @click="flip('login', $event)">{{$t('Already have an account?')}}</a>
						</b-form-group>
						<b-button type="submit" variant="primary" block v-on:click="signup">{{$t('Sign up')}}</b-button>
					</b-form>
				</b-tab>
				<b-tab :title="$t('Login')" ref="signin">
					<b-form>
						<b-form-group	id="login-phone">
							<b-form-input
								v-model="mobile"
								type="tel"
								required
								:placeholder="$t('Phone number')"
							></b-form-input>
						</b-form-group>
						<b-form-group>
							<b-form-input
								v-model="password"
								type="password"
								required
								:placeholder="$t('Password')"
							></b-form-input>
						</b-form-group>
						<b-form-group class="text-center">
							<!-- <b-form-checkbox
								id="checkbox-2"
								v-model="remember_me"
								name="checkbox-2"
								value="remember_me"
							>
								Remember me
							</b-form-checkbox> -->
							<a href="#" v-on:click="forgotPassword">{{$t('Forgot your password?')}}</a>
						</b-form-group>
						<b-button type="submit" variant="primary" block v-on:click="signin">{{$t('Sign in')}}</b-button>
					</b-form>
				</b-tab>
			</b-tabs>
			<RDA ref="rda"></RDA>
			<forgot ref="forgot"></forgot>
		</b-overlay>
	</b-modal>
</template>

<script>
import RDA from './RDA.vue'
import forgot from './forgot.vue'
import { validationMixin } from "vuelidate";
import { required, numeric, minLength, sameAs } from "vuelidate/lib/validators";
import {openLink} from "../client.js"
import md5 from 'md5'
import VFacebookLogin from 'vue-facebook-login-component'
import GoogleLogin from 'vue-google-login';
import {BIconstack, BIconPersonFill, BIconCircle} from 'bootstrap-vue'
import conf from '../conf'

const docCookies = {
	getItem: function (sKey) {
		// eslint-disable-next-line
	return decodeURIComponent(document.cookie.replace(new RegExp("(?:(?:^|.*;)\\s*" + encodeURIComponent(sKey).replace(/[-.+*]/g, "\\$&") + "\\s*\\=\\s*([^;]*).*$)|^.*$"), "$1")) || null;
	},
	setItem: function (sKey, sValue, vEnd, sPath, sDomain, bSecure) {
		// eslint-disable-next-line
	if (!sKey || /^(?:expires|max\-age|path|domain|secure)$/i.test(sKey)) { return false; }
	var sExpires = "";
	if (vEnd) {
		switch (vEnd.constructor) {
		case Number:
			sExpires = vEnd === Infinity ? "; expires=Fri, 31 Dec 9999 23:59:59 GMT" : "; max-age=" + vEnd;
			break;
		case String:
			sExpires = "; expires=" + vEnd;
			break;
		case Date:
			sExpires = "; expires=" + vEnd.toUTCString();
			break;
		}
	}
	document.cookie = encodeURIComponent(sKey) + "=" + encodeURIComponent(sValue) + sExpires + (sDomain ? "; domain=" + sDomain : "") + (sPath ? "; path=" + sPath : "") + (bSecure ? "; secure" : "");
	return true;
	},
	removeItem: function (sKey, sPath, sDomain) {
	if (!sKey || !this.hasItem(sKey)) { return false; }
	document.cookie = encodeURIComponent(sKey) + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT" + ( sDomain ? "; domain=" + sDomain : "") + ( sPath ? "; path=" + sPath : "");
	return true;
	},
	hasItem: function (sKey) {
	return (new RegExp("(?:^|;\\s*)" + encodeURIComponent(sKey).replace(/[-.+*]/g, "\\$&") + "\\s*\\=")).test(document.cookie);
	},
	keys: /* optional method: you can safely remove it! */ function () {
		// eslint-disable-next-line
	var aKeys = document.cookie.replace(/((?:^|\s*;)[^\=]+)(?=;|$)|^\s*|\s*(?:\=[^;]*)?(?:\1|$)/g, "").split(/\s*(?:\=[^;]*)?;\s*/);
	for (var nIdx = 0; nIdx < aKeys.length; nIdx++) { aKeys[nIdx] = decodeURIComponent(aKeys[nIdx]); }
	return aKeys;
	}
};

function uuidv4() {
	return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
	var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
	return v.toString(16);
	});
}

export default {
	name:'signup',
	mixins: [validationMixin],
	components:{
		RDA, forgot,VFacebookLogin, GoogleLogin,BIconstack, BIconPersonFill, BIconCircle
	},
	data(){
		return {
			mobile:null, password:null, repeat_password:null, otp:null, agree:false, acceptRDA:false, remember_me:null, longop:false, err:null,
			page:0,
			otpSending:false,
			socialLogin:conf.login=='social',
			FB:{},
			scope:{},
			FB_model:{}
		}
	},
	watch:{
		FB_model(value) {
			this.$store.commit('fb', {connected:value.connected, logout:this.scope.logout});
		}
	},
	methods:{
		handleSdkInit({FB, scope}) {
			this.FB=FB;
			this.scope=scope;
		},
		fb_login(obj) {
			console.log(obj);
			var self=this;
			this.FB.getLoginStatus(response=>{
				if (response.status!='connected') return console.error(response);
				console.log(response);
				self.longop=true;
				openLink((socket)=>{
					function errHandler() {
						self.longop=false;
						socket.off('reconnect_failed', errHandler);
						alert(self.$i18n.t('Can not reach the server'));
					}
					socket.on('reconnect_failed', errHandler);
					socket.emit('fb_login', response.authResponse.accessToken, (err)=>{
						self.handlelogin(err);
						socket.off('reconnect_failed', errHandler);
					})
				})
			})
		},
		show(showLoginPage) {
			var ele=document.getElementById('signup_modal');
			if (ele && ele.className.indexOf('show')>0) return;
			this.page=showLoginPage?1:0;
			this.$children[0].show();
			openLink((socket)=>{
				socket.disable_relogin=true;
			})
		},
		hide() {
			this.$children[0].hide();
			openLink((socket)=>{
				socket.disable_relogin=false;
			})
		},
		showRDA() {
			this.$refs.rda.show()
		},
		flip: function(which, e) {
			e.preventDefault();
			this.$refs.signin.activate();
		},
		forgotPassword(e) {
			e.preventDefault();
			this.$refs.forgot.show()
		},
		validateState(name) {
			const { $dirty, $error } = this.$v[name];
			return $dirty ? !$error : null;
			// return name;
		},
		handlelogin(err, token) {
			this.longop=false;
			if (err) return alert(err);
			docCookies.setItem('token', token);
			docCookies.setItem('phone', this.mobile);
			this.hide();
		},
		signin(e) {
			e.preventDefault();
			if (this.$v.mobile.$error || this.$v.password.$error) return false;
			this.longop=true;
			var phone=this.mobile, password=this.password, self=this;
			openLink((socket)=>{
				function errHandler() {
					self.longop=false;
					socket.off('reconnect_failed', errHandler);
					alert(this.$i18n.t('Can not reach the server'));
				}
				socket.on('reconnect_failed', errHandler);
				socket.emit('salt', phone, (err, salt)=>{
					if (err) {
						self.longop=false;
						alert(err);
						return;
					}
					socket.emit('login', {phone, pwd:md5(''+salt+password)}, (err, t)=>{
						self.handlelogin(err, t);
						socket.off('reconnect_failed', errHandler);
					})
				})
			})
		},
		signup(e) {
			e.preventDefault();
			this.$v.$touch();
			if (this.$v.$error) return false;
			this.longop=true;
			var phone=this.mobile, pwd=this.password, otp=this.otp, self=this;
			openLink((socket)=>{
				function errHandler() {
					self.longop=false;
					socket.off('reconnect_failed', errHandler);
					alert(this.$i18n.t('Can not reach the server'));
				}
				socket.on('reconnect_failed', errHandler);
				socket.emit('reg', {phone, pwd, otp}, (err, t)=>{
					self.handlelogin(err ,t);
					socket.off('reconnect_failed', errHandler);
				})
			})
		},
		sendOTP(e) {
			e.preventDefault();
			e.stopPropagation();
			var phone=this.mobile, self=this;
			this.otpSending=30;
			var timer=setInterval(()=>{
				if (self.otpSending>0) self.otpSending--;
				else clearInterval(timer);
			}, 1000);
			openLink((socket)=>{
				var uuid=docCookies.getItem('mil_uuid');
				if (!uuid) {
					uuid=uuidv4();
					docCookies.setItem('mil_uuid', uuid);
				}
				socket.emit('beforereg', phone, uuid);
			})
		}
	},
	mounted() {
	},
	validations:{
		mobile:{
			required,
			numeric,
			isPhoneNumber:(v)=>{
				v=String(v);
				if (v.length!=10) return false;
				if (v[0]==7 || v[0]==8 || v[0]==9) return true;
				return false;
			}
		},
		password:{
			required,
			min:minLength(6)
		},
		repeat_password:{
			required,
			same:sameAs('password')
		}
	}
}

</script>