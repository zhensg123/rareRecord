import { laba } from './base64'
import { ajax } from './xhr'

class UtmostVoice {
    constructor() {
        this.voiceUrl = ''
        this.init()
    }

    init() {
       
        ajax({
            url: 'http://localhost:2222/text-to-speech',
            method: 'post',
            data: 
                {
                    "text": "你好，我是语音接口,你好，我是语音接口,你好，我是语音接口,你好，我是语音接口,你好，我是语音接口",
                    "voice": "zhimao",
                    "ifstream":1
                  }
            
        }).then((res) => {
            console.log(res, 'res')
            var blob = new Blob([res]);

            const a = document.createElement("a");
            a.style.display = 'none'
            document.body.append(a)
            const url = window.URL.createObjectURL(blob)
            this.voiceUrl = url
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
        div.style = `position: fixed;bottom:20px;right: 20px;`
        return div
    }
    createUtmostLiveVoice() {

        this.ulVoice = document.createElement('video')
        this.ulVoice.setAttribute('src', this.voiceUrl || 'http://localhost:3333/zhibo.mp4')

        this.ulVoice.id = 'utmost_live_voice'
        this.ulVoice.style = `width: 0;height: 0px;`
        this.ulVoice.loop = true
        this.ulVoice.crossOrigin = ''
        return this.ulVoice
    }
    createUtmostLiveIcon() {
        const imgIcon = document.createElement('img')
        imgIcon.id = 'utmost_live_play_icon'
        imgIcon.style = `
height: 20px;
width:20px;
cursor: pointer;`
        imgIcon.title = '播放'
        imgIcon.setAttribute('src', laba)
        imgIcon.className = 'bofang'

        imgIcon.addEventListener('click', () => {
            const className = imgIcon.className
            const status = className.indexOf('bofang') > -1
            imgIcon.className = status ? 'zanting' : 'bofang'

            // imgIcon.setAttribute('src', status ? zanting : bofang)
            imgIcon.title = status ? '播放' : '暂停'
            imgIcon.alt = status ? '播放' : '暂停'
            status ? this.ulVoice.play() : this.ulVoice.pause()
        })
        return imgIcon
    }

    appendHtmlDom() {
        this.ulContainer = this.createUtmostLiveContainer()
        const icon = this.createUtmostLiveIcon()
        const voice = this.createUtmostLiveVoice()

        this.ulContainer.appendChild(icon)
        this.ulContainer.appendChild(voice)

        document.body.appendChild(this.ulContainer)
    }

}

export default UtmostVoice