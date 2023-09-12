class Store {
    constructor(options) {
      this.state = options.state;
      this.mutations = options.mutations;
      this.actions = options.actions;
    }
  
    commit(type, payload) {
      this.mutations[type](this.state, payload);
    }
  
    dispatch(type, payload) {
      this.actions[type]({ commit: this.commit.bind(this), state: this.state }, payload);
    }
  }

export default Store