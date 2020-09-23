var server = require('http').createServer()
	, url = require('url')
	, path = require('path')
	// , WebSocketServer = require('ws').Server
	// , wss = new WebSocketServer({ server: server })
	, io =require('socket.io')(server)
	, express = require('express')
	, app = express()
	// , compression = require('compression')
	// , bodyParser = require('body-parser')
	, qs = require('querystring')
	, md5=require('md5')
	, getDB=require('./db.js')
	, ObjectId =require('mongodb').ObjectId
	, {dedecimal, decimalfy, ID} =require('./etc.js')
	, rndstring=require('randomstring').generate
	, {sendSms, createOrder, createWithdraw} =require('./luckyshopee.js')
	, argv=require('yargs')
		.default('port', 7008)
		.argv
	, debugout =require('debugout')(argv.debugout)
	, {FB, FacebookApiException} = require('fb')

require('colors');

var {router}=require('./luckyshopee');

app.use(express.static(path.join(__dirname, 'app/dist'), {maxAge:7*24*3600*1000, index: 'index.html' }));
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

const onlineUsers=(function() {
	var _online={}, _online_userkeys=null, _dirty=true;
	var o={
		add:function(user) {
			var u=_online[user.phone];
			if (u) {
				user.copyfrom(u);
				u.socket.emit('kicked', 'Account has logined from another place');
				u.socket.disconnect(true);
			}
			_online[user.phone]=user;
			_dirty=true;
		},
		remove:function(user) {
			if (_online[user.phone]==user) {
				delete _online[user.phone];
				_dirty=true;
			}
		},
		get:function(phone) {
			return _online[phone];
		}
	};
	Object.defineProperties(o, {
		length:{
			get:function() {
				if (!_dirty) return _online_userkeys.length;
				_online_userkeys=Object.keys(_online);
				_dirty=false;
				return _online_userkeys.length; 
			}
		},
		all:{
			get:function() {
				if (!_dirty) return _online_userkeys;
				_online_userkeys=Object.keys(_online);
				_dirty=false;
				return _online_userkeys; 
			}
		}
	});
	return o;
})();

function Game(settings, db) {
	var feeRate=settings.feeRate, withdrawFee=settings.withdrawFee;
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
			countdown=60/*2.5*60*/;
			status='running';
			endtime=starttime+2.5*60*1000;
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
				dbop.push({updateOne:{filter:{phone:u}, update:{$inc:decimalfy({balance:userwins[u].balance})}}});
				var onlineu=onlineUsers.get(u);
				if (onlineu) onlineu.socket.emit('incbalance', userwins[u].balance);
			}
			if (dbop.length) db.users.bulkWrite(dbop);
			setTimeout(this.start.bind(this), 2*1000);
		},
		async bet(user, select, money, cb) {
			if (status!='running') return cb('Betting is not allowed at this time');
			try {
				var {value}=await db.users.findOneAndUpdate({phone:user.phone, locked:{$ne:true}}, {$set:{locked:true}}, {w:'majority'});
			} catch(e) {
				return cb(e);
			}
			var dbuser=dedecimal(value);
			if (!dbuser) return cb('can not manipulate user data right now');
			if (dbuser.balance<money) return cb('no enough balance');
			await db.users.updateOne({phone:user.phone}, {$set:decimalfy({locked:false, balance:dbuser.balance-money})}, {w:'majority'});
			var fee=Math.floor(money*feeRate*100)/100;
			var contract={_id:new ObjectId(), time:new Date(), user:user.phone, money:money-fee, fee:fee, betting:money, select:select, game:{status, period, starttime, endtime, setno}};
			db.contracts.insertOne(contract);
			contracts.push(contract);

			cb(null, 
			{
				select:contract.select, fee:contract.fee, betting:money,
				time:contract.time, game:{period:contract.game.period, endtime:contract.game.endtime}
			});
		}
	}
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
	settings.feeRate=settings.feeRate||0.02
	var withdrawFee=settings.withdrawFee=settings.withdrawFee||0.05;
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
			if (!pack.t && pack.pwd!=dbuser.pwd) return cb('Incorrect password');
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
			var content={user:dedecimal({_id:dbuser._id, balance:dbuser.balance, paytm_id:dbuser.paytm_id}), ...game.snapshot(pack.phone)};
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
			socket.emit('statechanged', {user:dedecimal({_id:dbuser._id, balance:dbuser.balance}), ...game.snapshot(pack.phone)});
		})
		.on('fb_login', (accessToken, cb) =>{
			FB.api('me', { fields: ['id', 'name', 'icon'], access_token: accessToken }, res=>{
				console.log(res);
				cb(null);
			});
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
		.on('recharge', async (amount, cb)=>{
			if (!socket.user) {
				cb('Can not top up before login');
				return console.error('recharge before login');
			}
			try {
				var dbuser=await db.users.findOne({phone:socket.user.phone});
				if (!dbuser) cb('no such user');
				var {insertedId}=await db.bills.insertOne({phone:socket.user.phone, snapshot:{balance:dbuser.balance}, money:amount, time:new Date(), status:'created'}, {w:'majority'});
				var url=await createOrder(insertedId.toHexString(), amount, req);
				cb(null, {jumpto:url});
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
			if (socket.user==null) {
				cb('Can not withdraw before login');
				return console.error('withdraw before login');	
			}
			try {
				var {value}=await db.users.findOneAndUpdate({phone:socket.user.phone, locked:{$ne:true}, balance:{$gte:money}}, {$set:{locked:true}}, {w:'majority'});
				var dbuser=dedecimal(value);
				if (!dbuser) return cb('can not manipulate user data right now');
				var fee=Math.floor(money*withdrawFee*100)/100;
				var id=new ObjectId();
				var tradeno=await createWithdraw(id.toHexString(), money-fee, dbuser.paytm_id, req);
				await db.users.updateOne({phone:socket.user.phone}, {$set:{locked:false}, $inc:{balance:-money}});
				var withdraw={_id:id, time:new Date(), phone:socket.user.phone, money:money, fee:fee, snapshot:{balance:dbuser.balance}, luckyshopee_tradeno:tradeno};
				db.withdraw.insertOne(withdraw);
				socket.emit('statechanged', {user:{balance:dbuser.balance-money}});
				cb();
			} catch(e) {return cb(e)}
		})
		// admin tools
		.on('getsettings', (cb)=>{
			if (!socket.user || !socket.user.isAdmin) return cb('access denied');
			cb(null, {...settings, online:onlineUsers.length>0?(onlineUsers.length-1):0})
		})
		.on('setsettings', async (values, cb)=>{
			if (!socket.user || !socket.user.isAdmin) return cb('access denied');
			Object.assign(settings, values);
			try {
			await db.settings.updateOne({_id:'server'}, {$set:settings}, {upsert:true});
			db.adminlog.insertOne({op:'setsettings', admin:socket.user.phone, value:settings, time:new Date()});
			} catch(e) {return cb(e)}
			cb();
		})
		.on('queryuser', async (phone, cb)=>{
			try {
				if (!socket.user || !socket.user.isAdmin) return cb('access denied');
				var ud=await db.users.findOne({phone});
				ud=dedecimal(ud);
				db.adminlog.insert({op:'queryuser', admin:socket.user.phone, target:{phone, ...ud}, time:new Date()});
				if (!ud) return cb('找不到用户');
				cb(null, {phone:ud.phone, balance:ud.balance, paytm_id:ud.paytm_id, block:ud.block});
			}catch(e) {return cb(e)}
		})
		.on('modifybalance', async(phone, delta, cb)=>{
			if (!socket.user || !socket.user.isAdmin) return cb('access denied');
			delta=Number(delta);
			var {value}=await db.users.findOneAndUpdate({phone:phone}, {$inc:{balance:delta}});
			if (!value) return cb('没有这个用户');
			db.adminlog.insertOne({op:'modifybalance', admin:socket.user.phone, target:value, change:delta, time:new Date()});
			value=dedecimal(value);
			var ud=onlineUsers.get(phone);
			if (ud) {
				var newbalance=value.balance+delta;
				ud.socket.emit('statechanged', {user:{balance:newbalance}});
			}
			cb(null, {balance:value.balance+delta});
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

