# million-bachelor

>百万单身狗答题活动 / 形式上接近百万英雄类答题活动

## 运行方式

1. 构建前端项目 `npm run build`
2. 运行服务端程序 `npm run server --prod`

## 界面示意

## 接口定义

| 双方         | client(user)  | admin(管理员) |
|:---:        |:------------: |:-------------|
| `server <=` |               | `useQuiz` |
|             | `disconnect`  | `nextQuestion` |
|             | `answer`      | `showWait` |
|             |               | `showAnswer` |
|             |               | `showScore`  |
|             |               | `sendQuestionnaire`|
| `server =>` | `question`    |   |
|             | `wait`        |   |
|             | `answer`      |   |
|             | `score`       |   |
|             | `connectInfo` |   |

## 踩坑纪录

#### :first-letter
firefox 在识别:first-letter 时,会尝试去判断第一个字符是不是 A-z0-9,所以它对
特殊字符不生效:first-letter 属性. 可使用:before 或添加一个额外的 dom `<span>`

#### 移动端 active 按钮点击效果
在iOS系统的移动设备中，需要在按钮元素或body/html上绑定一个touchstart事件才能激活:active状态
`ontouchstart="" and onmouseover="" `

#### 解决移动端页面点击图标或按钮产生透明灰色背景
`html,body{-webkit-text-size-adjust: 100%;-webkit-tap-highlight-color: rgba(0, 0, 0, 0);}`

