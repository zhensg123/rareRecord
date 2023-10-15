import { nextTick } from './util'

/**
 * 给每一条 css 选择符添加对应的子应用作用域
 * 1. a {} -> a[single-spa-name=${appName}] {}
 * 2. a b c {} -> a[single-spa-name=${appName}] b c {}
 * 3. a, b {} -> a[single-spa-name=${appName}], b[single-spa-name=${appName}] {}
 * 4. body {} -> #${子应用挂载容器的 id}[single-spa-name=${appName}] {}
 * 5. @media @supports 特殊处理，其他规则直接返回 cssText
 */
export default function addCSSScope(style, appName) {
    // 等 style 标签挂载到页面上，给子应用的 style 内容添加作用域
    nextTick(() => {
        console.log(style, 'style')

        // 禁止 style 生效
        style.disabled = true
        if (style.sheet?.cssRules) {
            style.textContent = handleCSSRules(style.sheet.cssRules, appName)
        }
        
        // 使 style 生效
        style.disabled = false
    })
}

function handleCSSRules(cssRules, appName) {
    let result = ''
    Array.from(cssRules).forEach(cssRule => {
        result += handleCSSRuleHelper(cssRule, appName)
    })

    return result
}

function handleCSSRuleHelper(cssRule, appName) {
    let result = ''
    const cssText = cssRule.cssText
    const selectorText = cssRule.selectorText
    if (selectorText) {
        result += modifyCSSText(cssRule, appName)
    } else if (cssText.startsWith('@media')) {
        result += `
            @media ${(cssRule).conditionText} { 
                ${handleCSSRules((cssRule).cssRules, appName)} 
            }
        `
    } else if (cssText.startsWith('@supports')) {
        result += `
            @supports ${(cssRule).conditionText} { 
                ${handleCSSRules((cssRule).cssRules, appName)} 
            }
        `
    } else {
        result += cssText
    }

    return result
}

/**
 * 用新的 css 选择符替换原有的选择符
 */
function modifyCSSText(cssRule, appName) {
    const selectorText = (cssRule).selectorText
    return cssRule.cssText.replace(
        selectorText, 
        getNewSelectorText(selectorText, appName),
    )
}

let count = 0
const re = /^(\s|,)?(body|html)\b/g
function getNewSelectorText(selectorText, appName) {
    const arr = selectorText.split(',').map(text => {
        const items = text.trim().split(' ')
        items[0] = `${items[0]}[single-spa-name=${appName}]`
        return items.join(' ')
    })

    // 如果子应用挂载的容器没有 id，则随机生成一个 id
    let id = 0
    if (!id) {
        id = 'single-spa-id-' + count++
    }

    // 将 body html 标签替换为子应用挂载容器的 id
    return arr.join(',').replace(re, `#${id}`)
}
