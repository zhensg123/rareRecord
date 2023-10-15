import Vue from 'vue'
import App from './App.vue'
import router from './router'

import microFramework from './micro-v2'


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
  mountPoint: 'app1',
  bootstrap(){
    console.log('app1挂载前')
  },
  mount() {
    console.log('app1已挂载')         
  },
  unmount() {
    console.log('app1已卸载')         
  },
});

microFramework.registerApp('app2', {
  activeRule: '/react',
  pageEntry: 'http://localhost:8002',
  mountPoint: 'app2',
  bootstrap(){
    console.log('app2挂载前')
  },
  mount() {
    console.log('app2已挂载')         
  },
  unmount() {
    console.log('app2已卸载')         
  },
});

window.spaGlobalState.on('vue', () => alert('父应用监听到 vue 子应用发送了一个全局事件: vue'))
