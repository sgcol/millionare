// import {router} from './router'
import {openLink, eventBus} from '../client'

function stdret(cb) {
	return function(err) {
		if (err && err=='access denied') {
			// delete localStorage.admin_logged;
			// router.push('/login');
			cb('登录已失效，请重登');
			eventBus.$emit('relogin')
		}
		else cb.apply(null, arguments);
	}
}
var _sock=openLink();
var mySock=new Proxy(_sock, {
	get(target, n) {
		if (n=='emit') return function(...args) {
			if (typeof args[args.length-1]==='function') {
				var cb=args.pop();
				args.push(stdret(cb));
			}
			_sock.emit.apply(_sock, args);
		}
		var v=_sock[n];
		if (typeof v==='function') return function(...args) {
			return v.apply(_sock, args);
		}
		return v;
	}
})
export default {
	loggedIn() {
		return mySock.isLogined;
	},
	logout() {
		localStorage.adminAccount=undefined;
		localStorage.adminToken=undefined;
		mySock.isLogined=undefined;
	},
	stdret
}

function _openLink(cb) {
	if (typeof cb==='function') return cb(mySock);
	return mySock;
}

export {_openLink as openLink};
