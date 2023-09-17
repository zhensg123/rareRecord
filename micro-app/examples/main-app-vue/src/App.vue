<template>
  <div id="home">
    <ul>
      <li :key="app" @click="gotoSonApp(app)" v-for="app in sonAppList">
        {{ app }}
      </li>
    </ul>
    <router-view></router-view>
  </div>
</template>

<script>
export default {
  name: "home",
  data() {
    return {
     sonAppList: ["/vue", "/react", '/'],
    };
  },
  methods: {
    gotoSonApp(app) {
      this.$router.push(app);
    },
  },
};
</script>

<style>
#home {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  margin-top: 60px;
  display: flex;
  padding-left: 20px;
}
#home > ul {
    width:100px;
  }
  .sonapp-container {
    flex:1;
  }
ul,li {
  margin:0;
  padding: 0;
}
</style>
