import Vue from 'vue'
import VueRouter from 'vue-router'
import BigFIleUpload from '../views/BigFIleUpload.vue'
import ResumeUpload from '../views/ResumeUpload.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'home',
    component: BigFIleUpload
  },
  {
    path: '/resume-upload',
    name: 'ResumeUpload',
    component: ResumeUpload
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
