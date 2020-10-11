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
	,{confirmOrder}=require('./index')

var sms_url='https://pay.luckyshopee.com/sms/send',
	pay_url='https://pay-test.upayout.com/pay/createPaymentOrder',
	withdraw_url='https://pay-test.upayout.com/pay/createPayoutOrder'
	appId='devTestAppId', 
	appKey='fe68e63bea35f8edeae04daec0ecb722',
	appChannel='wypay'

function makeSign(data) {
	var hash = crypto.createHash('sha256');

	delete data.sign;
	var message ='', o=Object.assign({}, data);
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
	hash.update(assembleObj(o)+'key='+appKey);
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
	debugout({...req.body, sign, wanted});
	res.send({err:'sign error'});
}

getDB((err, db)=>{
	db.settings.findOne({}, (err, s)=>{
		if (err) return;
		if (!s || !s.luckyshopee) return;
		s=s.luckyshopee;
		sms_url=s.sms_url||sms_url;
		pay_url=s.pay_url||pay_url;
		withdraw_url=s.withdraw_url||withdraw_url;
		appId=s.appId||appId
		appKey=s.appKey||appKey;
		appChannel=s.appChannel||appChannel;
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
	router.all('/withdraw_result', bodyParser.urlencoded({extended:true, limit:'1mb'}), verifySign, httpf({resultCode:'string', merTransNo:'string', callback:true}, async function(resultCode, merTransNo, callback) {
		db.withdraw.updateOne({_id:ObjectId(merTransNo)}, {$set:{result:this.req.body, lastTime:new Date()}});
		return httpf.text('success');
	}));
})

exports.sendSms=function(phone, deviceId, ip, captcha, content) {
	request.post({uri:sms_url, json:makeSign({appId, phone, deviceId, userIp:ip, captcha, content})}, (err, header, body)=>{
		debugout(body);       
	})
}

const createOrder=exports.createOrder=function(orderid, money, req, cb) {
	return new Promise((resolve, reject)=>{
		cb=cb||function (err, r){
			if (err) return reject(err);
			return resolve(r);
		}
		const reqobj={uri:pay_url, json:orderForm(req, {userId:'123456', merTransNo:orderid, amount:money.toFixed(2)})};
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

const createIdrWithdraw =exports.createIdrWithdraw=function(orderid, orderInfo, req, cb) {
	return new Promise((resolve, reject)=>{
		cb=cb||function (err, r){
			if (err) return reject(err);
			return resolve(r);
		}
		var {protocol}=url.parse(req.headers.origin);
		request.post({uri:withdraw_url, json:orderForm(req, {
			merTransNo:orderid
			, amount:orderInfo.amount.toFixed(2)
			, pmId:'payout.bank.id'
			, notifyUrl:url.format({host:req.headers.host, pathname:'pf/luckyshopee/withdraw_result', protocol})
			, prodName: 'southeast.asia.payout'
			, userId: orderInfo.phone
			, extInfo: {
				bankCode:orderInfo.bankCode,accountHolderName:orderInfo.accountName,accountNumber:orderInfo.accountNo,payeeMobile:orderInfo.phone
			}
		})}, (err, header, body)=>{
			if (err) return cb(err);
			var ret=body;
			if (typeof ret!='object') return cb('luckyshopee return wrong data');
			if (ret.Code!='200') return cb(ret.Msg);
			return cb(null, ret.Data.tradeNo);
		})	
	})
}

exports.router=router;
exports.chgSettings=(s)=>{
	sms_url=s.sms_url||sms_url;
	pay_url=s.pay_url||pay_url;
	withdraw_url=s.withdraw_url||withdraw_url;
	appId=s.appId||appId
	appKey=s.appKey||appKey;
	appChannel=s.appChannel||appChannel;
}
if (module==require.main) {
	const {ID}=require('./etc');

	async function test() {
		var x=await createOrder('test'+ID(), 1, {headers:{host:'127.0.0.1:9000', origin:'http://127.0.0.1:9000'}});
		console.log(x);
	}

	try {
		test();
	} catch(e) {
		console.error(e);
	}
	(async () =>{
		var orderid=ID(), value={phone:'8123456782', money:2000000};
		var result=await fetch('http://api.talkinggame.com/api/charge/C860613B522848BAA7F561944C23CFFD', {
			method:'post',
			body:gzip(JSON.stringify([{msgID:orderid, status:'request', OS:'h5', accountID:value.phone, orderID:orderid, currencyAmount:value.money, currencyType:'CNY', virtualCurrencyAmount:value.money, chargeTime:new Date().getTime(), gameServer:'', level:1, paymentType:'default'}])),
			headers: { 'Content-Type': 'application/json' },
		});	
		console.log(result)
		console.log(await fetch('http://api.talkinggame.com/api/charge/C860613B522848BAA7F561944C23CFFD', {
			method:'post',
			body:await gzip(JSON.stringify({msgID:orderid, orderID:orderid, status:'success'})),
			headers: { 'Content-Type': 'application/json' },
		}));
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