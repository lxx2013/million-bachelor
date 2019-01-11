/// <reference path="../types.d.ts" />

/** @type {Server.Question[]} */
module.exports = [
  {
    question: '小明的妈妈有三个孩子, 老大叫大毛,老二叫二毛,老三叫什么?',
    options: ['三毛', '老三', '小阴', '小明'],
    author: '李新星',
    answer: {
      index: 3,
      hint: '注意第一句**小明**的妈妈'
    }
  },
  {
    question: '$e^{lnx}$ 对 x 求导的结果是多少?',
    options: ['x', 'x', 'x', '1'],
    author: '柳哥',
    answer: {
      index: 3,
      hint: '$e^lnx$ 实际上就是 x'
    }
  },
  {
    question: '小明的妈妈有三个孩子, 老大叫大毛,老二叫二毛,老三叫什么?',
    options: ['三毛', '老三', '小阴', '小明'],
    author: '张三',
    answer: {
      index: 3,
      hint: '注意第一句**小明**的妈妈'
    }
  },
  {
    question: '$e^{lnx}$ 对 x 求导的结果是多少?',
    options: ['x', 'x', 'x', '1'],
    author: '李四',
    answer: {
      index: 3,
      hint: '$e^lnx$ 实际上就是 x'
    }
  },
  {
    question: '小明的妈妈有三个孩子, 老大叫大毛,老二叫二毛,老三叫什么?',
    options: ['三毛', '老三', '小阴', '小明'],
    author: '王二',
    answer: {
      index: 3,
      hint: '注意第一句**小明**的妈妈'
    }
  },
  {
    question: '$e^{lnx}$ 对 x 求导的结果是多少?',
    options: ['x', 'x', 'x', '1'],
    author: '麻子',
    answer: {
      index: 3,
      hint: '$e^lnx$ 实际上就是 x'
    }
  },
  {
    question: '小明的妈妈有三个孩子, 老大叫大毛,老二叫二毛,老三叫什么?',
    options: ['三毛', '老三', '小阴', '小明'],
    author: '二傻',
    answer: {
      index: 3,
      hint: '注意第一句**小明**的妈妈'
    }
  },
  {
    question: '$e^{lnx}$ 对 x 求导的结果是多少?',
    options: ['x', 'x', 'x', '1'],
    author: '史塔克',
    answer: {
      index: 3,
      hint: '$e^lnx$ 实际上就是 x'
    }
  },
  {
    question: '小明的妈妈有三个孩子, 老大叫大毛,老二叫二毛,老三叫什么?',
    options: ['三毛', '老三', '小阴', '小明'],
    author: '马冬梅',
    answer: {
      index: 3,
      hint: '注意第一句**小明**的妈妈'
    }
  },
  {
    question: '$e^{lnx}$ 对 x 求导的结果是多少?',
    options: ['x', 'x', 'x', '1'],
    author: '小明',
    answer: {
      index: 3,
      hint: '$e^lnx$ 实际上就是 x'
    }
  },
  {
    question: '小明的妈妈有三个孩子, 老大叫大毛,老二叫二毛,老三叫什么?',
    options: ['三毛', '老三', '小阴', '小明'],
    author: '小红',
    answer: {
      index: 3,
      hint: '注意第一句**小明**的妈妈'
    }
  },
  {
    question: '$e^{lnx}$ 对 x 求导的结果是多少?',
    options: ['x', 'x', 'x', '1'],
    author: '上村高树',
    answer: {
      index: 3,
      hint: '$e^lnx$ 实际上就是 x'
    }
  },
].map((item, index) => {
  return {
    ...item,
    uid: "DEFAULT_QUIZ_" + index
  }
})
