var http = require("http").createServer(handler);
var firmata = require("firmata");
var io = require("socket.io").listen(http); // knjižnica za vtičnike
var fs = require("fs"); // knjižnica za delo z datotečnim sistemom ("file system fs")

var board = new firmata.Board("/dev/ttyACM0", function(){// ACM (Abstract Control Model)
                                                         // za serijsko komunikacijo z Arduinom (lahko je USB)
    console.log("Priklop na Arduino");
    board.pinMode(13, board.MODES.OUTPUT); // Posamezni pin konfiguriramo, da deluje kot vhod ali izhod
    board.pinMode(8, board.MODES.OUTPUT); // Posamezni pin konfiguriramo, da deluje kot vhod ali izhod
    board.pinMode(7, board.MODES.OUTPUT); // Posamezni pin konfiguriramo, da deluje kot vhod ali izhod
    board.pinMode(2, board.MODES.OUTPUT); // Posamezni pin konfiguriramo, da deluje kot vhod ali izhod
});

function handler(req, res) { // "handler", ki je uporabljen pri require("http").createServer(handler)
    fs.readFile(__dirname + "/naloga01.html", // povemo, da bomo ob zahtevi ("request") posredovali
    function (err, data) {                    // klientu datoteko primer04.html iz diska strežnika
        if (err) {
            res.writeHead(500, {"Content-Type": "text/plain"});
            return res.end("Napaka pri nalaganju html strani.");
        }
    res.writeHead(200);
    res.end(data);
    });
}

http.listen(8080); // strežnik bo poslušal na vratih 8080

io.sockets.on("connection", function(socket) {
    socket.on("ukazArduinu", function(štUkaza) {
        if (štUkaza == "1") {
            board.digitalWrite(13, board.HIGH); // zapišemo +5V na pin 13
        }
        if (štUkaza == "0") {
            board.digitalWrite(13, board.LOW); // zapišemo 0V na pin13
        }
        if (štUkaza == "3") {
            board.digitalWrite(8, board.HIGH); // zapišemo +5V na pin 8
        }
        if (štUkaza == "2") {
            board.digitalWrite(8, board.LOW); // zapišemo 0V na pin8
        }
        if (štUkaza == "5") {
            board.digitalWrite(7, board.HIGH); // zapišemo +5V na pin 13
        }
        if (štUkaza == "4") {
            board.digitalWrite(7, board.LOW); // zapišemo 0V na pin13
        }
        if (štUkaza == "7") {
            board.digitalWrite(2, board.HIGH); // zapišemo +5V na pin 8
        }
        if (štUkaza == "6") {
            board.digitalWrite(2, board.LOW); // zapišemo 0V na pin8
        }
    });
});