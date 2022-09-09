// const { func } = require("assert-plus")
// const { resolve, reject } = require("bluebird")

// 获取全局APP
const app = getApp()
// 数据库
const DB = wx.cloud.database()
const _ = DB.command
let openId = '' 
let userArr = ["oJHaw5fIV7jFzhOq7XBe2BOy9CkI"] // 存放列表的user的openId
let arr = '' // 存放消息类型
let msgLists = []
//_openid 为当前用户的openid

Page({
  data:{
    userinfo: {},
    messages: [],
    msgUserLists: [],
    lastMessage: "",
    userName: "",
    userStatus: "",
    userImgUrl: "",
  },
  toChatRoom(e) {
    console.log(e)
    console.log(e.currentTarget)
    let index = e.currentTarget.dataset.userindex;
    let userid = this.data.msgUserLists[index]["openid"];
    console.log(userid)
    wx.navigateTo({
      url: `/pages/chat-room/index?userId=`+userid,
    })
  },
  loadMessageList: function () {
   //userArr = []
   console.log('arr',arr)
    for(let it of arr){
      let j = 0;
      for( ; j < userArr.length; j++){
        if(it.userId === userArr[j]){
          console.log('消息有记录')
          break;
        }
      } // 不记录重复的
      if(j === userArr.length){
        userArr.push(it.userId) 
        console.log('需要增加userId')
      }
    }  
    console.log('消息用户列表的openid(userid)', userArr)
    wx.cloud.callFunction({
      name: "cloudUser",
      data: {
        $url: "messageUserList",
        userArr
      }
    }).then( res => {
      wx.hideLoading()
      this.setData({
        msgUserLists: res.result
      })
      console.log('msgUserLists', this.data.msgUserLists)
      //this.getMsgList()
    })
  },

    /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    openId = wx.getStorageSync('openId')

    wx.showLoading({
      title: '列表加载中',
    })
    wx.cloud.callFunction({
      name: "cloudUser",
      data: {
        $url: "messageUserList",
        userArr
      }
    }).then( res => {
      wx.hideLoading()
      this.setData({
        msgUserLists: res.result
      })
      console.log('msgUserLists', this.data.msgUserLists[0].avatarUrl)
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    console.log('onshow----')
    new Promise((resolve, reject) => {
      wx.cloud.callFunction({
        name: "messageList",
        data: {
          $url: "messageList",
          openId
        }
      }).then( res => {
        console.log('messages: ', res.result.data)
        arr = res.result.data // 储存消息的列表
        for(let it of arr) {
          // 处理对方发送的数据，把_openid 与 userId互换
          if(it._openid !== openId){
            let temp = it._openid;
            it._openid = it.userId;
            it.userId = temp;
          }
        }
        this.setData({
          messages: res.result.data
        })
        resolve()
      })
    }).then(res=>{
      this.loadMessageList()
      console.log(this.data.messages, arr)
      //this.getMsgList()
      //console.log('msgUserLists', this.data.msgUserLists)
    }),
    // wx.cloud.callFunction({
    //   name: "messageList",
    //   data: {
    //     $url: "remove",
    //     delname: "oJHaw5fIV7jFzhOq7XBe2BOy9CkI"
    //   }
    // }).then(
    //   console.log('remove success!')
    // )
    
    wx.setNavigationBarTitle({
      title: '聊天列表',
    })
  },
  
  // getMsgList() {
  //   let alert = false;
  //   let lastMsg = "";
  //   let userArrLen = userArr.length;
  //   let messagesLen = 0;
  //   console.log(typeof this.data.msgUserLists[0])
  //   for(let i = 0; i < userArrLen; i++) {
  //     messagesLen = this.data.messages[i].Message.length;
  //     lastMsg = this.data.messages[i].Message[messagesLen-1].content;
  //     this.data.msgUserLists[i]["lastMsg"] = lastMsg;
  //     // this.data.msgUserList[i]['alert'] = false;
  //     msgLists.push({"avatarUrl":this.data.msgUserLists[i]["avatarUrl"],"nickName":this.data.msgUserLists[i]["nickName"] ,'lastMsg':lastMsg, 'alert': alert});
  //   }
  //   console.log('msgLists:' + msgLists +'msgUL' + this.data.msgUserLists)
  // },
  loadUserInfo(userId) {
    wx.cloud.callFunction({
      name: 'cloudUser',
      data: {
        $url: "loadUserinfo",
        userId: userId
      }
    }).then( res => {
      console.log('call loadUserinfo success ', res)
      this.setData({
        leftUserinfo: res.result.data[0]
      })  //bug--------------
    })
    console.log('createTime', DB.serverDate())
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
  // getImg: function(event) {
  //   let i = event.currentTarget.dataset.index;
  //   let openid = messages[i].userid;
  //   let url = "";
  //   for(let it of userArr){
  //     if(it.openid == openid){
  //       url = it.avatarUrl;
  //       break;
  //     }
  //   }
  //   return url
  // }
})