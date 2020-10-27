const _getDB=require('../db.js')
const getDB=()=>new Promise((resolve, reject)=>{
    _getDB((err, db)=>{
        if (err) return reject(err);
        resolve(db);
    })
})

const availbe=['free4500'];

module.exports={
	async list({user}) {
        if (!user) throw 'user must be specified';
        const db=await getDB();
        const dbuser=await db.users.findOne({phone:user.phone}, {projection:{promotions:1}});
        if (!dbuser.promotions) return availbe;
        return availbe.filter((name)=>!dbuser.promotions[name])
    },
    async update({user, name}) {
        if (!user) throw 'user must be specified';
        if (name!='free4500') throw('no such promotion');
        const db=await getDB();
        var cond={phone:user.phone};
        cond[`promotions.${name}`]={$eq:null};
        var upd={$inc:{balance:4500, recharge:4500}, $set:{}};
        upd.$set[`promotions.${name}`]=new Date();
        var {value:dbuser}=await db.users.findOneAndUpdate(cond, upd);
        if (!dbuser) throw ('The promotion has already participated');
        user.socket.emit('incbalance', 4500);
    }
}