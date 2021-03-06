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
	, {dec2num, dedecimal, decimalfy, ID, isValidNumber} =require('./etc.js')
	, rndstring=require('randomstring').generate
	, {sendSms, createOrder, createWithdraw, createIdrWithdraw, chgSettings, checkWithdrawOrder, checkFund} =require('./luckyshopee.js')
	, argv=require('yargs')
		.default('port', 7008)
		.argv
	, debugout =require('debugout')(argv.debugout)
	, {FB} = require('fb')
	, {OAuth2Client} = require('google-auth-library')
	, gooclient = new OAuth2Client('647198173064-h0m8nattj0pif2m1401terkbv9vmqnta.apps.googleusercontent.com')
	, dataProviders =require('./data-providers')
	, plugins=require('./plugins')
	, objPath=require('object-path')
	, invitation=require('./invitation')

require('colors');

const timezone='+07';

// const { online } = require('./data-providers');
var {router, chgSettings}=require('./luckyshopee');

app.use(express.static(path.join(__dirname, 'app/dist'), 
	{
		maxAge:7*24*3600*1000, 
		index: 'index.html',
		extensions:['html'],
		setHeaders:(res, fn)=>{
			if (path.extname(fn)=='.html') res.setHeader('Cache-Control', 'public, max-age=0');
			if (path.basename(fn)=='s') res.setHeader('Content-Type', 'text/html; charset=utf-8');
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

const defaultPartner=(dbuserPartner)=>{
	if (!dbuserPartner || dbuserPartner=='default') return 'vdm';
	return dbuserPartner;
}

Number.prototype.pad = function(size) {
	var s = String(this);
	while (s.length < (size || 2)) {s = "0" + s;}
	return s;
}

const datestring =(t)=>{
	return `${t.getFullYear().pad(4)}${(t.getMonth()+1).pad()}${t.getDate().pad()}`;
}

const onlineUsers=require('./onlineuser');

function barodcastToAdmin(cmd, content) {
	onlineUsers.forEach((u)=>{
		u.isAdmin && u.socket && u.socket.emit(cmd, content);
	})
}
function Game(settings, db) {
	var status='not_running', countdown, starttime, endtime, period;
	var today, setno=0;
	var contracts=[];
	var history=[];
	var wait_stop;
	return {
		contracts_provider() {
			return {
				list() {
					for (var i=contracts.length-1; i>=0; i--) {
						var c=contracts[i];
						if (c) {
							if (c.game.period!=period) break;
						}
					}
					return contracts.slice(i+1);				
				}
			}
		},
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
		async onEnd() {
			var r=this.findResult();
			var gr={period, price:r, starttime, endtime};
			status='not_running';
			io.sockets.emit('gameresult', {status, history:gr})
			await db.games.insertOne(gr, {w:'majority'});
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
			if (dbop.length) await db.users.bulkWrite(dbop, {w:'majority'});
			if (wait_stop) wait_stop();
			else setTimeout(this.start.bind(this), 2*1000);
		},
		stopGameAfterThisSet(cb) {
			wait_stop=cb;
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
				contracts.push({...contract, name:user.name, phone:user.phone});
				barodcastToAdmin('contract', {...contract, name:user.name, phone:user.phone});
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
	return 'wait 3 days';
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
	settings.withdrawFixed=settings.withdrawFixed==null?10000:settings.withdrawFixed;
	const game=Game(settings, db);
	game.start();
	dataProviders.contracts=game.contracts_provider();

	process.on('SIGINT', ()=>{
		if (onlineUsers.length==0) process.exit(0);
		var waitGameEnd=false, allu=onlineUsers.all;
		for (var i=0; i<allu.length; i++) {
			var u=onlineUsers.get(allu[i]);
			if (!u.isAdmin) {
				waitGameEnd=true;
				break;
			}
		}
		onlineUsers.broadcast('notify', 'The server will be updated before the next set. Usually this process will only take a few seconds. After the update, login again to continue the game.');
		if (waitGameEnd)
			game.stopGameAfterThisSet(()=>{
				process.exit(0);
			})
		else process.exit(0); 
	})

	io.on('connection', function connection(socket) {
		var req=socket.request;
		socket.remoteAddress=req.headers['cf-connecting-ip']||req.headers['x-forwarded-for']||req.headers['X-Real-IP']||req.headers['x-real-ip']||req.connection.remoteAddress;
		debugout('someone in');


		plugins.attach(socket);
		socket
		.on('salt', async (phone, cb)=>{
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
			if (!dbuser) return cb('no such user');
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
				if (oldUser.socket!=socket) {
					debugout('already online, kick old');
					socket.user=oldUser;
					oldUser.socket.emit('kicked', 'Account has logined at another place');
					oldUser.socket.user=null;
					oldUser.socket.disconnect(true);
					oldUser.socket=socket;
					oldUser.offline=false;
				} else {
					// nothing happened
				}
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
			var dbuser={phone:pack.phone, pwd:pwd, salt:salt, balance:0, regIP:socket.remoteAddress, lastIP:socket.remoteAddress, regTime:new Date(), lastTime:new Date(), partner:pack.partner};
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
		.on('fber_invited', (accessToken, bywhom, cb)=>{
			FB.api('me', { fields: ['id'], access_token: accessToken }, async (res)=>{
				try {
					const now=new Date();
					var [invitationSender, oldUser]=await Promise.all([
						db.users.findOne({_id:ObjectId(bywhom)}, {projection:{name:1, phone:1}}),
						db.users.findOne({phone:res.id}, {projection:{_id:1}})
					]);
					if (!invitationSender) throw 'No such user';
					if (oldUser) throw 'You have already signed up';
					var {phone, name}=invitationSender;
					var {value:dbuser}=await db.invited.findOneAndUpdate({phone:res.id}, {$setOnInsert:{ip:socket.remoteAddress, time:now, invitedBy:phone}} ,{upsert:true, w:1});
					if (dbuser) throw ('You has been invited by '+name+' already');
					cb();
				}catch(e) {
					cb(e);
				}
			})
		})
		.on('gooer_invited', async (id_token, bywhom, cb)=>{
			try {
				const ticket = await gooclient.verifyIdToken({
					idToken: id_token,
					audience: '647198173064-h0m8nattj0pif2m1401terkbv9vmqnta.apps.googleusercontent.com',
				});
				const payload = ticket.getPayload();
				const userid = payload['sub'];
				const now=new Date();
				var [invitationSender, oldUser]=await Promise.all([
					db.users.findOne({_id:ObjectId(bywhom)}, {projection:{name:1, phone:1}}),
					db.users.findOne({phone:userid}, {projection:{_id:1}})
				]);
				if (!invitationSender) throw 'No such user';
				if (oldUser) throw 'You have already signed up';
				var {phone, name}=invitationSender;
				var {value:dbuser}=await db.invited.findOneAndUpdate({phone:userid}, {$setOnInsert:{ip:socket.remoteAddress, time:now, invitedBy:phone}} ,{upsert:true, w:1});
				if (dbuser) throw ('You has been invited by '+name+' already');
				cb();
			}	catch(e) {
				cb(e);
			}
		})
		.on('invitee/list', async (cb)=>{
			if (!socket.user) return cb('Please login first');
			cb(
				null, 
				await db.invitationLogs.aggregate([
					{$match:{inviter:socket.user.phone}},
					{$group:{_id:'$invitee', amount:{$sum:'$amount'}, reward:{$sum:'$reward'}, joined:{$sum:1}}},
					{$lookup:{
						localField:'_id',
						from:'users',
						foreignField:'phone',
						as:'userData'
					}},
					{$project:{amount:1, reward:1, joined:1, 'userData.name':1}}
				]).toArray()
			);
		})
		.on('fb_login', (accessToken, partner, cb) =>{
			if (typeof partner=='function') {
				cb=partner;
				partner=null;
			}
			FB.api('me', { fields: ['id', 'name'], access_token: accessToken }, async (res)=>{
				const now=new Date();
				var {value:dbuser}=await db.users.findOneAndUpdate({phone:res.id}, {$set:{name:res.name, fb_id:res.id, lastTime:now, lastIP:socket.remoteAddress}, $setOnInsert:{regIP:socket.remoteAddress, regTime:now, partner}} ,{upsert:true, returnOriginal:false, w:1});

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
				if (dbuser.lastTime.getTime()==dbuser.regTime.getTime()) {
					var invited=await db.invited.findOne({phone:res.id}, {projection:{invitedBy:1}});
					if (invited) 
					// var {value:joinGame}=await db.invitationLogs.findOneAndUpdate({inviter:invited.invitedBy, invitee:res.id, action:'Joined Game'}, {$setOnInsert:{time:now}}, {upsert:true, w:1});
					// if (joinGame) {
						invitation.emit('onJoined', {inviter:invited.invitedBy, invitee:res.id});
					// }
				}
			});
		})
		.on('google_login', async (id_token, partner, cb)=>{
			if (typeof partner=='function') {
				cb=partner;
				partner=null;
			}
			try {
				const ticket = await gooclient.verifyIdToken({
					idToken: id_token,
					audience: '647198173064-h0m8nattj0pif2m1401terkbv9vmqnta.apps.googleusercontent.com',
				});
				const payload = ticket.getPayload();
				const userid = payload['sub'], name=payload.name, icon=payload.picture;
				const now=new Date();
				var {value:dbuser}=await db.users.findOneAndUpdate({phone:userid}, {$set:{name:name, goo_id:userid, lastTime:now, lastIP:socket.remoteAddress}, $setOnInsert:{regIP:socket.remoteAddress, regTime:now, partner}} ,{upsert:true, returnOriginal:false, w:1});
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

				if (dbuser.lastTime.getTime()==dbuser.regTime.getTime()) {
					var invited=await db.invited.findOne({phone:userid}, {projection:{invitedBy:1}});
					if (invited) 
						// var {value:joinGame}=await db.invitationLogs.findOneAndUpdate({invitedBy:invited.invitedBy, phone:userid, action:'Joined Game'}, {$setOnInsert:{time:now}}, {upsert:true, w:1});
						// if (joinGame) {
							invitation.emit('onJoined', {inviter:invited.invitedBy, invitee:userid});
						// }
				}
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
		.on('recharge', async (amount, unused, cb)=>{
			amount=Number(amount);
			if (amount<=0) return cb('Illegal operation');
			if (!socket.user) {
				cb('Can not top up before login');
				return console.error('recharge before login');
			}
			try {
				var dbuser=await db.users.findOne({phone:socket.user.phone});
				if (!dbuser) cb('no such user');
				var {insertedId}=await db.bills.insertOne({phone:socket.user.phone, snapshot:{balance:dbuser.balance}, money:amount, time:new Date(), lastTime:new Date(), partner:defaultPartner(dbuser.parnter), used:false}, {w:'majority'});
				var orderid=insertedId.toHexString();
				await fetch('http://api.talkinggame.com/api/charge/C860613B522848BAA7F561944C23CFFD', {
					method:'post',
					body:await gzip(JSON.stringify([{msgID:orderid, status:'request', OS:'h5', accountID:socket.user.phone, orderID:orderid, currencyAmount:amount, currencyType:'IDR', virtualCurrencyAmount:amount, partner:defaultPartner(dbuser.parnter)}])),
					headers: { 'Content-Type': 'application/json' },
				});
				var url=await createOrder(orderid, socket.user, defaultPartner(dbuser.parnter), amount, req);
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
			var id=new ObjectId();
			var {amount:money, ...bankinfo}=withdrawOrder;
			var fee=Math.floor(money*settings.withdrawPercent*100)/100+settings.withdrawFixed;
			var phone=socket.user.phone;
			if (fee>money) return cb('not enough money');

			// check recharge history
			var check_total_recharge_exceed_50k=await db.users.findOne({phone}, {projection:{total_recharge_exceed_50k:1}});
			if (!check_total_recharge_exceed_50k) return cb('no such user');
			if (!check_total_recharge_exceed_50k.total_recharge_exceed_50k) {
				var r=await db.bills.aggregate([
					{$match:{phone, used:true}},
					{$group:{
						_id:phone,
						total_recharge:{$sum:'$money'}
					}}
				]).toArray();
				if (!r || r.length==0) return cb('Must recharge more than IDR 50k before cash withdrawal');
				if (!r[0].total_recharge || r[0].total_recharge<50000) return cb('Must recharge more than IDR 50k before cash withdrawal');
				db.users.updateOne({phone}, {$set:{total_recharge_exceed_50k:true}});
			}

			const session=db.mongoClient.startSession(),
			opt={
				readPreference: 'secondaryPreferred',
				readConcern: { level: 'majority' },
				writeConcern: { w: 'majority' }
			};
			try {
				await session.withTransaction(async()=>{
					var {value:dbuser}=await db.users.findOneAndUpdate({phone}, {$set:{bankinfo, lock:{op:'withdraw', pseudoRandom:new ObjectId()}}}, {session});
					if (!dbuser) throw('no such user');
	
					// var {value}=await db.users.findOneAndUpdate({phone:socket.user.phone, balance:{$gte:withdrawOrder.amount}}, {$inc:{balance:-withdrawOrder.amount}, $set:{bankinfo}});
					dbuser=dedecimal(dbuser);
					if (dbuser.balance<money) throw 'not enough balance';
	
					withdrawOrder.amount-=fee;
					await checkWithdrawOrder(id.toHexString(), withdrawOrder, defaultPartner(dbuser.parnter));
					var refuse=await approvalWithdraw(socket.user, withdrawOrder, settings, db), tradeno;
					if (!refuse) {
						tradeno=await createIdrWithdraw(id.toHexString(), withdrawOrder, defaultPartner(dbuser.parnter), req)
					}
					await db.users.updateOne({phone}, {$inc:{balance:-money}}, {session});
					var withdraw={_id:id, time:new Date(), phone:socket.user.phone, tradeno, snapshot:{balance:dbuser.balance, ...withdrawOrder, amount:money, fee, partner:defaultPartner(dbuser.parnter)}};
					await db.withdraw.insertOne(withdraw, {session});
					socket.emit('incbalance', -money);
					cb();
				}, opt);
			}
			catch(e) {
				// db.users.updateOne({phone:socket.user.phone}, {$set:{locked:false}});
				debugout(e);
				return cb(e)
			}
			finally {
				session.endSession();
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
		.on('getfeerate', (cb)=>{
			cb(null, settings.feeRate);
		})
		.on('getshareurl', (cb)=>{

		})
		// admin tools
		.on('getsettings', (cb)=>{
			if (!socket.user || !socket.user.isAdmin) return cb('access denied');
			cb(null, {...settings, online:onlineUsers.length>0?(onlineUsers.length-1):0})
		})
		.on('setsettings', async (values, cb)=>{
			if (!socket.user || !socket.user.isAdmin) return cb('access denied');
			if (values.whatsup!=null && values.whatsup!=settings.whatsup) {
				onlineUsers.broadcast('statechanged', {user:{whatsup:values.whatsup}});
			}
			Object.assign(settings, values);
			try {
				var {temp_result, ...stored} =settings;
				await db.settings.updateOne({_id:'server'}, {$set:stored}, {upsert:true});
				db.adminlog.insertOne({op:'setsettings', admin:socket.user.phone, value:settings, time:new Date()});
				chgSettings(settings.luckyshopee);
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
			var {value}=await db.users.findOneAndUpdate({phone:phone}, {$inc:decimalfy({balance:delta})});
			if (!value) return cb('没有这个用户');
			db.adminlog.insertOne({op:'modifybalance', admin:socket.user.phone, target:value, change:delta, time:new Date()});
			value=dedecimal(value);
			if (delta>0) {
				if (value.bet>=value.recharge) {
					//重置下注金额
					db.users.updateOne({phone:phone}, {$set:{recharge:delta, bet:0}});
				} else {
					//累积下注
					db.users.updateOne({phone:phone}, {$inc:{recharge:delta}});
				}
			}

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
		.on('$fund', async(cb)=>{
			if (!socket.user || !socket.user.isAdmin) return cb('access denied');
			try {
				cb(null, await checkFund());
			} catch(e) {
				debugout('check fund err', e);
				cb(e);
			}
		})
		.on('$approval_order', async (orderid, cb)=>{
			if (!socket.user || !socket.user.isAdmin) return cb('access denied');
			const session=db.mongoClient.startSession(),
			opt={
				readPreference: 'secondaryPreferred',
				readConcern: { level: 'majority' },
				writeConcern: {w:'majority'}
				// writeConcern:{w:1}
			};
			try {
				await session.withTransaction(async()=>{
					var {value:order}=await db.withdraw.findOneAndUpdate({_id:ObjectId(orderid)}, {$set:{lock:{op:'approval', pseudoRandom:new ObjectId()}}}, {session});
					if (!order) throw ('没有这个订单');
					if (order.tradeno ||order.result) throw ('订单已经提交过了'); 
					var {fee, partner, ...withdraw}=order.snapshot;
					withdraw.amount-=fee;
					var tradeno=await createIdrWithdraw(orderid, withdraw, partner, req);
					db.withdraw.updateOne({_id:ObjectId(orderid)}, {$set:{tradeno}}, {session});
					// notify consumptionEvent
					
				}, opt)		
				cb();
			} catch(e) {
				debugout('approval err', e);
				cb(e)
			}
			finally {
				session.endSession();
			}
		})
		.on('$refund', async (orderid, cb)=>{
			if (!socket.user || !socket.user.isAdmin) return cb('access denied');
			try {
				var {value:order}=await db.withdraw.findOneAndUpdate({_id:ObjectId(orderid), tradeno:null}, {$set:{tradeno:'refund'}});
				if (!order) return cb('订单不存在或者已经不能退款');
				await db.users.updateOne({phone:order.phone}, {$inc:{balance:order.snapshot.amount}}, {w:1});
				var u=onlineUsers.get(order.phone);
				if (u) {
					u.socket.emit('incbalance', order.snapshot.amount);
					u.socket.emit('notify', `Permintaan WD anda tidak berhasil, ${order.snapshot.amount} sudah kembali ke akun balance Anda`)
				} else {
					db.notifies.insertOne({phone:order.phone, msg:`Permintaan WD anda tidak berhasil, ${order.snapshot.amount} sudah kembali ke akun balance Anda`, read:false});
				}
				cb();
			} catch(e) {
				debugout('refund err', e);
				cb(e)				
			}
		})
		.on('$list', async(op, cb)=>{
			if (!socket.user || !socket.user.isAdmin) return cb('access denied');
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
			try {
				if (dataProviders[op.target]) {
					var listfn=objPath.get(dataProviders, [op.target, 'list']);
					if (listfn) cb(null, await listfn(op));
					else throw ('not supported');
				}
				else {
					var cur=db[op.target].find(op.query);
					if (op.sort) {
						if (op.order=="ASC" || op.order=='asc') 
							cur.sort({[op.sort]:1});
						else cur.sort({[op.sort]:-1});
					}
					if (isValidNumber(op.offset)) cur.skip(Number(op.offset));
					if (isValidNumber(op.limit)) cur.limit(Number(op.limit));
					var [rows, total]=await Promise.all([cur.toArray(), cur.count()]);
					// var rows=await cur.toArray();
					dedecimal(rows);
					cb(null, rows, total);
				}
			}catch(e) {cb(e)}
		})
		.on('$del', async(op, cb)=>{
			if (!socket.user || !socket.user.isAdmin) return cb('access denied');
			try {
				if (dataProviders[op.target]) {
					var delfn=objPath.get(dataProviders, [op.target, 'del']);
					if (delfn) await delfn(op);
					else throw ('not supported')
				}
				else await db[op.target].remove(op.query);
				cb();
			}catch(e) {cb(e)}
		})
		.on('$upd', async(op, cb)=>{
			if (!socket.user || !socket.user.isAdmin) return cb('access denied');
			try {
				if (op.content.pwd) {
					var salt=rndstring(16);
					var pwd=md5(''+salt+op.content.pwd);
					op.content.salt=salt;
					op.content.pwd=pwd;
				}
				if (dataProviders[op.target]) {
					var updatefn=objPath.get(dataProviders, [op.target, 'update']);
					if (updatefn) await updatefn(op);
					else throw ('not supported')
				}
				else await db[op.target].updateMany(op.query, {$set:op.content});
				cb();
			}catch(e) {cb(e)}
		})
		.on('$create', async(op, cb)=>{
			if (!socket.user || !socket.user.isAdmin) return cb('access denied');
			try {
				if (!op.content.phone) return cb('phone must be specified');
				if (!op.content.pwd) return cb('pwd must be specified');
				var salt=rndstring(16);
				var pwd=md5(''+salt+op.content.pwd);
				if (dataProviders[op.target]) {
					var createfn=objPath.get(dataProviders, [op.target, 'create']);
					if (createfn) await createfn(op);
					else throw ('not supported')
				}
				else await db[op.target].insertOne({...op.content, salt, pwd, regTime:new Date(), regIP:socket.remoteAddress, lastIP:socket.remoteAddress});
				cb();
			}catch(e) {cb(e)}
		})
		.on('kick', async(phone, cb)=>{
			if (!socket.user || !socket.user.isAdmin) return cb('access denied');
			try {
				var user=onlineUsers.get(phone);
				if (!user) return cb('no such user');
				user.socket.emit('kicked', 'The administrator kicked you out of the game');
				user.socket.disconnect();
				onlineUsers.remove(user);
				db.adminlog.insertOne({op:'kickuser', admin:socket.user.phone, target:phone, time:new Date()});
				cb();
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