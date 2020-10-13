var server = require('http').createServer()
	, fetch=require('node-fetch')
	, {gzip} =require('node-gzip')
	// , url = require('url')
	, path = require('path')
	// , WebSocketServer = require('ws').Server
	// , wss = new WebSocketServer({ server: server })
	, io =require('socket.io')(server)
	, express = require('express')
	, app = express()
	// , compression = require('compression')
	// , bodyParser = require('body-parser')
	// , qs = require('querystring')
	, md5=require('md5')
	, getDB=require('./db.js')
	, ObjectId =require('mongodb').ObjectId
	, {dec2num, dedecimal, decimalfy, ID} =require('./etc.js')
	, rndstring=require('randomstring').generate
	, {sendSms, createOrder, createWithdraw, createIdrWithdraw, chgSettings} =require('./luckyshopee.js')
	, argv=require('yargs')
		.default('port', 7008)
		.argv
	, debugout =require('debugout')(argv.debugout)
	, {FB} = require('fb')
	, {OAuth2Client} = require('google-auth-library')
	, gooclient = new OAuth2Client('647198173064-h0m8nattj0pif2m1401terkbv9vmqnta.apps.googleusercontent.com')

require('colors');

const timezone='+07';

var {router, chgSettings}=require('./luckyshopee');

app.use(express.static(path.join(__dirname, 'app/dist'), 
	{
		maxAge:7*24*3600*1000, 
		index: 'index.html',
		setHeaders:(res, fn)=>{
			if (path.extname(fn)=='.html') res.setHeader('Cache-Control', 'public, max-age=0');
		},
	}
));
if (argv.debugout) {
    app.use(function(req, res, next) {
        debugout('access', req.url, {...req.query, ...req.body});
        next();
    });
}
app.use('/pf/luckyshopee', router);

if (argv.fbaccess) {
	FB.api('me', { fields: ['id', 'name', 'icon'], access_token: argv.fbaccess}, res=>{
		console.log(res);
	});
	return console.log('debug facebook'.green);
}

server.on('request', app);
server.listen(argv.port, function () { console.log(`Listening on ${server.address().port}`.green) });

const default_user={balance:0};

Number.prototype.pad = function(size) {
	var s = String(this);
	while (s.length < (size || 2)) {s = "0" + s;}
	return s;
}

const datestring =(t)=>{
	return `${t.getFullYear().pad(4)}${(t.getMonth()+1).pad()}${t.getDate().pad()}`;
}

const onlineUsers=require('./onlineuser');

function Game(settings, db) {
	var status='not_running', countdown, starttime, endtime, period;
	var today, setno=0;
	var contracts=[];
	var history=[];
	return {
		snapshot(user) {
			return {
				status, countdown, starttime, endtime, period, history, orders:contracts.filter((c)=>c.user==user)
			}
		},
		start() {
			starttime=new Date();
			var thisday=datestring(starttime);
			if (today!=thisday) {
				setno=0;
				today=thisday;
			}
			setno++;
			countdown=3*60;
			status='running';
			endtime=new Date(starttime.getTime()+countdown*1000);
			period=today+setno.pad(4);
			io.sockets.emit('statechanged', {countdown, starttime, endtime, period, status});
			var self=this;
			var timer=setInterval(() => {
				countdown--;
				if (countdown==0) {
					clearInterval(timer);
					self.onEnd();
				}
				if (countdown==30) {
					status='stop_betting';
					io.sockets.emit('statechanged', {status});
					// broadcast({c:'game.status', status});
				}
			}, 1000);
		},
		findResult() {
			if (Array.isArray(settings.temp_result) && settings.temp_result.length) {
				return Math.floor((19000+Math.floor(Math.random()*1000))/10)*10+settings.temp_result.shift();
			}
			switch (settings.strategy) {
				case 0:
					// random strategy
					break;
				case 1:
					// system always win
					var pay=[0, 0, 0, 0, 0, 0, 0, 0, 0, 0], recieve=0;
					for (var i=contracts.length-1; i>=0; i--) {
						var c=contracts[i];
						if (c.game.period!=period) break;
						var coins=c.betting-c.fee;
						recieve+=coins;
						switch (c.select) {
						case 'Green':
							[1, 3, 7, 9].forEach((n)=>{pay[n]+=2*coins});
							pay[5]+=1.5*coins;
							break;
						case 'Red':
							[2, 4, 6, 8].forEach((n)=>{pay[n]+=2*coins});
							pay[0]+=1.5*coins;
							break;
						case 'Violet':
							pay[0]+=4.5*coins;
							pay[5]+=4.5*coins;
							break;
						default:
							var n=Number(c.select);
							if (Number.isNaN(n)) break;
							pay[n]+=9*coins;
						}
					}
					if (recieve==0) break;
					// 只有赔付小于收入的数字才会被计入anticipates
					var anticipates=[];
					pay.forEach((v, idx)=>{
						if (v<recieve) anticipates.push(idx);
					})
					return 19000+Math.floor(Math.random()*100)*10+anticipates[Math.floor(Math.random()*anticipates.length)];
				default:
					break;;
			}
			return 19000+Math.floor(Math.random()*1000);
		},
		getResult(p) {
			p=String(p);
			return Number(p.substr(p.length-1, 1))
		},
		dealResult(contract, price) {
			var game_number=this.getResult(price);
			if (contract.select=='Green') {
				if (game_number%2==1) {
					if (game_number==5) return 1.5*(contract.betting-contract.fee);
					else return 2*(contract.betting-contract.fee);
				}
			}
			if (contract.select=='Red') {
				if (game_number%2==0) {
					if (game_number==0) return 1.5*(contract.betting-contract.fee);
					else return 2*(contract.betting-contract.fee);
				}
			}
			if (contract.select=='Violet') {
				if (game_number==0 || game_number==5) {
					return 4.5*(contract.betting-contract.fee);
				}
			}
			if (contract.select==game_number) {
				return 9*(contract.betting-contract.fee);
			}
			return 0;
		},
		onEnd() {
			var r=this.findResult();
			var gr={period, price:r, starttime, endtime};
			status='not_running';
			io.sockets.emit('gameresult', {status, history:gr})
			db.games.insertOne(gr);
			history.push(gr);
			if (history.length>=50) history.splice(0, history.length-40);

			// deal all contracts
			var userwins={};
			for (var i=contracts.length-1; i>=0; i--) {
				var c=contracts[i];
				if (c) {
					if (c.game.period!=period) break;
					c.game.price=r;
					var win=Number(this.dealResult(c, r).toFixed(2));
					if (win) {
						if (userwins[c.user]==null) userwins[c.user] ={ balance:win, socket:c.socket};
						else userwins[c.user].balance+=win;
					}
				}
			}
			var dbop=[];
			for (var u in userwins) {
				dbop.push({updateOne:{filter:{phone:u}, update:{$inc:decimalfy({balance:userwins[u].balance, win:userwins[u].balance})}}});
				var onlineu=onlineUsers.get(u);
				if (onlineu) onlineu.socket.emit('incbalance', userwins[u].balance);
			}
			if (dbop.length) db.users.bulkWrite(dbop);
			setTimeout(this.start.bind(this), 2*1000);
		},
		async bet(user, select, money, cb) {
			if (status!='running') return cb('Betting is not allowed at this time');
			if (money<=0) return cb('Illegal operation');
			try {
				var dbuser=await db.users.findOne({phone:user.phone});
				if (!dbuser) throw('no such user');
				var inc=decimalfy({balance:-money, bet:money});

				var {value}=await db.users.findOneAndUpdate({phone:user.phone, balance:{$gte:money}}, {$inc:inc}, {w:'majority'});
				dbuser=dedecimal(value);
				if (!dbuser) throw 'not enough balance';
				var fee=Math.floor(money*settings.feeRate*100)/100;
				var contract={_id:new ObjectId(), time:new Date(), user:user.phone, money:money-fee, fee:fee, betting:money, select:select, game:{status, period, starttime, endtime, setno}};
				db.contracts.insertOne(contract);
				contracts.push(contract);
				cb(null, 
					{
						select:contract.select, fee:contract.fee, betting:money,
						time:contract.time, game:{period:contract.game.period, endtime:contract.game.endtime}
					}
				);
			} catch(e) {
				return cb(e);
			}
		}
	}
}

async function approvalWithdraw(user, withdrawOrder, settings, db) {
	return null;
	// 运营要求不限制
	// if (!settings.withdrawAmountLimit && !settings.withdrawTimesLimit && !settings.withdrawTakenLimit) return null;
	// var dbw=db.db.collection('withdraw', {
	// 	readPreference: 'secondaryPreferred',
	// 	readConcern: { level: 'majority' },
	// 	writeConcern: { w: 'majority' }
	// });
	// var today=new Date();
	// var strToday=''+today.getFullYear().pad(4)+(today.getMonth()+1).pad(2)+today.getDate().pad(2);
	// var [userStat] =await dbw.aggregate([
	// 	{$addFields:{dot:{$dateToString:{date:'$time', format:'%Y%m%d', timezone}}}},
	// 	{$match:{dot:strToday, phone:user.phone, luckyshopee_tradeno:{$ne:null}}},
	// 	{$group:{
	// 		_id:1,
	// 		times:{$sum:1},
	// 		taken:{$sum:'$snapshot.amount'}
	// 	}}
	// ]).toArray();
	// if (!userStat) return null;
	// var {_id, ...refuse}=userStat;
	// if ((!settings.withdrawTimesLimit || userStat.times<=settings.withdrawTimesLimit) &&
	// 	(!settings.withdrawAmountLimit || withdrawOrder.amount<=settings.withdrawAmountLimit) &&
	// 	(!settings.withdrawTakenLimit || (withdrawOrder.amount+userStat.taken)<=settings.withdrawAmountLimit)
	// ) return null;
	// return refuse;
}

class User {
	constructor(socket, dbuser) {
		this.socket=socket;
		this.dbuser=dbuser;
		this.phone=dbuser.phone;
		this.block=dbuser.block;
		this.isAdmin=dbuser.isAdmin;
		this.paytm_id=dbuser.paytm_id;
	}
	copyfrom(other) {
		this.dbuser=other.dbuser;
		this.phone=other.phone;
		this.block=other.block;
		this.isAdmin=other.isAdmin;
		this.paytm_id=other.paytm_id;
	}
}
var tokens={}, captchas={};

getDB(async (err, db, dbm)=>{
	// const createDbJson=dbm.createDbJson;
	function chkpwd(phone, encrypted_pwd, callback) {
		db.users.findOne({phone:phone}, (err, u)=>{
			if (err) return callback(err);
			if (encrypted_pwd!=u.pwd) return callback('Incorrect password');
			return callback();
		})
	}
	// clear all locks
	db.users.updateMany({}, {$set:{locked:false}});

	var settings= await db.settings.findOne();
	if (!settings) settings={};
	settings.feeRate=settings.feeRate||0.02;
	settings.withdrawPercent=settings.withdrawPercent||0;
	settings.withdrawFixed=settings.withdrawFixed||100000;
	const game=Game(settings, db);
	game.start();

	io.on('connection', function connection(socket) {
		var req=socket.request;
		socket.remoteAddress=req.headers['cf-connecting-ip']||req.headers['x-forwarded-for']||req.headers['X-Real-IP']||req.headers['x-real-ip']||req.connection.remoteAddress;
		debugout('someone in');

		socket.on('salt', async (phone, cb)=>{
			try {
				var dbuser=await db.users.findOne({phone:phone});
				if (!dbuser) return cb('no such user '+phone);
				if (dbuser.salt==null) return cb("can not login with password")
				cb(null, dbuser.salt);
			} catch(e) {
				return cb(e);
			}

		})
		.on('login', async (pack, cb)=>{
			if (!pack.phone) return cb('phone must be set');
			// check token if exists
			if (pack.t) {
				var tokenData=tokens[pack.phone];
				if (!tokenData || tokenData.t!=pack.t || tokenData.expired<new Date()) return  cb('token has been expired');
			}
			try {
				var dbuser=await db.users.findOne({phone:pack.phone});
			} catch(e) {return cb(e.message)}
			// check password if token was not set
			if (!pack.t) {
				if (dbuser.pwd==null) return cb("can not login with password")
				if (pack.pwd!=dbuser.pwd) return cb('Incorrect password');
			}
			if (new Date(dbuser.block)>new Date()) {
				cb('Account has been banned');
				socket.disconnect(true);
				return;
			}
			
			var oldUser=onlineUsers.get(pack.phone)
			if (oldUser) {
				debugout('already online, kick old');
				socket.user=oldUser;
				oldUser.socket.emit('kicked', 'Account has logined at another place');
				oldUser.socket.user=null;
				oldUser.socket.disconnect(true);
				oldUser.socket=socket;
				oldUser.offline=false;
			} 
			else {
				debugout('new one');
				socket.user=new User(socket, dbuser);
				onlineUsers.add(socket.user);
			}
			db.users.updateOne({phone:pack.phone}, {$set:{lastIP:socket.remoteAddress, lastTime: new Date()}});

			var tokenData=tokens[pack.phone];
			if (!tokenData) {
				tokenData=tokens[pack.phone]={expired:new Date()+24*60*60*1000, t:ID()}
			} else tokenData.expired=new Date()+24*60*60*1000;

			cb(null, tokenData.t);
			var content={user:dedecimal({_id:dbuser._id, phone:pack.phone, balance:dbuser.balance, paytm_id:dbuser.paytm_id, whatsup:settings.whatsup}), ...game.snapshot(pack.phone)};
			socket.emit('statechanged', content);
		})
		.on('adminexists', async (cb)=>{
			var admin=await db.users.findOne({isAdmin:true});
			cb(null, admin?true:false);
		})
		.on('regadmin', async(pack, cb)=>{
			if (!pack.phone) return cb('phone must be set');
			var admin=await db.users.findOne({isAdmin:true});
			if (!!admin) return cb('only one admin account can be registered');
			var salt=rndstring(16);
			var pwd=md5(''+salt+pack.pwd);
			var dbuser={phone:pack.phone, pwd:pwd, salt:salt, regIP:socket.remoteAddress, isAdmin:true, lastIP:socket.remoteAddress, regTime:new Date(), lastTime:new Date()};
			try {
				db.users.updateOne({phone:pack.phone}, {$set:dbuser}, {upsert:true});
			}catch(e) {return cb(e)}
			cb();
		})
		.on('reg', async (pack, cb)=>{
			if (!pack.phone) return cb('phone must be set');
			// 暂时不开启验证
			/*
			var cap=captchas[phone]
			if (!cap) return cb('The OTP is invalid');
			if (new Date()-cap.time>3*60*1000) {
				captchas[phone]=null;
				return cb('The OTP is overtime');
			}
			if (cap.captcha!=pack.otp) return cb('The OTP is invalid');
			captchas[phone]=null;
			*/
			try {
				var dbuser=await db.users.findOne({phone:pack.phone})
			} catch(e) {return cb(e)}
			if (dbuser) return cb('phone number has been used');
			
			var salt=rndstring(16);
			var pwd=md5(''+salt+pack.pwd);
			var dbuser={phone:pack.phone, pwd:pwd, salt:salt, balance:0, regIP:socket.remoteAddress, lastIP:socket.remoteAddress, regTime:new Date(), lastTime:new Date()};
			try {
				var {insertedId}=await db.users.insertOne(decimalfy(dbuser));
				dbuser._id=insertedId;
			} catch(e) {
				return cb(e);
			}
			var tokenData=tokens[pack.phone];
			if (!tokenData) {
				tokenData=tokens[pack.phone]={expired:new Date()+24*60*60*1000, t:ID()}
			} else tokenData.expired=new Date()+24*60*60*1000;

			cb(null, tokenData.t);
			socket.emit('statechanged', {user:dedecimal({_id:dbuser._id, balance:dbuser.balance, whatsup:settings.whatsup}), ...game.snapshot(pack.phone)});
		})
		.on('fb_login', (accessToken, cb) =>{
			FB.api('me', { fields: ['id', 'name'], access_token: accessToken }, async (res)=>{
				const now=new Date();
				var {value:dbuser}=await db.users.findOneAndUpdate({phone:res.id}, {$set:{name:res.name, fb_id:res.id, lastTime:now, lastIP:socket.remoteAddress}, $setOnInsert:{regIP:socket.remoteAddress, regTime:now}} ,{upsert:true, returnOriginal:false, w:1});

				if (new Date(dbuser.block)>now) {
					cb('Account has been banned');
					socket.disconnect(true);
					return;
				}
				
				var oldUser=onlineUsers.get(res.id)
				if (oldUser) {
					debugout('already online, kick old');
					socket.user=oldUser;
					oldUser.socket.emit('kicked', 'Account has logined at another place');
					oldUser.socket.user=null;
					oldUser.socket.disconnect(true);
					oldUser.socket=socket;
					oldUser.offline=false;
				} 
				else {
					debugout('new one', dbuser);
					socket.user=new User(socket, dbuser);
					onlineUsers.add(socket.user);
				}
				
				var tokenData=tokens[dbuser.phone];
				if (!tokenData) {
					tokenData=tokens[dbuser.phone]={expired:new Date()+24*60*60*1000, t:ID()}
				} else tokenData.expired=new Date()+24*60*60*1000;

				cb(null, tokenData.t, res.id);
				socket.emit('statechanged', {user:dedecimal({_id:dbuser._id, phone:res.id, paytm_id:dbuser.paytm_id, balance:dbuser.balance, name:dbuser.name, icon:`https://graph.facebook.com/${res.id}/picture?type=album`, whatsup:settings.whatsup}), ...game.snapshot(res.id)});
			});
		})
		.on('google_login', async (id_token, cb)=>{
			try {
				const ticket = await gooclient.verifyIdToken({
					idToken: id_token,
					audience: '647198173064-h0m8nattj0pif2m1401terkbv9vmqnta.apps.googleusercontent.com',
				});
				const payload = ticket.getPayload();
				const userid = payload['sub'], name=payload.name, icon=payload.picture;
				const now=new Date();
				var {value:dbuser}=await db.users.findOneAndUpdate({phone:userid}, {$set:{name:name, goo_id:userid, lastTime:now, lastIP:socket.remoteAddress}, $setOnInsert:{regIP:socket.remoteAddress, regTime:now}} ,{upsert:true, returnOriginal:false, w:1});
				if (new Date(dbuser.block)>now) {
					cb('Account has been banned');
					socket.disconnect(true);
					return;
				}
				
				var oldUser=onlineUsers.get(userid)
				if (oldUser) {
					debugout('already online, kick old');
					socket.user=oldUser;
					oldUser.socket.emit('kicked', 'Account has logined at another place');
					oldUser.socket.user=null;
					oldUser.socket.disconnect(true);
					oldUser.socket=socket;
					oldUser.offline=false;
				} 
				else {
					debugout('new one', dbuser);
					socket.user=new User(socket, dbuser);
					onlineUsers.add(socket.user);
				}

				var tokenData=tokens[dbuser.phone];
				if (!tokenData) {
					tokenData=tokens[dbuser.phone]={expired:new Date()+24*60*60*1000, t:ID()}
				} else tokenData.expired=new Date()+24*60*60*1000;

				cb(null, tokenData.t, dbuser.phone);
				socket.emit('statechanged', {user:dedecimal({_id:dbuser._id, phone:userid, paytm_id:dbuser.paytm_id, balance:dbuser.balance, name:dbuser.name, icon:icon, whatsup:settings.whatsup}), ...game.snapshot(userid)});
			} catch(e) {
				debugout(e);
				cb(e);
			}
		})
		.on('betting', async (pack, cb)=>{
			if (!socket.user) return cb('can not do that');
			await game.bet(socket.user, pack.select, pack.money, cb);
		})
		.on('beforereg', (phone, deviceid)=>{
			var c=captchas[phone];
			if (!c) c=captchas[phone]={phone:phone, captcha:Math.floor(Math.random()*1000).pad(4), time:new Date()};
			else {
				c.captcha=Math.floor(Math.random()*1000).pad(4);
				c.time=new Date()
			};

			sendSms(phone, deviceid, socket.remoteAddress, c.captcha);
		})
		.on('recharge', async (amount, partner, cb)=>{
			if (amount<=0) return cb('Illegal operation');
			if (!socket.user) {
				cb('Can not top up before login');
				return console.error('recharge before login');
			}
			try {
				var dbuser=await db.users.findOne({phone:socket.user.phone});
				if (!dbuser) cb('no such user');
				var {insertedId}=await db.bills.insertOne({phone:socket.user.phone, snapshot:{balance:dbuser.balance}, money:amount, time:new Date(), lastTime:new Date(), used:false}, {w:'majority'});
				var orderid=insertedId.toHexString();
				await fetch('http://api.talkinggame.com/api/charge/C860613B522848BAA7F561944C23CFFD', {
					method:'post',
					body:await gzip(JSON.stringify([{msgID:orderid, status:'request', OS:'h5', accountID:socket.user.phone, orderID:orderid, currencyAmount:amount, currencyType:'IDR', virtualCurrencyAmount:amount, partner:partner}])),
					headers: { 'Content-Type': 'application/json' },
				});
				var url=await createOrder(orderid, amount, req);
				cb(null, {orderid:orderid, jumpto:url});
			} catch(e) {return cb(e)}
		})
		.on('setpaytmid', async (id, cb)=>{
			if (!socket.user) {
				cb('Can not set paytm id before login');
				return console.error('setpaytmid before login');	
			}
			try {
				await db.users.updateOne({phone:socket.user.phone}, {$set:{paytm_id:id}});				
				socket.emit('statechanged', {user:{paytm_id:id}});
				cb();
			} catch(e) {
				return cb(e);
			}
		})
		.on('withdraw', async(money, cb)=>{
			if (money<=0) return cb('Illegal operation');
			if (socket.user==null) {
				cb('Can not withdraw before login');
				return console.error('withdraw before login');	
			}
			try {
				debugout('user', socket.user);
				var {value}=await db.users.findOneAndUpdate({phone:socket.user.phone, locked:{$ne:true}, balance:{$gte:money}}, {$set:{locked:true}}, {w:'majority'});
				var dbuser=dedecimal(value);
				if (!dbuser) return cb('can not manipulate user data right now');
				var fee=Math.floor(money*settings.withdrawPercent*100)/100+settings.withdrawFixed;
				var id=new ObjectId();
				var tradeno=await createWithdraw(id.toHexString(), money-fee, dbuser.paytm_id, req);
				await db.users.updateOne({phone:socket.user.phone}, {$set:{locked:false}, $inc:{balance:-money}});
				var withdraw={_id:id, time:new Date(), phone:socket.user.phone, money:money, fee:fee, snapshot:{balance:dbuser.balance}, luckyshopee_tradeno:tradeno};
				db.withdraw.insertOne(withdraw);
				socket.emit('incbalance', -money);
				cb();
			} catch(e) {return cb(e)}
		})
		.on('idr_bankinfo', async (cb)=>{
			if (!socket.user) return cb('Can not get bankinfo before login');
			try {
				var {bankinfo}=await db.users.findOne({phone:socket.user.phone}, {projection:{bankinfo:1}});
				cb(null, bankinfo);
			} catch(e) {
				cb(e);
			}
		})
		/***
		 * property withdrawOrder {amount,accountNo, accountName, bankCode, phone} 
		*/
		.on('idr_withdraw', async (withdrawOrder, cb)=>{
			withdrawOrder.amount=Number(withdrawOrder.amount);
			if (withdrawOrder.amount<=0) return cb('Illegal operation');
			if (socket.user==null) {
				cb('Can not withdraw before login');
				return console.error('withdraw before login');	
			}
			const session=db.mongoClient.startSession(),
			opt={
				readPreference: 'secondaryPreferred',
				readConcern: { level: 'majority' },
				writeConcern: { w: 'majority' }
			};
			try {
				var dbuser=await db.users.findOne({phone:socket.user.phone});
				if (!dbuser) throw('no such user');
				var bankinfo={...withdrawOrder};
				delete bankinfo.amount;
				var money=withdrawOrder.amount;
				var fee=Math.floor(money*settings.withdrawPercent*100)/100+settings.withdrawFixed;
				if (fee>money) throw 'not enough money';

				var id=new ObjectId();
				await session.withTransaction(async ()=>{
					var {value}=await db.users.findOneAndUpdate({phone:socket.user.phone, balance:{$gte:withdrawOrder.amount}}, {$inc:{balance:-withdrawOrder.amount}, $set:{bankinfo}}, {session});
					dbuser=dedecimal(value);
					if (!dbuser) throw 'not enough balance';
					var withdraw={_id:id, time:new Date(), phone:socket.user.phone, snapshot:{balance:dbuser.balance, ...withdrawOrder, fee}};
					await db.withdraw.insertOne(withdraw, {session});
				}, opt);
				withdrawOrder.amount-=fee;
				var refuse=await approvalWithdraw(socket.user, withdrawOrder, settings, db), tradeno;
				if (!refuse) {
					tradeno=await createIdrWithdraw(id.toHexString(), withdrawOrder, req);
				}
				db.withdraw.updateOne({_id:id}, {$set:{stat:refuse||undefined,luckyshopee_tradeno:tradeno}});
				socket.emit('statechanged', {user:{balance:(dbuser.balance||0)-money}});
				cb();
			} 
			catch(e) {
				// db.users.updateOne({phone:socket.user.phone}, {$set:{locked:false}});
				debugout(e);
				return cb(e)
			}finally{
				await session.endSession();
			}
		})
		.on('idr_withdrawqualified', async(cb)=>{
			if (socket.user==null) {
				cb('Can not withdraw before login');
				return console.error('withdraw before login');	
			}
			try {
				var [qualified]=await db.users.aggregate([
					{$match:{phone:socket.user.phone}},
					{$project:{ab: {$cmp: ['$bet','$recharge']}}},
					{$match:{ab:{$gte:0}}}
				]).toArray();
				return cb(null, !!qualified)
			} catch(e) {cb(e)}
		})
		.on('dailywithdraw', async (unused_timezone, cb)=>{
		if (socket.user==null) {
				cb('Can not withdraw before login');
				return console.error('withdraw before login');	
			}
			var today=new Date();
			var strToday=''+today.getFullYear().pad(4)+(today.getMonth()+1).pad(2)+today.getDate().pad(2);
			var [userTotal]=await db.withdraw.aggregate([
				{$addFields:{dot:{$dateToString:{date:'$time', format:'%Y%m%d', timezone}}}},
				{$match:{dot:strToday, phone:socket.user.phone, luckyshopee_tradeno:{$ne:null}}}, 
				{$group:{
					_id:'1', 
					total:{$sum:'$snapshot.amount'}
				}}
			]).toArray();
			cb(null, userTotal?dec2num(userTotal.total):0);
		})
		// admin tools
		.on('getsettings', (cb)=>{
			if (!socket.user || !socket.user.isAdmin) return cb('access denied');
			cb(null, {...settings, online:onlineUsers.length>0?(onlineUsers.length-1):0})
		})
		.on('setsettings', async (values, cb)=>{
			if (!socket.user || !socket.user.isAdmin) return cb('access denied');
			if (values.whatsup!=null && values.whatsup!=settings.whatsup) {
				onlineUsers.all.forEach((phone)=>{
					var u=onlineUsers.get(phone);
					if (u.socket && u.socket!=socket) u.socket.emit('statechanged', {user:{whatsup:values.whatsup}});
				});
			}
			Object.assign(settings, values);
			try {
				var {temp_result, ...stored} =settings;
				await db.settings.updateOne({_id:'server'}, {$set:stored}, {upsert:true});
				db.adminlog.insertOne({op:'setsettings', admin:socket.user.phone, value:settings, time:new Date()});
				chgSettings(settings);
			} catch(e) {return cb(e)}
			cb();
		})
		.on('queryuser', async (phone, cb)=>{
			try {
				if (!socket.user || !socket.user.isAdmin) return cb('access denied');
				var ud=await db.users.findOne({phone});
				ud=dedecimal(ud);
				db.adminlog.insertOne({op:'queryuser', admin:socket.user.phone, target:{phone, ...ud}, time:new Date()});
				if (!ud) return cb('找不到用户');
				cb(null, {phone:ud.phone, balance:ud.balance, paytm_id:ud.paytm_id, block:ud.block});
			}catch(e) {return cb(e)}
		})
		.on('modifybalance', async(phone, delta, cb)=>{
			if (!socket.user || !socket.user.isAdmin) return cb('access denied');
			delta=Number(delta);
			var {value}=await db.users.findOneAndUpdate({phone:phone}, {$inc:decimalfy({balance:delta, recharge:delta})});
			if (!value) return cb('没有这个用户');
			db.adminlog.insertOne({op:'modifybalance', admin:socket.user.phone, target:value, change:delta, time:new Date()});
			value=dedecimal(value);
			var ud=onlineUsers.get(phone);
			if (ud) {
				var newbalance=(value.balance||0)+delta;
				ud.socket.emit('statechanged', {user:{balance:newbalance}});
			}
			cb(null, {balance:(value.balance||0)+delta});
		})
		.on('changepaytm', async(phone, idx, new_id, cb)=>{
			if (!socket.user || !socket.user.isAdmin) return cb('access denied');
			var upd={};
			upd[`paytm_id`]=new_id;
			var {value}=await db.users.findOneAndUpdate({phone:phone}, {$set:upd});
			if (!value) return cb('没有这个用户');
			db.adminlog.insertOne({op:'changepaytm', admin:socket.user.phone, target:value, change:new_id, time:new Date()});
			value=dedecimal(value);
			var ud=onlineUsers.get(phone);
			if (ud) {
				if (idx!=null) ud.paytm_id[idx]=new_id;
				else ud.paytm_id=[new_id];
				ud.socket.emit('statechanged', {user:{paytm_id:ud.paytm_id}});
			}
			cb(null, {paytm_id:value.paytm_id});
		})
		.on('delpaytm', async(phone, id, cb)=>{
			if (!socket.user || !socket.user.isAdmin) return cb('access denied');
			var upd={};
			upd['$unset']={paytm_id:''};
			var {value}=await db.users.findOneAndUpdate({phone:phone}, upd);
			if (!value) return cb('没有这个用户');
			db.adminlog.insertOne({op:'delpaytm', admin:socket.user.phone, target:value, time:new Date()});
			value=dedecimal(value);
			var ud=onlineUsers.get(phone);
			if (ud) {
				// var idx=ud.paytm_id.find(ele=>ele==id);
				// if (idx) {
				// 	ud.paytm_id.splice(idx, 1);
				// 	ud.socket.emit('statechanged', {user:{paytm_id:ud.paytm_id}});
				// }
				ud.paytm_id=null;
				ud.socket.emit('statechanged', {user:{paytm_id:ud.paytm_id}});
			}
			cb(null, {paytm_id:value.paytm_id});
		})
		.on('disableuser', async(phone, block, cb)=>{
			if (!socket.user || !socket.user.isAdmin) return cb('access denied');
			var {value}=await db.users.findOneAndUpdate({phone:phone}, {$set:{block:new Date(block)}}, {returnOriginal:false});
			if (!value) return cb('没有这个用户');
			db.adminlog.insertOne({op:'disableuser', admin:socket.user.phone, target:value, time:new Date()});
			value=dedecimal(value);
			var ud=onlineUsers.get(phone);
			if (ud) {
				onlineUsers.remove(phone);
				ud.block=block;
				ud.socket && ud.socket.disconnect(true);
			}
			cb(null);
		})
		.on('withdrawlist', async(cb)=>{
			if (!socket.user || !socket.user.isAdmin) return cb('access denied');
			try {
				var data=await db.withdraw.find({luckyshopee_tradeno:null}).toArray();
				return cb(null, dedecimal(data));
			}catch(e) {return cb(e)}
		})
		.on('admin-approve-withdraw', async(id, cb)=>{
			if (!socket.user || !socket.user.isAdmin) return cb('access denied');
			try {
				var tradeno=await createIdrWithdraw(id.toHexString(), withdrawOrder, req);
				db.withdraw.updateOne({_id:id}, {$set:{luckyshopee_tradeno:tradeno}});
				return cb();
			} catch(e) {cb(e)}
		})
		.on('error', console.error)
		.on('disconnect', function() {
			socket.disconnect();
			if (socket.user) {
				debugout('userout'.red, socket.user.phone);
				onlineUsers.remove(socket.user);
			}
		})
	})
})

