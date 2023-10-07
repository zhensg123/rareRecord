import overwriteApiAndSubscribeEvent from './util/overwriteApiAndSubscribeEvent'
import overwriteHeadAppendChild from './util/overwriteHeadAppendChild'
import {appendScript,appendLink,appendStyle } from './util/appendSonAppResource'
import {unloadLinkAndStyle, unloadScript} from './util/unloadSonAppResource'

export default class MicroFrontendFramework {
  constructor() {
    this.apps = {};
    this.currentApp = null;
  }
  
 getCurrentApp(){
    return this.currentApp
  }
  static start() {
    const instance = new MicroFrontendFramework();
    overwriteApiAndSubscribeEvent(instance.switchApp.bind(instance))
    overwriteHeadAppendChild(instance.getCurrentApp.bind(instance))
    return instance;
  }

  registerApp(name, { activeRule, pageEntry, mountPoint }) {
    this.apps[name] = { activeRule, pageEntry, mountPoint };
  }

  switchApp() {
    const {pathname} = window.location;
      // 查找匹配的子应用
    const appName = Object.keys(this.apps).find(name => pathname.startsWith(this.apps[name].activeRule));
    console.log(appName, 'appNameappNameappName')
    if (appName) {
      const app =  this.apps[appName]
      // 如果找到了匹配的子应用
      if (this.currentApp !== appName) {
        // 如果它不是当前的子应用，那么切换子应用
        if (this.currentApp) {
          this.unloadResources(this.currentApp).then(() => {
            this.loadHtml(app.pageEntry);
            this.currentApp = appName;
          });
        }
        this.loadHtml(app.pageEntry);
        this.currentApp = appName;
      }
      // 如果它是当前的子应用，那么不做任何操作
    } else if (this.currentApp) {
      // 如果没有找到匹配的子应用，但是有当前的子应用，那么卸载当前的子应用
      this.unloadResources(this.currentApp);
      this.currentApp = null;
    }
  }
  unloadResources(name) {
    return new Promise((resolve, reject) => {
      const app = this.apps[name];
      const mountPoint = document.getElementById(app.mountPoint);

      // 清空mountPoint
      mountPoint.innerHTML = '';

      unloadLinkAndStyle(name, 'link')
      unloadLinkAndStyle(name, 'style')
      unloadScript(name, document.head)
      unloadScript(name, document.body)

      resolve();
    })
  }

  loadHtml(url) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.onreadystatechange = function () {
      if (xhr.readyState == 4 && xhr.status == 200) {
        this.loadResources(xhr.responseText);
      }
    }.bind(this);
    xhr.send();
  }

  loadResources(html) {
    let parser = new DOMParser();
    let doc = parser.parseFromString(html, 'text/html');
    let mountPoint = document.getElementById(this.apps[this.currentApp].mountPoint);
    
    // 清空挂载点
    while (mountPoint.firstChild) {
      mountPoint.removeChild(mountPoint.firstChild);
    }


    const fragmentForMountPoint = document.createDocumentFragment();
    const childNodes = Array.from(doc.body.childNodes)
    for (let i = 0, childNode; childNode = childNodes[i++];) {
      if (childNode.tagName !== 'SCRIPT') {
        // cloneNode如果传递给它的参数是 true，它还将递归复制当前节点的所有子孙节点。否则，它只复制当前节点
        fragmentForMountPoint.appendChild(childNode.cloneNode(true));
      }
    }
    mountPoint.appendChild(fragmentForMountPoint);

    appendStyle(doc.head, this.currentApp)
    appendLink(doc.head, this.currentApp)

    appendScript(doc.head, 'head',this.currentApp)
    appendScript(doc.body, 'body',this.currentApp)
  }
}

