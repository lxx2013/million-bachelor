/// <reference path="../../types.d.ts" />

const NOUN1 = "南一楼,南六楼,他,你,上一题,台上,节目,零食,气球".split(",");
const NOUN2 = "好不好玩,帅不帅,美不美,动听不动听,的难度,的姿势,的日常,的表现,的颜色,的吉他".split(
  ","
);
const HINT2 = `双击别人说的话，可以复读
双击别人说的话，发现人类的本质
春节快乐，给您拜个早年啦
好激动,还有365天就到下次年会了,回想上次年会,仿佛就在半小时前`.split("\n");

const pics = "animals,cats,city,food,nature,sports".split(',')

function randPick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function getPlaceHolder() {
  if (Math.random() > 0.6) return randPick(HINT2);
  return `等待时，不如聊聊${randPick(NOUN1)}${randPick(NOUN2)}？`;
}

export function getPlaceHolderMsg(){
  return {
    text: getPlaceHolder(),
    key: Math.random() *2000>>1,
    timeOut : 2000,
    isPlaceHolder: true,
    avatar:"http://lorempixel.com/100/100/" + randPick(pics) + `/${Math.random()*20>>1}`
  }
}

/** @returns {ServerToWall.LuckyStart}  */
export function getPlaceHolderLuckyData() {
  return {
    players: new Array(70).fill(null).map((v,i)=>({
      id:"fake-"+i,
      name:"FakeUser"+i,
      priority: 100,
      avatar: `http://profilepicturesdp.com/wp-content/uploads/2018/06/avatar-profile-pictures-${~~(Math.random()*6)+1}.png`
    })),
    winners: new Array(5).fill(null).map((v,i)=>({
      id:"fake-"+i,
      name:"FakeUser"+i,
      priority: 100,
      avatar: `http://profilepicturesdp.com/wp-content/uploads/2018/06/avatar-profile-pictures-${~~(Math.random()*6)+1}.png`
    }))
  }
}

export function getDeadMsg() {
  return randPick([
    "有缘下回再来的冲顶吧",
    "胜败乃兵家常事，大侠请再接再厉",
    "把好运气留到抽奖中吧",
    "别气馁，说不准你是抽奖欧皇呢"
  ])
}
