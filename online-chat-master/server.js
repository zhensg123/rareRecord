let app = require('express')();
let http = require('http').Server(app);
let io = require('socket.io')(http);

app.get('/client', function (req, res) {
    res.sendFile(__dirname + '/client.html');
})
app.get('/service', function (req, res) {
    res.sendFile(__dirname + '/service.html');
})

// socket连接对象，键名：cid****_sid***、sid****_cid****（前面为发送方，后面为接收方）
let localSockets = {}

class Chat {
    constructor(socket, chatInfo) {
        this.socket = socket
        this.chatInfo = chatInfo
    }

    isCustomerSender() {
        if (this.chatInfo.customer && this.chatInfo.customer.isSender === true) {
            return true
        } else {
            return false
        }
    }

    getSocketKeyValue() {
        // 客户是发送消息方，客服是接收消息方
        if (this.isCustomerSender()) {
            return {
                key: `cid${this.chatInfo.customer.id}_sid${this.chatInfo.service.id}`,
                val: this.socket
            }
        } else {
            return {
                key: `sid${this.chatInfo.service.id}_cid${this.chatInfo.customer.id}`,
                val: this.socket
            }
        }
    }
}

class Message {
    constructor(req){
        this.req = req
        this.userInfo = this.req.userInfo || {}
        this.msg = this.req.msg || ''
    }
    getSenderKey(){
        if(this.userInfo.customer.isSender){
            return `cid${this.userInfo.customer.id}`
        } else {
            return `sid${this.userInfo.service.id}`
        }
    }
    getReceiverKey(){
        if(this.userInfo.customer.isSender){
            return `sid${this.userInfo.service.id}`
        } else {
            return `cid${this.userInfo.customer.id}`
        }
    }
    send(){
        if(localSockets[`${this.getSenderKey()}_${this.getReceiverKey()}`]){
            localSockets[`${this.getSenderKey()}_${this.getReceiverKey()}`].emit('callback private message', {
                msg: this.msg,
                self: true
            })
        }
        if(localSockets[`${this.getReceiverKey()}_${this.getSenderKey()}`]){
            localSockets[`${this.getReceiverKey()}_${this.getSenderKey()}`].emit('callback private message', {
                msg: this.msg,
                self: false
            })
        }
    }
}

io.on('connect', function (socket) {
    socket.on('new chat', function (chatInfo) {
        let newChatObj = new Chat(socket, chatInfo)
        let newSocket = newChatObj.getSocketKeyValue()

        // 若重复登录，断开原连接
        if(newSocket.key in localSockets){
            localSockets[newSocket.key].disconnect(true)
        }

        // 设置新连接
        localSockets[newSocket.key] = newSocket.val
    })
    socket.on('send private message', function(req){
        let msgObj = new Message(req)
        console.log('send private message', req);
        msgObj.send()
    })
})

http.listen(3000, () => console.log('Example app listening on port 3000!'))
