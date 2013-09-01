var MongoClient = require('mongodb').MongoClient;

exports = module.exports = Dict;

function Dict() {
    this.words = null;
    this.longwords = null;

    this.init();
}

Dict.prototype.init = function() {
    MongoClient.connect(
        'mongodb://localhost:27017/words',
        function(err, db) {
            if (err) {
                throw err;
            }

            this.words = db.collection('words');
            this.longwords = db.collection('longwords');
        }.bind(this)
    );
};

Dict.prototype.checkHasWord = function(word, callback) {
    this.words.findOne({'word': word}, function(err, doc) {
        if (err) {
            throw err;
        }

        if (doc) {
            process.nextTick(callback);
        }
    });
};

Dict.prototype.getLongWord = function(callback) {
    var rand = Math.random();
    this.longwords.findOne({'random': {'$gte': rand}}, function(err, doc) {
        if (err) throw err;

        if (doc) {
            process.nextTick(function() {
                callback(doc.word);
            });
            return;
        }

        this.longwords.findOne({'random': {'$lte': rand}}, function(err, doc) {
            if (err) throw err;

            if (doc) {
                process.nextTick(function() {
                    callback(doc.word);
                });
            }
        }.bind(this));
    }.bind(this));
};