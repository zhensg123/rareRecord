
const originalPushState = history.pushState
const originalReplaceState = history.replaceState

export default function overwriteApiAndSubscribeEvent(clalback) {
    history.pushState = function (state, title, url) {
        const result = originalPushState.call(history, state, title, url)
        clalback && clalback()
        return result
    }
    
    history.replaceState = function (state, title, url) {
        const result = originalReplaceState.call(history, state, title, url)
        clalback && clalback()
        return result
    }
    
    window.addEventListener('popstate', () => {
      clalback && clalback()
    }, true)
    
    window.addEventListener('hashchange', () => {
        clalback && clalback()
    }, true)
}
