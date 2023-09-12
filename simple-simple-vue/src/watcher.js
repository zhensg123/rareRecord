import Dep from './Dep'

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

export default Watcher