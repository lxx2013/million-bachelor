# million-bachelor

>百万单身狗答题活动 / 形式上接近百万英雄类答题活动

## 界面示意

## 接口定义

| 双方         | client(user)  | admin(管理员) |
|:---:        |:------------: |:-------------|
| `server <=` |               | `useQuiz` |
|             | `disconnect`  | `nextQuestion` |
|             | `answer`      | `showWait` |
|             |               | `showAnswer` |
|             |               | `showScore`  |
| `server =>` | `question`    |   |
|             | `wait`        |   |
|             | `answer`      |   |
|             | `score`       |   |
|             | `connectInfo` |   |
