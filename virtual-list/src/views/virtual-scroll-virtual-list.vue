<template>
  <div class="render-show">
    <div>
      <VirtualScrollVirtualList :listData="data">
        <template slot-scope="{ item, index }">
          <div class="codemirror-box">
            {{ index
            }}<codemirror
              class="unit"
              v-model="item.data"
              :options="cmOptions"
            ></codemirror>
          </div>
        </template>
      </VirtualScrollVirtualList>
    </div>
  </div>
</template>
    
<script>
import VirtualScrollVirtualList from "./components/VirtualScrollVirtualList";
import { codemirror } from "vue-codemirror";

import "codemirror/mode/javascript/javascript.js";
import "codemirror/lib/codemirror.css";
import "codemirror/theme/monokai.css";
function generateRandomNumber() {
  const min = 100;
  const max = 1000;
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
  const minLength = 100;
  const maxLength = 1000;

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
    VirtualScrollVirtualList,
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