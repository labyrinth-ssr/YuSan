// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
const DB = cloud.database();
const Msg = 'chat-msgs';

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()

  // 用户身份唯一识别ID
  let openid = wxContext.OPENID;
  // 获取房间号
  let roomId = event.roomId || 1;
  // 获取计数
  let count = event.count;
  return await DB.collection(Msg).where({
    roomId
  }).skip(count).limit(20).orderBy('createTime','decs').get();
}