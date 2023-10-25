import Vue from 'vue'
import VueRouter from 'vue-router'
import virtualScroll from '../views/virtual-scroll.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'virtualScroll',
    component: virtualScroll
  },
  {
    path: '/noheight-virtual-list',
    name: 'noheight-virtual-list',
    component: () => import(/* webpackChunkName: "virtual-list" */ '../views/noheight-virtual-list.vue')
  },
  {
    path: '/hasheight-virtual-list',
    name: 'hasheight-virtual-list',
    component: () => import(/* webpackChunkName: "virtual-list" */ '../views/hasheight-virtual-list.vue')
  }
]

const router = new VueRouter({
  routes
})

export default router
