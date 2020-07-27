import VueRouter from 'vue-router'

import serverlet from './serverlet.vue'
import userMoney from './userMoney'
import login from './login.vue'
import auth from './auth'

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

export const router=new VueRouter({
    routes:[
        {path:'/', component:serverlet, beforeEnter:requireAuth},
        {path:'/serverlet',component:serverlet, beforeEnter:requireAuth},
        {path:'/userMoney',component:userMoney, beforeEnter:requireAuth},
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
