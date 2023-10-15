// 创建一个虚拟的window对象
import ProxyWindowSandBox from './ProxyWindowSandBox'
import addCSSScope from './addCSSScope'

export function executeScripts(scripts, currentApp) {
    const proxyWindow = new ProxyWindowSandBox(currentApp).proxyWindow

    try {
        scripts.forEach(code => {
            // 将子应用的 js 代码全局 window 环境指向代理环境 proxyWindow
            const warpCode = `
                ;(function(proxyWindow){
                    with (proxyWindow) {
                        (function(window){${code}\n}).call(proxyWindow, proxyWindow)
                    }
                })(this);
            `

            new Function(warpCode).call(proxyWindow)
        })
    } catch (error) {
        throw error
    }
}
export function executeStyle(styles, currentApp, docTag) {
    const fragmentForScript = document.createDocumentFragment();
    styles.forEach(item => {
        addCSSScope(item, currentApp)
        fragmentForScript.appendChild(item)
    })
    docTag.appendChild(fragmentForLInk);
}


function loadScriptAndStyle(url) {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest()
        xhr.onload = (res) => {
            resolve(res.target.response)
        }

        xhr.onerror = reject
        xhr.onabort = reject
        xhr.open('get', url)
        xhr.send()
    })
}
export function fetchScriptAndExecute(src, currentApp) {
    loadScriptAndStyle(src).then((data) => {
        executeScripts([data], currentApp)
    })
}
export function fetchStyleAndReplaceStyleContent(style, url, currentApp, callback) {
    loadScriptAndStyle(url).then((data) => {
        style.textContent = data
        addCSSScope(style, currentApp)
        callback && callback()
    })

}
// 如果是src浏览器会自定执行代码 从而不能修改script的window 需要异步获取之后再修改
// 将appendScript整体改为异步的  如果没有url直接resolve返回 否则使用接口调用
export function appendScript(docTag, currentApp) {
    // 插入<head>中的<script>标签
    // const fragmentForScript = document.createDocumentFragment();
    const scripts = Array.from(docTag.getElementsByTagName('script'));

    let promiseArr = scripts.map((script) => {
        if (script.src) {
            return loadScriptAndStyle(script.src)
        } else {
            return Promise.resolve(script.textContent)
        }
    })
    promiseArr.length > 0 && Promise.all(promiseArr)
        .then(data => {
            console.log(data, currentApp, 'promiseArrscript')
            executeScripts(data, currentApp)

        })
}

export function appendLink(docTag, currentApp) {
    const links = Array.from(docTag.getElementsByTagName('link'));
    let promiseArr = links.filter((link) => {
        return link.rel === 'stylesheet'
    }).map((link) => {
        return loadScriptAndStyle(link.href)
    })
    promiseArr.length > 0 && Promise.all(promiseArr)
        .then(data => {
            executeStyle(data, currentApp, docTag)
        })
}


export function appendStyle(docTag, currentApp) {
    const fragmentForStyle = document.createDocumentFragment();
    const styles = Array.from(docTag.getElementsByTagName('style'));
    for (let i = 0, style; style = styles[i++];) {
        let newStyle = document.createElement('style');
        newStyle.textContent = style.textContent;
        newStyle.dataset.app = currentApp;
        addCSSScope(newStyle, currentApp)
        fragmentForStyle.appendChild(newStyle);
    }
    document.head.appendChild(fragmentForStyle)
}