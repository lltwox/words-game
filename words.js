var Player = require('./words/player'),
    Game = require('./words/game');

exports = module.exports = Words;

function Words(app, io) {
    this.app = app;
    this.io = io;

    this.status = this.STATUS.WAITING;
    this.users = {};

    this.game = null;

    this.startTime = null;
    this.startTimer = null;

    this.statusActions = {};
    this.statusActions[this.STATUS.WAITING] = this.updateWaitingState.bind(this);
    this.statusActions[this.STATUS.STARTING] = this.updateStartingState.bind(this);
    this.statusActions[this.STATUS.INPROGRESS] = this.updateInProgressState.bind(this);
}

Words.prototype.STATUS = {
    WAITING: 'waiting',
    STARTING: 'starting',
    INPROGRESS: 'in-progress'
};
Words.prototype.GAME_START_DELAY = 20 * 1000;

Words.prototype.run = function() {
    this.game = new Game(this);
    this.io.sockets.on('connection', function(socket) {
        new Player(socket, this);
    }.bind(this));
};

Words.prototype.addPlayer = function(player) {
    this.users[player.id] = player;
    if (this.startTime) {
        player.socket.emit(
            'room.start-time', this.startTime - new Date().getTime()
        );
    }
    this.statusActions[this.status]();
};

Words.prototype.removePlayer = function(player) {
    delete this.users[player.id];
    this.game.removePlayer(player);
    this.statusActions[this.status]();
};

Words.prototype.setStatus = function(status) {
    this.status = status;
    this.io.sockets.emit('room.status', this.status);
};

Words.prototype.updateWaitingState = function() {
    if (Object.keys(this.users).length < 2) {
        return;
    }

    this.setStatus(this.STATUS.STARTING);
    this.game.prepare();

    this.startTime = new Date().getTime() + this.GAME_START_DELAY;
    this.io.sockets.emit('room.start-time', this.GAME_START_DELAY);
    this.startTimer = setTimeout(function() {
        this.startTime = null;
        this.setStatus(this.STATUS.INPROGRESS);
        this.game.start(this.users);
    }.bind(this), this.GAME_START_DELAY);
};

Words.prototype.updateStartingState = function() {
    if (Object.keys(this.users).length > 1) {
        return;
    }

    this.setStatus(this.STATUS.WAITING);
    this.game.unprepare();
    clearTimeout(this.startTimer);
};

Words.prototype.updateInProgressState = function() {
    if (Object.keys(this.game.players).length > 1) {
        return;
    }

    this.setStatus(this.STATUS.WAITING);
    this.game.interrupt();
    this.updateWaitingState();
};