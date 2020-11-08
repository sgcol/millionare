const db = require('../db.js');

const _getDB=require('../db.js')
    , getDB=()=>new Promise((resolve, reject)=>{
        _getDB((err, db)=>{
            if (err) return reject(err);
            resolve(db);
        })
    })
    , onlineUsers=require('../onlineuser')

const availble=['free4500', 'baishi4500'];
// const availble=[];

const bonus={free4500:2000, baishi4500:4000};

module.exports={
	async list({user, query}) {
        if (!user) throw 'user must be specified';
        const db=await getDB();
        var cond=user.isAdmin?query:{phone:user.phone};
        const dbuser=await db.users.findOne(cond, {projection:{promotions:1}});
        if (!dbuser.promotions) return availble;
        return availble.filter((name)=>!dbuser.promotions[name])
    },
    async update({user, name, query}) {
        if (!user) throw 'user must be specified';
        if (!availble.includes(name)) throw('no such promotion');
        const db=await getDB();
        var cond=user.isAdmin?query:{phone:user.phone};
        cond[`promotions.${name}`]={$eq:null};
        var _bonus=bonus[name];
        var upd={$inc:{balance:_bonus, recharge:_bonus}, $set:{}};
        upd.$set[`promotions.${name}`]=new Date();
        var {value:dbuser}=await db.users.findOneAndUpdate(cond, upd);
        if (!dbuser) throw ('The promotion has already participated');
        if (user.isAdmin) {
            var u=onlineUsers.get(query.phone);
            if (u) u.socket.emit('incbalance', _bonus);
        } else user.socket.emit('incbalance', _bonus);
    },
    admin_list() {
        return availble;
    },
    async admin_upd(content) {
        const db=await getDB();
        db.settings.updateOne({_id:'server'}, {$set:{promotions:content}});
    }
}