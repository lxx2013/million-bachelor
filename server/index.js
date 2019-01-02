var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var data = require('./data')

app.get('/', function(req, res){
  res.send(data);
});

//用于纪录的全局变量
var onlines = [] //同时在线的人员数据

io.on('connection', function(socket){
  var USER // 本次链接的 USER

  /**
   * 一名用户链接
   */
  socket.on('client conneted', user => {
    console.log(user, ' connected ')
    USER = user
    onlines.push(user)
  })
  /**
   * USER 断开连接
   */
  socket.on('disconnect', () => {
    console.log(' disconnected ')
    onlines.splice(onlines.indexOf(USER), 1)
  })
  /**
   * 用户选择了一个选项
   */
  socket.on('client choosed', choice =>{
    console.log(choice)
  })
});
/**
 * 向全员广播一个题目
 */
function patchQuestion(io,question){
  io.emit('server patchQuestion',{})
}
/**
 * 向全员广播上题答案
 */
function pathchAnswer(io,question){
  io.emit('server patchAnswer',{})
}

http.listen(3001, function(){
  console.log('listening on *:3001');
});
