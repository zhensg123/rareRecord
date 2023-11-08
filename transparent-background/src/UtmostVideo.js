import { getPutDataToElement } from './util'
import { bofang, zanting } from './base64'
import { ajax } from './xhr'
class UtmostVideo {
    constructor(live) {
        const { options } = live
        const { text, scale, token, url} = options
        const defaults = {
            width: 300,
            height: 500,
            scale: 1,
            text: '你好我是直播数字人，很高兴认识你，下面我来做个自我介绍，我在北京，你在哪'
        }
        this.options = Object.assign({}, defaults, {
            text,
            scale,
            token,
            url
        })

        this.ulContainer = null // 容器
        this.ulVideo = null // 视频
        this.coverUrl = ''
        this.videoUrl = ''
        this.init()
    }

    init() {
        ajax({
            url: this.options.url || 'http://localhost:2222/text-to-video',
            method: 'post',
            data: {
                text: this.options.text,
                voice: 'zhimao',
                "ifstream": 1
            },
            token: this.options.token
        }).then((res) => {
            console.log(res, 'res')
            var blob = new Blob([res]);

            const a = document.createElement("a");
            a.style.display = 'none'
            document.body.append(a)
            const url = window.URL.createObjectURL(blob)
            this.videoUrl = url
            // a.href = url
            // a.download = '测试.mp4'
            // a.click()
            // document.body.removeChild(a)
            // window.URL.revokeObjectURL(url)

            // const {cover_url, video_url} = res.data


            // this.videoUrl = video_url
            // this.coverUrl = cover_url
            this.appendHtmlDom()

        })
        // this.appendHtmlDom()

    }

    createUtmostLiveContainer() {
        const div = document.createElement('div')
        div.id = 'utmost_live'
        div.style = `position: fixed;bottom:20px;right: 0;z-index:10000;transform:scale(${this.options.scale})`
        return div
    }
    createUtmostLiveVideo() {
        const { width, height } = this.options

        this.ulVideo = document.createElement('video')
        this.ulVideo.setAttribute('src', this.videoUrl || 'http://localhost:3333/zhibo.mp4')

        this.ulVideo.id = 'utmost_live_video'
        this.ulVideo.style = `width: 0;height: 0px;`
        this.ulVideo.loop = false
        this.ulVideo.crossOrigin = ''
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
                const icon = this.createUtmostLiveIcon()
                this.ulContainer.appendChild(icon)

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
bottom: 260px;
right: 30px;
cursor: pointer;`
        imgIcon.title = '播放'
        imgIcon.setAttribute('src', bofang)
        imgIcon.className = 'bofang'

        imgIcon.addEventListener('click', () => {
            const className = imgIcon.className
            const status = className.indexOf('bofang') > -1
            imgIcon.className = status ? 'zanting' : 'bofang'

            imgIcon.setAttribute('src', status ? zanting : bofang)
            imgIcon.title = status ? '播放' : '暂停'
            imgIcon.alt = status ? '播放' : '暂停'
            status ? this.ulVideo.play() : this.ulVideo.pause()
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
    initVideoCover() {
        const img = new Image();
        img.crossOrigin = ''
        img.onload = () => {
            // 如果视频比例和canvas比例不正确可能会出现显示形变， 调整除的值进行比例调整
            const { width, height } = this.options
            getPutDataToElement(this.ulCanvasCtx, img, width, height)
        };
        img.src = 'http://localhost:3333/zhubo.jpg'
    }
    appendHtmlDom() {
        this.ulContainer = this.createUtmostLiveContainer()
        const canvas = this.createUtmostLiveCanvas()
        const video = this.createUtmostLiveVideo()

        this.ulContainer.appendChild(canvas)
        this.ulContainer.appendChild(video)

        document.body.appendChild(this.ulContainer)
    }

}

export default UtmostVideo