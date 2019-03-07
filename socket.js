const OnlineList = require('./classes/OnlineList');

module.exports = (http) => {
  const io = require('socket.io')(http);
  const onlineList = new OnlineList();

  io.on('connection', socket => {
    console.log('new user connected');
    socket.on('login', nickname => {
      onlineList.add(nickname);
      io.emit('online list', onlineList.list);
    });

    socket.on('chat message', (msg, nickname) => {
      socket.broadcast.emit('chat message', msg, nickname);
    });

    socket.on('user typing', nickname => {
      socket.broadcast.emit('user typing', nickname);
    });

    socket.on('typing end', nickname => {
      socket.broadcast.emit('typing end', nickname);
    });

    socket.broadcast.emit('new user');

    socket.on('disconnect', nickname => {
      console.log('user disconnected');
      onlineList.remove(nickname);
      io.emit('user disconnected', nickname);
      io.emit('online list', onlineList.list);
    });
  });

}