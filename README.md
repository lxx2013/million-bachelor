# million-bachelor

>百万单身狗答题活动 / 形式上接近百万英雄类答题活动

## 界面示意

## 接口定义

| 双方 | client(user) | admin(管理员) |
|:---:|:------------:|:-------------|
| `server <=` | `client connected` | `admin connected` |
|  |`disconnected` | `disconnected` |
|  | `client choosed` | `admin next` |
|  | | `admin answer` |
|  | | `admin wait`   |
|  | | `admin score`  |
|  | | `admin reset`  |
| `server =>` | `server patchQuestion` |  |
| | `server patchAnswer` | |
| | `server wait`等同 *reset* | |
| | `server patchScore` | |
| | | `server onlines`|
