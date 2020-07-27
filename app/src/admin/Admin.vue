<template>
<div>
    <sys-menu></sys-menu>
    <router-view></router-view>
</div>
</template>

<script>
import SysMenu from './menu.vue'

export default {
    name:'Admin',
    components:{
        SysMenu
    }
}
</script>