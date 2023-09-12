
import SSvue from "./SSvue";
import Store from "./Store";

  let MyComponent = SSvue.extend({
    template: '<div>这是一个组件{{message}}</div>',
    data:{
      message: 'Hello, Component!'
    }
    // ...
  })
  let store = new Store({
    state: {
      count: 0
    },
    mutations: {
      increment(state) {
        state.count++;
      }
    },
    actions: {
      increment(context) {
        context.commit('increment');
      }
    }
  });


  new SSvue({
    el: '#app',
    store,
    data: {
      name: 'canf1oo'
    },
    components: {
      'my-component': MyComponent
    },
    computed: {
      computedName(){
        return  this.name + '我是计算属性'
      }
    },
    filters: {
      addSSvue(val){
        return val + 'SSvue'
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
        this.store.commit('increment');
        this.$plugin()
      }
    },
    beforeCreate() {
      console.log('beforeCreate')
    },
    created() {
      console.log('created')
    },
    mounted() {
      console.log('mounted')
    },
  });
  const MyPlugin = {
    install(vueInstance) {
      // 在这里添加你的插件代码
      // 你可以添加全局方法或属性
      vueInstance.myGlobalMethod = function () {
        console.log('This is a global method');
      }
      // 添加实例方法
      vueInstance.prototype.$plugin = function (methodOptions) {
        // 一些逻辑……
        console.log('我是插件')
      }
    }
  }

  SSvue.use(MyPlugin)
  



