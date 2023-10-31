import {  getPutDataToElement } from './util'

class UtmostLive {
    constructor(options) {
        this.ulContainer = null // 容器
        this.ulVideo = null // 视频
        this.ulHandleIcon = null // 操作图标
        this.init(options)
    }

    init(options) {
        const defaults = {
            width: 300,
            height: 500,
            type: 'video'
        }
        this.options = Object.assign({}, options, defaults)
        this.appendHtmlDom()
    }
    createUtmostLiveContainer() {
        const div = document.createElement('div')
        div.id = 'utmost_live'
        div.style = `position: fixed;
    bottom:20px;
    right: 0;`
        return div
    }
    createUtmostLiveVideo() {
        this.ulVideo = document.createElement('video')
        this.ulVideo.setAttribute('src', '/assets/sales_5.mp4')

        this.ulVideo.id = 'utmost_live_video'
        this.ulVideo.style = `width: 0;height: 0;`
        this.ulVideo.loop = true
        // video.muted = true
        this.ulVideo.autoplay = true
        const computeFrame = () => {
            const { width, height } = this.options
            getPutDataToElement(this.ulCanvasCtx, this.ulVideo, width, height)
            setTimeout(computeFrame, 0);
        }
        this.ulVideo.addEventListener('play', computeFrame)
        return this.ulVideo
    }
    createUtmostLiveIcon() {
        const imgIcon = document.createElement('img')
        imgIcon.id = 'utmost_live_play_icon'
        imgIcon.style = `position: absolute;
    height: 20px;
    width:20px;
    bottom: 190px;
    right: 80px;
    cursor: pointer;`
    imgIcon.title = '播放'
        imgIcon.setAttribute('src', "/assets/bofang.png")
        imgIcon.addEventListener('click', () => {
            const src = imgIcon.getAttribute('src')
            imgIcon.setAttribute('src', src.indexOf('zanting') >  -1 ? '/assets/bofang.png' : '/assets/zantingbofang.png')
            imgIcon.title = src.indexOf('zanting') >  -1 ? '播放' : '暂停'
            src.indexOf('zanting') >  -1  ? this.ulVideo.pause() : this.ulVideo.play()
        })
        return imgIcon
    }

    createUtmostLiveCanvas() {
        const { width, height } = this.options

        this.ulCanvas = document.createElement('canvas')
        this.ulCanvas.setAttribute('width', width)
        this.ulCanvas.setAttribute('height', height)

        this.ulContainer.appendChild(this.ulCanvas)
        this.ulCanvasCtx = this.ulCanvas.getContext('2d');

        const img = new Image();
        img.onload = () => {
            // 如果视频比例和canvas比例不正确可能会出现显示形变， 调整除的值进行比例调整
            const { width, height } = this.options
            getPutDataToElement(this.ulCanvasCtx, img, width, height)
        };
        img.src = '/assets/zhubo.jpg'
        return this.ulCanvas
    }
    appendHtmlDom() {
        this.ulContainer = this.createUtmostLiveContainer()
        this.ulVideo = this.createUtmostLiveVideo()
        const icon = this.createUtmostLiveIcon()
        const canvas = this.createUtmostLiveCanvas()

        this.ulContainer.appendChild(this.ulVideo)
        this.ulContainer.appendChild(icon)
        this.ulContainer.appendChild(canvas)

        document.body.appendChild(this.ulContainer)
    }

}

window.ulInit = function (options = {}) {
    return new UtmostLive(options)
}

window.ulInit()

