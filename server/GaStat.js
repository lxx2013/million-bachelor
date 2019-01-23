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
   * @returns {[string, number][]} 用户的ID及其发言数
   */
  getSortedResult() {
    /** @type {[string, number][]}  */
    let ans = []
    let stats = this.stats
    for (let id in stats) ans.push([id, stats[id]])
    return ans.sort((a, b) => b[1] - a[1])
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

    /** @type {[string, number, number][]}  可能中奖的 玩家ID 及其权重、真实发言条数 */
    let players = []
    let weightSum = 0

    for (const player in this.stats) {
      /** 使用对数，降低刷屏导致的大权重 */
      let messageCnt = this.stats[player]
      let weight = Math.log2(messageCnt * 2 + 1)

      if (blackList.includes(player)) continue
      if (messageCnt <= 0) continue
      if (weight < 1) weight = 1

      weightSum += weight
      players.push([player, weight, messageCnt])
    }

    while (weightSum > 0 && luckyCount--) {
      let randThresh = Math.random() * weightSum
      let weightInt = 0

      for (let pi = 0; pi < players.length; pi++) {
        let [player, weight, messageCnt] = players[pi]
        weightInt += weight

        if (randThresh < weightInt) { // 就决定是你了
          players.splice(pi, 1)
          ans.push([player, messageCnt])
          weightSum -= weight
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
