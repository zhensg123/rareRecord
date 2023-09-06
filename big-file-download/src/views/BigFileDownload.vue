<template>
  <div class="big-file-download">
    <el-button @click="startDownloadBigFile" size="small">分片下载</el-button>
    <el-button @click="resumeDownload">恢复下载</el-button>
    <el-button @click="pauseDownload">暂停下载</el-button>
    <el-button @click="handleDelete">删除资源文件</el-button>
    <el-form label-width="100px" label-position="top">
      <el-form-item label="上传总进度：">
        <el-progress :percentage="fakeUploadPercentage"></el-progress>
      </el-form-item>
    </el-form>
    <el-table :data="fileChunkResults" style="width: 100%">
      <el-table-column prop="index" label="chunk index" width="400">
      </el-table-column>
      <el-table-column prop="size" label="size(Mb)" width="180">
        <template slot-scope="{ row }">
          {{ row.size | transformByte }}
        </template>
      </el-table-column>
      <el-table-column min-width="180" prop="percentage" label="percentage">
        <template slot-scope="{ row }">
          <el-progress :percentage="row.percentage"></el-progress>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>
<script>
import axios from "axios";
const CancelToken = axios.CancelToken;

const LIMIT = 6;
export default {
  data() {
    this.chunkRequestList = [];
    this.downloadedFileList = [];
    return {
      fileChunkResults: [],
      fileSize: 0,
      fakeUploadPercentage: 0,
    };
  },
  computed: {
    uploadPercentage() {
      if (!this.fileChunkResults.length) return 0;
      const loaded = this.fileChunkResults
        .map((item) => item.size * item.percentage)
        .reduce((acc, cur) => acc + cur);
      return parseInt((loaded / this.fileSize).toFixed(2));
    },
  },
  filters: {
    transformByte(val) {
      return Number((val / 1024 / 1024).toFixed(0));
    },
  },
  watch: {
    uploadPercentage(now) {
      if (now > this.fakeUploadPercentage) {
        this.fakeUploadPercentage = now;
      }
    },
  },
  methods: {
    pauseDownload() {
      console.log(this.chunkRequestList, "this.chunkRequestList");
      this.chunkRequestList.forEach(({ cancel }) => cancel());
      this.chunkRequestList = [];
    },
    handleDelete() {},
    resumeDownload() {
      this.downloadFile({
        fileChunkSize: 3 * 1024 * 1024,
      });
    },
    async startDownloadBigFile() {
      this.downloadedFileList = [];
      this.fileChunkResults = [];
      await this.getFileContentLength();
      this.downloadFile({
        fileChunkSize: 1 * 1024 * 1024,
      });
    },
    getFileContentLength() {
      return new Promise((resolve, reject) => {
        axios({
          method: "get",
          url: "http://localhost:3000/file/getFileSize",
          params: {
            fileName: "download.zip",
          },
        })
          .then((res) => {
            const { data } = res.data;
            this.fileSize = data.fileSize;
            resolve(res);
          })
          .catch((err) => {
            reject(err);
          });
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
      const fileChunkNum = Math.ceil(this.fileSize / fileChunkSize);

      const requestList = this.generateChunkRequest(
        fileChunkNum,
        fileChunkSize
      );
      console.log(requestList, 'requestList')
      this.requestWithLimit(requestList, () => {
        const sortedBuffers = this.fileChunkResults
          .sort((a, b) => a.index - b.index)
          .map((item) => new Uint8Array(item.buffer));
        const buffers = this.concatenate(sortedBuffers);
        this.saveAs({ buffers, name: "我的压缩包", mime: "application/zip" });
      });
    },
    requestWithLimit(prmiseQueue, callback = null) {
      // 请求数量记录，默认为 0
      let count = 0;
      // 递归调用，请求接口数据
      const run = () => {
        // 接口每调用一次，记录数加 1
        count++;
        const p = prmiseQueue.shift();
        console.log(p, "pp");
        p().then((res) => {
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
        });
      };

      // 根据 limit 并发调用
      for (let i = 0; i < Math.min(prmiseQueue.length, LIMIT); i++) {
        run();
      }
    },
    generateChunkRequest(fileChunkNum, fileChunkSize) {
      const initFileChunk = [...new Array(fileChunkNum).keys()].map((i) => {
        let start = i * fileChunkSize;
        let end =
          i + 1 === fileChunkNum
            ? this.fileSize - 1
            : (i + 1) * fileChunkSize - 1;

        return {
          range: `bytes=${start}-${end}`,
          size: end - start,
          index: i,
          buffer: null,
          percentage: 0,
        };
      });
      const resumeFlag = this.downloadedFileList.length > 0;

      const filerFileDownload = resumeFlag
        ? Object.values(
            this.downloadedFileList.reduce((acc, cur) => {
              if (
                !acc[cur.index] ||
                cur.percentage > acc[cur.index].percentage
              ) {
                acc[cur.index] = cur;
              }
              return acc;
            }, {})
          )
        : [];

      console.log(
        this.fileChunkResults,
        this.downloadedFileList,
        resumeFlag,
        "this.fileChunkResults"
      );
      this.fileChunkResults = resumeFlag
        ? this.fileChunkResults
        : initFileChunk;
      console.log(
        this.fileChunkResults,
        filerFileDownload,
        "222this.fileChunkResults"
      );

      return this.fileChunkResults
        .filter((item) =>{
          if(item.percentage !== 100) {
            return true
          }
          return false
        })
        .map((item)=>{
          const filterFile = filerFileDownload.find(({index})=> index === item.index)
          const end = item.range.split('-')[1]
          console.log(filterFile ? filterFile.loaded : '1', end, 'end')
          return filterFile  ? {
             ...item,
             range: `bytes=${filterFile.loaded}-${end}`
          } : item
        })
        .map(({ range, size, index }) =>
          this.getFileBinaryContent(range, size, index)
        );
    },
    saveAs({ name, buffers, mime = "application/octet-stream" }) {
      const blob = new Blob([buffers], { type: mime });
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.download = name || Math.random();
      a.href = blobUrl;
      a.click();
      URL.revokeObjectURL(blob);
    },
    getFileBinaryContent(range, size, index) {
      return () => {
        return new Promise((resolve, reject) => {
          axios({
            method: "get",
            url: "http://localhost:3000/file/down",
            params: {
              fileName: "download.zip",
            },
            headers: {
              range: range,
            },
            onDownloadProgress: (progressEvent) => {
              const loaded = progressEvent.loaded;
              let complete = parseInt((loaded / size) * 100);

              this.downloadedFileList.push({
                index,
                loaded,
                percentage: complete,
              });
              this.fileChunkResults[index].percentage = complete;
            },
            // 用于取消请求
            cancelToken: new CancelToken((cancel) => {
              this.chunkRequestList.push({
                cancelIndex: index,
                cancel,
              });
            }),
            responseType: "arraybuffer",
          })
            .then((res) => {
              this.fileChunkResults[index].buffer = res.data;
              // 去除请求
              if (this.chunkRequestList) {
                const curIndex = this.chunkRequestList.findIndex(
                  ({ cancelIndex }) => cancelIndex === index
                );
                this.chunkRequestList.splice(curIndex, 1);
              }
              // 本地缓存已经下载的切片
              // localStorage.setItem('downloadedFileList', JSON.stringify(this.downloadedFileList))
              resolve(res);
            })
            .catch((err) => {
              reject(err);
            });
        });
      };
    },
  },
};
</script>