

import overwriteApiAndSubscribeEvent from './overwriteApiAndSubscribeEvent'

export default class MicroFrontendFramework {
  constructor() {
    this.apps = {};
    this.currentApp = null;
  }

  static start() {
    const instance = new MicroFrontendFramework();
    overwriteApiAndSubscribeEvent(instance.switchApp.bind(instance))
    return instance;
  }

  registerApp(name, { path, htmlUrl }) {
    this.apps[name] = { path, htmlUrl };
  }

  switchApp() {
    const { hash, pathname } = window.location;
    const location = hash ? hash.slice(1) : pathname;
    for (let name in this.apps) {
      const app = this.apps[name];
      if (location.startsWith(app.path)) {
        if (this.currentApp) {
          this.unloadResources(this.currentApp);
        }
        this.loadHtml(app.htmlUrl);
        this.currentApp = name;
      }
    }
  }

  unloadResources(name) {
    const app = this.apps[name];
    const head = document.head;
    const body = document.body;
    const appDiv = document.getElementById('app');

    // 清空appDiv
    appDiv.innerHTML = '';

    // 移除<head>中的<link>和<style>标签
    Array.from(head.getElementsByTagName('link')).forEach(link => {
      if (link.dataset.app === name) {
        head.removeChild(link);
      }
    });
    Array.from(head.getElementsByTagName('style')).forEach(style => {
      if (style.dataset.app === name) {
        head.removeChild(style);
      }
    });

    // 移除<body>中的<script>标签
    Array.from(body.getElementsByTagName('script')).forEach(script => {
      if (script.dataset.app === name) {
        body.removeChild(script);
      }
    });
  }

  loadHtml(url) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.onreadystatechange = function() {
      if (xhr.readyState == 4 && xhr.status == 200) {
        this.loadResources(xhr.responseText);
      }
    }.bind(this);
    xhr.send();
  }

  loadResources(html) {
    var parser = new DOMParser();
    var doc = parser.parseFromString(html, 'text/html');
    var links = doc.head.getElementsByTagName('link');
    var styles = doc.head.getElementsByTagName('style');
    var scripts = doc.body.getElementsByTagName('script');
    var head = document.head;
    var body = document.body;
    var appDiv = document.getElementById('app');

    // 插入<link>标签
    for (let link of links) {
      link.dataset.app = this.currentApp;
      head.appendChild(link);
    }

    // 插入<style>标签
    for (let style of styles) {
      style.dataset.app = this.currentApp;
      head.appendChild(style);
    }

    // 插入<body>标签内除了<script>标签外的所有内容
    for (let child of Array.from(doc.body.childNodes)) {
      if (child.tagName !== 'SCRIPT') {
        appDiv.appendChild(child);
      }
    }

    // 插入<script>标签
    for (let script of scripts) {
      var newScript = document.createElement('script');
      if (script.src) {
        newScript.src = script.src;
      } else {
        newScript.textContent = script.textContent;
      }
      newScript.dataset.app = this.currentApp;
      body.appendChild(newScript);
    }
  }
}

