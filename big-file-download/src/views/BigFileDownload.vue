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
const FileChunkSize = 2 * 1024 * 1024;
const LIMIT = 6;
export default {
  data() {
    this.chunkRequestList = [];
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
      this.chunkRequestList.forEach(({ cancel }) => cancel());
      this.chunkRequestList = [];
    },
    async handleDelete() {
      await axios({
        method: "get",
        url: "http://localhost:3000/file/delete",
      });
      this.fileSize = 0;
      this.$message.success("删除成功");
    },
    resumeDownload() {
      const requestList = this.fileChunkResults.filter(
        ({ percentage }) => percentage !== 100
      ).map(({ range, size, index }) =>
        this.getFileBinaryContent(range, size, index)
      );
      this.fileSize > 0 && this.downloadFile(requestList);
    },
    async startDownloadBigFile() {
      this.fileChunkResults = [];
      const { data, message } = await this.getFileContentLength();
      if (!data) {
        return this.$message.warning(message);
      }
      this.fileSize = data.fileSize;
      const fileChunkNum = Math.ceil(this.fileSize / FileChunkSize);
      const requestList = this.generateChunkRequest(fileChunkNum);
      this.downloadFile(requestList);
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
            resolve(res.data);
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
    async downloadFile(requestList) {
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
        p()
          .then((res) => {
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
          })
          .catch((err) => {});
      };

      // 根据 limit 并发调用
      for (let i = 0; i < Math.min(prmiseQueue.length, LIMIT); i++) {
        run();
      }
    },
    generateChunkRequest(fileChunkNum) {
      this.fileChunkResults = [...new Array(fileChunkNum).keys()].map((i) => {
        let start = i * FileChunkSize;
        let end =
          i + 1 === fileChunkNum
            ? this.fileSize - 1
            : (i + 1) * FileChunkSize - 1;

        return {
          range: `bytes=${start}-${end}`,
          size: end - start,
          index: i,
          buffer: null,
          percentage: 0,
        };
      });

      return this.fileChunkResults.map(({ range, size, index }) =>
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
          // const loadedPercentage = this.fileChunkResults[index].percentage
          axios({
            method: "get",
            url: "http://localhost:3000/file/down",
            params: {
              fileName: "download.zip",
            },
            headers: {
              range,
            },
            onDownloadProgress: (progressEvent) => {
              const loaded = progressEvent.loaded;
              let complete = parseInt((loaded / size) * 100);

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