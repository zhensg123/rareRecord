const originalAppendChild = document.head.appendChild;

import addCSSScope from './addCSSScope'

export default function overwriteHeadAppendChild(callback) {
    // 重写appendChild方法
    document.head.appendChild = function (node) {
        // 如果是style节点，添加自定义属性

        if (node.tagName === 'STYLE') {
            const currentApp = callback && callback()
            console.log(node, 'node')
            addCSSScope(node, currentApp)

            node.dataset.app = currentApp;
        }

        // 调用原始的appendChild方法
        return originalAppendChild.call(this, node);
    };
}
