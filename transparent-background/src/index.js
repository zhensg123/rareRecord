
import UtmostVideo from './UtmostVideo'
import UtmostVoice from './UtmostVoice'

class UtmostLive {
    constructor(options) {
        this.init(options)
    }

    init(options) {
        const defaults = {
            scale: 1,
            type: 'video',
            text: '你好我是直播数字人，很高兴认识你，下面我来做个自我介绍，我在北京，你在哪',
            token: options.token
        }
        this.options = Object.assign({}, defaults, options)

        const { type } = this.options
        if (type === 'video' || !type) {
            new UtmostVideo(this)
        }

        if (type === 'voice') {
            new UtmostVoice(this)
        }
    }
}

window.ulInit = function (options = {}) {
    return new UtmostLive(options)
}

// window.ulInit({
//     text: '你好数字人你好数字人你好数字人你好数字人你好数字人你好数字人',
//     scale: 1,
//     url: 'http://localhost:2222/text-to-video',
//     token: 'd70b160155334a9280a5f11f5b3ece2c2c11ab7957651d659b8fa02eb7737d1d',
//     type: 'video' // voice
// })
