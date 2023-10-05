import pv from './pv'
import pageAccessDuration from './pageAccessDuration'
import onClick from './onClick'
// import config from '../config'


export default function behavior() {
    pv()
    pageAccessDuration()
    // pageAccessHeight()
    onClick()

    // if (config.vue?.router) {
    //     onVueRouter(config.vue.router)
    // }
}