import loadApps  from './loadApps'

const originalPushState = history.pushState
const originalReplaceState = history.replaceState

export default function overwriteApiAndSubscribeEvent() {
    history.pushState = function (state, title, url) {
        const result = originalPushState.call(history, state, title, url)
        loadApps()
        return result
    }
    
    history.replaceState = function (state, title, url) {
        const result = originalReplaceState.call(history, state, title, url)
        loadApps()
        return result
    }
    
    window.addEventListener('popstate', () => {
      loadApps()
    }, true)
    
    window.addEventListener('hashchange', () => {
        loadApps()
    }, true)
}
