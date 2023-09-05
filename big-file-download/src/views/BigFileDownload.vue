<template>
  <div class="big-file-download">
    <el-button @click="startDownloadBigFile" size="small">下载</el-button>
  </div>
</template>
<script>
import axios from "axios";
const LIMIT = 6
export default {
  data() {
    return {
      fileChunkResults: []
    };
  },
  methods: {
    startDownloadBigFile() {
      this.fileChunkResults = []
      this.downloadFile({
        fileChunkSize: 10 * 1024 * 1024
      })
    },
    getFileContentLength() {
      return new Promise((resolve, reject) => {
        axios({
          method: "get",
          url: "http://localhost:3000/file/getFileSize",
          params: {
            fileName: "download.zip",
          },
        }).then((res)=>{
          resolve(res)
        }).catch((err)=>{
          reject(err)
        })
      });
    },
    concatenate(arrays) {
      return arrays.reduce((acc, val) => {
        let tmp = new Uint8Array(acc.length + val.length);
        tmp.set(acc, 0);
        tmp.set(val, acc.length);
        return tmp;
      });
    },
    async downloadFile({ fileChunkSize }) {
      const { data } = await this.getFileContentLength();
      const { fileSize } = data.data;
      this.fileSize = fileSize
      const fileChunkNum = Math.ceil(fileSize / fileChunkSize)

      const requestList = this.generateChunkRequest(fileChunkNum, fileChunkSize)
      this.requestWithLimit(requestList, ()=>{
        const sortedBuffers = this.fileChunkResults.map((item) => new Uint8Array(item.buffer));
        const buffers = this.concatenate(sortedBuffers);
        this.saveAs({ buffers, name: "我的压缩包", mime: "application/zip" });
      })
    },
    requestWithLimit(prmiseQueue, callback = null) {
      // 请求数量记录，默认为 0
      let count = 0;
      // 递归调用，请求接口数据
      const run = () => {
        // 接口每调用一次，记录数加 1
        count++;
        const p = prmiseQueue.shift();
        console.log(p, 'pp')
        p.then((res) => {

          // 接口调用完成，记录数减 1
          count--;
          if (!prmiseQueue.length && !count) {
            // 这里可以对所有接口返回的数据做处理，以便输出
            callback && callback();
          }
          // prmiseQueue 长度不为 0 且记录小于限制的数量时递归调用
          if (prmiseQueue.length && count < LIMIT) {
            run();
          }
        }).catch((err)=>{
          console.log(err)
        })
      };

      // 根据 limit 并发调用
      for (let i = 0; i < Math.min(prmiseQueue.length, LIMIT); i++) {
        run();
      }
    },
    generateChunkRequest(fileChunkNum, fileChunkSize) {
      return [...new Array(fileChunkNum).keys()].map((i)=>{
        let start = i * fileChunkSize;
        let end = i + 1 === fileChunkNum ? this.fileSize - 1 : (i + 1) * fileChunkSize - 1;
        return this.getFileBinaryContent(start, end, i);
      })
    },
    saveAs({ name, buffers, mime = "application/octet-stream" }) {
      console.log(name, buffers, mime)
      const blob = new Blob([buffers], { type: mime });
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.download = name || Math.random();
      a.href = blobUrl;
      a.click();
      URL.revokeObjectURL(blob);
    },
    getFileBinaryContent(start, end, i) {
      return new Promise((resolve, reject) => {
        axios({
          method: "get",
          url: "http://localhost:3000/file/down",
          params: {
            fileName: "download.zip"
          },
          headers: {
            range: `bytes=${start}-${end}`,
          },
          responseType: "arraybuffer",
        })
          .then((res) => {
            this.fileChunkResults.push({
              buffer: res.data,
              index: i
            })
            resolve(res)
          })
          .catch((err) => {
            reject(err);
          });
      });
    },
  }
};
</script>