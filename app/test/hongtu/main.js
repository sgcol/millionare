import Vue from 'vue'
import { BootstrapVue, BIcon, BIconChevronRight, BIconChevronLeft ,BIconBoxArrowInLeft} from 'bootstrap-vue'
import '~bootstrap';
import '~bootstrap-vue';

// Install BootstrapVue
Vue.use(BootstrapVue)
// Optionally install the BootstrapVue icon components plugin
Vue.component('BIcon', BIcon)
Vue.component('BIconChevronRight', BIconChevronRight)
Vue.component('BIconChevronLeft', BIconChevronLeft)
Vue.component('BIconBoxArrowInLeft', BIconBoxArrowInLeft)

import App from './pay.vue'

Vue.config.productionTip = false

var v=window.v=new Vue({
  el:'#app',
  store,
  $eventBus:new Vue(),
  render: h => h(App),
  // render: h=>h(signup),
})

