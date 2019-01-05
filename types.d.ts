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

    question: string
    options: string[]

    /** 答题时长（单位：毫秒。如果没有的话，默认15000） */
    time: number

    /** 用户剩余复活机会（仅供显示在画面上） */
    chance: number

    /** 用户可以回答问题 */
    answerable: boolean

    /** 场上剩余人数 */
    peopleLeft: number
  }

  /** "answer"   -- 服务器下发答案画面给用户看 */
  interface Answer {
    index: number
    total: number

    question: string
    options: string[]

    correctAnswer: number

    /** 你还剩余的机会 */
    yourChance: number

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
      score: number  // 对的题数
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
}

/** 服务端用的一些内部定义 */
declare namespace Server {
  interface Question {
    uid: string,
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

    /** 答对的题目数 */
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
}

/** 管理员到服务器 */
declare namespace AdminToServer {
  /** "useQuiz" 设置使用的问题 */
  interface UseQuiz {
    questions: Server.Question[]
  }

  /** "reset" 重置 */
  /** "showWait" 进入等待屏幕 */
  /** "nextQuestion" 进入下一问题 */
  /** "showAnswer" 发问题答案 */
  /** "showScore" 显示得分榜 */
}
