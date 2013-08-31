function Game() {
    this.socket = null;
    this.status = null;
    this.name = null;

    this.flash = new Flash();
    this.startGameTimer = null;

    this.statusHandlers = {};
    this.statusHandlers['waiting'] = $.proxy(this.handleWaitingStatus, this);
    this.statusHandlers['starting'] = $.proxy(this.handleStartingStatus, this);
}

Game.prototype.start = function(name) {
    this.name = name;

    this.socket = io.connect(null, {
        reconnect: false
    });

    this.socket.on('connect', $.proxy(this.onConnect, this));
    this.socket.on('disconnect', $.proxy(this.onDisconnect, this));

    // all event handlers
    this.socket.on('room.status', $.proxy(this.onStatus, this));
    this.socket.on('room.joined', $.proxy(this.onJoined, this));
    this.socket.on('room.left', $.proxy(this.onLeft, this));
    this.socket.on('room.get-start-time', $.proxy(this.onGetStartTime, this));

    this.socket.on('game.data', $.proxy(this.onGameData, this));
    this.socket.on('game.score', $.proxy(this.onGameScore, this));
};

Game.prototype.onConnect = function() {
    this.socket.emit('room.name', this.name, $.proxy(function(id) {
        this.id = id;
    }, this));
};

Game.prototype.onDisconnect = function() {
    $('#game').attr('class', '').addClass('lost-connection');
    setTimeout(function() {
        window.location.reload();
    }, 2000);
};

Game.prototype.onStatus = function(status) {
    if (this.statusHandlers[status]) {
        this.statusHandlers[status]();
    }

    this.status = status;
    $('#game').attr('class', '').addClass(status);
};

Game.prototype.onJoined = function(name) {
    this.flash.joined(name);
};

Game.prototype.onLeft = function(name) {
    this.flash.left(name);
};

Game.prototype.onGetStartTime = function(time) {
    var timePlaceholder = $('.status-starting .starting-time');
    var seconds = Math.ceil(time / 1000);
    timePlaceholder.text(seconds);

    var updateTimer = $.proxy(function() {
        seconds = seconds - 1;
        timePlaceholder.text(seconds);
        if (seconds === 0) {
            clearInterval(this.startGameTimer);
        }
    }, this);

    clearTimeout(this.startGameTimer);
    clearInterval(this.startGameTimer);
    this.startGameTimer = setTimeout($.proxy(function() {
        seconds = seconds - 1;
        timePlaceholder.text(seconds);
        if (seconds === 0) {
            clearTimeout(this.startGameTimer);
            return;
        }
        this.startGameTimer = setInterval(updateTimer, 1000);
    }, this), time % ((seconds - 1) * 1000));
};

Game.prototype.onGameData = function(data) {
    var gameWordContainer = $('.game-word ul').empty();
    for (var index in data.letters) {
        gameWordContainer.append(
            $('<li>').text(data.letters[index])
        );
    }
    var scoresContainer = $('.game-score table tbody').empty();
    for (var playerId in data.players) {
        var nameTd = $('<td>'),
            scoreTd = $('<td>'),
            tr = $('<tr>').append(nameTd).append(scoreTd);

        tr.attr('data-id', playerId);

        if (playerId == this.id) {
            nameTd.append($('<strong>').text(data.players[playerId].name));
        } else {
            nameTd.text(data.players[playerId].name);
        }
        scoreTd.text(data.players[playerId].score);

        scoresContainer.append(tr);
    }

    $('.info-placeholder').addClass('hidden');
    $('.game-data').removeClass('hidden');
};

Game.prototype.onGameScore = function(data) {
    console.log(data);
    for (var playerId in data) {
        $('tr[data-id="' + playerId + '"]')
            .find('td:nth-child(2)').text(data[playerId]);

        console.log($('tr[data-id="' + playerId + '"]'));
    }
};

Game.prototype.handleWaitingStatus = function() {
    if (this.status === 'starting') {
        clearInterval(this.startGameTimer);
    } else if (this.status === 'in-progress') {

    }
};

Game.prototype.handleStartingStatus = function() {
    if (this.status == 'waiting' || !this.status) {
        this.socket.emit('room.get-start-time');
    } else if (this.status == 'in-progress') {
        // game finished, new game is starting
    }
};

Game.prototype.sendWord = function(word) {
    this.socket.emit('game.word', word);
};