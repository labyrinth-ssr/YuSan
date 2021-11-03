// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

const DB = cloud.database();
// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  let openid = wxContext.OPENID;
  try {
    let res =  await DB.collection("chat-users").doc(openid).get();
    console.log('get user-chat User', res.data)
    return {
      errMsg:'cloud.Anth.callFunction:ok',
      result:res.data
    }
  } catch (error) {
    return {
      errMsg:'cloud.auth:false',
      errCode:-1
    }
  }
}