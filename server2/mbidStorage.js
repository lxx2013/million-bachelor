module.exports = class MBIDStorage {
  constructor() {
    this.storage = {}
    this.uucounter = 0
  }

  getItem(key) {
    return this.storage[key]
  }

  saveItem(data) {
    var key = (this.uucounter++) + "-" + Math.round(Math.random() * 1e9).toString(36)
    this.storage[key] = data

    console.log("MBIDStorage: save as " + key)
    console.log(data)

    return key
  }
}
