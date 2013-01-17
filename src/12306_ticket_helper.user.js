
// ==UserScript==
// @name 			12306.CN 订票助手 For Firefox&Chrome
// @namespace		http://www.u-tide.com/fish/
// @author			iFish@FishLee.net <ifish@fishlee.net> http://www.fishlle.net/
// @developer		iFish
// @contributor		
// @description		帮你订票的小助手 :-)
// @match			http://dynamic.12306.cn/otsweb/*
// @match			https://dynamic.12306.cn/otsweb/*
// @match			https://www.12306.cn/otsweb/*
// @require			http://lib.sinaapp.com/js/jquery/1.8.3/jquery.min.js
// @icon			http://www.12306.cn/mormhweb/images/favicon.ico
// @run-at			document-idle
// @version 		4.2.4
// @updateURL		http://www.fishlee.net/Service/Download.ashx/44/47/12306_ticket_helper.user.js
// @supportURL		http://www.fishlee.net/soft/44/
// @homepage		http://www.fishlee.net/soft/44/
// @contributionURL	https://me.alipay.com/imfish
// @contributionAmount	￥5.00
// ==/UserScript==

//=======START=======

var version = "4.2.4";
var updates = [
	"修改自动预定和自动提交逻辑，提示排队人数过多时自动重试 (不过此类情况成功率不高，建议多做打算)",
	"修改自动提交的重试过程可以通过取消勾选『自动提交』来取消",
	"修正改签的自动提交会生成一个新的订单",
	"修正自动提交在出现网络错误时，可能会卡住的BUG"
];

var faqUrl = "http://www.fishlee.net/soft/44/faq.html";
//标记
var utility_emabed = false;


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
	.box{border:1px solid #6E41C2;color:#444;margin:auto;}\
	.box .title{padding:5px;line-height:20px;background-color:#B59DE2;color:#fff;}\
	.box .title a {color:white;}\
	.box .content{padding:5px;background-color:#fff;}\
	.box table{border-collapse:collapse; width:98%;}\
	.box table td{padding:5px;}\
	.box input[type=button],.fish_button {padding:5px;}\
	.box .name ,.box .caption,.box .caption td { background-color:#EAE3F7; font-weight:bold;-webkit-transition:all linear 0.2s;-moz-transition:all linear 0.2s;}\
	.fish_sep td {border-top:1px solid #A688DD;}\
	.lineButton { cursor:pointer; border: 1px solid green; border-radius:3px; font-size:12px; line-height: 16px; padding:3px; backround-color: lightgreen; color: green;-webkit-transition:all linear 0.2s;-moz-transition:all linear 0.2s;}\
	.lineButton:hover { color: white; background-color: green;-webkit-transition:all linear 0.1s;-moz-transition:all linear 0.1s; }\
.fishTab {border: 5px solid #E5D9EC;font-size: 12px;}\
.fishTab .innerTab {border-width: 1px;border-style: solid;border-color: #C7AED5;background-color: #fff;}\
.fishTab .tabNav {font-weight:bold;color:#F5F1F8;background-color: #C7AED5;line-height:25px;overflow:hidden;margin:0px;padding:0px;}\
.fishTab .tabNav li {float:left;list-style:none;cursor:pointer;padding-left: 20px;padding-right: 20px;}\
.fishTab .tabNav li:hover {background-color:#DACAE3;}\
.fishTab .tabNav li.current {background-color:#fff;color: #000;}\
.fishTab .tabContent {padding:5px;display:none;}\
.fishTab .tabContent p{margin:10px 0px 10px 0px;}\
.fishTab div.current {display:block;}\
.fishTab div.control {text-align:center;line-height:25px;background-color:#F0EAF4;}\
.fishTab input[type=button] { padding: 5px; }\
.hide {display:none;}\
.fish_button {background-color:#7077DA;font-size:12px; font-family:微软雅黑; color:#fff; border: 1px solid #7077DA;margin-left:5px;margin-right:5px;-webkit-transition:all linear 0.2s;-moz-transition:all linear 0.2s;border-radius:3px;font-size:12px;}\
.fish_button:hover{background:#fff;color:#7077DA;-webkit-transition:all linear 0.1s;-moz-transition:all linear 0.1s;cursor:pointer;}\
tr.steps td{background-color:#E8B7C2!important;-webkit-transition:all linear 0.1s;-moz-transition:all linear 0.1s;}\
tr.stepsok td{background-color:#BDE5BD!important;-webkit-transition:all linear 0.1s;-moz-transition:all linear 0.1s;}\
tr.steps span.indicator {display:inline-block!important;}\
tr.stepsok span.indicator {display:inline-block!important;}\
.highlightrow td { background-color:#D0C0ED!important; color:red; }\
#randCodeTxt{ font-weight: bold; font-size: 18px; text-align: center; padding: 3px 10px 3px 10px; font-family: verdana!important; text-transform: uppercase; }";

	document.head.appendChild(s);
}

function injectDom() {
	var html = [];
	html.push('<div id="fishOption" style="width: 600px; display:none; box-shadow: 7px 7px 10px #A67EBC;">');
	html.push('<div class="innerTab">');
	html.push('<ul class="tabNav" default="tabVersion">');
	html.push('<li tab="tabLogin">常规设置</li>');
	html.push('<li tab="tabReg">注册</li>');
	html.push('<li tab="tabFaq">常见问题</li>');
	html.push('<li tab="tabVersion">版本信息</li>');
	html.push('<li tab="tabLog">运行日志</li>');
	html.push('<li tab="tabLoginIE">登录到IE</li>');//获取登录到IE的代码 Add By XPHelper
	html.push('</ul>');
	html.push('<div class="tabContent tabLogin">');
	html.push('<table>');
	html.push('<tr>');
	html.push('<td>重试时间 ');
	html.push('<td>');
	html.push('<td><input type="text" name="login.retryLimit" size="6" value="2000" />');
	html.push('(ms)</td>');
	html.push('<td>');
	html.push('</td>');
	html.push('<td></td>');
	html.push('</tr>');
	html.push('</table>');
	html.push('</div>');
	html.push('<div class="tabContent tabReg" style="text-indent: 20px">');
	html.push('<p>为了阻止地球人他喵地拿作者无偿奉献的助手去卖钱钱，请注册唷。<strong>完全免费申请</strong>。</p>');
	html.push('<p style="color: red;"> <strong style="font-size:16px;">啊嘞……看这里！本助手完全免费啊诸位大人！</strong>任何在第三方网站上出售的软件全他喵的是侵权出售啊！！看到的时候请亲务必记得退款退货打差评向青天大老爷举报啊！！</p>');
	html.push('<p style="color:purple;"> 回家是一个单纯而简单的心愿，希望我们不会变得太复杂……</p>');
	html.push('<p>任何版本之间，功能上没有任何区别，So……不要问作者万一资助的话会有神马新功能，木有的说…… (=￣ω￣=) </p>');
	html.push('<p class="registered" style="display:none;">很高兴认识你，，<strong>fishcn@foxmail.com</strong>，谢谢你的出现~~~~已注册版本：<strong>正式版</strong>【<a href="javascript:;" id="unReg">重新注册</a>】</p>');
	html.push('<table class="regTable" style="display:none;width:98%;">');
	html.push('<tr>');
	html.push('<td>请粘贴注册码 【<a href="http://www.fishlee.net/Apps/Cn12306/GetNormalRegKey?v=1" target="_blank" style="color:blue;font-weight:bold;text-decoration:underline;">戳我直接申请注册码啊！为什么你们舍不得戳我啊 ╮(╯▽╰)╭</a>】</td>');
	html.push('</tr><tr>');
	html.push('<td style="text-align:center;"><textarea id="regContent" style="width:98%; height:50px;"></textarea></td>');
	html.push('</tr><tr>');
	html.push('<td><input type="button" id="regButton" value="注册" /></td>');
	html.push('</tr>');
	html.push('</table>');
	html.push('</div>');
	html.push('<div class="tabContent tabVersion" style="text-indent: 20px">');
	html.push('<h4 style="font-size:18px; font-weight:bold; margin: 0px; line-height: 26px; border-bottom: 1px dotted #ccc;">12306 订票助手 <small>ver ' + window.helperVersion + '</small></h4>');
	html.push('<p> 12306 订票助手是一款用于订票的助手软件，嗯……看到这里相信你已经知道它支持神马浏览器了 =。=<strong>完全免费，无需付费使用，仅接受捐助。</strong> </p>');
	html.push('<p style="color: red;"> <strong style="font-size:16px;">啊嘞……看这里！本助手完全免费啊诸位大人！</strong>任何在第三方网站上出售的软件全他喵的是侵权出售啊！！看到的时候请亲务必记得退款退货打差评向青天大老爷举报啊！！</p>');
	html.push('<p style="color:purple;"> 回家是一个单纯而简单的心愿，希望我们不会变得太复杂……</p>');
	html.push('<p> 有很多朋友资助作者，正在木有暖气的南方饱受煎熬的作者感激涕零 ≥ω≤。<a href="http://www.fishlee.net/soft/44/donate.html" target="_blank">戳这里了解捐助详情</a>。 </p>');
	html.push('<p style="color: blue;"> <strong style="font-size:16px;">那个，诸位票贩子们，放过本助手吧！！不要害作者啊！！！你们都去用什么自动识别验证码的好啦！离贫道远点！！</strong>  ╮(╯▽╰)╭  </p>');
	html.push('<p style="font-weight:bold;">当前版本更新内容</p>');
	html.push('<ol>');
	$.each(utility.getPref("updates").split('\t'), function (i, n) {
		html.push("<li style='padding-left:20px;list-style:disc inside;'>" + n + "</li>");
	});
	html.push('</ol>');
	html.push('</div>');
	html.push('<div class="tabContent tabFaq">');
	html.push('<table>');
	html.push('<tr>');
	html.push('<td colspan="4"> 你在订票过程中可能……会遇到各种问题，由于介个12306网站本身呢……木有没有任何介绍 ╮(╯▽╰)╭ ，所以老衲整理了相关问题，供客官参考。如果还有不明白的问题，加群讨论呗  (=￣ω￣=) 。 <br /><br />');
	html.push('1.放票非正点也，So在将近放票的时候，务必保持刷新状态哈，而且……当整点没有放票时，不要放弃继续刷新喔；<br />\
2.动车都是11点放票撒，切记切记；<br />\
3.第一波放票悲催地木有订到时，请耐心等待，因为现在放票有N多节点，随时会有票出来，晚很久才放票也正常，铁老大经常秀下限嘀；<br />\
4.如果您的车票很难买，请尽量发动你的七大姑八大姨神马的一堆朋友过来集体帮忙，同时建议用多个浏览器刷票，因为缓存的关系不同的浏览器出现票的时间可能不同；<br />\
5.最新版3.9.0中的预先选择铺位功能有点淡化了……要用的话，使用优选席别，第一个优选的将会被自动选中 ^_^<br />\
<br />\
好了，废话说完鸟，祝大家买票顺利，贫僧只希望不会帮倒忙就好了 ╮(╯▽╰)╭<br />\
如果您还有问题的话，<a href="http://www.fishlee.net/soft/44/tour.html" target="_blank">建议点击这里查看教程~~~~</a>\
');
	html.push('</td></tr>');
	html.push('<tr style="display:none;">');
	html.push('<td><a href="http://www.fishlee.net/soft/44/12306faq.html" target="_blank">订票常见问题</a></td>');
	html.push('<td><a href="http://www.fishlee.net/soft/44/faq.html" target="_blank">助手运行常见问题</a></td>');
	html.push('</tr>');
	html.push('</table>');
	html.push('</div><div class="tabLog tabContent"><div>下面是当前页面的记录。如果您的助手遇到功能上的问题，请全部复制后发成邮件给作者：ifish@fishlee.net 以便于老衲解决问题。<span style="color:red;font-weight:bold;">请在发送前务必剔除记录中包含的个人隐私如密码等信息。</span></div><textarea id="runningLog" style="width:100%;height:200px;"></textarea></div>');
	//获取登录到IE的代码 Add By XPHelper
	html.push('<div class="tabLoginIE tabContent"><div><strong>先在IE中打开 https://dynamic.12306.cn/otsweb，</strong>再将以下代码复制到IE浏览器的地址栏。确认地址栏最前面有“javascript:”字样，没有请手动加上（IE10会自动删除这样的代码），然后敲回车，等待页面刷新后，即可自动登录。</div><textarea id="LoginIECode" style="width:100%;height:200px;"></textarea></div>');
	html.push('<div class="control">');
	html.push('<input type="button" class="close_button" value="关闭" />');
	html.push('</div>');
	html.push('</div>');
	html.push('</div>');

	$("body").append(html.join(""));

	var opt = $("#fishOption");
	$("#regButton").click(function () {
		var sn = $.trim($("#regContent").val());

		var rt = utility.verifySn(false, "", sn);
		if (rt.result != 0) {
			alert("很抱歉, 注册失败. 代码 " + rt.result + ", " + rt.msg);
		} else {
			utility.setSnInfo("", sn);
			alert("注册成功, 请刷新浏览器。\n注册给 - " + rt.name + " , 注册类型 - " + rt.typeDesc.replace(/<[^>]*>/gi, ""));

			try {
				utility.getTopWindow().location.reload();
			} catch (e) {
				alert("权限不足无法刷新页面， 请手动刷新当前页！");
			}
		}
	});
	$("#unReg, a.reSignHelper").live("click", function () {
		if (!confirm("确定要重新注册吗?")) return;

		utility.setSnInfo("", "");
		utility.getTopWindow().location.reload();
	});

	//初始化设置
	utility.configTab = utility.fishTab(opt);
	opt.find("input[name]").each(function () {
		var el = $(this);
		var key = el.attr("name");
		var value = window.localStorage.getItem(key);
		if (!value) return;

		if (el.attr("type") == "checkbox") {
			el.attr("checked", value == "1");
		} else {
			el.val(value);
		}
	}).change(function () {
		var el = $(this);
		var key = el.attr("name");

		if (el.attr("type") == "checkbox") {
			window.localStorage.setItem(key, el[0].checked ? 1 : 0);
		} else {
			window.localStorage.setItem(key, el.val());
		}
	});
	$("#configLink, .configLink").live("click", function () {
		var el = $(this);
		var dp = el.attr("tab");

		utility.getTopWindow().utility.showLoginIE();
		utility.getTopWindow().utility.showOptionDialog(dp || "");
	});
	//新版本更新显示提示
	if (utility.getPref("helperVersion") != window.helperVersion) {

		//检测老版本设置
		if (utility.getAudioUrl().indexOf("github") != -1 || utility.getAudioUrl().indexOf("https://") != -1) {
			utility.resetAudioUrl();
		}

		utility.setPref("helperVersion", window.helperVersion);
		//仅顶层页面显示
		try {
			if (parent == self)
				utility.showOptionDialog("tabVersion");
		} catch (ex) {
			//跨域了，也是顶级
			utility.showOptionDialog("tabVersion");
		}
	}

	//注册
	var result = utility.verifySn(true);
	if (result.result == 0) {
		var info = opt.find(".registered").show().find("strong");
		info.eq(0).html(result.name);
		info.eq(1).html(result.typeDesc);


	} else {
		opt.find(".regTable").show();

		if (location.pathname == "/otsweb/" || location.pathname == "/otsweb/main.jsp") {
			alert("为了阻止地球人趁火打劫然后拿着老衲免费奉献的东东去卖钱，贫僧斗胆麻烦客官……啊不，施主注册下下，一下子就好了啦！");
			window.open("http://www.fishlee.net/Apps/Cn12306/GetNormalRegKey");
			utility.showOptionDialog("tabReg");
		}
	}
	utility.regInfo = result;
}

//#endregion

//#region -----------------执行环境兼容----------------------

var utility = {
	configTab: null,
	icon: "http://www.12306.cn/mormhweb/images/favicon.ico",
	notifyObj: null,
	timerObj: null,
	regInfo: null,
	isWebKit: function () {
		return navigator.userAgent.indexOf("WebKit") != -1;
	},
	trim: function (data) {
		if (typeof ($) != 'undefined') return $.trim(data);

		return data.replace(/(^\s+|\s+$)/g, "");
	},
	getTopWindow: function () {
		try {
			if (parent == self) return self;
			else return parent.window.utility.getTopWindow();
		} catch (e) {
			//跨域的话，也是顶层
			return self;
		}
	},
	init: function () {
		$.extend({
			any: function (array, callback) {
				var flag = false;
				$.each(array, function (i, v) {
					flag = callback.call(this, i, v);
					if (flag) return false;
				});
				return flag;
			},
			first: function (array, callback) {
				var result = null;
				$.each(array, function (i, v) {
					result = callback.call(this, i, v);
					if (result) return false;
				});
				return result;
			}
		});
		(function (n) { var t = /["\\\x00-\x1f\x7f-\x9f]/g, i = { "\b": "\\b", "\t": "\\t", "\n": "\\n", "\f": "\\f", "\r": "\\r", '"': '\\"', "\\": "\\\\" }, r = Object.prototype.hasOwnProperty; n.toJSON = typeof JSON == "object" && JSON.stringify ? JSON.stringify : function (t) { var i, a, l, v, p, y, f; if (t === null) return "null"; if (i = typeof t, i === "undefined") return undefined; if (i === "number" || i === "boolean") return "" + t; if (i === "string") return n.quoteString(t); if (i === "object") { if (typeof t.toJSON == "function") return n.toJSON(t.toJSON()); if (t.constructor === Date) { var e = t.getUTCMonth() + 1, o = t.getUTCDate(), w = t.getUTCFullYear(), s = t.getUTCHours(), h = t.getUTCMinutes(), c = t.getUTCSeconds(), u = t.getUTCMilliseconds(); return e < 10 && (e = "0" + e), o < 10 && (o = "0" + o), s < 10 && (s = "0" + s), h < 10 && (h = "0" + h), c < 10 && (c = "0" + c), u < 100 && (u = "0" + u), u < 10 && (u = "0" + u), '"' + w + "-" + e + "-" + o + "T" + s + ":" + h + ":" + c + "." + u + 'Z"' } if (t.constructor === Array) { for (a = [], l = 0; l < t.length; l++) a.push(n.toJSON(t[l]) || "null"); return "[" + a.join(",") + "]" } y = []; for (f in t) if (r.call(t, f)) { if (i = typeof f, i === "number") v = '"' + f + '"'; else if (i === "string") v = n.quoteString(f); else continue; (i = typeof t[f], i !== "function" && i !== "undefined") && (p = n.toJSON(t[f]), y.push(v + ":" + p)) } return "{" + y.join(",") + "}" } }, n.evalJSON = typeof JSON == "object" && JSON.parse ? JSON.parse : function (src) { return eval("(" + src + ")") }, n.secureEvalJSON = typeof JSON == "object" && JSON.parse ? JSON.parse : function (src) { var filtered = src.replace(/\\["\\\/bfnrtu]/g, "@").replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, "]").replace(/(?:^|:|,)(?:\s*\[)+/g, ""); if (/^[\],:{}\s]*$/.test(filtered)) return eval("(" + src + ")"); throw new SyntaxError("Error parsing JSON, source is not valid."); }, n.quoteString = function (n) { return n.match(t) ? '"' + n.replace(t, function (n) { var t = i[n]; return typeof t == "string" ? t : (t = n.charCodeAt(), "\\u00" + Math.floor(t / 16).toString(16) + (t % 16).toString(16)) }) + '"' : '"' + n + '"' } })(jQuery)
	},
	runningQueue: null,
	appendLog: function (settings) {
		/// <summary>记录日志</summary>
		if (!utility.runningQueue) utility.runningQueue = [];
		var log = { url: settings.url, data: settings.data, response: null, success: null };
		if (log.url.indexOf("Passenger") != -1) return;	//不记录对乘客的请求

		utility.runningQueue.push(log);
		settings.log = log;
	},
	showLog: function () {
		if (!utility.runningQueue) {
			alert("当前页面尚未产生日志记录。");
			return;
		}

		var log = [];
		$.each(utility.runningQueue, function () {
			log.push("成功：" + (this.success ? "是" : "否") + "\r\n地址：" + this.url + "\r\n提交数据：" + utility.formatData(this.data) + "\r\n返回数据：" + utility.formatData(this.response));
		});
		$("#runningLog").val(log.join("\r\n----------------------------------\r\n"));

		utility.showOptionDialog("tabLog");
	},
	//获取登录到IE的代码 Add By XPHelper
	showLoginIE: function () {
		var strCookie = document.cookie;
		var arrCookie = strCookie.split("; ");
		var IECode = "javascript:";
		var cookie = [];
		for (var i = 0; i < arrCookie.length; i++) {
			var arr = arrCookie[i].split("=");
			if (arr.length < 2 || arr[0].indexOf("helper.") != -1) continue;
			cookie.push("document.cookie=\"" + arr[0] + "=" + arr[1] + "\";");
		}
		IECode += cookie.join("");
		IECode += "self.location.reload();";
		$("#LoginIECode").val(IECode);
	},
	formatData: function (data) {
		if (!data) return "(null)";
		if (typeof (data) == "string") return data;
		var html = [];
		for (var i in data) {
			html.push('"' + i + '":\"' + (this[i] + "").replace(/(\r|\n|")/g, function (a) { "\\" + a; }) + '\"');
		}
		return "{" + html.join(",") + "}";
	},
	notify: function (msg, timeout) {
		console.log("信息提示: " + msg);
		if (window.webkitNotifications) {
			if (window.webkitNotifications.checkPermission() == 0) {
				utility.closeNotify();

				if (utility.notifyObj == null)
					utility.notifyObj = webkitNotifications.createNotification(utility.icon, '订票', msg);
				utility.notifyObj.show();
				if (!timeout || timeout != 0) utility.timerObj = setTimeout(utility.closeNotify, timeout || 5000);
			} else {
				alert("【啊喂！！桌面通知还木有开启！请戳界面中的『点击启用桌面通知』按钮来开启！】\n\n" + msg);
			}
		} else {
			if (typeof (GM_notification) != 'undefined') {
				GM_notification(msg);
			} else {
				console.log("主页面中脚本信息, 无法提示, 写入通知区域.");
				utility.notifyOnTop(msg);
			}
		}
	},
	notifyOnTop: function (msg) {
		window.localStorage.setItem("notify", msg);
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
		return window.localStorage.getItem(name);
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
		prefix = prefix || "";
		objs.each(function () {
			var e = $(this);
			var type = e.attr("type");
			var id = e.attr("id");
			var value = utility.getPref(prefix + "_" + id);
			if (typeof (value) == "undefined" || value == null) return;

			if (type == "text") e.val(value);
			else if (type == "checkbox") this.checked = value == "1";
			e.change();
		});
		utility.savePrefs(obj, prefix);
	},
	getErrorMsg: function (msg) {
		/// <summary>获得给定信息中的错误信息</summary>
		var m = msg.match(/var\s+message\s*=\s*"([^"]*)/);
		return m && m[1] ? m[1] : "&lt;未知信息&gt;";
	},
	delayInvoke: function (target, callback, timeout) {
		target = target || "#countEle";
		var e = typeof (target) == "string" ? $(target) : target;
		if (timeout <= 0) {
			e.html("正在执行").removeClass("fish_clock").addClass("fish_running");
			callback();
		} else {
			var str = (Math.floor(timeout / 100) / 10) + '';
			if (str.indexOf(".") == -1) str += ".0";
			e.html(str + " 秒后再来!...").removeClass("fish_running").addClass("fish_clock");
			setTimeout(function () {
				utility.delayInvoke(target, callback, timeout - 500);
			}, 500);
		}
	},
	saveList: function (name) {
		/// <summary>将指定列表的值保存到配置中</summary>
		var dom = document.getElementById(name);
		window.localStorage["list_" + name] = utility.getOptionArray(dom).join("\t");
	},
	loadList: function (name) {
		/// <summary>将指定的列表的值从配置中加载</summary>
		var dom = document.getElementById(name);
		var data = window.localStorage["list_" + name];
		if (!data) return;

		if (data.indexOf("\t") != -1)
			data = data.split('\t');
		else data = data.split('|');
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
		return window.localStorage["audioUrl"] || (navigator.userAgent.indexOf("Firefox") != -1 ? "http://www.w3school.com.cn/i/song.ogg" : "http://www.w3school.com.cn/i/song.ogg");
	},
	getFailAudioUrl: function () {
		return (utility.isWebKit() ? "http://resbak.fishlee.net/res/" : "http://resbak.fishlee.net/res/") + "music3.ogg";
	},
	playFailAudio: function () {
		if (!window.Audio) return;
		new Audio(utility.getFailAudioUrl()).play()
	},
	resetAudioUrl: function () {
		/// <summary>恢复音乐地址为默认</summary>
		window.localStorage.removeItem("audioUrl");
	},
	parseDate: function (s) { /(\d{4})[-/](\d{1,2})[-/](\d{1,2})/.exec(s); return new Date(RegExp.$1, RegExp.$2 - 1, RegExp.$3); },
	getDate: function (s) {
		/// <summary>获得指定日期的天单位</summary>
		return new Date(s.getFullYear(), s.getMonth(), s.getDate());
	},
	formatDate: function (d) {
		/// <summary>格式化日期</summary>
		var y = d.getFullYear();

		return y + "-" + utility.formatDateShort(d);
	},
	formatDateShort: function (d) {
		/// <summary>格式化日期</summary>
		var mm = d.getMonth() + 1;
		var d = d.getDate();

		return (mm > 9 ? mm : "0" + mm) + "-" + (d > 9 ? d : "0" + d);
	},
	formatTime: function (d) {
		function padTo2Digit(digit) {
			return digit < 10 ? '0' + digit : digit;
		}
		return utility.formatDate(d) + " " + padTo2Digit(d.getHours()) + ":" + padTo2Digit(d.getMinutes()) + ":" + padTo2Digit(d.getSeconds());
	},
	addTimeSpan: function (date, y, mm, d, h, m, s) {
		/// <summary>对指定的日期进行偏移</summary>
		return new Date(date.getFullYear() + y, date.getMonth() + mm, date.getDate() + d, date.getHours() + h, date.getMinutes() + m, date.getSeconds() + s);
	},
	serializeForm: function (form) {
		/// <summary>序列化表单为对象</summary>
		var v = {};
		var o = form.serializeArray();
		for (var i in o) {
			if (typeof (v[o[i].name]) == 'undefined') v[o[i].name] = o[i].value;
			else v[o[i].name] += "," + o[i].value;
		}
		return v;
	},
	getSecondInfo: function (second) {
		var show_time = "";
		var hour = parseInt(second / 3600);  //时
		if (hour > 0) {
			show_time = hour + "小时";
			second = second % 3600;
		}
		var minute = parseInt(second / 60);  //分
		if (minute >= 1) {
			show_time = show_time + minute + "分";
			second = second % 60;
		} else if (hour >= 1 && second > 0) {
			show_time = show_time + "0分";
		}
		if (second > 0) {
			show_time = show_time + second + "秒";
		}

		return show_time;
	},
	post: function (url, data, dataType, succCallback, errorCallback) {
		$.ajax({
			url: url,
			data: data,
			timeout: 10000,
			type: "POST",
			success: succCallback,
			error: errorCallback,
			dataType: dataType
		});
	},
	get: function (url, data, dataType, succCallback, errorCallback) {
		$.ajax({
			url: url,
			data: data,
			timeout: 10000,
			type: "GET",
			success: succCallback,
			error: errorCallback,
			dataType: dataType
		});
	},
	showDialog: function (object, optx) {
		/// <summary>显示对话框。其中带有 close_button 样式的控件会自动作为关闭按钮</summary>
		return (function (opt) {
			var dataKey = "fs_dlg_opt";
			if (this.data(dataKey)) {
				//this.data(dataKey).closeDialog();
				return;
			}

			opt = $.extend({ bindControl: null, removeDialog: this.attr("autoCreate") == "1", onClose: null, animationMove: 20, speed: "fast", fx: "linear", show: "fadeInDown", hide: "fadeOutUp", onShow: null, timeOut: 0 }, opt);
			this.data("fs_dlg_opt", opt);
			var top = "0px";
			var left = "50%";

			this.css({
				"position": opt.parent ? "absolute" : "fixed",
				"left": left,
				"top": top,
				"margin-left": "-" + (this.width() / 2) + "px",
				"margin-top": "0px",
				"z-index": "9999"
			});
			var obj = this;
			this.changeLoadingIcon = function (icon) {
				/// <summary>更改加载对话框的图标</summary>
				obj.removeClass().addClass("loadingDialog loadicon_" + (icon || "tip"));
				return obj;
			};
			this.autoCloseDialog = function (timeout) {
				/// <summary>设置当前对话框在指定时间后自动关闭</summary>
				setTimeout(function () { obj.closeDialog(); }, timeout || 2500);
				return obj;
			};
			this.setLoadingMessage = function (msgHtml) {
				obj.find("div").html(msgHtml);
				return obj;
			};
			this.closeDialog = function () {
				/// <summary>关闭对话框</summary>
				obj.removeData(dataKey);
				obj.animate({ "marginTop": "+=" + opt.animationMove + "px", "opacity": "hide" }, opt.speed, opt.fx, function () {
					if (opt.bindControl) opt.bindControl.enable();
					if (opt.onClose) opt.onClose.call(obj);
					if (opt.removeDialog) obj.remove();
				})

				return obj;
			};
			$('.close_button', this).unbind("click").click(obj.closeDialog);
			//auto close
			if (opt.timeOut > 0) {
				var handler = opt.onShow;
				opt.onShow = function () {
					setTimeout(function () { $(obj).closeDialog(); }, opt.timeOut);
					if (handler != null) handler.call(this);
				};
			}
			//show it
			if (opt.bindControl) opt.bindControl.disable();
			this.animate({ "marginTop": "+=" + opt.animationMove + "px", "opacity": "show" }, opt.speed, opt.fx, function () { opt.onShow && opt.onShow.call(obj); })
			this.data(dataKey, this);

			return this;
		}).call(object, optx);
	},
	fishTab: function (obj, opt) {
		return (function (opt) {
			var self = this;
			opt = $.extend({ switchOnHover: false, switchOnClick: true }, opt);
			this.addClass("fishTab");


			this.showTab = function (tabid) {
				self.find(".current").removeClass("current");
				self.find("ul.tabNav li[tab=" + tabid + "], div." + tabid).addClass("current");
			};
			self.find(".tabNav li").hover(function () {
				if (!opt.switchOnHover) return;
				self.showTab($(this).attr("tab"));
			}).click(function () {
				if (!opt.switchOnClick) return;
				self.showTab($(this).attr("tab"));
			});
			this.showTab(self.find(".tabNav").attr("default") || self.find(".tabNav li:eq(0)").attr("tab"));

			return this;
		}).call(obj, opt);
	},
	getLoginRetryTime: function () {
		return parseInt(window.localStorage.getItem("login.retryLimit")) || 2000;
	},
	showOptionDialog: function (tab) {
		if (tab) utility.configTab.showTab(tab);
		utility.showDialog($("#fishOption"));
	},
	addCookie: function (name, value, expDays) {
		var cook = name + "=" + value + "; path=/; domain=.12306.cn";
		if (expDays > 0) {
			cook += "; expires=" + new Date(new Date().getTime() + expDays * 3600 * 1000 * 24).toGMTString();
		}
		document.cookie = cook;
	},
	getCookie: function (name) {
		var cook = document.cookie;
		var arr = cook.split("; ");
		for (var i = 0; i < arr.length; i++) {
			var arg = arr[i].split('=');
			if (arg[0] == name) return arg[1];
		}
	},
	setSnInfo: function (name, sn) {
		utility.setPref("helper.regUser", name);
		utility.setPref("helper.regSn", sn);
		utility.addCookie("helper.regUser", name, 999);
		utility.addCookie("helper.regSn", sn, 999);
	},
	verifySn: function (skipTimeVerify, name, sn) {
		name = name || utility.getPref("helper.regUser") || utility.getCookie("helper.regUser");
		sn = sn || utility.getPref("helper.regSn") || utility.getCookie("helper.regSn");
		if (!name && sn) return utility.verifySn2(skipTimeVerify, sn);
		if (!name || !sn) return { result: -4, msg: "未注册" };

		utility.setSnInfo(name, sn);

		var args = sn.split(',');
		if (!skipTimeVerify) {
			if ((new Date() - args[0]) / 60000 > 5) {
				return { result: -1, msg: "序列号注册已失效" };
			}
		}
		var dec = [];
		var encKey = args[0] + args[1];
		var j = 0;
		for (var i = 0; i < args[2].length; i += 4) {
			dec.push(String.fromCharCode(parseInt(args[2].substr(i, 4), 16) ^ encKey.charCodeAt(j)));
			j++;
			if (j >= encKey.length) j = 0;
		}
		var data = dec.join("");
		data = { result: null, type: data.substring(0, 4), name: data.substring(4) };
		data.result = data.name == name ? 0 : -3;
		data.msg = data.result == 0 ? "成功验证" : "注册无效"
		data.typeDesc = data.type == "NRML" ? "正式版" : (data.type == "GROP" ? "内部版, <span style='color:blue;'>感谢您参与我们之中</span>!" : "<span style='color:red;'>捐助版, 非常感谢您的支持</span>!");

		return data;
	},
	verifySn2: function (skipTimeVerify, data) {
		data = utility.trim(data);
		try {
			var nameLen = parseInt(data.substr(0, 2), 16);
			var name = data.substr(2, nameLen);
			data = data.substring(2 + nameLen);

			var arr = [];
			for (var i = 0; i < data.length; i++) {
				var c = data.charCodeAt(i);
				if (c >= 97) arr.push(String.fromCharCode(c - 49));
				else arr.push(data.charAt(i));
			}
			data = arr.join("");
			var ticket = parseInt(data.substr(0, 14), 16);
			var key = parseInt(data.substr(14, 1), 16);
			var encKey = ticket.toString(16).toUpperCase() + key.toString().toUpperCase();
			data = data.substring(15);
			var dec = [];
			var j = 0;
			for (var i = 0; i < data.length; i += 4) {
				dec.push(String.fromCharCode(parseInt(data.substr(i, 4), 16) ^ encKey.charCodeAt(j)));
				j++;
				if (j >= encKey.length) j = 0;
			}
			dec = dec.join("").split('|');
			var regVersion = dec[0].substr(0, 4);
			var regName = dec[0].substring(4);
			var bindAcc = dec.slice(1, dec.length);

			if (!bindAcc && !skipTimeVerify && (new Date() - ticket) / 60000 > 5) {
				return { result: -1, msg: "注册码已失效， 请重新申请" };
			}
			if (regName != name) {
				return { result: -3, msg: "注册失败，用户名不匹配" };
			}
			var data = { name: name, type: regVersion, bindAcc: bindAcc, ticket: ticket, result: 0, msg: "成功注册" };
			switch (data.type) {
				case "NRML": data.typeDesc = "正式版"; break;
				case "GROP": data.typeDesc = "内部版, <span style='color:blue;'>感谢您参与我们之中</span>!"; break;
				case "DONT": data.typeDesc = "<span style='color:red;'>捐助版, 非常感谢您的支持</span>!"; break;
				case "PART": data.typeDesc = "合作版，欢迎您的使用";
			}
			data.regTime = new Date(ticket);
			data.regVersion = 2;

			return data;
		} catch (e) {
			return { result: -4, msg: "数据错误" };
		}
	},
	allPassengers: null,
	getAllPassengers: function (callback) {
		if (utility.allPassengers) {
			callback(utility.allPassengers);
		}

		//开始加载所有乘客
		utility.allPassengers = [];
		var pageIndex = 0;

		function loadPage() {
			utility.post("/otsweb/passengerAction.do?method=getPagePassenger", { pageSize: 10, pageIndex: pageIndex }, "json", function (json) {
				$.each(json.rows, function () { utility.allPassengers.push(this); });

				if (utility.allPassengers.length >= json.recordCount) {
					callback(utility.allPassengers);
				} else {
					pageIndex++;
					setTimeout(loadPage, 1000);
				}
			}, function () {
				setTimeout(loadPage, 3000);
			});
		}

		loadPage();
	},
	regCache: {},
	getRegCache: function (value) {
		return utility.regCache[value] || (utility.regCache[value] = new RegExp("^(" + value + ")$", "i"));
	},
	preCompileReg: function (optionList) {
		var data = $.map(optionList, function (e) {
			return e.value;
		});
		return new RegExp("^(" + data.join("|") + ")$", "i");
	},
	enableLog: function () {
		$("body").append('<button style="width:100px;position:fixed;right:0px;top:0px;height:35px;" onclick="utility.showLog();">显示运行日志</button>');
		$(document).ajaxSuccess(function (a, b, c) {
			if (!c.log) return;
			c.log.response = b.responseText;
			c.log.success = true;
		}).ajaxSend(function (a, b, c) {
			utility.appendLog(c);
		}).ajaxError(function (a, b, c) {
			if (!c.log) return;
			c.log.response = b.responseText;
		});
	},
	//获取登录到IE的代码 Add By XPHelper
	enableLoginIE: function () {
		$("body").append('<button style="width:150px;position:fixed;right:0px;top:0px;height:35px;" class="configLink" tab="tabLoginIE">获取登录到IE的代码</button>');
	},
	analyzeForm: function (html) {
		var data = {};

		//action
		var m = /<form.*?action="([^"]+)"/.exec(html);
		data.action = m ? RegExp.$1 : "";

		//inputs
		data.fields = {};
		var inputs = html.match(/<input\s*(.|\r|\n)*?>/gi);
		$.each(inputs, function () {
			if (!/name=['"]([^'"]+?)['"]/.exec(this)) return;
			var name = RegExp.$1;
			data.fields[RegExp.$1] = !/value=['"]([^'"]+?)['"]/.exec(this) ? "" : RegExp.$1;
		});

		//tourflag
		m = /submit_form_confirm\('confirmPassenger','([a-z]+)'\)/.exec(html);
		if (m) data.tourFlag = RegExp.$1;

		return data;
	},
	selectionArea: function (opt) {
		var self = this;
		this.options = $.extend({ onAdd: function () { }, onRemove: function () { }, onClear: function () { }, onRemoveConfirm: function () { return true; }, syncToStorageKey: "", defaultList: null, preloadList: null }, opt);
		this.append('<div style="padding: 5px; border: 1px dashed gray; background-color: rgb(238, 238, 238); width:120px;">(还没有添加任何项)</div>');
		this.datalist = [];

		this.add = function (data) {
			if ($.inArray(data, self.datalist) > -1) return;

			var text = typeof (data) == "string" ? data : data.text;

			var html = $('<input type="button" class="lineButton" value="' + text + '" title="点击删除" />');
			self.append(html);
			html.click(self.removeByButton);
			self.datalist.push(data);
			self.syncToStorage();
			self.checkEmpty();
			self.options.onAdd.call(self, data, html);
		};

		this.removeByButton = function () {
			var obj = $(this);
			var idx = obj.index() - 1;
			var value = self.datalist[idx];

			if (!self.options.onRemoveConfirm.call(self, value, obj, idx)) {
				return;
			}

			obj.remove();
			self.datalist.splice(idx, 1);
			self.syncToStorage();
			self.checkEmpty();
			self.options.onRemove.call(self, value, obj);
		};

		this.emptyList = function () {
			self.datalist = [];
			self.find("input").remove();
			self.syncToStorage();
			self.checkEmpty();
			self.options.onClear.call(self);
		};

		this.isInList = function (data) {
			/// <summary>判断指定的值是否在列表中</summary>
			return $.inArray($.inArray(data, self.datalist)) > -1;
		};

		this.isInRegList = function (data) {
			/// <summary>判断指定的值是否在列表中。这里假定是字符串，使用正则进行判断</summary>
			for (var i = 0; i < self.datalist.length; i++) {
				if (utility.getRegCache(self.datalist[i]).test(data)) return true;
			}
			return false;
		};

		this.syncToStorage = function () {
			if (!self.options.syncToStorageKey) return;

			window.localStorage.setItem(self.options.syncToStorageKey, self.datalist.join("\t"));
		};

		this.checkEmpty = function () {
			if (self.find("input").length) {
				self.find("div").hide();
			} else {
				self.find("div").show();
			}
		};

		if (self.options.syncToStorageKey) {
			var list = self.options.preloadList;
			if (!list) {
				var list = window.localStorage.getItem(this.options.syncToStorageKey);
				if (!list) list = this.options.defaultList;
				else list = list.split('\t');
			}

			if (list) {
				$.each(list, function () { self.add(this + ""); });
			}
		}

		return this;
	}

}

function unsafeInvoke(callback) {
	/// <summary>非沙箱模式下的回调</summary>
	var cb = document.createElement("script");
	cb.type = "text/javascript";
	cb.textContent = buildCallback(callback);
	document.head.appendChild(cb);
}

function buildCallback(callback) {
	var content = "";
	if (!utility_emabed) {
		content += "if(typeof(window.utility)!='undefined' && navigator.userAgent.indexOf('Maxthon')==-1){ alert('我勒个去! 检测到您似乎同时运行了两只助手! 请转到『附加组件管理『（Firefox）或『扩展管理』（Chrome）中卸载老版本的助手！');}; \r\nwindow.utility=" + buildObjectJavascriptCode(utility) + "; window.utility.init();window.helperVersion='" + version + "';\r\n";
		utility_emabed = true;
	}
	content += "window.__cb=" + buildObjectJavascriptCode(callback) + ";\r\n\
	if(typeof(jQuery)!='undefined')window.__cb();\r\n\
	else{\
		var script=document.createElement('script');\r\nscript.src='https://ajax.googleapis.com/ajax/libs/jquery/1.7.1/jquery.min.js';\r\n\
		script.type='text/javascript';\r\n\
		script.addEventListener('load', window.__cb);\r\n\
		document.head.appendChild(script);\r\n\
	}";

	return content;
}

function buildObjectJavascriptCode(object) {
	/// <summary>将指定的Javascript对象编译为脚本</summary>
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

if (location.host == "dynamic.12306.cn" || (location.host == "www.12306.cn" && location.protocol == "https:")) {
	if (!isChrome && !isFirefox) {
		alert("很抱歉，未能识别您的浏览器，或您的浏览器尚不支持脚本运行，请使用Firefox或Chrome浏览器！\n如果您运行的是Maxthon3，请确认当前页面运行在高速模式而不是兼容模式下 :-)");
	} else if (isFirefox && typeof (GM_notification) == 'undefined') {
		alert("很抱歉，本脚本需要最新的Scriptish扩展、不支持GreaseMonkey，请禁用您的GreaseMonkey扩展并安装Scriptish！");
		window.open("https://addons.mozilla.org/zh-CN/firefox/addon/scriptish/");
	} else if (!window.localStorage) {
		alert("警告! localStorage 为 null, 助手无法运行. 请查看浏览器是否已经禁用 localStorage!\nFirefox请设置 about:config 中的 dom.storage.enabled 为 true .");
	} else {

		//记录更新
		utility.setPref("updates", updates.join("\t"));
		initUIDisplay();
		unsafeInvoke(injectDom);
		entryPoint();
	}
}

//#endregion

//#region -----------------入口----------------------

function entryPoint() {
	var location = window.location;
	var path = location.pathname;

	utility.regInfo = utility.verifySn(true);
	if (utility.regInfo.result != 0) {
		return;
	}

	//
	unsafeInvoke(autoReloadIfError);
	if ((path == "/otsweb/loginAction.do" && location.search != '?method=initForMy12306') || path == "/otsweb/login.jsp") {
		//登录页
		unsafeInvoke(initLogin);
	}
	if (utility.regInfo.bindAcc && localStorage.getItem("_sessionuser") && utility.regInfo.bindAcc.length > 0 && utility.regInfo.bindAcc[0] && utility.regInfo.bindAcc[0] != "*") {
		var user = localStorage.getItem("_sessionuser");
		var ok = false;
		for (var i = 0; i < utility.regInfo.bindAcc.length; i++) {
			if (utility.regInfo.bindAcc[i] == user) {
				ok = true;
				break;
			}
		}
		if (!ok) return;
	}
	if (path == "/otsweb/order/querySingleAction.do") {
		if (location.search == "?method=init" && document.getElementById("submitQuery")) {
			unsafeInvoke(initTicketQuery);
			unsafeInvoke(initDirectSubmitOrder);
		}
		if (location.search == "?method=submutOrderRequest") {
			unsafeInvoke(initSubmitOrderQuest);
		}
	}
	if (path == "/otsweb/order/orderAction.do") {
		if (location.search.indexOf("method=cancelMyOrderNotComplete") != -1 && document.getElementById("submitQuery")) {
			unsafeInvoke(initTicketQuery);
			unsafeInvoke(initDirectSubmitOrder);
		}
	}
	if (path == "/otsweb/order/payConfirmOnlineSingleAction.do") {
		if (location.search.indexOf("method=cancelOrder") != -1 && document.getElementById("submitQuery")) {
			unsafeInvoke(initTicketQuery);
			unsafeInvoke(initDirectSubmitOrder);
		}
	}
	if (path == "/otsweb/order/myOrderAction.do") {
		if (location.search.indexOf("method=resign") != -1 && document.getElementById("submitQuery")) {
			unsafeInvoke(initTicketQuery);
			unsafeInvoke(initDirectSubmitOrder);
		}
	}
	if (path == "/otsweb/order/confirmPassengerAction.do") {
		if (location.search == "?method=init") {
			unsafeInvoke(initAutoCommitOrder);
			unsafeInvoke(autoCommitOrderInSandbox);
		}
		if (location.search.indexOf("?method=payOrder") != -1) {
			unsafeInvoke(initPagePayOrder);
			//获取登录到IE的代码 Add By XPHelper
			unsafeInvoke(utility.enableLoginIE);
		}
	}
	if (path == "/otsweb/order/myOrderAction.do") {
		if (location.search.indexOf("?method=laterEpay") != -1 || location.search.indexOf("?method=queryMyOrderNotComplete") != -1) {
			unsafeInvoke(initNotCompleteOrderPage);
			unsafeInvoke(initPayOrder);
			//获取登录到IE的代码 Add By XPHelper
			unsafeInvoke(utility.enableLoginIE);
		}
	}
	if (path == "/otsweb/main.jsp" || path == "/otsweb/") {
		//主框架
		console.log("正在注入主框架脚本。");

		//跨页面弹窗提示，防止因为页面跳转导致对话框不关闭
		console.log("启动跨页面信息调用检查函数");
		window.setInterval(function () {
			var msg = window.localStorage["notify"];
			if (typeof (msg != 'undefined') && msg) {
				console.log("主窗口拦截提示请求: " + msg);
				window.localStorage.removeItem("notify");
				utility.notify(msg);
			}
		}, 100);

		unsafeInvoke(injectMainPageFunction);
	}
}

//#endregion

//#region 未完成订单查询页面

function initNotCompleteOrderPage() {
	//处理显示时间的
	(function () {
		var tagInputs = $("input[name=cache_tour_flag]");
		var flags = $.map(tagInputs, function (e, i) { return e.value; });
		$.each(flags, function () { $("#showTime_" + this).hide().after("<span id='status_" + this + "'>正在查询...</span>"); });

		function doCheck() {
			var flag = flags.shift();
			flags.push(flag);

			utility.get("https://dynamic.12306.cn/otsweb/order/myOrderAction.do?method=getOrderWaitTime&tourFlag=" + flag, null, "json", function (data) {
				var obj = $("#status_" + flag);
				if (data.waitTime == 0 || data.waitTime == -1) {
					obj.css({ "color": "green" }).html("订票成功！");
					utility.notifyOnTop("订票成功！请尽快付款！");
					parent.playAudio();
					self.location.reload();
					return;
				}

				if (data.waitTime == -2) {
					utility.notifyOnTop("出票失败！请重新订票！" + data.msg);
					parent.playFailAudio();
					obj.css({ "color": "red" }).html("出票失败！" + data.msg);

					return;
				}
				if (data.waitTime == -3) {
					utility.notifyOnTop("订单已经被取消！");
					parent.playFailAudio();
					obj.css({ "color": "red" }).html("订单已经被取消！！");

					return;
				}
				if (data.waitTime == -4) {
					utility.notifyOnTop("正在处理中....");
					obj.css({ "color": "blue" }).html("正在处理中....");
				}

				if (data.waitTime > 0) {
					obj.css({ "color": "red" }).html("排队中<br />排队数【" + (data.waitCount || "未知") + "】<br />预计时间【" + utility.getSecondInfo(data.waitTime) + "】<br />不过这时间不<br />怎么靠谱 ╮(╯▽╰)╭");
				} else {
					obj.css({ "color": "red" }).html("奇怪的状态码 [" + data.waitTime + "]....");
				}


				setTimeout(doCheck, 2000);
			}, function () {
				utility.notifyOnTop("查询状态错误，正在刷新页面！");
				self.location.reload();
			});
		}

		if (flags.length > 0) doCheck();
	})();
}

//#endregion

//#region 提交页面出错

function initSubmitOrderQuest() {
	if ($("div.error_text").length > 0) {
		parent.window.resubmitForm();
	}
}

//#endregion

//#region 订票页面，声音提示

function initPagePayOrder() {
	new Audio(utility.getAudioUrl()).play();
}

//#endregion

//#region -----------------出错自动刷新----------------------

function autoReloadIfError() {
	if ($.trim($("h1:first").text()) == "错误") {
		$("h1:first").css({ color: 'red', 'font-size': "18px" }).html("&gt;_&lt; 啊吖!，敢踹我出门啦。。。2秒后我一定会回来的 ╮(╯▽╰)╭");
		setTimeout(function () {
			self.location.reload();
		}, 2000);
	}
}

//#endregion

//#region -----------------主框架----------------------

function injectMainPageFunction() {
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
		if (confirm("喂！快戳『点击启用桌面通知』，不然提示会阻碍操作，导致运行变慢，然后就没票了！\n\n如果是第一次看到介句话，点击『取消』并按提示操作。如果反复邂逅这个对话框，就戳『确定』以打开助手主页的常见问题并查找解决办法。\n\n搜狗高速浏览器暂不支持保存此权限，每次访问时可能都会邂逅这个对话框……")) {
			window.open("http://www.fishlee.net/soft/44/faq.html");
		}
	}

	window.resubmitForm = function () {
		var form = $("#orderForm");
		if (form.length == 0 || form.attr("success") != "0") return;

		utility.notify("页面出错了！正在重新预定！");
		setTimeout(function () { document.getElementById("orderForm").submit(); }, 3000);
	}
	window.playAudio = function () {
		new Audio(utility.getAudioUrl()).play();
	};
	window.playFailAudio = function () {
		utility.playFailAudio();
	};
}

//#endregion

//#region -----------------自动提交----------------------
function initAutoCommitOrder() {
	var count = 0;
	var breakFlag = 0;
	var randCode = "";
	var submitFlag = false;
	var tourFlag = 'dc';
	var randEl = $("#rand");

	//启用日志
	utility.enableLog();

	//#region 如果系统出错，那么重新提交

	if ($(".error_text").length > 0 && parent.$("#orderForm").length > 0) {
		parent.resubmitForm();

		return;
	}

	//#endregion

	//获得tourflag
	(function () {
		/'(dc|fc|wc|gc)'/.exec($("div.tj_btn :button:eq(2)")[0].onclick + '');
		tourFlag = RegExp.$1;
	})();

	function stop(msg) {
		setCurOperationInfo(false, "错误 - " + msg);
		setTipMessage(msg);
		$("div.tj_btn button, div.tj_btn input").each(function () {
			this.disabled = false;
			$(this).removeClass().addClass("long_button_u");
		});
		$("#btnCancelAuto").hide();
	}

	var reloadCode = function () {
		$("#img_rrand_code").click();
		$("#rand").val("")[0].select();
	};

	var getSleepTime = function () {
		return 1000 * Math.max(parseInt($("#pauseTime").val()), 1);
	};

	//订单等待时间过久的警告
	var waitTimeTooLong_alert = false;

	function submitForm() {
		randEl[0].blur();
		stopCheckCount();
		if (!window.submit_form_check || !submit_form_check("confirmPassenger")) {
			setCurOperationInfo(false, "您的表单没有填写完整!");
			stop("请填写完整表单");
			return;
		}

		count++;
		setCurOperationInfo(true, "第 " + count + " 次提交");
		if (breakFlag) {
			stop("已取消自动提交");
			breakFlag = 0;
			return;
		}
		$("#btnCancelAuto").show().removeClass().addClass("long_button_u_down")[0].disabled = false; //阻止被禁用
		breakFlag = 0;
		waitTimeTooLong_alert = false;

		$("#confirmPassenger").ajaxSubmit({
			url: 'confirmPassengerAction.do?method=checkOrderInfo&rand=' + $("#rand").val(),
			type: "POST",
			data: { tFlag: tourFlag },
			dataType: "json",
			success: function (data) {
				if ('Y' != data.errMsg || 'N' == data.checkHuimd || 'N' == data.check608) {
					setCurOperationInfo(false, data.msg || data.errMsg);
					stop(data.msg || data.errMsg);
					reloadCode();
				}
				else {
					queryQueueCount();
				}
			},
			error: function (msg) {
				setCurOperationInfo(false, "当前请求发生错误");
				utility.delayInvoke(null, submitForm, 1000);
			}
		});
	}

	function queryQueueCount() {
		var queryLeftData = {
			train_date: $("#start_date").val(),
			train_no: $("#train_no").val(),
			station: $("#station_train_code").val(),
			seat: $("#passenger_1_seat").val(),
			from: $("#from_station_telecode").val(),
			to: $("#to_station_telecode").val(),
			ticket: $("#left_ticket").val()
		};
		utility.get("/otsweb/order/confirmPassengerAction.do?method=getQueueCount", queryLeftData, "json", function (data) {
			console.log(data);
			if (data.op_2) {
				var errmsg = "排队人数过多，系统禁止排队，稍等自动重试 (排队人数=" + data.count + ")";
				setCurOperationInfo(true, errmsg);
				stop(errmsg);

				utility.delayInvoke(null, queryQueueCount, 1000);


				return;
			}

			submitConfirmOrder();
		}, function () { utility.delayInvoke(null, queryLeftTickets, 2000); });
	}

	function submitConfirmOrder() {
		jQuery.ajax({
			url: '/otsweb/order/confirmPassengerAction.do?method=confirmSingleForQueueOrder',
			data: $('#confirmPassenger').serialize(),
			type: "POST",
			timeout: 10000,
			dataType: 'json',
			success: function (msg) {
				console.log(msg);

				var errmsg = msg.errMsg;
				if (errmsg != 'Y') {
					if (errmsg.indexOf("包含未付款订单") != -1) {
						alert("您有未支付订单! 等啥呢, 赶紧点确定支付去.");
						window.location.replace("/otsweb/order/myOrderAction.do?method=queryMyOrderNotComplete&leftmenu=Y");
						return;
					}
					if (errmsg.indexOf("重复提交") != -1) {
						stop("重复提交错误，已刷新TOKEN，请重新输入验证码提交");
						reloadToken();
						reloadCode();
						return;
					}
					if (errmsg.indexOf("后台处理异常") != -1 || errmsg.indexOf("非法请求") != -1) {
						if (lastform) {
							utility.notifyOnTop("后台处理异常，已自动重新提交表单，请填写验证码并提交！");
							lastform.submit();
						} else {
							stop("后台处理异常，请返回查询页重新预定！");
						}
						return;
					}
					if (errmsg.indexOf("包含排队中") != -1) {
						console.log("惊现排队中的订单， 进入轮询状态");
						waitingForQueueComplete();
						return;
					}


					setCurOperationInfo(false, errmsg);
					stop(errmsg);
					reloadCode();
				} else {
					utility.notifyOnTop("订单提交成功, 正在等待队列完成操作，请及时注意订单状态");
					waitingForQueueComplete();
				}
			},
			error: function (msg) {
				setCurOperationInfo(false, "当前请求发生错误");
				utility.delayInvoke(null, submitForm, 3000);
			}
		});
	}

	function reloadToken(submit) {
		setCurOperationInfo(true, "正在刷新TOKEN....");
		utility.post("/otsweb/order/confirmPassengerAction.do?method=init", null, "text", function (text) {
			if (!/TOKEN"\s*value="([a-f\d]+)"/i.test(text)) {
				setCurOperationInfo(false, "无法获得TOKEN，正在重试");
				utility.delayInvoke("#countEle", reloadToken, 1000);
			} else {
				var token = RegExp.$1;
				setCurOperationInfo(false, "已获得TOKEN - " + token);
				console.log("已刷新TOKEN=" + token);
				$("input[name=org.apache.struts.taglib.html.TOKEN]").val(token);
			}
		}, function () { utility.delayInvoke("#countEle", reloadToken, 1000); });
	}

	function waitingForQueueComplete() {
		setCurOperationInfo(true, "订单提交成功, 正在等待队列完成操作....");

		$.ajax({
			url: '/otsweb/order/myOrderAction.do?method=getOrderWaitTime&tourFlag=' + tourFlag + '&' + Math.random(),
			data: {},
			type: 'GET',
			timeout: 10000,
			dataType: 'json',
			success: function (json) {
				console.log(json);

				if (json.waitTime == -1 || json.waitTime == 0) {
					utility.notifyOnTop("订票成功!");
					if (json.orderId)
						window.location.replace("/otsweb/order/confirmPassengerAction.do?method=payOrder&orderSequence_no=" + json.orderId);
					else window.location.replace('/otsweb/order/myOrderAction.do?method=queryMyOrderNotComplete&leftmenu=Y');
				} else if (json.waitTime == -3) {
					var msg = "很抱歉, 铁道部无齿地撤销了您的订单, 赶紧重新下!";
					utility.notify(msg);
					setCurOperationInfo(false, msg);
					stop(msg);
					reloadCode();
				} else if (json.waitTime == -2) {
					var msg = "很抱歉, 铁道部说您占座失败 : " + json.msg + ', 赶紧重新来过!';
					reloadToken();
					utility.notify(msg);
					setCurOperationInfo(false, msg);
					stop(msg);
					reloadCode();
				}
				else if (json.waitTime < 0) {
					var msg = '很抱歉, 未知的状态信息 : waitTime=' + json.waitTime + ', 可能已成功，请验证未支付订单.';
					setTipMessage(msg);
					utility.notifyOnTop(msg);
					location.href = '/otsweb/order/myOrderAction.do?method=queryMyOrderNotComplete&leftmenu=Y';
				} else {
					var msg = "订单需要 " + utility.getSecondInfo(json.waitTime) + " 处理完成， 请等待，不过你知道的，铁道部说的一直不怎么准。（排队人数=" + (json.waitCount || "未知") + "）";
					if (json.waitTime > 1800) {
						msg += "<span style='color:red; font-weight: bold;'>警告：排队时间大于30分钟，请不要放弃电话订票或用小号重新排队等其它方式继续订票！</span>";
					}
					setTipMessage(msg);

					if (json.waitTime > 1800 && !waitTimeTooLong_alert) {
						waitTimeTooLong_alert = true;
						utility.notifyOnTop("警告！排队时间大于30分钟，成功率较低，请尽快电话订票或用小号重新排队！");
					}

					utility.delayInvoke("#countEle", waitingForQueueComplete, 1000);
				}
			},
			error: function (json) {
				utility.notifyOnTop("请求发生异常，可能是登录状态不对，请验证。如果没有问题，请手动进入未完成订单页面查询。");
				self.location.reload();
			}
		});
	}


	$("div.tj_btn").append("<button class='long_button_u_down' type='button' id='btnAutoSubmit'>自动提交</button> <button class='long_button_u_down' type='button' id='btnCancelAuto' style='display:none;'>取消自动</button>");
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
	randEl.keyup(function (e) {
		if (!submitFlag && !document.getElementById("autoStartCommit").checked) return;

		if (e.charCode == 13 || randEl.val().length == 4) submitForm();
	});

	//清除上次保存的预定信息
	var lastform = null;
	if (parent) {
		lastform = parent.$("#orderForm");
		lastform.attr("success", "1");
	}

	//进度提示框
	$("table.table_qr tr:last").before("<tr><td style='border-top:1px dotted #ccc;height:100px;' colspan='9' id='orderCountCell'></td></tr><tr><td style='border-top:1px dotted #ccc;' colspan='9'><ul id='tipScript'>" +
	"<li class='fish_clock' id='countEle' style='font-weight:bold;'>等待操作</li>" +
	"<li style='color:green;'><strong>操作信息</strong>：<span>休息中</span></li>" +
	"<li style='color:green;'><strong>最后操作时间</strong>：<span>--</span></li></ul></td></tr>");

	var tip = $("#tipScript li");
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

	//提交频率差别
	$(".table_qr tr:last").before("<tr><td colspan='9'>自动提交失败时休息时间：<input type='text' size='4' class='input_20txt' style='text-align:center;' value='3' id='pauseTime' />秒 (不得低于1)  <label><input type='checkbox' id='autoStartCommit' /> 输入验证码后立刻开始自动提交</label> <label><input type='checkbox' id='showHelp' /> 显示帮助</label></td></tr>");
	document.getElementById("autoStartCommit").checked = typeof (window.localStorage["disableAutoStartCommit"]) == 'undefined';
	document.getElementById("showHelp").checked = typeof (window.localStorage["showHelp"]) != 'undefined';
	$("#autoStartCommit").change(function () {
		if (this.checked) window.localStorage.removeItem("disableAutoStartCommit");
		else window.localStorage.setItem("disableAutoStartCommit", "1");
	});
	$("#showHelp").change(function () {
		if (this.checked) {
			window.localStorage.setItem("showHelp", "1");
			$("table.table_qr tr:last").show();
		}
		else {
			window.localStorage.removeItem("showHelp");
			$("table.table_qr tr:last").hide();
		}
	}).change();

	//#region 自动刷新席位预定请求数

	var stopCheckCount = null;

	(function () {
		var data = { train_date: $("#start_date").val(), station: $("#station_train_code").val(), seat: "", from: $("#from_station_telecode").val(), to: $("#to_station_telecode").val(), ticket: $("#left_ticket").val() };
		var url = "confirmPassengerAction.do?method=getQueueCount";
		var allSeats = $("#passenger_1_seat option");
		var queue = [];
		var checkCountStopped = false;

		function beginCheck() {
			if (checkCountStopped) return;

			var html = [];
			html.push("当前实时排队状态（每隔2秒轮询）：");


			allSeats.each(function () {
				queue.push({ id: this.value, name: this.text });
				html.push("席位【<span style='color:blue; font-weight: bold;'>" + this.text + "</span>】状态：<span id='queueStatus_" + this.value + "'>等待查询中....</span>");
			});
			$("#orderCountCell").html(html.join("<br />"));
			if (queue.length > 0) executeQueue();
		}
		function checkTicketAvailable() {
			var queryLeftData = {
				'orderRequest.train_date': $('#start_date').val(),
				'orderRequest.from_station_telecode': $('#from_station_telecode').val(),
				'orderRequest.to_station_telecode': $('#to_station_telecode').val(),
				'orderRequest.train_no': $('#train_no').val(),
				'trainPassType': 'QB',
				'trainClass': 'QB#D#Z#T#K#QT#',
				'includeStudent': 00,
				'seatTypeAndNum': '',
				'orderRequest.start_time_str': '00:00--24:00'
			};
			utility.get("/otsweb/order/querySingleAction.do?method=queryLeftTicket", queryLeftData, "text", function (text) {
				window.ticketAvailable = '';
				if (/(([\da-zA-Z]\*{5,5}\d{4,4})+)/gi.test(text)) {
					window.ticketAvailable = RegExp.$1;
				}
			}, function () { });
		}
		function executeQueue() {
			if (checkCountStopped) return;

			var type = queue.shift();
			queue.push(type);

			data.seat = type.id;
			var strLeftTicket = '';
			checkTicketAvailable();
			if (window.ticketAvailable) {
				strLeftTicket = window.ticketAvailable;
			}
			utility.get(url, data, "json", function (data) {
				var msg = "余票：<strong>" + getTicketCountDesc(strLeftTicket, type.id) + "</strong>";
				msg += "，当前排队【<span style='color:blue; font-weight: bold;'>" + data.count + "</span>】，";
				if (data.op_2) {
					msg += "<span style='color:blue; font-weight: red;'>排队人数已经超过余票数，可能无法提交</span>。";
				} else {
					if (data.countT > 0) {
						msg += "排队人数已超过系统参数，<span style='color:red; font-weight: bold;'>排队有危险</span>";
						//} else if (data.op_1) {
						//	msg += "排队人数已超过系统参数，<span style='color:red; font-weight: bold;'>排队有危险</span>";
					} else {
						msg += "请尽快提交";
					}

				}
				msg += "&nbsp;&nbsp;&nbsp;&nbsp;(" + utility.getTimeInfo() + ")";

				$("#queueStatus_" + type.id).html(msg);
				setTimeout(executeQueue, 2000);
			}, function () {
				setTimeout(executeQueue, 3000);
			});
		}

		stopCheckCount = function () {
			checkCountStopped = true;
		}

		beginCheck();
	})();

	//#endregion


	//#region 自动选择联系人、自动选择上次选择的人
	function autoSelectPassenger() {
		var pp = localStorage.getItem("preSelectPassenger") || "";
		var pseat = (localStorage.getItem("autoSelect_preSelectSeatType") || "").split('|')[0];
		if (pp) {
			pp = pp.split("|");

			$.each(pp, function () {
				if (!this) return true;
				console.log("[INFO][自动选择乘客] 自动选定-" + this);
				$("#" + this + "._checkbox_class").attr("checked", true).click().attr("checked", true);	//为啥设置两次？我也不知道，反正一次不对。
				return true;
			});
			if (pseat) {
				$(".passenger_class").each(function () { $(this).find("select:eq(0)").val(pseat).change(); });
			}
		}
	};

	$(window).ajaxComplete(function (e, xhr, s) {
		if (s.url.indexOf("getpassengerJson") != -1) {
			console.log("[INFO][自动选择乘客] 系统联系人加载完成，正在检测预先选定");
			autoSelectPassenger();
		}
	});
	//如果已经加载完成，那么直接选定
	if ($("#showPassengerFilter div").length) {
		console.log("[INFO][自动选择乘客] OOPS，居然加载完成了？直接选定联系人");
		autoSelectPassenger();
	}
	//#endregion

	//#region 自动定位到随机码中

	(function () {
		var obj = document.getElementById("rand");

		var oldOnload = window.onload;
		window.onload = function () {
			if (oldOnload) oldOnload();
			obj.select();
		};
		obj.select();
	})();

	//#endregion

	//#region 显示内部的选择上下铺

	(function () {
		//添加上下铺显示
		$("tr.passenger_class").each(function () {
			var tr = $(this);
			var id = tr.attr("id");

			tr.find("td:eq(2)").append("<select id='" + id + "_seat_detail' name='" + id + "_seat_detail'><option value='0'>随机</option><option value='2'>上铺</option><option value='2'>中铺</option><option value='1'>下铺</option></select>");
		});

		var seatSelector = $("select[name$=_seat]");
		seatSelector.change(function () {
			var self = $(this);
			var val = self.val();
			var l = self.next();

			if (val == "2" || val == "3" || val == "4" || val == "6") {
				l.show();
			} else
				l.hide();
			var preseat = utility.getPref("preselectseatlevel");
			if (preseat) {
				l.val(preseat).change();
			}
		}).change();

	})();

	//#endregion

	parent.$("#main").css("height", ($(document).height() + 300) + "px");
	parent.window.setHeight(parent.window);
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
	//启用日志
	utility.enableLog();

	var initialized = false;
	var seatLevelOrder = null;
	var orderButtonClass = ".btn130_2";	//预定按钮的选择器

	//#region 参数配置和常规工具界面

	var queryCount = 0;
	var timer = null;
	var isTicketAvailable = false;
	var audio = null; //通知声音
	var timerCountDown = 0;
	var timeCount = 0;
	var autoBook = false;
	//初始化表单
	var form = $("form[name=querySingleForm] .cx_from:first");
	form.find("tr:last").after("<tr class='append_row'><td colspan='9' id='queryFunctionRow'><label title='勾选此选项的话，每次你查询后，助手会帮你把始发站、到达站、日期等进行记录，下次进入查询页面后，将会帮您自动填写好'><input type='checkbox' id='keepinfo' checked='checked' />记住信息</label> <label title='勾选此选项后，假定查询的结果中没有符合你要求的车次，那么助手将会自动进行重新查询'><input checked='checked' type='checkbox' id='autoRequery' />自动重新查询</label>，每隔 <input style='width:50px;' type='number' min='5' value='5' size='4' id='refereshInterval' style='text-align:center;' />秒(最低5) " +
		"<label title='勾选的话，当有票可定时，助手会放歌骚扰你'><input type='checkbox' checked='checked' id='chkAudioOn'>声音提示</label> <input type='button' id='chkSeatOnly' value='仅座票' class='lineButton' title='快速设置席别过滤按钮，点击后可快速勾选所有的座票，包括硬座软座一等座等等' /><input type='button' id='chkSleepOnly' value='仅卧铺' title='快速设置席别过滤按钮，点击后可快速勾选所有的卧铺，包括硬卧软卧什么的' class='lineButton' /><input type='button' id='chkAllSeat' value='全部席别' class='lineButton' title='快速勾选所有的席别' />" +
		"<input type='button' id='enableNotify' onclick='window.webkitNotifications.requestPermission();' value='点击启用桌面通知' style='line-height:25px;padding:5px;' /> <span id='refreshinfo'>已刷新 0 次，最后查询：--</span> <span id='refreshtimer'></span></td></tr>" +
		"<tr class='append_row'><td colspan='9'><label title='设置有票时放的歌是不是放到天荒地老至死不渝'><input type='checkbox' checked='checked' id='chkAudioLoop'>声音循环</label>" +
		"<span style='font-weight:bold;margin-left:10px;color:blue;' title='点击预定按钮时，有时候等待一会儿系统会提示服务器忙；勾选此选项后，如果出现这种情况，助手将会进行自动重新预定'><label><input type='checkbox' id='chkAutoResumitOrder' checked='checked' />预定失败时自动重试</label></span>" +
		"<span style='font-weight:bold;margin-left:10px;color:blue;' title='有时候系统忙，查询会提示查询失败；勾选此选项后，如果出现这种情况，助手将会进行自动刷新查询'><label><input type='checkbox' id='chkAutoRequery' checked='checked' />查询失败时自动重试</label></span>" +
		"<span style='font-weight:bold;margin-left:10px;color:pruple;' title='以服务器时间为准，未获得服务器时间之前，此选项不可用。启用智能加速模式时，在非正点附近时（大于0小于59分）按照正常速度刷新；当在正点附近时（大于等于59分时），暂停刷新并等到正点即刻刷新。'><label><input disabled='disabled' type='checkbox' id='chkSmartSpeed' />智能正点刷新模式</label></span>" +
		"</td></tr>" +
		"<tr class='append_row'><td id='filterFunctionRow' colspan='9'>" +
		"<span style='font-weight:bold;color:red;'><label title='不可以预定的车次过滤掉的选项（隐藏起来不显示，无票的车次）'><input type='checkbox' id='chkFilterNonBookable' />过滤不可预订的车次</label></span>" +
		"<span style='font-weight:bold;margin-left:10px;color:red;'><label title='有时候虽然整趟车可以预定，但是有票的席别都是你不要的，如果勾选此选项，也将会过滤掉'><input type='checkbox' id='chkFilterNonNeeded' />过滤不需要的席别</label></span>" +
		"<span style='font-weight:bold;margin-left:10px;color:blue;display: none;'><label><input disabled='disabled' type='checkbox' id='chkFilterByTrain' />开启按车次过滤</label></span>" +
		"</td></tr>" +
		"<tr><td colspan='9' id='opFunctionRow'><input type='button' class='fish_button' disabled='disabled' value='停止声音' id='btnStopSound' /><input  type='button' class='fish_button' disabled='disabled'  value='停止刷新' id='btnStopRefresh' /><input  type='button' class='fish_button' type='button' value='设置' id='configLink' /> <input type='button' class='fish_button' id='resetSettings' value='清空助手设置' /> <input type='button' class='fish_button configLink' value='IE登录' /> 【<a href='http://www.fishlee.net/soft/44/tour.html' style='color:purple;font-weight:bold;' target='_blank'>啊嘞……遇到不明白的啦？戳这里看教程呗</a>】<span style='margin-left:20px;color:purple;font-weight:bold;' id='serverMsg'></span></td> </tr>"
	);

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
	$("#resetSettings").click(function () {
		if (confirm("确定要清空助手的所有设置吗？")) {
			window.localStorage.clear();
			self.location.reload();
			return false;
		}
	});

	//操作控制
	$("#btnStopRefresh").click(function () { resetTimer(); });
	$("#chkSmartSpeed").change(function () {
	});

	//#endregion

	//#region 显示座级选择UI
	var ticketType = new Array();
	var seatOptionTypeMap = {
		"3": "9",
		"4": "P",
		"5": "M",
		"6": "O",
		"7": "6",
		"8": "4",
		"9": "3",
		"10": "2",
		"11": "1",
		"12": "empty",
		"13": "QT"
	};
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
		var c = $("<input id='seatoption_" + seatOptionTypeMap[i] + "' type='checkbox' typecode='" + seatOptionTypeMap[i] + "' name='seatoption'/>").attr("checked", ticketType[i]);
		c[0].ticketTypeId = i;
		c.change(
			function () {
				ticketType[this.ticketTypeId] = this.checked;
				window.localStorage["typefilter_" + this.ticketTypeId] = this.checked;
			}).appendTo(obj);
	});

	//座级选择
	$("#chkSeatOnly").click(function () {
		$(".hdr tr:eq(2) td").each(function (i, e) {
			var obj = $(this);
			var txt = obj.attr("otext");
			obj.find("input").attr("checked", typeof (txt) != 'undefined' && txt && txt.indexOf("座") != -1).change();
		});
	});
	$("#chkSleepOnly").click(function () {
		$(".hdr tr:eq(2) td").each(function (i, e) {
			var obj = $(this);
			var txt = obj.attr("otext");
			obj.find("input").attr("checked", typeof (txt) != 'undefined' && txt && txt.indexOf("卧") != -1).change();
		});
	});
	$("#chkAllSeat").click(function () {
		$(":checkbox[name=seatoption]").attr("checked", true).change();
	});
	//#endregion

	//#region 显示额外的功能区
	var extrahtml = [];
	extrahtml.push("<div class='outerbox' id='helperbox' style='width:auto;'><div class='box'><div class='title' style='position:relative;'>辅助工具 [<a href='#querySingleForm'>返回订票列表</a>] <div style='color:#066DFF;position:absolute;background-color: #eee;border: 1px solid purple;right:0px;top:0px;padding:2px;margin:2px;' title='时间依赖于本地时间保持在线刷新时间即时计算。受限于您的网速，并不十分准确（需要扣除网速的影响）' id='servertime'>服务器时间：<strong>----</strong>，本地时间：<strong>----</strong>，服务器比本地 <strong>----</strong></div></div>\
<table id='helpertooltable' style='width:100%;'><colgroup><col style='width:110px;' /><col style='width:370px;' /><col style='width:110px;' /><col style='width:auto;' /></colgroup>\
<tr class='fish_sep musicFunc' id='helperbox_bottom'><td class='name'>自定义音乐地址</td><td colspan='3'><input type='text' id='txtMusicUrl' value='" + utility.getAudioUrl() + "' onfocus='this.select();' style='width:50%;' /> <input type='button' onclick='new Audio(document.getElementById(\"txtMusicUrl\").value).play();' value='测试'/><input type='button' onclick='utility.resetAudioUrl(); document.getElementById(\"txtMusicUrl\").value=utility.getAudioUrl();' value='恢复默认'/> (地址第一次使用可能会需要等待一会儿)</td></tr>\
<tr class='fish_sep musicFunc'><td class='name'>可用音乐地址</td><td colspan='3'>");

	var host1 = "http://resbak.fishlee.net/res/";
	//var host2 = "https://github.com/iccfish/12306_ticket_helper/raw/master/res/";
	var musics = [["music1.ogg", "超级玛丽"], ["music2.ogg", "蓝精灵"]];
	$.each(musics, function () {
		extrahtml.push("<a href='javascript:;' url='" + host1 + this[0] + "' class='murl'>" + this[1] + "</a>&nbsp;&nbsp;&nbsp;&nbsp;");
		//extrahtml.push("<a href='javascript:;' url='" + host2 + this[0] + "' class='murl'>" + this[1] + "</a>(HTTPS)&nbsp;&nbsp;&nbsp;&nbsp;");
	});

	extrahtml.push("</td></tr><tr class='fish_sep'><td colspan='4'><input type='button' value='添加自定义车票时间段' id='btnDefineTimeRange' />\
<input type='button' value='清除自定义车票时间段' id='btnClearDefineTimeRange' /></td></tr>\
<tr class='fish_sep'><td style='text-align:center;' colspan='4'><a href='http://www.fishlee.net/soft/44/' target='_blank' style='color:purple;'>12306.CN 订票助手 by iFish(木鱼)</a> | <a href='http://t.qq.com/ccfish/' target='_blank' style='color:blue;'>腾讯微博</a> | <a href='http://www.fishlee.net/soft/44/announcement.html' style='color:blue;' target='_blank'>免责声明</a> | <a href='http://www.fishlee.net/Discussion/Index/44' target='_blank'>反馈BUG</a> | <a style='font-weight:bold;color:red;' href='http://www.fishlee.net/soft/44/donate.html' target='_blank'>捐助作者</a> | 版本 v" + window.helperVersion + "，许可于 <strong>" + utility.regInfo.name + "，类型 - " + utility.regInfo.typeDesc + "</strong> 【<a href='javascript:;' class='reSignHelper'>重新注册</a>】</td></tr>\
		</table></div></div>");

	$("body").append(extrahtml.join(""));
	$("a.murl").live("click", function () {
		$("#txtMusicUrl").val(this.getAttribute("url")).change();
	});
	$("#stopBut").before("<div class='jmp_cd' style='text-align:center;'><button class='fish_button' id='btnFilter'>加入黑名单</button><button class='fish_button' id='btnAutoBook'>自动预定本车次</button></div>");
	$("#txtMusicUrl").change(function () { window.localStorage["audioUrl"] = this.value; });
	$("form[name=querySingleForm]").attr("id", "querySingleForm");

	//#endregion

	//#region 添加自定义时间段
	function addCustomTimeRange() {
		var s = parseInt(prompt("请输入自定义时间段的起始时间（请填入小时，0-23）", "0"));
		if (isNaN(s) || s < 0 || s > 23) {
			alert("起始时间不正确 >_<"); return;
		}
		var e = parseInt(prompt("请输入自定义时间段的结束时间（请填入小时，1-24）", "24"));
		if (isNaN(e) || e < 0 || e > 24) {
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
	//#endregion

	//#region 过滤车次
	var stopHover = window.onStopHover;
	window.onStopHover = function (info) {
		$("#stopDiv").attr("info", $.trim($("#id_" + info.split('#')[0]).text()));
		stopHover.call(this, info);
		$("#onStopHover").css("overflow", "hide");
	};

	$("#btnFilter").click(function () {
		//加入黑名单
		var trainNo = $("#stopDiv").attr("info").split('#')[0];
		if (!trainNo || !confirm("确定要将车次【" + trainNo + "】加入黑名单？以后的查询将不再显示此车次。")) return;

		list_blacklist.add(trainNo);
	});
	$("#btnAutoBook").click(function () {
		//加入自动预定列表
		var trainNo = $("#stopDiv").attr("info").split('#')[0];
		if (isTrainInBlackList(trainNo)) {
			alert("指定的车次在黑名单里呢……");
			return;
		}

		if (!trainNo || !confirm("确定要将车次【" + trainNo + "】加入自动预定列表？如果下次查询有符合要求的席别将会自动进入预定页面。")) return;

		list_autoorder.add(trainNo);
	});
	//清除进入指定页面后提示的标记位
	if (window.localStorage["bookTip"]) window.localStorage.removeItem("bookTip");
	//#endregion

	//#region 自动重新查询

	var clickButton = null;//点击的查询按钮
	var filterNonBookable = $("#chkFilterNonBookable")[0];	//过滤不可定车次
	var filterNonNeeded = $("#chkFilterNonNeeded")[0];	//过滤不需要车次
	var onRequery = function () { };	//当重新查询时触发
	var onNoTicket = function () { };	//当没有查到票时触发

	$("#autoRequery").change(function () {
		if (!this.checked)
			resetTimer();
	});
	//刷新时间间隔
	$("#refereshInterval").change(function () { timeCount = Math.max(5, parseInt($("#refereshInterval").val())); }).change();

	//定时查询
	var isSmartOn = false;
	function resetTimer() {
		queryCount = 0;
		$("#btnStopRefresh")[0].disabled = true;
		if (timer) {
			clearInterval(timer);
			timer = null;
		}
		$("#refreshtimer").html("");
	}

	function countDownTimer() {
		timerCountDown -= 0.2;
		var str = (Math.round(timerCountDown * 10) / 10) + "";
		$("#refreshtimer").html("[" + (isSmartOn ? "等待正点," : "") + str + (str.indexOf('.') == -1 ? ".0" : "") + "秒后查询...]");

		if (timerCountDown > 0) return;

		clearInterval(timer);
		timer = null;
		onRequery();
		doQuery();
	}

	function startTimer() {
		if (timer) return;

		var d = new Date().getMinutes();
		isSmartOn = document.getElementById("chkSmartSpeed").checked && time_server && time_server.getMinutes() >= 59;

		timerCountDown = isSmartOn ? 60 - time_server.getSeconds() + 2 : timeCount;
		var str = (Math.round(timerCountDown * 10) / 10) + "";
		$("#refreshtimer").html("[" + (isSmartOn ? "等待正点," : "") + timerCountDown + (str.indexOf('.') == -1 ? ".0" : "") + "秒后查询...]");
		//没有定时器的时候，开启定时器准备刷新
		$("#btnStopRefresh")[0].disabled = false;
		timer = setInterval(countDownTimer, 200);
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
		sendQueryFunc.call(clickBuyStudentTicket == "Y" ? document.getElementById("stu_submitQuery") : document.getElementById("submitQuery"));
	}

	//验证车票有开始
	var onticketAvailable = function () {
		resetTimer();
		$("#refreshinfo").html("已经有票鸟！");

		utility.notifyOnTop("可以订票了！");
		if (window.Audio && $("#chkAudioOn")[0].checked) {
			if (!audio) {
				audio = new Audio($("#txtMusicUrl").val());
			}
			audio.loop = $("#chkAudioLoop")[0].checked;
			$("#btnStopSound")[0].disabled = false;
			audio.play();
		}
	}
	//检查是否可以订票
	var checkTicketsQueue = [];
	var checkTicketCellsQueue = [];

	function getTrainNo(row) {
		/// <summary>获得行的车次号</summary>
		return $.trim($("td:eq(0)", row).text());
	}
	//默认的单元格检测函数
	checkTicketCellsQueue.push(function (i, e) {
		if (!ticketType[i - 1]) return 0;

		var el = $(e);
		var info = $.trim(el.text()); //Firefox不支持 innerText

		if (info == "*" || info == "--" || info == "无") {
			return 0;
		}
		return 2;
	});
	//默认的行检测函数
	checkTicketsQueue.push(function () {
		var trainNo = getTrainNo(this);
		var tr = this;
		this.attr("tcode", trainNo);
		//黑名单过滤
		if (isTrainInBlackList(trainNo)) {
			this.hide();
			return 0;
		}


		var hasTicket = 1;
		if ($("a.btn130", this).length > 0) return 0;

		$("td", this).each(function (i, e) {
			var cellResult = 0;
			e = $(e);
			var opt = { code: trainNo, tr: tr, index: e.index(), seatType: seatOptionTypeMap[e.index() - 1] };
			e.attr("scode", opt.seatType);
			$.each(checkTicketCellsQueue, function () {
				cellResult = this(i, e, cellResult, opt) || cellResult;
				return cellResult != 0;
			});
			e.attr("result", cellResult);
			if (cellResult == 2) {
				hasTicket = 2;
				e.css("background-color", "#95AFFD");
			}
		});
		tr.attr("result", hasTicket);

		return hasTicket;
	});

	//检测是否有余票的函数
	var checkTickets = function () {
		var result = 0;
		var row = this;
		$.each(checkTicketsQueue, function () {
			result = this.call(row, result);

			return true;
		});

		return result;
	}

	//目标表格，当ajax完成时检测是否有票
	$("body").ajaxComplete(function (e, r, s) {
		//HACK-阻止重复调用
		if (timer != null) return;

		if (s.url.indexOf("queryLeftTicket") == -1)
			return;

		//验证有票
		var rows = $("table.obj tr:gt(0)");
		var ticketValid = false;
		var validRows = {};
		rows.each(function () {
			var row = $(this);
			var valid = checkTickets.call(row);
			var code = getTrainNo(row);

			row.attr("tcode", code);
			row.find("td:eq(0)").click(putTrainCodeToList);

			console.log("[INFO][车票可用性校验] " + code + " 校验结果=" + valid);

			if (valid == 2) {
				row.css("background-color", "#FD855C");
				validRows[code] = row;
			}
			else {
				if (valid == 1 && filterNonNeeded.checked) row.hide();
				if (valid == 0 && filterNonBookable.checked) row.hide();
			}
			ticketValid = ticketValid || valid == 2;
		});

		//自动预定
		if ($("#swAutoBook:checked").length > 0) {
			if (!seatLevelOrder || !seatLevelOrder.length) {
				//没有席别优先级，那选第一个
				for (var idx in list_autoorder.datalist) {
					var code = list_autoorder.datalist[idx];
					var reg = utility.getRegCache(code);
					var row = $.first(validRows, function (i, v) {
						if (reg.test(i)) return v;
					});

					if (row) {
						if (document.getElementById("autoBookTip").checked) {
							window.localStorage["bookTip"] = 1;
						}
						row.find("a[name=btn130_2]").click();

						return false;
					}
				};
			} else {
				console.log("按席别优先选择-车次过滤");
				var trains = $.makeArray($("#gridbox tr[result=2]"));

				var trainfiltered = [];
				for (var idx in list_autoorder.datalist) {
					//对车次进行过滤并按优先级排序
					var rule = list_autoorder.datalist[idx];
					var ruleTester = utility.getRegCache(rule);
					for (var i = trains.length - 1; i >= 0; i--) {
						var self = $(trains[i]);
						var code = self.attr("tcode");

						if (ruleTester.test(code)) {
							trainfiltered.push(self);
							trains.splice(i, 1);
						}
					}
				}
				if (document.getElementById("autoorder_method").selectedIndex == 0) {
					$.each(seatLevelOrder, function () {
						var scode = this;
						for (var i in trainfiltered) {
							var t = trainfiltered[i];
							if (t.find("td[scode=" + this + "][result=2]").length) {
								var tcode = scode == "empty" ? "1" : scode;

								window.localStorage.setItem("autoSelect_preSelectSeatType", tcode);
								$("#preSelectSeat").val(tcode)

								if (document.getElementById("autoBookTip").checked) {
									window.localStorage["bookTip"] = 1;
								}
								t.find(orderButtonClass).click();

								return false;
							}
						}
						return true;
					});
				} else {
					//车次优先
					$.each(trainfiltered, function () {
						var t = this;
						for (var i in seatLevelOrder) {
							var scode = seatLevelOrder[i];
							if (t.find("td[scode=" + scode + "][result=2]").length) {
								var tcode = scode == "empty" ? "1" : scode;

								window.localStorage.setItem("autoSelect_preSelectSeatType", tcode);
								$("#preSelectSeat").val(tcode)

								if (document.getElementById("autoBookTip").checked) {
									window.localStorage["bookTip"] = 1;
								}
								t.find(orderButtonClass).click();

								return false;
							}
						}
						return true;
					});
				}
			}
		}

		if (ticketValid) {
			onticketAvailable();
		} else if (document.getElementById("autoRequery").checked) {
			onNoTicket();
			startTimer();
		}
	});

	//系统繁忙时自动重复查询 chkAutoResumitOrder
	$("#orderForm").submit(function () {
		if ($("#chkAutoResumitOrder")[0].checked) {
			parent.$("#orderForm").remove();
			parent.$("body").append($("#orderForm").clone(false).attr("target", "main").attr("success", "0"));
		}
	});
	$("body").ajaxComplete(function (e, r, s) {
		if (!$("#chkAutoRequery")[0].checked) return;
		if (s.url.indexOf("/otsweb/order/querySingleAction.do") != -1 && r.responseText == "-1") {
			//invalidQueryButton();
			//delayButton();
			//startTimer();
		} else {
			$("#serverMsg").html("");
		}
	});
	$("body").ajaxError(function (e, r, s) {
		if (s.url.indexOf("queryLeftTicket") == -1) return;
		if (!$("#chkAutoRequery")[0].checked) return;
		if (s.url.indexOf("/otsweb/order/querySingleAction.do") != -1) {
			delayButton();
			startTimer();
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
	//#endregion

	//#region 配置加载、保存、权限检测
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

	//音乐
	if (!window.Audio) {
		$(".musicFunc").hide();
	}
	//#endregion

	//#region 时间快捷修改
	(function () {
		var datebox = $("table.cx_from tr:eq(0) td:eq(5), table.cx_from tr:eq(1) td:eq(3)");
		datebox.width("170px");
		datebox.find("input").width("70px").before('<input type="button" class="date_prev lineButton" value="&lt;">').after('<input type="button" class="date_next lineButton" value="&gt;">');

		datebox.find(".date_prev").click(function () { var dobj = $(this).next(); dobj.val(utility.formatDate(utility.addTimeSpan(utility.parseDate(dobj.val()), 0, 0, -1, 0, 0, 0))).change(); });
		datebox.find(".date_next").click(function () { var dobj = $(this).prev(); dobj.val(utility.formatDate(utility.addTimeSpan(utility.parseDate(dobj.val()), 0, 0, 1, 0, 0, 0))).change(); });
	})();
	//#endregion

	//#region 自动轮询，自动更改时间
	(function () {	//初始化UI
		var html = "<tr class='fish_sep' id='autoChangeDateRow'><td class='name'>查询日期</td><td>\
<label><input type='checkbox' id='autoCorrentDate' checked='checked' /> 查询日期早于或等于今天时，自动修改为明天</label>\
</td><td class='name'>自动轮查</td><td><label><input type='checkbox' id='autoChangeDate' /> 无票时自动更改日期轮查</label>\
</td></tr><tr class='fish_sep' style='display:none;'><td class='name'>轮查日期设置</td><td colspan='3' id='autoChangeDateList'></td></tr>\
	";
		$("#helperbox_bottom").before(html);
		var autoChangeDateList = $("#autoChangeDateList");
		var html = [];
		var now = new Date();
		for (var i = 0; i < 20; i++) {
			now = utility.addTimeSpan(now, 0, 0, 1, 0, 0, 0);
			html.push("<label style='margin-right:16px;'><input type='checkbox' value='" + utility.formatDate(now) + "' cindex='" + i + "' />" + utility.formatDateShort(now) + "</label>");
			if ((i + 1) % 10 == 0)
				html.push("<br />");
		}
		autoChangeDateList.html(html.join(""));
		$("#autoChangeDate").change(function () {
			var tr = $(this).closest("tr").next();
			if (this.checked) tr.show();
			else tr.hide();
		});
		//配置
		utility.reloadPrefs($("#autoChangeDateRow"), "autoChangeDateRow");
		//日期点选
		var stKey = "autoChangeDateRow_dates";
		var stValue = window.localStorage.getItem(stKey);
		if (typeof (stValue) != 'undefined' && stValue) {
			var array = stValue.split('|');
			autoChangeDateList.find(":checkbox").each(function () {
				this.checked = $.inArray(this.value, array) != -1;
			});
		}
		autoChangeDateList.find(":checkbox").change(function () {
			var value = $.map(autoChangeDateList.find(":checkbox:checked"), function (e, i) { return e.value; }).join("|")
			window.localStorage.setItem(stKey, value);
		});
	})();
	(function () {
		//如果当前查询日期在当前日期或之前，那么自动修改日期
		$("#startdatepicker, #roundTrainDate").change(function () {
			if (!document.getElementById("autoCorrentDate").checked) return;
			var obj = $(this);
			var val = utility.parseDate(obj.val());
			var tomorrow = utility.addTimeSpan(utility.getDate(new Date()), 0, 0, 1, 0, 0, 0);

			if (!val || isNaN(val.getFullYear()) || tomorrow > val) {
				console.log("自动修改日期为 " + utility.formatDate(tomorrow));
				obj.val(utility.formatDate(tomorrow));
			}
		}).change();
	})();
	onNoTicket = (function (callback) {
		return function () {
			//Hook onNoTicket
			callback();

			if (!document.getElementById("autoChangeDate").checked) return;
			console.log("自动轮询日期中。");

			var index = parseInt($("#autoChangeDate").attr("cindex"));
			if (isNaN(index)) index = -1;
			var current = index == -1 ? [] : $("#autoChangeDateList :checkbox:eq(" + index + ")").parent().nextAll(":has(:checked):eq(0)").find("input");
			if (current.length == 0) {
				index = 0;
				current = $("#autoChangeDateList :checkbox:checked:first");
				if (current.length == 0) return;	//没有选择任何
			}
			index = current.attr("cindex");
			if (current.length > 0) {
				$("#autoChangeDate").attr("cindex", index);
				$("#startdatepicker").val(current.val());
				//高亮
				$("#cx_titleleft span").css({ color: 'red', 'font-weight': 'bold' });
			}
		};
	}
		)(onNoTicket);
	//#endregion

	//#region 拦截弹出的提示框，比如服务器忙
	(function () {
		var _bakAlert = window.alert;
		window.alert = function (msg) {
			if (msg.indexOf("服务器忙") != -1) {
				$("#serverMsg").text(msg);
			} else _bakAlert(msg);
		}
	})();
	//#endregion

	//#region 默认加入拦截Ajax缓存
	(function () { $.ajaxSetup({ cache: false }); })();
	//#endregion

	//#region 显示所有的乘客
	var list_autoorder = null;
	var list_blacklist = null;
	var list_whitelist = null;

	function isTrainInBlackList(trainNo) {
		/// <summary>返回指定的车次是否在黑名单中</summary>
		return document.getElementById("swBlackList").checked && (list_blacklist.isInRegList(trainNo)) && !(document.getElementById("swWhiteList").checked && list_whitelist.isInRegList(trainNo));
	}

	function putTrainCodeToList() {
		var code = $(this).closest("tr").attr("tcode");

		if (confirm("是否要将【" + code + "】加入自动预定列表？如果不是，请点击取消并继续选择是否加入黑名单或白名单。")) {
			list_autoorder.add(code);
		} else if (confirm("是否要将【" + code + "】加入黑名单？如果不是，请点击取消并继续选择是否加入白名单。")) {
			list_blacklist.add(code);
		} else if (confirm("是否要将【" + code + "】加入白名单？")) {
			list_whitelist.add(code);
		};
	}

	(function () {
		var html = "\
<tr class='fish_sep caption'><td><label><input type='checkbox' id='swWhiteList' checked='checked' /> 车次白名单</label></td><td style='font-weight:normal;' colspan='2'>加入白名单的车次，将不会被过滤(仅为搭配黑名单)</td><td style='text-align:rigth;'><button class='fish_button' id='btnAddWhite'>添加</button><button class='fish_button' id='btnClearWhite'>清空</button></td></tr>\
<tr class='fish_sep'><td colspan='4' id='whiteListTd'></td></tr>\
<tr class='fish_sep caption'><td><label><input type='checkbox' id='swBlackList' checked='checked' name='swBlackList' />车次黑名单</label></td><td style='font-weight:normal;' colspan='2'>加入黑名单的车次，除非在白名单中，否则会被直接过滤而不会显示</td><td style='text-align:rigth;'><button class='fish_button' id='btnAddBlack'>添加</button><button class='fish_button' id='btnClearBlack'>清空</button></td></tr>\
<tr class='fish_sep'><td colspan='4' id='blackListTd'></td></tr>\
<tr class='caption autoorder_steps fish_sep' id='selectPasRow'><td colspan='3'><span class='hide indicator'>① </span>自动添加乘客 （加入此列表的乘客将会自动在提交订单的页面中添加上，<strong>最多选五位</strong>）</td><td><input type='button' class='fish_button' onclick=\"self.location='/otsweb/passengerAction.do?method=initAddPassenger&';\" value='添加联系人' /> (提示：新加的联系人五分钟之内无法订票)</td></tr>\
<tr class='fish_sep'><td class='name'>未选择</td><td id='passengerList' colspan='3'><span style='color:gray; font-style:italic;'>联系人列表正在加载中，请稍等...如果长时间无法加载成功，请尝试刷新页面  x_x</span></td></tr>\
<tr class='fish_sep'><td class='name'>已选择</td><td id='passengerList1' colspan='3'></td></tr>\
<tr class='fish_sep autoordertip' style='display:none;'><td class='name'>部分提交订单</td><td><label><input type='checkbox' id='autoorder_part' /> 当票数不足时，允许为部分的联系人先提交订单</label></td><td class='name'>提交为学生票</td><td><label><input type='checkbox' id='autoorder_stu' /> 即使是普通查询，也为学生联系人提交学生票</label></td></tr>\
<tr class='fish_sep autoorder_steps caption' id='seatLevelRow'><td><span class='hide indicator'>② </span>席别优先选择</td><td><input type='hidden' id='preSelectSeat' /><select id='preSelectSeatList'></select> (选中添加，点击按钮删除；<a href='http://www.fishlee.net/soft/44/tour.html' target='_blank'>更多帮助</a>)</td><td style='text-align:right;'>卧铺优选</td><td><select id='preselectseatlevel'></select>(不一定有用的啦……呵呵呵呵呵呵……)</td></tr>\
<tr class='fish_sep'><td colspan='4' id='preseatlist'><div id='preseatlist_empty' style='padding:5px; border: 1px dashed gray; background-color:#eee;width:200px;'>(尚未指定，请从上面的下拉框中选定)</div></td></tr>\
<tr class='fish_sep autoorder_steps caption'><td><label><input type='checkbox' id='swAutoBook' name='swAutoBook' checked='checked' /><span class='hide indicator'>③</span> 自动预定</label></td><td colspan='2' style='font-weight:normal;'><select id='autoorder_method'><option value='0'>席别优先</option><option value='1'>车次优先</option></select>如果启用，符合规则的车次的特定席别有效时，将会进入预定页面</td><td style='text-align:rigth;'><button id='btnAddAutoBook' class='fish_button'>添加</button><button id='btnClearAutoBook' class='fish_button'>清空</button></td></tr>\
<tr class='fish_sep'><td colspan='4' id='autobookListTd'></td></tr>\
<tr class='fish_sep'><td colspan='4'><label><input type='checkbox' id='autoBookTip' checked='checked' /> 如果自动预定成功，进入预定页面后播放提示音乐并弹窗提示</label></td></tr>\
<tr class='fish_sep autoordertip' style='display:none;'><td class='name'>自动回滚</td><td><label><input type='checkbox' id='autoorder_autocancel' /> 自动提交失败时，自动取消自动提交并再次预定</label></td></tr>\
<tr class='caption autoorder_steps fish_sep highlightrow'><td class='name autoordertd'><label style='display:none;color:red;'><input type='checkbox' id='autoorder'/>自动提交订单</label></td><td class='autoordertd' colspan='3'><p style='display:none;'><img id='randCode' src='/otsweb/passCodeAction.do?rand=randp' /> <input size='4' maxlength='4' type='text' id='randCodeTxt' /> (验证码可在放票前填写，临近放票时建议点击图片刷新并重新填写，以策安全。请务必控制好阁下的眼神……)</p></td></tr>\
<tr style='display:none;' class='autoordertip fish_sep'><td class='name' style='color:red;'>警告</td><td colspan='3' style='color:darkblue;'>\
<p style='font-weight:bold; color:purple;'>自动提交订单使用流程：勾选要订票的联系人 -&gt; 设置需要的席别 -&gt; 将你需要订票的车次按优先级别加入自动预定列表 -&gt; 勾选自动提交订单 -&gt; 输入验证码 -&gt; 开始查票。信息填写不完整将会导致助手忽略自动提交订单，请务必注意。进入自动订票模式后，席别选择和自动预定都将被锁定而无法手动切换。如果查询的是学生票，那么提交的将会是学生票订单。<u style='color:red;'>一切都设置完成后，请点击查询开始查票。一旦有票将会自动提交。</u></p>\
<p>1. 自动提交订单使用的是自动预定的列表顺序，取第一个有效的车次自动提交订单！请确认设置正确！！</p>\
<p>2. 自动提交的席别和联系人请在上方选择，和预设的是一致的，暂不支持不同的联系人选择不同的席别；</p>\
<p>3. 作者无法保证自动提交是否会因为铁老大的修改失效，因此请务必同时使用<b>其它浏览器</b>手动提交订单！否则可能会造成您不必要的损失！</p>\
<p style='font-weight:bold;'>5. 当助手第一次因为功能性自动提交失败后（非网络错误和验证码错误，如余票不足、占座失败等），将会立刻禁用自动提交并回滚到普通提交，并再次提交订票请求，因此请时刻注意提交结果并及时填写内容，并强烈建议你另外打开单独的浏览器同时手动下订单！！</p>\
<p style='font-weight:bold;color:darkcylan;'>6. 为可靠起见，建议每隔一段时间刷新下验证码重新填写（点击验证码图片刷新）。由于不同的浏览器刷新的结果不一样，强烈建议多个浏览器或多台机子一起刷新！</p>\
<p style='font-size:16px; font-weight:bold;color:blue;'>一定要仔细看说明啊！切记多个浏览器准备不要老想着一棵树上吊死啊！千万不要因为自动提交订单导致你订不到票啊！！这样老衲会内疚的啊！！！！</p>\
</td></tr>";
		$("#helpertooltable tr:first").addClass("fish_sep").before(html);

		//优选逻辑
		$("#autoorder_method").val(window.localStorage["autoorder_method"] || "0").change(function () { window.localStorage.setItem("autoorder_method", $(this).val()); });
		$("#autoorder_autocancel").attr("checked", (window.localStorage["autoorder_autocancel"] || "1") == "1").change(function () { window.localStorage.setItem("autoorder_autocancel", this.checked ? "1" : "0"); });

		//自动预定列表
		list_autoorder = utility.selectionArea.call($("#autobookListTd"), { syncToStorageKey: "list_autoBookList", onAdd: onAutoOrderRowStyle, onRemove: onAutoOrderRowStyle, onClear: onAutoOrderRowStyle });
		list_blacklist = utility.selectionArea.call($("#blackListTd"), { syncToStorageKey: "list_blackList" });
		list_whitelist = utility.selectionArea.call($("#whiteListTd"), { syncToStorageKey: "list_whiteList" });

		var autoBookHeader = $("#swAutoBook").closest("tr");
		function onAutoOrderRowStyle() {
			if (!document.getElementById("autoorder").checked) return;

			autoBookHeader.removeClass("steps stepsok");
			autoBookHeader.addClass(list_autoorder.datalist.length ? "stepsok" : "steps");
		}

		function appendTrainCodeToList(target) {
			var code = prompt("请输入您要加入列表的车次。车次可以使用正则表达式（亲，不知道的话请直接填写车次编号喔），比如 【.*】(不包括【】号) 可以代表所有车次，【K.*】可以代表所有K字头的车次，【D.*】可以代表所有D字头车次等等");
			if (!code) return;

			//修正部分符号
			code = code.replace(/(，|,|\/|\\|、|-)/g, "|");
			try {
				new RegExp(code);
			} catch (e) {
				alert("嗯……看起来同学您输入的不是正确的正则表达式哦。");
				return;
			}

			target.add(code);
		}

		function emptyList(target) {
			target.emptyList();
		}


		//绑定添加清空事件
		$("#btnAddAutoBook").click(function () { appendTrainCodeToList(list_autoorder); });
		$("#btnAddWhite").click(function () { appendTrainCodeToList(list_whitelist); });
		$("#btnAddBlack").click(function () { appendTrainCodeToList(list_blacklist); });
		$("#btnClearAutoBook").click(function () { emptyList(list_autoorder); });
		$("#btnClearWhite").click(function () { emptyList(list_whitelist); });
		$("#btnClearBlack").click(function () { emptyList(list_blacklist); });

		$("#swBlackList, #swAutoBook").each(function () {
			var obj = $(this);
			var name = obj.attr("name");

			var opt = localStorage.getItem(name);
			if (opt != null) this.checked = opt == "1";
		}).change(function () {
			var obj = $(this);
			var name = obj.attr("name");

			localStorage.setItem(name, this.checked ? "1" : "0");
		});

		var seatlist = [
			["", "=请选择="],
			["9", "商务座"],
			["P", "特等座"],
			["6", "高级软卧"],
			["4", "软卧"],
			["3", "硬卧"],
			["2", "软座"],
			["1", "硬座"],
			["empty", "硬座(无座)"],
			["M", "一等座"],
			["O", "二等座"]
		];
		var level = [[0, '随机'], [3, "上铺"], [2, '中铺'], [1, '下铺']];
		var seatDom = document.getElementById("preSelectSeatList");
		var seatLevelDom = document.getElementById("preselectseatlevel");
		$.each(seatlist, function () {
			seatDom.options[seatDom.options.length] = new Option(this[1], this[0]);
		});
		$.each(level, function () {
			seatLevelDom.options[seatLevelDom.options.length] = new Option(this[1], this[0]);
		});
		//刷新优选列表
		var seatLevelRow = $("#seatLevelRow");
		function refreshSeatTypeOrder() {
			var list = $("#preseatlist input");
			if (initialized) $(":checkbox[name=seatoption]").attr("checked", false).change();
			seatLevelOrder = [];
			list.each(function () {
				var code = $(this).attr("code");
				seatLevelOrder.push(code);
				if (initialized) $("#seatoption_" + code).attr("checked", true).change();
			});
			if (!list.length) {
				$("#preseatlist_empty").show();
				$(":checkbox[name=seatoption]").attr("checked", true).change();
				window.localStorage.setItem("autoSelect_preSelectSeatType", "");
			} else {
				$("#preseatlist_empty").hide();
				window.localStorage.setItem("autoSelect_preSelectSeatType", seatLevelOrder[0]);
			}
			if (initialized) utility.notifyOnTop("已经根据您选择的席别自动切换了席别过滤选项，请注意，并作出需要的调整。");
			window.localStorage.setItem("preSelectSeatType", seatLevelOrder.join('|'));

			if (document.getElementById("autoorder").checked) {
				seatLevelRow.removeClass("stepsok steps");
				seatLevelRow.addClass(seatLevelOrder.length ? "stepsok" : "steps");
			}
		}
		//选中后添加到列表中
		$("#preSelectSeatList").change(function () {
			var index = seatDom.selectedIndex;
			if (index == 0) return;

			//添加
			var opt = seatDom.options[index];
			var html = "<input type='button' title='点击删除' class='seatTypeButton lineButton' value='" + opt.text + "' code='" + opt.value + "' />";
			$("#preseatlist").append(html);
			$("#preseatlist_empty").hide();
			//当前选项移除
			seatDom.options[index] = null;
			seatDom.selectedIndex = 0;
			refreshSeatTypeOrder();
		});
		//席别的按钮点击后自动删除
		$("input.seatTypeButton").live("click", function () {
			var btn = $(this);
			btn.remove();

			//加回列表
			var code = btn.attr("code");
			var name = btn.val();
			seatDom.options[seatDom.options.length] = new Option(name, code);

			//刷新列表
			refreshSeatTypeOrder();
		});
		(function () {
			var preseattype = window.localStorage.getItem("preSelectSeatType") || window.localStorage.getItem("autoSelect_preSelectSeatType");
			if (!preseattype) return;

			preseattype = preseattype.split('|');
			var el = $(seatDom);
			$.each(preseattype, function () { el.val(this + ""); el.change(); });
		})();
		$(seatLevelDom).val(window.localStorage.getItem("preselectseatlevel") || "").change(function () {
			window.localStorage.setItem("preselectseatlevel", $(this).val());
		});
		var pre_autoorder_book_status;
		$("#autoorder").click(function () {
			if (this.checked) {
				pre_autoorder_book_status = document.getElementById("swAutoBook").checked;
				document.getElementById("swAutoBook").checked = true;
				//alert("警告！选中将会启用自动下单功能，并取代自动预定功能，请输入验证码，当指定的车次中的指定席别可用时，助手将会为您全自动下单。\n\n请确认您设置了正确的车次和席别！\n\n但是，作者无法保证是否会因为铁道部的修改导致失效，请使用此功能的同时务必使用传统的手动下单以保证不会导致您的损失！");
			}
			document.getElementById("swAutoBook").disabled = this.checked;
			if (this.checked) {
				$(".autoordertip").show();
				$(":checkbox[name=seatoption]").attr("disabled", true);
				refreshSeatTypeOrder();
				onAutoOrderRowStyle();
			}
			else {
				$(".autoordertip").hide();
				document.getElementById("swAutoBook").checked = pre_autoorder_book_status;
				$(":checkbox[name=seatoption]").attr("disabled", false);
				$("tr.autoorder_steps").removeClass("steps").removeClass("stepsok");
			}
		});
		//禁用自动预定


		//加载乘客
		utility.getAllPassengers(function (list) {
			var h = [];
			var check = (localStorage.getItem("preSelectPassenger") || "").split('|');
			var index = 0;
			$.each(list, function () {
				var value = this.passenger_name + this.passenger_id_type_code + this.passenger_id_no;
				this.index = index++;
				h.push("<label style='margin-right:10px;'><input type='checkbox' id='preSelectPassenger" + this.index + "' name='preSelectPassenger'" + ($.inArray(value, check) > -1 ? " checked='checked'" : "") + " value='" + value + "' />" + this.passenger_name + "</label>");
			});

			$("#passengerList").html(h.join("")).find("input").change(function () {
				var self = $(this).closest("label");
				if (this.checked) {
					var selected = $("#passengerList1 :checkbox");
					if (selected.length >= 5) {
						alert("选择的乘客不能多于五位喔~~");
						this.checked = false;
						return;
					}

					$("#passengerList1").append(self);
				} else {
					$("#passengerList").append(self);
				}
				selected = $("#passengerList1 :checkbox");
				var user = $.map(selected, function (e) { return e.value; });
				$("#ticketLimition").val(selected.length);
				localStorage.setItem("preSelectPassenger", user.join("|"));
				refreshPasRowStyle(user);
			});
			$.each(check, function () {
				$("#passengerList :checkbox[value=" + this + ']').change();
			});
			$.each(list, function () {
				$("#preSelectPassenger" + this.index).data('pasinfo', this);
			});
			$("#ticketLimition").val($("#passengerList1 :checkbox").length);

			function refreshPasRowStyle(selected) {
				if (!document.getElementById("autoorder").checked) return;

				var row = $("#selectPasRow");
				row.removeClass("steps stepsok");
				row.addClass(selected.length ? "stepsok" : "steps");
			}
			$("#autoorder").click(function () { refreshPasRowStyle($("#passengerList1 :checkbox")); });
		});
	})();


	//#endregion

	//#region 预定界面加载快速查询链接

	(function () {
		var html = [];
		html.push("<tr class='caption fish_sep'><td colspan='4'>快速查询链接</strong></td></tr>");
		html.push("<tr class='fish_sep'><td colspan='4'>");

		var urls = [
			["各始发站放票时间查询", "http://www.12306.cn/mormhweb/zxdt/tlxw_tdbtz53.html"]
		];
		$.each(urls, function () {
			html.push("<div style='float:left;'><a href='" + this[1] + "' target='_blank'>" + this[0] + "</a></div>");
		});

		html.push("</td></tr>");

		$("#helpertooltable tr:last").before(html.join(""));
	})();

	//#endregion

	//#region 余票数限制

	(function () {
		var html = [];
		html.push("<tr class='caption'><td colspan='4'>票数限制</strong></td></tr>");
		html.push("<tr class='fish_sep'><td><strong>最小票数</strong><td colspan='3'><select id='ticketLimition'></select>");
		html.push("介个就是说……如果票票数小于这里的数字的话……就无视的啦 =。=</td></tr>");

		$("#helpertooltable tr:first").addClass("fish_sep").before(html.join(""));
		var dom = $("#ticketLimition").val($("#passengerList1 :checkbox").length)[0];
		for (var i = 0; i < 6; i++) {
			dom.options[i] = new Option(i ? i : "(无限制)", i);
		}

		//注册检测函数
		checkTicketCellsQueue.push(function (i, e, prevValue) {
			var limit = parseInt(dom.value);
			if (!prevValue || !(limit > 0) || $("#autoorder_part:visible:checked").length) return null;

			var text = $.trim(e.text());
			if (text == "有") return 2;

			return parseInt(text) >= limit ? 2 : 1;
		});
	})();

	//#endregion

	//#region 保存查询车次类型配置

	(function () {
		var ccTypeCheck = $("input:checkbox[name=trainClassArr]");
		var preccType = (utility.getPref("cctype") || "").split("|");

		if (preccType[0]) {
			ccTypeCheck.each(function () {
				this.checked = $.inArray(this.value, preccType) != -1;
			});
		}
		ccTypeCheck.click(function () {
			utility.setPref("cctype", $.map(ccTypeCheck.filter(":checked"), function (v, i) {
				return v.value;
			}).join("|"));
		});
	})();

	//#endregion

	//#region 增加互换目标的功能

	(function () {
		var fromCode = $("#fromStation");
		var from = $("#fromStationText");
		var toCode = $("#toStation");
		var to = $("#toStationText");

		from.css("width", "50px").after("<input type='button' value='<->' class='lineButton' title='交换出发地和目的地' id='btnExchangeStation' />");
		$("#btnExchangeStation").click(function () {
			var f1 = fromCode.val();
			var f2 = from.val();
			fromCode.val(toCode.val());
			from.val(to.val());
			toCode.val(f1);
			to.val(f2);
		});
	})();

	//#endregion

	//#region 要求发到站和终点站完全匹配

	(function () {
		var fromText = $("#fromStationText");
		var toText = $("#toStationText");

		$("#filterFunctionRow").append("<label style='font-weight:bold;color:red;margin-left:10px;'><input type='checkbox' id='closeFuseSearch'>过滤发站不完全匹配的车次</label><label style='font-weight:bold;color:red;margin-left:10px;'><input type='checkbox' id='closeFuseSearch1'>过滤到站不完全匹配的车次</label>");
		$("#closeFuseSearch, #closeFuseSearch1").parent().attr("title", '默认情况下，例如查找‘杭州’时，会包括‘杭州南’这个车站。勾选此选项，将会在搜索‘杭州’的时候，过滤那些不完全一致的车站，如‘杭州南’。');

		function getStationName() {
			var txt = $.trim(this.text()).split(/\s/);
			return txt[0];
		}

		checkTicketsQueue.push(function (result) {
			if (document.getElementById("closeFuseSearch").checked) {
				var fs = getStationName.call(this.find("td:eq(1)"));
				if (fs != fromText.val()) {
					this.hide();
					return 0;
				}
			}
			if (document.getElementById("closeFuseSearch1").checked) {
				var fs = getStationName.call(this.find("td:eq(2)"));
				if (fs != toText.val()) {
					this.hide();
					return 0;
				}
			}

			return result;
		});
	})();

	//#endregion

	//#region 保持在线

	var time_offset = null;
	var time_server = null;

	(function () {
		$("#helpertooltable tr:last").before("<tr class='fish_sep'><td class='name'>保持在线</td><td colspan='3'>助手每隔十分钟会帮你刷新存在感防止挂机而掉线的啦。。。。。最后刷新时间：<strong id='lastonlinetime'>无</strong></td></tr>");
		var label = $("#lastonlinetime");

		function online() {
			var serverTime = null;
			utility.post("/otsweb/main.jsp", null, "text", function (data, status, xhr) {
				serverTime = new Date(xhr.getResponseHeader("Date"));
				time_offset = new Date() - serverTime;

				label.html(utility.formatTime(serverTime));
			});
		}

		online();
		setInterval(online, 600 * 1000);
	})();

	//显示本地时间和服务器时间
	(function () {
		var dom = $("#servertime strong");

		function display() {
			if (time_offset === null) return;

			var now = new Date();
			time_server = new Date();
			time_server.setTime(now.getTime() - time_offset);
			document.getElementById("chkSmartSpeed").disabled = time_server.getFullYear() < 2000;

			dom.eq(0).html(utility.formatTime(time_server));
			dom.eq(1).html(utility.formatTime(now));
			dom.eq(2).html((time_offset < 0 ? "快" : "慢") + (Math.abs(time_offset) / 1000) + "秒");
		}

		setInterval(display, 1000);
		display();
	})();

	//#endregion


	//#region 车票模式配置

	(function () {
		$("#helpertooltable tr:first").before("<tr class='fish_sep caption'><td class='name' colspan='4'>出行模式</td></tr>\
<tr class='fish_sep'><td colspan='2'><select id='profilelist'><option value=''>===选择一个出行模式===</option></select><button id='profile_save' class='fish_button'>保存</button><button id='profile_add' class='fish_button'>另存</button><button id='profile_delete' class='fish_button'>删除</button><button id='profile_reset' class='fish_button'>重置所有选项</button></td><td colspan='2'>出行模式可以帮你快速的保存一系列设置，如联系人、车次、席别、黑名单和白名单</td>\
</tr>\
");
		var list = (window.localStorage["profilelist"] || "").split("\t");
		var listDom = $("#profilelist");
		var listEle = listDom[0];

		if (list[0] == "") list.splice(0, 1);

		$.each(list, function () {
			listEle.options[listEle.options.length] = new Option(this + '', this + '');
		});

		listDom.change(function () {
			var value = listDom.val();
			if (!value) return;

			applyProfile(loadProfile(value));
		});
		$("#profile_save").click(function () {
			if (!listDom.val()) $("#profile_add").click();
			else {
				saveProfile(listDom.val(), generateProfile());
				alert("存档已经更新~");
			}
		});
		$("#profile_add").click(function () {
			var data = generateProfile();
			var name = prompt("请输入出行模式的名称，如『出去鬼混』神马的……", "嗷嗷回家~");

			if (!name) return;
			name = name.replace(/\s+/g, "");
			if (window.localStorage.getItem("profile_" + name)) {
				alert("啊嘞？这个名字的已经有了喔，重试呗~");
			} else {
				saveProfile(name, data);
				list.push(name);
				listEle.options[listEle.options.length] = new Option(name, name);
				window.localStorage.setItem("profilelist", list.join("\t"));
				alert("已保存唷。");
			}
		});
		$("#profile_delete").click(function () {
			var idx = listEle.selectedIndex;
			if (!idx || !confirm("亲，确定要下此狠手咩？")) return;

			listEle.options[idx] = null;
			window.localStorage.removeItem("profile_" + list[idx - 1]);
			list.splice(idx - 1, 1);
			window.localStorage.setItem("profilelist", list.join("\t"));
			alert("乃伊佐特~");
		});
		$("#profile_reset").click(function () {
			listDom.val("");
			applyProfile({ "blackListEnabled": true, "whiteListEnabled": true, "autoBookListEnabled": true, "seatOrder": [], "prePassenger": [], "whiteList": [], "blackList": [], "autoBookList": [], "autoBookMethod": "1" });
		});

		function loadProfile(name) {
			return $.parseJSON(window.localStorage.getItem("profile_" + name));
		}

		function saveProfile(name, profile) {
			if (!profile) window.localStorage.removeItem(name);
			else window.localStorage.setItem("profile_" + name, $.toJSON(profile));
		}

		function generateProfile() {
			var pro = {};
			pro.blackListEnabled = document.getElementById("swBlackList").checked;
			pro.whiteListEnabled = document.getElementById("swWhiteList").checked;
			pro.autoBookListEnabled = document.getElementById("swAutoBook").checked;
			pro.seatOrder = seatLevelOrder;
			pro.prePassenger = $.map($("#passengerList1 :checkbox"), function (e) {
				var data = $(e).data("pasinfo");
				return { type: data.passenger_type, idtype: data.passenger_id_type_code, id: data.passenger_id_no };
			});;
			pro.whiteList = list_whitelist.datalist;
			pro.blackList = list_blacklist.datalist;
			pro.autoBookList = list_autoorder.datalist;
			pro.autoBookMethod = $("#autoorder_method").val();
			pro.queryInfo = $("#querySingleForm").serializeArray();

			return pro;
		}

		function applyProfile(pro) {
			$("#swBlackList").attr("checked", pro.blackListEnabled).change();
			$("#swWhiteList").attr("checked", pro.whiteListEnabled).change();
			$("#swAutoBook").attr("checked", pro.autoBookListEnabled).change();
			//清除席别优选
			$("#preseatlist input").click();
			var seatList = $("#preSelectSeatList");
			$.each(pro.seatOrder, function () {
				seatList.val(this + '').change();
			});
			//黑名单白名单神马的。
			list_whitelist.emptyList();
			$.each(pro.whiteList, function () { list_whitelist.add(this + ''); });
			list_blacklist.emptyList();
			$.each(pro.blackList, function () { list_blacklist.add(this + ''); });
			list_autoorder.emptyList();
			$.each(pro.autoBookList, function () { list_autoorder.add(this + ''); });

			//联系人
			var plist = $("input:checkbox[name=preSelectPassenger]");
			plist.attr("checked", false);
			plist.change();
			$.each(pro.prePassenger, function () {
				var p = this;
				plist.each(function () {
					var data = $(this).data("pasinfo");
					if (data.passenger_type == p.type && data.passenger_id_type_code == p.idtype && data.passenger_id_no == p.id) {
						this.checked = true;
						$(this).change();
						return false;
					}
					return true;
				});
			});

			//优选方式
			$("#autoorder_method").val(pro.autoBookMethod).change();

			//查询方式
			if (pro.queryInfo) {
				$.each(pro.queryInfo, function () {
					if (this.name.indexOf("orderRequest.") == -1) return;
					$("input[name=" + this.name + "]").val(this.value).change();
				});
			}

			utility.notifyOnTop("已加载出行模式");
		}

	})();


	//#endregion

	utility.reloadPrefs($("tr.append_row"), "ticket_query");
	//完成初始化
	initialized = true;
	parent.$("#main").css("height", ($(document).height() + 300) + "px");
	parent.window.setHeight(parent.window);
}

//#endregion

//#region 自动提交订单

function initDirectSubmitOrder() {
	//if (Math.random() > 0.10) return;

	console.log("[INFO] initialize direct submit order.");
	var html = "<div id='fishSubmitFormStatus' class='outerBox' style='position:fixed;left:0px;bottom:-100px;'><div class='box'><div class='title'>自动提交订单中</div>\
<div class='content' style='width:150px;'><ul id='tipScript'>\
<li class='fish_clock' id='countEle' style='font-weight:bold;'>等待操作</li>\
<li style='color:green;'><strong>操作信息</strong>：<span>休息中</span></li>\
<li style='color:green;'><strong>最后操作时间</strong>：<span>--</span></li></div>\
		</div></div>";

	parent.window.$("#fishSubmitFormStatus").remove();
	parent.window.$("body").append(html);

	var tip = parent.window.$("#tipScript li");
	var counter = parent.window.$("#countEle");
	var status = parent.window.$("#fishSubmitFormStatus");
	var formData = null;
	var tourFlag;
	var data = null;
	$("#autoorder")[0].disabled = false;

	function setCurOperationInfo(running, msg) {
		counter.removeClass().addClass(running ? "fish_running" : "fish_clock").html(msg || (running ? "正在操作中……" : "等待中……"));
	}

	function setTipMessage(msg) {
		tip.eq(2).find("span").html(utility.getTimeInfo());
		tip.eq(1).find("span").html(msg);
	}

	//窗口状态
	var statusShown = false;
	function showStatus() {
		if (statusShown) return;
		statusShown = true;
		status.animate({ bottom: "0px" });
	}
	function hideStatus() {
		if (!statusShown) return;
		statusShown = false;
		status.animate({ bottom: "-100px" });
	}

	//验证码事件
	var randRow = $("#randCodeTxt").closest("tr");
	function refreshRandRowStyle() {
		randRow.removeClass("steps stepsok");
		randRow.addClass(getVcCode().length == 4 ? "stepsok" : "steps");
	}
	$("#randCodeTxt").keyup(function () {
		refreshRandRowStyle();
		if (statusShown && document.getElementById("randCodeTxt").value.length == 4) checkOrderInfo();
	});
	$("#autoorder").change(refreshRandRowStyle);
	//刷新验证码
	function reloadCode() {
		$("#randCode").attr("src", "/otsweb/passCodeAction.do?rand=randp&" + Math.random());
		var vcdom = document.getElementById("randCodeTxt");
		vcdom.focus();
		vcdom.select();
	}
	$("#randCode").click(reloadCode);

	function getVcCode() {
		return document.getElementById("randCodeTxt").value;
	}

	function isCanAutoSubmitOrder() {
		if (!document.getElementById("autoorder").checked) return [];

		var result = [];
		if (!$("#passengerList1 :checkbox").length) result.push("选择乘客");
		if (!$("#preseatlist input").length) result.push("设置优选席别");
		if (getVcCode().length != 4) result.push("填写验证码");
		if (!$("#autobookListTd input").length) result.push("设置自动预定车次");
		return result;
	}

	function redirectToNotCompleteQuery() {
		window.location.replace("/otsweb/order/myOrderAction.do?method=queryMyOrderNotComplete&leftmenu=Y");
	}

	$("#orderForm").submit(function () {
		if (!document.getElementById("autoorder").checked || isCanAutoSubmitOrder().length || !($("#preSelectSeat").val())) return true;
		showStatus();
		utility.notifyOnTop("开始自动提交预定订单！");
		setCurOperationInfo(true, "正在自动提交订单");

		//确定乘客
		var tcode = $("#station_train_code").val();
		var seatCode = $("#preSelectSeat").val();
		var count = parseInt($.trim($("#gridbox tr[tcode=" + tcode + "] td[scode=" + seatCode + "]").text())) || 0;
		if (seatCode == "1" && $("#preseatlist input[code=empty]").length) {
			//允许了无座，那就加上无座的票数
			count = parseInt($.trim($("#gridbox tr[tcode=" + tcode + "] td[scode=empty]").text())) || 0;
		}
		var pases = $("#passengerList1 :checkbox");
		console.log("欲购票数=" + pases.length + "，实际票数=" + count + " (isNaN 为很多 =。=)");
		if (!isNaN(count) && count > 0 && count < pases.length) {
			$("#passengerList1 :checkbox:gt(" + (count - 1) + ")").attr("checked", false).change();
		}

		var form = $(this);
		utility.post(form.attr("action"), form.serialize(), "text", function (html) {
			if (html.indexOf("您还有未处理") != -1) {
				hideStatus();
				utility.notifyOnTop("您还有未处理订单！");
				redirectToNotCompleteQuery();
				return;
			}

			setTipMessage("正在分析内容");
			getOrderFormInfo(html);
		}, function () {
			utility.notifyOnTop("提交预定请求发生错误，稍等重试！");
			utility.delayInvoke(counter, function () { $("#orderForm").submit(); }, 2000);
		});


		return false;
	});

	function getOrderFormInfo(html) {
		if (typeof (html) != 'undefined' && html) {
			data = utility.analyzeForm(html);
			data.fields["orderRequest.reserve_flag"] = "A";	//网上支付
			tourFlag = data.tourFlag;

			//组装请求
			formData = [];
			$.each(data.fields, function (i) {
				if (i.indexOf("orderRequest") != -1 || i.indexOf("org.") == 0 || i == "leftTicketStr") formData.push(i + "=" + encodeURIComponent(this));
			});
			formData.push("tFlag=" + data.tourFlag);

			//添加乘客
			var pas = $("#passengerList1 :checkbox");
			var seat = $("#preSelectSeat").val();
			var seatType = $("#preselectseatlevel").val();

			for (var i = 0; i < 5; i++) {
				if (i >= pas.length) {
					formData.push("oldPassengers=");
					formData.push("checkbox9=");
					continue;
				}

				var p = pas.eq(i).data("pasinfo");
				var ptype = p.passenger_type;
				var idtype = p.passenger_id_type_code;
				var idno = p.passenger_id_no;
				var name = p.passenger_name;

				//学生票？
				if (clickBuyStudentTicket != "Y" && ptype == "3" && !document.getElementById("autoorder_stu").checked) ptype = 1;

				formData.push("passengerTickets=" + seat + "," + seatType + "," + ptype + "," + encodeURIComponent(name) + "," + idtype + "," + encodeURIComponent(idno) + "," + p.mobile_no + ",Y");
				formData.push("oldPassengers=" + encodeURIComponent(name) + "," + idtype + "," + encodeURIComponent(idno));
				formData.push("passenger_" + (i + 1) + "_seat=" + seat);
				formData.push("passenger_" + (i + 1) + "_seat_detail=" + seatType);
				formData.push("passenger_" + (i + 1) + "_ticket=" + ptype);
				formData.push("passenger_" + (i + 1) + "_name=" + encodeURIComponent(name));
				formData.push("passenger_" + (i + 1) + "_cardtype=" + idtype);
				formData.push("passenger_" + (i + 1) + "_cardno=" + idno);
				formData.push("passenger_" + (i + 1) + "_mobileno=" + p.mobile_no);
				formData.push("checkbox9=Y");
			}
		}

		checkOrderInfo();
	}

	function checkOrderInfo() {
		setCurOperationInfo(true, "正在检测订单状态....");
		utility.notifyOnTop("开始自动提交订单！");
		console.log(data);

		utility.post("confirmPassengerAction.do?method=checkOrderInfo&rand=" + getVcCode(), formData.join("&") + "&randCode=" + getVcCode(), "json", function (data) {
			console.log(data);
			if ('Y' != data.errMsg || 'N' == data.checkHuimd || 'N' == data.check608) {
				if (data.errMsg && data.errMsg.indexOf("验证码") != -1) {
					utility.notifyOnTop("验证码不正确。请输入验证码！");
					setTipMessage("请重新输入验证码。");
					reloadCode();
				} else {
					setCurOperationInfo(false, data.msg || data.errMsg);
					document.getElementById("autoorder").checked = false;
					$("#orderForm").submit();
				}
				return;
			}

			queryQueueInfo();
		}, function () {
			setCurOperationInfo(false, "网络出现错误，稍等重试");
			utility.delayInvoke(counter, checkOrderInfo, 500);
		});
	}

	function queryQueueInfo() {
		if (!document.getElementById("autoorder").checked) {
			hideStatus();
			return;
		}
		setCurOperationInfo(true, "正在提交订单");
		setTipMessage("正在检查队列。");

		var queryLeftData = {
			train_date: data.fields["orderRequest.train_date"],
			station: data.fields["orderRequest.station_train_code"],
			train_no: data.fields["orderRequest.train_no"],
			seat: $("#preSelectSeat").val(),
			from: data.fields["orderRequest.from_station_telecode"],
			to: data.fields["orderRequest.to_station_telecode"],
			ticket: data.fields["leftTicketStr"]
		};
		utility.get("/otsweb/order/confirmPassengerAction.do?method=getQueueCount", queryLeftData, "json", function (data) {
			if (data.op_2) {
				//utility.notifyOnTop("排队人数过多，系统禁止排队，稍等重试。要重新查询，请刷新页面！");
				setTipMessage("排队人数过多 (人数=" + data.count + ")");
				setCurOperationInfo(true, "排队人数过多");
				utility.delayInvoke(counter, queryQueueInfo, 500);
			} else {
				submitOrder();
			}
		}, function () { utility.delayInvoke(counter, queryQueueInfo, 500); });

	}

	function submitOrder() {
		if (!document.getElementById("autoorder").checked) {
			hideStatus();
			return;
		}
		setCurOperationInfo(true, "正在提交订单");
		setTipMessage("已检测状态。");

		var order_type = 'confirmSingleForQueueOrder'; //'dc' 单程
		if (tourFlag == 'wc') {
			// 异步下单-往程
			order_type = 'confirmPassengerInfoGoForQueue';
		} else if (tourFlag == 'fc') {
			// 异步下单-返程
			order_type = 'confirmPassengerInfoBackForQueue';
		} else if (tourFlag == 'gc') {
			// 异步下单-改签
			order_type = 'confirmPassengerInfoResignForQueue';
		}

		utility.post('/otsweb/order/confirmPassengerAction.do?method=' + order_type,
			formData.join("&") + "&randCode=" + getVcCode(), "json", function (data) {
				var msg = data.errMsg;

				if (msg == "Y") {
					setTipMessage("订单提交成功");
					setCurOperationInfo(false, "订单提交成功，请等待排队完成。");
					utility.notifyOnTop("订单提交成功，请等待排队完成。");

					redirectToNotCompleteQuery();

				} else {
					if (msg.indexOf("包含未付款订单") != -1) {
						hideStatus();
						alert("您有未支付订单! 等啥呢, 赶紧点确定支付去.");
						redirectToNotCompleteQuery();
						return;
					}
					if (msg.indexOf("重复提交") != -1) {
						setTipMessage("TOKEN失效，刷新Token中....");
						$("#orderForm").submit();
						return;
					}
					if (msg.indexOf("包含排队中") != -1) {
						hideStatus();
						alert("您有排队中订单! 点确定转到排队页面");
						redirectToNotCompleteQuery();
						return;
					}
					if (msg.indexOf("排队人数现已超过余票数") != -1) {
						//排队人数超过余票数，那么必须重新提交
						document.getElementById("autoorder").checked = false;
						setTipMessage(msg);
						reloadCode();

						setCurOperationInfo(false, "警告：" + msg + "，自动回滚为手动提交，请切换车次或席别，请尽快重试！");
						sendQueryFunc.call(clickBuyStudentTicket == "Y" ? document.getElementById("stu_submitQuery") : document.getElementById("submitQuery"));

						return;

					}

					setTipMessage(msg);
					setCurOperationInfo(false, "未知错误：" + msg + "，请告知作者。");
					utility.notifyOnTop("未知错误：" + msg + "，请告知作者。");

					if (document.getElementById("autoorder_autocancel").checked) {
						document.getElementById("autoorder").checked = false;
						$("#autoorder").change();
						$("#orderForm").submit();
					}
				}
			}, function () {
				setCurOperationInfo(false, "网络出现错误，稍等重试");
				utility.delayInvoke(counter, submitOrder, 2000);
			});
	}

	//周期性检测状态，已确认可以自动提交
	setInterval(function () {
		if (document.getElementById("autoorder").checked) {
			var r = isCanAutoSubmitOrder();
			if (r.length) {
				utility.notifyOnTop("您选择了自动提交订单，但是信息没有设置完整！请" + r.join("、") + "！");
			}
		}
	}, 30 * 1000);

	//最后显示界面，防止初始化失败却显示了界面
	$("tr.autoordertd, td.autoordertd *").show();
}

//#endregion

//#region -----------------自动登录----------------------

function initLogin() {

	//启用日志
	utility.enableLog();

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
		isTop = (top.location + '').indexOf("dynamic.12306.cn") != -1;
	} catch (e) {

	}
	if (!isTop) {
		$("#loginForm table tr:first td:last").append("<a href='https://dynamic.12306.cn/otsweb/' target='_blank' style='font-weight:bold;color:red;'>点击全屏订票</a>");
		if (!utility.getPref("login.fullscreenAlert")) {
			utility.setPref("login.fullscreenAlert", 1);
			utility.notifyOnTop("强烈建议你点击界面中的『点击全屏订票』来全屏购票，否则助手有些提示消息您将无法看到！");
		}
	}



	//Hack当前UI显示
	$(".enter_right").empty().append("<div class='enter_enw'>" +
		"<div class='enter_rtitle' style='padding: 40px 0px 10px 0px; font-size: 20px;'>脚本提示信息</div>" +
		"<div class='enter_rfont'>" +
		"<ul id='tipScript'>" +
		"<li class='fish_clock' id='countEle' style='font-weight:bold;'>等待操作</li>" +
		"<li style='color:green;'><strong>操作信息</strong>：<span>休息中</span></li>" +
		"<li style='color:green;'><strong>最后操作时间</strong>：<span>--</span></li>" +
		"<li> <a href='javascript:;' class='configLink' tab='tabLogin'>登录设置</a> | <a href='http://t.qq.com/ccfish/' target='_blank' style='color:blue;'>腾讯微博</a> | <a href='http://www.fishlee.net/soft/44/' style='color:blue;' target='_blank'>助手主页</a></li><li><a href='http://www.fishlee.net/soft/44/announcement.html' style='color:blue;' target='_blank'>免责声明</a> | <a href='http://www.fishlee.net/Discussion/Index/44' target='_blank'>反馈BUG</a> | <a style='font-weight:bold;color:red;' href='http://www.fishlee.net/honor/index.html' target='_blank'>捐助作者</a></li>" +
		'<li id="enableNotification"><input type="button" id="enableNotify" onclick="$(this).parent().hide();window.webkitNotifications.requestPermission();" value="点击启用桌面通知" style="line-height:25px;padding:5px;" /></li><li style="padding-top:10px;line-height:normal;color:gray;">请<strong style="color: red;">最后输验证码</strong>，输入完成后系统将自动帮你提交。登录过程中，请勿离开当前页。如系统繁忙，会自动重新刷新验证码，请直接输入验证码，输入完成后助手将自动帮你提交。</li>' +
		"</ul>" +
		"</div>" +
		"</div>");

	var html = [];
	html.push("<div class='outerbox' style='margin:15px;'><div class='box'><div class='title'>小提示</div><div style='padding:10px;'>");
	html.push("<table><tr><td style='width:33%;font-weight:bold;background-color:#f5f5f5;'><strong>您还可以通过以下网址访问订票网站：</strong></td><td style='width:33%;font-weight:bold;background-color:#f5f5f5;'>助手运行常见问题</td><td style='font-weight:bold;background-color:#f5f5f5;'>版本信息</td></tr>");
	html.push("<tr><td><ul><li style='list-style:disc inside;'><a href='https://www.12306.cn/otsweb/' target='blank'>https://www.12306.cn/otsweb/</a></li>");
	html.push("<li style='list-style:disc inside;'><a href='https://dynamic.12306.cn/otsweb/' target='blank'>https://dynamic.12306.cn/otsweb/</a></li><li style='list-style:disc inside;'><a href='http://dynamic.12306.cn/otsweb/' target='blank'>http://dynamic.12306.cn/otsweb/</a></li>");
	html.push("</ul></td><td><ol>");
	$.each([
		["http://www.fishlee.net/soft/44/tour.html", "订票助手使用指南", "font-weight:bold;color:red;"],
		["http://www.fishlee.net/soft/44/12306faq.html", "订票的常见问题&指南", ""],
		["http://www.fishlee.net/soft/44/faq.html", "助手运行的常见问题", ]
	], function (i, n) {
		html.push("<li style='list-style:disc inside;'><a style='" + n[2] + "' href='" + n[0] + "' target='blank'>" + (n[1] || n[0]) + "</a></li>");
	});
	html.push("</ol></td><td><ul>");
	var info = [];
	info.push("已许可于：" + utility.regInfo.name);
	if (utility.regInfo.bindAcc) {
		if (!utility.regInfo.bindAcc[0] || utility.regInfo.bindAcc[0] == "*") info.push("许可12306帐户：<em>无限</em>");
		else info.push("许可12306帐户：" + utility.regInfo.bindAcc);
	}
	info.push(utility.regInfo.typeDesc);
	info.push("版本：<strong>" + window.helperVersion + "</strong>");
	$.each(info, function (i, n) { html.push("<li style='list-style:disc inside;'>" + n + "</li>"); });
	html.push("<li style='list-style:disc inside;'>【<a href='javascript:;' class='reSignHelper'>重新注册</a>】</li>");
	html.push("</ul></td></tr></table>");
	html.push("</div></div></div>");

	$("div.enter_help").before(html.join(""));


	//插入登录标记
	var form = $("#loginForm");
	var trs = form.find("tr");
	trs.eq(1).find("td:last").html('<label><input type="checkbox" id="keepInfo" /> 记录密码</label>');
	$("#loginForm td:last").html('<label><input type="checkbox" checked="checked" id="autoLogin" name="autoLogin" /> 自动登录</label>');
	utility.reloadPrefs($("#loginForm td:last"));
	$("#keepInfo").change(function () {
		if (!this.checked) {
			if (localStorage.getItem("__un") != null) {
				localStorage.removeItem("__un");
				localStorage.removeItem("__up");
				alert("保存的密码已经删除！");
			}
		}
	});
	//注册判断
	form.submit(function () {
		utility.setPref("_sessionuser", $("#UserName").val());
	});

	if (!window.webkitNotifications || window.webkitNotifications.checkPermission() == 0) {
		$("#enableNotification").remove();
	}

	var tip = $("#tipScript li");
	var count = 1;
	var errorCount = 0;
	var inRunning = false;

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
					utility.delayInvoke("#countEle", getLoginRandCode, utility.getLoginRetryTime());
				} else {
					setTipMessage("登录随机码 -&gt; " + json.loginRand);
					$("#loginRand").val(json.loginRand);
					submitForm();
				}
			},
			error: function (xhr) {
				errorCount++;

				if (xhr.status == 403) {
					setTipMessage("[" + errorCount + "] 警告! 403错误, IP已被封!")
					utility.delayInvoke("#countEle", getLoginRandCode, 10 * 1000);
				} else {
					setTipMessage("[" + errorCount + "] 网络请求错误，重试")
					utility.delayInvoke("#countEle", getLoginRandCode, utility.getLoginRetryTime());
				}
			}
		});
	}

	function submitForm() {
		var data = {};
		$.each($("#loginForm").serializeArray(), function () {
			if (this.name == "refundFlag" && !document.getElementById("refundFlag").checked) return;
			data[this.name] = this.value;
		});
		if (!data["loginUser.user_name"] || !data["user.password"] || !data.randCode || data.randCode.length != 4/* || (utility.regInfo.bindAcc && utility.regInfo.bindAcc != data["loginUser.user_name"])*/)
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
			timeout: 10000,
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
				} else if (html.indexOf("欢迎您登录") != -1) {
					utility.notifyOnTop('登录成功，开始查询车票吧！');
					window.location.href = "https://dynamic.12306.cn/otsweb/order/querySingleAction.do?method=init";
				} else {
					setTipMessage(msg);
					utility.delayInvoke("#countEle", getLoginRandCode, utility.getLoginRetryTime());
				}
			},
			error: function (msg) {
				errorCount++;
				if (xhr.status == 403) {
					setTipMessage("[" + errorCount + "] 警告! 403错误, IP已被封!")
					utility.delayInvoke("#countEle", getLoginRandCode, 10 * 1000);
				} else {
					setTipMessage("[" + errorCount + "] 网络请求错误，重试")
					utility.delayInvoke("#countEle", getLoginRandCode, utility.getLoginRetryTime());
				}
			}
		});
	}


	function relogin() {
		if (inRunning) return;

		var user = $("#UserName").val();
		if (!user) return;
		if (utility.regInfo.bindAcc && utility.regInfo.bindAcc.length && utility.regInfo.bindAcc[0] && $.inArray(user, utility.regInfo.bindAcc) == -1 && utility.regInfo.bindAcc[0] != "*") {
			alert("很抱歉，12306订票助手的授权许可已绑定至【" + utility.regInfo.bindAcc.join() + "】，未授权用户，助手停止运行，请手动操作。\n您可以在登录页面下方的帮助区点击【重新注册】来修改绑定。");
			return;
		}

		count++;
		utility.setPref("_sessionuser", $("#UserName").val());
		inRunning = true;
		getLoginRandCode();
	}

	function stopLogin() {
		//等待重试时，刷新验证码
		$("#img_rrand_code").click();
		$("#randCode").val("")[0].select();
		inRunning = false;
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
		if (!$("#autoLogin")[0].checked) return;

		e = e || event;
		if (e.charCode == 13 || $("#randCode").val().length == 4) relogin();
	});

	//#region 起售时间提示和查询

	function addDays(count) {
		return new Date(this.getFullYear(), this.getMonth(), this.getDate() + count);
	}

	var curDate = new Date();

	var html = ["<li style='font-weight:bold; color:blue;'><u>助手提示</u>：网上和电话订票提前20天，本日起售【<u>"];
	html.push(utility.formatDate(addDays.call(curDate, 19)));
	html.push("</u>】日车票；代售点和车站提前18天，本日起售【<u>");
	html.push(utility.formatDate(addDays.call(curDate, 17)));
	html.push("</u>】日车票。<br />【<a href='javascript:;' id='querySaleDate'>根据乘车日期推算起售日期</a>】【<a href='http://www.12306.cn/mormhweb/zxdt/tlxw_tdbtz53.html' target='_blank'>以相关公告、车站公告为准</a>】");

	$("div.enter_from ul").append(html.join(""));

	$("#querySaleDate").click(function () {
		var date = prompt("请输入您要乘车的日期，如：2013-02-01");
		if (!date) return;

		if (!/(\d{4})[-/]0?(\d{1,2})[-/]0?(\d{1,2})/.exec(date)) {
			alert("很抱歉未能识别日期");
		}
		date = new Date(parseInt(RegExp.$1), parseInt(RegExp.$2) - 1, parseInt(RegExp.$3));
		alert("您查询的乘车日期是：" + utility.formatDate(date) + "\n\n互联网、电话起售日期是：" + utility.formatDate(addDays.call(date, -19)) + "\n车站、代售点起售日期是：" + utility.formatDate(addDays.call(date, -17)) + "\n\n以上结果仅供参考。");
	});

	//#endregion
}

//#endregion

//#region 自动重新支付

function initPayOrder() {
	//如果出错，自动刷新
	if ($("div.error_text").length > 0) {
		utility.notifyOnTop("页面出错，稍后自动刷新！");
		setTimeout(function () { self.location.reload(); }, 3000);
	}

	return;
	// undone

	window.payOrder = this;

	//epayOrder
	var oldCall = window.epayOrder;
	var formUrl, formData;

	$("#myOrderForm").submit(function () {
		var form = $(this);
		var action = form.attr("action");
		if (acton && action.index("laterEpay") != -1) {
			return false;
		}
	});
	window.epayOrder = function () {
		oldCall.apply(arguments);

		var form = $("#myOrderForm");
		var formData = utility.serializeForm(form);
		var formUrl = form.attr("action");
	};

	function getsubmitForm() {
		utility.post(formUrl, formData, "text", function (html) {
		}, function () {

		});
	}
}

//#endregion

//#region 更新专用检测代码

if (location.pathname == "/otsweb/" || location.pathname == "/otsweb/main.jsp") {
	if (isFirefox) {
		//firefox 专用检测代码
		GM_xmlhttpRequest({
			method: "GET",
			url: "http://www.fishlee.net/service/update/44/version.js",
			onload: function (o) {
				eval(o.responseText);

				if (typeof (fishlee12306_msgid) != 'undefined') {
					if (utility.getPref("helperlastmsgid") != fishlee12306_msgid) {
						utility.setPref("helperlastmsgid", fishlee12306_msgid);

						if (!fishlee12306_msgver || compareVersion(version, fishlee12306_msgver) < 0) {
							if (fishlee12306_msg) alert(fishlee12306_msg);
						}
					}
				}

				console.log("[INFO] 更新检查：当前助手版本=" + version + "，新版本=" + version_12306_helper);
				if (compareVersion(version, version_12306_helper) < 0 && confirm("订票助手已发布新版 【" + version_12306_helper + "】，为了您的正常使用，请及时更新!是否立刻更新？\n\n本次更新内容如下：\n" + version_updater.join("\n"))) {
					GM_openInTab("http://www.fishlee.net/Service/Download.ashx/44/47/12306_ticket_helper.user.js", true, true);
				}
			}
		});
	} else {
		unsafeInvoke(function () {
			$("body").append('<iframe id="checkVersion" width="0" height="0" style="visibility:hidden;" src="http://static.fishlee.net/content/scriptProxy.html?script=http://static.fishlee.net/content/images/apps/cn12306/checkVersion.js&v=' + window.helperVersion + '"></iframe>');
		});
	}
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
