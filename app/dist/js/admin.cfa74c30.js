(function(e){function t(t){for(var r,s,i=t[0],u=t[1],c=t[2],p=0,d=[];p<i.length;p++)s=i[p],Object.prototype.hasOwnProperty.call(a,s)&&a[s]&&d.push(a[s][0]),a[s]=0;for(r in u)Object.prototype.hasOwnProperty.call(u,r)&&(e[r]=u[r]);l&&l(t);while(d.length)d.shift()();return o.push.apply(o,c||[]),n()}function n(){for(var e,t=0;t<o.length;t++){for(var n=o[t],r=!0,i=1;i<n.length;i++){var u=n[i];0!==a[u]&&(r=!1)}r&&(o.splice(t--,1),e=s(s.s=n[0]))}return e}var r={},a={admin:0},o=[];function s(t){if(r[t])return r[t].exports;var n=r[t]={i:t,l:!1,exports:{}};return e[t].call(n.exports,n,n.exports,s),n.l=!0,n.exports}s.m=e,s.c=r,s.d=function(e,t,n){s.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:n})},s.r=function(e){"undefined"!==typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},s.t=function(e,t){if(1&t&&(e=s(e)),8&t)return e;if(4&t&&"object"===typeof e&&e&&e.__esModule)return e;var n=Object.create(null);if(s.r(n),Object.defineProperty(n,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var r in e)s.d(n,r,function(t){return e[t]}.bind(null,r));return n},s.n=function(e){var t=e&&e.__esModule?function(){return e["default"]}:function(){return e};return s.d(t,"a",t),t},s.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},s.p="/";var i=window["webpackJsonp"]=window["webpackJsonp"]||[],u=i.push.bind(i);i.push=t,i=i.slice();for(var c=0;c<i.length;c++)t(i[c]);var l=u;o.push([2,"chunk-vendors"]),n()})({0:function(e,t){},"136a":function(e,t,n){"use strict";n("4160"),n("159b");var r=n("2909");function a(){window.TDGA&&(o.forEach((function(e){var t;(t=window.TDGA)[e.fn].apply(t,Object(r["a"])(e.args))})),o=null)}var o=[];t["a"]=new Proxy({},{get:function(e,t){return window.TDGA?(o&&a(),function(){var e;return(e=window.TDGA)[t].apply(e,arguments)}):function(){for(var e=arguments.length,n=new Array(e),r=0;r<e;r++)n[r]=arguments[r];o.push({fn:t,args:n})}}})},2:function(e,t,n){e.exports=n("9150")},"7ed9":function(e,t,n){"use strict";n.d(t,"a",(function(){return d})),n.d(t,"b",(function(){return f})),n.d(t,"c",(function(){return b}));n("7db0"),n("c975"),n("a434"),n("b0c0"),n("a9e3"),n("4d63"),n("ac1f"),n("25f0"),n("5319"),n("1276");var r,a=n("2b0e"),o=n("0b16"),s=n.n(o),i=n("df7c"),u=n.n(i),c=n("4bea"),l=n.n(c),p=n("136a"),d={getItem:function(e){return decodeURIComponent(document.cookie.replace(new RegExp("(?:(?:^|.*;)\\s*"+encodeURIComponent(e).replace(/[-.+*]/g,"\\$&")+"\\s*\\=\\s*([^;]*).*$)|^.*$"),"$1"))||null},setItem:function(e,t,n,r,a,o){if(!e||/^(?:expires|max\-age|path|domain|secure)$/i.test(e))return!1;var s="";if(n)switch(n.constructor){case Number:s=n===1/0?"; expires=Fri, 31 Dec 9999 23:59:59 GMT":"; max-age="+n;break;case String:s="; expires="+n;break;case Date:s="; expires="+n.toUTCString();break}return document.cookie=encodeURIComponent(e)+"="+encodeURIComponent(t)+s+(a?"; domain="+a:"")+(r?"; path="+r:"")+(o?"; secure":""),!0},removeItem:function(e,t,n){return!(!e||!this.hasItem(e))&&(document.cookie=encodeURIComponent(e)+"=; expires=Thu, 01 Jan 1970 00:00:00 GMT"+(n?"; domain="+n:"")+(t?"; path="+t:""),!0)},hasItem:function(e){return new RegExp("(?:^|;\\s*)"+encodeURIComponent(e).replace(/[-.+*]/g,"\\$&")+"\\s*\\=").test(document.cookie)},keys:function(){for(var e=document.cookie.replace(/((?:^|\s*;)[^\=]+)(?=;|$)|^\s*|\s*(?:\=[^;]*)?(?:\1|$)/g,"").split(/\s*(?:\=[^;]*)?;\s*/),t=0;t<e.length;t++)e[t]=decodeURIComponent(e[t]);return e}},f=new a["default"];function b(e){if(r)r.disconnected&&r.connect();else{var t=s.a.parse(location.href,!0),n=t.query;if(n.server=n.server||window.server,n.server){n.server.indexOf("http")<0&&(n.server="http://"+n.server);var a=s.a.parse(n.server);t.host=a.host,t.pathname=a.pathname,t.protocol=a.protocol,t.port=a.port}var o=t.host;/\.[^/\\]+$/.test(t.pathname)?t._p=u.a.dirname(t.pathname):t._p=t.pathname;var i=o+t._p;".app"==u.a.extname(t.pathname)&&(i+="/"+u.a.basename(t.pathname)),r=window.socket=l()(i,{reconnectionAttempts:3,transports:["websocket"]}),r.on("statechanged",(function(e){var t=window.v.$store.state;if(e.user){var n=e.user;for(var r in n)t.me[r]=n[r];p["a"].Account({accountId:t.me.phone,accountName:t.me.name,gender:-1})}e.history&&(t.history=e.history),e.orders&&(t.orders=e.orders),e.countdown&&(t.countdown=e.countdown),e.period&&(t.period=e.period),e.status&&(t.status=e.status)})),r.on("gameresult",(function(e){var t=window.v.$store.state;t.history.push(e.history),t.history.length>50&&t.history.splice(0,40),e.status&&(t.status=status);for(var n=t.orders.length-1;n>=0;n--){var r=t.orders[n];if(r.game.period!=e.history.period)break;var a=r;a.game.price=e.history.price,t.orders.splice(n,1,a);var o=h(a);o&&p["a"].onReward(o,"投注".concat(a.select,"获胜"))}})),r.on("incbalance",(function(e){var t=window.v.$store.state;t.me.balance+=e})),r.on("orderchanged",(function(e){var t=window.v.$store.state,n=t.orders.find((function(t){return t.id==e.id}));t.orders[n]=e})),r.on("connect",(function(){f.$emit("connect",r)})).on("error",console.error.bind(console,"err")).on("connect_error",(function(){f.$emit("relogin")})).on("connect_timeout",(function(){f.$emit("relogin")})).on("disconnect",(function(){f.$emit("relogin")}))}return"function"==typeof e&&e(r),r}function m(e){return e=String(e),Number(e.substr(e.length-1,1))}function h(e){var t,n=m(e.game.price);return"Green"==e.select&&n%2==1?(t=5==n?1.5*(e.betting-e.fee):2*(e.betting-e.fee),t):"Red"==e.select&&n%2==0?(t=0==n?1.5*(e.betting-e.fee):2*(e.betting-e.fee),t):"Violet"!=e.select||0!=n&&5!=n?e.select==n?(t=9*(e.betting-e.fee),t):0:(t=4.5*(e.betting-e.fee),t)}},9150:function(e,t,n){"use strict";n.r(t);n("e260"),n("e6cf"),n("cca6"),n("a79d");var r=n("2b0e"),a=n("8c4f"),o=n("2f62"),s=n("5f5b"),i=n("0759"),u=n("7386"),c=(n("f9e3"),n("2dd8"),function(){var e=this,t=e.$createElement,n=e._self._c||t;return n("div",[n("sys-menu"),n("router-view")],1)}),l=[],p=function(){var e=this,t=e.$createElement,n=e._self._c||t;return n("div",[n("b-navbar",{attrs:{toggleable:"lg",type:"dark",variant:"info",fixed:"top",sticky:""}},[n("b-navbar-brand",{attrs:{href:"#"}},[e._v("Admin")]),n("b-navbar-toggle",{attrs:{target:"nav-collapse"}}),n("b-collapse",{attrs:{id:"nav-collapse","is-nav":""}},[n("b-navbar-nav",{},[n("b-nav-item",{attrs:{to:"serverlet"}},[e._v("服务器设置")]),n("b-nav-item",{attrs:{to:"accounts"}},[e._v("管理员")]),n("b-nav-item",{attrs:{to:"userMoney"}},[e._v("用户管理")]),n("b-nav-item",{attrs:{to:"logout"}},[e._v("注销")])],1)],1)],1)],1)},d=[],f={name:"MENU"},b=f,m=n("2877"),h=Object(m["a"])(b,p,d,!1,null,null,null),v=h.exports,g={name:"Admin",components:{SysMenu:v}},_=g,w=Object(m["a"])(_,c,l,!1,null,null,null),y=w.exports,k=function(){var e=this,t=e.$createElement,n=e._self._c||t;return n("b-form",[n("b-tabs",[n("b-tab",{attrs:{title:"支付配置"}},[n("b",[e._v("必须配置以下参数，否则充值提现都是测试版本")]),n("p"),n("label",[e._v("下单接口")]),n("b-form-input",{model:{value:e.luckyshopee.pay_url,callback:function(t){e.$set(e.luckyshopee,"pay_url",t)},expression:"luckyshopee.pay_url"}}),n("label",[e._v("代付接口")]),n("b-form-input",{model:{value:e.luckyshopee.withdraw_url,callback:function(t){e.$set(e.luckyshopee,"withdraw_url",t)},expression:"luckyshopee.withdraw_url"}}),n("label",[e._v("短信接口")]),n("b-form-input",{model:{value:e.luckyshopee.sms_url,callback:function(t){e.$set(e.luckyshopee,"sms_url",t)},expression:"luckyshopee.sms_url"}}),n("label",[e._v("appId")]),n("b-form-input",{model:{value:e.luckyshopee.appId,callback:function(t){e.$set(e.luckyshopee,"appId",t)},expression:"luckyshopee.appId"}}),n("label",[e._v("appKey")]),n("b-form-input",{model:{value:e.luckyshopee.appKey,callback:function(t){e.$set(e.luckyshopee,"appKey",t)},expression:"luckyshopee.appKey"}}),n("label",[e._v("appChannel")]),n("b-form-input",{model:{value:e.luckyshopee.appChannel,callback:function(t){e.$set(e.luckyshopee,"appChannel",t)},expression:"luckyshopee.appChannel"}})],1),n("b-tab",{attrs:{title:"运行参数"}},[n("b-form-group",{attrs:{label:"在线人数"}},[n("p",[e._v(e._s(e.online))])]),n("b-form-group",{attrs:{label:"获胜策略"}},[n("b-form-radio-group",{attrs:{stacked:"",options:[{text:"随机",value:0},{text:"必胜",value:1}]},model:{value:e.strategy,callback:function(t){e.strategy=t},expression:"strategy"}},[n("b-form-radio",{attrs:{value:"2"}},[n("b-form-group",{attrs:{label:"指定结果","label-cols-sm":"4","invalid-feedback":e.spec_result_error,state:e.spec_result_state}},[n("b-form-input",{attrs:{placeholder:"输入7,8,9，3盘结果分别是7,8,9",state:e.spec_result_state},on:{update:function(t){e.strategy=2}},model:{value:e.spec_result,callback:function(t){e.spec_result=t},expression:"spec_result"}})],1)],1)],1)],1),n("b-form-group",{attrs:{label:"下注抽水"}},[n("b-form-input",{attrs:{formatter:e.feeFormatter},model:{value:e.feeRate,callback:function(t){e.feeRate=t},expression:"feeRate"}})],1),n("b-form-group",{attrs:{label:"取现抽水","invalid-feedback":"格式: n%+d",state:e.wfState}},[n("b-form-input",{attrs:{state:e.wfState},model:{value:e.withdrawFee,callback:function(t){e.withdrawFee=t},expression:"withdrawFee"}})],1)],1),n("b-tab",{attrs:{title:"老师配置"}},[n("b-form-group",{attrs:{label:"老师WhatsUp"}},[n("b-form-input",{model:{value:e.whatsup,callback:function(t){e.whatsup=t},expression:"whatsup"}})],1)],1)],1),n("b-button",{attrs:{block:"",variant:"info"},on:{click:e.submit}},[e._v("Submit")])],1)},x=[],O=(n("a15b"),n("fb6a"),n("a9e3"),n("ac1f"),n("1276"),n("7ed9")),$={loggedIn:function(){return!!localStorage.admin_logged},logout:function(){delete localStorage.admin_logged},stdret:function(e){return function(t){t&&"access denied"==t?(delete localStorage.admin_logged,re.push("/login")):e.apply(null,arguments)}}},j=$.stdret,I={name:"serverlet",components:{},data:function(){return{online:null,strategy:0,spec_result:null,feeRate:"2%",withdrawFee:"5%",luckyshopee:{sms_url:null,pay_url:null,withdraw_url:null,appId:null,appKey:null,appChannel:null},whatsup:null}},computed:{spec_result_state:function(){if(2!=this.strategy)return null;if(!this.spec_result)return null;for(var e=this.spec_result.split(/[\s,，]+/),t=0;t<e.length;t++){var n=e[t],r=Number(n);if(""===n||null==n)return!1;if(isNaN(r))return!1;if(r<0||r>9)return!1}return!0},spec_result_error:function(){if(!this.spec_result)return null;var e=this.spec_result.split(/[\s,，]+/),t=e[e.length-1];if(""==t||null==t)return"结尾必须是数字";for(var n=0;n<e.length;n++){var r=e[n],a=Number(r);if(""===r||null==r)return"第".concat(n+1,"个数字是空的");if(isNaN(a))return"第".concat(n+1,"个不是数字");if(a<0||a>9)return"第".concat(n+1,"个数字不在0～9之间")}return null},wfState:function(){if(0==this.withdrawFee.length)return!1;var e=this.withdrawFee.split("%");if(e.length>2)return!1;for(var t=0;t<e.length;t++)if(e[t]=Number(e[t]),isNaN(e[t]))return!1;return!(2==e.length&&e[0]>=100)}},methods:{feeFormatter:function(e){return"%"==e.slice(-1)?e:e+"%"},submit:function(){var e=this;if(this.wfState){var t=this.strategy,n=Number(this.feeRate.slice(0,-1))/100,r=this.luckyshopee,a=this.whatsup,o=function(){var t=e.withdrawFee.split("%");if(t.length>2)return!1;for(var n=0;n<t.length;n++)if(t[n]=Number(t[n]),isNaN(t[n]))return!1;return 1==t.length&&"%"!=e.withdrawFee.slice(-1)&&(t[1]=t[0],t[0]=0),t}();if(o){if(2==t){if(!this.spec_result_state)return;t=void 0;var s=this.spec_result.split(/[\s,，]+/)}Object(O["c"])((function(e){e.emit("setsettings",{strategy:t,temp_result:s,feeRate:n,withdrawPercent:(o[0]||0)/100,withdrawFixed:o[1]||0,luckyshopee:r,whatsup:a},(function(e){if(e)return alert(e);alert("success")}))}))}}}},mounted:function(){var e=this;Object(O["c"])((function(t){t.emit("getsettings",j((function(t,n){if(t)return alert(t);var r="";n.withdrawPercent&&(r+=100*n.withdrawPercent+"%"),n.withdrawFixed&&(r.length>0&&(r+="+"),r+=n.withdrawFixed),n.temp_result&&n.temp_result.length&&(n.spec_result=n.temp_result.join(","),n.strategy=2),n.withdrawFee=r,n.feeRate=100*n.feeRate+"%",Object.assign(e,n)})))}))}},C=I,N=Object(m["a"])(C,k,x,!1,null,null,null),S=N.exports,A=function(){var e=this,t=e.$createElement,n=e._self._c||t;return n("div",[n("b-form",[n("b-form-group",{staticClass:"mt-1",attrs:{label:"用户手机"}},[n("b-input-group",{staticClass:"ml-1 mr-1"},[n("b-form-input",{attrs:{required:""},model:{value:e.phone,callback:function(t){e.phone=t},expression:"phone"}}),n("b-input-group-append",[n("b-button",{attrs:{type:"submit",variant:"info"},on:{click:e.findUser}},[e._v("Find")])],1)],1)],1)],1),n("b-form-group",{directives:[{name:"show",rawName:"v-show",value:Object.keys(e.userdata).length,expression:"Object.keys(userdata).length"}]},[n("b-container",{attrs:{fluid:""}},[n("b-row",{staticClass:"my-1"},[n("b-col",{attrs:{sm:"6"}},[n("label",{attrs:{for:"phone"}},[e._v("phone "),n("code",[e._v(e._s(e.userdata.phone))])])]),n("b-col",{attrs:{sm:"6"}},[n("b-form-checkbox",{attrs:{name:"check-button",switch:""},model:{value:e.blocked,callback:function(t){e.blocked=t},expression:"blocked"}},[e._v(" 禁用账号 "),n("b",[e._v("(Blocked: "+e._s(e.blocked)+")")])])],1)],1),n("b-row",{staticClass:"my-1"},[n("b-col",{attrs:{sm:"6"}},[n("label",{attrs:{for:"balance"}},[e._v("balance "),n("code",[e._v(e._s(e.userdata.balance||0))]),e._v(":")])]),n("b-col",{attrs:{sm:"6"}},[n("b-input-group",[n("b-form-input",{attrs:{id:"m_balance"}}),n("b-input-group-append",[n("b-button",{attrs:{variant:"info"},on:{click:e.modifyBalance}},[e._v("Add")])],1)],1)],1)],1),e._l(e.paytm_ids,(function(t,r){return n("b-row",{key:r,staticClass:"my-1"},[n("b-col",{attrs:{sm:"6"}},[n("label",{attrs:{for:"paytm_id"+r}},[e._v("paytm_id "),n("code",[e._v(e._s(t))]),e._v(":")])]),n("b-col",{attrs:{sm:"6"}},[n("b-input-group",[n("b-form-input",{attrs:{id:"paytm_id"+r}}),n("b-input-group-append",[n("b-button-group",[n("b-button",{attrs:{"data-idx":r,variant:"info"},on:{click:e.chgPaytm}},[e._v("改")]),n("b-button",{attrs:{"data-idx":r,variant:"danger"},on:{click:e.delPaytm}},[e._v("删")])],1)],1)],1)],1)],1)})),n("b-row",{staticClass:"my-1"},[n("b-col",{attrs:{sm:"6"}},[n("label",{attrs:{for:"bi"}},[e._v("Bank Info "),n("code"),e._v(":")])]),n("b-col",{attrs:{sm:"6"}},[n("b-card",[n("b-card-text",[e._v(e._s(e.bankCode))]),n("b-card-text",[e._v(e._s(e.accountName))]),n("b-card-text",[e._v(e._s(e.accountNo))]),n("b-card-text",[e._v(e._s(e.bankphone))]),n("b-button",{staticClass:"float-right",attrs:{variant:"danger"}},[e._v("删")])],1)],1)],1),n("b-row")],2)],1)],1)},D=[],R=(n("9129"),n("6e87")),P=n("136a"),E=$.stdret,F={name:"userMan",computed:{blocked:{get:function(){return new Date(this.userdata.block)>new Date},set:function(e){var t=this,n=e?new Date("2100/01/01"):new Date("1970/01/01");Object(O["c"])((function(e){e.emit("disableuser",t.phone,n,E((function(e){if(e)return alert(e);t.$set(t.userdata,"block",n)})))}))}},paytm_ids:function(){return Array.isArray(this.userdata.paytm_id)?this.userdata.paytm_id:[this.userdata.paytm_id]},bankCode:function(){return Object(R["get"])(this.userdata,"bankInfo.bankCode")},accountName:function(){return Object(R["get"])(this.userdata,"bankInfo.accountName")},accountNo:function(){return Object(R["get"])(this.userdata,"bankInfo.accountNo")},bankphone:function(){return Object(R["get"])(this.userdata,"bankInfo.phone")}},data:function(){return{phone:null,userdata:{bankInfo:{}}}},methods:{manipulatedata:function(e){var t=this;for(var n in e)t.$set(t.userdata,n,e[n])},findUser:function(e){if(e.preventDefault(),this.phone){var t=this.phone,n=this;Object(O["c"])((function(e){e.emit("queryuser",t,E((function(e,t){if(e)return alert(e);n.manipulatedata(t)})))}))}},modifyBalance:function(){var e=Number(document.getElementById("m_balance").value);if(!Number.isNaN(e)){var t=this.phone,n=this;Object(O["c"])((function(r){r.emit("modifybalance",t,e,E((function(r,a){if(r)return alert(r);n.manipulatedata(a),P["a"].Account({accountId:t}),P["a"].onReward(e,"管理员操作")})))}))}},chgPaytm:function(e){var t=e.target.dataset.idx,n=document.getElementById("paytm_id".concat(t)).value;Array.isArray(this.userdata.paytm_id)||(t=null);var r=this;Object(O["c"])((function(e){e.emit("changepaytm",r.phone,t,n,E((function(e,t){if(e)return alert(e);r.manipulatedata(t)})))}))},delPaytm:function(e){var t=e.target.dataset.idx,n=document.getElementById("paytm_id".concat(t)).value,r=this;Object(O["c"])((function(e){e.emit("delpaytm",r.phone,n,E((function(e){if(e)return alert(e);r.$set(r.userdata,"paytm_id",null)})))}))}},mounted:function(){this.userdata={}}},B=F,M=Object(m["a"])(B,A,D,!1,null,null,null),U=M.exports,T=function(){var e=this,t=e.$createElement,n=e._self._c||t;return n("b-form",{staticClass:"mt-5"},[n("b-form-group",{attrs:{id:"login-phone"}},[n("b-form-input",{attrs:{required:"",placeholder:"User name"},model:{value:e.mobile,callback:function(t){e.mobile=t},expression:"mobile"}})],1),n("b-form-group",[n("b-form-input",{attrs:{type:"password",required:"",placeholder:"Password"},model:{value:e.password,callback:function(t){e.password=t},expression:"password"}})],1),e.regmode?n("b-form-group",[n("b-button",{attrs:{type:"submit",variant:"primary",block:""},on:{click:e.reg}},[e._v("Sign up")]),n("p",[e._v("首次使用，请注册管理员账号，一旦注册不可更改")])],1):n("b-button",{attrs:{type:"submit",variant:"primary",block:""},on:{click:e.dologin}},[e._v("Sign in")])],1)},q=[],G=(n("5319"),n("6821")),K=n.n(G),J={name:"login",data:function(){return{mobile:null,password:null,logged:!1,longop:!1,regmode:!1}},methods:{loggedIn:function(){return!!this.logged},reg:function(e){e.preventDefault(),this.longop=!0;var t=this.mobile,n=this.password,r=this;Object(O["c"])((function(e){function a(){r.longop=!1,e.off("reconnect_failed",a),alert("Can not reach the server")}e.on("reconnect_failed",a),e.emit("regadmin",{phone:t,pwd:n},(function(t){r.handlelogin(t),e.off("reconnect_failed",a)}))}))},dologin:function(e){e.preventDefault(),this.longop=!0;var t=this.mobile,n=this.password,r=this;Object(O["c"])((function(e){function a(){r.longop=!1,e.off("reconnect_failed",a),alert("Can not reach the server")}e.on("reconnect_failed",a),e.emit("salt",t,(function(o,s){if(o)return r.longop=!1,void alert(o);e.emit("login",{phone:t,pwd:K()(""+s+n)},(function(t,n){r.handlelogin(t,n),e.off("reconnect_failed",a)}))}))}))},handlelogin:function(e){if(this.longop=!1,e)return alert(e);localStorage.admin_logged=!0,this.$router.replace("/serverlet")}},mounted:function(){var e=this;Object(O["c"])((function(t){t.emit("adminexists",(function(t,n){if(t)return alert(t);e.regmode=!n}))}))}},z=J,L=Object(m["a"])(z,T,q,!1,null,null,null),H=L.exports,V=function(){var e=this,t=e.$createElement,n=e._self._c||t;return n("div",[n("b-alert",{attrs:{dismissible:"",show:e.errStatus,variant:"warning"},on:{dismissed:e.errDismissed}},[e._v(e._s(e.err))]),n("b-tabs",[n("b-tab",{attrs:{title:"管理员账号"}},[n("b-button-toolbar",[n("b-button-group",{directives:[{name:"b-modal",rawName:"v-b-modal.modal-create",modifiers:{"modal-create":!0}}],staticClass:"float-right",attrs:{size:"sm"}},[n("b-button",[n("b-icon-person-plus"),e._v(" Create Account")],1)],1)],1),n("b-table",{attrs:{"show-empty":"",small:"",stacked:"md",items:e.items,fields:e.fields},scopedSlots:e._u([{key:"cell(actions)",fn:function(t){return["admin"!=t.item.phone?n("b-button",{attrs:{size:"sm"},on:{click:function(n){return e.delaccount(t.item)}}},[e._v("delete")]):e._e()]}}])})],1)],1),n("b-modal",{attrs:{id:"modal-create",title:"新建管理员","ok-only":"","ok-title":"Create"},on:{ok:e.addaccount}},[n("b-form",[n("b-form-group",{attrs:{label:"账号"}},[n("b-input",{model:{value:e.account.phone,callback:function(t){e.$set(e.account,"phone",t)},expression:"account.phone"}})],1),n("b-form-group",{attrs:{label:"密码"}},[n("b-input",{model:{value:e.account.pwd,callback:function(t){e.$set(e.account,"pwd",t)},expression:"account.pwd"}})],1),n("b-form-group",{attrs:{label:"身份"}},[n("b-form-select",{attrs:{options:[{value:null,text:"选择身份"},"admin","manager","superuser"]},model:{value:e.account.acl,callback:function(t){e.$set(e.account,"acl",t)},expression:"account.acl"}})],1)],1)],1)],1)},W=[],Y=(n("99af"),n("5530"));Number.prototype.pad=function(e){var t=String(this);while(t.length<(e||2))t="0"+t;return t};var Q=function(e){return e=new Date(e),"".concat(e.getFullYear().pad(4),"-").concat((e.getMonth()+1).pad(),"-").concat(e.getDate().pad()," ").concat(e.getHours().pad(),":").concat(e.getMinutes().pad(),":").concat(e.getSeconds().pad())},X={name:"Accounts",components:{BIconPersonPlus:u["q"]},data:function(){return{errStatus:null,err:null,account:{phone:null,pwd:null,acl:null},items:[],fields:[{key:"phone",label:"账号"},{key:"acl",label:"身份",formatter:function(e,t,n){return e||(n.isAdmin?"Admin":"")}},{key:"regTime",label:"注册时间",formatter:Q},{key:"actions",label:"操作"}]}},methods:{showerr:function(e){this.errStatus="access denied"!=e||3,this.err=e},errDismissed:function(){"access denied"==this.err&&re.push("/login"),this.err=null,this.errStatus=null},refreshData:function(){var e=Object(O["c"])(),t=this;e.emit("$list",{target:"users",query:{isAdmin:!0}},(function(e,n){if(e)return t.showerr(e);t.items=n}))},delaccount:function(e){var t=Object(O["c"])(),n=this;t.emit("$del",{target:"users",query:{phone:e.phone}},(function(e){if(e)return n.showerr(e);n.refreshData()}))},addaccount:function(e){if(!this.account.phone||!this.account.pwd||!this.account.acl)return e.preventDefault();var t=Object(O["c"])(),n=this;t.emit("$create",{target:"users",content:Object(Y["a"])(Object(Y["a"])({},this.account),{},{isAdmin:!0})},(function(e){if(e)return n.showerr(e);n.refreshData()}))},updaccount:function(e,t){var n=Object(O["c"])();n.emit("$upd",{target:"users",query:{phone:e},content:t},this.showerr.bind(this))}},mounted:function(){this.refreshData()}},Z=X,ee=Object(m["a"])(Z,V,W,!1,null,null,null),te=ee.exports;function ne(e,t,n){$.loggedIn()?n():n({path:"/login",query:{redirect:e.fullPath}})}var re=new a["a"]({routes:[{path:"/",component:S,beforeEnter:ne},{path:"/serverlet",component:S,beforeEnter:ne},{path:"/userMoney",component:U,beforeEnter:ne},{path:"/accounts",component:te,beforeEnter:ne},{path:"/login",component:H},{path:"/logout",beforeEnter:function(e,t,n){$.logout(),n("/")}}]});r["default"].use(a["a"]),r["default"].use(s["a"]),r["default"].component("BIcon",i["a"]),r["default"].component("BIconChevronRight",u["i"]),r["default"].component("BIconChevronLeft",u["h"]),r["default"].component("BIconBoxArrowInLeft",u["b"]),r["default"].use(o["a"]),r["default"].config.productionTip=!1;var ae=new o["a"].Store({state:{me:{balance:null,id:null,paytm_id:null},countdown:null,period:null,history:[],orders:[],status:null},mutations:{}});window.v=new r["default"]({router:re,el:"#app",store:ae,$eventBus:new r["default"],render:function(e){return e(y)}})}});
//# sourceMappingURL=admin.cfa74c30.js.map