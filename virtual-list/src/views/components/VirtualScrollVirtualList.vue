<template>
  <div
    ref="container"
    class="infinite-list-container"
    @scroll="scrollEvent($event)"
  >
    <!-- 占位div -->
    <!-- <div
        class="infinite-list-phantom"
        :style="{ height: listHeight + 'px' }"
      ></div> -->

    <div :style="{ transform: contentTransform }" class="infinite-list">
      <div
        ref="items"
        class="infinite-list-item-container"
        :id="row._key"
        :key="row._key"
        v-for="row in visibleData"
      >
        <div class="infinite-item">
          <slot :item="row.value" :index="row._key"></slot>
        </div>
      </div>
    </div>
    <div class="infinite-slider" ref="slider">
      <div
        class="infinite-handle"
        :style="{ transform: handleTransform, height: handleStyleHeight }"
        ref="handle"
      ></div>
    </div>
  </div>
</template>
  
  <script>
const HandleMixHeight = 20;

export default {
  name: "VirtualScrollVirtualList",
  props: {
    // 所有列表数据
    listData: {
      type: Array,
      default: () => [],
    },
    itemSize: {
      type: Number,
      default: 100,
    },
    // 容器高度 100px or 50vh
    height: {
      type: String,
      default: "100%",
    },
  },
  data() {
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
      positions: [],
      handleOffset: 0,
      handleHeight: HandleMixHeight,
      contentOffset: 0,
    };
  },
  computed: {
    _listData() {
      return this.listData.reduce((init, cur, index) => {
        init.push({
          // _转换后的索引_第一项在原列表中的索引_本行包含几列
          _key: index,
          value: cur,
        });
        return init;
      }, []);
    },
    contentTransform() {
      return `translateY(-${this.contentOffset}px)`;
    },
    handleTransform() {
      return `translateY(${this.handleOffset}px)`;
    },
    handleStyleHeight() {
      return `${this.handleHeight}px`;
    },
    // 列表总高度
    listHeight() {
      return this.positions[this.positions.length - 1].bottom;
    },
    anchorPoint() {
      return this.positions.length ? this.positions[this.start] : null;
    },
    visibleCount() {
      return Math.ceil(this.screenHeight / this.itemSize);
    },
    aboveCount() {
      return Math.min(this.start, 3);
    },
    belowCount() {
      return Math.min(this.listData.length - this.end, 3);
    },
    visibleData() {
      const start = this.start;
      const end = this.end;

      return this._listData.slice(start, end);
    },
  },
  methods: {
    // 初始化缓存
    initPositions() {
      this.positions = this._listData.map((d, index) => ({
        index,
        height: this.itemSize,
        top: index * this.itemSize,
        bottom: (index + 1) * this.itemSize,
      }));
    },
    // 获取列表起始索引
    getStartIndex(scrollTop = 0) {
      // 二分法查找
      return this.binarySearch(this.positions, scrollTop);
    },
    // 二分法查找 用于查找开始索引
    binarySearch(list, value) {
      let start = 0;
      let end = list.length - 1;
      let tempIndex = null;

      while (start <= end) {
        const midIndex = parseInt((start + end) / 2);
        const midValue = list[midIndex].bottom;
        if (midValue === value) {
          return midIndex + 1;
        } else if (midValue < value) {
          start = midIndex + 1;
        } else if (midValue > value) {
          if (tempIndex === null || tempIndex > midIndex) {
            tempIndex = midIndex;
          }
          end = end - 1;
        }
      }
      return tempIndex || 0;
    },
    // 修正内容高度
    updateItemsSize() {
      const nodes = this.$refs.items;
      nodes.forEach((node) => {
        // 获取元素自身的属性
        const rect = node.getBoundingClientRect();
        const height = rect.height;
        const index = +node.id;
        const oldHeight = this.positions[index].height;
        const dValue = oldHeight - height;
        // 存在差值
        if (dValue) {
          this.positions[index].bottom = this.positions[index].bottom - dValue;
          this.positions[index].height = height;
          this.positions[index].over = true; // TODO

          for (let k = index + 1; k < this.positions.length; k++) {
            this.positions[k].top = this.positions[k - 1].bottom;
            this.positions[k].bottom = this.positions[k].bottom - dValue;
          }
        }
      });
    },
    updateItemsSizeByPromise() {
      return () => {
        return new Promise((resolve) => {
          const nodes = this.$refs.items;
          nodes.forEach((node) => {
            // 获取元素自身的属性
            const rect = node.getBoundingClientRect();
            const height = rect.height;
            const index = +node.id;
            const oldHeight = this.positions[index].height;
            const dValue = oldHeight - height;
            // 存在差值
            if (dValue) {
              this.positions[index].bottom =
                this.positions[index].bottom - dValue;
              this.positions[index].height = height;
              this.positions[index].over = true; // TODO

              for (let k = index + 1; k < this.positions.length; k++) {
                this.positions[k].top = this.positions[k - 1].bottom;
                this.positions[k].bottom = this.positions[k].bottom - dValue;
              }
            }
          });
          resolve();
        });
      };
    },
    sumHeight(start = 0, end = list.length) {
      let height = 0;
      for (let i = start; i < end; i++) {
        height += this.positions[i].height;
      }

      return height;
    },

    findOffsetIndex(offset) {
      let currentHeight = 0;
      for (let i = 0; i < this.positions.length; i++) {
        const { height } = this.positions[i];
        currentHeight += height;

        if (currentHeight > offset) {
          return i;
        }
      }

      return this.positions.length - 1;
    },
    // 更新偏移量
    setContentOffset() {
      //   this.contentOffset = -this._virtuallyScrollOffset

      if (this._contentOffset < 0) {
        this.contentOffset = -(
          this._contentOffset + this.positions[this.start].bottom
        );
      } else {
        this.contentOffset = 0;
      }
      //   this.contentOffset = this.contentOffset > 0 ? 0 : this.contentOffset;
    },
    updateIndex(offset) {
      const headIndex = this.findOffsetIndex(offset);
      const tailIndex = this.findOffsetIndex(offset + this.screenHeight);
      this.start = Math.max(headIndex - 3, 0);
      this.end = Math.min(tailIndex + 3, this._listData.length);
      this.updateItemsSizeByPromise()().then(() => {
        // this.setContentOffset();

        // const offset = offset;
        // const headIndex = this.findOffsetIndex(offset);
        // const tailIndex = this.findOffsetIndex(offset + this.screenHeight);

        console.log(offset, "this._contentOffset");
        //     if (this._contentOffset < 0) {
        //     this.contentOffset = -(
        //       this._contentOffset + this.positions[this.start].bottom
        //     );
        //   } else {
        //     this.contentOffset = 0;
        //   }
        this.contentOffset = offset - this.sumHeight(0, this.start);
      });
    },
    transferOffset(to = "handle") {
      const { $container, $slider } = this.$element;
      const contentSpace = $container.scrollHeight - $container.offsetHeight;
      const handleSpace = $slider.offsetHeight - this.handleHeight;
      const assistRatio = handleSpace / contentSpace; // 小于1
      const _this = this;
      const computedOffset = {
        handle() {
          return -_this.contentOffset * assistRatio;
        },
        content() {
          return -_this.handleOffset / assistRatio;
        },
      };
      return computedOffset[to]();
    },
    bindContainerEvent() {
      const { $container } = this.$element;
      const contentSpace = this.listHeight - $container.offsetHeight;
      let y = 0;
      //   console.log($container.offsetHeight, this.listHeight)
      const bindContainerOffset = (event) => {
        event.preventDefault();

        y += event.deltaY;
        y = Math.max(y, 0);
        y = Math.min(y, this.listHeight - $container.offsetHeight);
console.log(y, 'dedede')
        this.updateIndex(y);
      };
      $container.addEventListener("wheel", bindContainerOffset);
      //   $container.addEventListener("wheel", updateContentOffset);

      //   $container.addEventListener("wheel", updateHandleOffset);

      this.unbindContainerEvent = () => {
        $container.removeEventListener("wheel", bindContainerOffset);
        $container.removeEventListener("wheel", updateContentOffset);
      };
    },
    bindHandleEvent() {
      const { $slider, $handle } = this.$element;
      const handleSpace = $slider.offsetHeight - this.handleHeight;
      $handle.onmousedown = (e) => {
        const startY = e.clientY;
        const startTop = this.handleOffset;
        window.onmousemove = (e) => {
          const deltaX = e.clientY - startY;
          this.handleOffset =
            startTop + deltaX < 0
              ? 0
              : Math.min(startTop + deltaX, handleSpace);
          this.contentOffset = this.transferOffset("content");
        };

        window.onmouseup = function () {
          window.onmousemove = null;
          window.onmouseup = null;
        };
      };
    },
    saveHtmlElementById() {
      const { container, slider, handle } = this.$refs;
      this.$element = {
        $container: container,
        $slider: slider,
        $handle: handle,
      };
      this.initHandleHeight();
      this.bindContainerEvent();
      //   this.bindHandleEvent()
    },
    initHandleHeight() {
      const { $container, $slider } = this.$element;
      this.handleHeight =
        ($slider.offsetHeight * $container.offsetHeight) / this.listHeight;

      // 最小值为HandleMixHeight
      if (this.handleHeight < HandleMixHeight) {
        this.handleHeight = HandleMixHeight;
      }
    },
  },
  created() {
    this.initPositions();
    this._contentOffset = 0;
    this._virtuallyScrollOffset = 0;
    this.$nextTick(() => {
      this.saveHtmlElementById();
    });
  },
  mounted() {
    this.screenHeight = this.$el.clientHeight;
    console.log(this.screenHeight, "this.screenHeight");
    this.start = 0;
    this.end = this.start + this.visibleCount;
  },
};
</script>
  
      <style lang="scss" scoped>
.infinite-slider {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  width: 10px;
  box-sizing: border-box;
  // border-radius: 10px;
  background-color: #6b6b6b;
  -webkit-user-select: none; /* Safari/Chrome */
  -moz-user-select: none; /* Firefox */
  -ms-user-select: none; /* Internet Explorer/Edge */
  user-select: none; /* Standard */
  .infinite-handle {
    background-color: #f1f2f3;
    cursor: pointer;
    border-radius: 10px;
    -webkit-user-select: none; /* Safari/Chrome */
    -moz-user-select: none; /* Firefox */
    -ms-user-select: none; /* Internet Explorer/Edge */
    user-select: none; /* Standard */
  }
}

.infinite-list-container {
  overflow: hidden;
  width: 100%;
  position: relative;
  -webkit-overflow-scrolling: touch;
  background-color: #fff;
  height: 100%;
}

.infinite-list {
  left: 0;
  right: 0;
  top: 0;
  position: absolute;
  height: 400px;
  background-color: #fff;
  //   transition: transform 0.2s;
}

.infinite-list-item-container {
  padding: 0 20px;
}
.infinite-list-item-container + .infinite-list-item-container {
  margin-top: 20px;
}
</style>
  