module.exports = function(words) {
    this.GAME_STARTING_TIME = 20;

    this.words = words;
    this.users = [];

    this.init = function() {
        this.words.io.on('connection', function(socket) {
            this.users.push(socket);
            this.sendStatus(socket);
            this.listenToPollingEvents(socket);

            this.checkGameState();
        }.bind(this));
    };

    this.sendStatus = function(socket) {
        socket.emit('status', this.words.status);
    };

    this.listenToPollingEvents = function(socket) {
        socket.on('get-status', function(data, fn) {
            fn(this.words.status);
        }.bind(this));
    };

    this.checkGameState = function() {
        if (this.words.status != this.words.Status.WAITING) {
            return;
        }

        if (this.users.length >= 2) {
            console.log('losts of users!');
            this.words.status = this.words.Status.STARTING;

            setTimeout(function() {
                this.words.io.sockets.emit('started');
            }.bind(this), this.GAME_STARTING_TIME);

            this.words.io.sockets.emit(
                'starting', this.GAME_STARTING_TIME
            );
        }
    };

};