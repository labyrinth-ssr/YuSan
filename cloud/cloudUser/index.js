// 云函数入口文件
const cloud = require('wx-server-sdk')
const tcbRouter = require('tcb-router')

cloud.init()

const DB = cloud.database();
const _ = DB.command;

// 云函数入口函数
exports.main = async (event, context) => {
  console.log(event)

  const app = new tcbRouter({
    event
  })

  app.use(async(ctx, next) => {
     console.log(event)
    ctx.data = {}
    ctx.data.openId = event.userInfo.openId
    ctx.body = {
      data: ctx.data
    }
    await next()
  })

  app.router("loadUserinfo", async(ctx, next) => {
    let userList = await DB.collection("chat-users")
      .where({
        openid: event.userId
      })
      .get()
      .then(res => {
        console.log(res)
        return res
      })
      ctx.body = userList
  })

  app.router("addUserinfo", async(ctx,next) => {
    await DB.collection("chat-users").add({
      data: {
        "nickName": event.nickName,
        "avatarUrl": event.avatarUrl,
        "openid": event.openid,
        "province": event.province,
        "city": event.city,
        "gender": event.gender,
        "status": event.status,
        'location':DB.Geo.Point(0,0)
      }
    })
  })
  // 加载消息列表
  app.router("messageUserList", async(ctx, next) => {
    const UserArr = event.userArr
    let userList = []
    for(let j = 0; j <UserArr.length; j++) {
      let list = await DB.collection("chat-users").where({
        openid: UserArr[j]
        })
        .get()
        .then( res => {
          console.log('userList: ', res.data[0])
          userList.push(res.data[0])
          return res
        })
        //userList.push(list)
    }
    console.log('all list', userList)
    ctx.body = userList
  })

  return app.serve()
}