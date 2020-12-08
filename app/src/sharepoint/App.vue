<template>
<div>
    <img src="../assets/logo.png" style="width:48px"/><span class="title">Millionare</span>
    <router-view></router-view>
</div>
</template>

<script>

export default {
    name:'App',
}
</script>

<style>
    body {
        background-color: #8ed385;
    }
    div {
        padding: 22px 12px;
    }
    .title {
        padding:5px 10px;
        font-size:24px;
    }
    .info {
        font-size:18px;
        color:red;
        font-weight:bold;
    }
</style>