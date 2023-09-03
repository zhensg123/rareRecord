const express = require('express');
const app = express();

const multiparty = require("multiparty");
const path = require('path');
const fse = require("fs-extra");

// 跨域设置
const cors = require('cors')
app.use(cors())

const UPLOAD_DIR = path.resolve(__dirname, ".", "target");

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

// 合并切片
const mergeFileChunk = async (filePath, fileName, size) => {
  const chunkDir = path.resolve(UPLOAD_DIR, `${fileName}-chunks`);
  // 读取所有chunk路径
  const chunkPaths = await fse.readdir(chunkDir);
  // 根据切片下标进行排序
  // 使用下面的方式有问题
  // chunkPaths.sort((a, b) => parseInt(a.split('-')[1]) - parseInt(b.split('-')[1]));
  chunkPaths.sort((a, b) => parseInt(a.split('-').pop()) - parseInt(b.split('-').pop()));
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
    const [chunk] = files.chunk
    const [fileName] = fields.fileName
    const [chunkName] = fields.chunkName
    // path.resolve 将相对路径解析为绝对路径
    const chunkDir = path.resolve(UPLOAD_DIR, `${fileName}-chunks`)
    if (!fse.existsSync(chunkDir)) {
      await fse.mkdirs(chunkDir)
    }

    try {
      // fs-extra 的 move 方法用于移动文件或目录。
      await fse.move(chunk.path, `${chunkDir}/${chunkName}`)
    } catch (err) {
      console.log(err)
    }
    res.end("received file chunk");
  });
});

app.post('/file/merge', async function (req, res, next) {
  const data = await resolvePost(req);
  const { fileName, size } = data;
  const filePath = path.resolve(UPLOAD_DIR, `${fileName}`);
  await mergeFileChunk(filePath, fileName, size);
  res.end(
    JSON.stringify({
      code: 0,
      message: "file merged success"
    })
  );
});


app.listen(3000, function () {
  console.log('hello world')
})