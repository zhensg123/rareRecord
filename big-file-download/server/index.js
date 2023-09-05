const express = require('express');
const app = express();

const path = require('path');
const fse = require("fs-extra");
const Result = require("./Result");

// 跨域设置
const cors = require('cors')
app.use(cors())

const UPLOAD_DIR = path.resolve(__dirname, ".", "resource");
// 提取后缀名
// get file extension
const extractExt = fileName => fileName.slice(fileName.lastIndexOf("."), fileName.length);



app.get('/file/down', function (req, res, next) {
  const {fileName} = req.query
  const file = path.resolve(UPLOAD_DIR, fileName);
  fse.stat(file).then(stat => {
    const fileSize = stat.size;
    const range = req.headers.range;

    if (range) {
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize-1;

      const chunksize = (end-start)+1;
      const stream = fse.createReadStream(file, {start, end});
      const head = {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize,
        'Content-Type': 'application/zip',
      };

      res.writeHead(206, head);
      stream.pipe(res);
    } else {
      const head = {
        'Content-Length': fileSize,
        'Content-Type': 'application/zip',
      };
      res.writeHead(200, head);
      fse.createReadStream(file).pipe(res);
    }
  });
});



app.get('/file/getFileSize', async function (req, res, next) {
  const {fileName} = req.query

  const file = path.resolve(UPLOAD_DIR, fileName);
// 通常情况下，我们会认为1KB等于1000字节，1MB等于1000KB，但在计算机中，1KB等于1024字节，1MB等于1024KB。
// 所以，如果磁盘显示的大小为30.9MB，那么实际的字节数应该是30.9 * 1024 * 1024，大约等于32400998字节。
// 但是，有些操作系统或软件在显示存储大小时，可能会使用1000作为转换系数，这就可能导致显示的大小和实际的大小有所不同。这也是为什么你看到的大小是30.9M，但实际的字节数是30858587字节。
// 总的来说，这是一个常见的混淆点，你需要根据具体的情况来判断应该使用哪个转换系数
  const {size} = await fse.stat(file)
  res.send(Result.success({
    fileSize: size
  }))
});

app.get('/test', async function (req, res, next) {
   res.send('测试2')
});
app.listen(3000, function () {
  console.log('hello world')
})