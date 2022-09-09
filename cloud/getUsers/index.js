// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
const DB = cloud.database()
const Users = 'chat-users'

// 云函数入口函数
exports.main = async (event, context) => {

  return DB.collection('chat-users').get();
}