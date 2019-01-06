/// @ts-check
/// <reference path="../types.d.ts" />

var app = require('express')();
var http = new (require('http').Server)(app);
var io = require('socket.io')(http);
var WechatBridge = require('./wechatBridge');

/** 当前题号 */
var index = 0

var nowAcceptAnswers = false
var acceptAnswerUntil = 0
var answeringTime = 15000

/** 还活着多少人 */
var peopleLeft = 0

/** @type {Server.Question[]} */
var questions = require('./defaultQuestions');

/** @type {Map<string, Server.Player>} 从 openid 到玩家的映射 */
var players = new Map()

/**
 * 处理一个新的管理员连接
 * @param {SocketIO.Socket} socket
 */
function adminLogin(socket) {
  /** @type {Server.Admin} */  var admin = { socket }
  socket.join('admin')

  socket.on("getQuiz", () => { socket.emit("getQuiz", questions) })
  socket.on("useQuiz", newQuestions => { questions = newQuestions; startGame() })
  socket.on("reset", startGame)
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
  nowAcceptAnswers = false
  peopleLeft = players.size
  index = -1
  io.to("player").emit("wait", {})
}

/** 给玩家发布下一题 */
function emitNextQuestion() {
  if (index >= questions.length - 1) return false
  index++
  nowAcceptAnswers = true
  acceptAnswerUntil = +new Date() + answeringTime

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
      time: answeringTime,
      peopleLeft: peopleLeft,
    }))
  })
}

/** 给玩家发送等待屏 */
function emitWait() {
  nowAcceptAnswers = false
  io.to('player').emit('wait', {})
}

/** 给玩家发布答案，并统计得分、复活之类的事情 */
function statAndEmitAnswer() {
  let question = questions[index]

  /** @type {Set<Server.Player>} */
  let resurrection = new Set()

  /** @type {Array<number>} */
  let optionNumbers = new Array(question.options.length).fill(0)

  nowAcceptAnswers = false

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
  var playerSorted = Array.from(players.values())
    .filter(p => p.score >= questions.length - 2)
    .sort((a, b) => b.score - a.score)
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
async function playerLogin(socket) {
  let wechatAccount = await WechatBridge.getWechatAccount(socket)

  // 如果用户还没授权微信登录
  if (!wechatAccount) {
    console.log("Player not login -- " + socket.id)
    let redirect = await WechatBridge.getAuthRedirectURL(socket)
    socket.emit('connectInfo', { id: "", name: "", avatar: "", redirect })
    return
  }

  var player = players.get(wechatAccount.openid)

  if (!player) {
    console.log(`New player -- ${wechatAccount.name} -- ${socket.id}`)
    player = {
      ...wechatAccount,
      life: 0, // 开局时重置
      score: 0,
      answer: -1,
      socket,
    }
    players.set(wechatAccount.openid, player)
  } else {
    console.log(`Player reconnect -- ${wechatAccount.name} -- ${socket.id}`)
    player.socket = socket
  }

  socket.join('player')
  // socket.on('disconnect', () => {
  //   let idx = players.indexOf(player)
  //   if (idx >= 0) players.splice(idx, 1)
  // })

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

  if (nowAcceptAnswers && player.answer == -1 && player.life > 0 && (+new Date) <= acceptAnswerUntil) {
    // 如果用户在答题过程中中途断了重连，而且他还没选择答案，而且他还没死，而且还没收卷
    let question = questions[index]
    socket.emit('question', /** @type {ServerToUser.Question} */({
      answerable: player.life > 0,
      chance: player.life > 0 ? player.life - 1 : 0,
      index: index + 1,
      total: questions.length,
      question: question.question,
      options: question.options,
      time: acceptAnswerUntil - (+new Date),
      peopleLeft: peopleLeft,
    }))
  }
}

io.on('connection', function (socket) {
  var ref = socket.handshake.query.ref + ""
  console.log("Connection. Ref = " + ref)
  if (/^\/admin/.test(ref)) {
    adminLogin(socket)
  } else {
    playerLogin(socket)
  }
})

app.use(require('express').static(require('path').resolve(__dirname, '../dist/')))
http.listen(8801, function () {
  console.log('listening on *:8801');
});
