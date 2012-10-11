

function getFirstChildWithTagName(element, tagName) {
    var tagName = tagName.toUpperCase();
    var childs = element.childNodes;
    for(var i = 0; i < childs.length; i++) {
        if (childs[i].nodeName == tagName)
            return childs[i];
    }
}


function clearArea(area) {
    if (area == 'definition') {
	document.getElementById('content').innerHTML = '';
	document.getElementById('pron').innerHTML = '';
	document.getElementById('sound').innerHTML = '';
	document.getElementById('zh_trans').innerHTML = '';
	document.getElementById('en_trans').innerHTML = '';
	return null;
    }
    document.getElementById(area).innerHTML = '';
}


function showTips(message) {
    var tips = document.getElementById('tips');
    if (message.length == 0)
	clearArea('tips');
    else
	tips.innerHTML = '<p>' + message + '</p>';
}


function loggedIn(nick_name) {
    var status = document.getElementById('status');
    var user_link = document.createElement('a');
    var user_home = 'http://www.shanbay.com/home/';
    user_link.setAttribute('href', user_home);
    user_link.setAttribute('target', '_newtab');
    user_link.appendChild(document.createTextNode(nick_name + '的空间'));
    clearArea('status');
    status.appendChild(user_link);
}


function loggedOut() {
    var status = document.getElementById('status');
    var login_link = document.createElement('a');
    var login_url = 'http://www.shanbay.com/accounts/login/';
    login_link.setAttribute('href', login_url);
    login_link.setAttribute('target', '_newtab');
    login_link.appendChild(document.createTextNode('登录'));
    clearArea('status');
    status.appendChild(login_link);
    // body area
    var search_area = document.getElementById('search_area');
    search_area.setAttribute('class', 'invisible');
    showTips('请点击右上角链接登录，登录后才能查词');
}


function checkLoginStatus() {
    // focus on input area
    document.getElementById('input').focus();
    // status area
    var status = document.getElementById('status');
    status.innerHTML = '正在检查...';
    // tips area
    showTips('提示：使用回车键搜索更快捷，点击选项可以自定义设置');
    var request = new XMLHttpRequest();
    var check_url = 'http://www.shanbay.com/api/user/info/';
    request.open('GET', check_url);
    request.onreadystatechange = function () {
        if (request.readyState === 4) {
            // user have logged in
            if (request.getResponseHeader('Content-Type') == 'application/json') {
                var response = JSON.parse(request.responseText);
                var nick_name = response.nickname;
                loggedIn(nick_name);
            }
            // user have not logged in
            else {
                loggedOut();
            }
        }
    };
    request.send(null);
}


function addWord() {
    var jump = document.getElementById('jump');
    var a = getFirstChildWithTagName(jump, 'a');
    var request = new XMLHttpRequest();
    var add_url = 'http://www.shanbay.com/api/learning/add/' + a.title;
    jump.innerHTML = '添加中...';
    request.open('GET', add_url);
    request.onreadystatechange = function () {
        if (request.readyState === 4) {
            var learning_id = JSON.parse(request.responseText).id;
	    clearArea('jump');
            jump.appendChild(document.createTextNode('已添加，'));
            var check_link = 'http://www.shanbay.com/learning/';
            var check = document.createElement('a');
	    check.setAttribute('id', 'jump_a');
            check.setAttribute('href', check_link + learning_id);
            check.setAttribute('target', '_newtab');
            check.appendChild(document.createTextNode('查看'));
            jump.appendChild(check);
	    document.getElementById('input').focus();
        }
    };
    request.send(null);
}


function showEnDefinitions(en_definitions) {
    var en_trans = document.getElementById('en_trans');
    for (var i in en_definitions) {
	var div = document.createElement('div');
	div.setAttribute('class', 'part-of-speech');
	div.innerHTML = '<strong>' + i + '</strong>';
	var ol = document.createElement('ol');
	for (var j = 0; j < en_definitions[i].length; j++) {
	    var li = document.createElement('li');
	    li.innerText = en_definitions[i][j];
	    ol.appendChild(li);
	}
	en_trans.appendChild(div);
	en_trans.appendChild(ol);
    }
}


function queryOk(response) {
    // clear tips area
    showTips('');
    // check localStorage
    var storage = localStorage.getItem('options');
    // first time run, set localStorage to default
    if ((storage == null) || (storage.search('definitions') == -1)) {
	storage = 'zh_definitions';
	localStorage.setItem('options', storage);
    }

    var learning_id = response.learning_id;
    var voc = response.voc;

    // word and pronouncation
    var content = document.getElementById('content');
    content.innerHTML = voc.content + ' ';
    if (voc.pron.length != 0) {
	var pron = document.getElementById('pron');
	// if word too long, put pronouncation in the next line
	if (voc.content.length > 11)
            pron.innerHTML = '<br />[' + voc.pron + ']';
	else
	    pron.innerHTML = '[' + voc.pron + '] ';
    }

    // if audio is available
    if (voc.audio.length != 0) {
	var alt = voc.content;
        var img = document.createElement('img');
        img.setAttribute('src', 'static/audio.png');
        img.setAttribute('id', 'horn');
	img.setAttribute('alt', alt);
	var sound = document.getElementById('sound');
        sound.appendChild(img);
	// if auto play sound option is set
	if (storage.search('auto') != -1)
	    playSound();
    }

    // whether show chinese definition
    if (storage.search('zh_definitions') != -1) {
	var zh_trans = document.getElementById('zh_trans');
	zh_trans.innerHTML = voc.definition;
    }

    // whether show english definition
    if (storage.search('en_definitions') != -1)
	showEnDefinitions(voc.en_definitions);

    // jump area
    var jump = document.getElementById('jump');
    if (learning_id != 0) {
        var check_link = 'http://www.shanbay.com/learning/';
        var check = document.createElement('a');
	check.setAttribute('id', 'jump_a');
        check.setAttribute('href', check_link + learning_id);
        check.setAttribute('target', '_newtab');
        check.appendChild(document.createTextNode('查看'));
        jump.appendChild(check);
    }
    else {
        var add = document.createElement('a');
	add.setAttribute('id', 'jump_a');
        add.setAttribute('href', '#');
        // let addWord function can access the word name by title name
        add.setAttribute('title', voc.content);
        add.appendChild(document.createTextNode('添加到生词本'));
        jump.appendChild(add);
    }
}

function queryNotFound(word) {
    // clear jump area
    clearArea('jump');
    showTips('<span class="word">' + word + '</span> 没有找到。');
}

function query(word) {
    // show this let user don't panic
    showTips('查询中...');
    clearArea('jump');
    clearArea('definition');
    var request = new XMLHttpRequest();
    var query_url = 'http://www.shanbay.com/api/word/' + word;
    request.open('GET', query_url);
    request.onreadystatechange = function () {
        if (request.readyState === 4) {
            var response = JSON.parse(request.responseText);
            if (response.voc != '')
                queryOk(response);
            else
                queryNotFound(word);
        }
    }
    request.send(null);
}

function parse(input) {
    var re = /[^a-zA-Z ]+/g;
    input = input.replace(re, '');
    if (input.length == 0 || input.search(/^ +$/) != -1)
	// have no valid character 
	return null;
    else {
	var word = input.replace(/ +/, ' ');
	word = word.replace(/^ +| +$/, '');
	return word;
    }
}

function click() {
    var input = document.getElementById('input').value;
    var word = parse(input);
    if (word == null) {
	clearArea('jump');
	clearArea('definition');
	showTips('<span class="color">英文字符</span>和<span class="color">空格</span>为有效的关键字，请重新输入');
    }
    else
	query(word);
    document.getElementById('input').focus();
}

function keydown() {
    if (event.keyCode == 13) {
        var input = document.getElementById('input').value;
	var word = parse(input);
	if (word == null) {
	    clearArea('jump');
	    clearArea('definition');
	    showTips('<span class="color">英文字符</span>和<span class="color">空格</span>为有效的关键字，请重新输入');
	}
	else
	    query(word);
    }
}

function playSound() {
    var audio = document.createElement('audio');
    // sound api has changed, url made by my own hand
    var sound_url = 'http://media.shanbay.com/audio/$country/$word.mp3';
    // now hard coded to use American english
    var country = 'us';
    // find word name from element img's alt attribute
    var audio_img = document.getElementById('horn');
    // get word and change space to underscore to generate the url
    var word = audio_img.alt.replace(/ /g, '_');
    sound_url = sound_url.replace('$country', country);
    sound_url = sound_url.replace('$word', word);
    audio.setAttribute('src', sound_url);
    audio.setAttribute('autoplay', 'true');
    var sound = document.getElementById('sound');
    sound.appendChild(audio);
    document.getElementById('input').focus();
}

document.addEventListener('DOMContentLoaded', function () {
    checkLoginStatus();
    document.querySelector('button').addEventListener('click', click);
    document.querySelector('input').addEventListener('keydown', keydown);
    document.querySelector('#jump').addEventListener('click', addWord);
    document.querySelector('#sound').addEventListener('click', playSound);
    document.querySelector('#sound').addEventListener('mouseover', playSound);
});
