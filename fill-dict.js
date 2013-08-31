var fs = require('fs'),
    readline = require('readline'),
    MongoClient = require('mongodb').MongoClient,
    lazy = require("lazy");

var db = null;
var words = null;
var longWords = null;
MongoClient.connect('mongodb://localhost:27017/words', function(err, newdb) {
    if (err) {
        throw err;
    }

    db = newdb;
    words = db.collection('words');
    longWords = db.collection('longwords');

    words.drop();
    longWords.drop();

    readFile();
});

function readFile() {
    var stream = fs.createReadStream('dict.txt');
    var simpleCallback = function(err) {
        if (err) {
            throw err;
        }
    };
    new lazy(stream)
        .lines
        .forEach(function(line){
            line = line.toString();
            line = line.substr(0, line.length - 1);
            var len = line.length;
            words.insert({
                word: line
            }, simpleCallback);

            if (len >= 14) {
                longWords.insert({
                    word: line,
                    random: Math.random()
                }, simpleCallback);
            }
        }
    );
    stream.on('end', function() {
        db.close();
    });
}