/******/ (function(modules) { // webpackBootstrap
/******/ 	// install a JSONP callback for chunk loading
/******/ 	function webpackJsonpCallback(data) {
/******/ 		var chunkIds = data[0];
/******/ 		var moreModules = data[1];
/******/ 		var executeModules = data[2];
/******/
/******/ 		// add "moreModules" to the modules object,
/******/ 		// then flag all "chunkIds" as loaded and fire callback
/******/ 		var moduleId, chunkId, i = 0, resolves = [];
/******/ 		for(;i < chunkIds.length; i++) {
/******/ 			chunkId = chunkIds[i];
/******/ 			if(Object.prototype.hasOwnProperty.call(installedChunks, chunkId) && installedChunks[chunkId]) {
/******/ 				resolves.push(installedChunks[chunkId][0]);
/******/ 			}
/******/ 			installedChunks[chunkId] = 0;
/******/ 		}
/******/ 		for(moduleId in moreModules) {
/******/ 			if(Object.prototype.hasOwnProperty.call(moreModules, moduleId)) {
/******/ 				modules[moduleId] = moreModules[moduleId];
/******/ 			}
/******/ 		}
/******/ 		if(parentJsonpFunction) parentJsonpFunction(data);
/******/
/******/ 		while(resolves.length) {
/******/ 			resolves.shift()();
/******/ 		}
/******/
/******/ 		// add entry modules from loaded chunk to deferred list
/******/ 		deferredModules.push.apply(deferredModules, executeModules || []);
/******/
/******/ 		// run deferred modules when all chunks ready
/******/ 		return checkDeferredModules();
/******/ 	};
/******/ 	function checkDeferredModules() {
/******/ 		var result;
/******/ 		for(var i = 0; i < deferredModules.length; i++) {
/******/ 			var deferredModule = deferredModules[i];
/******/ 			var fulfilled = true;
/******/ 			for(var j = 1; j < deferredModule.length; j++) {
/******/ 				var depId = deferredModule[j];
/******/ 				if(installedChunks[depId] !== 0) fulfilled = false;
/******/ 			}
/******/ 			if(fulfilled) {
/******/ 				deferredModules.splice(i--, 1);
/******/ 				result = __webpack_require__(__webpack_require__.s = deferredModule[0]);
/******/ 			}
/******/ 		}
/******/
/******/ 		return result;
/******/ 	}
/******/
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// object to store loaded and loading chunks
/******/ 	// undefined = chunk not loaded, null = chunk preloaded/prefetched
/******/ 	// Promise = chunk loading, 0 = chunk loaded
/******/ 	var installedChunks = {
/******/ 		"setting": 0
/******/ 	};
/******/
/******/ 	var deferredModules = [];
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "/";
/******/
/******/ 	var jsonpArray = window["webpackJsonp"] = window["webpackJsonp"] || [];
/******/ 	var oldJsonpFunction = jsonpArray.push.bind(jsonpArray);
/******/ 	jsonpArray.push = webpackJsonpCallback;
/******/ 	jsonpArray = jsonpArray.slice();
/******/ 	for(var i = 0; i < jsonpArray.length; i++) webpackJsonpCallback(jsonpArray[i]);
/******/ 	var parentJsonpFunction = oldJsonpFunction;
/******/
/******/
/******/ 	// add entry module to deferred list
/******/ 	deferredModules.push([3,"chunk-vendors","chunk-common"]);
/******/ 	// run deferred modules when ready
/******/ 	return checkDeferredModules();
/******/ })
/************************************************************************/
/******/ ({

/***/ "./node_modules/cache-loader/dist/cjs.js?!./node_modules/babel-loader/lib/index.js!./node_modules/cache-loader/dist/cjs.js?!./node_modules/vue-loader/lib/index.js?!./src/setting/Admin.vue?vue&type=script&lang=js&":
/*!***********************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/cache-loader/dist/cjs.js??ref--12-0!./node_modules/babel-loader/lib!./node_modules/cache-loader/dist/cjs.js??ref--0-0!./node_modules/vue-loader/lib??vue-loader-options!./src/setting/Admin.vue?vue&type=script&lang=js& ***!
  \***********************************************************************************************************************************************************************************************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var _menu_vue__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./menu.vue */ \"./src/setting/menu.vue\");\n//\n//\n//\n//\n//\n//\n//\n\n/* harmony default export */ __webpack_exports__[\"default\"] = ({\n  name: 'Admin',\n  components: {\n    SysMenu: _menu_vue__WEBPACK_IMPORTED_MODULE_0__[\"default\"]\n  }\n});\n\n//# sourceURL=webpack:///./src/setting/Admin.vue?./node_modules/cache-loader/dist/cjs.js??ref--12-0!./node_modules/babel-loader/lib!./node_modules/cache-loader/dist/cjs.js??ref--0-0!./node_modules/vue-loader/lib??vue-loader-options");

/***/ }),

/***/ "./node_modules/cache-loader/dist/cjs.js?!./node_modules/babel-loader/lib/index.js!./node_modules/cache-loader/dist/cjs.js?!./node_modules/vue-loader/lib/index.js?!./src/setting/menu.vue?vue&type=script&lang=js&":
/*!**********************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/cache-loader/dist/cjs.js??ref--12-0!./node_modules/babel-loader/lib!./node_modules/cache-loader/dist/cjs.js??ref--0-0!./node_modules/vue-loader/lib??vue-loader-options!./src/setting/menu.vue?vue&type=script&lang=js& ***!
  \**********************************************************************************************************************************************************************************************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n//\n//\n//\n//\n//\n//\n//\n//\n//\n//\n//\n//\n//\n//\n//\n//\n/* harmony default export */ __webpack_exports__[\"default\"] = ({\n  name: 'MENU'\n});\n\n//# sourceURL=webpack:///./src/setting/menu.vue?./node_modules/cache-loader/dist/cjs.js??ref--12-0!./node_modules/babel-loader/lib!./node_modules/cache-loader/dist/cjs.js??ref--0-0!./node_modules/vue-loader/lib??vue-loader-options");

/***/ }),

/***/ "./node_modules/cache-loader/dist/cjs.js?!./node_modules/babel-loader/lib/index.js!./node_modules/cache-loader/dist/cjs.js?!./node_modules/vue-loader/lib/index.js?!./src/setting/serverlet.vue?vue&type=script&lang=js&":
/*!***************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/cache-loader/dist/cjs.js??ref--12-0!./node_modules/babel-loader/lib!./node_modules/cache-loader/dist/cjs.js??ref--0-0!./node_modules/vue-loader/lib??vue-loader-options!./src/setting/serverlet.vue?vue&type=script&lang=js& ***!
  \***************************************************************************************************************************************************************************************************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var core_js_modules_es_array_join__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! core-js/modules/es.array.join */ \"./node_modules/core-js/modules/es.array.join.js\");\n/* harmony import */ var core_js_modules_es_array_join__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_array_join__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var core_js_modules_es_array_slice__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! core-js/modules/es.array.slice */ \"./node_modules/core-js/modules/es.array.slice.js\");\n/* harmony import */ var core_js_modules_es_array_slice__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_array_slice__WEBPACK_IMPORTED_MODULE_1__);\n/* harmony import */ var core_js_modules_es_number_constructor__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! core-js/modules/es.number.constructor */ \"./node_modules/core-js/modules/es.number.constructor.js\");\n/* harmony import */ var core_js_modules_es_number_constructor__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_number_constructor__WEBPACK_IMPORTED_MODULE_2__);\n/* harmony import */ var core_js_modules_es_regexp_exec__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! core-js/modules/es.regexp.exec */ \"./node_modules/core-js/modules/es.regexp.exec.js\");\n/* harmony import */ var core_js_modules_es_regexp_exec__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_regexp_exec__WEBPACK_IMPORTED_MODULE_3__);\n/* harmony import */ var core_js_modules_es_string_split__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! core-js/modules/es.string.split */ \"./node_modules/core-js/modules/es.string.split.js\");\n/* harmony import */ var core_js_modules_es_string_split__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_string_split__WEBPACK_IMPORTED_MODULE_4__);\n/* harmony import */ var _admin_auth__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../admin/auth */ \"./src/admin/auth.js\");\n\n\n\n\n\n//\n//\n//\n//\n//\n//\n//\n//\n//\n//\n//\n//\n//\n//\n//\n//\n//\n//\n//\n//\n//\n//\n//\n//\n//\n//\n//\n//\n//\n//\n//\n//\n//\n//\n//\n//\n//\n // import approveWithdraw from './approve-withdraw'\n\n/* harmony default export */ __webpack_exports__[\"default\"] = ({\n  name: 'serverlet',\n  components: {// approveWithdraw,\n  },\n  data: function data() {\n    return {\n      feeRate: null,\n      withdrawFee: null,\n      luckyshopee: {\n        sms_url: null,\n        pay_url: null,\n        withdraw_url: null,\n        check_withdraw_url: null,\n        check_fund_url: null,\n        appId: null,\n        appKey: null,\n        appChannel: null\n      }\n    };\n  },\n  computed: {\n    wfState: function wfState() {\n      if (this.withdrawFee.length == 0) return false;\n      var parts = this.withdrawFee.split('%');\n      if (parts.length > 2) return false;\n\n      for (var i = 0; i < parts.length; i++) {\n        parts[i] = Number(parts[i]);\n        if (isNaN(parts[i])) return false;\n      }\n\n      if (parts.length == 2 && parts[0] >= 100) return false;\n      return true;\n    }\n  },\n  methods: {\n    feeFormatter: function feeFormatter(v) {\n      if (v.slice(-1) == '%') return v;\n      return v + '%';\n    },\n    submit: function submit() {\n      var _this = this;\n\n      if (!this.wfState) return;\n      var feeRate = Number(this.feeRate.slice(0, -1)) / 100;\n\n      var wfs = function () {\n        var parts = _this.withdrawFee.split('%');\n\n        if (parts.length > 2) return false;\n\n        for (var i = 0; i < parts.length; i++) {\n          parts[i] = Number(parts[i]);\n          if (isNaN(parts[i])) return false;\n        }\n\n        if (parts.length == 1 && _this.withdrawFee.slice(-1) != '%') {\n          parts[1] = parts[0];\n          parts[0] = 0;\n        }\n\n        return parts;\n      }();\n\n      if (!wfs) return;\n      var luckyshopee = this.luckyshopee;\n      Object(_admin_auth__WEBPACK_IMPORTED_MODULE_5__[\"openLink\"])(function (socket) {\n        socket.emit('setsettings', {\n          luckyshopee: luckyshopee,\n          feeRate: feeRate,\n          withdrawPercent: (wfs[0] || 0) / 100,\n          withdrawFixed: wfs[1] || 0\n        }, function (err) {\n          if (err) return alert(err);\n          alert('success');\n        });\n      });\n    }\n  },\n  mounted: function mounted() {\n    var self = this;\n    Object(_admin_auth__WEBPACK_IMPORTED_MODULE_5__[\"openLink\"])(function (socket) {\n      socket.emit('getsettings', function (err, setting) {\n        if (err) return alert(err);\n        var s = '';\n\n        if (setting.withdrawPercent) {\n          s += setting.withdrawPercent * 100 + '%';\n        }\n\n        if (setting.withdrawFixed) {\n          if (s.length > 0) s += '+';\n          s += setting.withdrawFixed;\n        }\n\n        if (setting.temp_result && setting.temp_result.length) {\n          setting.spec_result = setting.temp_result.join(',');\n          setting.strategy = 2;\n        }\n\n        setting.withdrawFee = s;\n        setting.feeRate = setting.feeRate * 100 + '%';\n        Object.assign(self, setting);\n      });\n    });\n  }\n});\n\n//# sourceURL=webpack:///./src/setting/serverlet.vue?./node_modules/cache-loader/dist/cjs.js??ref--12-0!./node_modules/babel-loader/lib!./node_modules/cache-loader/dist/cjs.js??ref--0-0!./node_modules/vue-loader/lib??vue-loader-options");

/***/ }),

/***/ "./node_modules/cache-loader/dist/cjs.js?{\"cacheDirectory\":\"node_modules/.cache/vue-loader\",\"cacheIdentifier\":\"68eff738-vue-loader-template\"}!./node_modules/vue-loader/lib/loaders/templateLoader.js?!./node_modules/cache-loader/dist/cjs.js?!./node_modules/vue-loader/lib/index.js?!./src/setting/Admin.vue?vue&type=template&id=1e6b7fa7&":
/*!*******************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/cache-loader/dist/cjs.js?{"cacheDirectory":"node_modules/.cache/vue-loader","cacheIdentifier":"68eff738-vue-loader-template"}!./node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!./node_modules/cache-loader/dist/cjs.js??ref--0-0!./node_modules/vue-loader/lib??vue-loader-options!./src/setting/Admin.vue?vue&type=template&id=1e6b7fa7& ***!
  \*******************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/*! exports provided: render, staticRenderFns */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"render\", function() { return render; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"staticRenderFns\", function() { return staticRenderFns; });\nvar render = function() {\n  var _vm = this\n  var _h = _vm.$createElement\n  var _c = _vm._self._c || _h\n  return _c(\"div\", [_c(\"sys-menu\"), _c(\"router-view\")], 1)\n}\nvar staticRenderFns = []\nrender._withStripped = true\n\n\n\n//# sourceURL=webpack:///./src/setting/Admin.vue?./node_modules/cache-loader/dist/cjs.js?%7B%22cacheDirectory%22:%22node_modules/.cache/vue-loader%22,%22cacheIdentifier%22:%2268eff738-vue-loader-template%22%7D!./node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!./node_modules/cache-loader/dist/cjs.js??ref--0-0!./node_modules/vue-loader/lib??vue-loader-options");

/***/ }),

/***/ "./node_modules/cache-loader/dist/cjs.js?{\"cacheDirectory\":\"node_modules/.cache/vue-loader\",\"cacheIdentifier\":\"68eff738-vue-loader-template\"}!./node_modules/vue-loader/lib/loaders/templateLoader.js?!./node_modules/cache-loader/dist/cjs.js?!./node_modules/vue-loader/lib/index.js?!./src/setting/menu.vue?vue&type=template&id=7f7b29d2&":
/*!******************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/cache-loader/dist/cjs.js?{"cacheDirectory":"node_modules/.cache/vue-loader","cacheIdentifier":"68eff738-vue-loader-template"}!./node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!./node_modules/cache-loader/dist/cjs.js??ref--0-0!./node_modules/vue-loader/lib??vue-loader-options!./src/setting/menu.vue?vue&type=template&id=7f7b29d2& ***!
  \******************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/*! exports provided: render, staticRenderFns */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"render\", function() { return render; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"staticRenderFns\", function() { return staticRenderFns; });\nvar render = function() {\n  var _vm = this\n  var _h = _vm.$createElement\n  var _c = _vm._self._c || _h\n  return _c(\n    \"div\",\n    [\n      _c(\n        \"b-navbar\",\n        {\n          attrs: {\n            toggleable: \"lg\",\n            type: \"dark\",\n            variant: \"info\",\n            fixed: \"top\",\n            sticky: \"\"\n          }\n        },\n        [\n          _c(\"b-navbar-brand\", { attrs: { href: \"#\" } }, [_vm._v(\"Admin\")]),\n          _c(\"b-navbar-toggle\", { attrs: { target: \"nav-collapse\" } }),\n          _c(\n            \"b-collapse\",\n            { attrs: { id: \"nav-collapse\", \"is-nav\": \"\" } },\n            [\n              _c(\n                \"b-navbar-nav\",\n                {},\n                [\n                  _c(\"b-nav-item\", { attrs: { to: \"serverlet\" } }, [\n                    _vm._v(\"系统设置\")\n                  ]),\n                  _c(\"b-nav-item\", { attrs: { to: \"logout\" } }, [\n                    _vm._v(\"注销\")\n                  ])\n                ],\n                1\n              )\n            ],\n            1\n          )\n        ],\n        1\n      )\n    ],\n    1\n  )\n}\nvar staticRenderFns = []\nrender._withStripped = true\n\n\n\n//# sourceURL=webpack:///./src/setting/menu.vue?./node_modules/cache-loader/dist/cjs.js?%7B%22cacheDirectory%22:%22node_modules/.cache/vue-loader%22,%22cacheIdentifier%22:%2268eff738-vue-loader-template%22%7D!./node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!./node_modules/cache-loader/dist/cjs.js??ref--0-0!./node_modules/vue-loader/lib??vue-loader-options");

/***/ }),

/***/ "./node_modules/cache-loader/dist/cjs.js?{\"cacheDirectory\":\"node_modules/.cache/vue-loader\",\"cacheIdentifier\":\"68eff738-vue-loader-template\"}!./node_modules/vue-loader/lib/loaders/templateLoader.js?!./node_modules/cache-loader/dist/cjs.js?!./node_modules/vue-loader/lib/index.js?!./src/setting/serverlet.vue?vue&type=template&id=1b46b7f0&":
/*!***********************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/cache-loader/dist/cjs.js?{"cacheDirectory":"node_modules/.cache/vue-loader","cacheIdentifier":"68eff738-vue-loader-template"}!./node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!./node_modules/cache-loader/dist/cjs.js??ref--0-0!./node_modules/vue-loader/lib??vue-loader-options!./src/setting/serverlet.vue?vue&type=template&id=1b46b7f0& ***!
  \***********************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/*! exports provided: render, staticRenderFns */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"render\", function() { return render; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"staticRenderFns\", function() { return staticRenderFns; });\nvar render = function() {\n  var _vm = this\n  var _h = _vm.$createElement\n  var _c = _vm._self._c || _h\n  return _c(\n    \"b-form\",\n    [\n      _c(\n        \"b-tabs\",\n        [\n          _c(\n            \"b-tab\",\n            { attrs: { title: \"支付配置\" } },\n            [\n              _c(\"b\", [_vm._v(\"必须配置以下参数，否则充值提现都是测试版本\")]),\n              _c(\"p\"),\n              _c(\"label\", [_vm._v(\"下单接口\")]),\n              _c(\"b-form-input\", {\n                model: {\n                  value: _vm.luckyshopee.pay_url,\n                  callback: function($$v) {\n                    _vm.$set(_vm.luckyshopee, \"pay_url\", $$v)\n                  },\n                  expression: \"luckyshopee.pay_url\"\n                }\n              }),\n              _c(\"label\", [_vm._v(\"代付接口\")]),\n              _c(\"b-form-input\", {\n                model: {\n                  value: _vm.luckyshopee.withdraw_url,\n                  callback: function($$v) {\n                    _vm.$set(_vm.luckyshopee, \"withdraw_url\", $$v)\n                  },\n                  expression: \"luckyshopee.withdraw_url\"\n                }\n              }),\n              _c(\"label\", [_vm._v(\"代付检查接口\")]),\n              _c(\"b-form-input\", {\n                model: {\n                  value: _vm.luckyshopee.check_withdraw_url,\n                  callback: function($$v) {\n                    _vm.$set(_vm.luckyshopee, \"check_withdraw_url\", $$v)\n                  },\n                  expression: \"luckyshopee.check_withdraw_url\"\n                }\n              }),\n              _c(\"label\", [_vm._v(\"可用资金接口\")]),\n              _c(\"b-form-input\", {\n                model: {\n                  value: _vm.luckyshopee.check_fund_url,\n                  callback: function($$v) {\n                    _vm.$set(_vm.luckyshopee, \"check_fund_url\", $$v)\n                  },\n                  expression: \"luckyshopee.check_fund_url\"\n                }\n              }),\n              _c(\"label\", [_vm._v(\"短信接口\")]),\n              _c(\"b-form-input\", {\n                model: {\n                  value: _vm.luckyshopee.sms_url,\n                  callback: function($$v) {\n                    _vm.$set(_vm.luckyshopee, \"sms_url\", $$v)\n                  },\n                  expression: \"luckyshopee.sms_url\"\n                }\n              }),\n              _c(\"label\", [_vm._v(\"appId\")]),\n              _c(\"b-form-input\", {\n                model: {\n                  value: _vm.luckyshopee.appId,\n                  callback: function($$v) {\n                    _vm.$set(_vm.luckyshopee, \"appId\", $$v)\n                  },\n                  expression: \"luckyshopee.appId\"\n                }\n              }),\n              _c(\"label\", [_vm._v(\"appKey\")]),\n              _c(\"b-form-input\", {\n                model: {\n                  value: _vm.luckyshopee.appKey,\n                  callback: function($$v) {\n                    _vm.$set(_vm.luckyshopee, \"appKey\", $$v)\n                  },\n                  expression: \"luckyshopee.appKey\"\n                }\n              }),\n              _c(\"label\", [_vm._v(\"appChannel\")]),\n              _c(\"b-form-input\", {\n                model: {\n                  value: _vm.luckyshopee.appChannel,\n                  callback: function($$v) {\n                    _vm.$set(_vm.luckyshopee, \"appChannel\", $$v)\n                  },\n                  expression: \"luckyshopee.appChannel\"\n                }\n              })\n            ],\n            1\n          ),\n          _c(\n            \"b-tab\",\n            { attrs: { title: \"提款配置\" } },\n            [\n              _c(\n                \"b-form-group\",\n                { attrs: { label: \"下注抽水\" } },\n                [\n                  _c(\"b-form-input\", {\n                    attrs: { formatter: _vm.feeFormatter },\n                    model: {\n                      value: _vm.feeRate,\n                      callback: function($$v) {\n                        _vm.feeRate = $$v\n                      },\n                      expression: \"feeRate\"\n                    }\n                  })\n                ],\n                1\n              ),\n              _c(\n                \"b-form-group\",\n                {\n                  attrs: {\n                    label: \"取现抽水\",\n                    \"invalid-feedback\": \"格式: n%+d\",\n                    state: _vm.wfState\n                  }\n                },\n                [\n                  _c(\"b-form-input\", {\n                    attrs: { state: _vm.wfState },\n                    model: {\n                      value: _vm.withdrawFee,\n                      callback: function($$v) {\n                        _vm.withdrawFee = $$v\n                      },\n                      expression: \"withdrawFee\"\n                    }\n                  })\n                ],\n                1\n              )\n            ],\n            1\n          )\n        ],\n        1\n      ),\n      _c(\n        \"b-button\",\n        { attrs: { block: \"\", variant: \"info\" }, on: { click: _vm.submit } },\n        [_vm._v(\"Submit\")]\n      )\n    ],\n    1\n  )\n}\nvar staticRenderFns = []\nrender._withStripped = true\n\n\n\n//# sourceURL=webpack:///./src/setting/serverlet.vue?./node_modules/cache-loader/dist/cjs.js?%7B%22cacheDirectory%22:%22node_modules/.cache/vue-loader%22,%22cacheIdentifier%22:%2268eff738-vue-loader-template%22%7D!./node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!./node_modules/cache-loader/dist/cjs.js??ref--0-0!./node_modules/vue-loader/lib??vue-loader-options");

/***/ }),

/***/ "./src/setting/Admin.vue":
/*!*******************************!*\
  !*** ./src/setting/Admin.vue ***!
  \*******************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var _Admin_vue_vue_type_template_id_1e6b7fa7___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./Admin.vue?vue&type=template&id=1e6b7fa7& */ \"./src/setting/Admin.vue?vue&type=template&id=1e6b7fa7&\");\n/* harmony import */ var _Admin_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./Admin.vue?vue&type=script&lang=js& */ \"./src/setting/Admin.vue?vue&type=script&lang=js&\");\n/* empty/unused harmony star reexport *//* harmony import */ var _node_modules_vue_loader_lib_runtime_componentNormalizer_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../node_modules/vue-loader/lib/runtime/componentNormalizer.js */ \"./node_modules/vue-loader/lib/runtime/componentNormalizer.js\");\n\n\n\n\n\n/* normalize component */\n\nvar component = Object(_node_modules_vue_loader_lib_runtime_componentNormalizer_js__WEBPACK_IMPORTED_MODULE_2__[\"default\"])(\n  _Admin_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_1__[\"default\"],\n  _Admin_vue_vue_type_template_id_1e6b7fa7___WEBPACK_IMPORTED_MODULE_0__[\"render\"],\n  _Admin_vue_vue_type_template_id_1e6b7fa7___WEBPACK_IMPORTED_MODULE_0__[\"staticRenderFns\"],\n  false,\n  null,\n  null,\n  null\n  \n)\n\n/* hot reload */\nif (false) { var api; }\ncomponent.options.__file = \"src/setting/Admin.vue\"\n/* harmony default export */ __webpack_exports__[\"default\"] = (component.exports);\n\n//# sourceURL=webpack:///./src/setting/Admin.vue?");

/***/ }),

/***/ "./src/setting/Admin.vue?vue&type=script&lang=js&":
/*!********************************************************!*\
  !*** ./src/setting/Admin.vue?vue&type=script&lang=js& ***!
  \********************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var _node_modules_cache_loader_dist_cjs_js_ref_12_0_node_modules_babel_loader_lib_index_js_node_modules_cache_loader_dist_cjs_js_ref_0_0_node_modules_vue_loader_lib_index_js_vue_loader_options_Admin_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! -!../../node_modules/cache-loader/dist/cjs.js??ref--12-0!../../node_modules/babel-loader/lib!../../node_modules/cache-loader/dist/cjs.js??ref--0-0!../../node_modules/vue-loader/lib??vue-loader-options!./Admin.vue?vue&type=script&lang=js& */ \"./node_modules/cache-loader/dist/cjs.js?!./node_modules/babel-loader/lib/index.js!./node_modules/cache-loader/dist/cjs.js?!./node_modules/vue-loader/lib/index.js?!./src/setting/Admin.vue?vue&type=script&lang=js&\");\n/* empty/unused harmony star reexport */ /* harmony default export */ __webpack_exports__[\"default\"] = (_node_modules_cache_loader_dist_cjs_js_ref_12_0_node_modules_babel_loader_lib_index_js_node_modules_cache_loader_dist_cjs_js_ref_0_0_node_modules_vue_loader_lib_index_js_vue_loader_options_Admin_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_0__[\"default\"]); \n\n//# sourceURL=webpack:///./src/setting/Admin.vue?");

/***/ }),

/***/ "./src/setting/Admin.vue?vue&type=template&id=1e6b7fa7&":
/*!**************************************************************!*\
  !*** ./src/setting/Admin.vue?vue&type=template&id=1e6b7fa7& ***!
  \**************************************************************/
/*! exports provided: render, staticRenderFns */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var _node_modules_cache_loader_dist_cjs_js_cacheDirectory_node_modules_cache_vue_loader_cacheIdentifier_68eff738_vue_loader_template_node_modules_vue_loader_lib_loaders_templateLoader_js_vue_loader_options_node_modules_cache_loader_dist_cjs_js_ref_0_0_node_modules_vue_loader_lib_index_js_vue_loader_options_Admin_vue_vue_type_template_id_1e6b7fa7___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! -!../../node_modules/cache-loader/dist/cjs.js?{\"cacheDirectory\":\"node_modules/.cache/vue-loader\",\"cacheIdentifier\":\"68eff738-vue-loader-template\"}!../../node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!../../node_modules/cache-loader/dist/cjs.js??ref--0-0!../../node_modules/vue-loader/lib??vue-loader-options!./Admin.vue?vue&type=template&id=1e6b7fa7& */ \"./node_modules/cache-loader/dist/cjs.js?{\\\"cacheDirectory\\\":\\\"node_modules/.cache/vue-loader\\\",\\\"cacheIdentifier\\\":\\\"68eff738-vue-loader-template\\\"}!./node_modules/vue-loader/lib/loaders/templateLoader.js?!./node_modules/cache-loader/dist/cjs.js?!./node_modules/vue-loader/lib/index.js?!./src/setting/Admin.vue?vue&type=template&id=1e6b7fa7&\");\n/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, \"render\", function() { return _node_modules_cache_loader_dist_cjs_js_cacheDirectory_node_modules_cache_vue_loader_cacheIdentifier_68eff738_vue_loader_template_node_modules_vue_loader_lib_loaders_templateLoader_js_vue_loader_options_node_modules_cache_loader_dist_cjs_js_ref_0_0_node_modules_vue_loader_lib_index_js_vue_loader_options_Admin_vue_vue_type_template_id_1e6b7fa7___WEBPACK_IMPORTED_MODULE_0__[\"render\"]; });\n\n/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, \"staticRenderFns\", function() { return _node_modules_cache_loader_dist_cjs_js_cacheDirectory_node_modules_cache_vue_loader_cacheIdentifier_68eff738_vue_loader_template_node_modules_vue_loader_lib_loaders_templateLoader_js_vue_loader_options_node_modules_cache_loader_dist_cjs_js_ref_0_0_node_modules_vue_loader_lib_index_js_vue_loader_options_Admin_vue_vue_type_template_id_1e6b7fa7___WEBPACK_IMPORTED_MODULE_0__[\"staticRenderFns\"]; });\n\n\n\n//# sourceURL=webpack:///./src/setting/Admin.vue?");

/***/ }),

/***/ "./src/setting/main.js":
/*!*****************************!*\
  !*** ./src/setting/main.js ***!
  \*****************************/
/*! no exports provided */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var _Users_bacc_projects_winGo_India_app_node_modules_core_js_modules_es_array_iterator_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./node_modules/core-js/modules/es.array.iterator.js */ \"./node_modules/core-js/modules/es.array.iterator.js\");\n/* harmony import */ var _Users_bacc_projects_winGo_India_app_node_modules_core_js_modules_es_array_iterator_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_Users_bacc_projects_winGo_India_app_node_modules_core_js_modules_es_array_iterator_js__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var _Users_bacc_projects_winGo_India_app_node_modules_core_js_modules_es_promise_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./node_modules/core-js/modules/es.promise.js */ \"./node_modules/core-js/modules/es.promise.js\");\n/* harmony import */ var _Users_bacc_projects_winGo_India_app_node_modules_core_js_modules_es_promise_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_Users_bacc_projects_winGo_India_app_node_modules_core_js_modules_es_promise_js__WEBPACK_IMPORTED_MODULE_1__);\n/* harmony import */ var _Users_bacc_projects_winGo_India_app_node_modules_core_js_modules_es_object_assign_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./node_modules/core-js/modules/es.object.assign.js */ \"./node_modules/core-js/modules/es.object.assign.js\");\n/* harmony import */ var _Users_bacc_projects_winGo_India_app_node_modules_core_js_modules_es_object_assign_js__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_Users_bacc_projects_winGo_India_app_node_modules_core_js_modules_es_object_assign_js__WEBPACK_IMPORTED_MODULE_2__);\n/* harmony import */ var _Users_bacc_projects_winGo_India_app_node_modules_core_js_modules_es_promise_finally_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./node_modules/core-js/modules/es.promise.finally.js */ \"./node_modules/core-js/modules/es.promise.finally.js\");\n/* harmony import */ var _Users_bacc_projects_winGo_India_app_node_modules_core_js_modules_es_promise_finally_js__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_Users_bacc_projects_winGo_India_app_node_modules_core_js_modules_es_promise_finally_js__WEBPACK_IMPORTED_MODULE_3__);\n/* harmony import */ var vue__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! vue */ \"./node_modules/vue/dist/vue.runtime.esm.js\");\n/* harmony import */ var vue_router__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! vue-router */ \"./node_modules/vue-router/dist/vue-router.esm.js\");\n/* harmony import */ var vuex__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! vuex */ \"./node_modules/vuex/dist/vuex.esm.js\");\n/* harmony import */ var bootstrap_vue__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! bootstrap-vue */ \"./node_modules/bootstrap-vue/esm/index.js\");\n/* harmony import */ var bootstrap_dist_css_bootstrap_css__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! bootstrap/dist/css/bootstrap.css */ \"./node_modules/bootstrap/dist/css/bootstrap.css\");\n/* harmony import */ var bootstrap_dist_css_bootstrap_css__WEBPACK_IMPORTED_MODULE_8___default = /*#__PURE__*/__webpack_require__.n(bootstrap_dist_css_bootstrap_css__WEBPACK_IMPORTED_MODULE_8__);\n/* harmony import */ var bootstrap_vue_dist_bootstrap_vue_css__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! bootstrap-vue/dist/bootstrap-vue.css */ \"./node_modules/bootstrap-vue/dist/bootstrap-vue.css\");\n/* harmony import */ var bootstrap_vue_dist_bootstrap_vue_css__WEBPACK_IMPORTED_MODULE_9___default = /*#__PURE__*/__webpack_require__.n(bootstrap_vue_dist_bootstrap_vue_css__WEBPACK_IMPORTED_MODULE_9__);\n/* harmony import */ var _Admin_vue__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ./Admin.vue */ \"./src/setting/Admin.vue\");\n/* harmony import */ var _router__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ./router */ \"./src/setting/router.js\");\n\n\n\n\n\n\n\n\n\n\nvue__WEBPACK_IMPORTED_MODULE_4__[\"default\"].use(vue_router__WEBPACK_IMPORTED_MODULE_5__[\"default\"]); // Install BootstrapVue\n\nvue__WEBPACK_IMPORTED_MODULE_4__[\"default\"].use(bootstrap_vue__WEBPACK_IMPORTED_MODULE_7__[\"BootstrapVue\"]); // Optionally install the BootstrapVue icon components plugin\n\nvue__WEBPACK_IMPORTED_MODULE_4__[\"default\"].component('BIcon', bootstrap_vue__WEBPACK_IMPORTED_MODULE_7__[\"BIcon\"]);\nvue__WEBPACK_IMPORTED_MODULE_4__[\"default\"].component('BIconChevronRight', bootstrap_vue__WEBPACK_IMPORTED_MODULE_7__[\"BIconChevronRight\"]);\nvue__WEBPACK_IMPORTED_MODULE_4__[\"default\"].component('BIconChevronLeft', bootstrap_vue__WEBPACK_IMPORTED_MODULE_7__[\"BIconChevronLeft\"]);\nvue__WEBPACK_IMPORTED_MODULE_4__[\"default\"].component('BIconBoxArrowInLeft', bootstrap_vue__WEBPACK_IMPORTED_MODULE_7__[\"BIconBoxArrowInLeft\"]);\nvue__WEBPACK_IMPORTED_MODULE_4__[\"default\"].use(vuex__WEBPACK_IMPORTED_MODULE_6__[\"default\"]);\n\nvue__WEBPACK_IMPORTED_MODULE_4__[\"default\"].config.productionTip = false;\nvar store = new vuex__WEBPACK_IMPORTED_MODULE_6__[\"default\"].Store({\n  state: {\n    me: {\n      balance: null,\n      id: null,\n      paytm_id: null\n    },\n    countdown: null,\n    period: null,\n    history: [],\n    // [{period:'20200708001', price:11978}]\n    orders: [],\n    //   {_id:'5e367cd897', betting:30, select:7, fee:3, time:new Date(), game:{period:'202007081001', price:null, endtime:new Date()}},\n    //   {_id:'5e367cd898', betting:10, select:'Green', fee:1, time:new Date(), game:{period:'202007081002', price:0, endtime:new Date()}},\n    //   {_id:'5e367cd899', betting:10, select:'Green', fee:1, time:new Date(), game:{period:'202007081002', price:1, endtime:new Date()}}\n    // ]\n    status: null\n  },\n  mutations: {\n    countdown: function countdown(state) {\n      if (state.countdown > 0) state.countdown--;\n      if (state.countdown <= 30) state.status = 'stop_betting';\n    }\n  }\n});\nsetInterval(function () {\n  store.commit('countdown');\n}, 1000);\n\nwindow.v = new vue__WEBPACK_IMPORTED_MODULE_4__[\"default\"]({\n  router: _router__WEBPACK_IMPORTED_MODULE_11__[\"router\"],\n  el: '#app',\n  store: store,\n  $eventBus: new vue__WEBPACK_IMPORTED_MODULE_4__[\"default\"](),\n  render: function render(h) {\n    return h(_Admin_vue__WEBPACK_IMPORTED_MODULE_10__[\"default\"]);\n  } // components:{Admin}\n  // render: h=>h(signup),\n\n});\n\n//# sourceURL=webpack:///./src/setting/main.js?");

/***/ }),

/***/ "./src/setting/menu.vue":
/*!******************************!*\
  !*** ./src/setting/menu.vue ***!
  \******************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var _menu_vue_vue_type_template_id_7f7b29d2___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./menu.vue?vue&type=template&id=7f7b29d2& */ \"./src/setting/menu.vue?vue&type=template&id=7f7b29d2&\");\n/* harmony import */ var _menu_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./menu.vue?vue&type=script&lang=js& */ \"./src/setting/menu.vue?vue&type=script&lang=js&\");\n/* empty/unused harmony star reexport *//* harmony import */ var _node_modules_vue_loader_lib_runtime_componentNormalizer_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../node_modules/vue-loader/lib/runtime/componentNormalizer.js */ \"./node_modules/vue-loader/lib/runtime/componentNormalizer.js\");\n\n\n\n\n\n/* normalize component */\n\nvar component = Object(_node_modules_vue_loader_lib_runtime_componentNormalizer_js__WEBPACK_IMPORTED_MODULE_2__[\"default\"])(\n  _menu_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_1__[\"default\"],\n  _menu_vue_vue_type_template_id_7f7b29d2___WEBPACK_IMPORTED_MODULE_0__[\"render\"],\n  _menu_vue_vue_type_template_id_7f7b29d2___WEBPACK_IMPORTED_MODULE_0__[\"staticRenderFns\"],\n  false,\n  null,\n  null,\n  null\n  \n)\n\n/* hot reload */\nif (false) { var api; }\ncomponent.options.__file = \"src/setting/menu.vue\"\n/* harmony default export */ __webpack_exports__[\"default\"] = (component.exports);\n\n//# sourceURL=webpack:///./src/setting/menu.vue?");

/***/ }),

/***/ "./src/setting/menu.vue?vue&type=script&lang=js&":
/*!*******************************************************!*\
  !*** ./src/setting/menu.vue?vue&type=script&lang=js& ***!
  \*******************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var _node_modules_cache_loader_dist_cjs_js_ref_12_0_node_modules_babel_loader_lib_index_js_node_modules_cache_loader_dist_cjs_js_ref_0_0_node_modules_vue_loader_lib_index_js_vue_loader_options_menu_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! -!../../node_modules/cache-loader/dist/cjs.js??ref--12-0!../../node_modules/babel-loader/lib!../../node_modules/cache-loader/dist/cjs.js??ref--0-0!../../node_modules/vue-loader/lib??vue-loader-options!./menu.vue?vue&type=script&lang=js& */ \"./node_modules/cache-loader/dist/cjs.js?!./node_modules/babel-loader/lib/index.js!./node_modules/cache-loader/dist/cjs.js?!./node_modules/vue-loader/lib/index.js?!./src/setting/menu.vue?vue&type=script&lang=js&\");\n/* empty/unused harmony star reexport */ /* harmony default export */ __webpack_exports__[\"default\"] = (_node_modules_cache_loader_dist_cjs_js_ref_12_0_node_modules_babel_loader_lib_index_js_node_modules_cache_loader_dist_cjs_js_ref_0_0_node_modules_vue_loader_lib_index_js_vue_loader_options_menu_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_0__[\"default\"]); \n\n//# sourceURL=webpack:///./src/setting/menu.vue?");

/***/ }),

/***/ "./src/setting/menu.vue?vue&type=template&id=7f7b29d2&":
/*!*************************************************************!*\
  !*** ./src/setting/menu.vue?vue&type=template&id=7f7b29d2& ***!
  \*************************************************************/
/*! exports provided: render, staticRenderFns */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var _node_modules_cache_loader_dist_cjs_js_cacheDirectory_node_modules_cache_vue_loader_cacheIdentifier_68eff738_vue_loader_template_node_modules_vue_loader_lib_loaders_templateLoader_js_vue_loader_options_node_modules_cache_loader_dist_cjs_js_ref_0_0_node_modules_vue_loader_lib_index_js_vue_loader_options_menu_vue_vue_type_template_id_7f7b29d2___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! -!../../node_modules/cache-loader/dist/cjs.js?{\"cacheDirectory\":\"node_modules/.cache/vue-loader\",\"cacheIdentifier\":\"68eff738-vue-loader-template\"}!../../node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!../../node_modules/cache-loader/dist/cjs.js??ref--0-0!../../node_modules/vue-loader/lib??vue-loader-options!./menu.vue?vue&type=template&id=7f7b29d2& */ \"./node_modules/cache-loader/dist/cjs.js?{\\\"cacheDirectory\\\":\\\"node_modules/.cache/vue-loader\\\",\\\"cacheIdentifier\\\":\\\"68eff738-vue-loader-template\\\"}!./node_modules/vue-loader/lib/loaders/templateLoader.js?!./node_modules/cache-loader/dist/cjs.js?!./node_modules/vue-loader/lib/index.js?!./src/setting/menu.vue?vue&type=template&id=7f7b29d2&\");\n/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, \"render\", function() { return _node_modules_cache_loader_dist_cjs_js_cacheDirectory_node_modules_cache_vue_loader_cacheIdentifier_68eff738_vue_loader_template_node_modules_vue_loader_lib_loaders_templateLoader_js_vue_loader_options_node_modules_cache_loader_dist_cjs_js_ref_0_0_node_modules_vue_loader_lib_index_js_vue_loader_options_menu_vue_vue_type_template_id_7f7b29d2___WEBPACK_IMPORTED_MODULE_0__[\"render\"]; });\n\n/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, \"staticRenderFns\", function() { return _node_modules_cache_loader_dist_cjs_js_cacheDirectory_node_modules_cache_vue_loader_cacheIdentifier_68eff738_vue_loader_template_node_modules_vue_loader_lib_loaders_templateLoader_js_vue_loader_options_node_modules_cache_loader_dist_cjs_js_ref_0_0_node_modules_vue_loader_lib_index_js_vue_loader_options_menu_vue_vue_type_template_id_7f7b29d2___WEBPACK_IMPORTED_MODULE_0__[\"staticRenderFns\"]; });\n\n\n\n//# sourceURL=webpack:///./src/setting/menu.vue?");

/***/ }),

/***/ "./src/setting/router.js":
/*!*******************************!*\
  !*** ./src/setting/router.js ***!
  \*******************************/
/*! exports provided: router */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"router\", function() { return router; });\n/* harmony import */ var vue_router__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! vue-router */ \"./node_modules/vue-router/dist/vue-router.esm.js\");\n/* harmony import */ var _client__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../client */ \"./src/client.js\");\n/* harmony import */ var _serverlet_vue__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./serverlet.vue */ \"./src/setting/serverlet.vue\");\n/* harmony import */ var _admin_login_vue__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../admin/login.vue */ \"./src/admin/login.vue\");\n/* harmony import */ var _admin_auth__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../admin/auth */ \"./src/admin/auth.js\");\n\n\n\n\n\n\nfunction requireAuth(to, from, next) {\n  var r = _admin_auth__WEBPACK_IMPORTED_MODULE_4__[\"default\"].loggedIn();\n\n  if (!r) {\n    next({\n      path: '/login',\n      query: {\n        redirect: to.fullPath\n      }\n    });\n  } else {\n    next();\n  }\n}\n\nvar router = new vue_router__WEBPACK_IMPORTED_MODULE_0__[\"default\"]({\n  routes: [{\n    path: '/',\n    component: _serverlet_vue__WEBPACK_IMPORTED_MODULE_2__[\"default\"],\n    beforeEnter: requireAuth\n  }, {\n    path: '/serverlet',\n    component: _serverlet_vue__WEBPACK_IMPORTED_MODULE_2__[\"default\"],\n    beforeEnter: requireAuth\n  }, {\n    path: '/login',\n    component: _admin_login_vue__WEBPACK_IMPORTED_MODULE_3__[\"default\"]\n  }, {\n    path: '/logout',\n    beforeEnter: function beforeEnter(to, from, next) {\n      _admin_auth__WEBPACK_IMPORTED_MODULE_4__[\"default\"].logout();\n      next('/');\n    }\n  } // {path:'*', component:\"<template><p>error</p></template>\"}\n  ]\n});\nrouter.onReady(function () {\n  relogin();\n});\nvar sock = Object(_admin_auth__WEBPACK_IMPORTED_MODULE_4__[\"openLink\"])();\n\nfunction relogin() {// if (localStorage.adminAccount && localStorage.adminToken) {\n  // \tsock.emit('login', {phone:localStorage.adminAccount, t:localStorage.adminToken}, (err)=>{\n  // \t\tif (err) {\n  // \t\t\tlocalStorage.adminAccount=undefined;\n  // \t\t\tlocalStorage.adminToken=undefined;\n  // \t\t\tsock.isLogined=undefined;\n  // \t\t\trouter.push('/login');\n  // \t\t} else {\n  // \t\t\trouter.push(router.currentRoute);\n  // \t\t}\n  // \t});\n  // } else router.push('/login');\n}\n\n_client__WEBPACK_IMPORTED_MODULE_1__[\"eventBus\"].$on('relogin', relogin);\n_client__WEBPACK_IMPORTED_MODULE_1__[\"eventBus\"].$on('kicked', function (str) {\n  localStorage.adminAccount = undefined;\n  localStorage.adminToken = undefined;\n  sock.isLogined = undefined;\n  alert(str);\n  router.push('/login');\n});\n\n\n//# sourceURL=webpack:///./src/setting/router.js?");

/***/ }),

/***/ "./src/setting/serverlet.vue":
/*!***********************************!*\
  !*** ./src/setting/serverlet.vue ***!
  \***********************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var _serverlet_vue_vue_type_template_id_1b46b7f0___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./serverlet.vue?vue&type=template&id=1b46b7f0& */ \"./src/setting/serverlet.vue?vue&type=template&id=1b46b7f0&\");\n/* harmony import */ var _serverlet_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./serverlet.vue?vue&type=script&lang=js& */ \"./src/setting/serverlet.vue?vue&type=script&lang=js&\");\n/* empty/unused harmony star reexport *//* harmony import */ var _node_modules_vue_loader_lib_runtime_componentNormalizer_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../node_modules/vue-loader/lib/runtime/componentNormalizer.js */ \"./node_modules/vue-loader/lib/runtime/componentNormalizer.js\");\n\n\n\n\n\n/* normalize component */\n\nvar component = Object(_node_modules_vue_loader_lib_runtime_componentNormalizer_js__WEBPACK_IMPORTED_MODULE_2__[\"default\"])(\n  _serverlet_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_1__[\"default\"],\n  _serverlet_vue_vue_type_template_id_1b46b7f0___WEBPACK_IMPORTED_MODULE_0__[\"render\"],\n  _serverlet_vue_vue_type_template_id_1b46b7f0___WEBPACK_IMPORTED_MODULE_0__[\"staticRenderFns\"],\n  false,\n  null,\n  null,\n  null\n  \n)\n\n/* hot reload */\nif (false) { var api; }\ncomponent.options.__file = \"src/setting/serverlet.vue\"\n/* harmony default export */ __webpack_exports__[\"default\"] = (component.exports);\n\n//# sourceURL=webpack:///./src/setting/serverlet.vue?");

/***/ }),

/***/ "./src/setting/serverlet.vue?vue&type=script&lang=js&":
/*!************************************************************!*\
  !*** ./src/setting/serverlet.vue?vue&type=script&lang=js& ***!
  \************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var _node_modules_cache_loader_dist_cjs_js_ref_12_0_node_modules_babel_loader_lib_index_js_node_modules_cache_loader_dist_cjs_js_ref_0_0_node_modules_vue_loader_lib_index_js_vue_loader_options_serverlet_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! -!../../node_modules/cache-loader/dist/cjs.js??ref--12-0!../../node_modules/babel-loader/lib!../../node_modules/cache-loader/dist/cjs.js??ref--0-0!../../node_modules/vue-loader/lib??vue-loader-options!./serverlet.vue?vue&type=script&lang=js& */ \"./node_modules/cache-loader/dist/cjs.js?!./node_modules/babel-loader/lib/index.js!./node_modules/cache-loader/dist/cjs.js?!./node_modules/vue-loader/lib/index.js?!./src/setting/serverlet.vue?vue&type=script&lang=js&\");\n/* empty/unused harmony star reexport */ /* harmony default export */ __webpack_exports__[\"default\"] = (_node_modules_cache_loader_dist_cjs_js_ref_12_0_node_modules_babel_loader_lib_index_js_node_modules_cache_loader_dist_cjs_js_ref_0_0_node_modules_vue_loader_lib_index_js_vue_loader_options_serverlet_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_0__[\"default\"]); \n\n//# sourceURL=webpack:///./src/setting/serverlet.vue?");

/***/ }),

/***/ "./src/setting/serverlet.vue?vue&type=template&id=1b46b7f0&":
/*!******************************************************************!*\
  !*** ./src/setting/serverlet.vue?vue&type=template&id=1b46b7f0& ***!
  \******************************************************************/
/*! exports provided: render, staticRenderFns */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var _node_modules_cache_loader_dist_cjs_js_cacheDirectory_node_modules_cache_vue_loader_cacheIdentifier_68eff738_vue_loader_template_node_modules_vue_loader_lib_loaders_templateLoader_js_vue_loader_options_node_modules_cache_loader_dist_cjs_js_ref_0_0_node_modules_vue_loader_lib_index_js_vue_loader_options_serverlet_vue_vue_type_template_id_1b46b7f0___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! -!../../node_modules/cache-loader/dist/cjs.js?{\"cacheDirectory\":\"node_modules/.cache/vue-loader\",\"cacheIdentifier\":\"68eff738-vue-loader-template\"}!../../node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!../../node_modules/cache-loader/dist/cjs.js??ref--0-0!../../node_modules/vue-loader/lib??vue-loader-options!./serverlet.vue?vue&type=template&id=1b46b7f0& */ \"./node_modules/cache-loader/dist/cjs.js?{\\\"cacheDirectory\\\":\\\"node_modules/.cache/vue-loader\\\",\\\"cacheIdentifier\\\":\\\"68eff738-vue-loader-template\\\"}!./node_modules/vue-loader/lib/loaders/templateLoader.js?!./node_modules/cache-loader/dist/cjs.js?!./node_modules/vue-loader/lib/index.js?!./src/setting/serverlet.vue?vue&type=template&id=1b46b7f0&\");\n/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, \"render\", function() { return _node_modules_cache_loader_dist_cjs_js_cacheDirectory_node_modules_cache_vue_loader_cacheIdentifier_68eff738_vue_loader_template_node_modules_vue_loader_lib_loaders_templateLoader_js_vue_loader_options_node_modules_cache_loader_dist_cjs_js_ref_0_0_node_modules_vue_loader_lib_index_js_vue_loader_options_serverlet_vue_vue_type_template_id_1b46b7f0___WEBPACK_IMPORTED_MODULE_0__[\"render\"]; });\n\n/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, \"staticRenderFns\", function() { return _node_modules_cache_loader_dist_cjs_js_cacheDirectory_node_modules_cache_vue_loader_cacheIdentifier_68eff738_vue_loader_template_node_modules_vue_loader_lib_loaders_templateLoader_js_vue_loader_options_node_modules_cache_loader_dist_cjs_js_ref_0_0_node_modules_vue_loader_lib_index_js_vue_loader_options_serverlet_vue_vue_type_template_id_1b46b7f0___WEBPACK_IMPORTED_MODULE_0__[\"staticRenderFns\"]; });\n\n\n\n//# sourceURL=webpack:///./src/setting/serverlet.vue?");

/***/ }),

/***/ 3:
/*!***********************************!*\
  !*** multi ./src/setting/main.js ***!
  \***********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

eval("module.exports = __webpack_require__(/*! /Users/bacc/projects/winGo.India/app/src/setting/main.js */\"./src/setting/main.js\");\n\n\n//# sourceURL=webpack:///multi_./src/setting/main.js?");

/***/ })

/******/ });