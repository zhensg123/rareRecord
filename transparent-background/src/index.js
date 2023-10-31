import {  getPutDataToElement } from './util'
import {  bofang, zanting } from './base64'

class UtmostLive {
    constructor(options) {
        this.ulContainer = null // 容器
        this.ulVideo = null // 视频
        this.scale = 1
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
        div.style = `position: fixed;bottom:20px;right: 0;`
        return div
    }
    createUtmostLiveVideo() {
        const { width, height } = this.options

        this.ulVideo = document.createElement('video')
        this.ulVideo.setAttribute('src', '/assets/sales_5.mp4')

        this.ulVideo.id = 'utmost_live_video'
        this.ulVideo.style = `width: 0;height: 0px;`
        this.ulVideo.loop = true
        // video.muted = true
        // this.ulVideo.autoplay = true
        const computeFrame = () => {
            getPutDataToElement(this.ulCanvasCtx, this.ulVideo, width, height)
            setTimeout(computeFrame, 0);
        }
        let setTimeoutMemory = null
        this.ulVideo.addEventListener('canplay', ()=> {
            console.log('The video has started to play');
            // const { width, height } = this.options
            console.log(this.ulCanvasCtx, this.ulVideo, 'this.ulVideo', width, height)
            clearTimeout(setTimeoutMemory)
            setTimeoutMemory = setTimeout(()=>{
                getPutDataToElement(this.ulCanvasCtx, this.ulVideo, width, height)
            }, 55)
        })
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
        imgIcon.setAttribute('src', bofang)
        imgIcon.className = 'bofang'

        imgIcon.addEventListener('click', () => {
            const className = imgIcon.className
            const status = className.indexOf('bofang') >  -1
            imgIcon.className = status ? 'zanting' : 'bofang'

            imgIcon.setAttribute('src', status ? zanting : bofang)
            imgIcon.title = status ? '播放' : '暂停'
            imgIcon.alt = status ? '播放' : '暂停'
            status  ? this.ulVideo.play() : this.ulVideo.pause()
        })
        return imgIcon
    }

    createUtmostLiveCanvas() {
        const { width, height } = this.options

        this.ulCanvas = document.createElement('canvas')
        this.ulCanvas.setAttribute('width', width)
        this.ulCanvas.setAttribute('height', height)

        this.ulCanvasCtx = this.ulCanvas.getContext('2d');
        // this.initVideoCover()
        
        return this.ulCanvas
    }
    initVideoCover(){
        const img = new Image();
        img.onload = () => {
            // 如果视频比例和canvas比例不正确可能会出现显示形变， 调整除的值进行比例调整
            const { width, height } = this.options
            getPutDataToElement(this.ulCanvasCtx, img, width, height)
        };
        img.src = '/assets/zhubo.jpg'
    }
    appendHtmlDom() {
        this.ulContainer = this.createUtmostLiveContainer()
        const icon = this.createUtmostLiveIcon()
        const canvas = this.createUtmostLiveCanvas()
        const video = this.createUtmostLiveVideo()

        this.ulContainer.appendChild(icon)
        this.ulContainer.appendChild(canvas)
        this.ulContainer.appendChild(video)

        document.body.appendChild(this.ulContainer)
    }

}

window.ulInit = function (options = {}) {
    return new UtmostLive(options)
}

window.ulInit()

