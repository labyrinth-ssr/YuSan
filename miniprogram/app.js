// app.js


App({

  onLaunch() {
    //云开发环境初始化
    this.initCloud();
    // 展示本地存储能力
    const logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)

    // 登录
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
      }
    })
    wx.getSystemInfo({
      success: (result) => {
        this.globalData.StatusBar = result.statusBarHeight;
        let custom = wx.getMenuButtonBoundingClientRect();
        this.globalData.Custom = custom;
        this.globalData.CustomBar = custom.bottom + custom.top - result.statusBarHeight;
        }
      },
    )
    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              // 可以将 res 发送给后台解码出 unionId
              this.globalData.userInfo = res.userInfo

              // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
              // 所以此处加入 callback 以防止这种情况
              if (this.userInfoReadyCallback) {
                this.userInfoReadyCallback(res)
              }
            }
          })
        }
      }
    })
  },
  // getUserInfo(res) {
  //   var that = this
  //   if(this.globalData.userInfo){
  //     typeof res == "function" && res(this.globalData.userInfo)
  //   }else{
  //     //调用登录接口
  //     wx.login({
  //       success: function () {
  //         wx.getUserInfo({
  //           success: function (result) {
  //             that.globalData.userInfo = result.userInfo
  //             typeof res == "function" && res(that.globalData.userInfo)
  //           }
  //         })
  //       }
  //     })
  //   }
  // },
  initCloud() {
    let that = this;
    wx.cloud.init({
      env: "cloud1-9g0dk1xw1b9237b3",
      traceUser: true,
    })
    wx.cloud.callFunction({
      name: 'getOpenData',
      success: res => {
        console.log("getopendata",res)
        this.globalData.openid = res.result.openid
        //异步配置缓存
        wx.setStorageSync('openid', res.result.openid)
      }
    })
  },
  
  globalData: {
    userInfo: null,
    openid: ''
  }
})
