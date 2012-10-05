var default_options = ['click', 'zh_definitions'];

function setOptions(options) {
    options = options.toString();
    var checkboxs = document.getElementsByTagName('input');
    for (var i = 0; i < checkboxs.length; i++) {
	checkboxs[i].checked = false;
	if (options.search(checkboxs[i].id) != -1)
	    checkboxs[i].checked = true;
    }
}

function showOptions() {
    // var options = storage.get('options', log);
    var options = localStorage.getItem('options');
    if (options != null)
	setOptions(options);
    else {
	setOptions(default_options);
    }
}

function getOptions() {
    var checked = [];
    var options = document.getElementsByTagName('input');
    for (var i = 0; i < options.length; i++) {
	if (options[i].checked)
	    checked.push(options[i].id);
    }
    return checked;
}

function message() {
    var message = document.getElementById('message');
    message.innerHTML = '设置已保存！';
    setTimeout(function () { message.innerHTML = '';}, 1500);
}

function saveOptions() {
    var options = getOptions();
    localStorage.setItem('options', options.toString());
    message();
}

function resetOptions() {
    setOptions(default_options);
    localStorage.setItem('options', default_options.toString());
    message();
}

document.addEventListener('DOMContentLoaded', function () {
    showOptions();
    document.querySelector('#save').addEventListener('click', saveOptions);
    document.querySelector('#reset').addEventListener('click', resetOptions);
});
