// 1. 定义myAxios函数，接收配置对象，返回Promise对象
export const ajax = function (config) {
    return new Promise((resolve, reject) => {
      // 2. 发起XHR请求，默认请求方法为GET
      const xhr = new XMLHttpRequest()
      xhr.open(config.method || 'GET', config.url)
      xhr.setRequestHeader('Authorization', config.token);
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
   