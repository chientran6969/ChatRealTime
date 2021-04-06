const socket = io()
const chatForm = $('#chat-form')
const chatMessages = $('.chat-messages')
const msg = $('#msg')

const {username, room} = Qs.parse(location.search, {
    ignoreQueryPrefix: true
})

socket.on('roomUsers', ({room, users}) => {
    let usersList = ''

    users.forEach(u => {
        usersList += '<li>'+u.username +'</li>'
    });

    $('#users').html(usersList)
    $('#room-name').html(room)

})

socket.emit('joinRoom',  {username, room})

socket.on('message', message => {
    addMessage(message)

    msg.val('')
    msg.focus()
})

chatForm.submit(function (e) {
    e.preventDefault();
    const msg = $('#msg').val()

    socket.emit('chatMessage', msg)

});


function addMessage(message) {
    console.log(message.username, username);
    if(message.username == username ){
        chatMessages.append(`<div class="message message-me">
                            <p class="meta">${message.username} <span>${message.time}</span></p>
                            <p class="text">${message.text}</p>
                        </div>`)
    }
    else {
        chatMessages.append(`<div class="message">
                            <p class="meta">${message.username} <span>${message.time}</span></p>
                            <p class="text">${message.text}</p>
                        </div>`)
    }
    

    chatMessages.animate({ scrollTop: chatMessages.height()});
}
