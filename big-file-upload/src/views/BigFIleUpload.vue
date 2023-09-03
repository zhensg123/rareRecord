<template>
  <div>
    <input type="file" ref="fileUploadInput" @change="uploadFileChange" />
    <el-button @click="uploadChunks" size="small">分片上传</el-button>
    <el-button @click="pauseUpload" size="small">暂停上传</el-button>
    <el-button @click="resumeUpload" size="small">恢复上传</el-button>

    <el-form label-width="100px" label-position="top">
      <el-form-item label="上传总进度：">
        <el-progress :percentage="uploadPercentage"></el-progress>
      </el-form-item>
    </el-form>
    <el-table :data="uploadChunkData" style="width: 100%">
      <el-table-column prop="hash" label="chunk hash" width="180">
      </el-table-column>
      <el-table-column prop="size" label="size(KB)" width="180">
        <template slot-scope="{row}">
          {{ row.size }}
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
      fileData: null
    };
  },
  computed: {
    uploadPercentage() {
      if (!this.fileData || !this.uploadChunkData.length) return 0;
      const loaded = this.uploadChunkData
        .map((item) => item.size * item.percentage)
        .reduce((acc, cur) => acc + cur);
        console.log(loaded, 'loaded', this.fileData.size)
      return parseInt((loaded / this.fileData.size).toFixed(2));
    },
  },
  methods: {
    // 上传后判断类型
    uploadFileChange(event) {
      const [file] = event.target.files;
      const { ext } = this.getFileNameAndExt(file);
      this.fileData = file;
      if (!this.checkFileType(ext)) {
        this.$refs.fileUploadInput.value = "";
        return this.$message({
          type: "warning",
          message: "文件上传错误",
        });
      }
    },
    pauseUpload(){

    },
    resumeUpload(){

    },
    // 获取文件名和扩展名
    getFileNameAndExt(file) {
      const { name } = file;
      return {
        name: name,
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
    // 上传文件：切片、切片请求、并发控制、合并切片
    async uploadChunks() {
      const chunkList = this.createChunk(this.fileData);
      const { name: fileName } = this.getFileNameAndExt(this.fileData);
      this.uploadChunkData = chunkList.map(({ file }, index) => ({
        chunk: file,
        hash: `${fileName}-${index}`,
        percentage: 0,
        size: file.size,
        index,
      }));
      console.log(this.uploadChunkData, 'this.uploadChunkData')
      const chunksRequests = this.createChunksRequest(fileName);
      // await Promise.all(chunksRequests)
      // this.mergeRequest(fileName)
      this.requestWithLimit(chunksRequests, LIMIT, () =>
        this.mergeRequest(fileName)
      );
    },
    mergeRequest(fileName) {
      axios({
        method: "post",
        url: "http://localhost:3000/file/merge",
        headers: {
          "content-type": "application/json",
        },
        data: JSON.stringify({
          size: SIZE,
          fileName: fileName,
        }),
      });
    },
    requestWithLimit(prmiseQueue, limit = LIMIT, callback = null) {
      // 请求数量记录，默认为 0
      let count = 0;

      // 递归调用，请求接口数据
      const run = () => {
        // 接口每调用一次，记录数加 1
        count++;
        const p = prmiseQueue.shift();
        p.then((res) => {
          // 接口调用完成，记录数减 1
          count--;
          if (!prmiseQueue.length && !count) {
            // 这里可以对所有接口返回的数据做处理，以便输出
            callback && callback();
          }
          // prmiseQueue 长度不为 0 且记录小于限制的数量时递归调用
          if (prmiseQueue.length && count < limit) {
            run();
          }
        });
      };

      // 根据 limit 并发调用
      for (let i = 0; i < limit; i++) {
        run();
      }
    },
    createChunksRequest(fileName) {
      return this.uploadChunkData
        .map(({ chunk, hash, index }) => {
          console.log(chunk, hash, fileName, "hash");
          const formData = new FormData();
          formData.append("chunk", chunk);
          formData.append("chunkName", hash);
          formData.append("fileName", fileName);
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
                console.log(complete, 'complete')
                this.uploadChunkData[index].percentage = complete;
              },
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
