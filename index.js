
let express = require('express');
let app = express();
let http = require('http').Server(app);
let io = require('socket.io')(http);
let dialog = require('dialog');
let userList = [];
let messageList = [];
let nickCheck = '/nick';
let colorCheck = '/nickcolor';

http.listen(3000, function(){
    console.log('listening on *:3000');
  });

app.use(express.static(__dirname + '/public'));

app.get('/', function(req, res){
    res.sendFile(__dirname + '/index.html');
  });

io.on('connection', (socket) => {
    console.log("a user connected");
    let user = { name: '', color: ''};
    socket.on('chat message', (msg) => {
        let date = new Date();
        let hours = date.getHours();
        let minutes = date.getMinutes();
        let seconds = date.getSeconds();
        let currentTime = hours + ":" + minutes + ":" + seconds;
        let checkText = msg.split(/\s+/);
        let checkAlphaNum = /^[a-z0-9]+$/i;
        let checkHex = /^[A-F0-9]{6}/i;
        let message = {
            time: currentTime,
            user: user.name,
            color: user.color,
            msg: msg
        };
        console.log(checkText);

        if (checkText[0] === nickCheck){
            let newNickname = msg.substring(6);

            if(checkAlphaNum.test(newNickname)){
                 if(userList.find((name) => {
                     return name.name === newNickname
                 }) === undefined && newNickname.length > 0){
                     user.name = newNickname;
                     socket.emit('nameChanged', user);
                     io.emit('updateUserList', userList);
                 } else {
                     dialog.err('username taken', 'Error');
                 }
            }
        } else if (checkText[0] === colorCheck){
            let newNickColor = msg.substring(11);

            if(checkHex.test(newNickColor)){
                user.color = '#' + newNickColor;
                socket.emit('colorChanged', user);
                io.emit('updateUserList', userList);
            } else {
                dialog.err('wrong hex value', 'Error');
            }
        } else {
            if (messageList.length <= 200){
                messageList.push(message);
            } else {
                messageList.shift();
                messageList.push(message);
            }
            io.emit('chat message', message);
        }
    });
    socket.on('disconnect', () => {
        console.log('a user disconnected');
        userList.splice(userList.findIndex((quitter) => {
            return quitter.name === user.name;
        }), 1);
        io.emit('updateUserList', userList);
    });
    socket.on('cookies', (msg) => {
        let cookieName = msg;
        let userNum = Math.floor(Math.random() * 11)
        let newUser = {name: 'User ', color: '#000000'};
        console.log(cookieName)

        if (cookieName !== ''){
            if(userList.find((cookie) => {
                return cookie.name === cookieName
            }) === undefined){
                user.name = cookieName;
                userList.push(user);
            } else {
                user = newUser;
                //dialog.err('username taken', 'Error');
                user.name = user.name + userNum;
                //user.color = '#000000';
                userList.push(user);
            }
        } else {
            user = newUser;
            user.name = user.name + userNum;
            userList.push(user);
        }
        
        for(index of messageList){
            socket.emit('chat message', index);
        }
        socket.emit('nameChanged', user);
        io.emit('updateUserList', userList);
    });
});