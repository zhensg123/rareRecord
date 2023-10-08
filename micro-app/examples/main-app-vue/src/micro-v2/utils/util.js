import { originalWindow } from './originalEnv'

function nextTick(callback) {
    Promise.resolve().then(callback)
}

export function isFunction(fn) {
    return typeof fn === 'function'
}
let currentAppName = null
export function temporarySetCurrentAppName(name) {
    if (currentAppName !== name) {
        currentAppName = name
        // eslint-disable-next-line no-return-assign
        nextTick(() => currentAppName = null)
    }
}

let onEventTypes = []
export function getEventTypes() {
    if (onEventTypes.length) return onEventTypes

    for (const key of Object.keys(originalWindow)) {
        if (typeof key === 'string' && key.startsWith('on')) {
            onEventTypes.push(key.slice(2))
        }
    }

    return onEventTypes
}