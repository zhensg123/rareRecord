/* eslint-disable class-methods-use-this */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { getEventTypes, isFunction } from './util'
import {
    originalWindowAddEventListener,
    originalWindowRemoveEventListener,
    originalDocument,
    originalEval,
    originalWindow,
    originalDefineProperty,
} from './originalEnv'
import { patchDocument } from './patchDocument'
import { patchDocumentEvents  } from './patchDocumentEvents'
/**
 * js 沙箱，用于隔离子应用 window 作用域
 */
export default class ProxyWindowSandBox {

    constructor(currentApp) {
        // 当前存活的子应用数量
        this.activeCount = 0;
        // 子应用 window 的代理对象
        this.proxyWindow = {}
        // 子应用 window 对象
        this.microAppWindow = {}

        // 子应用向 window 注入的 key
        this.injectKeySet = new Set()
        // 子应用 setTimeout 集合，退出子应用时清除
        this.timeoutSet = new Set()
        // 子应用 setInterval 集合，退出子应用时清除
        this.intervalSet = new Set()

        // 子应用绑定到 window 上的事件，退出子应用时清除
        this.windowEventMap = new Map()
        // 子应用 window onxxx 事件集合，退出子应用时清除
        this.onWindowEventMap = new Map()
        // 代理了 window、document 的 addEventListener 和 window.onxxx 事件

        this.appName = currentApp
        this.hijackProperties()
        patchDocument(currentApp)
        patchDocumentEvents(currentApp)
        this.proxyWindow = this.createProxyWindow(currentApp)
    }

    /**
     * 劫持 window 属性
     */
    hijackProperties() {

        const {
            microAppWindow,
            intervalSet,
            timeoutSet,
            windowEventMap,
            onWindowEventMap,
        } = this

        microAppWindow.setInterval = function setInterval(callback, timeout) {
            const timer = originalWindow.setInterval(callback, timeout)
            this.intervalSet.add(timer)
            return timer
        }

        microAppWindow.clearInterval = function clearInterval(timer) {
            if (timer === undefined) return
            originalWindow.clearInterval(timer)
            intervalSet.delete(timer)
        }

        microAppWindow.setTimeout = function setTimeout(callback, timeout) {
            const timer = originalWindow.setTimeout(callback, timeout)
            timeoutSet.add(timer)
            return timer
        }

        microAppWindow.clearTimeout = function clearTimeout(timer) {
            if (timer === undefined) return
            originalWindow.clearTimeout(timer)
            timeoutSet.delete(timer)
        }

        microAppWindow.addEventListener = function addEventListener(
            type,
            listener,
            options,
        ) {
            if (!windowEventMap.get(type)) {
                windowEventMap.set(type, [])
            }

            windowEventMap.get(type)?.push({ listener, options })
            return originalWindowAddEventListener.call(originalWindow, type, listener, options)
        }

        microAppWindow.removeEventListener = function removeEventListener(
            type,
            listener,
            options,
        ) {
            const arr = windowEventMap.get(type) || []
            for (let i = 0, len = arr.length; i < len; i++) {
                if (arr[i].listener === listener) {
                    arr.splice(i, 1)
                    break
                }
            }

            return originalWindowRemoveEventListener.call(originalWindow, type, listener, options)
        }

        microAppWindow.eval = originalEval
        microAppWindow.document = originalDocument
        microAppWindow.originalWindow = originalWindow
        microAppWindow.window = microAppWindow
        microAppWindow.parent = microAppWindow

        // 劫持 window.onxxx 事件
        getEventTypes().forEach(eventType => {
            originalDefineProperty(microAppWindow, `on${eventType}`, {
                configurable: true,
                enumerable: true,
                get() {
                    return onWindowEventMap.get(eventType)
                },
                set(val) {
                    onWindowEventMap.set(eventType, val)
                    originalWindowAddEventListener.call(originalWindow, eventType, val)
                },
            })
        })
    }

    /**
     * 创建 window 代理对象
     */
    createProxyWindow(appName) {
        const descriptorMap = new Map ()
        return new Proxy(this.microAppWindow, {
            get(target, key) {
                if (Reflect.has(target, key)) {
                    return Reflect.get(target, key)
                }
                const result =  originalWindow[key]
                // 全局消息
                // if(key === 'spaGlobalState') {
                //     result.bind(window)
                // }
                // window 原生方法的 this 指向必须绑在 window 上运行，否则会报错 "TypeError: Illegal invocation"
                // e.g: const obj = {}; obj.alert = alert;  obj.alert();
                return (isFunction(result) && needToBindOriginalWindow(result)) ? result.bind(window) : result
            },

            set: (target, key, value) => {

                this.injectKeySet.add(key)
                return Reflect.set(target, key, value)
            },

            has(target, key) {
                return key in target || key in originalWindow
            },

            // Object.keys(window)
            // Object.getOwnPropertyNames(window)
            // Object.getOwnPropertySymbols(window)
            // Reflect.ownKeys(window)
            ownKeys(target) {
                const result = Reflect.ownKeys(target).concat(Reflect.ownKeys(originalWindow))
                return Array.from(new Set(result))
            },

            deleteProperty: (target, key) => {
                this.injectKeySet.delete(key)
                return Reflect.deleteProperty(target, key)
            },

            // Object.getOwnPropertyDescriptor(window, key)
            // Reflect.getOwnPropertyDescriptor(window, key)
            getOwnPropertyDescriptor(target, key) {
                // 为什么不使用 Reflect.getOwnPropertyDescriptor() 
                // https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Reflect/getOwnPropertyDescriptor
                if (Reflect.has(target, key)) {
                    // 这里的作用是保证在获取（Object.getOwnPropertyDescriptor）和设置（Object.defineProperty）一个 key 的 descriptor 时，都操作的是同一个对象
                    // 即都操作 proxyWindow 或 originalWindow，否则会报错 
                    descriptorMap.set(key, 'target')
                    return Object.getOwnPropertyDescriptor(target, key)
                }

                if (Reflect.has(originalWindow, key)) {
                    descriptorMap.set(key, 'originalWindow')
                    return Object.getOwnPropertyDescriptor(originalWindow, key)
                }
            },

            // Object.defineProperty(window, key, Descriptor)
            defineProperty: (target, key, value) => {

                if (descriptorMap.get(key) === 'target') {
                    return Reflect.defineProperty(target, key, value)
                }

                return Reflect.defineProperty(originalWindow, key, value)
            },

            // 返回真正的 window 原型
            getPrototypeOf() {
                return Reflect.getPrototypeOf(originalWindow)
            },
        })
    }
}

// 构造函数、类、或使用 call() bind() apply() 绑定了作用域的函数都需要绑定到原始 window 上
export function needToBindOriginalWindow(fn) {
    if (
        fn.toString().startsWith('class')
        || isBoundFunction(fn)
        || (/^[A-Z][\w_]+$/.test(fn.name) && fn.prototype?.constructor === fn)
    ) {
        return false
    }

    return true
}

export function isBoundFunction(fn) {
    return fn?.name?.startsWith('bound ')
}