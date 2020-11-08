import VueRouter from 'vue-router'

import serverlet from './serverlet.vue'
import login from '../admin/login.vue'
import auth from '../admin/auth'

function requireAuth(to, from, next) {
    if (!auth.loggedIn()) {
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
  auth.relogin();
})

export { router};