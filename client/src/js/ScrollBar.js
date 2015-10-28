/* globals Resize */

var ScrollBar = {};
ScrollBar.init = function() {
    this.boxs = document.querySelectorAll('.scroll-box');
    this.ctns = document.querySelectorAll('.scroll-box .scroll-content');
    this.bars = document.querySelectorAll('.scroll-box .scroll-bar');
    this.btns = document.querySelectorAll('.scroll-box .scroll-btn');

    for (var i = 0; i < this.ctns.length; i++) {
        this.ctns[i].onscroll = function() {
            ScrollBar.scroll(this);
        }.bind(i);
    }

    window.addEventListener('resize', function() {
        ScrollBar.set();
        Resize.video();
    });
    this.set();
};

ScrollBar.set = function() {
    for (var i = 0; i < ScrollBar.boxs.length; i++) {
        ScrollBar.bars[i].classList.remove('visible');
        ScrollBar.ctns[i].style.width = '100%';
        ScrollBar.ctns[i].style.overflowY = 'hidden';
        var startWidth = ScrollBar.ctns[i].clientWidth;
        ScrollBar.ctns[i].style.overflowY = 'scroll';
        var scrollWidth = startWidth - ScrollBar.ctns[i].clientWidth;
        ScrollBar.ctns[i].style.width = startWidth + scrollWidth + 'px';
        ScrollBar.bars[i].classList.add('visible');
        ScrollBar.scroll(i);
    }
};

ScrollBar.scroll = function(n) {
    var alpha = this.ctns[n].clientHeight / this.ctns[n].scrollHeight;
    this.btns[n].style.height = alpha * 100 + '%';
    this.btns[n].style.top = this.ctns[n].scrollTop * alpha + 'px';
};
