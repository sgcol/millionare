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
	, Decimal128=require('mongodb').Decimal128
	, rndstring=require('randomstring').generate
	, {sendSms} =require('./luckyshopee.js')
	, argv=require('yargs')
		.default('port', 7008)
		.argv
	, debugout =require('debugout')(argv.debugout)

require('colors');

app.use(express.static(path.join(__dirname, 'app/dist'), {maxAge:7*24*3600*1000, index: 'index.html' }));


server.on('request', app);
server.listen(argv.port, function () { console.log(`Listening on ${server.address().port}`.green) });

const default_user={balance:0};

dec2num=function(dec) {
	if (dec==null) return null;
	if (dec._bsontype && dec._bsontype=='Decimal128') return Number(dec.toString());
	return dec;
}

function dedecimal(obj) {
	for (var k in obj) {
		if (!obj[k] || typeof obj[k]!='object') continue;
		if (obj[k]._bsontype && obj[k]._bsontype=='Decimal128') obj[k]=Number(obj[k].toString());
		else dedecimal(obj[k]);
	}
	return obj;
}

function decimalfy(o) {
	for (var k in o) {
		if (typeof o[k]=='number') o[k]=Decimal128.fromString(''+o[k]);
		if (typeof o[k]=='object') {
			if (o[k]._bsontype) continue;
			decimalfy(o[k]);
		}
	}
	return o;
}

var ID = function () {
  // Math.random should be unique because of its seeding algorithm.
  // Convert it to base 36 (numbers + letters), and grab the first 9 characters
  // after the decimal.
  return '_' + Math.random().toString(36).substr(2, 9);
};

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
				u.socket.emit('kicked', 'Account has logined from other place');
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

function Game(feeRate, db) {
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
					var win=this.dealResult(c, r);
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
	}
	copyfrom(other) {
		this.dbuser=other.dbuser;
		this.phone=other.phone;
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
	var settings= await db.settings.findOne();
	const game=Game(settings?(settings.feeRate||0.02):0.02, db);
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
			if (dbuser.block>new Date()) return cb('Account has been banned');
			
			var oldUser=onlineUsers.get(pack.phone)
			if (oldUser) {
				debugout('already online, kick old');
				socket.user=oldUser;
				oldUser.socket.emit('kicked', 'Account has logined at other place');
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
			var content={user:dedecimal({_id:dbuser._id, balance:dbuser.balance}), ...game.snapshot(pack.phone)};
			socket.emit('statechanged', content);
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
			var dbuser={phone:pack.phone, pwd:pwd, salt:salt, balance:100000, regIP:socket.remoteAddress, lastIP:socket.remoteAddress, regTime:new Date(), lastTime:new Date()};
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
		.on('betting', async (pack, cb)=>{
			if (!socket.user) return cb('can not do that');
			await game.bet(socket.user, pack.select, pack.money, cb);
		})
		.on('beforereg', (phone)=>{
			var c=captchas[phone];
			if (!c) c=captchas[phone]={phone:phone, captcha:Math.floor(Math.random()*1000).pad(4), time:new Date()};
			else {
				c.captcha=Math.floor(Math.random()*1000).pad(4);
				c.time=new Date()
			};

			sendSms(phone, req.agent, socket.remoteAddress, c.captcha);
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
				cb(null, {jumpto:'./demo.html'});
			} catch(e) {return cb(e)}
		})
		.on('error', console.error)
		.on('disconnect', function() {
			if (socket.user) {
				debugout('userout'.red, socket.user.phone);
				onlineUsers.remove(socket.user);
			}
		})
	})
})

