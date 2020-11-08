<template>
<div>
	<b-navbar toggleable="lg" type="dark" variant="info" fixed="top" sticky>
		<b-navbar-brand href="#">Admin</b-navbar-brand>
		<b-navbar-toggle target="nav-collapse"></b-navbar-toggle>

		<b-collapse id="nav-collapse" is-nav>
			<b-navbar-nav class="">
				<b-nav-item to="serverlet">系统设置</b-nav-item>
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