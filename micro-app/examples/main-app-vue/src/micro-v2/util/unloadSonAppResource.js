export function unloadScript(name, docTag) {
    // 移除<body>和<head>中的<script>标签
    const bodyElements = Array.from(docTag.querySelectorAll('script[data-app="' + name + '"]'));
    for (let i = 0, script; script= bodyElements[i++];) {
        if (script.parentNode === docTag) {
            docTag.removeChild(script);
        }
    }
}

export function unloadLinkAndStyle(name, type) {
    // 移除<head>中的<style>和link标签
    const headStyleElements = Array.from(document.head.querySelectorAll(`${type}[data-app="${name}"]`));
    for (let i = 0, style; style= headStyleElements[i++];) {
        if (style.parentNode === document.head) {
            document.head.removeChild(style);
        }
    }
}
