const _getDB =require('../db')
    , ObjectId =require('mongodb').ObjectId
    , objPath =require('object-path')
    , {isValidNumber, dedecimal} =require('../etc')

const getDB=()=>new Promise((resolve, reject)=>{
    _getDB((err, db)=>{
        if (err) return reject(err);
        resolve(db);
    })
})

exports.list=async(op)=>{
    if (objPath.get(op, 'query.from')) {
        op.query.time={$gte:new Date(op.query.from)}
        delete op.query.from;
    }
    if (objPath.get(op, 'query.from')) {
        op.query.time={$gte:new Date(op.query.from)}
        delete op.query.from;
    }
    if (objPath.get(op, 'query.to')) {
        objPath.set(op, 'query.time.$lte', new Date(op.query.to));
        delete op.query.to;
    }
    var db=await getDB();
    var cur=db.bills.find(op.query);
    if (op.sort) {
        if (op.order=="ASC" || op.order=='asc') 
            cur.sort({[op.sort]:1});
        else cur.sort({[op.sort]:-1});
    }
    if (isValidNumber(op.offset)) cur.skip(Number(op.offset));
    if (isValidNumber(op.limit)) cur.limit(Number(op.limit));
    var [rows, total, [sum]]=await Promise.all([cur.toArray(), cur.count(), db.bills.aggregate([
        {$match:op.query},
        {$group:{_id:1, money:{$sum:'$money'}}}
    ]).toArray()]);
    return {rows:dedecimal(rows), total, sum};
}