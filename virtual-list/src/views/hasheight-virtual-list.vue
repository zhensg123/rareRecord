<template>
  <div class="render-show">
    <div>
      <VirtualList :listData="data">
         <template slot-scope="{type, index}">
            <component :is="type" :index="index"></component>
         </template>
      </VirtualList>
    </div>
    <!-- <el-button @click="appendData">添加数据</el-button> -->
  </div>
  </template>
  
  <script>
  import VirtualList from './components/VirtualList'
  
  import Height20 from './components/Height20'
  import Height30 from './components/Height30'
  import Height50 from './components/Height50'
  
  const d = []
  for (let i = 0; i < 30; i++) {
    const type = i % 3 === 0 ? i % 2 === 0 ? 'Height30' : 'Height50' : 'Height20'
    d.push({ id: i, value: i, type: type, height: type === 'Height30' ? 30 : type === 'Height20' ? 20 : 50 })
  }
  console.log(d.length, 'd')
  export default {
    name: 'VirtualList-test',
    data () {
      return {
        data: d
      }
    },
    components: {
      VirtualList,
      Height20,
      Height30,
      Height50
    },
    methods: {
      appendData () {
        const d = []
        for (let i = 0; i < 10; i++) {
          const type = i % 3 === 0 ? i % 2 === 0 ? 'Height30' : 'Height50' : 'Height20'
          d.push({ id: i, value: i, type: type, height: type === 'Height30' ? 30 : type === 'Height20' ? 20 : 50 })
        }
        this.data.concat(d)
      }
    }
  }
  </script>
  
  <style>
  
  .render-show {
    display: flex;
    justify-content: center;
  }
  .render-show > div{
    width:500px;
    margin-top:40px;
  }
  .render-list-item {
    color: #555;
    box-sizing: border-box;
    border-bottom: 1px solid #999;
    box-sizing: border-box;
  }
  </style>
  