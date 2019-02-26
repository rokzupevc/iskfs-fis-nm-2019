console.log("Zagon aplikacije");

var http = require("http").createServer(handler); // pri req - handler
var io = require("socket.io").listen(http); // socket.io knjižnica
var fs = require("fs"); // spremenljivka za "file system" za branje .html dat.
var firmata = require("firmata"); // za komunikacijo z mikrokontrolerjem

console.log("Zagon aplikacije");

var board = new firmata.Board("/dev/ttyACM0", function(){
    console.log("Povezava na Arduino");
    console.log("Aktiviramo Pin 13");
    board.pinMode(13, board.MODES.OUTPUT); // pin13 kot izhod
    console.log("Omogočimo Pin 2 kot vhod");
    board.pinMode(2, board.MODES.INPUT);
});

function handler(req, res) {
    fs.readFile(__dirname + "/primer07.html",
    function (err, data) {
        if (err) {
            res.writeHead(500, {"Content-Type": "text/plain"});
            return res.end("Napaka pri nalaganju html strani.");
        }
    res.writeHead(200);
    res.end(data);
    })
}

http.listen(8080); // strežnik bo poslušal na vratih 8080

var pošljiVrednostPrekoVtičnika = function(){}; // spr. za pošiljanje sporočil

board.on("ready", function(){

io.sockets.on("connection", function(socket) {
    socket.emit("sporočiloKlientu", "Strežnik povezan, Arduino pripravljen.");
    
    pošljiVrednostPrekoVtičnika = function (value) {
        io.sockets.emit("sporočiloKlientu", value);
    }
    
}); // konec "sockets.on connection"

board.digitalRead(2, function(value) {
    if (value == 0) {
        console.log("LED izklopljena");
        board.digitalWrite(13, board.LOW);
        pošljiVrednostPrekoVtičnika(0);
    }
    if (value == 1) {
        console.log("LED vklopljena");
        board.digitalWrite(13, board.HIGH);
        pošljiVrednostPrekoVtičnika(1);
    }
    
}); // konec "board.digitalRead"

}); // konec "board.on ready"