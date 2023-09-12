
import Watcher from "./watcher";
class Compile {
    constructor(vm) {
      this.vm = vm
      // 兼容处理组件
      this.vm.el = this.handleTemplate(vm)
      this.compile();
      this.vm._callHook('created');
  
    }
    handleTemplate(vm){
      if(vm.el && typeof vm.el === 'string') {
        return document.querySelector(vm.el)
      }
      const div = document.createElement('div')
      div.innerHTML = vm.template
      return div.firstChild
    }
    compile() {
      this.replaceData(this.vm.el);
  
      const documentFragment = this.nodeToFragment(this.vm.el)
  
      this.vm.el.appendChild(documentFragment);
    }
  
    nodeToFragment(el) {
      let fragment = document.createDocumentFragment();
      let child;
      while (child = el.firstChild) {
        // 将Dom元素移入fragment中
        fragment.appendChild(child);
      }
      return fragment;
    }
  
    replaceData(frag) {
      Array.from(frag.childNodes).forEach(node => {
        let txt = node.textContent;
        let reg = /\{\{(.*?)\}\}/g;
  
        if (this.isTextNode(node) && reg.test(txt)) {
          let replaceTxt = () => {
            node.textContent = txt.replace(reg, (matched, placeholder) => {
              let key = placeholder.split('|')[0].trim();
              let filter = placeholder.split('|')[1];
              if (filter) {
                let filterFunc = this.vm.filters[filter.trim()];
                if (filterFunc) {
                  new Watcher(this.vm, key, replaceTxt);
                  return filterFunc.call(this.vm, key.split('.').reduce((val, k) => {
                    return val[k];
                  }, this.vm));
                }
              } else {
                new Watcher(this.vm, placeholder, replaceTxt);
                return placeholder.split('.').reduce((val, key) => {
                  return val[key];
                }, this.vm);
              }
            });
          };
          replaceTxt();
        }
  
        if (this.isElementNode(node)) {
          Array.from(node.attributes).forEach(attr => {
            if (attr.name.startsWith('@')) {
              const eventName = attr.name.slice(1);
              const methodName = attr.value;
              if (methodName in this.vm.methods) {
                node.addEventListener(eventName, this.vm.methods[methodName].bind(this.vm));
              }
            }
          });
          let nodeName = node.nodeName.toLowerCase();
          if (this.vm.components && this.vm.components[nodeName]) {
            let ComponentConstructor = this.vm.components[nodeName];
            let component = new ComponentConstructor();
            console.log(node, node.parentNode, 'DE')
            node.parentNode.replaceChild(component.el, node);
          }
          if (node.childNodes && node.childNodes.length) {
            this.replaceData(node);        
          }
        }
      });
    }
    // 元素节点
    isElementNode(node) {
      return node.nodeType == 1
    }
    // 文本节点
    isTextNode(node) {
      return node.nodeType == 3
    }
  }


  export default Compile