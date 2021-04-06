const express = require('express')
const path = require('path')
const http = require('http')
const socketio = require('socket.io')
const moment = require('moment')
const flash = require('express-flash')
const cookieParser = require('cookie-parser')
const session = require('express-session')

const { userJoin, userLeave,
     getAllUserinRoom } = require('./users')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

app.use(cookieParser('ct'));
app.use(session({ cookie: { maxAge: 60000 } }));
app.use(flash());
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'public/views'))

app.use(express.static(path.join(__dirname, 'public')))

app.get('/', (req, res) => {
    let error = req.flash('error')
    res.render('index', {error})
})

app.get('/chat', (req, res) => {
    const {username, room} = req.query
    if(!username || !room) {
        req.flash('error', 'Please enter your name and room')
        res.redirect('/')
    }
    else {
        res.render('chat',)
    }

})

io.on('connection', (socket) => {
    console.log('connected...');

    socket.on('joinRoom', ({ username, room }) => {
        // lấy thông tin người vào phòng
        const user = userJoin(socket.id, username, room)

        //người dùng tham gia 1 phòng
        socket.join(user.room)

        //thông báo tham gia thành công
        socket.emit('message', formatMessage('Admin', 'Wellcome to Flashchat!'))

        //thông báo cho cả phòng có người vào phòng
        socket.broadcast.to(user.room).emit('message', formatMessage('Admin', user.username + ' has join the room'))

        //người dùng chat
        socket.on('chatMessage', msg => {
            io.to(user.room).emit('message', formatMessage(user.username, msg))
        })

        //cập nhật người dùng vào sideBar
        io.to(user.room).emit('roomUsers', { room: user.room, users: getAllUserinRoom(user.room) })

    })

    //người dùng out
    socket.on('disconnect', () => {
        const user = userLeave(socket.id)
        if (user) {
            io.to(user.room).emit('message', formatMessage('Admin', user.username + ' has left the room'))

            //cập nhật người dùng vào sideBar
            io.to(user.room).emit('roomUsers', { room: user.room, users: getAllUserinRoom(user.room) })
        }

    })


})

function formatMessage(username, text) {
    return { username, text, time: moment().format('h:mm a') }
}

const PORT = process.env.PORT || 3000

server.listen(PORT, () => {
    console.log('http://localhost:' + PORT)
});