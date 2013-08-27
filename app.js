var express = require('express'),
    http = require('http'),
    sio = require('socket.io'),
    Words = require('./words');

var app = express(),
    server = http.createServer(app),
    io = sio.listen(server);

server.listen(3000);
app.use(express.static('public'));

(new Words(app, io)).run();