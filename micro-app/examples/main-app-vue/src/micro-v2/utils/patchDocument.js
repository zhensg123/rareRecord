import { isUniqueElement } from './dom'
import { executeScripts, fetchScriptAndExecute, fetchStyleAndReplaceStyleContent } from './appendSonAppResource'
import { 
    originalAppendChild,
    originalCreateElement,
    originalDocument,
    originalGetElementById, 
    originalGetElementsByClassName, 
    originalGetElementsByName, 
    originalGetElementsByTagName, 
    originalInsertBefore, 
    originalQuerySelector,
    originalQuerySelectorAll, 
} from './originalEnv'
import addCSSScope from './addCSSScope'

export function patchDocument(appName) {
    const container = document.getElementById(appName)
    Element.prototype.appendChild = function appendChild(node) {
        return patchAddChild(this, node, null, 'append')
    }
    
    Element.prototype.insertBefore = function insertBefore(newNode, referenceNode) {
        return patchAddChild(this, newNode, referenceNode, 'insert')
    }

    Document.prototype.createElement = function createElement(
        tagName,
        options,
    ) {
        const element = originalCreateElement.call(this, tagName, options)
        appName && element.setAttribute('single-spa-name', appName)
        return element
    }

    // 将所有查询 dom 的范围限制在子应用挂载的 dom 容器上
    Document.prototype.querySelector = function querySelector(selector) {
        if (!selector || isUniqueElement(selector)) {
            return originalQuerySelector.call(this, selector)
        }
        if(container){
            return container.querySelector(selector)
        }
        return originalQuerySelector.call(this, selector)
    }

    Document.prototype.querySelectorAll = function querySelectorAll(selector) {
        if (!selector || isUniqueElement(selector)) {
            return originalQuerySelectorAll.call(this, selector)
        }

        if(container){
            return container.querySelectorAll(selector)
        }
        return originalQuerySelectorAll.call(this, selector)
    }

    Document.prototype.getElementById = function getElementById(id) {
        return getElementHelper(this, originalGetElementById, 'querySelector', id, `#${id}`, container)
    }

    Document.prototype.getElementsByClassName = function getElementsByClassName(className) {
        return getElementHelper(this, originalGetElementsByClassName, 'getElementsByClassName', className, className, container)
    }

    Document.prototype.getElementsByName = function getElementsByName(elementName) {
        return getElementHelper(this, originalGetElementsByName, 'querySelectorAll', elementName, `[name=${elementName}]`, container)
    }

    Document.prototype.getElementsByTagName = function getElementsByTagName(tagName) {
        return getElementHelper(this, originalGetElementsByTagName, 'getElementsByTagName', tagName, tagName, container)
    }
}

function getElementHelper(
    parent, 
    originFunc, 
    funcName,
    originSelector, 
    newSelector,
    container
) {
    if (!originSelector) {
        return originFunc.call(parent, originSelector)
    }
    if(container){
        return container[funcName](newSelector)
    }
    return document[funcName](newSelector)
}

export function releaseDocument() {
    Document.prototype.createElement = originalCreateElement
    Document.prototype.appendChild = originalAppendChild
    Document.prototype.insertBefore = originalInsertBefore
    Document.prototype.getElementById = originalGetElementById
    Document.prototype.getElementsByClassName = originalGetElementsByClassName
    Document.prototype.getElementsByName = originalGetElementsByName
    Document.prototype.getElementsByTagName = originalGetElementsByTagName
    Document.prototype.querySelector = originalQuerySelector
    Document.prototype.querySelectorAll = originalQuerySelectorAll
}

const head = originalDocument.head
const tags = ['STYLE', 'LINK', 'SCRIPT']
function patchAddChild(parent, child, referenceNode, type) {
    const tagName = child.tagName
    if (!tags.includes(tagName)) {
        return addChild(parent, child, referenceNode, type)
    }
    
    const appName = child.getAttribute('single-spa-name')
    if (!appName) return addChild(parent, child, referenceNode, type)

    // 所有的 style 都放到 head 下
    if (tagName === 'STYLE') {
        addCSSScope(child, appName)
        child.dataset.app = appName;
        return addChild(head, child, referenceNode, type)
    }

    if (tagName === 'SCRIPT') {
        const src = child.src
        if (
            src
        ) {
            fetchScriptAndExecute(src, appName)
            return null
        }

        executeScripts([child.textContent], appName)
        return null
    }

    if ( 
        child.rel === 'stylesheet' 
        && child.href
    ) {
        const href = child.href

        const style = document.createElement('style')
        style.setAttribute('type', 'text/css')

        fetchStyleAndReplaceStyleContent(style, href, appName, ()=>{
            addChild(head, style, referenceNode, type)
        })

        return false
    }

    return addChild(parent, child, referenceNode, type)
}

function addChild(parent, child, referenceNode, type) {
    if (type === 'append') {
        return originalAppendChild.call(parent, child)
    }

    return originalInsertBefore.call(parent, child, referenceNode)
}