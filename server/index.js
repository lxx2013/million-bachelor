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
var throttle = require('lodash.throttle');
var WechatBridge = require('./wechatBridge');
var GaLiaoManager = require('./gaLiao');
var GaLiaoStat = require('./GaStat');

WechatBridge.init("wx4a41c84538f71d83", "86556b0863605e31b7d3708a7417422e", !IS_PROD)

const WSHostPrefix = "https://k-on.live"
const AUTO_ENTER_WAIT = true

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

/** 抽奖用的统计器，在每次抽奖环节后重置 */
var luckyStat = new GaLiaoStat()

/** @type {string[]} 中奖黑名单，避免欧皇连续中奖 */
var luckyBlacklist = []

/** 全场的统计，除了能找到话痨以外好像没啥用 */
var globalStat = new GaLiaoStat()

/** 原创的统计，找到最佳创造者 */
var creatorStat = new GaLiaoStat()

/** 复读的统计，找到最佳复读机 */
var repeaterStat = new GaLiaoStat()

var adminPassword = ""

/**
 * 处理一个新的管理员连接
 * @param {SocketIO.Socket} socket
 */
function adminLogin(socket) {
  /** @param {AdminToServer.AdminAuth} auth */
  function challenge(auth) {
    if (!adminPassword) {
      adminPassword = auth.password
      socket.emit("notice", { text: "您的管理员密码已经设置！" })
    }

    if (adminPassword != auth.password) {
      socket.emit("notice", { text: "请提供正确的管理员密码！" })
      socket.emit("adminAuthResult", false)
      socket.once("adminAuth", challenge)
      return
    }

    // 验证通过！
    socket.emit("adminAuthResult", true)
    adminLoginReal(socket)
  }

  if (!adminPassword) {
    socket.emit("notice", { text: "第一次登陆后台，请设置一个管理员密码！" })
  }

  socket.emit("adminAuthResult", false)
  socket.once("adminAuth", challenge)
}

/**
 * 处理一个新的管理员连接
 * @param {SocketIO.Socket} socket
 */
function adminLoginReal(socket) {
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
  socket.on("luckyStart", luckyStart)
  socket.on("luckyEnd", luckyEnd)

  socket.on("adminPasswd", /** @param {AdminToServer.AdminPasswd} o */o => {
    adminPassword = o.password || ""
    socket.emit("notice", { text: "密码已经修改了" })
  })

  socket.on("resetStat", /** @param {AdminToServer.ResetStat} o */o => {
    let dones = []

    if (o.galiaoStat) {
      luckyStat.reset()
      globalStat.reset()
      creatorStat.reset()
      repeaterStat.reset()

      dones.push("各种关于聊天的统计")
    }

    if (o.luckyBlackList) {
      luckyBlacklist.splice(0)

      dones.push("抽奖黑名单")
    }

    socket.emit("notice", { text: "已经重置 " + dones.join("、") })
  })

  socket.on("fetchStat", /** @param {AdminToServer.FetchStat} type */type => {
    let text = ""
    if (type == "galiao") {
      /** @param {[string, number]} pair */
      function pair2obj(pair) { return { ...players.get(pair[0]), messageCount: pair[1] } }

      let bestTalker = globalStat.getSortedResult().slice(0, 10).map(pair2obj)
      let bestCreator = creatorStat.getSortedResult().slice(0, 10).map(pair2obj)
      let bestRepeater = repeaterStat.getSortedResult().slice(0, 10).map(pair2obj)

      text = [
        `全场共计产生了 ${globalStat.count} 条尬聊`,
        "",
        "==最积极发言者==",
        ...bestTalker.map((it, idx) => ` ${idx + 1}. ${it.name} -- ${it.messageCount} 条尬聊 -- ${it.openid}`),
        "",
        "==最佳创造者==",
        ...bestCreator.map((it, idx) => ` ${idx + 1}. ${it.name} -- 原创 ${it.messageCount} 条尬聊 -- ${it.openid}`),
        "",
        "==最佳复读机==",
        ...bestRepeater.map((it, idx) => ` ${idx + 1}. ${it.name} -- 复读 ${it.messageCount} 次 -- ${it.openid}`),
        "",
      ].join("\n")
    }

    socket.emit("fetchStatRespond", { type, text })
  })

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

const sendAdminLuckyStat = throttle(function () {
  /** @type {ServerToAdmin.Lucky} */
  let data = {
    messageCount: luckyStat.count,
    playerCount: Object.keys(luckyStat.stats).length,
  }
  io.to('admin').emit('lucky', data)
}, 200, { trailing: true })

const sendAdminStatus = throttle(function () {
  /** @type {ServerToAdmin.Status['players']} */
  var playersTmp = Array.from(players.values()).map(p => ({
    ...p, socket: null,
    connected: p.socket.connected,
  })).sort((a, b) => b.score - a.score)

  /** @type {ServerToAdmin.Status} */
  var payload = {
    status, peopleLeft, index: index + 1, total: questions.length,
    question: questions[index] || null,
    nextQuestion: questions[index + 1] || null,
    resurrectionNumber: resurrection.size,
    players: playersTmp,
    optionNumbers,
    currentQuestionStated,
  }

  io.to('admin').emit('status', payload)
}, 200, { leading: true, trailing: true })

/** 开始一局新的游戏 */
function startGame() {
  var kickOutPlayerIDs = new Set()

  players.forEach(player => {
    player.life = 3
    player.score = 0
    if (!player.socket.connected && !luckyStat.stats[player.openid]) kickOutPlayerIDs.add(player.openid)
  })

  // 踢掉断开了连接，而且没有在微信墙发过言的玩家
  kickOutPlayerIDs.forEach(id => players.delete(id))

  setStatus(STATUS_IDLE)
  peopleLeft = players.size
  index = -1
  currentQuestionStated = true
  io.to("player").emit("wait", {})

  console.log("[[reset]] ----- " + new Date)
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

/**
 * 开始辛运抽奖吧
 * @param {AdminToServer.LuckyStart} opt
 */
function luckyStart(opt) {
  console.log("[[luckyStart]] -------- BEGIN")

  let joinMembers = { ...luckyStat.stats } // 参与的玩家们
  let winners = luckyStat.runLucky(opt.count, luckyBlacklist)
  luckyStat.reset()
  winners.forEach(([player]) => luckyBlacklist.push(player))  // 禁止欧皇再次中奖

  winners.forEach(([player, msgCount]) => console.log(` - ${player} -- ${msgCount} msgs`))
  console.log("[[luckyStart]] -------- END (CNT=" + opt.count + ")")

  /** @type {ServerToWall.LuckyStart} */
  let toWallData = {
    players: Object.keys(joinMembers).map(id => {
      let playerInfo = players.get(id)
      return {
        id,
        priority: joinMembers[id],
        avatar: playerInfo.avatar,
        name: playerInfo.name
      }
    }),
    winners: winners.map(([id, priority]) => {
      let playerInfo = players.get(id)
      return {
        id, priority,
        avatar: playerInfo.avatar,
        name: playerInfo.name
      }
    })
  }

  /** @type {ServerToAdmin.Lucky} */
  let toAdminData = {
    shown: true,
    luckyData: {
      players: [],
      winners: toWallData.winners
    }
  }

  io.to("wall").emit("luckyStart", toWallData)
  io.to("admin").emit("lucky", toAdminData)

  sendAdminLuckyStat()
}

/**
 * 结束辛运抽奖
 */
function luckyEnd() {
  /** @type {ServerToAdmin.Lucky} */
  let toAdminData = {
    shown: false,
    luckyData: null
  }

  io.to("wall").emit("luckyEnd")
  io.to("admin").emit("lucky", toAdminData)
}

/** 给玩家发布答案，并统计得分、复活之类的事情 */
function statAndEmitAnswer() {
  // 如果没开始的话
  const question = questions[index]
  if (!question) return

  // 如果没统计的话
  if (!currentQuestionStated) {
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
    youDead: player.life === 0,
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

  if (!payload.users.length) return

  let maxScore = payload.users[0].score
  let winners = payload.users.filter(u => u.score === maxScore)
  console.log(`[[score]] ------- BEGIN`)
  winners.forEach(user => {
    if (user.score !== maxScore) return
    console.log(` + ${user.id} ( ${user.name} )`)
  })
  console.log(`[[score]] ------- END (MAX=${maxScore}, CNT=${winners.length}, GEN@${new Date()})`)
}

/**
 * @param {AdminToServer.SendCode} opt
 */
async function sendCodeForWinner(opt) {
  const template = 'B8g0gkpHl1zJooFF_h40qIHt1Yv0NG55Ac5jkAOPWcY'
  const { openIds, passcode } = opt
  const baseURL = WSHostPrefix + "/winner/?q=" + encodeURIComponent(passcode)

  io.to('admin').emit('notice', { text: "正在发送口令..." })
  const error_msgs = []
  const success_msgs = []
  await Promise.all(openIds.map(async openid => {
    let player = players.get(openid)
    if (!player){
      error_msgs.push(`openid:${openid} 不在 players 中`)
      return
    } 

    let url = baseURL + '&u=' + encodeURIComponent(player.name)
    let send_res = await WechatBridge.sendTemplateMessage(openid, template, url, {
      text: opt.text,
      extra: "获取口令"
    })
    let shot_id = openid.slice(0,4)+'**'+openid.slice(-2)
    if(send_res.data.errcode){
      error_msgs.push(`name:${player.name} id:${shot_id} errmsg:${send_res.data.errmsg}`)
    }else{
      success_msgs.push(`name:${player.name} id:${shot_id} 发送成功`)
    }
  }))
  io.to('admin').emit('notice', { text: error_msgs.concat(success_msgs).join('\n') })
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
    let isRepeat = galiao.isRepeat(msg.text)
    galiao.send({
      avatar: player.avatar,
      nickname: player.name,
      time: +new Date(),
      text: msg.text,
      userid: player.openid,
    })

    if (!isRepeat) luckyStat.push(player.openid)
    globalStat.push(player.openid)
    if (isRepeat) repeaterStat.push(player.openid)
    else creatorStat.push(player.openid)

    sendAdminLuckyStat()
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

/**
 * 处理一个新的微信墙连接
 * @param {SocketIO.Socket} socket
 */
function wallLogin(socket) {
  socket.join(galiao.roomName);
  socket.join("wall")
}

io.on('connection', function (socket) {
  var ref = socket.handshake.query.ref + ""
  console.log("Connection. Ref = " + ref)
  if (/^\/admin/.test(ref)) {
    adminLogin(socket)
  } else if (/^\/wall/.test(ref)) {
    wallLogin(socket);
  } else {
    playerLogin(socket)
  }
})

var compression = require('compression');
app.use(compression());
app.use('/winner', Express.static(Path.resolve(__dirname, 'winner')))
app.use(Express.static(Path.resolve(__dirname, '../dist/')))
http.listen(8801, function () {
  console.log('listening on *:8801');
});
