const crypto=require('crypto')
	, request=require('request')
	, url =require('url')
	, router=require('express').Router()
	, bodyParser = require('body-parser')
	, ObjectId =require('mongodb').ObjectId
	, {dedecimal} =require('./etc')
	, getDB=require('./db')
	, httpf=require('httpf')
	, args=require('yargs').argv
	, debugout=require('debugout')(args.debugout)

var sms_url='https://pay.luckyshopee.com/sms/send',
	pay_url='http://apidoc.upayout.com/api/',
	withdraw_url='https://pay-test.luckyshopee.com/pay/createPayoutOrder'
	appId='devTestAppId', 
	appKey='fe68e63bea35f8edeae04daec0ecb722',
	appChannel='default'

function makeSign(data) {
	var hash = crypto.createHash('sha256');

	delete data.sign;
	var message ='', o=Object.assign({appId}, data);
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
		...o, 
		version:'1.1', 
		appId:appId, 
		country:'ID', 
		currency:'IDR', 
		prodName:'southeast.asia',
		appChannel:appChannel,
		notifyUrl:url.format({host:req.headers.host, pathname:'pf/luckyshopee/done', protocol}), 
		returnUrl:url.format({host:req.headers.host, pathname:'/', protocol})
	});
}

function verifySign(req, res, next) {
	var sign=req.body.sign;
	if (sign==makeSign(req.body)) return next();
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
	router.all('/done', bodyParser.urlencoded({ extended: true, limit: '5mb' }), verifySign, httpf({transNo:'string', merTransNo:'string', amount:'number', processAmount:'number', transStatus:'string', callback:true}, async function(transNo, merTransNo, amount, processAmount, transStatus, cb) {
		if (transStatus!='success') return cb(null, httpf.text('success'));
		try {
			var {value}=await debugout.bills.findOneAndUpdate({_id:ObjectId(merTransNo), status:{$ne:'completed'}}, {$set:{status:'completed', lastTime:new Date()}}, {w:'majority'});
		} catch(e) {return cb(e);}
		if (!value) return cb('no such orderid or order is processing');
		value=dedecimal(value);
		await db.users.updateOne({phone:value.phone}, {$inc:{balance:value.money}}, {w:'majority'});
		return cb(null, httpf.text('success'));
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
			if (err) reject(err);
			return resolve(r);
		}
		request.post({uri:pay_url, json:orderForm(req, {merTransNo:orderid, amount:money.toFixed(2)})}, (err, header, body)=>{
			if (err) return cb(err);
			ret=body;
			if (ret.Code!='200') return cb(ret.Msg);
			return cb(null, ret.Data.url);
		})    
	});
}

const createWithdraw=exports.createWithdraw=function(orderid, money, phone, req, cb) {
	return new Promise((resolve, reject)=>{
		cb=cb||function (err, r){
			if (err) reject(err);
			return resolve(r);
		}
		request.post({uri:withdraw_url, json:orderForm(req, {
			merTransNo:orderid
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

exports.router=router;

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
	// try {
	//     createOrder('test'+ID(), 1, {headers:{host:'127.0.0.1:9000', origin:'http://127.0.0.1:9000'}}, (err, r)=>{
	//         console.log(r);
	//     });
	//     createWithdraw('w'+ID(), 1, '8123456782', {headers:{host:'127.0.0.1:9000', origin:'http://127.0.0.1:9000'}}, (err, r)=>{
	//         console.log(r);
	//     })
	// } catch(e) {console.error(e)}

}