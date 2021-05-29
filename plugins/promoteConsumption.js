const EventEmitter = require('events')
    , onlineUsers=require('../onlineuser');

const _getDB = require('./db');

const getDB=()=>new Promise((resolve, reject)=>{
    _getDB((err, db)=>{
        if (err) return reject(err);
        resolve(db);
    })
})
    
class ComsumptionEvent extends EventEmitter {}

const c_event=new ComsumptionEvent();

var msgs=[];
c_event.on('onGameEnd', async function(winlist) {
    var bigwins=winlist.filter(x=>(x.balance>=100000));
    if (!bigwins.length) return;
    var new_msg=[];
    await Promise.all(bigwins.map((win, phone)=>{
        return async()=>{
            var u=onlineUsers.get(phone);
            if (u) u=u.dbuser;
            else {
                var db=await getDB();
                u= await db.users.findOne({phone});
                if (!u) return;
            }
            var {name, fb_id, goo_id}=u;
            new_msg.push({name, fb_id, goo_id, phone, action:'win', amount:win});    
        }
    }));
    onlineUsers.broadcast('comsumption', new_msg);
    msgs.concat(new_msg);
})
.on('onWithdrwal', async function({phone, snapshot}) {
    var u=onlineUsers.get(phone);
    if (u) u=u.dbuser;
    else {
        var db=await getDB();
        u= await db.users.findOne({phone});
        if (!u) return;
    }
    var {name, fb_id, goo_id}=u;
    var new_msg={name, fb_id, goo_id, phone, action:'withdrawal', amount:snapshot.amount};
    onlineUsers.broadcast('comsumption', [new_msg]);
    msgs.push(new_msg);
})