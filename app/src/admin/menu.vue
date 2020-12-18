<template>
<div>
	<b-navbar toggleable="lg" type="dark" variant="info" fixed="top" sticky>
		<b-navbar-brand href="#">Admin</b-navbar-brand>
		<b-navbar-toggle target="nav-collapse"></b-navbar-toggle>

		<b-collapse id="nav-collapse" is-nav>
			<b-navbar-nav class="">
				<b-nav-item to="serverlet">服务器设置</b-nav-item>
				<b-nav-item to="gameset">游戏监控</b-nav-item>
				<b-nav-item to="accounts">管理员</b-nav-item>
				<b-nav-item to="userMoney">用户管理</b-nav-item>
				<b-nav-item to="orders">充值订单</b-nav-item>
				<b-nav-item to="withdrawOrders">提现订单</b-nav-item>
				<b-nav-item to="bulkOp">批量处理</b-nav-item>
				<!-- <b-nav-item to="approve">审核提款</b-nav-item> -->
					<!-- <b-dropdown-item to="userHistory">查询</b-dropdown-item>
					<b-dropdown-item to="userMoney">上下分</b-dropdown-item>
					<b-dropdown-item to="userBlock">封号</b-dropdown-item>
				</b-nav-item-dropdown> -->
				<b-nav-item to="logout">注销</b-nav-item>
			</b-navbar-nav>
		</b-collapse>
	</b-navbar>
</div>
</template>

<script>
export default {
	name:'MENU'
}
</script>