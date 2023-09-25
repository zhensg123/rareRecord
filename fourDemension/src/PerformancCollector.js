class PerformancCollector {
  constructor() {
      this.FP = 0;
      this.FCP = 0;
      this.LCP = 0;
      this.onload = 0;
      this.DOMContentLoaded = 0;
  }

  collect() {
      let performance = window.performance;

      if (!performance) {
          console.log('你的浏览器不支持 Performance API');
          return;
      }

      let timing = performance.timing;
      let entries = performance.getEntriesByType('paint');

      entries.forEach(entry => {
          if (entry.name === 'first-paint') {
              this.FP = entry.startTime;
          } else if (entry.name === 'first-contentful-paint') {
              this.FCP = entry.startTime;
          }
      });

      let largestContentfulPaintEntry;
      performance.getEntriesByType('largest-contentful-paint').forEach(entry => {
          if (!largestContentfulPaintEntry ||
              entry.startTime > largestContentfulPaintEntry.startTime) {
              largestContentfulPaintEntry = entry;
          }
      });
      if (largestContentfulPaintEntry) {
          this.LCP = largestContentfulPaintEntry.startTime;
      }

      this.onload = timing.loadEventEnd - timing.navigationStart;

  }

  print() {
      console.log('FP:', this.FP);
      console.log('FCP:', this.FCP);
      console.log('LCP:', this.LCP);
      console.log('onload:', this.onload);
  }
}

export default PerformancCollector