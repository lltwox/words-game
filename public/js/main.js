$(function() {
    var room = io.connect('http://localhost:3000/room');
    room.on('connect', function() {
        alert('Finally!');
    });
});