const EventEmitter = require('events')
    , onlineUsers= require('./onlineuser');
const _getDB = require('./db');

const getDB=()=>new Promise((resolve, reject)=>{
    _getDB((err, db)=>{
        if (err) return reject(err);
        resolve(db);
    })
})

class MyEmitter extends EventEmitter {}

const myEmitter = new MyEmitter();

myEmitter.on('onJoined', async ({inviter, invitee}) => {
    var reward=4000, u=onlineUsers.get(invitee), now=new Date();
    var db=await getDB();
    db.invitationLogs.insertOne({inviter, invitee, action:'Joined Game', reward:0, time:now});
    await db.users.updateOne({phone:invitee}, {$inc:{balance:reward}}, {w:1});
    if (u) {
        u.socket.emit('incbalance', reward);
        u.socket.emit('notify', `Got a reward Rp${reward}`)
    } else {
        db.notifies.insertOne({phone:invitee, msg:`Got a reward Rp${reward}`, read:false});
    }
});

myEmitter.on('onRecharge', async ({inviter, invitee, amount})=>{
    var reward=Math.floor(amount*0.05), now=new Date();
    var u=onlineUsers.get(inviter);
    var db=await getDB();
    db.invitationLogs.insertOne({inviter, invitee, action:'Recharge', amount, reward, time:now});
    await db.users.updateOne({phone:inviter}, {$inc:{balance:reward}}, {w:1});
    if (u) {
        u.socket.emit('incbalance', reward);
        u.socket.emit('notify', `Got a reward Rp${reward}`)
    } else {
        db.notifies.insertOne({phone:inviter, msg:`Got a reward Rp${reward}`, read:false});
    }
});

// 4008611979
// 0755 26822222

module.exports=myEmitter;