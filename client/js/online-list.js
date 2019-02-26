class OnlineList {
  constructor() {
    this.online = [];
  }

  update(list) {
    this.online = [...list];
  }

  get list() {
    return this.online;
  }
};