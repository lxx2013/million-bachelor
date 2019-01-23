/** 服务器到用户端的消息 */
declare namespace ServerToUser {
  /** "connectInfo" -- 用户连接上服务器后，服务器告诉他信息 */
  interface ConnectInfo {
    id: string
    name: string
    avatar: string

    /** 如果用户登录了，这个是空字符串；如果没登录，重定向用户到这个字符串表示的网址 */
    redirect?: string
  }

  /** "question" -- 服务器下发题目给用户端做题 */
  interface Question {
    index: number
    total: number

    author: string
    question: string
    options: string[]

    /** 答题时长（单位：毫秒。如果没有的话，默认15000） */
    time: number

    /** 用户剩余复活机会（仅供显示在画面上） */
    chance: number

    /** 用户可以回答问题 */
    answerable: boolean

    /** 用户曾经做出的选择*/
    yourAnswer: number

    /** 场上剩余人数 */
    peopleLeft: number
  }

  /** "answer"   -- 服务器下发答案画面给用户看 */
  interface Answer {
    index: number
    total: number

    author: string
    question: string
    options: string[]

    correctAnswer: number

    /** 你还剩余的机会 */
    yourChance: number

    /** 你是否挂了 */
    youDead: boolean

    /** 你选择的答案 */
    yourAnswer: number

    /** 每个选项的人数 */
    optionNumbers: number[]

    /** 本题复活人数 */
    resurrectionNumber: number

    /** 场上剩余人数 */
    peopleLeft: number
  }

  /** "wait"    -- 让玩家进入等待画面 */
  interface Wait {
  }

  /** "score"   -- 服务器下发积分榜。数组已在服务器排序 */
  interface Score {
    users: Array<{
      id: string
      name: string   // 用户名字
      avatar: string // 头像 url
      score: number  // 一路存活到了第几题
    }>
  }

  /** "chat"  --  服务端发来的等待画面的尬聊信息。 */
  interface Chat {
    messages: Array<{
      key: string,
      time: number, // 消息发送时间
      nickname: string, // 用户呢称
      avatar: string, // 头像URL
      text: string, // 消息文字
    }>
  }
}

/** 用户到服务器 */
declare namespace UserToServer {
  /** "answer"   -- 用户回答当前的问题 */
  interface Answer {
    /** 用户的选项序号 */
    answer: number

    /** 从用户看到题目到做出选择花费的时间（毫秒） */
    time: number
  }

  /** "chat"  --  玩家发一条尬聊信息。 */
  interface Chat {
    text: string, // 消息文字
  }
}

/** 服务端用的一些内部定义 */
declare namespace Server {
  interface Question {
    uid: string,
    author: string,
    question: string,
    options: string[],
    answer: {
      index: number,
      hint: string
    }
  }

  interface Player {
    openid: string
    name: string
    avatar: string

    /** 用户生命数（=剩余机会+1） */
    life: number

    /** 一路存活到了第几题 */
    score: number

    /** 当前题目他做的选项。-1 == 没选择 */
    answer: number

    /** 嗯 */
    socket: SocketIO.Socket
  }

  interface Admin {
    /** 嗯 */
    socket: SocketIO.Socket
  }

  type ChatMessage = ServerToUser.Chat['messages'][0] & {
    userid: string
  }
}

/** 服务器到管理员 */
declare namespace ServerToAdmin {
  /** "adminAuthResult" 管理员登陆成功 */
  type AdminAuthResult = boolean

  /** "getQuiz" 返回管理员当前的题库 */
  type GetQuiz = Server.Question[]

  /** "notice" 提示一段文字 */
  interface Notice {
    text: string
  }

  /** "status" 返回当前游戏进展的情况 */
  interface Status {
    status: number
    peopleLeft: number

    /** 当前题目（从1开始） */
    index: number
    total: number
    question: Server.Question
    nextQuestion: Server.Question
    currentQuestionStated: boolean

    /** 本题复活人数 */
    resurrectionNumber: number

    /** 每个选项的人数 */
    optionNumbers: number[]

    /** 这里的 socket 都是 null，只能看 connected */
    players: (Server.Player & { connected: boolean })[]
  }

  /** "lucky" 抽奖状态 */
  interface Lucky {
    shown?: boolean
    luckyData?: ServerToWall.LuckyStart
    messageCount?: number
    playerCount?: number
  }

  /** "fetchStatRespond" 响应管理员抓取统计 */
  type FetchStatRespond = {
    type: AdminToServer.FetchStat,
    text: string
  }
}

/** 管理员到服务器 */
declare namespace AdminToServer {
  /** "adminAuth" 管理员登陆 */
  type AdminAuth = {
    password: string
  }

  /** "AdminPasswd" 管理员改密码 */
  type AdminPasswd = {
    password: string
  }

  /** "fetchStat" 管理员抓取统计 */
  type FetchStat = "galiao"

  /** "resetStat" 重置统计 */
  interface ResetStat {
    luckyBlackList?: boolean
    galiaoStat?: boolean
  }

  /** "getStatus" 获取现在的答题状态 */

  /** "getQuiz" 获取现在的题库 */

  /** "useQuiz" 设置使用的问题，然后开始游戏 */
  type UseQuiz = Server.Question[]

  /** "reset" 重置游戏进度 */
  /** "showWait" 进入等待屏幕 */
  /** "nextQuestion" 进入下一问题 */
  /** "showAnswer" 发问题答案 */
  /** "showScore" 显示得分榜 */

  /** "sendCode" 发送口令红包给一些用户 */
  type SendCode = {
    openIds: string[],
    text: string,
    passcode: string
  }

  /** "luckyStart" 进入抽奖环节 */
  type LuckyStart = {
    count: number
  }

  /** "luckyEnd" 离开抽奖环节 */
}

/** 服务器到墙的消息 */
declare namespace ServerToWall {
  /** "chat" 聊天消息（上墙消息） 和用户端一致的 */
  type Chat = ServerToUser.Chat

  /** "luckyStart" 进入抽奖环节，显示抽奖墙 */
  interface LuckyStart {
    /** 参与抽奖的玩家们，可能中奖也可能不中 */
    players: Array<{
      id: string
      name: string
      avatar: string
      priority: number // 尬聊消息数量，数字越大则表示中奖概率越高
    }>

    /** 中奖玩家 */
    winners: Array<{
      id: string
      name: string
      avatar: string
      priority: number // 尬聊消息数量，数字越大则表示中奖概率越高
    }>
  }
  /** "luckyEnd" 离开抽奖环节，回到正常显示界面 */
}

declare type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>
