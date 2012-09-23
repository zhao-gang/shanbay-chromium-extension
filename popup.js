function getFirstChildWithTagName(element, tagName) {
    tagName = tagName.toUpperCase();
    var childs = element.childNodes;
    for(var i = 0; i < childs.length; i++) {
        if (childs[i].nodeName == tagName)
            return childs[i];
    }
}

function loggedIn(nick_name) {
    var status = document.getElementById('status');
    var user_link = document.createElement('a');
    var user_home = 'http://www.shanbay.com/home/';
    user_link.setAttribute('href', user_home);
    user_link.setAttribute('target', '_newtab');
    user_link.appendChild(document.createTextNode(nick_name + '的空间'));
    status.innerHTML = '';
    status.appendChild(user_link);
}

function loggedOut() {
    var status = document.getElementById('status');
    var login_link = document.createElement('a');
    var login_url = 'http://www.shanbay.com/accounts/login/';
    login_link.setAttribute('href', login_url);
    login_link.setAttribute('target', '_newtab');
    login_link.appendChild(document.createTextNode('登录'));
    status.innerHTML = '';
    status.appendChild(login_link);
    // body area
    var search_area = document.getElementById('search_area');
    search_area.setAttribute('class', 'invisible');
    var tips = document.getElementById('tips');
    tips.setAttribute('class', 'invisible');
    var definition = document.getElementById('definition');
    var info = document.createElement('p');
    info.appendChild(document.createTextNode('请点击右上角链接登录，登录后才能查词'));
    definition.appendChild(info);
}

function check() {
    // status area
    var status = document.getElementById('status');
    status.innerHTML = '正在检查...';
    // tips area
    var tips = document.getElementById('tips');
    tips.innerHTML = '<p>提示：使用回车键搜索，点击喇叭图标发音</p>';
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
            jump.innerHTML = '';
            jump.appendChild(document.createTextNode('已添加，'));
            var check_link = 'http://www.shanbay.com/learning/';
            var check = document.createElement('a');
	    check.setAttribute('id', 'jump_a');
            check.setAttribute('href', check_link + learning_id);
            check.setAttribute('target', '_newtab');
            check.appendChild(document.createTextNode('查看'));
            jump.appendChild(check);
        }
    };
    request.send(null);
}

function queryOk(response) {
    // clear tips area
    document.getElementById('tips').innerHTML = '';
    var learning_id = response.learning_id;
    var voc = response.voc;
    // word and pronouncation
    var content = document.getElementById('content');
    content.innerHTML = voc.content + ' ';
    if (voc.pron.length != 0) {
	var pron = document.getElementById('pron');
	// if word too long, put pronouncation in the next line
	if (voc.content.length > 13)
            pron.innerHTML = '<br />[' + voc.pron + ']';
	else
	    pron.innerHTML = '[' + voc.pron + '] ';
    }
    if (voc.audio.length != 0) {
	var a = document.createElement('a');
	a.setAttribute('href', '#');
	// change phrase to be a valid title name
	var title_name = voc.content.replace(/ /g, '_');
	a.setAttribute('id', 'white');
	a.setAttribute('title', title_name);
        var img = document.createElement('img');
        img.setAttribute('src', 'static/audio.png');
        img.setAttribute('id', 'audio_img');
	a.appendChild(img);
	var a_click = document.getElementById('a_click');
        a_click.appendChild(a);
    }
    // chinese definition
    var zh_definition = document.getElementById('zh_definition');
    zh_definition.innerHTML = voc.definition;
    // jump
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
    document.getElementById('jump').innerHTML = '';
    var tips = document.getElementById('tips');
    tips.innerHTML = '<p><span class="word">' + word + '</span> 没有找到。</p>';
}

function query(word) {
    // show this let user don't panic
    var tips = document.getElementById('tips');
    tips.innerHTML = '<p>查询中...</p>';
    // clear jump area
    document.getElementById('jump').innerHTML = '';
    // clear definition area
    document.getElementById('content').innerHTML = '';
    document.getElementById('pron').innerHTML = '';
    document.getElementById('sound').innerHTML = '';
    document.getElementById('a_click').innerHTML = '';
    document.getElementById('zh_definition').innerHTML = '';
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
    var re = /[^a-zA-Z ]+/;
    input = input.replace(re, '');
    var word = input.replace(/ +/, ' ');
    return word;
}

function click() {
    var input = document.getElementById('input');
    if (input.value.length != 0)
        query(parse(input.value));
    document.getElementById('input').focus();
}

function keydown() {
    if (event.keyCode == 13) {
        var input = document.getElementById('input');
        input = input.value;
	if (input.length != 0)
            query(parse(input));
    }
}

function playSound() {
    var sound = document.getElementById('sound');
    var audio = document.createElement('audio');
    // sound api has changed, remade by my hand
    var sound_url = 'http://media.shanbay.com/audio/$country/$word.mp3';
    // now hard coded to use American english
    var country = 'us';
    // find word name from a's title
    var a_click = document.getElementById('a_click');
    var a = getFirstChildWithTagName(a_click, 'a');
    // get word and change space to underscore to generate the url
    var word = a.title.replace(/ /g, '_');
    sound_url = sound_url.replace('$country', country);
    sound_url = sound_url.replace('$word', word);
    audio.setAttribute('src', sound_url);
    audio.setAttribute('autoplay', 'true');
    sound.appendChild(audio);
    document.getElementById('input').focus();
}

document.addEventListener('DOMContentLoaded', function () {
    check();
    document.querySelector('button').addEventListener('click', click);
    document.querySelector('input').addEventListener('keydown', keydown);
    document.querySelector('#jump').addEventListener('click', addWord);
    document.querySelector('#a_click').addEventListener('click', playSound);
});
