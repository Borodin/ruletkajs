/* globals WebRTC, Socket, twemoji, ScrollBar, Resize, Lang, EmojiGroup */

var Chat = {};

Chat.startStream = function() {
    WebRTC.getMedia();
    Chat.log(Lang.get('log_get_stream'));
};

Chat.stopStream = function() {
    Socket.sendMessage('stop');
    WebRTC.close();
    Socket.ws.close();
    this.localStream.classList.add('camera-off');
    this.startBtn.innerText = Lang.get('start');
    this.started = false;

    this.localVideo.pause();
    this.localVideo.src = '';
    WebRTC.localStream.stop();
};

Chat.nextStream = function() {
    Chat.log(Lang.get('log_search'));
    WebRTC.refresh();
    Socket.sendMessage('next');
};

Chat.sendMessage = function() {
    Socket.sendMessage('message', Chat.textarea.value);
    Chat.textarea.value = '';
};

Chat.clearHistory = function() {
    Chat.history.innerHTML = '';
};

Chat.fullScreen = function() {
    var e;
    var view =  document.querySelector('.view');
    document.querySelector('.stream-bar').classList.remove('big');
    if (document.fullscreenElement ||
        document.msFullscreenElement ||
        document.webkitCurrentFullScreenElement ||
        document.mozFullScreenElemenz
    ) {
        e = document;
        if (e.exitFullscreen) {
            e.exitFullscreen();
        } else if (e.msExitFullscreen) {
            e.msExitFullscreen();
        } else if (e.webkitCancelFullScreen) {
            e.webkitCancelFullScreen();
        } else if (e.mozCancelFullScreen) {
            e.mozCancelFullScreen();
        }

        view.classList.remove('fullscreen');
    } else {
        e = document.documentElement;
        if (e.requestFullscreen) {
            e.requestFullscreen();
        } else if (e.msRequestFullscreen) {
            e.msRequestFullscreen();
        } else if (e.webkitRequestFullScreen) {
            e.webkitRequestFullScreen();
        } else if (e.mozRequestFullScreen) {
            e.mozRequestFullScreen();
        }
        view.classList.add('fullscreen');
    }
};

Chat.log = function(text, clear) {
    if (clear) {
        this.clearHistory();
    }
    this.pushMesage({
        text: text,
        author: 'system'
    });
};

Chat.pushMesage = function(message) {
    var div = document.createElement('div');
    var span = document.createElement('span');
    span.innerText = message.text;

    span.innerHTML = twemoji.parse(span.innerText.autoLink({
        callback: function(url) {
            var linkContent = /\.(gif|png|jpe?g)$/i.test(url) ? '<img src="' + url + '">' : url;
            return '<a target="_blank" class="image" href="' + url + '">' + linkContent + '</a>';
        }
    }), function(icon) {
        return 'https://twemoji.maxcdn.com/svg/' + icon + '.svg';
    });

    div.classList.add('message');
    div.classList.add(message.author);
    div.appendChild(span);
    Chat.history.appendChild(div);

    if (message.author == 'partner') {
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
        var notification = new Notification('RuletkaJS', {
            body: text,
            icon: '/img/icon_192.png'
        });
        notification.onclick = function() {
            window.focus();
        };
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

            var optOnClick = function() {
                WebRTC.constraints[this.dataset.kind] = {
                    optional: [{sourceId: this.dataset.id}]
                };
                console.log(this.value, WebRTC.constraints);
            };

            for (var i = 0; i < list.length; i++) {
                var opt = document.createElement('li');
                opt.innerText = list[i].label || list[i].kind + ' ' + (lists[list[i].kind].childElementCount + 1);
                opt.dataset.id = list[i].id;
                opt.dataset.kind = list[i].kind;
                lists[list[i].kind].appendChild(opt);
                opt.onclick = optOnClick;
            }

            var flipBtn = document.createElement('li');
            flipBtn.innerText = Lang.get('flip_video');
            flipBtn.onclick = function() {
                Chat.localVideo.classList.toggle('flip');
            };
            lists.option.appendChild(flipBtn);

            Chat.sources.innerHTML = '';
            for (var k in lists) {
                var title = document.createElement('div');
                title.className = 'title';
                title.innerText = Lang.get(k);
                Chat.sources.appendChild(title);
                Chat.sources.appendChild(lists[k]);
            }
        });
    }
};

Chat.setSmiles = function() {
    console.time('smile');
    var frag = document.createDocumentFragment();
    for (var i = 0; i < EmojiGroup.length; i++) {
        var title = document.createElement('div');
        title.className = 'title';
        title.innerText = Lang.get('smile_' + EmojiGroup[i].key);
        frag.appendChild(title);

        for (var j = 0; j < EmojiGroup[i].emoji.length; j++) {
            var smile = document.createElement('div');
            smile.className = 'smile';
            smile.innerHTML = '&#x' + EmojiGroup[i].emoji[j].split('-').join(';&#x') + ';';
            smile.onclick = function() {
                Chat.textarea.focus();
                var strPos = Chat.textarea.selectionStart;
                Chat.textarea.value = (Chat.textarea.value).substring(0,strPos) + this +
                (Chat.textarea.value).substring(strPos,Chat.textarea.value.length);
            }.bind(smile.innerHTML);
            frag.appendChild(smile);
        }
    }
    twemoji.parse(frag, {callback: function(icon) {
        return 'https://twemoji.maxcdn.com/svg/' + icon + '.svg';
    }});
    Chat.smiles.appendChild(frag);
    console.timeEnd('smile');
};

Chat.onLoad = function() {
    Lang.setLanguage();
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
    this.reportBtn = document.getElementById('report-btn');

    this.cameraInfo = document.getElementById('camera-info');
    this.cameraInfo.innerText = Lang.get('camera-on');

    this.smiles = document.querySelector('.smile-picker .scroll-content');

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

    this.startBtn.innerText = Lang.get('start');
    this.stopBtn.innerText = Lang.get('stop');
    this.reportBtn.innerText = Lang.get('report');

    this.getStreamSources();

    document.querySelector('.switch').onclick = function() {
        var view = document.querySelector('.view');
        view.classList.toggle('streams');
        view.classList.toggle('chat');
        ScrollBar.set();
    };

    document.querySelector('video').ondblclick = function() {
        Chat.fullScreen();
    };

    document.querySelector('.option-btn').onclick = function() {
        document.querySelector('.option-menu').classList.toggle('visible');
    };

    document.querySelector('.smile-btn').onclick = function() {
        document.querySelector('.smile-picker').classList.toggle('visible');
    };

    document.querySelector('.smile-picker').addEventListener('click', function() {
        this.classList.add('visible');
    });

    document.body.addEventListener('click', function(e) {
        if (
            e.target != document.querySelector('.option-btn') &&
            e.target != document.querySelector('.smile-btn')
        ) {
            document.querySelector('.smile-picker').classList.remove('visible');
            document.querySelector('.option-menu').classList.remove('visible');
        }
    }, true);

    Chat.setSmiles();
    ScrollBar.init();
    Resize.init();
    Chat.log(Lang.get('log_start'));
};

window.addEventListener('load', Chat.onLoad.bind(Chat));
