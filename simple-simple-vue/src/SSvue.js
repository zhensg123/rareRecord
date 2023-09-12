import Watcher from "./watcher";
import Observe from "./Observe";
import Compile from "./Compile";


class SSvue {
    constructor(options) {
      this._init(options)
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
    _callHook(lifecycle) {
      this.options[lifecycle] && this.options[lifecycle].call(this);
    }
    _init(options){
      if(!options){
       return
      }
      const { data, methods, el, computed, components, watch, filters, template, store } = options
      this.data = data;
      this.methods = methods;
      this.computed = computed;
      this.watch = watch;
      this.filters = filters;
      this.components =components;
      this.template = template
      this.el = el
      this.store = store
      this.plugins = [];
      this.options = options
      
      Object.keys(this.data).forEach(key => {
        this.proxyKeys(key);
      });
      this.computed && Object.keys(this.computed).forEach(key => {
        Object.defineProperty(this, key, {
          get: () => {
            return this.computed[key].call(this);
          }
        });
      });
      new Observe(this.data)
      this.store && new Observe(this.store.state)
  
      this.initWatch()
      // 创建编译模板以及编译赋值
      this._callHook('beforeCreate');
      new Compile(this);
      this._callHook('mounted')
    }
    static use(plugin) {
      plugin.install(this);
    }
    static extend(options) {
      const Super = this;
      const Sub = (function (){
        return function VueComponent() {
          let instance = new Super(options);
          Object.assign(this, instance);
        }
      })()
      Sub.prototype = Object.create(Super.prototype);
      Sub.prototype.constructor = Sub;
      Sub.options = Object.assign({}, Super.options, options);
      return Sub;
    }
  }

  export default SSvue