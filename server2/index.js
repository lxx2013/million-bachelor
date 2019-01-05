/// <reference path="../types.d.ts" />

var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

/** @type {Server.Question[]} */
var questions = require('./defaultQuestions');

/** @type {Server.Player[]} */
var players = []

/** @type {Server.Admin[]} */
var admins = []

io.on('connection', function (socket) {
})

app.use(require('express').static(require('path').resolve(__dirname, '../dist/')))
http.listen(8801, function () {
  console.log('listening on *:8801');
});
