<template>
  <div ref="list" class="render-list-container" @scroll="scrollEvent($event)">
    <!-- 占位div -->
    <div class="render-list-phantom" :style="{ height: listHeight + 'px' }"></div>
    <div class="render-list" :style="{ transform: getTransform }">
      <template
        v-for="item in visibleData"
      >
        <slot :item="item"></slot>
      </template>
    </div>
  </div>
</template>

<script>
export default {
name: 'VirtualList',
props: {
  // 所有列表数据
  listData: {
    type: Array,
    default: () => []
  },
  // 每项高度
  itemSize: {
    type: Number,
    default: 100
  }
},
computed: {
  // 列表总高度
  listHeight () {
    return this.listData.length * this.itemSize
  },
  // 可显示的列表项数
  visibleCount () {
    return Math.ceil(this.screenHeight / this.itemSize)
  },
  // 偏移量对应的style
  getTransform () {
    return `translate3d(0,${this.startOffset}px,0)`
  },
  // 获取真实显示列表数据
  visibleData () {
    return this.listData.slice(this.start, Math.min(this.end, this.listData.length))
  }
},
mounted () {
  // this.$el为组件根元素
  this.screenHeight = this.$el.clientHeight
  this.end = this.start + this.visibleCount
},
data () {
  return {
    // 可视区域高度
    screenHeight: 0,
    // 偏移量
    startOffset: 0,
    // 起始索引
    start: 0,
    // 结束索引
    end: null
  }
},
methods: {
  scrollEvent () {
    // 当前滚动位置
    const scrollTop = this.$refs.list.scrollTop
    // 此时的开始索引
    this.start = Math.floor(scrollTop / this.itemSize)
    // 此时的结束索引
    this.end = this.start + this.visibleCount
    // 此时的偏移量
    this.startOffset = scrollTop - (scrollTop % this.itemSize)
  }
}
}
</script>

<style scoped>
.render-list-container {
  overflow: auto;
  position: relative;
  -webkit-overflow-scrolling: touch;
  height: 300px;
}

.render-list-phantom {
  position: absolute;
  left: 0;
  right: 0;
  z-index: -1;
}

.render-list {
  text-align: center;
}

</style>
