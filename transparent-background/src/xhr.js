// 1. 定义myAxios函数，接收配置对象，返回Promise对象
export const ajax = function (config) {
    return new Promise((resolve, reject) => {
      // 2. 发起XHR请求，默认请求方法为GET
      const xhr = new XMLHttpRequest()
      xhr.open(config.method || 'GET', config.url)
      xhr.setRequestHeader('Authorization', '2f3e1153a4ef0cc3a96fde17509a8a4b8cd428c5fbf0bf60e7133a1d3ca5a571');
      xhr.setRequestHeader('Content-Type','application/json')

      xhr.responseType = 'blob';   
      xhr.addEventListener('loadend', () => {
        // 3. 调用成功/失败的处理程序
        if (xhr.status >= 200 && xhr.status < 300) {
            resolve(xhr.response)
        //   typeof xhr.response === 'string' ? resolve(JSON.parse(xhr.response)) : resolve(xhr.response)
        } else {
          reject(new Error(xhr.response))
        }
      })
      xhr.send(JSON.stringify(config.data))
    })
  }
   
//   // 4. 使用myAxios函数，获取省份列表展示
//   myAxios({
//     url: '<http://hmajax.itheima.net/api/province>'
//   }).then(result => {
//     console.log(result)
//     document.querySelector('.my-p').innerHTML = result.list.join('<br>')
//   }).catch(error => {
//     console.log(error)
//     document.querySelector('.my-p').innerHTML = error.message
//   })