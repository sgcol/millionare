var easym=require('gy-easy-mongo')
  , argv =require('yargs')
	.demand('mongo')
	.describe('mongo', '--mongo=[mongodb://][usr:pwd@]ip[:port][,[usr:pwd@]ip[:port]]/db, 参考https://docs.mongodb.com/manual/reference/connection-string/')
	.argv;

var __stored_db=null;
module.exports=function (cb) {
	if (__stored_db) return cb(null, __stored_db, easym);
	else new easym.DbProvider().init(argv.mongo, {exists:[
		{users:{index:['phone', 'money', 'isAdmin']}},
		{bills:{index:[{phone:1, used:1}, 'user', 'phone', 'time']}},
		{withdraw:{index:['phone', 'time', 'withdraw_result', 'tradeno']}}, 
		{servers:{index:['order']}},
		{games:{index:['user', 'time'], capped:true, size:100*1024*1024, max:1000000}},
		{adminlog:{index:['time', 'operatorName'], capped:true, size:100*1024*1024, max:1000000}},
        'settings',
		'contracts',
		{notifies:{index:['phone', 'read'], capped:true, size:100*1024*1024, max:1000000}},
		{invited:{index:['phone']}},
		{invitationLogs:{index:[{inviter:1, invitee:1}]}},
		]}, function(err, db) {
		if (err) return cb(err);
		__stored_db=db;
		cb(null, db, easym);
	});
}

