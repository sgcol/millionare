(function(e){function t(t){for(var o,i,l=t[0],s=t[1],u=t[2],p=0,d=[];p<l.length;p++)i=l[p],Object.prototype.hasOwnProperty.call(r,i)&&r[i]&&d.push(r[i][0]),r[i]=0;for(o in s)Object.prototype.hasOwnProperty.call(s,o)&&(e[o]=s[o]);c&&c(t);while(d.length)d.shift()();return a.push.apply(a,u||[]),n()}function n(){for(var e,t=0;t<a.length;t++){for(var n=a[t],o=!0,l=1;l<n.length;l++){var s=n[l];0!==r[s]&&(o=!1)}o&&(a.splice(t--,1),e=i(i.s=n[0]))}return e}var o={},r={admin:0},a=[];function i(t){if(o[t])return o[t].exports;var n=o[t]={i:t,l:!1,exports:{}};return e[t].call(n.exports,n,n.exports,i),n.l=!0,n.exports}i.m=e,i.c=o,i.d=function(e,t,n){i.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:n})},i.r=function(e){"undefined"!==typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},i.t=function(e,t){if(1&t&&(e=i(e)),8&t)return e;if(4&t&&"object"===typeof e&&e&&e.__esModule)return e;var n=Object.create(null);if(i.r(n),Object.defineProperty(n,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var o in e)i.d(n,o,function(t){return e[t]}.bind(null,o));return n},i.n=function(e){var t=e&&e.__esModule?function(){return e["default"]}:function(){return e};return i.d(t,"a",t),t},i.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},i.p="/";var l=window["webpackJsonp"]=window["webpackJsonp"]||[],s=l.push.bind(l);l.push=t,l=l.slice();for(var u=0;u<l.length;u++)t(l[u]);var c=s;a.push([2,"chunk-vendors"]),n()})({0:function(e,t){},2:function(e,t,n){e.exports=n("9150")},"7ed9":function(e,t,n){"use strict";n.d(t,"a",(function(){return d})),n.d(t,"b",(function(){return f})),n.d(t,"c",(function(){return m}));n("7db0"),n("c975"),n("a15b"),n("a434"),n("a9e3"),n("4d63"),n("ac1f"),n("25f0"),n("5319"),n("1276");var o,r=n("2b0e"),a=n("0b16"),i=n.n(a),l=n("df7c"),s=n.n(l),u=n("89a4"),c=n("4bea"),p=n.n(c),d={getItem:function(e){return decodeURIComponent(document.cookie.replace(new RegExp("(?:(?:^|.*;)\\s*"+encodeURIComponent(e).replace(/[-.+*]/g,"\\$&")+"\\s*\\=\\s*([^;]*).*$)|^.*$"),"$1"))||null},setItem:function(e,t,n,o,r,a){if(!e||/^(?:expires|max\-age|path|domain|secure)$/i.test(e))return!1;var i="";if(n)switch(n.constructor){case Number:i=n===1/0?"; expires=Fri, 31 Dec 9999 23:59:59 GMT":"; max-age="+n;break;case String:i="; expires="+n;break;case Date:i="; expires="+n.toUTCString();break}return document.cookie=encodeURIComponent(e)+"="+encodeURIComponent(t)+i+(r?"; domain="+r:"")+(o?"; path="+o:"")+(a?"; secure":""),!0},removeItem:function(e,t,n){return!(!e||!this.hasItem(e))&&(document.cookie=encodeURIComponent(e)+"=; expires=Thu, 01 Jan 1970 00:00:00 GMT"+(n?"; domain="+n:"")+(t?"; path="+t:""),!0)},hasItem:function(e){return new RegExp("(?:^|;\\s*)"+encodeURIComponent(e).replace(/[-.+*]/g,"\\$&")+"\\s*\\=").test(document.cookie)},keys:function(){for(var e=document.cookie.replace(/((?:^|\s*;)[^\=]+)(?=;|$)|^\s*|\s*(?:\=[^;]*)?(?:\1|$)/g,"").split(/\s*(?:\=[^;]*)?;\s*/),t=0;t<e.length;t++)e[t]=decodeURIComponent(e[t]);return e}},f=new r["default"];function m(e){if(o)o.disconnected&&o.connect();else{var t=i.a.parse(location.href,!0),n=t.query;if(n.server=n.server||window.server,n.server){n.server.indexOf("http")<0&&(n.server="http://"+n.server);var r=i.a.parse(n.server);t.host=r.host,t.pathname=r.pathname,t.protocol=r.protocol,t.port=r.port}var a=t.host,l=Object(u["a"])(a);if(l&&!l.errors&&0!=l.subdomain.indexOf("ws")){var c=l.subdomain.split(".");c[0]="ws",a=c.join(".")+"."+l.domain+"."+l.tld+(t.port?":"+t.port:"")}/\.[^/\\]+$/.test(t.pathname)?t._p=s.a.dirname(t.pathname):t._p=t.pathname;var d=a+t._p;".app"==s.a.extname(t.pathname)&&(d+="/"+s.a.basename(t.pathname)),o=window.socket=p()(d,{reconnectionAttempts:3,transports:["websocket"]}),o.on("statechanged",(function(e){var t=window.v.$store.state;if(e.user){var n=e.user;n._id&&(t.me._id=n._id),n.balance&&(t.me.balance=n.balance),n.paytm_id&&(t.me.paytm_id=n.paytm_id)}e.history&&(t.history=e.history),e.orders&&(t.orders=e.orders),e.countdown&&(t.countdown=e.countdown),e.period&&(t.period=e.period),e.status&&(t.status=e.status)})),o.on("gameresult",(function(e){var t=window.v.$store.state;t.history.push(e.history),t.history.length>50&&t.history.splice(0,40),e.status&&(t.status=status);for(var n=t.orders.length-1;n>=0;n--){var o=t.orders[n];if(o.game.period!=e.history.period)break;var r=o;r.game.price=e.history.price,t.orders.splice(n,1,r)}})),o.on("incbalance",(function(e){var t=window.v.$store.state;t.me.balance+=e})),o.on("orderchanged",(function(e){var t=window.v.$store.state,n=t.orders.find((function(t){return t.id==e.id}));t.orders[n]=e})),o.on("connect",(function(){f.$emit("connect",o)})).on("error",console.error.bind(console,"err")).on("connect_error",(function(){f.$emit("relogin")})).on("connect_timeout",(function(){f.$emit("relogin")})).on("disconnect",(function(){f.$emit("relogin")}))}return"function"==typeof e&&e(o),o}},9150:function(e,t,n){"use strict";n.r(t);n("e260"),n("e6cf"),n("cca6"),n("a79d");var o=n("2b0e"),r=n("8c4f"),a=n("2f62"),i=n("5f5b"),l=n("0759"),s=n("7386"),u=(n("f9e3"),n("2dd8"),function(){var e=this,t=e.$createElement,n=e._self._c||t;return n("div",[n("sys-menu"),n("router-view")],1)}),c=[],p=function(){var e=this,t=e.$createElement,n=e._self._c||t;return n("div",[n("b-navbar",{attrs:{toggleable:"lg",type:"dark",variant:"info",fixed:"top",sticky:""}},[n("b-navbar-brand",{attrs:{href:"#"}},[e._v("Admin")]),n("b-navbar-toggle",{attrs:{target:"nav-collapse"}}),n("b-collapse",{attrs:{id:"nav-collapse","is-nav":""}},[n("b-navbar-nav",{},[n("b-nav-item",{attrs:{to:"serverlet"}},[e._v("服务器设置")]),n("b-nav-item",{attrs:{to:"userMoney"}},[e._v("用户管理")]),n("b-nav-item",{attrs:{to:"logout"}},[e._v("注销")])],1)],1)],1)],1)},d=[],f={name:"MENU"},m=f,b=n("2877"),h=Object(b["a"])(m,p,d,!1,null,null,null),v=h.exports,g={name:"Admin",components:{SysMenu:v}},y=g,_=Object(b["a"])(y,u,c,!1,null,null,null),w=_.exports,k=function(){var e=this,t=e.$createElement,n=e._self._c||t;return n("div",[n("b-form-group",{attrs:{label:"luckyshopee配置"}},[n("label",[e._v("下单接口")]),n("b-form-input",{model:{value:e.luckyshopee.pay_url,callback:function(t){e.$set(e.luckyshopee,"pay_url",t)},expression:"luckyshopee.pay_url"}}),n("label",[e._v("代付接口")]),n("b-form-input",{model:{value:e.luckyshopee.withdraw_url,callback:function(t){e.$set(e.luckyshopee,"withdraw_url",t)},expression:"luckyshopee.withdraw_url"}}),n("label",[e._v("短信接口")]),n("b-form-input",{model:{value:e.luckyshopee.sms_url,callback:function(t){e.$set(e.luckyshopee,"sms_url",t)},expression:"luckyshopee.sms_url"}}),n("label",[e._v("appId")]),n("b-form-input",{model:{value:e.luckyshopee.appId,callback:function(t){e.$set(e.luckyshopee,"appId",t)},expression:"luckyshopee.appId"}}),n("label",[e._v("appKey")]),n("b-form-input",{model:{value:e.luckyshopee.appKey,callback:function(t){e.$set(e.luckyshopee,"appKey",t)},expression:"luckyshopee.appKey"}}),n("label",[e._v("appChannel")]),n("b-form-input",{model:{value:e.luckyshopee.appChannel,callback:function(t){e.$set(e.luckyshopee,"appChannel",t)},expression:"luckyshopee.appChannel"}})],1),n("p",[e._v("在线人数"),n("span",[e._v(e._s(e.online))])]),n("b-form-group",{attrs:{label:"获胜策略"}},[n("b-form-radio-group",{attrs:{options:[{text:"随机",value:0},{text:"必胜",value:1}]},model:{value:e.strategy,callback:function(t){e.strategy=t},expression:"strategy"}})],1),n("b-form-group",{attrs:{label:"下注抽水"}},[n("b-form-input",{model:{value:e.feeRate,callback:function(t){e.feeRate=t},expression:"feeRate"}})],1),n("b-form-group",{attrs:{label:"取现抽水"}},[n("b-form-input",{model:{value:e.withdrawFee,callback:function(t){e.withdrawFee=t},expression:"withdrawFee"}})],1),n("b-form-group",[n("b-button",{attrs:{block:"",variant:"info"},on:{click:e.submit}},[e._v("Submit")])],1)],1)},x=[],$=(n("a9e3"),n("7ed9")),O={loggedIn:function(){return!!localStorage.admin_logged},logout:function(){delete localStorage.admin_logged},stdret:function(e){return function(t){t&&"access denied"==t?(delete localStorage.admin_logged,H.push("/login")):e.apply(null,arguments)}}},j=O.stdret,I={name:"serverlet",data:function(){return{online:null,strategy:null,feeRate:.02,withdrawFee:.05,luckyshopee:{sms_url:null,pay_url:null,withdraw_url:null,appId:null,appKey:null,appChannel:null}}},methods:{submit:function(){var e=this.strategy,t=Number(this.feeRate),n=Number(this.withdrawFee),o=this.luckyshopee;Object($["c"])((function(r){r.emit("setsettings",{strategy:e,feeRate:t,withdrawFee:n,luckyshopee:o},(function(e){if(e)return alert(e);alert("success")}))}))}},mounted:function(){var e=this;Object($["c"])((function(t){t.emit("getsettings",j((function(t,n){if(t)return alert(t);Object.assign(e,n)})))}))}},C=I,R=Object(b["a"])(C,k,x,!1,null,null,null),S=R.exports,E=function(){var e=this,t=e.$createElement,n=e._self._c||t;return n("div",[n("b-form",[n("b-form-group",{staticClass:"mt-1",attrs:{label:"用户手机"}},[n("b-input-group",{staticClass:"ml-1 mr-1"},[n("b-form-input",{attrs:{required:""},model:{value:e.phone,callback:function(t){e.phone=t},expression:"phone"}}),n("b-input-group-append",[n("b-button",{attrs:{type:"submit",variant:"info"},on:{click:e.findUser}},[e._v("Find")])],1)],1)],1)],1),n("b-form-group",{directives:[{name:"show",rawName:"v-show",value:Object.keys(e.userdata).length,expression:"Object.keys(userdata).length"}]},[n("b-container",{attrs:{fluid:""}},[n("b-row",{staticClass:"my-1"},[n("b-col",{attrs:{sm:"6"}},[n("label",{attrs:{for:"phone"}},[e._v("phone "),n("code",[e._v(e._s(e.userdata.phone))])])]),n("b-col",{attrs:{sm:"6"}},[n("b-form-checkbox",{attrs:{name:"check-button",switch:""},model:{value:e.blocked,callback:function(t){e.blocked=t},expression:"blocked"}},[e._v(" 禁用账号 "),n("b",[e._v("(Blocked: "+e._s(e.blocked)+")")])])],1)],1),n("b-row",{staticClass:"my-1"},[n("b-col",{attrs:{sm:"6"}},[n("label",{attrs:{for:"balance"}},[e._v("balance "),n("code",[e._v(e._s(e.userdata.balance))]),e._v(":")])]),n("b-col",{attrs:{sm:"6"}},[n("b-input-group",[n("b-form-input",{attrs:{id:"m_balance"}}),n("b-input-group-append",[n("b-button",{attrs:{variant:"info"},on:{click:e.modifyBalance}},[e._v("Add")])],1)],1)],1)],1),e._l(e.paytm_ids,(function(t,o){return n("b-row",{key:o,staticClass:"my-1"},[n("b-col",{attrs:{sm:"6"}},[n("label",{attrs:{for:"paytm_id"+o}},[e._v("paytm_id "),n("code",[e._v(e._s(t))]),e._v(":")])]),n("b-col",{attrs:{sm:"6"}},[n("b-input-group",[n("b-form-input",{attrs:{id:"paytm_id"+o}}),n("b-input-group-append",[n("b-button-group",[n("b-button",{attrs:{"data-idx":o,variant:"info"},on:{click:e.chgPaytm}},[e._v("改")]),n("b-button",{attrs:{"data-idx":o,variant:"danger"},on:{click:e.delPaytm}},[e._v("删")])],1)],1)],1)],1)],1)}))],2)],1)],1)},P=[],B=(n("9129"),O.stdret),M={name:"userMan",computed:{blocked:{get:function(){return new Date(this.userdata.block)>new Date},set:function(e){var t=this,n=e?new Date("2100/01/01"):new Date("1970/01/01");Object($["c"])((function(e){e.emit("disableuser",t.phone,n,B((function(e){if(e)return alert(e);t.$set(t.userdata,"block",n)})))}))}},paytm_ids:function(){return Array.isArray(this.userdata.paytm_id)?this.userdata.paytm_id:[this.userdata.paytm_id]}},data:function(){return{phone:null,userdata:{}}},methods:{manipulatedata:function(e){var t=this;for(var n in e)t.$set(t.userdata,n,e[n])},findUser:function(e){if(e.preventDefault(),this.phone){var t=this.phone,n=this;Object($["c"])((function(e){e.emit("queryuser",t,B((function(e,t){if(e)return alert(e);n.manipulatedata(t)})))}))}},modifyBalance:function(){var e=Number(document.getElementById("m_balance").value);if(!Number.isNaN(e)){var t=this.phone,n=this;Object($["c"])((function(o){o.emit("modifybalance",t,e,B((function(e,t){if(e)return alert(e);n.manipulatedata(t)})))}))}},chgPaytm:function(e){var t=e.target.dataset.idx,n=document.getElementById("paytm_id".concat(t)).value;Array.isArray(this.userdata.paytm_id)||(t=null);var o=this;Object($["c"])((function(e){e.emit("changepaytm",o.phone,t,n,B((function(e,t){if(e)return alert(e);o.manipulatedata(t)})))}))},delPaytm:function(e){var t=e.target.dataset.idx,n=document.getElementById("paytm_id".concat(t)).value,o=this;Object($["c"])((function(e){e.emit("delpaytm",o.phone,n,B((function(e){if(e)return alert(e);o.$set(o.userdata,"paytm_id",null)})))}))}},mounted:function(){this.userdata={}}},U=M,N=Object(b["a"])(U,E,P,!1,null,null,null),A=N.exports,D=function(){var e=this,t=e.$createElement,n=e._self._c||t;return n("b-form",{staticClass:"mt-5"},[n("b-form-group",{attrs:{id:"login-phone"}},[n("b-form-input",{attrs:{type:"tel",required:"",placeholder:"Phone number"},model:{value:e.mobile,callback:function(t){e.mobile=t},expression:"mobile"}})],1),n("b-form-group",[n("b-form-input",{attrs:{type:"password",required:"",placeholder:"Password"},model:{value:e.password,callback:function(t){e.password=t},expression:"password"}})],1),e.regmode?n("b-form-group",[n("b-button",{directives:[{name:"show",rawName:"v-show",value:e.regmode,expression:"regmode"}],attrs:{type:"submit",variant:"primary",block:""},on:{click:e.reg}},[e._v("Sign up")]),n("p",[e._v("首次使用，请注册管理员账号，一旦注册不可更改")])],1):n("b-button",{attrs:{type:"submit",variant:"primary",block:""},on:{click:e.dologin}},[e._v("Sign in")])],1)},F=[],T=(n("ac1f"),n("5319"),n("6821")),q=n.n(T),K={name:"login",data:function(){return{mobile:null,password:null,logged:!1,longop:!1,regmode:!1}},methods:{loggedIn:function(){return!!this.logged},reg:function(e){e.preventDefault(),this.longop=!0;var t=this.mobile,n=this.password,o=this;Object($["c"])((function(e){function r(){o.longop=!1,e.off("reconnect_failed",r),alert("Can not reach the server")}e.on("reconnect_failed",r),e.emit("regadmin",{phone:t,pwd:n},(function(t){o.handlelogin(t),e.off("reconnect_failed",r)}))}))},dologin:function(e){e.preventDefault(),this.longop=!0;var t=this.mobile,n=this.password,o=this;Object($["c"])((function(e){function r(){o.longop=!1,e.off("reconnect_failed",r),alert("Can not reach the server")}e.on("reconnect_failed",r),e.emit("salt",t,(function(a,i){if(a)return o.longop=!1,void alert(a);e.emit("login",{phone:t,pwd:q()(""+i+n)},(function(t,n){o.handlelogin(t,n),e.off("reconnect_failed",r)}))}))}))},handlelogin:function(e){if(this.longop=!1,e)return alert(e);localStorage.admin_logged=!0,this.$router.replace("/serverlet")}},mounted:function(){var e=this;Object($["c"])((function(t){t.emit("adminexists",(function(t,n){if(t)return alert(t);e.regmode=!n}))}))}},J=K,G=Object(b["a"])(J,D,F,!1,null,null,null),L=G.exports;function z(e,t,n){O.loggedIn()?n():n({path:"/login",query:{redirect:e.fullPath}})}var H=new r["a"]({routes:[{path:"/",component:S,beforeEnter:z},{path:"/serverlet",component:S,beforeEnter:z},{path:"/userMoney",component:A,beforeEnter:z},{path:"/login",component:L},{path:"/logout",beforeEnter:function(e,t,n){O.logout(),n("/")}}]});o["default"].use(r["a"]),o["default"].use(i["a"]),o["default"].component("BIcon",l["a"]),o["default"].component("BIconChevronRight",s["i"]),o["default"].component("BIconChevronLeft",s["h"]),o["default"].component("BIconBoxArrowInLeft",s["b"]),o["default"].use(a["a"]),o["default"].config.productionTip=!1;var Q=new a["a"].Store({state:{me:{balance:null,id:null,paytm_id:null},countdown:null,period:null,history:[],orders:[],status:null},mutations:{}});window.v=new o["default"]({router:H,el:"#app",store:Q,$eventBus:new o["default"],render:function(e){return e(w)}})}});
//# sourceMappingURL=admin.5966f0b3.js.map