//index.js
const app = getApp()
const db = wx.cloud.database()
const users = db.collection('chat-users')
const _=db.command

Page({
  data: {
    latitude:'',
    longitude:'',
    markers: [],
  },
  init_loc(){
    wx.getLocation({
      type: 'gcj02',
      success: (res) => {
        var avatarUrl='../../images/2求伞.png'
        var newMarker=[{id:0,latitude:res.latitude,longitude:res.longitude,iconPath:avatarUrl,width:30,height:30}];
        this.setData({
                latitude: res.latitude,
                longitude: res.longitude,
                markers:newMarker
              });
      }
    })
  },
  to_chat(e){
    console.log(e)
    console.log(e.detail)
    console.log(e.detail.markerId-1)
    
    wx.navigateTo({
      url: `/pages/chat-room/index?userId=`+this.data.markers[e.detail.markerId-1].title,
        })
  },
  update_map(){
    users.limit(19)
          .watch({
    onChange: (snapshot)=>{//记得还有删除
      var markers=[]
      users.limit(19).get({
        success:(res)=>{
          console.log('change db',res.data)
          var cnt=0;
          res.data.forEach((ele)=>{
            if('location' in ele){
              markers.push({id:cnt,longitude:ele.location.longitude,
                latitude:ele.location.latitude,iconPath:ele.avatarUrl,width:30,height:30,
                title:ele.openid,
               anchor:{x:0.5,y:0.5}
                },{id:cnt+1,longitude:ele.location.longitude,
                  latitude:ele.location.latitude,iconPath:'../../images/'+(ele.gender+1)+ele.status+'.png',width:41,height:41,
                  anchor:{x:0.5,y:0.5}
                  })
              cnt +=2;
            }
          })
          console.log('markers',markers)
          this.setData({
            markers:markers
          })
        },
        fail:(res)=>{
          console.log('watch fail',res)
        }
        
      })
      
    },
    onError:(err)=>{
  console.log('watch error',err)
    }
  })
  },
  
  onLoad:function(){
    wx.authorize({
      scope: 'scope.userLocation'
    })
    

    this.init_loc();
  },
  onShow:function(){
    update_loc(this);
    this.update_map();
    wx.setNavigationBarTitle({
      title: '雨伞-发现',
    })
  }
//   ,
//   showMap() {
//     //使用在腾讯位置服务申请的key（必填）
//     const key = "6R5BZ-G44K6-Q62SS-MOACI-7T5VQ-PQBDB"; 
//     //调用插件的app的名称（必填）
//     const referer = "app"; 
//     wx.navigateTo({
//         url: 'plugin://chooseLocation/index?key=' + key + '&referer=' + referer
//     });
// }
})

function getPermission(obj) {
  console.log("getPermission");
  wx.getLocation({
    type: 'gcj02',
    success: function (res) {
      console.log("success  === "+JSON.stringify(res));
      //显示经纬度信息
      obj.setData({
        latitude: res.latitude,
        longitude: res.longitude
      });
    },
    fail: function (res) {
      console.log("fail == "+JSON.stringify(res));
      //获取位置信息失败，判断是否存在位置权限未给予，造成的影响
      if (!obj.data.getLocationFailAgain){
        console.log("首次失败  查询位置权限的授权情况");
        obj.setData({
          getLocationFailAgain:true
        });
        wx.getSetting({
          success: function (res) {
            var statu = res.authSetting;
            if (!statu['scope.userLocation']) {
              wx.showModal({
                title: '是否授权当前位置',
                content: '需要获取您的地理位置，请确认授权，否则地图功能将无法使用',
                success: function (tip) {
                  if (tip.confirm) {
                    wx.openSetting({
                      success: function (data) {
                        if (data.authSetting["scope.userLocation"] === true) {
                          wx.showToast({
                            title: '授权成功',
                            icon: 'success',
                            duration: 1000
                          })
                          //授权成功之后，再调用定位进行位置获取
                          getPermission(obj);
                        } else {
                          wx.showToast({
                            title: '授权失败',
                            icon: 'success',
                            duration: 1000
                          });
                          obj.setData({
                            latitude: 39.909729,
                            longitude: 116.398419
                          });
                        }
                      }
                    })
                  }else{
                    //点击取消操作
                    wx.showToast({
                      title: '授权失败',
                      icon: 'success',
                      duration: 1000
                    });
                    obj.setData({
                      latitude: 39.909729,
                      longitude: 116.398419
                    });
                  }
                }
              })
            }
          },
          fail: function (res) {
            wx.showToast({
              title: '调用授权窗口失败',
              icon: 'success',
              duration: 1000
            })
            //失败则采取中国北京作为地图显示
            obj.setData({
              latitude: 39.909729,
              longitude: 116.398419
            });
          }
        })
      }
      
    }
  })
}

function update_loc(obj){
  
  // wx.authorize({scope: 'scope.userLocationBackground'})
  wx.startLocationUpdateBackground({
    success: (res) => {
      console.log('开启后台定位',res)
    },
    fail:(res)=>{
      console.log('fail',res)
        // 判断用户是否拒绝了授权
        wx.getSetting({
          success: res => {
            console.log(res.authSetting['scope.userLocation'])
            wx.authorize({scope: 'scope.userLocationBackground'})
          }
        });
      
    }
  })
  wx.onLocationChange(function(res) {
    console.log('global',app.globalData.openid)
    users.where({
      openid:app.globalData.openid
    })
    .update({
      data:{
        location:db.Geo.Point(res.longitude,res.latitude)
      },
      success:(res)=>{
        console.log('update db location',res)
      }
    })
  })
}
