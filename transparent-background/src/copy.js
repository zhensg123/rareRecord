{/* <template>
    <div class="videoBgRemove">
        <video id="video" src="/video/sales_5.mp4" loop autoplay muted ref="video" style="position:absolute;left:9999px;width: 608px;height: 1081px;"></video>
        <canvas id="output-canvas" width="608" height="1081" willReadFrequently="true" ref="canvas"></canvas>

        <span>2222</span>
    </div>
</template>

<script setup> */}
// import {ref, onMounted} from 'vue';




window.onload = ()=>{
    const video = document.getElementById('video');
    video.play()
const canvas = document.getElementById('output-canvas');
let ctx = null;
let canvas_tmp = null;
let ctx_tmp = null;

const init = () => {
    ctx = canvas.getContext('2d');

    // 创建的canvas宽高最好与显示图片的canvas、video宽高一致
    canvas_tmp = document.createElement('canvas');
    canvas_tmp.setAttribute('width', 608);
    canvas_tmp.setAttribute('height', 1081);
    ctx_tmp = canvas_tmp.getContext('2d');

    video.addEventListener('play', computeFrame);
}

const numToPoint = (num, width) => {
    let col = num % width;
    let row = Math.floor(num / width);
    row = col === 0 ? row : row + 1;
    col = col === 0 ? width : col;
    return [row, col];
}

const pointToNum = (point, width) => {
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


const computeFrame = () => {
    if (video) {
        if (video.paused || video.ended) return;
    }
    // 如果视频比例和canvas比例不正确可能会出现显示形变， 调整除的值进行比例调整
    ctx_tmp.drawImage(video, 0, 0, video.clientWidth / 1, video.clientHeight / 1);

    // 获取到绘制的canvas的所有像素rgba值组成的数组
    let frame = ctx_tmp.getImageData(0, 0, video.clientWidth, video.clientHeight);

    //----- emergence ----------
    const height = frame.height;
    const width = frame.width;
    const pointLens = frame.data.length / 4;


    for (let i = 0; i < pointLens; i++) {
        let r = frame.data[i * 4];
        let g = frame.data[i * 4 + 1];
        let b = frame.data[i * 4 + 2];
        if (r < 100 && g > 120 && b < 200) {
            frame.data[i * 4 + 3] = 0;
        }
    }

    const tempData = [...frame.data]
    for (let i = 0; i < pointLens; i++) {
        if (frame.data[i * 4 + 3] === 0) continue
        const currentPoint = numToPoint(i + 1, width);
        const arroundPoint = getAroundPoint(currentPoint, width, height, 3);
        let opNum = 0;
        let rSum = 0;
        let gSum = 0;
        let bSum = 0;
        arroundPoint.forEach((position) => {
            const index = pointToNum(position, width);
            rSum = rSum + tempData[(index - 1) * 4];
            gSum = gSum + tempData[(index - 1) * 4 + 1];
            bSum = bSum + tempData[(index - 1) * 4 + 2];
            if (tempData[(index - 1) * 4 + 3] !== 255) opNum++;
        })
        let alpha = (255 / arroundPoint.length) * (arroundPoint.length - opNum);
        if (alpha !== 255) {
            // debugger
            frame.data[i * 4] = parseInt(rSum / arroundPoint.length);
            frame.data[i * 4 + 1] = parseInt(gSum / arroundPoint.length);
            frame.data[i * 4 + 2] = parseInt(bSum / arroundPoint.length);
            frame.data[i * 4 + 3] = parseInt(alpha);
        }
    }

    //------------------------
    ctx.putImageData(frame, 0, 0);
    setTimeout(computeFrame, 0);
}
init()
}