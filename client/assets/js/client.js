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
    }
    $scope.setReceiver = function(receiver) {
        // coding there ...
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
    })

    // receive new message
    socket.on('messageAdded', function(data) {
        // coding there ...
    })
}])

app.directive('user', ['$timeout', function($timeout) {
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