/* globals WebRTC, Chat, Lang */

var Socket = {};

Socket.create = function() {
    if (!this.ws || this.ws.readyState != 1) {
        this.ws = new WebSocket(location.origin.replace(/^http/, 'ws'));
        this.ws.addEventListener('open', this.onOpen);
        this.ws.addEventListener('message', this.onMessage);
        this.ws.addEventListener('close', this.onClose);
        this.ws.addEventListener('onerror', this.onError);
    }
};

Socket.onOpen = function() {
    console.info('WS connected.');
    Chat.startBtn.innerText = Lang.get('next');
    Chat.started = true;
    Chat.nextStream();
};

Socket.onMessage = function(event) {
    var message = JSON.parse(event.data);
    var type = message.type;
    var content = message.content;

    if (type == 'conect') {
        console.info(type);
        WebRTC.createOffer();
    } else if (type == 'join') {
        console.info(type);
    } else if (type == 'webrtc') {
        console.info(type);
        WebRTC.onMessage(content);
    } else if (type == 'leave') {
        console.info(type);
        WebRTC.refresh();
        Chat.log(Lang.get('log_leave'), true);
    } else if (type == 'next') {
        console.info(type);
        Chat.log(Lang.get('log_next'), true);
        Chat.log(Lang.get('log_search'));
        WebRTC.refresh();
    } else if (type == 'message') {
        Chat.pushMesage(content);
    } else {
        console.warn('unknown message', type, content);
    }
};

Socket.onClose = function(event) {
    if (event.wasClean) {
        Chat.log(Lang.get('log_clouse_conecting'), true);
    } else {
        Chat.log(Lang.get('log_clouse_disconected'), true);
    }
    Chat.stopStream();
};

Socket.onError = function(event) {
    Chat.log(Lang.get('log_socket_error'), true);
    console.warn('Socket ERROR:', event.data);
};

Socket.sendMessage = function(type, content) {
    if (this.ws && this.ws.readyState == 1) {
        this.ws.send(JSON.stringify({
            type: type,
            content: content || false
        }));
    } else {
        Chat.log(Lang.get('log_no_conection'));
    }
};
