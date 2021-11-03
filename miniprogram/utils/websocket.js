
let socket = null;
let socketOpen = false;
import Websocket from 'ws';

let app = getApp();

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
        url: config.WebsockerServer,
      })
    }
  },
})