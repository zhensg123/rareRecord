/**
 * Dep保存的是watcher
 */

export class Dep {
    constructor() {
        this.subs = []
    }
    addSub(sub) {
        this.subs.push(sub);
    }
    notify() {
        this.subs.forEach(function (sub) {
            sub.update();
        });
    }
    static target = null
}

export class Observer {
    constructor(data) {
        this.data = data;
        this.walk(data);
    }
    walk(data) {
        Object.keys(data).forEach((key) => {
            this.defineReactive(data, key, data[key]);
        });
    }
    defineReactive(data, key, val) {
        let dep = new Dep();
        Object.defineProperty(data, key, {
            enumerable: true,
            configurable: true,
            get() {
                console.log(Dep.target, 'target22')
                if (Dep.target) {
                    dep.addSub(Dep.target);
                }
                return val;
            },
            set(newVal) {
                if (newVal === val) {
                    return;
                }
                val = newVal;
                dep.notify();
            }
        });
    }
}

export function observe(value, vm) {
    if (!value || typeof value !== 'object') {
        return;
    }
    return new Observer(value);
};