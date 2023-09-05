<template>
  <div class="big-file-download">
      <el-input v-model="fileUrl"></el-input>
      <el-button @click="startDownloadBigFile" size="small">下载</el-button>
  </div>
</template>
<script>
export default {
   data(){
    return {
      fileUrl: ''
    }
   },
   methods: {
    startDownloadBigFile(){
      
    },
    downloadBigFile(){
    
    }
   }
}
</script>