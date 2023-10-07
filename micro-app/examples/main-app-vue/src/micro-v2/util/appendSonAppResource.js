export function appendScript(docTag,type, currentApp) {
    // 插入<head>中的<script>标签
    const fragmentForScript = document.createDocumentFragment();
    const scripts = Array.from(docTag.getElementsByTagName('script'));
    for (let i = 0, script; script = scripts[i++];) {
        let newScript = document.createElement('script');
        if (script.src) {
            newScript.src = script.src;
        } else {
            newScript.textContent = script.textContent;
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