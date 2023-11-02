<template>
  <div ref="container" class="infinite-list-container">
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
      default: 50,
    },
    aboveCount: {
      type: Number,
      default: 3,
    },
    belowCount: {
      type: Number,
      default: 3,
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
    visibleCount() {
      return Math.ceil(this.screenHeight / this.itemSize);
    },
    visibleData() {
      return this._listData.slice(this.start, this.end);
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
    updateItemsSize() {
      return new Promise((resolve) => {
        this.$nextTick(() => {
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
      });
    },
    sumHeight(start = 0, end = 100) {
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
    resetWheelOffset() {
      // 因为真实高度更新可能会滞后
      this.wheelOffset = Math.min(
        this.wheelOffset,
        this.listHeight - this.containerOffsetHeight
      );
    },
    transferOffset(to = "handle") {
      const { $container, $slider } = this.$element;
      const contentSpace = this.listHeight - $container.offsetHeight;
      const handleSpace = $slider.offsetHeight - this.handleHeight;
      const assistRatio = handleSpace / contentSpace; // 小于1
      const _this = this;
      const computedOffset = {
        handle() {
          return _this.wheelOffset * assistRatio;
        },
        content() {
          return _this.handleOffset / assistRatio;
        },
      };
      return computedOffset[to]();
    },
    updateRenderIndex(by = "content") {
      console.log(this.wheelOffset, 'dedede')
      const headIndex = this.findOffsetIndex(this.wheelOffset);
      const footerIndex = this.findOffsetIndex(
        this.wheelOffset + this.screenHeight
      );
      this.start = Math.max(headIndex - this.aboveCount, 0);
      this.end = Math.min(footerIndex + this.belowCount, this._listData.length);

      this.updateItemsSize().then(() => {
        if (by === "content") {
          this.handleOffset = this.transferOffset();
          this.resetWheelOffset();
        }

        this.contentOffset = this.wheelOffset - this.sumHeight(0, this.start);
      });
    },
    // 为盒子绑定事件 监听滚轮距离或鼠标滚动距离
    bindContainerEvent() {
      const { $container } = this.$element;
      this.containerOffsetHeight = $container.offsetHeight;
      this.wheelOffset = 0;
      const bindContainerOffset = (event) => {
        event.preventDefault();

        this.wheelOffset += -event.wheelDeltaY;
        this.wheelOffset = Math.max(this.wheelOffset, 0);
        this.wheelOffset = Math.min(
          this.wheelOffset,
          this.listHeight - this.containerOffsetHeight
        );

         // 节流
         if (this.settimebind) {
          return
        }
        this.settimebind = setTimeout(() => {
          this.settimebind = null
          this.updateRenderIndex()
        }, 20)
        // this.updateRenderIndex();
      };
      $container.addEventListener("wheel", bindContainerOffset);
      this.unbindContainerEvent = () => {
        $container.removeEventListener("wheel", bindContainerOffset);
      };
    },
    bindHandleEvent() {
      const { $slider, $handle } = this.$element;
      $handle.onmousedown = (e) => {
        const startY = e.clientY;
        const startTop = this.handleOffset;
        window.onmousemove = (e) => {
          const deltaX = e.clientY - startY;
          this.handleOffset =
            startTop + deltaX < 0
              ? 0
              : Math.min(
                  startTop + deltaX,
                  $slider.offsetHeight - this.handleHeight
                );
          this.wheelOffset = this.transferOffset("content");
          this.updateRenderIndex("handle");
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
      this.bindHandleEvent();
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
    this.$nextTick(() => {
      this.saveHtmlElementById();
    });
  },
  mounted() {
    this.screenHeight = this.$el.clientHeight;
    this.start = 0;
    this.end = this.start + this.visibleCount;
    this.wheelOffset = 15449
    this.updateRenderIndex()
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
  // margin-top: 20px;
  padding-top: 20px;
}
</style>
  