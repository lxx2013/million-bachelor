/// @ts-check
/// <reference path="../types.d.ts" />

const IS_PROD = process.argv.includes('--prod')
if (!IS_PROD) {
  console.warn("Server is in development mode! Don't forget --prod in production env.")
}

const Express = require('express')
const Path = require('path')

var app = Express();
var http = new (require('http').Server)(app);
var io = require('socket.io')(http);
var debounce = require('lodash.debounce');
var WechatBridge = require('./wechatBridge');
var GaLiaoManager = require('./gaLiao');

WechatBridge.init("wxbfeab713561ea29c", "2facca9696b23da9d79dda2aca8ef663", !IS_PROD)

const WSHostPrefix = "https://k-on.live"
const AUTO_ENTER_WAIT = IS_PROD

const STATUS_IDLE = 0
const STATUS_QUESTION = 1
const STATUS_ANSWER = 2
const STATUS_SCORE = 3
var status = STATUS_IDLE

/** 当前题号 */
var index = -1

/** 当前题目是否已经统计答案 -- 避免管理员重复发送 "answer" 出错 */
var currentQuestionStated = true

/**
 * 本题复活的人（在发送答案的时候更新）
 * @type {Set<Server.Player>}
 */
let resurrection = new Set()

/**
 * 当前题目各个选项的人数（在用户做出选项时实时更新）
 *  @type {Array<number>}
 */
let optionNumbers = [0, 0, 0, 0]

/** 这一项仅用于为断线重连的用户计算时间。是否可以答题，参考 status 变量 */
var acceptAnswerUntil = 0
const answeringTime = 10000
const answeringAcceptableDelay = 3000

/** 还活着多少人 */
var peopleLeft = 0

/** @type {Server.Question[]} */
var questions = require('./defaultQuestions');

/** @type {Map<string, Server.Player>} 从 openid 到玩家的映射 */
var players = new Map()

var galiao = new GaLiaoManager(io)

/**
 * 处理一个新的管理员连接
 * @param {SocketIO.Socket} socket
 */
function adminLogin(socket) {
  /** @type {Server.Admin} */  var admin = { socket }
  socket.join('admin')
  socket.join(galiao.roomName)
  socket.emit('chat', { messages: galiao.historyMsgs })

  socket.on("getStatus", sendAdminStatus)
  socket.on("getQuiz", () => { socket.emit("getQuiz", questions) })
  socket.on("useQuiz", newQuestions => { questions = newQuestions; startGame() })
  socket.on("reset", startGame)
  socket.on("nextQuestion", emitNextQuestion)
  socket.on("showWait", emitWait)
  socket.on("showAnswer", statAndEmitAnswer)
  socket.on("showScore", emitScoreBoard)
  socket.on("sendCode", sendCodeForWinner)

  sendAdminStatus()
}

var __statusTimeout = null

/**
 * 设置状态 -- 如果是 STATUS_ANSWER 或者 STATUS_QUESTION，在一小段时间后会自动切回 STATUS_IDLE
 * @param {number} newStatus
 */
function setStatus(newStatus) {
  if (__statusTimeout) {
    clearTimeout(__statusTimeout)
    __statusTimeout = null
  }

  status = newStatus

  if (status === STATUS_IDLE) {
    io.to('player').emit('wait', {})
  }

  if (AUTO_ENTER_WAIT && status === STATUS_QUESTION) {
    __statusTimeout = setTimeout(() => {
      __statusTimeout = 0
      setStatus(STATUS_IDLE)
    }, answeringAcceptableDelay + answeringTime)
  }

  if (AUTO_ENTER_WAIT && status === STATUS_ANSWER) {
    __statusTimeout = setTimeout(() => {
      __statusTimeout = 0
      emitWait()
    }, 5000)
  }

  sendAdminStatus()
}

const sendAdminStatus = debounce(function () {
  /** @type {ServerToAdmin.Status['players']} */
  var playersTmp = Array.from(players.values()).map(p => ({
    ...p, socket: null,
    connected: p.socket.connected,
  })).sort((a, b) => b.score - a.score)

  /** @type {ServerToAdmin.Status} */
  var payload = {
    status, peopleLeft, index: index + 1, total: questions.length,
    question: questions[index] || null,
    resurrectionNumber: resurrection.size,
    players: playersTmp,
    optionNumbers,
    currentQuestionStated,
  }

  io.to('admin').emit('status', payload)
}, 200)

/** 开始一局新的游戏 */
function startGame() {
  var kickOutPlayerIDs = new Set()

  players.forEach(player => {
    player.life = 3
    player.score = 0
    if (!player.socket.connected) kickOutPlayerIDs.add(player.openid)
  })

  // 踢掉断开了连接的玩家
  kickOutPlayerIDs.forEach(id => players.delete(id))

  setStatus(STATUS_IDLE)
  peopleLeft = players.size
  index = -1
  currentQuestionStated = true
  io.to("player").emit("wait", {})
}

/** 给玩家发布下一题 */
function emitNextQuestion() {
  if (index >= questions.length - 1) return false
  let question = questions[++index]

  resurrection.clear()
  optionNumbers = new Array(question.options.length).fill(0)
  acceptAnswerUntil = +new Date() + answeringTime + answeringAcceptableDelay
  currentQuestionStated = false
  setStatus(STATUS_QUESTION)

  players.forEach(player => {
    player.answer = -1
    sendQuestionSceneToPlayer(player)
  })
}

/** 给玩家发送等待屏 */
function emitWait() {
  setStatus(STATUS_IDLE)
}

/** 给玩家发布答案，并统计得分、复活之类的事情 */
function statAndEmitAnswer() {
  // 如果没统计的话
  if (!currentQuestionStated) {
    const question = questions[index]
    if (!question) return

    currentQuestionStated = true
    resurrection.clear()

    // 更新统计
    players.forEach(player => {
      if (player.answer !== question.answer.index) {
        if (player.life > 1) {
          // 能复活
          player.score++
          player.life--
          resurrection.add(player)
        } else if (player.life == 1) {
          // 最后一条命，死了
          player.life = 0
          peopleLeft--
        }
      } else {
        // 答对了
        player.score++
      }
    })
  }

  // 为每一个人发送当前题目的答案
  players.forEach(sendAnswerSceneToPlayer)
  setStatus(STATUS_ANSWER)
}


/**
 * 为一个用户发送当前题目的选择界面、他能不能做出选项、复活机会次数之类的信息
 * @param {Server.Player} player
 */
function sendQuestionSceneToPlayer(player) {
  let question = questions[index]
  let answerable = (player.answer == -1 && player.life > 0 && (+new Date) <= acceptAnswerUntil)
  // 如果用户在答题过程中中途断了重连，而且他还没选择答案，而且他还没死，而且还没收卷，那么他还可以答题

  player.socket.emit('question', /** @type {ServerToUser.Question} */({
    answerable,
    yourAnswer: player.answer,
    chance: player.life > 0 ? player.life - 1 : 0,

    index: index + 1,
    total: questions.length,
    author: question.author,
    question: question.question,
    options: question.options,

    time: Math.min(answeringTime, Math.max(acceptAnswerUntil - (+new Date), 1000)),
    peopleLeft: peopleLeft,
  }))
}

/**
 * 为一个用户发送当前题目的答案、他的选项、复活机会次数之类的信息
 * @param {Server.Player} player
 */
function sendAnswerSceneToPlayer(player) {
  let question = questions[index];
  player.socket.emit('answer', /** @type {ServerToUser.Answer} */({
    index: index + 1,
    total: questions.length,
    author: question.author,
    question: question.question,
    options: question.options,
    correctAnswer: question.answer.index,
    yourChance: Math.max(0, player.life - 1),
    yourAnswer: player.answer,
    optionNumbers,
    resurrectionNumber: resurrection.size,
    peopleLeft,
  }));
}

/** 给玩家发送得分榜 */
function emitScoreBoard() {
  var payload = getScoreInfo()
  setStatus(STATUS_SCORE)
  io.to('player').emit('score', payload)
}

/**
 * @param {AdminToServer.SendCode} opt
 */
async function sendCodeForWinner(opt) {
  const template = '0K7VV5kZYqhEX7Q1zwvSyPqe5U2J0jARDDe83kW41_U'
  const { openIds, passcode } = opt
  const baseURL = WSHostPrefix + "/winner/?q=" + encodeURIComponent(passcode)

  io.to('admin').emit('notice', { text: "正在发送口令..." })
  await Promise.all(openIds.map(async openid => {
    let player = players.get(openid)
    if (!player) return

    let url = baseURL + '&u=' + encodeURIComponent(player.name)
    await WechatBridge.sendTemplateMessage(openid, template, url, {
      text: opt.text,
      extra: "获取口令"
    })
  }))
  io.to('admin').emit('notice', { text: "口令发送完成！" })
}

/**
 * @returns {ServerToUser.Score}
 */
function getScoreInfo() {
  const getFactor = /** @param {Server.Player} p */ (p) => (p.score + p.life / 1000);

  var playerSorted = Array.from(players.values())
    // .filter(p => p.score >= questions.length - 2)
    .sort((a, b) => (getFactor(b) - getFactor(a)))

  return {
    users: playerSorted.map(player => ({
      id: player.openid,
      avatar: player.avatar,
      name: player.name,
      score: player.score,
    }))
  }
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
    player.socket.disconnect(true)
    player.socket = socket
  }

  socket.join('player')
  socket.join(galiao.roomName)
  socket.on('disconnect', () => { sendAdminStatus() })
  sendAdminStatus()

  socket.on('answer',  /** @param {UserToServer.Answer} incoming */(incoming) => {
    if (status !== STATUS_QUESTION) return // 现在不接受回答
    if (player.life <= 0) return // 没生命了
    if (player.answer !== -1) return // 已经作答

    if (incoming.answer >= 0 && incoming.answer < questions[index].options.length) {
      player.answer = incoming.answer
      optionNumbers[incoming.answer]++

      sendQuestionSceneToPlayer(player)
      sendAdminStatus()
    }
  })

  socket.on('chat', /** @param {UserToServer.Chat} msg */(msg) => {
    galiao.send({
      avatar: player.avatar,
      nickname: player.name,
      time: +new Date(),
      text: msg.text,
    })
  })

  socket.emit('chat', { messages: galiao.historyMsgs })

  socket.emit('connectInfo', /** @type {ServerToUser.ConnectInfo} */({
    id: player.openid,
    avatar: player.avatar,
    name: player.name,
    redirect: "",
  }))

  // 恢复现场
  switch (status) {
    case STATUS_IDLE:
      socket.emit('wait', {})
      break;

    case STATUS_QUESTION:
      sendQuestionSceneToPlayer(player)
      break;

    case STATUS_ANSWER:
      sendAnswerSceneToPlayer(player)
      break;

    case STATUS_SCORE:
      socket.emit('score', getScoreInfo())
      break;
  }
}

io.on('connection', function (socket) {
  var ref = socket.handshake.query.ref + ""
  console.log("Connection. Ref = " + ref)
  if (/^\/admin/.test(ref)) {
    adminLogin(socket)
  } else if (/^\/wall/.test(ref)) {
    socket.join(galiao.roomName)
  } else {
    playerLogin(socket)
  }
})

app.use('/winner', Express.static(Path.resolve(__dirname, 'winner')))
app.use(Express.static(Path.resolve(__dirname, '../dist/')))
http.listen(8801, function () {
  console.log('listening on *:8801');
});
