// @ts-check

/** 尬聊统计模块 + 抽奖模块 */
class GaStat {
  constructor() {
    /** @type {Record<string, number>} 用户ID - 用户发言次数 */
    this.stats = {}
    this.count = 0
  }

  /**
   * 添加发言记录
   * @param {string} userId
   */
  push(userId) {
    if (userId in this.stats) this.stats[userId]++
    else this.stats[userId] = 1

    this.count++
  }

  /**
   * 重置统计情况
   */
  reset() {
    this.stats = {}
    this.count = 0
  }

  /**
   * 找出N个辛运用户
   * @param {number} luckyCount
   * @param {string[]} blackList  黑名单 -- 避免二次中奖
   * @returns {[string, number][]} 辛运用户的ID及其发言数
   */
  runLucky(luckyCount, blackList = []) {
    /** @type {[string, number][]} 辛运用户的ID及其发言数 */
    let ans = []

    /** @type {[string, number][]}  可能中奖的 玩家ID 及其发言条数 */
    let players = []
    let remainCount = 0

    for (const player in this.stats) {
      let messageCnt = +this.stats[player]
      if (blackList.includes(player)) continue
      if (messageCnt <= 0) continue

      remainCount += messageCnt
      players.push([player, messageCnt])
    }

    while (remainCount > 0 && luckyCount--) {
      let xi = Math.round(Math.random() * (remainCount - 1))
      let counter = 0

      for (let pi = 0; pi < players.length; pi++) {
        let [player, messageCnt] = players[pi]
        counter += messageCnt

        if (xi < counter) { // 就决定是你了
          players.splice(pi, 1)
          ans.push([player, messageCnt])
          remainCount -= messageCnt
          break
        }
      }
    }

    return ans
  }
}

module.exports = GaStat

// @ts-ignore  // 测试代码
if (require.main === module) {
  let inst = new GaStat()
  for (let i = 0; i < 100; i++) inst.push("张三")
  for (let i = 0; i < 100; i++) inst.push("李四")
  for (let i = 0; i < 10; i++) inst.push("王五")
  for (let i = 0; i < 10; i++) inst.push("孙七")
  for (let i = 0; i < 1; i++) inst.push("周八")

  console.log("** ", inst.runLucky(6))
  console.log("** ", inst.runLucky(6, ["张三"]))
  console.log("** ", inst.runLucky(2, ["张三"]))
}
