const _getDB =require('./db')
    , ObjectId =require('mongodb').ObjectId
    , {dedecimal, decimalfy} =require('./etc.js')
    , onlineUsers=require('./onlineuser')
    , fetch=require('node-fetch')
	, {gzip}=require('node-gzip')
	, invitation =require('./invitation');

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
	var db=await getDB(), now=new Date();
	try {
		var {value}=await db.bills.findOneAndUpdate({_id:ObjectId(orderid), used:{$ne:true}}, {$set:{used:true, confirmedAmount:money, lastTime:now}}, {w:'majority'});
		if (!value) throw 'no such orderid or order is processing';
		value=dedecimal(value);
		var {value:dbuser}=await db.users.findOneAndUpdate({phone:value.phone}, {$inc:decimalfy({balance:money})}, {w:'majority'});
		dbuser=dedecimal(dbuser);
		// 提现逻辑，
		if (dbuser.bet>=dbuser.recharge) {
			//重置下注金额
			db.users.updateOne({phone:value.phone}, {$set:{recharge:money, bet:0}});
		} else {
			//累积下注
			db.users.updateOne({phone:value.phone}, {$inc:{recharge:money}});
		}

		var invited=await db.invited.findOne({phone:value.phone}, {projection:{invitedBy:1}});
		if (invited) {
			invitation.emit('onRecharge', {inviter:invited.invitedBy, invitee:value.phone, amount:money});
		}

		var user=onlineUsers.get(value.phone);
		if (user) {
			user.socket.emit('incbalance', money);
		}
		orderid=value._id.toHexString();
		fetch('http://api.talkinggame.com/api/charge/C860613B522848BAA7F561944C23CFFD', {
			method:'post',
			body:await gzip(JSON.stringify([{msgID:orderid, status:'success', OS:'h5', accountID:value.phone, orderID:orderid, currencyAmount:money, currencyType:'IDR', virtualCurrencyAmount:money, chargeTime:new Date().getTime(), partner:dbuser.partner||'vdm'}])),
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
