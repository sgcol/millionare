const {dedecimal} =require('./etc')

const onlineUsers=module.exports=(function() {
	var _online=new Map();
	var o={
		add:function(user) {
			var u=_online.get(user.phone);
			if (u) {
				user.copyfrom(u);
				u.socket.emit('kicked', 'Account has logined from another place');
				u.socket.disconnect(true);
			}
			else {
				_online.set(user.phone, user);
				var {dbuser}=user, {salt, ...rest}=dbuser;
				this.broadcast('userin', dedecimal(rest));
			}
		},
		remove:function(user) {
			var ret= _online.delete(user.phone);
			if (ret) this.broadcast('userout', user.phone);
			return ret;
		},
		get:function(phone) {
			return _online.get(phone);
		},
		broadcast(cmd, content, except) {
			_online.forEach((u, phone)=>{
				if (phone==except) return;
				u.socket.emit(cmd, content);
			})
		},
		forEach(fn) {
			_online.forEach(fn);
		},
		_data() {
			return _online;
		}
	};
	Object.defineProperties(o, {
		length:{
			get:function() {
				return _online.size;
			}
		},
		all:{
			get:function() {
				return Array.from(_online.keys());
			}
		}
	});
	return o;
})();
