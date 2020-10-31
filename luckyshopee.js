const crypto=require('crypto')
	, request=require('request')
	, fetch=require('node-fetch')
	, {gzip}=require('node-gzip')
	, url =require('url')
	, router=require('express').Router()
	, bodyParser = require('body-parser')
	, ObjectId =require('mongodb').ObjectId
	, {dedecimal} =require('./etc')
	, getDB=require('./db')
	, httpf=require('httpf')
	, args=require('yargs').argv
	, debugout=require('debugout')(args.debugout)
	,{confirmOrder, returnMoney}=require('./order')

const _default={
	sms_url:'https://pay.luckyshopee.com/sms/send',
	pay_url:'https://pay-test.upayout.com/pay/createPaymentOrder',
	withdraw_url:'https://pay-test.upayout.com/pay/createPayoutOrder',
	appId:'devTestAppId', 
	appKey:'fe68e63bea35f8edeae04daec0ecb722',
	appChannel:'wypay'
}

var sms_url, pay_url, withdraw_url, appId, appKey, appChannel;

function makeSign(data) {
	var hash = crypto.createHash('sha256');

	delete data.sign;
	var o=Object.assign({}, data);
	function assembleObj(o) {
		var message='';
		Object.keys(o).sort().map((key)=>{
			if (key=='sign') return;
			if (!o[key]) return;
			if (key=='extInfo') message+=(''+key+'='+assembleObj(o[key]));
			else message+=''+key+'='+o[key]+'&';
		})
		return message;
	}
	var str=assembleObj(o)+'key='+appKey;
	debugout(str)
	hash.update(str);
	o['sign'] = hash.digest('hex');
	return o;
}

function orderForm(req, o) {
	var {protocol}=url.parse(req.headers.origin);
	return makeSign({
		version:'1.1', 
		appId:appId, 
		country:'ID', 
		currency:'IDR', 
		prodName:'southeast.asia',
		appChannel:appChannel,
		notifyUrl:url.format({host:req.headers.host, pathname:'pf/luckyshopee/done', protocol}), 
		returnUrl:url.format({host:req.headers.host, pathname:'/', protocol}),
		...o
	});
}

function verifySign(req, res, next) {
	var sign=req.body.sign, wanted=makeSign(req.body);
	if (sign==wanted.sign) return next();
	debugout({body:{...req.body, sign}, wanted});
	res.send({err:'sign error'});
}

getDB((err, db)=>{
	db.settings.findOne({}, (err, s)=>{
		if (err) return;
		if (!s || !s.luckyshopee) return;
		chgSettings(s.luckyshopee);
		// s=s.luckyshopee;
		// sms_url=s.sms_url||sms_url;
		// pay_url=s.pay_url||pay_url;
		// withdraw_url=s.withdraw_url||withdraw_url;
		// appId=s.appId||appId
		// appKey=s.appKey||appKey;
		// appChannel=s.appChannel||appChannel;
		debugout('luckyshopee init with', {pay_url, withdraw_url});
	})
	router.all('/done', bodyParser.urlencoded({ extended: true, limit: '1mb' }), verifySign, httpf({transNo:'string', merTransNo:'string', amount:'number', processAmount:'number', transStatus:'string', callback:true}, async function(transNo, merTransNo, amount, processAmount, transStatus, cb) {
		debugout(this.req.body);
		if (transStatus!='success') return cb(null, httpf.text('success'));
		try {
			await confirmOrder(merTransNo, amount);
			// var {value}=await db.bills.findOneAndUpdate({_id:ObjectId(merTransNo), used:{$ne:true}}, {$set:{used:true, lastTime:new Date()}}, {w:'majority'});
			// if (!value) throw 'no such orderid or order is processing';
			// value=dedecimal(value);
			// await db.users.updateOne({phone:value.phone}, {$inc:{balance:value.money}}, {w:'majority'});
			// orderid=value._id.toHexString();
			// fetch('http://api.talkinggame.com/api/charge/C860613B522848BAA7F561944C23CFFD', {
			// 	method:'post',
			// 	body:await gzip(JSON.stringify([{msgID:orderid, status:'success', /*OS:'h5', accountID:value.phone, orderID:orderid, currencyAmount:value.money, currencyType:'CNY', virtualCurrencyAmount:value.money, chargeTime:new Date().getTime()*/}])),
			// 	headers: { 'Content-Type': 'application/json' },
			// });
			return cb(null, httpf.text('success'));
		} catch(e) {
			debugout(e);
			return cb(e);
		}
	}));  
	router.all('/withdraw_result', bodyParser.urlencoded({extended:true, limit:'1mb'}), verifySign, httpf({resultCode:'string', merTransNo:'string', tradeStatus:'string', callback:true}, async function(resultCode, merTransNo, tradeStatus, callback) {
		try {
			var {value:bill}=await db.withdraw.findOneAndUpdate({_id:ObjectId(merTransNo), result:null}, {$set:{result:this.req.body, lastTime:new Date()}}, {w:'majority'});
			if (!bill) return callback(null, httpf.text('no such withdraw order'));
			if (tradeStatus=='failure') {
				// back money to user account;
				bill=dedecimal(bill);
				returnMoney(bill.phone, bill.snapshot.amount-bill.snapshot.fee);
			}
			return callback(null, httpf.text('success'));
		}catch(e) {
			return callback(null, httpf.text('internel error'));
		}
	}));
})

exports.sendSms=function(phone, deviceId, ip, captcha, content) {
	request.post({uri:sms_url, json:makeSign({appId, phone, deviceId, userIp:ip, captcha, content})}, (err, header, body)=>{
		debugout(body);       
	})
}

const createOrder=exports.createOrder=function(orderid,userInfo, partner, money, req, cb) {
	return new Promise((resolve, reject)=>{
		cb=cb||function (err, r){
			if (err) return reject(err);
			return resolve(r);
		}
		const reqobj={uri:pay_url, json:orderForm(req, {userId:userInfo.phone, userIp:userInfo.socket.remoteAddress, merTransNo:orderid, amount:money.toFixed(2), appChannel:partner})};
		debugout(reqobj);
		request.post(reqobj, (err, header, body)=>{
			if (err) return cb(err);
			ret=body;
			debugout(body);
			if (ret.Code!='200') return cb(ret.Msg);
			return cb(null, ret.Data.url);
		})    
	});
}

const createWithdraw=exports.createWithdraw=function(orderid, money, phone, req, cb) {
	return new Promise((resolve, reject)=>{
		cb=cb||function (err, r){
			if (err) return reject(err);
			return resolve(r);
		}
		request.post({uri:withdraw_url, json:orderForm(req, {
			merTransNo:orderid
			, appChannel
			, amount:money.toFixed(2)
			, pmId:'paytm.wallet.payout'
			, extInfo: {
				payeeMobile:phone
			}
		})}, (err, header, body)=>{
			if (err) return cb(err);
			var ret=body;
			if (ret.Code!='200') return cb(ret.Msg);
			return cb(null, ret.Data.tradeNo);
		})	
	})
}

const createIdrWithdraw =exports.createIdrWithdraw=function(orderid, orderInfo, partner, req, cb) {
	return new Promise((resolve, reject)=>{
		cb=cb||function (err, r){
			if (err) return reject(err);
			return resolve(r);
		}
		var {protocol}=url.parse(req.headers.origin);
		var reqobj={uri:withdraw_url, json:orderForm(req, {
			merTransNo:orderid
			, amount:orderInfo.amount.toFixed(2)
			, pmId:'payout.bank.id'
			, notifyUrl:url.format({host:req.headers.host, pathname:'pf/luckyshopee/withdraw_result', protocol})
			, prodName: 'southeast.asia.payout'
			, userId: orderInfo.phone
			, extInfo: {
				bankName:orderInfo.bankName, bankCode:orderInfo.bankCode,accountHolderName:orderInfo.accountName,accountNumber:orderInfo.accountNo,payeeMobile:orderInfo.phone
			}
			,appChannel:partner
		})};
		debugout(reqobj);
		// cb(null, 'testcode');
		request.post(reqobj, (err, header, body)=>{
			if (err) return cb(err);
			var ret=body;
			debugout(body);
			if (typeof ret!='object') return cb('luckyshopee return wrong data');
			if (ret.Code!='200') return cb(ret.Msg);
			if (ret.Data.resultCode!='0000') return cb(ret.Data.message)
			return cb(null, ret.Data.tradeNo);
		})	
	})
}

exports.router=router;
const chgSettings=exports.chgSettings=(s)=>{
	sms_url=s.sms_url||_default.sms_url;
	pay_url=s.pay_url||_default.pay_url;
	withdraw_url=s.withdraw_url||_default.withdraw_url;
	appId=s.appId||_default.appId
	appKey=s.appKey||_default.appKey;
	appChannel=s.appChannel||_default.appChannel;
}
if (module==require.main) {
	const {ID}=require('./etc');

	// async function test() {
	// 	var x=await createOrder('test'+ID(), 1, {headers:{host:'127.0.0.1:9000', origin:'http://127.0.0.1:9000'}});
	// 	console.log(x);
	// }

	// try {
	// 	test();
	// } catch(e) {
	// 	console.error(e);
	// }
	(async () =>{
		var orderid=ID(), value={phone:'8123456782', money:100};
		console.log('============first request status=request===============');
		var msg=[{msgID:orderid, status:'request', OS:'h5', accountID:value.phone, orderID:orderid, currencyAmount:value.money, currencyType:'IDR', virtualCurrencyAmount:value.money, chargeTime:new Date().getTime(), gameServer:'', level:1, paymentType:'default'}]
		var reqobj={
			method:'post',
			body:await gzip(JSON.stringify(msg)),
			headers: { 'Content-Type': 'application/json' },
		}
		console.log(msg, reqobj);
		var result=await fetch('http://api.talkinggame.com/api/charge/C860613B522848BAA7F561944C23CFFD', reqobj);	
		console.log('==========response=============')
		console.log(result);

		console.log('==============second request status=success==============');
		msg=[{msgID:orderid, /*orderID:orderid,*/ status:'success'/*, OS:'h5', accountID:value.phone, orderID:orderid, currencyAmount:value.money, currencyType:'IDR', virtualCurrencyAmount:value.money, chargeTime:new Date().getTime(), gameServer:'', level:1, paymentType:'default'*/}]
		reqobj={
			method:'post',
			body:await gzip(JSON.stringify(msg)),
			headers: { 'Content-Type': 'application/json' },
		}
		console.log(msg, reqobj);
		console.log(await fetch('http://api.talkinggame.com/api/charge/C860613B522848BAA7F561944C23CFFD', reqobj));
	})();

	// try {
	//     createOrder('test'+ID(), 1, {headers:{host:'127.0.0.1:9000', origin:'http://127.0.0.1:9000'}}, (err, r)=>{
	//         console.log(r);
	//     });
	//     createWithdraw('w'+ID(), 1, '8123456782', {headers:{host:'127.0.0.1:9000', origin:'http://127.0.0.1:9000'}}, (err, r)=>{
	//         console.log(r);
	//     })
	// } catch(e) {console.error(e)}

}