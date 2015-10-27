/* globals Socket, window, Chat, Resize*/

var WebRTC = {};

WebRTC.constraints = {
    audio: true,
    video: true
};

WebRTC.create = function() {

    window.PeerConnection =
    window.PeerConnection ||
    window.mozRTCPeerConnection ||
    window.webkitRTCPeerConnection;

    window.IceCandidate =
    window.IceCandidate ||
    window.mozRTCIceCandidate ||
    window.RTCIceCandidate;

    window.SessionDescription =
    window.SessionDescription ||
    window.mozRTCSessionDescription ||
    window.RTCSessionDescription;

    var servers = null;

    this.pc = new window.PeerConnection(servers);
    this.pc.addStream(this.localStream);
    this.pc.onicecandidate = this.getIceCandidate.bind(this);
    this.pc.onaddstream = this.getRemoteStream.bind(this);
    Chat.remoteStream.classList.add('loading');
};

WebRTC.getMedia = function() {
    navigator.getUserMedia = navigator.getUserMedia || navigator.mozGetUserMedia || navigator.webkitGetUserMedia;
    navigator.getUserMedia(
        WebRTC.constraints,
        this.getLocalStream.bind(this),
        this.streamError.bind(this)
    );
};

WebRTC.getLocalStream = function(stream) {
    this.localStream = stream;
    Socket.create();
    WebRTC.create();
    Chat.localVideo.src = URL.createObjectURL(stream);
    Chat.localStream.classList.remove('camera-off');
    this.getStream();
};

WebRTC.getRemoteStream = function(event) {
    this.remoteStream = event.stream;
    Chat.remoteVideo.src = URL.createObjectURL(event.stream);
    Chat.remoteStream.classList.remove('loading');
    this.getStream();
};

WebRTC.getStream = function() {
    setTimeout(Resize.video, 2000);
};

WebRTC.close = function() {
    WebRTC.pc.close();
    WebRTC.pc = null;
    WebRTC.create();
};

WebRTC.gotLocalDescription = function(description) {
    this.pc.setLocalDescription(description);
    Socket.sendMessage('webrtc', description);
};

WebRTC.streamError = function() {
    console.warn('Stream error');
};

WebRTC.getIceCandidate = function(event) {
    if (event.candidate) {
        Socket.sendMessage('webrtc', {
            type: 'candidate',
            label: event.candidate.sdpMLineIndex,
            id: event.candidate.sdpMid,
            candidate: event.candidate.candidate
        });
    }
};

WebRTC.createOffer = function() {
    this.pc.createOffer(
        this.gotLocalDescription.bind(this),
        console.error,
        { 'mandatory': { 'OfferToReceiveAudio': true, 'OfferToReceiveVideo': true } }
    );
};

WebRTC.createAnswer = function() {
    this.pc.createAnswer(
        this.gotLocalDescription.bind(this),
        console.error,
        { 'mandatory': { 'OfferToReceiveAudio': true, 'OfferToReceiveVideo': true } }
    );
};

WebRTC.onMessage = function(message) {
    if (message.type == 'offer') {
        this.pc.setRemoteDescription(new window.SessionDescription(message));
        WebRTC.createAnswer();
    } else if (message.type == 'answer') {
        this.pc.setRemoteDescription(new window.SessionDescription(message));
    } else if (message.type == 'candidate') {
        this.pc.addIceCandidate(new window.IceCandidate({sdpMLineIndex: message.label, candidate: message.candidate}));
    }
};

/*
MediaStreamTrack.getSources(function(e){
    console.log(e);
})

function sourceSelected(audioSource, videoSource) {
  var constraints = {
    audio: {
      optional: [{sourceId: audioSource}]
    },
    video: {
      optional: [{sourceId: videoSource}]
    }
  };

  navigator.getUserMedia(constraints, successCallback, errorCallback);
}
*/
