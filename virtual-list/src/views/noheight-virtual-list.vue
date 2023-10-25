<template>
  <div class="render-show">
    <div>
      <NoHasVirtualList :listData="data">
        <template slot-scope="{ item }">
          <codemirror
            class="unit"
            v-model="item.data"
            :options="cmOptions"
          ></codemirror>
        </template>
      </NoHasVirtualList>
    </div>
  </div>
</template>
  
  <script>
import NoHasVirtualList from "./components/NoHasVirtualList";
import { codemirror } from "vue-codemirror";

import "codemirror/mode/javascript/javascript.js";
import 'codemirror/lib/codemirror.css'
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
for (let i = 0; i < 500; i++) {
  const length = generateRandomNumber();
  d.push({
    data: generateString(length),
    index: i,
  });
}
console.log(d, 'ddd')
export default {
  name: "NoHasVirtualList-test",
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
      }
    };
  },
  components: {
    NoHasVirtualList,
    codemirror,
  }
};
</script>
  
    <style>
.render-show {
  justify-content: center;
  height: 100%;
}
.render-show > div {
  width: 800px;
  height: 100%;
  height: 400px;
}

.render-list-item {
  color: #555;
  box-sizing: border-box;
  border-bottom: 1px solid #999;
  box-sizing: border-box;
}
.unit {
  word-break: break-all;
  padding: 0 20px;
  background-color: #fff;
}
.unit + .unit {
  margin-top: 20px;
}
</style>
  