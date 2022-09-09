const app = getApp();
let socketOpen = false
let socketMsgQueue = []

Page({
  data: {
    userInfor: {},
    socketBtnTitle: '连接socket'
  },
  socketBtnTap() {
    const that = this;
    let remindTitle = socketOpen ? '正在关闭' : '正在连接'
    wx.showToast({
      title: remindTitle,
      icon: 'loading',
      duration: 10000
    })
    if(!socketOpen) {
      // 创建一个websocket连接
      wx.connectSocket({
        url: 'ws://www.qcloud.la',
      })
      //监听错误
      wx.onSocketError((result) => {
        socketOpen = false
        console.log('WebSocket连接打开失败，请检查！')
        that.setData({
          socktBtnTitle: '连接socket'
        })
        wx.hideToast()
      })
      //监听WebSocket连接打开事件。
      wx.onSocketOpen((result) => {
        console.log('WebSocket连接已打开！')
        wx.hideToast()
        that.setData({
          socktBtnTitle: '断开socket'
        })
        socketOpen = true
        for (let i = 0; i < socketMsgQueue.length; i++) {
          that.sendSocketMessage(socketMsgQueue[i])
        }
        socketMsgQueue = []
      })
       //监听WebSocket接受到服务器的消息事件
       wx.onSocketMessage((result) => {
        console.log('收到服务器内容：' + result.data)
      })
      //监听WebSocket关闭
      wx.onSocketClose((result) => {
        socketOpen = false
        console.log('WebSocket 已关闭！')
        wx.hideToast()
        that.setData({
          socktBtnTitle: '连接socket'
        })
      })
    } else {
      //关闭WebSocket连接。
      wx.closeSocket()
    }
  },

  bindViewTap() {
    wx.navigateTo({
      url: '../chat-room/index'
    })
  },

  sendSocketMessage(msg) {
    if (socketOpen) {
      //通过 WebSocket 连接发送数据，需要先 wx.connectSocket，并在 wx.onSocketOpen 回调之后才能发送。
      wx.sendSocketMessage({
        data: msg
      })
    } else {
      socketMsgQueue.push(msg)
    }
  },
  sendMessageBtnTap() {
    this.sendSocketMessage('小程序来了')
  },

  onLoad: function () {
    console.log('onLoad')
    let that = this
    //调用应用实例的方法获取全局数据
    app.getUserInfo(function (userInfo) {
      //更新数据
      that.setData({
        userInfo: userInfo
      })
    })
  }
})