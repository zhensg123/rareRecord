<template>
  <div>
    <input
      type="file"
      ref="fileUploadInput"
      @change="uploadFileChange"
    />
    <el-button @click="uploadChunks"
      >分片上传</el-button
    >
    <el-button @click="handleDelete">删除所有上传文件</el-button>

    <el-form label-width="100px" label-position="top">
      <el-form-item label="计算切片hash：">
        <el-progress :percentage="hashPercentage"></el-progress>
      </el-form-item>
    </el-form>
    <el-form label-width="100px" label-position="top">
      <el-form-item label="上传总进度：">
        <el-progress :percentage="fakeUploadPercentage"></el-progress>
      </el-form-item>
    </el-form>
    <el-table :data="uploadChunkData" style="width: 100%">
      <el-table-column prop="chunkHash" label="chunk hash" width="400">
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

const SIZE = 10 * 1024 * 1024;
const LIMIT = 6;

export default {
  name: "BigFIleUpload",
  components: {},
  data() {
    return {
      uploadChunkData: [],
      fileData: {
        file: null,
        fileHash: "",
        worker: null,
      },
      fakeUploadPercentage: 0,
      hashPercentage: 0
    };
  },
  filters: {
    transformByte(val) {
      return Number((val / 1024 / 1024).toFixed(0));
    },
  },
  computed: {
    uploadPercentage() {
      if (!this.fileData.file || !this.uploadChunkData.length) return 0;
      const loaded = this.uploadChunkData
        .map((item) => item.size * item.percentage)
        .reduce((acc, cur) => acc + cur);
      return parseInt((loaded / this.fileData.file.size).toFixed(2));
    }
  },
  watch: {
    uploadPercentage(now) {
      if (now > this.fakeUploadPercentage) {
        this.fakeUploadPercentage = now;
      }
    },
  },
  methods: {
    // 上传后判断类型
    uploadFileChange(event) {
      const [file] = event.target.files;
      this.fileData.file = file;
      const { ext } = this.getFileNameAndExt();
      if (!this.checkFileType(ext)) {
        this.$refs.fileUploadInput.value = "";
        return this.$message({
          type: "warning",
          message: "文件上传错误",
        });
      }
    },
    // 生成文件 hash（web-worker）
    calculateHash(fileChunkList) {
      return new Promise((resolve) => {
        this.fileData.worker = new Worker("/js/hash.js");
        this.fileData.worker.postMessage({ fileChunkList });
        this.fileData.worker.onmessage = (e) => {
          const { percentage, hash } = e.data;
          this.hashPercentage = percentage;
          if (hash) {
            resolve(hash);
          }
        };
      });
    },
    async handleDelete() {
      await axios({
        method: "get",
        url: "http://localhost:3000/file/delete",
      });
      this.$refs.fileUploadInput.value = this.fileData.file =  "";
      this.$message.success("删除成功");
    },
    // 获取文件名和扩展名
    getFileNameAndExt() {
      const { name } = this.fileData.file;
      return {
        fileName: name,
        ext: name.slice(name.lastIndexOf(".") + 1),
      };
    },
    checkFileType(ext) {
      return ["mp4", "docx", "doc", "xlsx"].includes(ext);
    },
    // file大文件，size切片的大小
    createChunk(file, size = SIZE) {
      const chunkList = [];
      let cur = 0;
      while (cur < file.size) {
        chunkList.push({
          file: file.slice(cur, cur + size), //使用slice()进行切片
        });
        cur += size;
      }
      return chunkList;
    },
    async uploadChunks() {
      if(!this.fileData.file) return
      // 创建切片
      const chunkList = this.createChunk(this.fileData.file);
      this.fileData.fileHash = await this.calculateHash(chunkList);

      // 创建上传切片数据
      this.uploadChunkData = chunkList
        .map(({ file }, index) => ({
          fileHash: this.fileData.fileHash,
          chunk: file, // 切片文件
          chunkHash:  `${this.fileData.fileHash}-${index}`, // 切片hash
          percentage: 0,
          size: file.size,
          index,
        }));

      this.startShouldFileUpload();
    },
   startShouldFileUpload() {
      // 创建切片请求
      const chunksRequests = this.createChunksRequest();

      // 并发以及并发控制
      this.requestWithLimit(chunksRequests, () => this.mergeRequest());
    },
    mergeRequest() {
      axios({
        method: "post",
        url: "http://localhost:3000/file/merge",
        headers: {
          "content-type": "application/json",
        },
        data: JSON.stringify({
          size: SIZE,
          fileHash: this.fileData.fileHash,
          fileName: this.getFileNameAndExt().fileName,
        }),
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
        p.then((res) => {
          console.log(res, 'pres')

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
    createChunksRequest() {
      return this.uploadChunkData
        .map(({ chunk, chunkHash, index }) => {
          const formData = new FormData();
          formData.append("chunk", chunk);
          formData.append("chunkHash", chunkHash);
          formData.append("fileName", this.getFileNameAndExt().fileName);
          formData.append("fileHash", this.fileData.fileHash);

          return { formData, index };
        })
        .map(({ formData, index }) => {
          return new Promise((resolve, reject) => {
            axios({
              method: "post",
              url: "http://localhost:3000/file/upload",
              data: formData,
              onUploadProgress: (progressEvent) => {
                let complete = parseInt(
                  (progressEvent.loaded / progressEvent.total) * 100
                );
                this.uploadChunkData[index].percentage = complete;
              }
            })
              .then((res) => {
                resolve(res);
              })
              .catch((err) => {
                reject(err);
              });
          });
        });
    },
  },
};
</script>
