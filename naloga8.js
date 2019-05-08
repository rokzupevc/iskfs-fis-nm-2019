var http = require("http").createServer(handler); // "on req" - "handler"
var io = require("socket.io").listen(http); // socket knjižnica
var fs = require("fs"); // spremenljivka za "file system" za posredovanje html
var firmata = require("firmata");

var gori=0;

var board = new firmata.Board("/dev/ttyACM0", function(){
    console.log("Priklop na Arduino");
    console.log("Omogočimo Pin 0");
    board.pinMode(2, board.MODES.ANALOG); // analogna nožica 0
    board.pinMode(7, board.MODES.OUTPUT);
});

function handler(req, res) {
    fs.readFile(__dirname + "/naloga8.html",
    function (err, data) {
        if (err) {
            res.writeHead(500, {"Content-Type": "text/plain"});
            return res.end("Napaka pri nalaganju strani.");
        }
    res.writeHead(200);
    res.end(data);
    })
}

var želenaVrednost = 0; 

http.listen(8080); 

board.on("ready", function() {
    
    board.analogRead(2, function(value){
        želenaVrednost = value; // zvezno branje analogne nožice 0
    });
    
    io.sockets.on("connection", function(socket) {
        socket.emit("messageToClient", "Strežnik priključen, plošča pripravljena.");
        setInterval(sendValues, 40, socket); // na 40ms pošljemo sporočilo klientu
        socket.on("ukazArduinu", function(štUkaza) {
        if (štUkaza == "1") {
            board.digitalWrite(7, board.HIGH); // zapišemo +5V na p. 13
            //io.sockets.emit("pošljiStaticnoSporocilo", "LED GORI");
            gori=1;
        }
        if (štUkaza == "0") {
            board.digitalWrite(7, board.LOW); // zapišemo 0V na pin13
            //io.sockets.emit("pošljiStaticnoSporocilo", "LED NE GORI");
            gori=0;
        }
        
    });
        
        
        
    }); // konec "sockets.on connection"

}); // konec "board.on(ready)""

function sendValues (socket) {
    socket.emit("klientBeriVrednosti",
    {
    "želenaVrednost": želenaVrednost
    });
    if(želenaVrednost > 955 && gori == 1) {
        io.sockets.emit("pošljiStaticnoSporocilo", "LED gori");
    }
    if(želenaVrednost <= 955 && gori == 1) {
        io.sockets.emit("pošljiStaticnoSporocilo", "NAPAKA , LED ne gori");
    }
    if(želenaVrednost <= 955 && gori == 0) {
        io.sockets.emit("pošljiStaticnoSporocilo", "LED ne gori");
    }
    if(želenaVrednost > 955 && gori == 0) {
        io.sockets.emit("pošljiStaticnoSporocilo", "NAPAKA , LED gori");
    }
    
    
};