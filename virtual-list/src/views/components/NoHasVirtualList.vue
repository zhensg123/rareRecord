<template>
    <div ref="list" class="infinite-list-container" @scroll="scrollEvent($event)">
      <!-- 占位div -->
      <div
        class="infinite-list-phantom"
        :style="{ height: listHeight + 'px' }"
      ></div>
  
      <div
        :style="{ transform: contentTransform }"
        class="infinite-list"
      >
        <div
          ref="items"
          class="infinite-list-item-container"
          :id="row._key"
          :key="row._key"
          v-for="row in visibleData"
        >
          <div class="infinite-item">
            <slot :item="row.value"></slot>
          </div>
        </div>
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
    itemSize: {
      type: Number,
      default: 100
    },
    // 容器高度 100px or 50vh
    height: {
      type: String,
      default: '100%'
    }
  },
  data () {
    return {
      // 可视区域高度
      screenHeight: 0,
      // 起始索引
      start: 0,
      // 结束索引
      end: 0,
  
      // 其实索引偏移量
      startOffset: 0,
  
      // 缓存位置数组
      positions: []
    }
  },
  computed: {
    _listData () {
      return this.listData.reduce((init, cur, index) => {
        init.push({
          // _转换后的索引_第一项在原列表中的索引_本行包含几列
          _key: index,
          value: cur
        })
        return init
      }, [])
    },
    // 列表总高度
    listHeight () {
      return this.positions[this.positions.length - 1].bottom
    },
    // 偏移量对应的style
    contentTransform () {
      return `translateY(${this.startOffset}px)`
    },
    anchorPoint () {
      return this.positions.length ? this.positions[this.start] : null
    },
    visibleCount () {
      return Math.ceil(this.screenHeight / this.itemSize)
    },
    aboveCount () {
      return Math.min(this.start, 2)
    },
    belowCount () {
      return Math.min(this.listData.length - this.end, 2)
    },
    visibleData () {
      const start = this.start - this.aboveCount
      const end = this.end + this.belowCount
      return this._listData.slice(start, end)
    }
  },
  created () {
    this.initPositions()
  },
  mounted () {
    this.screenHeight = this.$el.clientHeight
    this.start = 0
    this.end = this.start + this.visibleCount
  },
  updated () {
    this.$nextTick(() => {
      // 获取真实元素大小，修改对应的尺寸缓存
      this.updateItemsSize()
      // 更新真实偏移量
      this.setStartOffset()
    })
  },
  methods: {
    // 初始化缓存
    initPositions () {
      this.positions = this._listData.map((d, index) => ({
        index,
        height: this.itemSize,
        top: index * this.itemSize,
        bottom: (index + 1) * this.itemSize
      }))
    },
    // 获取列表起始索引
    getStartIndex (scrollTop = 0) {
      // 二分法查找
      return this.binarySearch(this.positions, scrollTop)
    },
    // 二分法查找 用于查找开始索引
    binarySearch (list, value) {
      let start = 0
      let end = list.length - 1
      let tempIndex = null
  
      while (start <= end) {
        const midIndex = parseInt((start + end) / 2)
        const midValue = list[midIndex].bottom
        if (midValue === value) {
          return midIndex + 1
        } else if (midValue < value) {
          start = midIndex + 1
        } else if (midValue > value) {
          if (tempIndex === null || tempIndex > midIndex) {
            tempIndex = midIndex
          }
          end = end - 1
        }
      }
      return tempIndex
    },
    // 修正内容高度
    updateItemsSize () {
      const nodes = this.$refs.items
      nodes.forEach((node) => {
        // 获取元素自身的属性
        const rect = node.getBoundingClientRect()
        const height = rect.height
        const index = +node.id
        const oldHeight = this.positions[index].height
        const dValue = oldHeight - height
        // 存在差值
        if (dValue) {
          this.positions[index].bottom = this.positions[index].bottom - dValue
          this.positions[index].height = height
          this.positions[index].over = true // TODO
  
          for (let k = index + 1; k < this.positions.length; k++) {
            this.positions[k].top = this.positions[k - 1].bottom
            this.positions[k].bottom = this.positions[k].bottom - dValue
          }
        }
      })
    },
    // 更新偏移量
    setStartOffset () {
      if (this.start >= 1) {
        const size =
            this.positions[this.start].top -
            (this.positions[this.start - this.aboveCount]
              ? this.positions[this.start - this.aboveCount].top
              : 0)
        this.startOffset = this.positions[this.start - 1].bottom - size
      } else {
        this.startOffset = 0
      }
    },
    // 滚动事件
    scrollEvent () {
      // 当前滚动位置
      const scrollTop = this.$refs.list.scrollTop
      // 更新滚动状态
      // 排除不需要计算的情况
      if (
        scrollTop > this.anchorPoint.bottom ||
          scrollTop < this.anchorPoint.top
      ) {
        // 此时的开始索引
        this.start = this.getStartIndex(scrollTop)
        // 此时的结束索引
        this.end = this.start + this.visibleCount
        // 更新偏移量
        this.setStartOffset()
      }
    }
  }
  }
  </script>
  
      <style scoped>
  .infinite-list-parent {
    margin-left: 300px;
    height: 100%;
  }
  
  .infinite-list-container {
    overflow-x: hidden;
    width: 100%;
    overflow-y: auto;
    position: relative;
    -webkit-overflow-scrolling: touch;
    background-color: #fff;
    height: 100%;
  }
  
  .infinite-list-phantom {
    position: absolute;
    left: 0;
    top: 0;
    right: 0;
    z-index: -1;
  }
  
  .infinite-list {
    left: 0;
    right: 0;
    top: 0;
    z-index: 1;
    position: absolute;
    height: 400px;
    background-color: #fff;
  }
  
  .infinite-list-item-container {
    padding: 0 20px;
  }
  .infinite-list-item-container + .infinite-list-item-container {
    margin-top: 20px;
  }
  </style>
  