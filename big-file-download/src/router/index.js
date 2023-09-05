import Vue from 'vue'
import VueRouter from 'vue-router'
import BigFIleUpload from '../views/BigFileDownload.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'home',
    component: BigFIleUpload
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
