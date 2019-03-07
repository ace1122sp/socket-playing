const express = require('express');
const app = express();
const http = require('http').Server(app);
const path = require('path');
const socket = require('./socket');

app.use(express.static(path.resolve(__dirname, 'client')));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

// implement socket.io
socket(http);

http.listen(3001, () => {
  console.log('listening on *:3001');
});