<template>
    <b-table 				
		show-empty
		small
		stacked="md"
		:items="orders"
		:fields="fields">
		<template v-slot:cell(actions)="row">
			<b-button size="sm" @click="refund(row.item)" v-if="!row.item.result && !row.item.err">退</b-button>
			<!-- <b-button size="sm" v-b-modal.modal-chgpwd @click="account.phone=row.item.phone">reset password</b-button> -->
		</template>
	</b-table>
</template>

<script>
export default {
    name:'withdrawOrders',
    
}
</script>