const express = require('express');
const app = express();

const multiparty = require("multiparty");
const path = require('path'); // 处理路径相关，不处理文件
const fse = require("fs-extra"); // 处理文件相关

// 跨域设置
const cors = require('cors')
app.use(cors())

const UPLOAD_DIR = path.resolve(__dirname, ".", "target");
// 提取后缀名
// get file extension
const extractExt = fileName => fileName.slice(fileName.lastIndexOf("."), fileName.length);

// 创建临时文件夹用于临时存储 chunk
// 添加 chunkDir 前缀与文件名做区分
// create a directory for temporary storage of chunks
// add the 'chunkDir' prefix to distinguish it from the chunk name
const getChunkDir = fileHash =>
  path.resolve(UPLOAD_DIR, `chunkDir_${fileHash}`);



const resolvePost = req =>
  new Promise(resolve => {
    let chunk = "";
    req.on("data", data => {
      chunk += data;
    });
    req.on("end", () => {
      resolve(JSON.parse(chunk));
    });
  });

// 写入文件流
const pipeStream = (path, writeStream) =>
  new Promise(resolve => {
    const readStream = fse.createReadStream(path);
    readStream.on("end", () => {
      fse.unlinkSync(path);
      resolve();
    });
    readStream.pipe(writeStream);
  });

  // 返回已上传的所有切片名
// return chunk names which is uploaded
const createUploadedList = async fileHash =>
fse.existsSync(getChunkDir(fileHash))
  ? await fse.readdir(getChunkDir(fileHash))
  : [];

// 合并切片
const mergeFileChunk = async (filePath, fileHash, size) => {
  // get chuunk path
  // 获取切片路径
  const chunkDir = getChunkDir(fileHash);
  // read all chunk path
  // 读取所有chunk路径
  const chunkPaths = await fse.readdir(chunkDir);
  // 根据切片下标进行排序
  chunkPaths.sort((a, b) => parseInt(a.split('-')[1]) - parseInt(b.split('-')[1]));
  // chunkPaths.sort((a, b) => parseInt(a.split('-').pop()) - parseInt(b.split('-').pop()));
  // 并发写入文件
  await Promise.all(
    chunkPaths.map((chunkPath, index) =>
      pipeStream(
        path.resolve(chunkDir, chunkPath),
        // 根据 size 在指定位置创建可写流
        fse.createWriteStream(filePath, {
          start: index * size,
        })
      )
    )
  );
  // 合并后删除保存切片的目录
  fse.rmdirSync(chunkDir);
};


app.post('/file/upload', function (req, res, next) {
  const multipart = new multiparty.Form();
  multipart.parse(req, async function (err, fields, files) {
      if(err){
        res.status = 500
        res.end("异常错误");
        return
      }
      const [chunk] = files.chunk;
      const [chunkHash] = fields.chunkHash; // 切片hash
      const [fileHash] = fields.fileHash;
      const [fileName] = fields.fileName;
      // 获取文件路径
      const filePath = path.resolve(
        UPLOAD_DIR,
        `${fileHash}${extractExt(fileName)}`
      );
      // path.resolve 将相对路径解析为绝对路径 切片名改为fileHash
      const chunkDir = getChunkDir(fileHash);
      const chunkPath = path.resolve(chunkDir, chunkHash);

      // 文件存在直接返回
      // return if file is exists
      if (fse.existsSync(filePath)) {
        res.end("file exist");
        return;
      }

      // 切片存在直接返回
      // return if chunk is exists
      if (fse.existsSync(chunkPath)) {
        res.end("chunk exist");
        return;
      }

      // 切片目录不存在，创建切片目录
      // if chunk directory is not exist, create it
      if (!fse.existsSync(chunkDir)) {
        await fse.mkdirs(chunkDir);
      }

    try {
      // fs-extra 的 move 方法用于移动文件或目录。
      await fse.move(chunk.path, path.resolve(chunkDir, chunkHash));
    } catch (err) {
      console.log(err)
    }
    res.end("received file chunk");
  });
});


app.post('/file/merge', async function (req, res, next) {

  const data = await resolvePost(req);
  const { fileHash, fileName, size } = data;
  const ext = extractExt(fileName);
  const filePath = path.resolve(UPLOAD_DIR, `${fileHash}${ext}`);
  await mergeFileChunk(filePath, fileHash, size);
  res.end(
    JSON.stringify({
      code: 0,
      message: "file merged success"
    })
  );
});

app.post('/file/verify', async function (req, res, next) {
  const data = await resolvePost(req);
  const { fileHash, fileName } = data;
  const ext = extractExt(fileName);
  const filePath = path.resolve(UPLOAD_DIR, `${fileHash}${ext}`);
  if (fse.existsSync(filePath)) {
    res.end(
      JSON.stringify({
        shouldUpload: false
      })
    );
  } else {
    res.end(
      JSON.stringify({
        shouldUpload: true,
        uploadedList: await createUploadedList(fileHash)
      })
    );
  }
});

app.get('/file/delete', async function (req, res, next) {
   await fse.remove(path.resolve(UPLOAD_DIR));
    res.end(
      JSON.stringify({
        code: 0,
        message: "file delete success"
      })
    );
});

app.get('/test', async function (req, res, next) {
   res.send('测试2')
});
app.listen(3000, function () {
  console.log('hello world')
})