<template>
  <div
    ref="container"
    class="infinite-list-container"
    @scroll="scrollEvent($event)"
  >
    <div :style="{ transform: contentTransform }" class="infinite-list">
      <div
        ref="items"
        class="infinite-list-item-container"
        :key="row.index"
        :style="{ height: itemSize + 'px' }"
        v-for="row in visibleData"
      >
        <div class="infinite-item">
          <slot :item="row" :index="row.index"></slot>
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
  name: "virtualSrollSameHeightVirtualList",
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
      // 手柄偏移量
      handleOffset: 0,

      // 手柄最小高度
      handleHeight: HandleMixHeight,

      // 内容偏移量
      contentOffset: 0,
    };
  },
  computed: {
    contentTransform() {
      return `translateY(-${this.contentOffset}px)`;
    },
    handleTransform() {
      return `translateY(${this.handleOffset}px)`;
    },
    // 手柄最小高度
    handleStyleHeight() {
      return `${this.handleHeight}px`;
    },
    // 列表总高度
    listHeight() {
      return this.listData.length * this.itemSize;
    },
    // 开始渲染个数
    visibleCount() {
      return Math.ceil(this.screenHeight / this.itemSize);
    },
    // 可视区渲染数据
    visibleData() {
      return this.listData.slice(this.start, this.end);
    },
  },
  methods: {
    // 手柄和内容之间的偏移量转换
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
    sumHeight(start = 0, end = 100) {
      let height = 0;
      for (let i = start; i < end; i++) {
        height += this.listData[i].height;
      }
      return height;
    },
    findOffsetIndex(offset) {
      let currentHeight = 0;
      for (let i = 0; i < this.listData.length; i++) {
        const { height } = this.listData[i];
        currentHeight += height;

        if (currentHeight >= offset) {
          return i;
        }
      }
      return this.listData.length - 1;
    },
    updateRenderIndex(by = "content") {
      const headIndex = this.findOffsetIndex(this.wheelOffset);
      const footerIndex = this.findOffsetIndex(
        this.wheelOffset + this.screenHeight
      );
      // 缓存数据this.aboveCount
      this.start = Math.max(headIndex - this.aboveCount, 0);
      this.end = Math.min(footerIndex + this.belowCount, this.listData.length);
      if (by === "content") {
        this.handleOffset = this.transferOffset();
      }
     
      // 对于真实的滚动条内容区的高度contentHeight = containerHeight + maxScrollTop
      // 对于真实的滚动条滚动多少内容区就向上移动
      // contentMove = curScrollTop
      // this.wheelOffset相当于当下滚动的距离curScrollTop
      // 此处因为渲染内容高度是动态的，所以偏移量也是动态的，需要减去不渲染的那部分内容
      // 内容区的偏移量应该为this.wheelOffset - this.sumHeight(0, this.start)
      console.log(this.wheelOffset,this.sumHeight(0, this.start), this.wheelOffset - this.sumHeight(0, this.start), 'this.sumHeight(0, this.start)' )
      this.$nextTick(()=>{
        this.contentOffset = this.wheelOffset - this.sumHeight(0, this.start);
      })
    },
    // 为盒子绑定事件 监听滚轮距离或鼠标滚动距离
    bindContainerEvent() {
      const { $container } = this.$element;
      const containerOffsetHeight = $container.offsetHeight;
      this.wheelOffset = 0;
      const bindContainerOffset = (event) => {
        event.preventDefault();

        this.wheelOffset += -event.wheelDeltaY;
        this.wheelOffset = Math.max(this.wheelOffset, 0);
        this.wheelOffset = Math.min(
          this.wheelOffset,
          this.listHeight - containerOffsetHeight
        );
        this.updateRenderIndex();
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
    this.$nextTick(() => {
      this.saveHtmlElementById();
    });
  },
  mounted() {
    this.screenHeight = this.$el.clientHeight;
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
  // margin-top: 20px;
  padding-top: 20px;
}
</style>
    