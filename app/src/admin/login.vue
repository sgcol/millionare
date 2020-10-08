<template>
	<b-form class="mt-5">
		<b-form-group	id="login-phone">
			<b-form-input
				v-model="mobile"
				required
				placeholder="User name"
			></b-form-input>
		</b-form-group>
		<b-form-group>
			<b-form-input
				v-model="password"
				type="password"
				required
				placeholder="Password"
			></b-form-input>
		</b-form-group>
		<b-form-group v-if="regmode">
			<b-button type="submit" variant="primary" block @click="reg">Sign up</b-button>
			<p>首次使用，请注册管理员账号，一旦注册不可更改</p>
		</b-form-group>
		<b-button type="submit" variant="primary" block @click="dologin" v-else>Sign in</b-button>
	</b-form>
</template>

<script>
import {openLink} from "../client"
import md5 from 'md5'

export default {
	name:'login',
	data() {
		return {
			mobile:null, password:null, logged:false, longop:false, regmode:false
		}
	},
	methods:{
		loggedIn() {
			return !!this.logged;
		},
		reg(e) {
			e.preventDefault();
			this.longop=true;
			var phone=this.mobile, password=this.password, self=this;
			openLink((socket)=>{
				function errHandler() {
					self.longop=false;
					socket.off('reconnect_failed', errHandler);
					alert('Can not reach the server');
				}
				socket.on('reconnect_failed', errHandler);
				socket.emit('regadmin', {phone, pwd:password}, (err)=>{
					self.handlelogin(err);
					socket.off('reconnect_failed', errHandler);
				})
			})
		},
		dologin(e) {
			e.preventDefault();
			this.longop=true;
			var phone=this.mobile, password=this.password, self=this;
			openLink((socket)=>{
				function errHandler() {
					self.longop=false;
					socket.off('reconnect_failed', errHandler);
					alert('Can not reach the server');
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

		handlelogin(err) {
			this.longop=false;
			if (err) return alert(err);
			localStorage.admin_logged=true;
			this.$router.replace('/serverlet');
		},
	},
	mounted() {
		var self=this;
		openLink((socket)=>{
			socket.emit('adminexists', (err, hasAdmin)=>{
				if (err) return alert(err);
				self.regmode=!hasAdmin;
			})
		})
	}
}
</script>