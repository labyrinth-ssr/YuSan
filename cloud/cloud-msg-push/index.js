// 云函数入口文件
const cloud = require('wx-server-sdk')
// 加解密工具
const crypto = require('crypto')
cloud.init()
const DB = cloud.database();
// 时间工具
const timeutil = require('./timeutil');

// 用户姓名表
const Users = 'chat-users';
// 用户发送消息表
const Msg = 'chat-mags';

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()

  let openid = wxContext.OPENID || event.openid;
  let userinfo = await DB.collection(Users).doc(openid).get();
  // 获取用户信息
  let userInfo = userinfo.data.userInfo;
  // 获取消息类型
  let msgType = event.msgType || 'text';
  // 获取会话房间号
  let roomId = event.roomId || 1;
  switch(msgType) {
    case 'text': {
      let content = event.content;
      let res = await contentSafe(content);
      console.log('文本内容检查结果' + res);
      if(res.result.code === 0) {
        // 文本检查通过
        return await DB.collection(Msg).add({
          data: {
            roomId,
            openid,
            msgType,
            content,
            userInfo,
            createTime: timeutil.TimeCode()
          }
        })
      }
      break
    }
    case 'image': {
      let content = event.content;
      let res = await imageSafe(event.content);
      console.log('图片安全检查结果' + res)
      // 将图片存入云储存
      const hash = crypto.createHash('md5');
      hash.update(content, 'utf8')
      const md5 = hash.digest('hex')
      console.log('文件唯一md5编码', md5)
      let fileId = "";
      wx.cloud.uploadFile({
        cloudPath: 'cloud-chat' + md5 + '.png',
        fileContent: Buffer.from(content, 'base64'),
        success: res => {
          console.log("upload image sucess", res)
          fileId = res.fileId;
        },
        fail: console.error
      })
      if(res.result.code === 0) {
        // 图片合格
        return await DB.collection(Msg).add({
          data: {
            roomId,
            openid,
            msgType,
            content: fileId,
            userInfo,
            createTime: timeutil.TimeCode()
          }
        })
      }
      break
    }
  }
}

async function contentSafe(content) {
  return await cloud.callFuntion({
    name: 'opeapi',
    data: {
      action: 'msgCheck',
      content: content
    }
  })
}

async function imageSafe(content) {
  return await cloud.callFunction({
    name: 'openapi',
    data: {
      action: 'imgCheck',
      contentType: 'image/png',
      content: content
    }
  })
}