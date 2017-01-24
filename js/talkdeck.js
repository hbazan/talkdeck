// ==UserScript==
// @name         TalkDeck
// @namespace    patanpatan
// @version      0.1
// @author       patanpatan
// @match        https://tweetdeck.twitter.com/
// @require      https://gist.github.com/raw/2625891/waitForKeyElements.js
// @grant        none
// ==/UserScript==

'use strict';
var tuits = [];
var u = new SpeechSynthesisUtterance();
u.rate = 1.15;
var play = false;
var talking = false;
var prev = [];

function lorear() {
	window.speechSynthesis.cancel();
	if (play) {
		if (tuits.length > 0) {
			var tuit = tuits.shift().split('$|$');
			u.text = tuit[0];
			u.voice = window.speechSynthesis.getVoices().find(function (v) {
					return v.lang == tuit[1] + '-US';
				});
			prev.push(tuit[2]);
			while (prev.length > 2) {
				prev.shift();
			};
			window.speechSynthesis.speak(u);
			talking = Date.now();
			return;
		}
	}
	if (play) {
		talking = false;
		setTimeout(lorear, 5000);
	}
}

u.onend = function (event) {
	lorear();
};

u.onboundary = function (event) {
	console.log("onboundary:" + event);
	lorear();
};

u.onerror = function (event) {
	console.log("onerror:" + event);
	lorear();
};

u.onmark = function (event) {
	console.log("onmark:" + event);
	lorear();
};

function gogogo() {
	if ($('section.column-type-home').length === 0 
		|| $('div.js-app-header-inner').length === 0 ){
		setTimeout(gogogo, 5000);
	}

	var playDiv = document.createElement('div');
	var playA = document.createElement('a');
	playA.onclick = function () {
		window.speechSynthesis.cancel();
		play = !play;
		playA.classList = ['icon'];
		playA.classList.add(play ? 'icon-clear-input' : 'icon-play-video');
		if (play) {
			lorear();
		}
	};
	playA.addEventListener("mouseover", function() { playA.title = tuits.length; }, false);
	
	playA.classList = ['icon'];
	playA.classList.add(play ? 'icon-clear-input' : 'icon-play-video');
	playA.href = "#";
	
	var prevA = document.createElement('a');
	prevA.onclick = function () {
		if (prev.length > 0) {
			window.open(prev[0], "_blank"); 
		}
	};
	
	prevA.classList.add('icon');
	prevA.classList.add('icon-popout');
	prevA.href = "#";
	playDiv.style.float = 'left';
	playDiv.style.position = 'absolute';
	playDiv.style.paddingLeft= '5px';
	playDiv.appendChild(playA);
	playDiv.appendChild(prevA);
	$('div.js-column-nav-list')[0].appendChild(playDiv);

	var home = $('section.column-type-home> div > div > div > div > div.chirp-container')[0];
	
	function extractTuit(n) {
		if (n.querySelector('p.tweet-text') && n.querySelector('span.account-inline')){
			var body = n.querySelector('p.tweet-text').innerText
				.replace(/#/g, "hashtag ")
				.replace("RT ", "retuit ")
				.replace("http://", "link a ")
				.replace("https://", "link a ");
			return n.querySelector('span.account-inline').innerText
				+ ' dice: '
				+ body
				+ '$|$' + n.querySelector('p.tweet-text').lang
				+ '$|$' + n.querySelector('a.txt-small').href;
		} else {
			return "|";
		}
	}
	
	var observer = new MutationObserver(function (mutations) {
			mutations.forEach(function (mutation) {
				if (mutation.type == 'childList') {
					if (mutation.addedNodes.length >= 1) {
						mutation.addedNodes.forEach(function (n) {
							if (n.nodeName == 'ARTICLE') {
								var tuit = extractTuit(n);
								tuits.push(tuit);
								while (tuits.length > 100) {
									tuits.shift();
								};
								if (talking && talking < Date.now() - 30000) {
									window.speechSynthesis.cancel();
								}
							}
						});
					}
				}
			});
		});

	var observerConfig = {
		childList: true
	};

	observer.observe(home, observerConfig);
}

setTimeout(gogogo, 5000);