/// <reference path="../types.d.ts" />

var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

/** 当前题号 */
var index = 0

var nowAcceptAnswers = false

/** 还活着多少人 */
var peopleLeft = 0

/** @type {Server.Question[]} */
var questions = require('./defaultQuestions');

/** @type {Server.Player[]} */
var players = []

/**
 * 处理一个新的管理员连接
 * @param {SocketIO.Socket} socket
 */
function adminLogin(socket) {
  /** @type {Server.Admin} */  var admin = { socket }
  socket.join('admin')

  socket.on("useQuiz", payload => { questions = payload.questions })
  socket.on("nextQuestion", emitNextQuestion)
  socket.on("showWait", emitWait)
  socket.on("showAnswer", statAndEmitAnswer)
  socket.on("showScore", emitScoreBoard)
}

/** 开始一局新的游戏 */
function startGame() {
  players.forEach(player => {
    player.life = 3
    player.score = 0
  })
  peopleLeft = players.length
  index = -1
  io.to("player").emit("wait", {})
}

/** 给玩家发布下一题 */
function emitNextQuestion() {
  if (index >= questions.length - 1) return false
  index++
  nowAcceptAnswers = true

  let question = questions[index]

  players.forEach(player => {
    player.answer = -1

    player.socket.emit('question', /** @type {ServerToUser.Question} */({
      answerable: player.life > 0,
      chance: player.life > 0 ? player.life - 1 : 0,
      index: index + 1,
      total: questions.length,
      question: question.question,
      options: question.options,
      time: 15000,
      peopleLeft: peopleLeft,
    }))
  })
}

/** 给玩家发送等待屏 */
function emitWait() {
  io.to('player').emit('wait', {})
}

/** 给玩家发布答案，并统计得分、复活之类的事情 */
function statAndEmitAnswer() {
  let question = questions[index]

  /** @type {Set<Server.Player>} */
  let resurrection = new Set()

  /** @type {Set<number[]>} */
  let optionNumbers = new Array(question.options.length).fill(0)

  // 先更新统计
  players.forEach(player => {
    if (player.answer >= 0 && player.answer < question.options.length) {
      optionNumbers[player.answer]++
    }

    if (player.answer !== question.answer.index) {
      // 如果这个玩家没被淘汰
      if (player.life > 0) {
        // 并且答错了
        player.life--
        // 使用了复活机会?
        if (player.life > 0) {
          resurrection.add(player)
          player.score++
        } else {
          peopleLeft-- // 他死了
        }
      }
    } else {
      // 答对了
      player.score++
    }
  })

  // 再发送战况
  players.forEach(player => {
    player.answer = -1

    player.socket.emit('answer', /** @type {ServerToUser.Answer} */({
      index: index,
      total: questions.length,
      question: question.question,
      options: question.options,
      correctAnswer: question.answer.index,

      yourChance: Math.max(0, player.life - 1),
      yourAnswer: player.answer,

      optionNumbers,
      resurrectionNumber: resurrection.size,
      peopleLeft,
    }))
  })
}

/** 给玩家发送得分榜 */
function emitScoreBoard() {
  var playerSorted = players.filter(p => p.score >= questions.length - 2).sort((a, b) => b.score - a.score)
  io.to('player').emit('score', /** @type {ServerToUser.Score} */({
    users: playerSorted.map(player => /** @type {ServerToUser.Score['users'][0]} */({
      id: player.openid,
      avatar: player.avatar,
      name: player.name,
      score: player.score,
    }))
  }))
}

/**
 * 处理一个新的玩家连接
 * @param {SocketIO.Socket} socket
 */
function playerLogin(socket) {
  // 如果用户还没授权微信登录
  if (false) {
    socket.emit('connectInfo', {
      id: "", name: "", avatar: "",
      redirect: "https://wx.qq.com/xxx"
    })
    return
  }

  /** @type {Server.Player} */
  var player = {
    avatar: "http://profilepicturesdp.com/wp-content/uploads/2018/06/avatar-profile-pictures-3.png",
    name: "蜜汁玩家",
    openid: "wxID-12345",
    life: 0, // 开局时重置
    score: 0,
    answer: -1,
    socket,
  }

  players.push(player)
  socket.join('player')
  socket.on('disconnect', () => {
    let idx = players.indexOf(player)
    if (idx >= 0) players.splice(idx, 1)
  })

  socket.on('answer',  /** @param {UserToServer.Answer} incoming */(incoming) => {
    if (!nowAcceptAnswers) return // 现在不接受回答
    if (player.life <= 0) return // 没生命了
    if (player.answer !== -1) return // 已经作答

    player.answer = incoming.answer
  })

  socket.emit('connectInfo', /** @type {ServerToUser.ConnectInfo} */({
    id: player.openid,
    avatar: player.avatar,
    name: player.name,
    redirect: "",
  }))
}

io.on('connection', function (socket) {
  var ref = socket.handshake.query.ref + ""
  if (ref === "/admin") {
    adminLogin(socket)
  } else {
    playerLogin(socket)
  }
})

app.use(require('express').static(require('path').resolve(__dirname, '../dist/')))
http.listen(8801, function () {
  console.log('listening on *:8801');
});
