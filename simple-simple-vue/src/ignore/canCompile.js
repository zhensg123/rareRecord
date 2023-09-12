

class Compile {
    constructor(vm) {
      this.vm = vm
  
      this.vm.el = document.querySelector(vm.el);
      this.compile();
    }
  
    compile() {
      const documentFragment = this.nodeToFragment(this.vm.el)
  
      this.replaceData(documentFragment);
      this.vm.el.appendChild(documentFragment);
    }
  
  
    nodeToFragment(el) {
      let fragment = document.createDocumentFragment();
      let child = el.firstChild;
      while (child) {
        // 将Dom元素移入fragment中
        fragment.appendChild(child);
        child = el.firstChild
      }
      return fragment;
    }
    replaceData(frag) {
      Array.from(frag.childNodes).forEach(node => {
        let txt = node.textContent;
        let reg = /\{\{(.*?)\}\}/g;
  
        if (node.nodeType === 3 && reg.test(txt)) {
          let replaceTxt = () => {
            node.textContent = txt.replace(reg, (matched, placeholder) => {
              // new Watcher(vm, placeholder, replaceTxt);
              return placeholder.split('.').reduce((val, key) => {
                return val[key];
              }, this.vm.data);
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
  class SSvue {
    constructor(options) {
      const { data, methods, el } = options
      this.data = data;
      this.methods = methods;
      this.el = el
      // 创建编译模板以及编译赋值
      new Compile(this);
  
      // 执行声明周期函数
    }
  }
  
  setTimeout(() => {
    new SSvue({
      el: '#app',
      data: {
        name: 'canf1oo'
      },
      methods: {
        clickMe() {
          console.log('3333333', this)
          this.data.name = 'click me'
        }
      }
    });
  }, 1000)