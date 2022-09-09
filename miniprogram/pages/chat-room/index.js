// pages/chat-room/index.js

const DB = wx.cloud.database()
const _ = DB.command

let userInfo = ''
let openId = ''
let userId = ''
let fileId = ''
let content = ''

Page({

  /**
   * 页面的初始数据
   */
  data: {
    content:"",
    messageList: [],
    toView: 'msg_0', // 在该方向滚动到该元素
    sendHeight: 0,
    img:'',
    leftUserinfo: null
  },

  // bindfocus  点击输入框
  focus(event) {
    console.log('输入框高度'+event.detail.height+'scrollheight'+this.data.scrollHeight);
    this.setData({
      sendHeight : event.detail.height + 300,
      scrollHeight:`calc(100vh - 240rpx - 55rpx - ${event.detail.height + 300}rpx)`
    })
  },
  // bindblur 输入框失去焦点时触发
  blur(event) {
    this.setData({
      sendHeight: 0,
      scrollHeight: `height: calc(100vh - 240rpx - 55rpx)`
    })
  },

  // 创建聊天，先查找数据库中是否建立了带有双方消息的信息
  loadMessage() {
    wx.cloud.callFunction({
      name:'messageList',
      data: {
        $url: "message",
        openId,
        userId
      }
    }).then( res => {
      console.log('call message success ', res)
      this.setData({
        allMessage: res.result.data
      })
      let arr = res.result.data
      let i = 0
      if(arr.length ===0){
        wx.cloud.database().collection('chat-msg')
          .add({
            data: {
              Message: [],
              userId,
            }
          })
          console.log('arr.length = 0')
      } else {
        for( i = 0; i < arr.length; i++){
          // 如果id与之前存在的openid或者userid相同，则不需要创建新的message类型
          if(arr[i]._openid === openId && arr[i].userId === userId 
            || arr[i]._openid === userId && arr[i].userId === openId){
              return
          }  
        }
        if( i === arr.length ){ // messageList里面没有存用户信息
          console.log('he/she is your new friend')
          wx.cloud.database().collection("chat-msg")
            .add({
              data:{
                Message: [],
                userId
              }
            })
        }
      }
    })
  },
  // 获取聊天对象的信息，id为userId， 定义了leftUserinfo
  loadUserInfo() {
    console.log(userId)
    wx.cloud.callFunction({
      name: 'cloudUser',
      data: {
        $url: "loadUserinfo",
        userId
      }
    }).then( res => {
      console.log('call loadUserinfo success ', res)
      this.setData({
        leftUserinfo: res.result.data[0]
      })
      wx.setNavigationBarTitle({
        title: this.data.leftUserinfo.nickName + ' - ' + this.data.leftUserinfo.status,
      })  
    })
  },

  // 发送消息
  send(event) {
    console.log(event)
    content = event.detail.value
    this.setData({
      content:""
    })
    DB.collection("chat-msg").where({
      _openid: _.eq(openId).or(_.eq(userId)),
      userId:  _.eq(openId).or(_.eq(userId))
    })
    .update({ // “chat-msg“的update会触发 watch onChange
      data: {
        Message: _.push({
          openId,  // 发送这一条消息的人的openid
          content,
          userInfo,
          createTime: DB.serverDate(),
          type: "text"
        })
      }
    })
     
  },

  // 发送图片
  sendImage(event) {
    let pic = new Promise((resolve, reject) => {
      wx.chooseImage({
        count: 1,
        sizeType: ['original', 'compressed'],
        sourceType: ['album', 'camera'],
        success :(res) =>{      
          console.log('image url'+ res.tempFilePaths);
          this.setData({
            img:res.tempFilePaths[0]
          })
          resolve()
        }
      })
    })
    pic.then(res => {
      let item = this.data.img
      //const hash = crypto.createHash('md5')
      //hash.update(content, 'utf8')
      //const md5 = hash.digest('hex')
      //console.log('文件唯一md5编码', md5)
      let suffix = /\.\w+$/.exec(item)
      wx.cloud.uploadFile({
        cloudPath: `active/${Date.now()}-${Math.random()*1000}${suffix}`,
        filePath: item,
        success: res => {
          fileId=res.fileID
          console.log('upload file success, fileID: ', fileId)
          DB.collection("chat-msg").where({
            _openid:_.eq(openId).or(_.eq(userId)),
            userId:_.eq(openId).or(_.eq(userId))
          })
          .update({
            data:{
              Message: _.push({
                openId, // 发送这条消息的人的openId
                userInfo,
                content:fileId,
                createTime: DB.serverDate(),
                type: "image"
              })
            }
          })
        },
        fail : err => {
          console.log(err)
        }
      })
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options)

    userInfo = wx.getStorageSync('userInfo')
    openId = wx.getStorageSync('openId')
    userId = options.userId
    console.log(userInfo.avatarUrl, openId, userId)
    this.setData({
      openId,
      userId,
      userInfo
    })
    
    this.loadMessage()
    this.loadUserInfo()
    this.getTimeStr()//更新以前的消息显示时间
    console.log('onLoad------------------')
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    let watch = DB.collection("chat-msg")
    .where({
      _openid:_.eq(openId).or(_.eq(userId)),
      userId:_.eq(openId).or(_.eq(userId))
    })
    .watch({
      onChange: snapshot => {
        //监控数据发生变化时触发
        // console.log('docs\'s changed events', snapshot.docChanges)
        console.log('query result snapshot after the event', snapshot.docs)
        // console.log('is init data', snapshot.type === 'init')
        
        this.setData({
          messageList:snapshot.docs[0].Message,
          toView: 'msg_' + (snapshot.docs[0].Message.length - 1)
        })
        console.log(this.data.messageList)
        this.getTimeStr()
      },
      onError: err => {
        console.error('the watch closed because of error', err)
      }
    })
    console.log('onshow!!!!!!!!!!!!!!!!!!!')
  },

  getTimeStr() {
    let timeArr = [];
    for(let index = 0; index < this.data.messageList.length; index++){
      let str = "";
      let date = this.data.messageList[index].createTime;
      let publishTime = date / 1000;
      let Y = date.getFullYear(),
          M = date.getMonth() + 1,
          D = date.getDate(),
          H = date.getHours(),
          m = date.getMinutes(),
          s = date.getSeconds();
      // // 对 时 分 秒 小于10时, 加0显示 例如: 09-09 09:01
      if (H < 10) {
        H = '0' + H;
      }
      if (m < 10) {
        m = '0' + m;
      }
      if (s < 10) {
        s = '0' + s;
      }
      var nowTime = new Date().getTime() /1000;//获取此时此刻日期的秒数
      var diffValue = nowTime - publishTime,
          diff_days = parseInt(diffValue / 86400),
          diff_hours = parseInt(diffValue / 3600),
          diff_minutes = parseInt(diffValue / 60),
          diff_secodes = parseInt(diffValue);
          if (diff_days > 0 && diff_days < 3) {  
            str = diff_days + "天前";
          } else if (diff_days <= 0 && diff_hours > 0) {
            str = diff_hours + "小时前";
          } else if (diff_hours <= 0 && diff_minutes > 0) {
            str = diff_minutes + "分钟前";
          } else if (diff_secodes < 60) {
            if (diff_secodes <= 0) {
              str = "刚刚";
            } else {
              str = diff_secodes + "秒前";
            }
          } else if (diff_days >= 3 && diff_days < 30) {
            str = M + "月" + D + "日" + H + ":" + m;
          } else if (diff_days >= 30) {
            str = Y + "年" + M + "月" + D + "日" + H + ":" + m;
          }
          timeArr.push({"showTime":str})
        }
    console.log(timeArr)
    console.log(this.data.messageList)
    // 通过新建一个数组，将timeArr加入到 messageList中
    let showList = [];
    console.log('messageList type: '+typeof this.data.messageList)
    this.data.messageList.map((item, index) => {
      showList.push(Object.assign(item,timeArr[index]))
    })
    console.log(showList)
    this.setData({
      showList
    })
    
  },
  

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})