import VueRouter from 'vue-router'

import serverlet from './serverlet.vue'
import userMoney from './userMoney'
import withdrawOrders from './withdraw-orders'
import login from './login.vue'
import auth from './auth'
import accounts from './accounts'
import gameset from './game'

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
        {path:'/accounts',component:accounts, beforeEnter:requireAuth},
        {path:'/gameset',component:gameset, beforeEnter:requireAuth},
        {path:'/withdrawOrders', component:withdrawOrders, beforeEnter:requireAuth},
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
