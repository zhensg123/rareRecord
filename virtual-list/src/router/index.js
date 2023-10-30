import Vue from 'vue'
import VueRouter from 'vue-router'
import virtualScroll from '../views/virtual-scroll.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'home',
    redirect: '/virtual-scroll',
  },
  {
    path: '/virtual-scroll',
    name: 'virtualScroll',
    component: virtualScroll
  },
  {
    path: '/virtualSroll-sameHeight-virtualList',
    name: 'virtualSroll-sameHeight-virtualList',
    component: () => import(/* webpackChunkName: "virtual-list" */ '../views/virtualSroll-sameHeight-virtualList.vue')
  },
  {
    path: '/virtual-scroll-virtual-list',
    name: 'virtual-scroll-virtual-list',
    component: () => import(/* webpackChunkName: "virtual-list" */ '../views/virtual-scroll-virtual-list.vue')
  },
  {
    path: '/noheight-virtual-list',
    name: 'noheight-virtual-list',
    component: () => import(/* webpackChunkName: "virtual-list" */ '../views/noheight-virtual-list.vue')
  },
  {
    path: '/same-height-virtual-list',
    name: 'same-height-virtual-list',
    component: () => import(/* webpackChunkName: "virtual-list" */ '../views/same-height-virtual-list.vue')
  },
  {
    path: '/different-height-virtual-list',
    name: 'different-height-virtual-list',
    component: () => import(/* webpackChunkName: "virtual-list" */ '../views/different-height-virtual-list.vue')
  }
]

const router = new VueRouter({
  routes
})

export default router
