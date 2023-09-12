import Dep from './Dep'


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

  export default Observe