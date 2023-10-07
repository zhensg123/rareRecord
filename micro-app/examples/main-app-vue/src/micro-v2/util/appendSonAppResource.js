   // 创建一个虚拟的window对象
   const virtualWindow = new Proxy(window, {
    get: (target, key) => {
      return target[key];
    },
    set: (target, key, value) => {
      if (key in window) {
        target[key] = value;
      }
      return true;
    },
  });

export function appendScript(docTag,type, currentApp) {
    // 插入<head>中的<script>标签
    const fragmentForScript = document.createDocumentFragment();
    const scripts = Array.from(docTag.getElementsByTagName('script'));
    for (let i = 0, script; script = scripts[i++];) {
        let newScript = document.createElement('script');
        if (script.src) {
            newScript.src = script.src;
            newScript.onload = () => {
                // 创建一个新的函数，将window对象替换为虚拟的window对象
                const runScript = new Function('window', newScript.text);
                runScript(virtualWindow);
            };
        } else {
            newScript.textContent = script.textContent;
            const runScript = new Function('window', script.textContent);
            runScript(virtualWindow);
        }

        newScript.dataset.app = currentApp;
        fragmentForScript.appendChild(newScript);
    }
    document[type].appendChild(fragmentForScript);
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