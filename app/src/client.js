import Vue from 'vue'
import url from 'url'
import path from 'path'
// import {parseDomain} from 'parse-domain'
import io from 'socket.io-client'

// import signup from './components/signup.vue'

export const docCookies = {
  getItem: function (sKey) {
		// eslint-disable-next-line
	return decodeURIComponent(document.cookie.replace(new RegExp("(?:(?:^|.*;)\\s*" + encodeURIComponent(sKey).replace(/[-.+*]/g, "\\$&") + "\\s*\\=\\s*([^;]*).*$)|^.*$"), "$1")) || null;
  },
  setItem: function (sKey, sValue, vEnd, sPath, sDomain, bSecure) {
		// eslint-disable-next-line
		if (!sKey || /^(?:expires|max\-age|path|domain|secure)$/i.test(sKey)) { return false; }
		var sExpires = "";
		if (vEnd) {
			switch (vEnd.constructor) {
			case Number:
				sExpires = vEnd === Infinity ? "; expires=Fri, 31 Dec 9999 23:59:59 GMT" : "; max-age=" + vEnd;
				break;
			case String:
				sExpires = "; expires=" + vEnd;
				break;
			case Date:
				sExpires = "; expires=" + vEnd.toUTCString();
				break;
			}
		}
		document.cookie = encodeURIComponent(sKey) + "=" + encodeURIComponent(sValue) + sExpires + (sDomain ? "; domain=" + sDomain : "") + (sPath ? "; path=" + sPath : "") + (bSecure ? "; secure" : "");
		return true;
  },
  removeItem: function (sKey, sPath, sDomain) {
		if (!sKey || !this.hasItem(sKey)) { return false; }
		document.cookie = encodeURIComponent(sKey) + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT" + ( sDomain ? "; domain=" + sDomain : "") + ( sPath ? "; path=" + sPath : "");
		return true;
  },
  hasItem: function (sKey) {
		return (new RegExp("(?:^|;\\s*)" + encodeURIComponent(sKey).replace(/[-.+*]/g, "\\$&") + "\\s*\\=")).test(document.cookie);
  },
  keys: /* optional method: you can safely remove it! */ function () {
		// eslint-disable-next-line
		var aKeys = document.cookie.replace(/((?:^|\s*;)[^\=]+)(?=;|$)|^\s*|\s*(?:\=[^;]*)?(?:\1|$)/g, "").split(/\s*(?:\=[^;]*)?;\s*/);
		for (var nIdx = 0; nIdx < aKeys.length; nIdx++) { aKeys[nIdx] = decodeURIComponent(aKeys[nIdx]); }
		return aKeys;
  }
};

var socket;
export const eventBus=new Vue();

export function openLink(next) {
	if (!socket) {
		var url_option=url.parse(location.href, true), startup_param=/*startup_param?merge(url_option.query,startup_param):*/url_option.query;
		startup_param.server=startup_param.server||window.server;
		if (startup_param.server) {
			if (startup_param.server.indexOf('http')<0) {
				startup_param.server='http://'+startup_param.server;
			}
			var spec=url.parse(startup_param.server);
			url_option.host=spec.host;
			url_option.pathname=spec.pathname;
			url_option.protocol=spec.protocol;
			url_option.port=spec.port;
		}
		var host = url_option.host;
		// var di=parseDomain(host);
		// if (di && !di.errors && di.subdomain.indexOf('ws')!=0) {
		// 	var sds=di.subdomain.split('.');
		// 	sds[0]='ws';
		// 	host=sds.join('.')+'.'+di.domain+'.'+di.tld+(url_option.port?(':'+url_option.port):'');
		// }
		if (/\.[^/\\]+$/.test(url_option.pathname)) {
			url_option._p=path.dirname(url_option.pathname);
		}
		else url_option._p=url_option.pathname;
		var serverpath=host+url_option._p;
		if (path.extname(url_option.pathname)=='.app') {
			serverpath+='/'+path.basename(url_option.pathname);
		}

		socket =window.socket= io(serverpath, {reconnectionAttempts: 3,transports:['websocket']});
		socket.on('statechanged', (msg)=>{
			var state=window.v.$store.state;
			if (msg.user) {
				var  u=msg.user;
				if (u._id) state.me._id=u._id;
				if (u.balance) state.me.balance=u.balance;
				if (u.paytm_id) state.me.paytm_id=u.paytm_id;
			}
			if (msg.history) state.history=msg.history;
			if (msg.orders) state.orders=msg.orders;
			if (msg.countdown) state.countdown=msg.countdown;
			if (msg.period) state.period=msg.period;
			if (msg.status) state.status=msg.status;
		});
		socket.on('gameresult', (data)=>{
			var state=window.v.$store.state;
			state.history.push(data.history);
			if (state.history.length>50) state.history.splice(0, 40);
			if (data.status) state.status=status;
			for (var i=state.orders.length-1; i>=0; i--) {
				var c=state.orders[i];
				if (c.game.period!=data.history.period) break;
				var x=c;
				x.game.price=data.history.price;
				state.orders.splice(i, 1, x);
			}
		});
		socket.on('incbalance', (delta)=>{
			var state=window.v.$store.state;
			state.me.balance+=delta;
		});
		socket.on('orderchanged', (order)=>{
			var state=window.v.$store.state;
			var idx=state.orders.find((o)=>o.id==order.id);
			state.orders[idx]=order;
		});
		socket.on('connect', ()=>{
			// relogin	
			eventBus.$emit('connect', socket);
		})
		.on('error', console.error.bind(console, 'err'))
		.on('connect_error', ()=>{
			eventBus.$emit('relogin');
		})
		.on('connect_timeout', ()=>{
			eventBus.$emit('relogin');
		})
		.on('disconnect', ()=>{
			eventBus.$emit('relogin');
		})
	}else {
		if (socket.disconnected) socket.connect();
	}

	if (typeof next=='function') next(socket);
	return socket;
}
