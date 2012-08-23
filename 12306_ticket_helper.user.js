
// ==UserScript==
// @name 			12306.CN 订票助手 For Firefox&Chrome
// @namespace		http://www.u-tide.com/fish/
// @description		帮你订票的小助手 :-)
// @match			http://dynamic.12306.cn/otsweb/*
// @match			https://dynamic.12306.cn/otsweb/*
// @require			https://ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min.js
// @icon			http://www.12306.cn/mormhweb/images/favicon.ico
// @run-at			document-idle
// @version 		3.0.6
// @updateURL		http://www.fishlee.net/Service/Download.ashx/44/47/12306_ticket_helper.user.js
// @supportURL		http://www.fishlee.net/soft/44/
// @homepage		http://www.fishlee.net/soft/44/
// ==/UserScript==







if (typeof (WScript) != 'undefined') {
	var obj = WScript.CreateObject("WScript.Shell");
	obj.Popup("请将脚本文件拖放至谷歌浏览器的扩展管理或Firefox中安装，请勿双击。\r\n拖放到谷歌浏览器中无法安装时，请尝试在chrome中打开扩展管理界面后，再拖放至扩展管理界面中。", 0, "警告", 64);
	throw new Error();
}


var version = "3.0.6";
var loginUrl = "/otsweb/loginAction.do";
var queryActionUrl = "/otsweb/order/querySingleAction.do";
//预定
var confirmOrderUrl = "/otsweb/order/confirmPassengerAction.do";


//#region -----------------UI界面--------------------------

function initUIDisplay() {
	injectStyle();
}

/**
 * 将使用的样式加入到当前页面中
 */
function injectStyle() {
	var s = document.createElement("style");
	s.id = "12306_ticket_helper";
	s.type = "text/css";
	s.textContent = ".fish_running, .fish_clock, .fish_error, .fish_ok {\
    line-height:20px;\
    text-indent:18px;\
    background-repeat:no-repeat;\
    background-position:2px 50%;\
    font-size:12px;\
    }\
    .fish_running{background-image:url(data:image/gif;base64,R0lGODlhEAAQALMPAHp6evf394qKiry8vJOTk83NzYKCgubm5t7e3qysrMXFxe7u7pubm7S0tKOjo////yH/C05FVFNDQVBFMi4wAwEAAAAh+QQJCAAPACwAAAAAEAAQAAAETPDJSau9NRDAgWxDYGmdZADCkQnlU7CCOA3oNgXsQG2FRhUAAoWDIU6MGeSDR0m4ghRa7JjIUXCogqQzpRxYhi2HILsOGuJxGcNuTyIAIfkECQgADwAsAAAAABAAEAAABGLwSXmMmjhLAQjSWDAYQHmAz8GVQPIESxZwggIYS0AIATYAvAdh8OIQJwRAQbJkdjAlUCA6KfU0VEmyGWgWnpNfcEAoAo6SmWtBUtCuk9gjwQKeQAeWYQAHIZICKBoKBncTEQAh+QQJCAAPACwAAAAAEAAQAAAEWvDJORejGCtQsgwDAQAGGWSHMK7jgAWq0CGj0VEDIJxPnvAU0a13eAQKrsnI81gqAZ6AUzIonA7JRwFAyAQSgCQsjCmUAIhjDEhlrQTFV+lMGLApWwUzw1jsIwAh+QQJCAAPACwAAAAAEAAQAAAETvDJSau9L4QaBgEAMWgEQh0CqALCZ0pBKhRSkYLvM7Ab/OGThoE2+QExyAdiuexhVglKwdCgqKKTGGBgBc00Np7VcVsJDpVo5ydyJt/wCAAh+QQJCAAPACwAAAAAEAAQAAAEWvDJSau9OAwCABnBtQhdCQjHlQhFWJBCOKWPLAXk8KQIkCwWBcAgMDw4Q5CkgOwohCVCYTIwdAgPolVhWSQAiN1jcLLVQrQbrBV4EcySA8l0Alo0yA8cw+9TIgAh+QQFCAAPACwAAAAAEAAQAAAEWvDJSau9WA4AyAhWMChPwXHCQRUGYARgKQBCzJxAQgXzIC2KFkc1MREoHMTAhwQ0Y5oBgkMhAAqUw8mgWGho0EcCx5DwaAUQrGXATg6zE7bwCQ2sAGZmz7dEAAA7); color: green;}\
    .fish_clock{background-image:url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABGdBTUEAAK/INwWK6QAAABl0RVh0U29mdHdhcmUAQWRvYmUgSW1hZ2VSZWFkeXHJZTwAAAG/SURBVHjapJM/S8NQFMVvpaVfoEKojWL9U3DLIqjoooJDu/sFmnQoiIujQz+Aix3a1FUQXIR2UFA6+WeRUhBprERroGTopg6lSeo7iY1pq4sNHPpy3+8c7n0v9XW7XRrl8SFAlmVvbYFpmynOJHzXKkwlphOmxx4oiiL5sbAsi1KpFOVyuWQwGMzEYjEuGo0Sx3E2qOu6oKqqoChKst1u7zO2wNifDrLZLNbJUCgkLy2vEM/zv7araRrd3lxTq9US2WshnU7TGDZM01zwBwKZxaVlCkd4MtmxQDXlyVbvHXtgwMIDrx3Q6XS2Z2bnufDEJJkWuWIt2/LWwICFxw0wDCM+PTPXB0K4IGiwDhYeeP3fHQjjXIQMq3/mev3J/l0fqIOFxxtAxi+fg/rsBOztSE7QVpwpQT2PN6Dy1mgIYX7KNZcvipQ5yA+Fosum1rA93jMo1R6q7oxX50Va20wMzd4TWHi8t3BSvb/T1bpz4qsbf5vBgIXHDWB3+vj58b5fPj9jc9fcex8U9sCAhcc7Au1mDgtN7VU8Oz7SL0un9PbyTBYzQVijhj0wYOFxP2VJkv71Z8rn807AKM+XAAMArp1CsEFrDIIAAAAASUVORK5CYII=); color: blue;}\
    .fish_error{background-image:url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABGdBTUEAAK/INwWK6QAAABl0RVh0U29mdHdhcmUAQWRvYmUgSW1hZ2VSZWFkeXHJZTwAAAJFSURBVHjapJO/T1pRFMe/Dx7ypEXri4lUGUhsHF40hODSpQ61cTH+2HSoZaF1dHSxpU7+Ca04NE7dyuBiapcuLFokTdD4A01awNdBSkAf8ut5zhUoxq3e5OS+nPv5nnvuyfdJpmniPksSBd68aM1pFDMU4xS+ei5GsUHxmSLRJD9+hcx7rVqFZWwMtc3NIGy2Zam31yX19ABdXTdgNuszdd1nptNBlMtviQ0TC0ujg1LgGWNByelctQ4M4G8qhfN4HLmDA6HvpJzq9eJRXx+qlDPz+deUDrd9+i6KoFouazVg2erx4M/uLn5FItGLk5NX/qUliYO+I2o2C4vLBWaYZQ1rRYFyqTQDVXXl02mcb29HbXb7S+/CwjqKRSAaDXlHRqYwOoqdxUUww6zQNApUSqVxuaMDF8kk2hTlgxYIHMMwaHSxEB2/a4g7u7sjzDDLmn8dXF35ZJsNVWrzycTEOtxuYH//lpjWezqbZoZZ1rQ+AXyj3eEQO7a27oj9s7OhVkZoWjqIFXUdD1QVub29L3fEk5MhXF7y2RwzzLKmdQYb+UwGiqLwO6duiVdWxM2GrvfTfOaZYZY1TScmvE7NKsvf3B6PyzE8jB9ra6DJR2TTnBYXSNIcbfN021Mjl8Pv09OzaqXyXIvnE6LAT00RRlLa21cfk1kesgNpULBab5xITiUHokADzJDJioYhjDSUKNafUKlgaHAwXCCHJQ8Pz1JHRyhQm2RhEfzNOT5jhlnWNJ+w0y/918/kPzbrf+M91rUAAwCuQDz94e2kLwAAAABJRU5ErkJggg==); color: blue;}\
    .fish_ok{background-image:url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABGdBTUEAAK/INwWK6QAAABl0RVh0U29mdHdhcmUAQWRvYmUgSW1hZ2VSZWFkeXHJZTwAAAHsSURBVHjapFNBSBtBFH2xgoqmKipEC6XkYqhUWXOxUAQhpyJ4Wgi0l0rNsdBbL/WgF2/eV8hNSBF68uhFkOrFhCAGS8mWgmYjG9lCKVGTuP1vsrvuIac68HZm/n/vz5/9fyKu6+IhI8IA5k4kbHsuSAsWBZpnKwh2BTlBySfGdTmcAX7kOJc5r5hfhyw7/86t21/EVVbgmjb6yPG4SqsyONtWGaz0Dk8aYzMf0R+b65ju3+oR7OImrp3vGdluJd646KKj1ZK0H0XXRqfeo390Emg6HUEfOeQqjQwVoNFAOvpkPjYw8kw2NRgfFtQchm8jh1xqggDNJhYHY3Jy41IhmXodrDvZyKWG2m4vA23gcR9wa6m7Jue1YO2PsI1casIB5GPBWM8ilZLyvFzu+BPNwyz29oDM5+W2JhSg8NsqaRSTMHycxfg4MDHRJlUqgCWHO/IvyRGu0gQB5D671Z+mlpiZFXEejjSInrw/OS4wjiWwNFx8ehZnRVNpwlXI/SrXqvbFOfS3TxWRAtNpwxfTRw651AQZSE1Lrfrd6mmhZky96IGejuJgX5rL9HpbrvBKbHbFxunJDa6F67e0X0YsLWHr6uouc/StXi3m/yCRkNTjbXBNG33kkEtN8Jh2Pv3fY9I3vLfwkPFPgAEApRUigcIVl3AAAAAASUVORK5CYII=); color: purple;}\
     .outerbox{border:5px solid #EAE3F7;}\
    .box{border:1px solid #6E41C2;color:#444;}\
    .box .title{padding:5px;line-height:20px;background-color:#B59DE2;color:#fff;}\
    .box .content{padding:5px;}\
    .box table{border-collapse:collapse; width:100%;}\
    .box table td{padding:5px;}\
    .box input[type=button],.fish_button {padding:5px;}\
	.box .name ,.box .caption,.box .caption td { background-color:#EAE3F7; font-weight:bold;}\
	.fish_sep td {border-top:1px solid #A688DD;}\
    ";

	document.head.appendChild(s);
}

//#endregion

//#region -----------------执行环境兼容----------------------

var utility = {
	icon: "http://www.12306.cn/mormhweb/images/favicon.ico",
	notifyObj: null,
	timerObj: null,
	notify: function (msg, timeout) {
		if (window.webkitNotifications && window.webkitNotifications.checkPermission() == 0) {
			utility.closeNotify();

			if (utility.notifyObj == null)
				utility.notifyObj = webkitNotifications.createNotification(utility.icon, '订票', msg);
			utility.notifyObj.show();
			if (!timeout || timeout != 0) utility.timerObj = setTimeout(utility.closeNotify, timeout || 5000);
		} else {
			if (typeof (GM_notification) != 'undefined') {
				GM_notification(msg);
			} else {
				window.localStorage.setItem("notify", msg);
			}
		}
	},
	closeNotify: function () {
		if (!utility.notifyObj) return;

		utility.notifyObj.cancel();
		if (utility.timerObj) {
			clearTimeout(utility.timerObj);
		}
		utility.timerObj = null;
		utility.notifyObj = null;
	},
	setPref: function (name, value) {
		window.localStorage.setItem(name, value);
	},
	getPref: function (name) {
		return window.localStorage[name];
	},
	unsafeCallback: function (callback) {
		if (typeof (unsafeInvoke) == "undefined") callback();
		else unsafeInvoke(callback);
	},
	getTimeInfo: function () {
		var d = new Date();
		return d.getHours() + ":" + (d.getMinutes() < 10 ? "0" : "") + d.getMinutes() + ":" + (d.getSeconds() < 10 ? "0" : "") + d.getSeconds();
	},
	savePrefs: function (obj, prefix) {
		var objs = obj.find("input");
		objs.change(function () {
			var type = this.getAttribute("type");
			if (type == "text") utility.setPref(prefix + "_" + this.getAttribute("id"), $(this).val());
			else if (type == "checkbox") utility.setPref(prefix + "_" + this.getAttribute("id"), this.checked ? 1 : 0);
		})
	},
	reloadPrefs: function (obj, prefix) {
		var objs = obj.find("input");
		objs.each(function () {
			var e = $(this);
			var type = e.attr("type");
			var id = e.attr("id");
			var value = utility.getPref(prefix + "_" + id);
			if (typeof (value) == "undefined") return;

			if (type == "text") e.val(value);
			else if (type == "checkbox") this.checked = value == "1";
			e.change();
		});
		utility.savePrefs(obj, prefix);
	},
	/**
	 * 获得给定信息中的错误信息
	 * @param msg 返回的信息内容
	 */
	getErrorMsg: function (msg) {
		var m = msg.match(/var\s+message\s*=\s*"([^"]*)/);
		return m && m[1] ? m[1] : "&lt;未知信息&gt;";
	},
	delayInvoke: function (target, callback, timeout) {
		var e = $(target);
		if (timeout <= 0) {
			e.html("正在执行").removeClass("fish_clock").addClass("fish_running");
			callback();
		} else {
			var str = (Math.floor(timeout / 100) / 10) + '';
			if (str.indexOf(".") == -1) str += ".0";
			e.html(str + " 秒后重试....").removeClass("fish_running").addClass("fish_clock");
			setTimeout(function () {
				utility.delayInvoke(target, callback, timeout - 500);
			}, 500);
		}
	},
	saveList: function (name) {
		/// <summary>将指定列表的值保存到配置中</summary>
		var dom = document.getElementById(name);
		window.localStorage["list_" + name] = utility.getOptionArray(dom).join("|");
	},
	loadList: function (name) {
		/// <summary>将指定的列表的值从配置中加载</summary>
		var dom = document.getElementById(name);
		var data = window.localStorage["list_" + name];
		if (!data) return;

		data = data.split('|');
		$.each(data, function () {
			dom.options[dom.options.length] = new Option(this, this);
		});
	},
	addOption: function (dom, text, value) {
		/// <summary>在指定的列表中加入新的选项</summary>
		dom.options[dom.options.length] = new Option(text, value);
	},
	getOptionArray: function (dom) {
		/// <summary>获得选项的数组格式</summary>
		return $.map(dom.options, function (o) { return o.value; });
	},
	inOptionList: function (dom, value) {
		/// <summary>判断指定的值是否在列表中</summary>
		for (var i = 0; i < dom.options.length; i++) {
			if (dom.options[i].value == value) return true;
		}
		return false;
	},
	getAudioUrl: function () {
		/// <summary>获得音乐地址</summary>
		return window.localStorage["audioUrl"] || "http://www.w3school.com.cn/i/song.ogg";
	},
	resetAudioUrl: function () {
		/// <summary>恢复音乐地址为默认</summary>
		window.localStorage.removeItem("audioUrl");
	}
}

/**
 * 开始执行脚本
 */
function beginExecute() {
	entryPoint();
}

function safeInvoke(callback) {
	/// <summary>沙箱模式下的回调</summary>

	//因为Chrome不支持require引入脚本包的功能，为避免需要将整个jQuery加载进来，这里使用非安全模式进行执行
	if (isChrome) unsafeInvoke(callback);
	else callback();
}


/**
 * 非沙箱模式的回调数据
 * @param callback 回调数据
 *
 * */
function unsafeInvoke(callback) {
	/// <summary>非沙箱模式下的回调</summary>
	var cb = document.createElement("script");
	cb.type = "text/javascript";
	cb.textContent = buildCallback(callback);
	document.head.appendChild(cb);
}

function buildCallback(callback) {
	var content = "if(typeof(window.utility)=='undefined') {window.utility=" + buildObjectJavascriptCode(utility) + ";}\r\n\
	window.__cb=" + buildObjectJavascriptCode(callback) + ";\r\n\
	if(typeof(jQuery)!='undefined')window.__cb();\r\n\
	else{\
		var script=document.createElement('script');\r\nscript.src='https://ajax.googleapis.com/ajax/libs/jquery/1.7.1/jquery.min.js';\r\n\
		script.type='text/javascript';\r\n\
		script.addEventListener('load', window.__cb);\r\n\
		document.head.appendChild(script);\r\n\
	}";

	return content;
}

/**
 * 将指定的Javascript对象编译为脚本，包含
 * @param object
 */
function buildObjectJavascriptCode(object) {
	if (!object) return null;

	var t = typeof (object);
	if (t == "string") {
		return "\"" + object.replace(/(\r|\n|\\)/gi, function (a, b) {
			switch (b) {
				case "\r":
					return "\\r";
				case "\n":
					return "\\n";
				case "\\":
					return "\\\\";
			}
		}) + "\"";
	}
	if (t != "object") return object + "";

	var code = [];
	for (var i in object) {
		var obj = object[i];
		var objType = typeof (obj);

		if ((objType == "object" || objType == "string") && obj) {
			code.push(i + ":" + buildObjectJavascriptCode(obj));
		} else {
			code.push(i + ":" + obj);
		}
	}

	return "{" + code.join(",") + "}";
}

var isChrome = navigator.userAgent.indexOf("AppleWebKit") != -1;
var isFirefox = navigator.userAgent.indexOf("Firefox") != -1;

if(location.host=="dynamic.12306.cn"){
	if (!isChrome && !isFirefox) {
		alert("很抱歉，未能识别您的浏览器，或您的浏览器尚不支持脚本运行，请使用Firefox或Chrome浏览器！\n如果您运行的是Maxthon3，请确认当前页面运行在高速模式而不是兼容模式下 :-)");
	} else if (isFirefox && typeof (GM_notification) == 'undefined') {
		alert("很抱歉，本脚本需要最新的Scriptish扩展，请安装它！");
		window.open("https://addons.mozilla.org/zh-CN/firefox/addon/scriptish/");
	} else {
		initUIDisplay();
		beginExecute();
	}
}

//#endregion

//#region -----------------入口----------------------

function entryPoint() {
	var location = window.location;
	var path = location.pathname;

	if ((path == loginUrl && location.search == "?method=init") || path == "/otsweb/login.jsp") {
		//登录页
		safeInvoke(initLogin);
		checkUpdate();
	} else if (path == queryActionUrl) {
		unsafeInvoke(initTicketQuery);
	} else if (path == "/otsweb/order/myOrderAction.do" && location.search.indexOf("method=resign") != -1) {
		unsafeInvoke(initTicketQuery);
	} else if (path == confirmOrderUrl || path == "/otsweb/order/confirmPassengerResignAction.do") {
		unsafeInvoke(initAutoCommitOrder);
		safeInvoke(autoCommitOrderInSandbox);
	} else if (path == "/otsweb/main.jsp" || path == "/otsweb/") {
		//主框架
		safeInvoke(injectMainPageFunction);
	}
	
	//桌面提示for Firefox
	if (isFirefox) {
		setInterval(function () {
			var msg = window.localStorage["notify"];
			if (typeof (msg != 'undefined') && msg) {
				window.localStorage.removeItem("notify");
				GM_notification(msg);
			}
		}, 100);
	}
}

//#endregion

//#region -----------------主框架----------------------

function injectMainPageFunction() {
	if (utility.getPref("warning_noAutomaticSkipVerifyCode") != "1") {
		alert("提醒：现在系统已禁止验证码自动跳过，所以当出现验证码错误时，系统将会自动刷新验证码并自动定位到验证码输入框中，请输入验证码，输入满" +
			"四位的时候系统将会自动重新提交。\n\n脚本当前无法实现OCR识别，非常抱歉。\n\n您将无法使用多浏览器同步提交。\n\n这个提示仅会出现一次。");
		utility.setPref("warning_noAutomaticSkipVerifyCode", "1");
	}
	//资源
	var main = $("#main")[0];
	main.onload = function () {
		var location = null;
		try {
			location = main.contentWindow.location + '';
		} catch (e) {
			//出错了，跨站
		}
		if (!location || location == "http://www.12306.cn/mormhweb/logFiles/error.html") {
			resubmitForm();
		}
	}

	if (window.webkitNotifications && window.webkitNotifications.checkPermission() != 0) {
		alert("请启用通告，不然提交会变慢！");
	}

	var resubmitForm = function () {
		var form = $("#orderForm");
		if (form.length == 0) return;

		utility.notify("页面出错了！正在重新预定！");
		form.submit();
	}
}

//#endregion

//#region -----------------自动提交----------------------
function initAutoCommitOrder() {
	var count = 0;
	var breakFlag = 0;
	var randCode = "";
	var submitFlag = false;

	function stop(msg) {
		$("#tipresult").html("错误 - " + msg);
		$("div.tj_btn button, div.tj_btn input").each(function () {
			this.disabled = false;
			$(this).removeClass().addClass("long_button_u");
		});
		$("#btnCancelAuto").hide();
	}


	function submitForm() {
		if (!window.submit_form_check || !submit_form_check("confirmPassenger")) {
			utility.notify("信息没有填写完整，或当前表单出现异常！");
			return;
		}

		count++;
		$("#tipinfo").html("第 " + count + " 次提交");
		if (breakFlag) {
			stop("已取消自动提交");
			breakFlag = 0;
			return;
		}
		$("#btnCancelAuto").show().removeClass().addClass("long_button_u_down")[0].disabled = false; //阻止被禁用
		breakFlag = 0;

		jQuery.ajax({
			url: $("#confirmPassenger").attr('action'),
			data: $('#confirmPassenger').serialize(),
			type: "POST",
			timeout: 30000,
			success: function (msg) {
				var match = msg && msg.match(/org\.apache\.struts\.taglib\.html\.TOKEN['"]?\s*value=['"]?([^'">]+)/i);
				var newToken = match && match[1];
				if (newToken) {
					$("input[name='org.apache.struts.taglib.html.TOKEN']").val(newToken);
				}
				if (msg.indexOf('席位已成功锁定') > -1) {
					$("#tipresult").html("订票已成功！");
					alert("车票预订成功，恭喜!");
					window.location.replace("/otsweb/order/myOrderAction.do?method=queryMyOrderNotComplete&leftmenu=Y");
					return;
				}
				if (msg.indexOf('还有未处理的订单') > -1) {
					$("#tipresult").html("系统发现未处理的订单，可能上次已成功，请验证！");
					alert("系统发现未处理的订单，可能上次已成功，请验证!");
					window.location.replace("/otsweb/order/myOrderAction.do?method=queryMyOrderNotComplete&leftmenu=Y");
					return;
				}
				var retryMessage = ['确认客票的状态后再尝试后续操作', '请不要重复提交'];
				for (var i = retryMessage.length - 1; i >= 0; i--) {
					if (msg.indexOf(retryMessage[i]) > -1) {
						$("#tipresult").html(retryMessage[i]);
						setTimeout(submitForm, 1000 * Math.max(parseInt($("#pauseTime").val()), 1));
						return;
					}
				}
				msg = msg.match(/var\s+message\s*=\s*"([^"]*)/);
				if (msg && (msg[1].indexOf("验证码") != -1 || msg[1].indexOf("用户过多") != -1)) {
					$("#img_rrand_code").click();
					$("#rand")[0].select();
				}
				stop(msg && msg[1] || '出错了。。。。 啥错？ 我也不知道。。。。。');
			},
			error: function (msg) {
				$("#tipresult").html("当前请求发生错误");
				submitForm();
			}
		});
	}


	$("div.tj_btn")
		.before("<div style='text-align:center;'><span id='tipinfo'></span>：<span id='tipresult'></span></div>")
		.append("<button class='long_button_u_down' type='button' id='btnAutoSubmit'>自动提交</button>" +
		" <button class='long_button_u_down' type='button' id='btnCancelAuto' style='display:none;'>取消自动</button>");
	$("#btnAutoSubmit").click(function () {
		count = 0;
		breakFlag = 0;
		submitFlag = true;
		submitForm();
	});
	$("#btnCancelAuto").click(function () {
		$(this).hide();
		breakFlag = 1;
		submitFlag = false;
	});
	$("#rand").keyup(function (e) {
		if (!submitFlag&&!document.getElementById("autoStartCommit").checked) return;

		if (e.charCode == 13 || $("#rand").val().length == 4) submitForm();
	});

	//清除上次保存的预定信息
	if (parent) {
		parent.$("#orderForm").remove();
	}

	//提交频率差别
	$(".table_qr tr:last").before("<tr><td colspan='9'>自动提交失败时休息时间：<input type='text' size='4' class='input_20txt' style='text-align:center;' value='3' id='pauseTime' />秒 (不得低于1)  <label><input type='checkbox' id='autoStartCommit' /> 输入验证码后立刻开始自动提交</label></td></tr>");
	document.getElementById("autoStartCommit").checked=typeof(window.localStorage["disableAutoStartCommit"])=='undefined';
	$("#autoStartCommit").change(function(){
	 	if(this.checked)window.localStorage.removeItem("disableAutoStartCommit");
	 	else window.localStorage.setItem("disableAutoStartCommit", "1");
	});
}

function autoCommitOrderInSandbox() {
	//自动提示？
	if (window.localStorage["bookTip"]) {
		window.localStorage.removeItem("bookTip");
		if (window.Audio) {
			new window.Audio(utility.getAudioUrl()).play();
		}
		utility.notify("已经自动进入订票页面！请继续完成订单！");
	}
}

//#endregion

//#region -----------------自动刷新----------------------
function initTicketQuery() {
	//兼容性检测 for Maxthon3.
	//在Maxthon3下该入口函数会神奇地在日期选择界面出现，原因未查
	if(typeof(seatTypeRelation)=='undefined'||!seatTypeRelation)return;

	var buttonid = "";
	var autoRefresh = false;
	var queryCount = 0;
	var timer = null;
	var isTicketAvailable = false;
	var audio = null; //通知声音
	var timerCountDown = 0;
	var timeCount = 0;
	var filterNonBookable = false;
	var filterNonNeeded = false;
	var autoBook = false;
	//初始化表单
	var form = $("form[name=querySingleForm] .cx_from:first");
	form.find("tr:last").after("<tr class='append_row'><td colspan='9'><label><input type='checkbox' id='keepinfo' checked='checked' />记住信息</label> <label><input checked='checked' type='checkbox' id='autoRequery' />自动重新查询</label>，查询周期(S)：<input type='text' value='6' size='4' id='refereshInterval' style='text-align:center;' />(不得小于6) " +
		"<label><input type='checkbox' checked='checked' id='chkAudioOn'>声音提示</label> <label><input type='checkbox' id='chkSeatOnly'>仅座票</label> <label><input type='checkbox' id='chkSleepOnly'>仅卧铺</label>" +
		"<input type='button' id='enableNotify' onclick='window.webkitNotifications.requestPermission();' value='请点击以启用通告' style='line-height:25px;padding:5px;' /> <span id='refreshinfo'>已刷新 0 次，最后查询：--</span> <span id='refreshtimer'></span></td></tr>" +
		"<tr class='append_row'><td colspan='9'><input type='checkbox' checked='checked' id='chkAudioLoop'>声音循环</label>" +
		"<span style='font-weight:bold;margin-left:10px;color:blue;'><label><input type='checkbox' id='chkAutoResumitOrder' checked='checked' />预定失败时自动重试</label></span>" +
		"<span style='font-weight:bold;margin-left:10px;color:blue;'><label><input type='checkbox' id='chkAutoRequery' checked='checked' />查询失败时自动重试</label></span>" +
		"<span style='font-weight:bold;margin-left:10px;color:red;'><label><input type='checkbox' id='chkFilterNonBookable' />过滤不可预订的车次</label></span>" +
		"<span style='font-weight:bold;margin-left:10px;color:red;'><label><input type='checkbox' id='chkFilterNonNeeded' />过滤不需要的席别</label></span>" +
		"<span style='font-weight:bold;margin-left:10px;color:blue;display:none;'><label><input disabled='disabled' type='checkbox' id='chkAutoPreOrder' />自动预定</label></span>" +
		"<span style='font-weight:bold;margin-left:10px;color:blue;display: none;'><label><input disabled='disabled' type='checkbox' id='chkFilterByTrain' />开启按车次过滤</label></span>" +
		"<input type='hidden' id='queryid' /></td></tr>" +
		"<tr><td colspan='9'><input style='line-height:25px;padding:5px;' disabled='disabled' type='button' value='停止声音' id='btnStopSound' /><input style='line-height:25px;padding:5px;' disabled='disabled'  type='button' value='停止刷新' id='btnStopRefresh' /></td> </tr>"
	);
	$("#chkFilterNonBookable").change(function () {
		filterNonBookable = this.checked;
	});
	$("#chkFilterNonNeeded").change(function () {
		filterNonNeeded = this.checked;
	});

	if (!window.Audio) {
		$("#chkAudioOn, #chkAudioLoop, #btnStopSound").remove();
	} else {
		$("#btnStopSound").click(function () {
			if (audio) {
				audio.pause();
			}
			this.disabled = true;
		});
	}

	//操作控制
	$("#btnStopRefresh").click(function () {
		resetTimer();
	});

	//显示座级选择UI
	var ticketType = new Array();
	$(".hdr tr:eq(2) td").each(function (i, e) {
		ticketType.push(false);
		if (i < 3) return;

		var obj = $(this);
		ticketType[i] = (window.localStorage["typefilter_" + i] || "true") == "true";

		//修改文字，避免换行
		obj.attr("otext", obj.text());
		var cap = $.trim(obj.text());
		if (cap.length > 2) {
			cap = cap.replace("座", "").replace("高级软卧", "高软");
			obj.html(cap);
		}

		//加入复选框
		var c = $("<input/>").attr("type", "checkBox").attr("checked", ticketType[i]);
		c[0].ticketTypeId = i;
		c.change(
			function () {
				ticketType[this.ticketTypeId] = this.checked;
				window.localStorage["typefilter_" + this.ticketTypeId] = this.checked;
			}).appendTo(obj);
	});

	//座级选择
	$("#chkSeatOnly").click(function () {
		if (!this.checked) return;
		$(".hdr tr:eq(2) td").each(function (i, e) {
		 	var obj=$(this);
		 	var txt = obj.attr("otext");
			obj.find("input").attr("checked", typeof(txt)!='undefined' && txt && txt.indexOf("座") != -1).change();
		});
		$("#chkSleepOnly")[0].checked = false;
	});
	$("#chkSleepOnly").click(function () {
		if (!this.checked) return;
		$(".hdr tr:eq(2) td").each(function (i, e) {
		 	var obj=$(this);
		 	var txt = obj.attr("otext");
			obj.find("input").attr("checked", typeof(txt)!='undefined' && txt && txt.indexOf("卧") != -1).change();
		});
		$("#chkSeatOnly")[0].checked = false;
	});
	//显示额外的功能区
	$("body").append("<div class='outerbox'><div class='box'><div class='title'>辅助工具</div><div class='content'>\
<table><tr><td colspan='4'><input type='button' value='添加自定义车票时间段' id='btnDefineTimeRange' />\
<input type='button' value='清除自定义车票时间段' id='btnClearDefineTimeRange' /></td></tr>\
<tr class='fish_sep caption'><td colspan='4'>以下是车次过滤以及自动预定列表。要将车次加入下列的列表，请在上面查询的结果中，将鼠标移动到车次链接上，并点击出现的提示框中的过滤或自动预定按钮。</td></tr>\
        <tr class='fish_sep'><td><strong>车次黑名单</strong><br /><span style='color:gray;'>指定车次将会<br />被从列表中过<br />滤，不再出现</span></td><td><select id='blackList' style='width:200px;height:100px;' size='10' multiple='multiple'></select><input type='button' value='删除' class='btn_list_delete' /><input type='button' class='btn_list_clear' value='清空' /></td>\
		<td><strong>自动预定</strong><br /><span style='color:gray;'>指定车次可用<br />时，将会自动<br />进入预定页面</td><td><select id='autoBookList' size='10' style='width:200px;height:100px;' multiple='multiple'></select><input type='button' class='btn_list_delete' value='删除' /><input type='button' class='btn_list_clear' value='清空' /></td></tr>\
<tr class='fish_sep'><td colspan='4'><label><input type='checkbox' id='autoBookTip' checked='checked' /> 如果自动预定成功，进入预定页面后播放提示音乐并弹窗提示</label></td></tr>\
\
\
\
\
<tr class='fish_sep caption'><td colspan='4'>相关设置</td></tr>\
<tr class='fish_sep musicFunc'><td class='name'>自定义音乐地址</td><td colspan='3'><input type='text' id='txtMusicUrl' value='" + utility.getAudioUrl() + "' onfocus='this.select();' style='width:70%;' /> <input type='button' onclick='new Audio(document.getElementById(\"txtMusicUrl\").value).play();' value='测试'/><input type='button' onclick='utility.resetAudioUrl(); document.getElementById(\"txtMusicUrl\").value=utility.getAudioUrl();' value='恢复默认'/></td></tr>\
<tr class='fish_sep musicFunc'><td class='name'>可用音乐地址</td><td colspan='3'><span style='color:gray;'>* 暂时木有，如果您有好的地址，请告知作者</span></td></tr>\
<tr class='fish_sep'><td style='text-align:center;' colspan='4'><a href='http://t.qq.com/ccfish/' target='_blank' style='color:blue;'>腾讯微博</a> | <a href='http://www.fishlee.net/soft/44/' style='color:blue;' target='_blank'>助手主页</a> | <a href='http://www.fishlee.net/Discussion/Index/44' target='_blank'>反馈助手BUG</a></td></tr>\
		</table></div></div></div>");
	$("#stopBut").before("<div class='jmp_cd' style='text-align:center;'><input type='button' class='fish_button' id='btnFilter' value='加入黑名单' /><input type='button' class='fish_button' id='btnAutoBook' value='自动预定本车次' /></div>");
	$("#txtMusicUrl").change(function () { window.localStorage["audioUrl"] = this.value; });

	//添加自定义时间段
	function addCustomTimeRange() {
		var s = parseInt(prompt("请输入自定义时间段的起始时间（请填入小时，0-23）", "0"));
		if (isNaN(s) || s <= 0 || s > 23) {
			alert("起始时间不正确 >_<"); return;
		}
		var e = parseInt(prompt("请输入自定义时间段的结束时间（请填入小时，1-24）", "24"));
		if (isNaN(e) || e <= 0 || e > 24) {
			alert("结束时间不正确 >_<"); return;
		}
		var range = (s > 9 ? "" : "0") + s + ":00--" + (e > 9 ? "" : "0") + e + ":00";
		if (confirm("您想要记住这个时间段吗？")) {
			window.localStorage["customTimeRange"] = (window.localStorage["customTimeRange"] ? window.localStorage["customTimeRange"] + "|" : "") + range;
		};
		addCustomeTimeRangeToList(range);
	}
	function addCustomeTimeRangeToList(g) {
		var obj = document.getElementById("startTime");
		obj.options[obj.options.length] = new Option(g, g);
		obj.selectedIndex = obj.options.length - 1;
	}
	if (window.localStorage["customTimeRange"]) {
		var ctrs = window.localStorage["customTimeRange"].split("|");
		$.each(ctrs, function () { addCustomeTimeRangeToList(this); });
	}
	$("#btnClearDefineTimeRange").click(function () {
		if (!confirm("确定要清除自定义的时间段吗？清除后请刷新页面。")) return;
		window.localStorage.removeItem("customTimeRange");
	});
	$("#btnDefineTimeRange").click(addCustomTimeRange);

	//过滤车次
	var stopHover = window.onStopHover;
	window.onStopHover = function (info) {
		$("#stopDiv").attr("info", $.trim($("#id_" + info.split('#')[0]).text()));
		stopHover.call(this, info);
		$("#onStopHover").css("overflow", "hide");
	};
	$("input.btn_list_clear").click(function () {
		if (!confirm("确定清空车次列表？")) return;

		var btn = $(this);
		var list = btn.prev().prev();
		list[0].options.length = 0;

		utility.saveList(list.attr("id"));
	});
	$("input.btn_list_delete").click(function () {
		if (!confirm("确定从列表中删除指定车次？")) return;

		var btn = $(this);
		var list = btn.prev();
		var arr = list.val();
		var dom = list[0];
		for (var i = dom.options.length - 1; i >= 0; i--) {
			if ($.inArray(dom.options[i].value, arr) != -1) {
				dom.options[i] = null;
			}
		}

		utility.saveList(list.attr("id"));
	});
	utility.loadList("blackList");
	utility.loadList("autoBookList");

	var blackListDom = document.getElementById("blackList");
	var autoBookDom = document.getElementById("autoBookList");
	$("#btnFilter").click(function () {
		//加入黑名单
		var trainNo = $("#stopDiv").attr("info").split('#')[0];
		if (!trainNo || !confirm("确定要将车次【" + trainNo + "】加入黑名单？以后的查询将不再显示此车次。")) return;

		utility.addOption(blackListDom, trainNo, trainNo);
		utility.saveList("blackList");
	});
	$("#btnAutoBook").click(function () {
		//加入自动预定列表
		var trainNo = $("#stopDiv").attr("info").split('#')[0];
		if (!trainNo || !confirm("确定要将车次【" + trainNo + "】加入自动预定列表？如果下次查询有符合要求的席别将会自动进入预定页面。")) return;

		if (utility.inOptionList(blackListDom, trainNo)) {
			alert("指定的车次在黑名单里呢……");
			return;
		}

		utility.addOption(autoBookDom, trainNo, trainNo);
		utility.saveList("autoBookList");
	});
	//清除进入指定页面后提示的标记位
	if (window.localStorage["bookTip"]) window.localStorage.removeItem("bookTip");



	//通知权限
	if (!window.webkitNotifications || window.webkitNotifications.checkPermission() == 0) {
		$("#enableNotify").remove();
	}

	//保存信息
	function saveStateInfo() {
		if (!$("#keepinfo")[0].checked || $("#fromStationText")[0].disabled) return;
		utility.setPref("_from_station_text", $("#fromStationText").val());
		utility.setPref("_from_station_telecode", $("#fromStation").val());
		utility.setPref("_to_station_text", $("#toStationText").val());
		utility.setPref("_to_station_telecode", $("#toStation").val());
		utility.setPref("_depart_date", $("#startdatepicker").val());
		utility.setPref("_depart_time", $("#startTime").val());
	}

	$("#submitQuery, #stu_submitQuery").click(saveStateInfo);

	//是否是学生票？
	var queryevent = function () {
		buttonid = this.getAttribute("id");
		$("#queryid").val(buttonid);
		autoRefresh = ($("#autoRequery")[0].checked);
	};
	$("#submitQuery, #stu_submitQuery").click(queryevent);
	$("#autoRequery").change(function () {
		autoRefresh = this.checked;
		if (!this.checked) return;

		resetTimer();
	});
	$("#refereshInterval").change(
		function () {
			timeCount = Math.max(6, parseInt($("#refereshInterval").val()));
		}).change();

	//定时查询
	function resetTimer() {
		queryCount = 0;
		$("#btnStopRefresh")[0].disabled = true;
		if (timer) {
			clearTimeout(timer);
			timer = null;
		}
		$("#refreshtimer").html("");
	}

	function countDownTimer() {
		timerCountDown--;
		$("#refreshtimer").html(" 【" + timerCountDown + "秒后自动查询...】");

		if (timerCountDown > 0) {
			timer = setTimeout(countDownTimer, 1000);
		} else {
			doQuery();
		}
	}

	function displayQueryInfo() {
		queryCount++;
		$("#refreshinfo").html("已刷新 " + queryCount + " 次，最后查询：" + utility.getTimeInfo());
		$("#refreshtimer").html("正在查询");
	}

	function doQuery() {
		timer = null;
		if (audio) audio.pause();
		displayQueryInfo();
		$("#" + buttonid).click();
	}

	//验证车票有开始
	var onticketAvailable = function () {
		resetTimer();
		$("#refreshinfo").html("已经有票鸟！");

		setTimeout(function () {
			if (window.Audio && $("#chkAudioOn")[0].checked) {
				if (!audio) {
					audio = new Audio($("#txtMusicUrl").val());
				}
				audio.loop = $("#chkAudioLoop")[0].checked;
				$("#btnStopSound")[0].disabled = false;
				audio.play();
			}
			utility.notify("可以订票了！", null);
		}, 100);
	}
	//检查是否可以订票
	function getTrainNo(row) {
		return $.trim($("td:eq(0)", row).text());
	}
	var checkTickets = function (row) {
		var trainNo = getTrainNo(row);
		//过滤
		if (utility.inOptionList(blackListDom, trainNo)) {
			row.hide();
			return 0;
		}


		var hasTicket = 1;
		if ($("input.yuding_x", row).length > 0) return 0;

		$("td", row).each(function (i, e) {
			if (!ticketType[i - 1]) return 0;

			var el = $(e);
			var info = $.trim(el.text()); //Firefox不支持 innerText

			if (info != "--" && info != "无") {
				hasTicket = 2;
				el.css("background-color", "#95AFFD");
			}
		});

		return hasTicket;
	}

	//目标表格
	$("body").ajaxComplete(function (e, r, s) {
		if (s.url.indexOf("queryLeftTicket") == -1)
			return;

		//验证有票
		var rows = $("table.obj tr:gt(0)");
		var ticketValid = false;
		rows.each(function () {
			var row = $(this);
			var valid = checkTickets(row);

			if (valid == 2) {
				row.css("background-color", "#FD855C");

				//自动预定
				if (utility.inOptionList(autoBookDom, getTrainNo(row))) {
					if (document.getElementById("autoBookTip").checked) {
						window.localStorage["bookTip"] = 1;
					}
					row.find(".yuding_u, .yuding_u_over").click();
				}
			}
			else {
				if (valid == 1 && filterNonNeeded) row.hide();
				if (valid == 0 && filterNonBookable) row.hide();
			}
			ticketValid = ticketValid || valid == 2;
		}
		);
		if (ticketValid) {
			onticketAvailable();
		} else if (autoRefresh) {
			timerCountDown = timeCount + 1;
			//没有定时器的时候，开启定时器准备刷新
			$("#btnStopRefresh")[0].disabled = false;
			countDownTimer();
		}
	});
	//回填信息
	if (!$("#fromStationText")[0].disabled) {
		var FROM_STATION_TEXT = utility.getPref('_from_station_text');  // 出发站名称
		var FROM_STATION_TELECODE = utility.getPref('_from_station_telecode');  // 出发站电报码
		var TO_STATION_TEXT = utility.getPref('_to_station_text');  // 到达站名称
		var TO_STATION_TELECODE = utility.getPref('_to_station_telecode');  // 到达站电报码
		var DEPART_DATE = utility.getPref('_depart_date');  // 出发日期
		var DEPART_TIME = utility.getPref('_depart_time'); // 出发时间

		if (FROM_STATION_TEXT) {
			$("#fromStationText").val(FROM_STATION_TEXT);
			$("#fromStation").val(FROM_STATION_TELECODE);
			$("#toStationText").val(TO_STATION_TEXT);
			$("#toStation").val(TO_STATION_TELECODE);
			$("#startdatepicker").val(DEPART_DATE);
			$("#startTime").val(DEPART_TIME);
		}
	}

	//系统繁忙时自动重复查询 chkAutoResumitOrder
	$("#orderForm").submit(function () {
		if ($("#chkAutoResumitOrder")[0].checked) {
			parent.$("#orderForm").remove();
			parent.$("body").append($("#orderForm").clone(false).attr("target", "main"));
		}
	});
	$("body").ajaxComplete(function (e, r, s) {
		if (!$("#chkAutoRequery")[0].checked) return;
		if (s.url.indexOf("/otsweb/order/querySingleAction.do") != -1 && r.responseText == "-1") {
			delayButton();
			$("#" + $("#queryid").val()).click();
		}
	});
	$("body").ajaxError(function (e, r, s) {
		if (!$("#chkAutoRequery")[0].checked) return;
		if (s.url.indexOf("/otsweb/order/querySingleAction.do") != -1) {
			delayButton();
			$("#" + $("#queryid").val()).click();
		}
	});

	//Hack掉原来的系统函数。丫居然把所有的click事件全部处理了，鄙视
	window.invalidQueryButton = function () {
		var queryButton = $("#submitQuery");
		queryButton.unbind("click", sendQueryFunc);
		if (queryButton.attr("class") == "research_u") {
			renameButton("research_x");
		} else if (queryButton.attr("class") == "search_u") {
			renameButton("search_x");
		}
	}

	//音乐
	if (!window.Audio) {
		$(".musicFunc").hide();
	}
	utility.reloadPrefs($("tr.append_row"), "ticket_query");
}

//#endregion

//#region -----------------自动登录----------------------

function initLogin() {
	//如果已经登录，则自动跳转
	utility.unsafeCallback(function () {
		if (parent && parent.$) {
			var str = parent.$("#username_ a").attr("href");
			if (str && str.indexOf("sysuser/user_info") != -1) {
				window.location.href = "https://dynamic.12306.cn/otsweb/order/querySingleAction.do?method=init";
			}
			return;
		}
	});
	
	//检测主框架是否是顶级窗口
	var isTop = false;
	try {
		isTop = (top.location+'').indexOf("dynamic.12306.cn")!=-1;
	} catch (e) {

	}
	if (!isTop) {
		$("#loginForm table tr:first td:last").append("<a href='https://dynamic.12306.cn/otsweb/' target='_blank' style='font-weight:bold;color:red;'>强烈建议全屏订票！</a>");
	}



	//Hack当前UI显示
	$(".enter_right").empty().append("<div class='enter_enw'>" +
		"<div class='enter_rtitle' style='padding: 40px 0px 10px 0px; font-size: 20px;'>脚本提示信息</div>" +
		"<div class='enter_rfont'>" +
		"<ul id='tipScript'>" +
		"<li class='fish_clock' id='countEle' style='font-weight:bold;'>等待操作</li>" +
		"<li style='color:green;'><strong>操作信息</strong>：<span>休息中</span></li>" +
		"<li style='color:green;'><strong>最后操作时间</strong>：<span>--</span></li>" +
		"<li><a href='http://t.qq.com/ccfish/' target='_blank' style='color:blue;'>腾讯微博</a> | <a href='http://www.fishlee.net/soft/44/' style='color:blue;' target='_blank'>助手主页</a> | <a href='http://www.fishlee.net/Discussion/Index/44' target='_blank'>反馈助手BUG</a></li>" +
		"<li id='updateFound' style='display:none;'><a style='font-weight:bold; color:red;' href='http://www.fishlee.net/Service/Download.ashx/44/47/12306_ticket_helper.user.js'>发现新版本！点此更新</a></li>" +
		'<li id="enableNotification"><input type="button" id="enableNotify" onclick="$(this).parent().hide();window.webkitNotifications.requestPermission();" value="请点击以启用通告" style="line-height:25px;padding:5px;" /></li><li style="padding-top:10px;line-height:normal;color:gray;">请输入用户名和密码，<strong style="color: red;">最后输入验证码</strong>，输入完成后系统将自动帮你提交。登录过程中，请勿离开当前页面。如果系统繁忙，系统会自动重新刷新验证码并自动定位到验证码输入框中，请直接输入验证码，输入完成后助手将自动帮你提交。</li>' +
		"</ul>" +
		"</div>" +
		"</div>");

	//插入登录标记
	var form = $("#loginForm");
	var trs = form.find("tr");
	trs.eq(1).find("td:last").html('<label><input type="checkbox" id="keepInfo" /> 记录密码</label>');

	if (!window.webkitNotifications || window.webkitNotifications.checkPermission() == 0) {
		$("#enableNotification").remove();
	}

	var tip = $("#tipScript li");
	var count = 1;
	var errorCount = 0;

	//以下是函数
	function setCurOperationInfo(running, msg) {
		var ele = $("#countEle");
		ele.removeClass().addClass(running ? "fish_running" : "fish_clock").html(msg || (running ? "正在操作中……" : "等待中……"));
	}

	function setTipMessage(msg) {
		tip.eq(2).find("span").html(utility.getTimeInfo());
		tip.eq(1).find("span").html(msg);
	}

	function getLoginRandCode() {
		setCurOperationInfo(true, "正在获得登录随机码");

		$.ajax({
			url: "/otsweb/loginAction.do?method=loginAysnSuggest",
			method: "POST",
			dataType: "json",
			cache: false,
			success: function (json, code, jqXhr) {
				//{"loginRand":"211","randError":"Y"}
				if (json.randError != 'Y') {
					setTipMessage("错误：" + json.randError);
					getLoginRandCode();
				} else {
					setTipMessage("登录随机码 -&gt; " + json.loginRand);
					$("#loginRand").val(json.loginRand);
					submitForm();
				}
			},
			error: function () {
				errorCount++;
				setTipMessage("[" + errorCount + "] 网络请求错误，重试")
				utility.delayInvoke("#countEle", getLoginRandCode, 500);
			}
		});
	}

	function submitForm() {
		var data = {};
		$.each($("#loginForm").serializeArray(), function () {
			data[this.name] = this.value;
		});
		if (!data["loginUser.user_name"] || !data["user.password"] || !data.randCode || data.randCode.length != 4)
			return;

		if ($("#keepInfo")[0].checked) {
			utility.setPref("__un", data["loginUser.user_name"]);
			utility.setPref("__up", data["user.password"])
		}
		setCurOperationInfo(true, "正在登录中……");
		$.ajax({
			type: "POST",
			url: "/otsweb/loginAction.do?method=login",
			data: data,
			timeout: 30000,
			dataType: "text",
			success: function (html) {
				msg = utility.getErrorMsg(html);

				if (html.indexOf('请输入正确的验证码') > -1) {
					setTipMessage("验证码不正确");
					setCurOperationInfo(false, "请重新输入验证码。");
					stopLogin();
				} else if (msg.indexOf('密码') > -1) {
					setTipMessage(msg);
					setCurOperationInfo(false, "请重新输入。");
					stopLogin();
				} else if (msg.indexOf('锁定') > -1) {
					setTipMessage(msg);
					setCurOperationInfo(false, "请重新输入。");
					stopLogin();
				} else if (html.indexOf("欢迎您！") != -1) {
					utility.notify('登录成功，开始查询车票吧！');
					window.location.href = "https://dynamic.12306.cn/otsweb/order/querySingleAction.do?method=init";
				} else {
					setTipMessage(msg);
					relogin();
				}
			},
			error: function (msg) {
				utility.delayInvoke("#countEle", relogin, 1000);
				errorCount++;
				setTipMessage("[" + errorCount + "] 网络请求错误，重试")
			}
		});
	}


	function relogin() {
		count++;
		utility.notify("自动登录中：(" + count + ") 次登录中...");
		getLoginRandCode();
	}

	function stopLogin() {
		//等待重试时，刷新验证码
		$("#img_rrand_code").click();
		$("#randCode").val("")[0].select();
	}

	//初始化
	function executeLogin() {
		count = 1;
		utility.notify("自动登录中：(1) 次登录中...");
		setTipMessage("开始登录中....");
		getLoginRandCode();

		return false;
	}

	var kun = utility.getPref("__un");
	var kup = utility.getPref("__up");
	if (kun && kup) {
		$("#UserName").val(kun);
		$("#password").val(kup);
		$("#randCode")[0].focus();
	}
	$("#randCode").keyup(function (e) {
		e = e || event;
		if (e.charCode == 13 || $("#randCode").val().length == 4) relogin();
	});
}

//#endregion

//#region 检查更新

function checkUpdate() {
	//谷歌的依然有跨站问题。所以用传统的方法，委屈Firefox下Scriptish的新特性了。。
	var updateScriptVersion = document.createElement("script");
	updateScriptVersion.type = "text/javascript";
	updateScriptVersion.textContent = "var version='" + version + "'; " + compareVersion + "; (" + updateScriptContentForChrome + ")();";
	document.head.appendChild(updateScriptVersion);
}

function updateScriptContentForChrome() {
	var updateScipt = document.createElement('script');
	updateScipt.src = 'https://github.com/iccfish/12306_ticket_helper/raw/master/version.js?' + Math.random();
	updateScipt.type = 'text/javascript';
	updateScipt.addEventListener('load', function () {
		if (compareVersion(version, version_12306_helper) < 0) {
			if(typeof(external.mxCall)!='undefined'){
				$("#updateFound a").attr("href", "http://www.fishlee.net/soft/44/#C-192").attr("target", "_blank");
			}
			$("#updateFound").show();
			alert('助手脚本已经发布了最新版 ' + version_12306_helper + '，请在登录页面上点击更新链接更新 :-)');
		}
	});
	document.head.appendChild(updateScipt);
}

function compareVersion(v1, v2) {
	var vv1 = v1.split('.');
	var vv2 = v2.split('.');

	var length = Math.min(vv1.length, vv2.length);
	for (var i = 0; i < length; i++) {
		var s1 = parseInt(vv1[i]);
		var s2 = parseInt(vv2[i]);

		if (s1 < s2) return -1;
		if (s1 > s2) return 1;
	}

	return vv1.length > vv2.length ? 1 : vv1.length < vv2.length ? -1 : 0;
}

//#endregion