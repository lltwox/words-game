module.exports = function(words) {
    this.words = words;

    this.init = function() {
        this.words.io.of('/room')
            .on('connection', function(socket) {
                console.log('Somebody finally connected');
            })
        ;
    };

};