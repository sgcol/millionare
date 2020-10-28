const _getDB=require('../db.js')
    , getDB=()=>new Promise((resolve, reject)=>{
        _getDB((err, db)=>{
            if (err) return reject(err);
            resolve(db);
        })
    })
    , onlineUsers=require('../onlineuser')

const availble=['free4500', 'baishi4500'];

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
        var upd={$inc:{balance:4500, recharge:4500}, $set:{}};
        upd.$set[`promotions.${name}`]=new Date();
        var {value:dbuser}=await db.users.findOneAndUpdate(cond, upd);
        if (!dbuser) throw ('The promotion has already participated');
        if (user.isAdmin) {
            var u=onlineUsers.get(query.phone);
            if (u) u.socket.emit('incbalance', 4500);
        } else user.socket.emit('incbalance', 4500);
    }
}