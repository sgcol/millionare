const onlineUsers=module.exports=(function() {
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
