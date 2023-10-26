<template>
    <div ref="list" class="render-list-container" @scroll="scrollEvent($event)">
      <div
        class="render-list-phantom"
        :style="{ height: listHeight + 'px' }"
      ></div>
      <div class="render-list" :style="{ transform: getTransform }">
        <template v-for="item in visibleData">
          <slot :type="item.type" :index="item.id"></slot>
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
    // 缓冲区数量
    bufferScale: {
      type: Number,
      default: 3
    }

  },
  computed: {
    aboveCount () {
      // const preNum = this.start - this.bufferScale
      return Math.min(this.start, this.bufferScale)
    },
    belowCount () {
      return Math.min(this.listData.length - this.end, this.bufferScale)
    },
    // 列表总高度
    listHeight () {
      return this.listData.reduce((acc, curVal) => {
        return acc + curVal.height
      }, 0)
    },
    // 可显示的列表项数
    visibleCount () {
      let accHeight = 0
      let count = 0
      for (let i = 0; i < this.listData.length; i++) {
        accHeight += this.listData[i].height
        if (accHeight >= this.screenHeight) {
          count++
          break
        }
        count++
      }
      return count
    },
    // 偏移量对应的style
    getTransform () {
      return `translate3d(0,${this.startOffset}px,0)`
    },
    // 获取真实显示列表数据
    visibleData () {
      // 只是修改了渲染的条数
      const start = this.start - this.aboveCount
      const end = this.end + this.belowCount
      return this.listData.slice(
        start,
        Math.min(end, this.listData.length)
      )
    }
  },
  mounted () {
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
    getStart (scrollTop) {
      let height = 0
      let i = 0
      while (true) {
        const currentItem = this.listData[i].height
        height += currentItem
        if (height >= scrollTop) {
          ++i
          break
        }
        i++
      }

      return i
    },
    scrollEvent () {
      // 当前滚动位置
      const scrollTop = this.$refs.list.scrollTop
      // 此时的开始索引
      this.start = this.getStart(scrollTop)
      // 此时的结束索引
      this.end = this.start + this.visibleCount
      const offsetHeight =
        scrollTop -
        (this.visibleData.reduce((acc, curVal) => {
          return acc + curVal.height
        }, 0) -
          this.screenHeight)
      // 此时的偏移量
      this.startOffset = offsetHeight < 0 ? 0 : offsetHeight
      // if (this.end + 1 >= this.listData.length) {
      //   this.$emit('repeatGetListData', this.listData.length)
      // }
    }
  }
}
</script>

    <style scoped>
  .render-list-container {
    overflow: auto;
    position: relative;
    -webkit-overflow-scrolling: touch;
    height: 200px;
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
