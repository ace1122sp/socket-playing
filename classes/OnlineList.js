class OnlineList {
  constructor() {
    this.online = [];
  }

  init(initList) {
    this.online = [...initList];
  }

  add(user) {
    this.online.push(user);
  }

  remove(user) {
    let firstIndex = this.online.indexOf(user);
    this.online.splice(firstIndex, 1);
  }

  get list() {
    return this.online;
  }
};

module.exports = OnlineList;