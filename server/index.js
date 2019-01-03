var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
import data from './data'
import { latexToDOM } from './util'

app.get('/admin', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});
app.use(require('express').static(require('path'.resolve(__dirname, '../dist/'))))

/**
 * 全局变量
 * 每个人的类型为{ id: string, name : string}
 */
var onlines = []  //同时在线的人员数据
var admins = []   //同时在线的admin
var Index = 0     //即将发送的题目编号
var Total = 12    //总题目数量,达到这个数则停止. 而 data 中的题目数量会超过 Total. 将来要从 data 中随机抽取题目
var NowQuzi = {}  //当前的题目.考虑到有些人网速慢,延迟加载,或者可能断线重连, 要给他们同步当前题目
/**
 * 事件部分,共有5种客户端到server 的事件
 * 1. user 或 admin 链接
 * 2. user 或 admin 断开连接
 * 3. user 选择一个选项
 * 4. admin 发送下一题
 * 5. admin reset
 */

io.on('connection', function (socket) {
  var USER = { id: socket.id, date: (new Date()).toLocaleString(), choice: [] } // 本次链接的 USER
  /**
   * 一名用户或 admin 链接
   */
  socket.on('client connected', name => {
    console.log(name, ' connected ')
    USER.name = name
    onlines.push(USER)
    socket.emit('server patchQuestion', NowQuzi)
  })
  socket.on('admin connected', name => {
    console.log(`admin ${name} connected`)
    USER.name = name
    admins.push(USER)
    patchOnlines()
  })
  /**
   * USER 或 admin 断开连接
   */
  socket.on('disconnect', () => {
    console.log(`${USER.name} disconnected `)
    if (onlines.indexOf(USER) !== -1) {
      onlines.splice(onlines.indexOf(USER), 1)
    } else if (admins.indexOf(USER) !== -1) {
      admins.splice(admins.indexOf(USER), 1)
    }
  })
  /**
   * 用户选择了一个选项
   */
  socket.on('client choosed', o => {
    console.log(USER, o.quizIndex, o.choiceIndex)
    USER.choice[o.quizIndex] = o.choiceIndex
  })
  /**
   * 管理员选择发送下一题
   */
  socket.on('admin next', () => {
    if (Index == Total) {

      return
    }
    let singleQuestion = data[Index]
    singleQuestion.Total = Total
    singleQuestion.Index = Index++
    singleQuestion.question = latexToDOM(singleQuestion.question)
    singleQuestion.options = singleQuestion.options.map(x => latexToDOM(x))
    console.log(`singleQuestion : ${singleQuestion}`)
    if (singleQuestion) {
      patchQuestion(singleQuestion)
      NowQuzi = singleQuestion
    }
  })
  socket.on('admin reset', () => {
    Index = 0
    onlines.forEach(x => x.choice = [])
    patchQuestion({})
  })
});

/**
 * 函数部分, 共有4种 server 到 client 的处理函数
 * 1.向全员广播一个题目, 附带总题目数量
 * 2.向全员广播上题答案
 * 3.向所有管理员发送 onlines 信息
 * 4.向所有管理员发送 用户们选择的选项信息
 */

/**
 * 向全员广播一个题目
 * question.limitSeconds 控制一道题允许的时间, 单位:s 如果为空, 前端会默认15s
 */
function patchQuestion(question) {
  if (onlines.length) {
    onlines.forEach(x => {
      let socket = io.sockets.connected[x.id]
      if (socket) {
        socket.emit('server patchQuestion', question)
      }
      else {
        console.log('patchQuestion Error onlines:', onlines)
        console.log(x.id)
      }
    })
  }
}
/**
 * 向全员广播上题答案
 */
function pathchAnswer(io, question) {
  io.emit('server patchAnswer', {})
}
/**
 * 向所有管理员发送 onlines 信息, 每秒同步一次
 */
setInterval(patchOnlines, 1000)

function patchOnlines() {
  if (admins.length) {
    admins.forEach(x => {
      let socket = io.sockets.connected[x.id]
      if (socket) {
        socket.emit('server onlines', onlines)
      }
      else {
        console.log('admins not found,admins:', admins)
        console.log(x.id)
      }
    })
  }

}
http.listen(8801, function () {
  console.log('listening on *:8801');
});
