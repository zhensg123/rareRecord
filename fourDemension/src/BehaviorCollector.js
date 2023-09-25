class BehaviorCollector {
  constructor(fd) {
    this.fd = fd;
    this.startTime = Date.now();
    this.init();
  }

  init() {
    // 收集 PV 和 UV 数据
    this.fd.xhrReport({
      type: 'PAGE_VIEW',
      url: window.location.href,
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
    });

    // 收集用户点击数据
    document.addEventListener('click', (event) => {
      this.fd.xhrReport({
        type: 'CLICK',
        url: window.location.href,
        timestamp: Date.now(),
        target: event.target.tagName,
      });
    });

    // 收集页面停留时长
    window.addEventListener('beforeunload', () => {
      this.fd.xhrReport({
        type: 'STAY_TIME',
        url: window.location.href,
        timestamp: Date.now(),
        stayTime: Date.now() - this.startTime,
      });
    });
  }
}

export default BehaviorCollector