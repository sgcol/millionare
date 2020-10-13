const _getDB =require('./db')
    , ObjectId =require('mongodb').ObjectId
    , {dedecimal, decimalfy} =require('./etc.js')
    , onlineUsers=require('./onlineuser')
    , fetch=require('node-fetch')
    , {gzip}=require('node-gzip');

const getDB=()=>new Promise((resolve, reject)=>{
    _getDB((err, db)=>{
        if (err) return reject(err);
        resolve(db);
    })
})

async function confirmOrder(orderid, money, cb) {
	cb=cb || function (err, r) {
		if (err) throw err;
		return r;
	};
	var db=await getDB();
	try {
		var {value}=await db.bills.findOneAndUpdate({_id:ObjectId(orderid), used:{$ne:true}}, {$set:{used:true, confirmedAmount:money, lastTime:new Date()}}, {w:'majority'});
		if (!value) throw 'no such orderid or order is processing';
		value=dedecimal(value);
		await db.users.updateOne({phone:value.phone}, {$inc:decimalfy({balance:money, recharge:money})}, {w:'majority'});
		var user=onlineUsers.get(value.phone);
		if (user) {
			user.socket.emit('incbalance', money);
		}
		orderid=value._id.toHexString();
		fetch('http://api.talkinggame.com/api/charge/C860613B522848BAA7F561944C23CFFD', {
			method:'post',
			body:await gzip(JSON.stringify([{msgID:orderid, status:'success', /*OS:'h5', accountID:value.phone, orderID:orderid, currencyAmount:value.money, currencyType:'CNY', virtualCurrencyAmount:value.money, chargeTime:new Date().getTime()*/}])),
			headers: { 'Content-Type': 'application/json' },
		});
		return cb();
	} catch(e) {return cb(e)}
}
exports.confirmOrder=confirmOrder;
exports.returnMoney=async function(phone, money) {
	var db=await getDB();
	db.users.updateOne({phone}, {$inc:{balance:money}});
	var u=onlineUsers.get(phone);
	if (u) {
		u.socket.emit('incbalance', money);
	}
}
