const Websocket = require('ws');
const wss = new Websocket.Server({
  port: 3080
});

wss.on('connection', function connection(ws, req) {
  console.log('connection start')

  // 发生错误
  ws.on('error', function error(erroe) {
    console.log('connection error', error)
  })

  // 断开链接
  ws.on('close', function close(close) {
    console.log('connection closed')
  })

  // 客户端发来消息
  wx.on('message', function message(message) {
    ws.send('客户端发来一条消息')
  })

  // 发送消息
  ws.send('连接已开启')
  ws.send(id + '已连接')
})