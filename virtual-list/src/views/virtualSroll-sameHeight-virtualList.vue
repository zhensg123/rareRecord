<template>
    <div class="render-show">
      <div>
        <virtualSrollSameHeightVirtualList :listData="data" :itemSize="50">
          <template slot-scope="{ item, height, index }">
            <div class="codemirror-box">
              {{index}}--{{ item.data }}
            </div>
          </template>
        </virtualSrollSameHeightVirtualList>
      </div>
    </div>
  </template>
      
  <script>
  import virtualSrollSameHeightVirtualList from "./components/virtualSrollSameHeightVirtualList";
  import { codemirror } from "vue-codemirror";
  
  import "codemirror/mode/javascript/javascript.js";
  import "codemirror/lib/codemirror.css";
  import "codemirror/theme/monokai.css";
  function generateRandomNumber() {
    const min = 1;
    const max = 10;
    // 生成随机整数
    const randomNumber = Math.floor(Math.random() * (max - min + 1)) + min;
    return randomNumber;
  }
  function getRandomLetter() {
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const randomIndex = Math.floor(Math.random() * letters.length);
    const randomLetter = letters.charAt(randomIndex);
    return randomLetter;
  }
  function generateString(length) {
    const minLength = 1;
    const maxLength = 20;
  
    // 确保长度在最小和最大范围内
    if (length < minLength) {
      length = minLength;
    } else if (length > maxLength) {
      length = maxLength;
    }
  
    // 生成字符串
    const string = getRandomLetter().repeat(length);
  
    return string;
  }
  const d = [];
  for (let i = 0; i < 300; i++) {
    const length = generateRandomNumber();
    d.push({
      data: generateString(length),
      index: i,
      height: 50
    });
  }
  console.log(d, "ddd");
  export default {
    name: "VirtualScrollVirtualList-test",
    data() {
      return {
        data: d,
        cmOptions: {
          // codemirror options
          tabSize: 4,
          mode: "text/javascript",
          theme: "monokai",
          lineNumbers: true,
          line: true,
          lineWrapping: true, // 是否应滚动或换行以显示长行
        },
      };
    },
    components: {
      virtualSrollSameHeightVirtualList,
      codemirror,
    },
  };
  </script>
      
  <style lang="scss" scoped>
  .render-show {
    height: 100%;
  }
  
  .render-show > div {
    width: 800px;
    height: 100%;
    height: 400px;
  }
  
  .codemirror-box {
    background: yellow;
  }
  // .codemirror-box:nth-child(even) {
  //   background: blue;
  // }
  
  // .unit {
  //   word-break: break-all;
  //   padding: 0 20px;
  //   background-color: #fff;
  // }
  </style>
      <style>
  .vue-codemirror.unit .CodeMirror {
    height: auto !important;
    min-height: 50px;
    overflow: hidden;
  }
  </style>