/* globals Socket, window*/

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
    document.getElementById('localVideo').src = URL.createObjectURL(stream);
    Socket.create();
    WebRTC.create();
};

WebRTC.getRemoteStream = function(event) {
    this.remoteStream = event.stream;
    document.getElementById('remoteVideo').src = URL.createObjectURL(event.stream);
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
