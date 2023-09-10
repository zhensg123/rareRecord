class Dep {
    constructor() {
      this.subs = [];
    }
  
    addSub(sub) {
      this.subs.push(sub);
    }
  
    notify() {
      this.subs.forEach(sub => sub.update());
    }
  }
  
  class Watcher {
    constructor(vm, exp, fn) {
      this.fn = fn;
      this.vm = vm;
      this.exp = exp;
      Dep.target = this;
      let arr = exp.split('.');
      let val = vm;
      arr.forEach(key => {
        val = val[key];
      });
      Dep.target = null;
    }
  
    update() {
      let arr = this.exp.split('.');
      let val = this.vm;
      arr.forEach(key => {
        val = val[key];
      });
      this.fn(val);
    }
  }
  
  class Observe {
    constructor(data) {
      let dep = new Dep();
      for (let key in data) {
        let val = data[key];
        // 实现数据的多层递归
        observe(val);
        Object.defineProperty(data, key, {
          get() {
            Dep.target && dep.addSub(Dep.target);
            return val;
          },
          set(newVal) {
            if (val === newVal) {
              return;
            }
            val = newVal;
            // 实现新数据的重写
            observe(newVal);
            dep.notify();
          }
        });
      }
    }
  }
  function observe(data) {
    if (!data || typeof data !== 'object') return;
    return new Observe(data);
  }
  class Compile {
    constructor(el, vm) {
      this.vm = vm
      this.el = document.querySelector(el);
      this.compile();
    }
  
    compile() {
      const documentFragment = this.nodeToFragment(this.el)
      this.replaceData(documentFragment);
      this.el.appendChild(documentFragment);
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
  
        if (node.nodeType === 3 && reg.test(txt)) {
          let replaceTxt = () => {
            node.textContent = txt.replace(reg, (matched, placeholder) => {
              console.log(placeholder, 'placeholder')
              new Watcher(this.vm, placeholder, replaceTxt);
              return placeholder.split('.').reduce((val, key) => {
                return val[key];
              }, this.vm);
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
      const { data, methods, el, computed, watch } = options
      this.data = data;
      this.methods = methods;
      this.computed = computed;
      this.watch = watch;
      Object.keys(this.data).forEach(key => {
        this.proxyKeys(key);
      });
      Object.keys(this.computed).forEach(key => {
        Object.defineProperty(this, key, {
          get: () => {
            return this.computed[key].call(this);
          }
        });
      });
      new Observe(this.data)
      this.initWatch()
      // 创建编译模板以及编译赋值
      new Compile(el, this);
  
    }
    initWatch() {
      for (let key in this.watch) {
        new Watcher(this, key, this.watch[key]);
      }
    }
    proxyKeys(key) {
      Object.defineProperty(this, key, {
        enumerable: false,
        configurable: true,
        get: function proxyGetter() {
          return this.data[key];
        },
        set: function proxySetter(newVal) {
          this.data[key] = newVal;
        }
      });
    }
  }
  
  setTimeout(() => {
    new SSvue({
      el: '#app',
      data: {
        name: 'canf1oo'
      },
      computed: {
        computedName(){
          return  this.name + '我是计算属性'
        }
      },
      watch: {
        name(){
          console.log('测试室测试试试')
        },
        computedName(){
          console.log('测试室11测试试试12232323')
        }
      },
      methods: {
        clickMe() {
          console.log('3333333', this.name, this)
          this.name = 'click me'
        }
      }
    });
  }, 1000)