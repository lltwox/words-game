function Flash() {
    this.element = $('.user-status-change');
    this.strong = this.element.find('strong');
    this.span = this.element.find('span');

    this.timer = null;
}

Flash.prototype.TIMEOUT = 7 * 1000;

Flash.prototype.joined = function(name) {
    this.success(name, ' has joined');
};

Flash.prototype.left = function(name) {
    this.error(name, ' has left');
};

Flash.prototype.winner = function(name, score) {
    this.success(name, ' has won with score of ' + score);
};

Flash.prototype.success = function(strong, span) {
    this.setText(strong, span);
    this.element.removeClass('alert-danger').addClass('alert-success');
    this.flash();
};

Flash.prototype.error = function(strong, span) {
    this.setText(strong, span);
    this.element.removeClass('alert-success').addClass('alert-danger');
    this.flash();
};

Flash.prototype.setText = function(strong, span) {
    this.strong.text(strong);
    this.span.text(span);
};

Flash.prototype.flash = function() {
    clearTimeout(this.timer);
    this.element.show();
    this.timer = setTimeout($.proxy(function() {
        this.element.fadeOut(100);
    }, this), this.TIMEOUT);
};