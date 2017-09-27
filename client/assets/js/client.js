var app = angular.module('chatRoom', [])

app.factory('socket', function($rootScope) {
    // set default connection
    var socket = io() 
    return {
        on: function(eventName, callback) {
            socket.on(eventName, function() {
                var args = arguments
                $rootScope.$apply(function() {
                    callback.apply(socket, args)
                })
            })
        },
        emit: function(eventName, data, callback) {
            socket.emit(eventName, data, function() {
                var args = arguments
                $rootScope.$apply(function() {
                    if(callback) {
                        callback.apply(socket, args)
                    }
                })
            })
        }
    }
})

app.factory('userServer', function($rootScope) {
    return {
        get: function(users, nickname) {
            if(users instanceof Array){
                for(var i=0; i<users.length; i++){
                    if(users[i].nickname===nickname){
                        return users[i]
                    }
                }
            }else{
                return null
            }
        }
    }
})

app.controller('chatCtrl', ['$scope', 'socket', 'userService', function($scope, socket, userServer) {
    var messageWrapper = $('.message-wrapper')
    $scope.hasLogined = false
    $scope.receiver = "" // default publicMessage
    $scope.publicMessages = [] // publicMessage 
    $scope.privateMessages = {} // privateMessage
    $scope.messages = $scope.publicMessages // default display publicMessage
    $scope.users = []

    // login chatRoom
    $scope.login = function() {
        // coding there ...
        socket.emit('addUser', {nickname: $scope.nickname})
    }
    // auto scroll to new message
    $scope.scrollToBottom = function() {
        // coding there ...
        messageWrapper.scrollTop(messageWrapper[0].scrollHeight)
    }

    $scope.postMessage = function() {
        // coding there ...
        var msg = {text: $scope.words, type: 'normal', from: $scope.nickname, to: $scope.receiver}
        var rec = $scope.receiver
        if(rec) {
            if(!$scope.privateMessages[rec]){
                $scop.privateMessages[rec] = []
            }
            $scope.privateMessages[rec].push(msg)
        }else {
            $scope.privateMessages.push(msg)
        }
        $scope.words = ''
        if(rec!==$scope.nickname) {
            socket.emit('addMessage', msg)
        }
    }
    $scope.setReceiver = function(receiver) {
        // coding there ...
        $scope.receiver = receiver
        if(receiver) {
            if(!$scope.privateMessages[receiver]) {
                $scope.privateMessages = []
            }
            $scope.messages = $scope.privateMessages[receiver]
        }else {
            $scope.messages = $scope.publicMessages
        }
        var user = userServer.get($scope.users, receiver)
        if(user) {
            user.hasNewMessage = false
        }
    }

    // receive login message
    socket.on('userAddingResult', function(data) {
        // coding there ...
        if(data.result) {
            $scope.userExisted = false
            $scope.hasLogined = true
        }else {
            // nickname has been used
            $scope.userExisted = true
        }
    })

    // receive new user  message
    socket.on('userAdded', function(data) {
        // coding there ...
        if(!$scope.hasLogined) return
        $scope.publicMessages.push({text: data.nickname, type: 'welcome'})
        $scope.users.push(data)
    })

    // receive online user message
    socket.on('allUser', function(data) {
        // coding there ...
        if(!$scope.hasLogined) return
        $scope.users = data
    })

    // receive quit message
    socket.on('userRemoved', function(data) {
        // coding there ...
        if(!$scope.hasLogined) return
        $scope.publicMessages.push({text: data.nickname, type: 'bye'})
        for(var i = 0; i < $scope.users.length; i++) {
            if($scope.users[i].nickname == data.nickname) {
                $scope.users.splice(i, 1)
                return
            } 
        }
    })

    // receive new message
    socket.on('messageAdded', function(data) {
        // coding there ...
        if(!$scope.hasLogined) return
        if(data.to) {
            // private message
            if(!$scope.privateMessages[data.from]) {
                $scope.privateMessages[data.from] = []
            }
            $scope.privateMessages[data.from].push(data)
        }else {
            // publicMessage
            $scope.publicMessages.push(data)
        }
        var fromUser = userServer.get($scope.users, data.from)
        var toUser = userServer.get($scope.users, data.to)
        if($scope.receiver !== data.to) {
            if(fromUser && toUser.nickname) {
                fromUser.hasNewMessage = true // private message
            } else {
                toUser.hasNewMessage = true // public message
            }
        }
    })

}])

// new order to invocate page
app.directive('message', ['$timeout', function($timeout) {
    return {
        restrict: 'E',
        templateUrl: 'message.html',
        scope: {   
            info: '=',
            self: '=',
            scrolltothis: '&'
        },
        link: function(scope, elem, attrs) {
            scope.time = new Date()
            $timeout(scope.scrolltothis)
        }
    }
}]).directive('user', ['$timeout', function($timeout) {
    return {
        restrict: 'E',
        templateUrl: 'user.html',
        scope: {
            info: '=',
            iscurrentreceiver: '=',
            setreceiver: '&'
        }
    }
}])