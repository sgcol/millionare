const _getDB=require('../db.js')
    , getDB=()=>new Promise((resolve, reject)=>{
        _getDB((err, db)=>{
            if (err) return reject(err);
            resolve(db);
        })
    })

exports.list=async({user})=>{
    var db=await getDB();
    var arr=await db.notifies.find({phone:user.phone, read:{$ne:true}}).toArray();
    await db.notifies.updateMany({phone:user.phone}, {$set:{read:true}});
    return arr.map(item=>item.msg);
}