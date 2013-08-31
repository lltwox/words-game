exports = module.exports = Game;

function Game(words) {
    this.words = words;
    this.players = {};
}

Game.prototype.handlePlayerAction = function(player, action) {
    if (action == 'joined') {
        player.socket.join('game');
        this.players[player.id] = {
            name: player.name,
            score: 0,
            words: []
        };
    } else {
        delete this.players[player.id];
    }
};

Game.prototype.prepare = function() {
    this.gameWord = 'Прокрастинация'.toLowerCase();
    this.gameLetters = this.gameWord.split('');
};

Game.prototype.start = function() {
    this.words.io.sockets.in('game').emit('game.data', {
        letters: this.gameLetters,
        players: this.players
    });
    this.inProgress = true;
};

Game.prototype.interrupt = function() {
    this.players = {};
    this.inProgress = false;
};

Game.prototype.addWord = function(player, word) {
    if (!this.inProgress) {
        return;
    }

    if (!this.isCorrectWord(word) ||
        this.players[player.id].words.indexOf(word) > -1
    ) {
        return;
    }

    this.players[player.id].words.push(word);
    this.players[player.id].score += 1;

    var data = {};
    data[player.id] = this.players[player.id].score;
    this.words.io.sockets.in('game').emit('game.score', data);
};

Game.prototype.isCorrectWord = function(word) {
    var letters = word.split(''),
        takenIndexes = {};

    var result = letters.filter(function(letter) {
        letter = letter.toLowerCase();
        var startIndex = takenIndexes[letter] || 0;
        var letterIndex = this.gameLetters.indexOf(letter, startIndex);

        if (letterIndex == -1) {
            return true;
        }
        takenIndexes[letter] = letterIndex + 1;

        return false;
    }.bind(this));

    return result.length === 0;
};
