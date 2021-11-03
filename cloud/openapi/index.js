// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

// 云函数入口函数
exports.main = async (event, context) => {
  console.log('openid event action: ' + event.action);
  const wxContext = await cloud.getWXContext();
  switch(event.action) {
    case 'msgCheck':
      msgCheck(event);
      break;
    case 'imgCheck':
      imgCheck(event);
      break;
    // case 'getOpenData':
    //   getOpenData(wxContext);
    //   break;
  }
}
// 获取openid
async function getOpenData(wxContext) {
  const {
    OPENID,
    APPID,
    UNIONID,
    ENV,
  } = wxContext
  console.log('openid: '+ OPENID)
  return {
    OPENID,
    APPID,
    UNIONID,
    ENV,
  }
}

async function msgCheck(event) {
  try {
    console.log('待检测文本', event.content);
    let result = await cloud.openapi.security.msgSecCheck({
      content: event.content
    })
    console.log('msgcheck result: '+ JSON.stringify(result));
    if(result && result.errCode.toString() == ' 87014') {
      return {
        code :-1,
        msg: '内容含有违法违规内容',
        data: result
      }
    } else {
      return {
        code: 0,
        msg: 'ok',
        data: result
      }
    }
  }
  catch(err) {
    if (err.errCode.toString() === '87014') {
      return {
        code: -1,
        msg: '内容含有违法违规内容',
        data: err
      } //
    }
    return {
      code: -2,
      msg: '调用security接口异常',
      data: err
    }
  }
}

async function imgCheck(event) {
  try {
    console.log('待检测图片', event.content);
    let res  = await cloud.openapi.security.imgSecCheck({
      media: {
        contentType: event.contentType,
        value: Buffer.from(event.value, 'base64')
      }
    })
    console.log(res)
    if(res && res.errCode.toString() === '80714') {
      return {
        code :-1,
        msg: '内容含有违法违规内容',
        data: res
      }
    } else {
      return {
        code: 0,
        msg: 'ok',
        data: res
      }
    }
  }
  catch (err) {
    if (err.errCode.toString() === '87014') {
      return {
        code: -1,
        msg: '内容含有违法违规内容',
        data: err
      } //
    }
    return {
      code: -2,
      msg: '调用security接口异常',
      data: err
    }
  }
}