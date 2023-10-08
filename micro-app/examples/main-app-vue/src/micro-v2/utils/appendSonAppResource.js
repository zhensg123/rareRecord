// 创建一个虚拟的window对象
import ProxyWindowSandBox from './ProxyWindowSandBox'
export function executeScripts(scripts, currentApp) {
    const proxyWindow = new ProxyWindowSandBox(currentApp).proxyWindow

    try {
        scripts.forEach(code => {
            // ts 使用 with 会报错，所以需要这样包一下
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

function loadScriptSrc(url) {
    return new Promise((resolve) => {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4 && xhr.status == 200) {
                resolve(xhr.responseText)
            }
        }
        xhr.send();
    })
}
// 如果是src浏览器会自定执行代码 从而不能修改script的window 需要异步获取之后再修改
// 将appendScript整体改为异步的  如果没有url直接resolve返回 否则使用接口调用
export function appendScript(docTag, type, currentApp) {
    // 插入<head>中的<script>标签
    // const fragmentForScript = document.createDocumentFragment();
    const scripts = Array.from(docTag.getElementsByTagName('script'));


    let promiseArr = scripts.map((script) => {
        if (script.src) {
            return loadScriptSrc(script.src)
        } else {
            return Promise.resolve(script.textContent)
        }
    })

    Promise.all(promiseArr)
        .then(data => {
            console.log(data, currentApp, 'promiseArrscript')
            executeScripts(data, currentApp)

        })
    // for (let i = 0, script; script = scripts[i++];) {
    //     let newScript = document.createElement('script');
    //     if (script.src) {
    //         newScript.src = script.src;
    //         newScript.onload = () => {
    //             // 创建一个新的函数，将window对象替换为虚拟的window对象
    //             const runScript = new Function('window', newScript.text);
    //             runScript(virtualWindow);
    //         };
    //     } else {
    //         newScript.textContent = script.textContent;
    //         const runScript = new Function('window', script.textContent);
    //         runScript(virtualWindow);
    //     }

    //     newScript.dataset.app = currentApp;
    //     fragmentForScript.appendChild(newScript);
    // }
    // document[type].appendChild(fragmentForScript);
}

export function appendLink(docTag, currentApp) {
    const fragmentForLInk = document.createDocumentFragment();
    const links = Array.from(docTag.getElementsByTagName('link'));
    for (let i = 0, link; link = links[i++];) {
        let newLink = document.createElement('link');
        newLink.rel = link.rel;
        newLink.href = link.href;
        newLink.dataset.app = currentApp;
        fragmentForLInk.appendChild(newLink);
    }
    document.head.appendChild(fragmentForLInk);
}


export function appendStyle(docTag, currentApp) {
    const fragmentForStyle = document.createDocumentFragment();
    const styles = Array.from(docTag.getElementsByTagName('style'));
    for (let i = 0, style; style = styles[i++];) {
        let newStyle = document.createElement('style');
        newStyle.textContent = style.textContent;
        newLink.dataset.app = currentApp;
        fragmentForStyle.appendChild(newStyle);
    }
    document.head.appendChild(fragmentForStyle)
}