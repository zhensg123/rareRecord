 const numToPoint = (num, width) => {
    let col = num % width;
    let row = Math.floor(num / width);
    row = col === 0 ? row : row + 1;
    col = col === 0 ? width : col;
    return [row, col];
  }

   const  pointToNum = (point, width) => {
    let [row, col] = point;
    return (row - 1) * width + col
  }

    const getAroundPoint = (point, width, height, area) => {
    let [row, col] = point;
    let allAround = [];
    if (row > height || col > width || row < 0 || col < 0) return allAround;
    for (let i = 0; i < area; i++) {
      let pRow = row - 1 + i;
      for (let j = 0; j < area; j++) {
        let pCol = col - 1 + j;
        if (i === area % 2 && j === area % 2) continue;
        allAround.push([pRow, pCol]);
      }
    }
    return allAround.filter(([iRow, iCol]) => {
      return (iRow > 0 && iCol > 0) && (iRow <= height && iCol <= width);
    })
  }

  export const getPutDataToElement = (canvas, dataObject, width, height)=>{
     // 如果视频比例和canvas比例不正确可能会出现显示形变， 调整除的值进行比例调整
     canvas.drawImage(dataObject, 0, 0, width, height);
     // 获取到绘制的canvas的所有像素rgba值组成的数组
     let imageData = canvas.getImageData(0, 0, width, height);

     //----- emergence ----------
     const dataheight = imageData.height;
     const datawidth = imageData.width;
     const pointLens = imageData.data.length / 4;


     for (let i = 0; i < pointLens; i++) {
         let r = imageData.data[i * 4];
         let g = imageData.data[i * 4 + 1];
         let b = imageData.data[i * 4 + 2];
         if (r < 100 && g > 120 && b < 200) {
             imageData.data[i * 4 + 3] = 0;
         }
     }

     const tempData = [...imageData.data]
     for (let i = 0; i < pointLens; i++) {
         if (imageData.data[i * 4 + 3] === 0) continue
         const currentPoint = numToPoint(i + 1, datawidth);
         const arroundPoint = getAroundPoint(currentPoint, datawidth, dataheight, 3);
         let opNum = 0;
         let rSum = 0;
         let gSum = 0;
         let bSum = 0;
         arroundPoint.forEach((position) => {
             const index = pointToNum(position, datawidth);
             rSum = rSum + tempData[(index - 1) * 4];
             gSum = gSum + tempData[(index - 1) * 4 + 1];
             bSum = bSum + tempData[(index - 1) * 4 + 2];
             if (tempData[(index - 1) * 4 + 3] !== 255) opNum++;
         })
         let alpha = (255 / arroundPoint.length) * (arroundPoint.length - opNum);
         if (alpha !== 255) {
             // debugger
             imageData.data[i * 4] = parseInt(rSum / arroundPoint.length);
             imageData.data[i * 4 + 1] = parseInt(gSum / arroundPoint.length);
             imageData.data[i * 4 + 2] = parseInt(bSum / arroundPoint.length);
             imageData.data[i * 4 + 3] = parseInt(alpha);
         }
     }
     canvas.putImageData(imageData, 0, 0);
  }