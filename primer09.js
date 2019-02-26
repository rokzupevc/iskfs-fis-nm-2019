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
    fs.readFile(__dirname + "/primer09.html",
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
    console.log("Socket id: " + socket.id);
    
    // izpišemo IP naslov, vrata, ip verzijo
    klientovIpNaslov = socket.request.socket.remoteAddress;
    io.sockets.emit("sporočiloKlientu", "socket.request.socket.remoteAddress: " + socket.request.socket.remoteAddress);
    // ::ffff:192.168.254.1 je ipv6 naslov
    // v Chrome vpišemo: http://[::ffff:192.168.254.131]:8080 -> http://[::ffff:c0a8:fe83]:8080
    io.sockets.emit("sporočiloKlientu", "socket.request.connection._peername.family: " + socket.request.connection._peername.family);
    io.sockets.emit("sporočiloKlientu", "socket.request.connection._peername.port: " + socket.request.connection._peername.port);
    io.sockets.emit("sporočiloKlientu", "socket.id: " + socket.id);
    // izluščimo ipv4 naslov ->
    var idx = klientovIpNaslov.lastIndexOf(':');
    var address4;
    if (~idx && ~klientovIpNaslov.indexOf('.')) address4 = klientovIpNaslov.slice(idx + 1);
    io.sockets.emit("sporočiloKlientu", "ipv4 naslov: " + socket.request.socket.remoteAddress);
    io.sockets.emit("sporočiloKlientu", "Podatki o klientu ----------------------------->");

    pošljiVrednostPrekoVtičnika = function (value) {
        io.sockets.emit("sporočiloKlientu", value);
    }
    
}); // konec "sockets.on connection"

var timeout = false;
var zadnjaPoslana = null;
var zadnjaVrednost = null;

board.digitalRead(2, function(value) { // digitalno branje se dogodi večkrat, ob spremembi stanja iz 0->1 ali 1->0
    if (timeout !== false) { // če se je timeout spodaj pričel, (ob nestabilnem vhodu, npr. 0 1 0 1) ga biršemo
	   clearTimeout(timeout); // brišemo timeout dokler ni digitalni vhod stabilen, i.e. timeout = false
	   console.log("Timeout je postavljen na false");
    }
    timeout = setTimeout(function() { // ta del kode se bo izvedel po 50 ms; če se vmes dogodi sprememba stanja, ga gornja koda izbriše
    // zgornja vrstica pomeni timeout = true
        console.log("Timeout je postavljen na true");
        timeout = false;
        if (zadnjaVrednost != zadnjaPoslana) { // to send only on value change
        	if (value == 0) {
                board.digitalWrite(13, board.LOW);
                console.log("Vrednost = 0, LED izklopljena");
                pošljiVrednostPrekoVtičnika(0);
            }
            else if (value == 1) {
                board.digitalWrite(13, board.HIGH);
                console.log("Vrednost = 1, LED prižgana");
                pošljiVrednostPrekoVtičnika(1);
            }

        }

        zadnjaPoslana = zadnjaVrednost;
    }, 500); // izvedemo po 50ms
                
    zadnjaVrednost = value; // ta vrednost se prebere iz nožice 2 večkrat na s
    
}); // konec "board.digitalRead"

}); // konec "board.on ready"