<template>
  <div id="app">
    <nav>
      <router-link to="/same-height-virtual-list">定高统一高度虚拟列表</router-link> |
      <router-link to="/different-height-virtual-list">定高不统一高度虚拟列表</router-link> |

      <router-link to="/noheight-virtual-list">不定高虚拟列表</router-link> |
      <router-link to="/virtual-scroll">虚拟滚动</router-link> 

    </nav>
    <router-view/>
  </div>
</template>

<style lang="scss">
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}

nav {
  padding: 30px;

  a {
    font-weight: bold;
    color: #2c3e50;

    &.router-link-exact-active {
      color: #42b983;
    }
  }
}
</style>
