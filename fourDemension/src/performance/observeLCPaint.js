import { getPageURL } from '../utils/util'
import { lazyReportCache } from '../utils/report'


function isSupportPerformanceObserver() {
    return !!window.PerformanceObserver
}

export default function observeLCP() {
    if (!isSupportPerformanceObserver()) {
        return
    }
    
    const entryHandler = (list) => {

        if (observer) {
            observer.disconnect()
        }
        
        for (const entry of list.getEntries()) {
            const json = entry.toJSON()
            delete json.duration

            const reportData = {
                ...json,
                target: entry.element?.tagName,
                name: entry.entryType,
                subType: entry.entryType,
                type: 'performance',
                pageURL: getPageURL(),
            }
            
            lazyReportCache(reportData)
        }
    }

    const observer = new PerformanceObserver(entryHandler)
    observer.observe({ type: 'largest-contentful-paint', buffered: true })
}