// 获取全局APP
const app = getApp();
// 数据库
const DB = wx.cloud.database();
// 聊天侦听器
var chat_watcher = null
Page({
  data: {
    login: false,
    userInfo: {},
    hasUserInfo: false,
    canIUseGetUserProfile: false,
    userList: [],
    setStatus: false,
    status: "",
    openId:""
  },
to_map(){
  wx.navigateTo({
    url: '../map/map',
  })
},
  toChatList(event) {
    console.log('进入聊天列表')
    wx.switchTab({
      url: '../chat-list/index',
    })
    // wx.navigateTo({
    //   url:'../chat-list/index'
    // }) 在bartab中定义过的url无法跳转
  },
  
  onLoad: function (options) {
    if(wx.getUserProfile){
      this.setData({
        canIUseGetUserProfile: true
      })
    }
    this.userAuthentication();
    // this.getUserList();
  },
  userAuthentication() {
    // 身份校验, 同时获取openid
    console.log('身份校验')
    wx.cloud.callFunction({
      name: 'getOpenData',
      complete:res=>{
        this.setData({
          openId: res.result.openid
        })
        wx.setStorageSync('openId', this.data.openId)
        DB.collection("chat-users").where({
          openid: res.result.openid   //进行筛选
        })
        .get({
          success:res=>{
            console.log('userList length: ' + res.data.length)
            if(res.data.length==0){
              //通过判断data数组长度是否为0来进行下一步的逻辑处理
              this.setData({
                login: false,
              })
            } else {
              this.setData({
                login: true,
              })
            } 
          }
        })
      }
    })
  },
  // getUserList() {
  //   // const list = wx.cloud.database().collection('chat-users');
  //   // const dbList = await list.get()
  //   // console.log('getuserlist', dbList)
  //   wx.cloud.callFunction({
  //     name: 'getUsers',
  //     success: res => {
  //       console.log('getuserlist', res.result)
  //       // this.setData({
  //       //   userList = res.result.
  //       // })
  //     },
  //     fail: res => {
  //       console.log('fail to get user list',res)
  //     }
  //   })
  // },
  // userRegister(userInfo) {
  //   console.log('注册用户...')
  //   return new Promise(function (resolve, reject){
  //     DB.collection('chat-users').add({
  //       data: {
  //         userInfo: userInfo
  //       },
  //       success: res => {
  //         resolve(res)
  //       },
  //       fail: res => {
  //         reject(res)
  //       }
  //     })
  //   })
    
  // },
  /**获取用户status信息 */
  haveUmbrella: function() {
    this.setData({
      status: "有伞"
    })
    this.SetStatus()
    wx.navigateTo({
      url: '../map/map'
    })
  },
  noUmbrella: function() {
    this.setData({
      status: "求伞"
    })
    this.SetStatus()
    wx.navigateTo({
      url: '../map/map'
    })
  },
  SetStatus: function() {
    this.setData({
      setStatus: true
    })
    console.log('setStatus: ', this.data.status)
    this.onReady()
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {},
  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {},
  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {},
  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {},
    /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {},
    /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {
    console.log('user login: ', this.data.login)
    if(this.data.setStatus && !this.data.login){
      // 向数据库中添加用户
      wx.cloud.callFunction({
        name: 'cloudUser',
        data: {
          $url: 'addUserinfo',
          nickName: this.data.userInfo.nickName,
          avatarUrl: this.data.userInfo.avatarUrl,
          province: this.data.userInfo.province,
          city: this.data.userInfo.city,
          gender: this.data.userInfo.gender,
          status: this.data.status,
          openid: this.data.openId
        },
        success: res => {
          console.log('call cloudUser-- addUserinfo success', res)
        },
        fail: res => {
          console.log('call cloudUser-- addUserinfo fail', res)
        },
        complete: () => {
        }
      })
    }
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {},

  /**获取用户信息 userInfo */
  getUserProfile(event) {
    wx.getUserProfile({
      desc: '用于完善资料',
      success: res => {
        console.log('getUserProfile',res)
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
        console.log(this.data.userInfo)
        wx.setStorageSync('userInfo', this.data.userInfo)
            // this.setData({
            //   openId: wx.getStorageSync('openId')
            // })
          
          // this.userRegister(this.data.userInfo)
          // .then(r => {
          // console.log(r)
          // this.setData({
          //   login: true
          //   })
          // })
        
      }
    })
    
    
  },
})
