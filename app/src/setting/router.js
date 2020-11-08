import VueRouter from 'vue-router'
import {eventBus} from '../client'
import serverlet from './serverlet.vue'
import login from '../admin/login.vue'
import auth, {openLink} from '../admin/auth'

function requireAuth(to, from, next) {
		var r=auth.loggedIn()
		if (!r) {
			next({
				path: '/login',
				query: { redirect: to.fullPath }
			})
		} else {
			next()
		}
}

const router =new VueRouter({
  routes:[
      {path:'/', component:serverlet, beforeEnter:requireAuth},
      {path:'/serverlet',component:serverlet, beforeEnter:requireAuth},
      {path:'/login', component:login},
      { path: '/logout',
        beforeEnter (to, from, next) {
            auth.logout()
            next('/')
        }
      }
      // {path:'*', component:"<template><p>error</p></template>"}
  ] 
});

router.onReady(()=>{
	relogin();
})

const sock=openLink();
function relogin() {
	// if (localStorage.adminAccount && localStorage.adminToken) {
	// 	sock.emit('login', {phone:localStorage.adminAccount, t:localStorage.adminToken}, (err)=>{
	// 		if (err) {
	// 			localStorage.adminAccount=undefined;
	// 			localStorage.adminToken=undefined;
	// 			sock.isLogined=undefined;
	// 			router.push('/login');
	// 		} else {
	// 			router.push(router.currentRoute);
	// 		}
	// 	});
	// } else router.push('/login');
}
eventBus.$on('relogin', relogin);
eventBus.$on('kicked', (str)=>{
	localStorage.adminAccount=undefined;
	localStorage.adminToken=undefined;
	sock.isLogined=undefined;
	alert(str);
	router.push('/login');
})

export {router};