var Words = require('../words.js');

exports = module.exports = Player;

function Player(socket, words) {
    this.socket = socket;
    this.words = words;
    this.id = socket.id;
    this.name = null;

    this.socket.on('disconnect', this.onDisconnect.bind(this));
    this.socket.on('room.name', this.onRoomName.bind(this));
    this.socket.on('room.get-start-time', this.onRoomGetStartTime.bind(this));

    this.socket.on('game.word', this.onGameWord.bind(this));
}

Player.prototype.emit = function() {
    this.socket.emit.apply(this.socket, arguments);
};

Player.prototype.onDisconnect = function() {
    this.words.removePlayer(this);
    this.words.io.sockets.emit('room.left', this.name);
};

Player.prototype.onRoomName = function(name, callback) {
    this.name = name;
    this.words.addPlayer(this);
    this.socket.emit('room.status', this.words.status);
    this.socket.broadcast.emit('room.joined', name);

    callback(this.id);
};

Player.prototype.onRoomGetStartTime = function() {
    var now = new Date().getTime();
    this.socket.emit('room.get-start-time', this.words.startTime - now);
};

Player.prototype.onGameWord = function(word) {
    this.words.game.addWord(this, word);
};

