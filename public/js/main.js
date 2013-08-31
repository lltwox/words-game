$(function() {
    var game = null;

    $('.status-name form').on('submit', function() {
        var input = $('#player-name'),
            name = input.val();

        if (!name) {
            input.parent().addClass('has-error');
            return false;
        }
        (game = new Game()).start(name);

        return false;
    });

    $('.game-input form').on('submit', function() {
        var input = $(this).find('input'),
            word = input.val();

        input.val('');

        if (game && word) {
            game.sendWord(word);
        }

        return false;
    });
});