/* globals WebRTC, Socket, twemoji */

var Chat = {};

Chat.nextStream = function() {
    WebRTC.close();
    Socket.sendMessage('next');
};

Chat.sendMessage = function(message) {
    Socket.sendMessage('message', message);
};

Chat.pushMesage = function(message) {
    var div = document.createElement('div');
    div.innerText = message.text;
    div.innerHTML = twemoji.parse(div.innerText.autoLink({
        callback: function(url) {
            var linkContent = /\.(gif|png|jpe?g)$/i.test(url) ? '<img src="' + url + '">' : url;
            return '<a target="_blank" href="' + url + '">' + linkContent + '</a>';
        }
    }), function(icon) {
        return 'https://twemoji.maxcdn.com/svg/' + icon + '.svg';
    });
    div.classList.add('message');
    div.classList.add(message.author);
    Chat.chat.appendChild(div);

    if (message.author != 'your') {
        Chat.showNotification(message.text);
    }
};

Chat.showNotification = function(text) {
    if (window.navigator.vibrate) {
        window.navigator.vibrate(100);
    }

    if (this.audio.readyState == 4) {
        this.audio.currentTime = 0;
        this.audio.play();
    }

    if (!Notification || document.hidden == 'undefined') {
        console.warn('Notification not supported');
    } else if (Notification.permission != 'granted') {
        Notification.requestPermission();
    }else if (Notification.permission == 'granted' && document.hidden) {
        new Notification(text);
    }
};

Chat.getStreamSources = function() {
    if (window.MediaStreamTrack) {
        window.MediaStreamTrack.getSources(function(list) {
            console.log(list);
            for (var i = 0; i < list.length; i++) {
                var opt = document.createElement('option');
                opt.innerText = list[i].label || list[i].kind;
                opt.value = list[i].id;
                Chat.sources.appendChild(opt);
            }
            Chat.sources.onchange = function() {
                WebRTC.constraints.video = {};
                WebRTC.constraints.video.optional = [{sourceId: this.value}];
                console.log(this.value, WebRTC.constraints.video.optional);
            };
        });
    }
};

Chat.onLoad = function() {
    this.audio = new Audio('notification.mp3');
    this.chat = document.getElementById('chat');
    this.sources = document.getElementById('sources');
    this.textarea = document.getElementById('textarea');
    this.textarea.addEventListener('keydown', function(event) {
        if (event.keyCode == 13 && !event.shiftKey) {
            event.preventDefault();
            Chat.sendMessage(this.value);
            this.value = '';
        }
    });

    this.getStreamSources();
    /**
        this.textarea.addEventListener('input', function() {
            twemoji.parse(this);
                this.innerHTML = twemoji.parse(this.innerText, function(icon) {
                    return 'https://twemoji.maxcdn.com/svg/' + icon + '.svg';
                });
        });
    */
};

window.addEventListener('load', Chat.onLoad.bind(Chat));
