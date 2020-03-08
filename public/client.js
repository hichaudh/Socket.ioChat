$(() => {
    let socket = io();
    let cookie = Cookies.get('name');
    socket.emit('cookies', cookie);
    let currentUser;

    $('form').submit(function(){
       // e.preventDefault();
        socket.emit('chat message', $('#m').val());
        $('#m').val('');
        return false;
    });

    socket.on('updateUserList', (msg) =>{
        $('#users').empty();
        for (let user of msg){
            $('#users').append($('<li>').text(user.name));
        }
    });

    socket.on('chat message', (msg) => {
        let displayMessage = msg.time + ' <span>' + msg.user + '</span>: ' + msg.msg
        if(msg.user === currentUser){
            displayMessage = '<b>' + displayMessage + '</b>';
        }
        $('#messages').append($('<li>').html(displayMessage));
        $('#messages').find('li:last').find('span').css('color', msg.color);
        $('#messages').animate({scrollTop: $('#messages').prop('scrollHeight')}, 500);

    });

    socket.on('nameChanged', (msg) =>{
        let displayMessage = "You are now <span>" + msg.name + "</span>.";
        $('#messages').append($('<li>').html(displayMessage));
        currentUser = msg.name;
        Cookies.set('name', msg.name, { expires: 365});
    });

    socket.on('colorChanged', (msg) =>{
        $('#messages').find('li:last').find('span').css('color',msg.color);
        currentUser = msg.name;
        Cookies.set('name', msg.name, { expires: 365});
    });
});
