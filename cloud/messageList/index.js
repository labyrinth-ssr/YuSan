// 云函数入口文件
const cloud = require('wx-server-sdk')
const TcbRouter = require('tcb-router')

cloud.init()
const DB = cloud.database()
const _ = DB.command

// 云函数入口函数
// exports.main = async (event, context) => {
//   return await DB.collection("chat-msg")
//     .where(
//       _.or([
//               {_openid:event.openId},
//               {userId: event.openId}
//             ])
//     )
//     .get()
//     .then( res => {
//       console.log('messagelit: ', res)
//       return res
//     })
// }

// 云函数入口函数
exports.main = async (event, context) => {
  const app = new TcbRouter({
    event
  })

  app.router("message", async (ctx, next) => {
    
    let messageList = await DB.collection("chat-msg").where({
      _openid: _.or(_.eq(event.openId), _.eq(event.userId))
      }).get()
      .then( res => {
        console.log('call message: ', res)
        return res
      })
      ctx.body = messageList
  })

  app.router("remove", async (ctx, next) => {
    await DB.collection("chat-msg").where({
      _openid: event.delname
    }).remove()
    .then(
      console.log("removed!")
    )
  })

  app.router("messageList", async (ctx, next) => {
    let messageList = await DB.collection("chat-msg").where(
      _.or([
        {_openid:event.openId},
        {userId: event.openId}
      ])
    )
    .get()
    .then( res => {
      console.log('messagelit: ', res)
      return res
    })
    ctx.body = messageList
      
  })
  
  return app.serve()
}