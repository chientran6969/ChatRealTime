const users = []

function userJoin(id, username, room) {
    const user = {id, username, room}
    users.push(user)
    return user
}


function getAllUserinRoom(room) {
    return users.filter(user => user.room === room)
}

function userLeave(id) {
    const user = users.find(user => user.id === id)
    const index = users.indexOf(user)

    if (index !== -1) {
        return users.splice(index, 1)[0]
    }
}


module.exports= {
    userJoin,
    userLeave,
    getAllUserinRoom
}