/* globals WebRTC, Chat */

var Socket = {};

Socket.create = function() {
    this.ws = new WebSocket(location.origin.replace(/^http/, 'ws'));
    this.ws.addEventListener('open', this.onOpen);
    this.ws.addEventListener('message', this.onMessage);
    this.ws.addEventListener('close', this.onClose);
    this.ws.addEventListener('onerror', this.onError);
};

Socket.onOpen = function() {
    console.info('WS connected.');
    document.getElementById('next').disabled = false;
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
        WebRTC.close();
    } else if (type == 'next') {
        console.info(type);
        WebRTC.close();
    } else if (type == 'message') {
        Chat.pushMesage(content);
    } else {
        console.warn('unknown message', type, content);
    }
};

Socket.onClose = function(event) {
    if (event.wasClean) {
        console.info('Clouse conecting');
    } else {
        console.warn('Server disconected');
    }
};

Socket.onError = function(event) {
    console.warn('Socket ERROR:', event.data);
};

Socket.sendMessage = function(type, content) {
    this.ws.send(JSON.stringify({
        type: type,
        content: content || false
    }));
};
