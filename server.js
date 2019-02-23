const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const path = require('path');

app.use(express.static(path.resolve(__dirname, 'client')));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', socket => {
  socket.on('chat message', (msg, nickname) => {
    socket.broadcast.emit('chat message', msg, nickname);
  });

  socket.broadcast.emit('new user');

  socket.on('disconnect', () => {
    console.log('user disconnected');
    io.emit('user disconnected');
  });
});

http.listen(3000, () => {
  console.log('listening on *:3000');
});