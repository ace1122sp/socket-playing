const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const path = require('path');

const OnlineList = require('./classes/OnlineList');

app.use(express.static(path.resolve(__dirname, 'client')));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

const onlineList = new OnlineList();

io.on('connection', socket => {
  
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

http.listen(3000, () => {
  console.log('listening on *:3000');
});