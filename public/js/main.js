$(function() {
    var socket = io.connect();
    socket.on('status', function(status) {
        $('#game').attr('class', '').addClass(status);
    });

    socket.on('starting', function(time) {
        $('#game').attr('class', '').addClass('starting');
        $('.status-starting .starting-time').text(time);

        var timer = null;
        timer = setInterval(function() {
            time = time - 1;
            $('.status-starting .starting-time').text(time);
            if (time === 0) {
                clearTimeout(timer);
            }
        }, 1000);
    });
});