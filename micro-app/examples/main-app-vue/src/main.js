import Vue from 'vue'
import App from './App.vue'
import router from './router'

import microFramework from './micro'


Vue.config.productionTip = false


function render(){
  new Vue({
    router,
    render: h => h(App),
  }).$mount('#main')
}

render()

microFramework.registerApp('app1', {
  activeRule: '/vue',
  pageEntry: 'http://localhost:8001',
  mountPoint: 'app1'
});

microFramework.registerApp('app2', {
  activeRule: '/react',
  pageEntry: 'http://localhost:8002',
  mountPoint: 'app2'
});