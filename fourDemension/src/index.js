

import BehaviorCollector from  'BehaviorCollector'
import ErrorCollector from  'ErrorCollector'
import PerformancCollector from  'PerformancCollector'

class FourDimension {
    constructor(configs) {
         const defaultConfig = {
            reportUrl: 'default-url',
            projectName: 'default-name'
         }
        this.configs = Object.assign({}, defaultConfig, configs)
        this.init()
    }
      // 初始化
    init() {
      new BehaviorCollector(this).init()
      new ErrorCollector(this).init()
      new PerformancCollector(this).init()
    }

    xhrReport(collectData) {
      const {reportData, reportUrl} = this.generateReportData(collectData)
      var xhr = new XMLHttpRequest();
      xhr.open('POST', reportUrl, true);
      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && (xhr.status === 200 || xhr.status === 201)) {
          // callback(null, xhr.responseText);
        } else if (xhr.readyState === 4) {
          // callback(xhr.status, null);
        }
      };
      xhr.send(JSON.stringify(reportData));
    }
    sendBeaconReport(c = {}){
      const {reportData, reportUrl} = this.generateReportData(collectData)
      navigator.sendBeacon(reportUrl, JSON.stringify(reportData));

    }

    imageReport(collectData = {}){
      const {reportData, reportUrl} = this.generateReportData(collectData)

      // 如果浏览器不支持 sendBeacon，就使用图片打点
      const img = new Image();
      img.src = reportUrl + '?reportData=' + encodeURIComponent(JSON.stringify(reportData));
    }
    generateReportData(collectData){
      const {projectName,reportUrl} = this.configs
      const reportData = {projectName, ...collectData}
      return {
        reportData,
        reportUrl
      }
    }
}