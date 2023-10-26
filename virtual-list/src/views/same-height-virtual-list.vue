<template>
  <div class="same-height">
    <SameHeightvirtualList :listData="data" :itemSize="50">
      <template slot-scope="{ item }">
        <div :style="{ height: item.height + 'px' }">{{ item.value }}</div>
      </template>
    </SameHeightvirtualList>
  </div>
</template>

<script>
// 最理想的虚拟列表
// 渲染逻辑
// 滚动逻辑
import SameHeightvirtualList from "./components/SameHeightvirtualList";
const d = [];
for (let i = 0; i < 1000; i++) {
  d.push({ height: 50, value: i });
}

export default {
  data() {
    return {
      data: d,
    };
  },
  components: {
    SameHeightvirtualList,
  },
};
</script>
<style lang="scss" scoped>
.same-height {
  width: 400px;
}
</style>


