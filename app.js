const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);

app.use(express.static(__dirname));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', socket => {
  socket.on('chat message', msg => {
    socket.broadcast.emit('chat message', msg);
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