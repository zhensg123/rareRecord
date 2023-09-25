class ErrorCollector {
  constructor(fd) {
    this.fd = fd
    this.init();
  }

  init() {
    window.addEventListener('error', (event) => {
      this.fd.xhrReport({
        type: 'JS_ERROR',
        message: event.message,
        source: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error,
        timeStamp: event.timeStamp
      });
    });
  }
}

export default  ErrorCollector
// 你可以通过 errorCollector.getErrors() 来获取收集到的错误