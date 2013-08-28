var Game = require('./words/game'),
    Room = require('./words/room');

var Words = function(app, io) {
    this.app = app;
    this.io = io;

    this.Status = {
        WAITING: 'waiting',
        STARTING: 'starting',
        IN_PROGRESS: 'in-progress'
    };

    this.run = function() {
        this.status = this.Status.WAITING;

        this.room = new Room(this);
        this.room.init();

        this.game = new Game(this);
        this.game.init();
    };

};

module.exports = Words;