/* globals WebRTC, Socket, twemoji, ScrollBar, Resize */

var Chat = {};

Chat.startStream = function() {
    WebRTC.getMedia();
};

Chat.stopStream = function() {
    WebRTC.close();
    Socket.sendMessage('stop');
    Socket.ws.close();
    this.localStream.classList.add('camera-off');
    this.startBtn.innerText = 'Start';
    this.started = false;
};

Chat.nextStream = function() {
    WebRTC.close();
    Socket.sendMessage('next');
};

Chat.sendMessage = function() {
    Socket.sendMessage('message', Chat.textarea.value);
    Chat.textarea.value = '';
};

Chat.pushMesage = function(message) {
    var div = document.createElement('div');
    var span = document.createElement('span');
    span.innerText = message.text;

    span.innerHTML = twemoji.parse(span.innerText.autoLink({
        callback: function(url) {
            var linkContent = /\.(gif|png|jpe?g)$/i.test(url) ? '<img src="' + url + '">' : url;
            return '<a target="_blank" href="' + url + '">' + linkContent + '</a>';
        }
    }), function(icon) {
        return 'https://twemoji.maxcdn.com/svg/' + icon + '.svg';
    });

    div.classList.add('message');
    div.classList.add(message.author);
    div.appendChild(span);
    Chat.history.appendChild(div);

    if (message.author != 'your') {
        Chat.showNotification(message.text);
    }
    Chat.history.scrollTop = Chat.history.scrollHeight;
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
            var lists = {
                'audio': document.createElement('ul'),
                'video': document.createElement('ul'),
                'option': document.createElement('ul')
            };

            for (var i = 0; i < list.length; i++) {
                var opt = document.createElement('li');
                opt.innerText = list[i].label || list[i].kind + ' ' + (lists[list[i].kind].childElementCount + 1);
                opt.setAttribute('data-id', list[i].id);
                lists[list[i].kind].appendChild(opt);
            }

            var reflectOption = document.createElement('li');
            reflectOption.innerText = 'Отразить видео';
            lists.option.appendChild(reflectOption);

            Chat.sources.innerHTML = '';
            for (var k in lists) {
                var title = document.createElement('div');
                title.className = 'title';
                title.innerText = k;
                Chat.sources.appendChild(title);
                Chat.sources.appendChild(lists[k]);
            }
            /**
                Chat.sources.onchange = function() {
                    WebRTC.constraints.video = {};
                    WebRTC.constraints.video.optional = [{sourceId: this.value}];
                    console.log(this.value, WebRTC.constraints.video.optional);
                };
            */
        });
    }
};

Chat.onLoad = function() {
    this.started = false;

    this.audio = new Audio('notification.mp3');
    this.history = document.getElementById('history');
    this.sources = document.getElementById('sources');
    this.textarea = document.getElementById('textarea');

    this.localVideo = document.getElementById('localVideo');
    this.remoteVideo = document.getElementById('remoteVideo');

    this.localStream = document.getElementById('localStream');
    this.remoteStream = document.getElementById('remoteStream');
    this.sendBtn = document.querySelector('.submit-btn');

    this.startBtn = document.getElementById('start-btn');
    this.stopBtn = document.getElementById('stop-btn');

    this.sendBtn.addEventListener('click', Chat.sendMessage);

    this.textarea.addEventListener('keydown', function(event) {
        if (event.keyCode == 13 && !event.shiftKey) {
            event.preventDefault();
            Chat.sendMessage();
        }
    });

    this.startBtn.addEventListener('click', function() {
        if (Chat.started) {
            Chat.nextStream();
        } else {
            Chat.startStream();
        }
    });

    this.stopBtn.addEventListener('click', function() {
        if (Chat.started) {
            Chat.stopStream();
        }
    });

    this.startBtn.innerText = 'Start';
    this.stopBtn.innerText = 'Stop';

    this.getStreamSources();

    document.querySelector('.switch').onclick = function() {
        var view = document.querySelector('.view');
        view.classList.toggle('streams');
        view.classList.toggle('chat');
        ScrollBar.set();
    };

    document.querySelector('video').ondblclick = function() {
        document.querySelector('.view').classList.toggle('fullscreen');
        document.querySelector('.stream-bar').classList.remove('big');
    };

    document.querySelector('.option-btn').onclick = function() {
        document.querySelector('.option-menu').classList.toggle('visible');
    };

    document.querySelector('.smile-btn').onclick = function() {
        document.querySelector('.smile-picker').classList.toggle('visible');
    };

    ScrollBar.init();
    Resize.init();
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
