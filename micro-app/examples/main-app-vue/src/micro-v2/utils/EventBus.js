import { isFunction } from './util'

export default class EventBus {
    constructor(){
      this.events = {}
    }
    on(event, callback) {
        if (!isFunction(callback)) {
            throw Error(`The second param ${typeof callback} is not a function`)
        }
        if(!this.events[event]){
            this.events[event] = []
        }
        this.events[event].push(callback)
    }

    off(event, callback) {

        if (!this.events[event]) return

        if (callback) {
            const cbs = this.events[event]
            let l = cbs.length
            while (l--) {
                if (callback == cbs[l]) {
                    cbs.splice(l, 1)
                }
            }
        } else {
            this.events[event] = []
        }
    }

    emit(event, ...args) {
        this.events[event].forEach((callback) => {
            /**
             * 如果是点击其他子应用或父应用触发全局数据变更，则当前打开的子应用获取到的 app 为 null
             * 所以需要改成用 activeRule 来判断当前子应用是否运行
             */
            callback.call(this, ...args)
        })
    }

    // once(event, callback) {
    //     // eslint-disable-next-line @typescript-eslint/no-this-alias
    //     const self = this

    //     function wrap(...args) {
    //         callback.call(self, ...args)
    //         self.off(event, wrap)
    //     }

    //     this.on(event, wrap)
    // }

    clearEventsByAppName() {
        this.events = {}
    }
}