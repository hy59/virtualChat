// import modules
var express = require('express')
var app = require('express')()
var http = require('http').createServer(app)
var io = require('socket.io')(http)

// set static file path
app.use(express.static(__dirname + '/client'))

app.get('/', function(req, res) {
    res.sendfile('index.html')
})

var connectedSockets = {}
var allUsers = [{nickname:""}]
io.on('connection', function(socket) {
    
    // new user coming in
    socket.on('addUser', function(data) {
        // coding there ...
    })

    // user sending new info
    socket.on('addMessage', function(data) {
        // conding there ...
    })

    // user quit chat
    socket.on('disconnect', function() {
        // conding there ...
    })
})

http.listen(3000, function () {
    console.log('app is running at port 3000.')
})