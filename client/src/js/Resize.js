/* globals Chat, ScrollBar */

var Resize = {};
Resize.init = function() {
    this.elements = document.querySelectorAll('.resize-line');
    for (var i = 0; i < this.elements.length; i++) {
        this.elements[i].addEventListener('dragstart', function() {
            return false;
        });
        this.elements[i].addEventListener('mousedown', function(event) {
            Resize.target = this;
            if (this.classList.contains('vertical')) {
                document.body.style.cursor = 'col-resize';
                Resize.start = this.parentElement.clientWidth;
            } else {
                document.body.style.cursor = 'row-resize';
                Resize.start = this.parentElement.clientHeight;
            }
            Resize.xMouse  = event.clientX;
            Resize.yMouse  = event.clientY;
            document.ondragstart = function() { return false };
            document.body.onselectstart = function() { return false };
            document.body.style.webkitUserSelect = document.body.style.userSelect = 'none';
        });
        window.addEventListener('mousemove', function(event) {
            if (Resize.target) {
                Resize.video();
                if (Resize.target.classList.contains('vertical')) {
                    Resize.target.parentElement.style.width = Resize.start + (event.clientX - Resize.xMouse) + 'px';
                } else {
                    Resize.target.parentElement.style.height = Resize.start + (Resize.yMouse - event.clientY) + 'px';
                }
            }
        });
        window.addEventListener('mouseup', function() {
            Resize.target = false;
            document.body.style.cursor = 'default';
            document.ondragstart = null;
            document.body.onselectstart = null;
            document.body.style.webkitUserSelect = document.body.style.userSelect = '';
        });
    }
};

Resize.video = function() {
    var height = Chat.remoteVideo.clientHeight;

    if (Chat.localVideo.videoHeight) {
        height += Chat.remoteVideo.clientWidth * (Chat.localVideo.videoHeight / Chat.localVideo.videoWidth);
    } else {
        height += Chat.localVideo.clientHeight;
    }

    height += document.querySelector('.control-panel').clientHeight;

    if (height + 40 > window.innerHeight - document.querySelector('.header').clientHeight &&
        !document.querySelector('.view').classList.contains('fullscreen') &&
        window.orientation == undefined
    ) {
        document.querySelector('.stream-bar').classList.add('big');
    } else {
        document.querySelector('.stream-bar').classList.remove('big');
    }
    ScrollBar.set();
};
