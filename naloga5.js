var http = require("http").createServer(handler); // pri req - handler
var io = require("socket.io").listen(http); // socket.io knjižnica
var fs = require("fs"); // spremenljivka za "file system" za branje .html dat.
var firmata = require("firmata"); // za komunikacijo z mikrokontrolerjem

console.log("Zagon aplikacije");

var board = new firmata.Board("/dev/ttyACM0", function(){
    console.log("Povezava na Arduino");
    console.log("Aktiviramo Pin 13");
    board.pinMode(13, board.MODES.OUTPUT); // pin13 kot izhod
    console.log("Omogočimo Pin 8 kot vhod");
    board.pinMode(2, board.MODES.INPUT);
     board.pinMode(8, board.MODES.INPUT);
     board.pinMode(10, board.MODES.INPUT);
     board.pinMode(7, board.MODES.INPUT);
     
     board.pinMode(3, board.MODES.PWM); // Pulse Width Modulation - hitrost
});

function handler(req, res) {
    fs.readFile(__dirname + "/naloga5.html",
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

var timeout = false;
var zadnjaPoslana = null;
var zadnjaVrednost = null;

board.digitalRead(8, function(value) { // digitalno branje se dogodi večkrat, ob spremembi stanja iz 0->1 ali 1->0
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
                //board.digitalWrite(2,1);
                board.analogWrite(3,0);
            }
            else if (value == 1) {
                board.digitalWrite(13, board.HIGH);
                console.log("Vrednost = 1, LED prižgana");
                pošljiVrednostPrekoVtičnika(1);
               
                board.analogWrite(3,100);
            }

        }
        

        zadnjaPoslana = zadnjaVrednost;
        
    }, 50); // izvedemo po 50ms
                
    zadnjaVrednost = value; // ta vrednost se prebere iz nožice 2 večkrat na s
    
}); // konec "board.digitalRead"
var timeout1 = false;
var zadnjaPoslana1 = null;
var zadnjaVrednost1 = null;

board.digitalRead(7, function(value) { // digitalno branje se dogodi večkrat, ob spremembi stanja iz 0->1 ali 1->0
    if (timeout1 !== false) { // če se je timeout spodaj pričel, (ob nestabilnem vhodu, npr. 0 1 0 1) ga biršemo
	   clearTimeout(timeout1); // brišemo timeout dokler ni digitalni vhod stabilen, i.e. timeout = false
	   console.log("Timeout je postavljen na false");
    }
    timeout1 = setTimeout(function() { // ta del kode se bo izvedel po 50 ms; če se vmes dogodi sprememba stanja, ga gornja koda izbriše
    // zgornja vrstica pomeni timeout = true
        console.log("Timeout je postavljen na true");
        timeout1 = false;
        if (zadnjaVrednost1 != zadnjaPoslana1) { // to send only on value change
        	if (value == 0) {
                board.digitalWrite(13, board.LOW);
                console.log("Vrednost = 0, LED izklopljena");
                pošljiVrednostPrekoVtičnika(0);
                board.digitalWrite(2,1);
               
            }
            else if (value == 1) {
                board.digitalWrite(13, board.HIGH);
                console.log("Vrednost = 1, LED prižgana");
                pošljiVrednostPrekoVtičnika(1);
                board.digitalWrite(2,1);
                board.analogWrite(3,100);
            }

        }
        

        zadnjaPoslana1 = zadnjaPoslana1;
        
    }, 50); // izvedemo po 50ms
                
    zadnjaVrednost = value; // ta vrednost se prebere iz nožice 2 večkrat na s
    
}); // konec "board.digitalRead"
var timeout2 = false;
var zadnjaPoslana2 = null;
var zadnjaVrednost2 = null;

board.digitalRead(10, function(value) { // digitalno branje se dogodi večkrat, ob spremembi stanja iz 0->1 ali 1->0
    if (timeout2 !== false) { // če se je timeout spodaj pričel, (ob nestabilnem vhodu, npr. 0 1 0 1) ga biršemo
	   clearTimeout(timeout2); // brišemo timeout dokler ni digitalni vhod stabilen, i.e. timeout = false
	   console.log("Timeout je postavljen na false");
    }
    timeout2 = setTimeout(function() { // ta del kode se bo izvedel po 50 ms; če se vmes dogodi sprememba stanja, ga gornja koda izbriše
    // zgornja vrstica pomeni timeout = true
        console.log("Timeout je postavljen na true");
        timeout2 = false;
        if (zadnjaVrednost2 != zadnjaPoslana2) { // to send only on value change
        	if (value == 0) {
                board.digitalWrite(13, board.LOW);
                console.log("Vrednost = 0, LED izklopljena");
                pošljiVrednostPrekoVtičnika(0);
                board.digitalWrite(2,0);
               
            }
            else if (value == 1) {
                board.digitalWrite(13, board.HIGH);
                console.log("Vrednost = 1, LED prižgana");
                pošljiVrednostPrekoVtičnika(1);
                board.digitalWrite(2,0);
                board.analogWrite(3,100);
            }

        }
        

        zadnjaPoslana2 = zadnjaVrednost2;
        
    }, 50); // izvedemo po 50ms
                
    zadnjaVrednost = value; // ta vrednost se prebere iz nožice 2 večkrat na s
    
}); // konec "board.digitalRead"

}); // konec "board.on ready"
