import VueRouter from 'vue-router'
import step1 from './step1.vue'
import step2 from './step2.vue'


const router=new VueRouter({
	routes:[
		{path:'/', component:step1},
		{path:'/step1',component:step1},
		{path:'/step2',component:step2},
	] 
});

export {router};