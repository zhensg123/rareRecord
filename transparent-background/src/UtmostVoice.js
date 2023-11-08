import { laba } from './base64'
import { ajax } from './xhr'
import { appendVoiceStyle } from './util'
class UtmostVoice {
    constructor(live) {
        const { options } = live
        const { text, scale, token, url} = options
        const defaults = {
            scale: 1,
            text: '你好我是直播数字人，很高兴认识你，下面我来做个自我介绍，我在北京，你在哪'
        }
        this.options = Object.assign({}, defaults, {
            text,
            scale,
            token,
            url
        })
        this.voiceUrl = ''

        this.init()
    }

    init() { 

        ajax({
            url: this.options.url || 'http://localhost:2222/text-to-speech',
            method: 'post',
            data:
            {
                "text": this.options.text || "你好，我是语音接口,你好，我是语音接口,你好，我是语音接口,你好，我是语音接口,你好，我是语音接口",
                "voice": "zhimao",
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

        this.ulVoice = document.createElement('audio')
        this.ulVoice.setAttribute('src', this.voiceUrl || 'http://localhost:3333/zhibo.mp4')

        this.ulVoice.id = 'utmost_live_voice'
        this.ulVoice.style = `width: 0;height: 0px;`
        this.ulVoice.loop = false
        this.ulVoice.crossOrigin = ''
        return this.ulVoice
    }
    createUtmostLiveIcon() {
        // 盒子

        appendVoiceStyle()
        const imgDivBox = document.createElement('div')
        imgDivBox.id = 'utmost_live_play_icon_box'


        const imgDivBoxDom = `
        
        <img
            src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAACfElEQVR4nO2WS3LaQBCGWy5gGy2yNzcIPkDKcIPkBJZPEKjisWS85FEFOUHwDXwDiRvgEwTfgKyhmHwNI16FQbgkr/iquqYH9XT/6pEGefIJDAaDokCtVpvKAZkK6Pf7D8vlsopbwpRRs9l8ZNzgYanT6/XK1toB7qqw53mvzH3cW+wOERPGFakKcIXbuGVZM/Y8zzQajajT6Rj8trX2qdVqGXGkIkD3eD6fa+FA1rx5nhdoYXE4caFNUwCFfQprqwNZ84YZWjySA1IVoIUXi8UvklWZ+tg//OFuYvcABnRiQidqHxJAIW3tLe4GEmqiKq6PrQoXCoUhr9iMeVzYEDdmOhKRYS6X+4HgIrGhTSLAqdXWlrCjUOCZxIbCUwG3po2rOatsw4RRut1uRKwR4HpozwlgQSAifzBh4SsLZrgrmH9h/jWfz38/VhgM7Y5kB/JFgiCu+cSF9pQAWq4P1V9cH3vkLkaygyumD1lZHPw2Elp9WPgQ4nRtaE8JIKhKgLb+N0WqjHtwXZPsCTgHHXhhMIk6EB8WWOXYHX1EgK7RXDqyNrSfLSDGrQ3tVcBVwFVAEgE3Nzc/6/W6HiB7uCTZCeDUCmT9PxBRpMK4h0tiuFaWC3FrQ3tKgELghKBvuFO6MRIRnc8YlRIWIOCO8SLIm0yA+0N6wb3H3mPKNhm26Rk/EYkFxLAdJTpQ5uPCZ7pBf5OtuMRCLhZwCrpU5AvHkOyBqXJWSKoCYrRLDEPsHlPeFZKJgBiX3MhWSMRWPe2eJS4mtFkIiHFFjBwRQrcC4RW3WQqIUSHC1lBMX2dlKmuKCKqoIHFkIiDG3XUg246MOUPKskOmApLwHwFGlT/2Uy6+AAAAAElFTkSuQmCC" />
        <div class="wifi-symbol">
            <div class="wifi-circle wifi-circle-first"></div>
            <div class="wifi-circle wifi-circle-second"></div>
        </div>
        `
        imgDivBox.innerHTML = imgDivBoxDom
        const imgIcon = imgDivBox.getElementsByTagName('img')[0]
        // console.log(imgIcon, 'imgIcon')
        imgIcon.title = '播放'
        imgDivBox.style = `transform:scale(${this.options.scale})`
        imgDivBox.addEventListener('click', () => {
            const className = imgDivBox.className
            const status = className.indexOf('utmost-play') > -1
            imgDivBox.className = status ? '' : 'utmost-play'

            // imgIcon.setAttribute('src', status ? zanting : bofang)
            imgIcon.title = status ? '播放' : '暂停'
            imgIcon.alt = status ? '播放' : '暂停'
            status ? this.ulVoice.pause() : this.ulVoice.play()
        })
        return imgDivBox
    }

    appendHtmlDom() {
        this.ulContainer = this.createUtmostLiveContainer()
        const iconBox = this.createUtmostLiveIcon()
        const voice = this.createUtmostLiveVoice()

        this.ulContainer.appendChild(iconBox)
        this.ulContainer.appendChild(voice)

        document.body.appendChild(this.ulContainer)
    }

}

export default UtmostVoice