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
        if(connectedSockets[data.nickname]) {
            // nickname has been used
            socket.emit('userAddingResult', {result: false})
        }else {
            socket.emit('userAddingResult', {result: true})
            soccket.nickname = data.nickname
            // save every socket(if need to send private message)
            connectedSockets[socket.nickname] = socket
            allUsers.push(data)
            // broadcast new use, everyone can see it
            socket.broadcast.emit('userAdded', data)
            // send all online users to new user
            socket.emit('allUser', allUsers)
        }
    })

    // user sending new info
    socket.on('addMessage', function(data) {
        // conding there ...
        if(data.to) {
            // to @ user
            connectedSockets[data.to].emit('messageAdded', data)
        }else {
            // broadcast message
            socket.broadcast.emit('messageAdded', data)
        }
    })

    // user quit chat
    socket.on('disconnect', function() {
        // conding there ...
        // broadcast when user quit
        socket.broadcast.emit('userRemoved', {
            nickname: socket.nickname
        })
        for(var i = 0; i < allUsers.length; i++) {
            if(allUsers[i].nickname == socket.nickname) {
                allUsers.splice(i, 1)
            }
        }
        // delete socket
        delete connectedSockets[socket.nickname]
    })
})

http.listen(3000, function () {
    console.log('app is running at port 3000.')
})