var Dict = require('./dict');

exports = module.exports = Game;

function Game(words) {
    this.dict = new Dict();

    this.words = words;
    this.players = {};

    this.endGameTime = null;
    this.endGameTimer = null;
    this.updateTimer = null;
}

Game.prototype.GAME_LENGTH = 90 * 1000;
Game.prototype.PUSH_GAME_TIME_INTERVAL = 5 * 1000;

Game.prototype.removePlayer = function(player) {
    delete this.players[player.id];
    this.words.io.sockets.in('game').emit('game.left', player.id);
};

Game.prototype.prepare = function() {
    this.dict.getLongWord(function(word) {
        this.gameWord = word.toLowerCase();
        this.gameLetters = this.gameWord.split('');
    }.bind(this));
};

Game.prototype.start = function(players) {
    this.addPlayers(players);

    this.inProgress = true;
    this.words.io.sockets.in('game').emit('game.data', {
        letters: this.gameLetters,
        players: this.players
    });

    this.endGameTime = new Date().getTime() + this.GAME_LENGTH;
    this.endGameTimer = setTimeout(function() {
        this.end();
    }.bind(this), this.GAME_LENGTH);

    this.setUpEndTimePush();
};

Game.prototype.unprepare = function() {
    this.gameWord = null;
    this.gameLetters = null;
    this.players = {};
    clearTimeout(this.endGameTimer);
    clearInterval(this.updateTimer);
};

Game.prototype.interrupt = function() {
    this.gameWord = null;
    this.gameLetters = null;
    this.inProgress = false;
    this.players = {};
    clearTimeout(this.endGameTimer);
    clearInterval(this.updateTimer);
};

Game.prototype.end = function() {
    this.inProgress = false;
    var winner = this.getWinner();

    this.words.io.sockets.in('game').emit('game.winner', {
        name: this.players[winner].name,
        score: this.players[winner].score
    });

    this.interrupt();
    this.words.updateWaitingState();
};

Game.prototype.addPlayers =function(players) {
    for (var playerId in players) {
        var player = players[playerId];
        player.socket.join('game');
        this.players[player.id] = {
            name: player.name,
            score: 0,
            words: []
        };
    }
};

Game.prototype.setUpEndTimePush = function() {
    var pushTime = function() {
        this.words.io.sockets.in('game').emit(
            'game.end-time', this.endGameTime - new Date().getTime()
        );
    }.bind(this);

    pushTime();
    this.updateTimer = setInterval(function() {
        pushTime();
    }, this.PUSH_GAME_TIME_INTERVAL);
};

Game.prototype.getWinner = function() {
    var maxScore = -1;
    var winner = null;

    for (var playerId in this.players) {
        if (this.players[playerId].score > maxScore) {
            maxScore = this.players[playerId].score;
            winner = playerId;
        }
    }

    return winner;
};

Game.prototype.addWord = function(player, word) {
    if (!this.inProgress) {
        return;
    }
    if (!this.players[player.id] ||
        this.players[player.id].words.indexOf(word) > -1 ||
        word == this.gameWord
    ) {
        return;
    }

    process.nextTick(function() {
        this.checkWordIsCorrect(word, function() {
            this.players[player.id].words.push(word);
            this.players[player.id].score += 1;

            var data = {};
            data[player.id] = this.players[player.id].score;
            this.words.io.sockets.in('game').emit('game.score', data);
        }.bind(this));
    }.bind(this));
};

Game.prototype.checkWordIsCorrect = function(word, callback) {
    word = word.toLowerCase();

    var letters = word.split(''),
        takenIndexes = {};

    var missingLetters = letters.filter(function(letter) {
        letter = letter;
        var startIndex = takenIndexes[letter] || 0;
        var letterIndex = this.gameLetters.indexOf(letter, startIndex);

        if (letterIndex == -1) {
            return true;
        }
        takenIndexes[letter] = letterIndex + 1;

        return false;
    }.bind(this));

    if (missingLetters.length > 0) {
        return;
    }

    this.dict.checkHasWord(word, callback);
};
