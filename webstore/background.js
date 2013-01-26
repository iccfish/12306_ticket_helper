var firstrunCallback = function (detail) {
	console.log(detail);
	if (detail.reason != 'install' && detail.reason != 'update') return;

	//打开新页面
	chrome.tabs.create({
		url: "https://dynamic.12306.cn/otsweb/"
	});
};

function getVersion(callback) {
	var xmlhttp = new XMLHttpRequest();
	xmlhttp.open('GET', 'manifest.json');
	xmlhttp.onload = function (e) {
		var manifest = JSON.parse(xmlhttp.responseText);
		callback(manifest.version);
	}
	xmlhttp.send(null);
}

if (chrome.runtime && chrome.runtime.onInstalled) {
	chrome.runtime.onInstalled.addListener(firstrunCallback);
} else {
	getVersion(function (ver) {
		if (localStorage["cv"] != ver) {
			localStorage["cv"] = ver;
			chrome.tabs.create({
				url: "https://dynamic.12306.cn/otsweb/"
			});
		}
	});
}

(function () {
	function callback(details) {
		var trefer = null;
		var treferIndex = -1;
		var referIndex = -1;

		for (var i = 0; i < details.requestHeaders.length; ++i) {
			var h = details.requestHeaders[i];

			if (h.name === 'User-Agent') {
				h.value = "Mozilla/5.0 (MSIE 9.0; Windows NT 6.1; Trident/5.0)";
			} else if (h.name == "TRefer") {
				trefer = h.value;
				treferIndex = i;
			} else if (h.name == "Referer") {
				referIndex = i;
			}
		}
		if (trefer && treferIndex != -1 && referIndex != -1) {
			details.requestHeaders[referIndex].value = trefer;
			details.requestHeaders.splice(treferIndex, 1);
		}


		return { requestHeaders: details.requestHeaders };
	}

	var filter = {
		urls: ["*://*.12306.cn/*"],
		types: ["main_frame", "sub_frame", "stylesheet", "script", "image", "object", "xmlhttprequest", "other"]
	};

	var extraInfo = ["blocking", "requestHeaders"];


	chrome.webRequest.onBeforeSendHeaders.addListener(callback, filter, extraInfo);
})();