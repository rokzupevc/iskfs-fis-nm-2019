var http = require("http").createServer(handler); // ob zahtevi req -> handler
var firmata = require("firmata");
var fs = require("fs"); // knjižnjica za delo z datotekami (File System fs)
var io = require("socket.io").listen(http); // knjiž. za komunik. prek socket-a 

console.log("Priklop Arduina");

var board = new firmata.Board("/dev/ttyACM0", function(){
    console.log("Aktiviramo analogni pin 0");
    board.pinMode(0, board.MODES.ANALOG);
    console.log("Aktiviramo analogni pin 1");
    board.pinMode(1, board.MODES.ANALOG);
    console.log("Aktiviramo pin 2");
    board.pinMode(2, board.MODES.OUTPUT); // pin za smer na H-mostu
    console.log("Aktiviramo pin 3");
    board.pinMode(3, board.MODES.PWM); // Pulse Width Modulation - hitrost
});

function handler(req, res) {
    fs.readFile(__dirname + "/naloga7.html",
    function(err, data) {
        if (err) {
            res.writeHead(500, {"Content-Type": "text/plain"});
            return res.end("Napaka pri nalaganju html strani!");
        }
        res.writeHead(200);
        res.end(data);
    });
}

http.listen(8080); // strežnik bo poslušal na vratih 8080

var želenaVrednost = 0; // želeno vrednost postavimo na 0
var dejanskaVrednost = 0; // dejansko vrednost postavimo na 0
var faktor = 4; // faktor, ki določa hitrost doseganja želenega stanja
var pwm = 0;

var kontrolniAlgoritemVključen = 0; // spremenljivka, ki določa ali je ctrl. alg. vključen
var intervalCtrl; // spremenljivka za setInterval v globalnem prostoru

console.log("Zagon sistema"); // izpis sporočila o zagonu

board.on("ready", function(){
    console.log("Plošča pripravljena");
    board.analogRead(0, function(value){
        želenaVrednost = value; // neprekinjeno branje pina A0
    });
    board.analogRead(1, function(value){
        dejanskaVrednost = value; // neprekinjeno branje pina A1
    });
    
    //startKontrolniAlgoritem(); // poženemo kontrolni algoritem
    
    io.sockets.on("connection", function(socket){

        setInterval(pošljiVrednosti, 40, socket); // na 40ms pošlj. vred.
        
        socket.on("startKontrolniAlgoritem", function(parametri){
           startKontrolniAlgoritem(parametri); 
        });
        
        socket.on("stopKontrolniAlgoritem", function(){
           stopKontrolniAlgoritem(); 
        });    
        
    }); // konec socket.on("connection")
    
}); // konec board.on("ready")

function kontrolniAlgoritem (parametri) {
    pwm = parametri.faktor*(želenaVrednost-dejanskaVrednost);
    if (pwm > 255) {pwm = 255}; // omejimo vrednost pwm na 255
    if (pwm < -255) {pwm = -255}; // omejimo vrednost pwm na -255
    if (pwm > 0) {board.digitalWrite(2,0)}; // določimo smer če je > 0
    if (pwm < 0) {board.digitalWrite(2,1)}; // določimo smer če je < 0
    board.analogWrite(3, Math.abs(pwm)); // zapišemo abs vrednost na pin 3
    if (dejanskaVrednost < 150 || dejanskaVrednost > 910) {
        stopKontrolniAlgoritem();
    }
}

function startKontrolniAlgoritem (parametri) {
    if (kontrolniAlgoritemVključen == 0) {
        kontrolniAlgoritemVključen = 1;
        intervalCtrl = setInterval(function(){kontrolniAlgoritem(parametri);}, 30); // kličemo alg. na 30ms
        console.log("Zagon kontrolnega algoritma");       
    }
}

function stopKontrolniAlgoritem () {
    clearInterval(intervalCtrl); // brišemo interval klica kontrolnega algoritma
    board.analogWrite(3, 0);
    kontrolniAlgoritemVključen = 0;
    console.log("Kontrolni algoritem zaustavljen.");
};

function pošljiVrednosti(socket) {
    socket.emit("klientBeriVrednosti",
    {
        "želenaVrednost": želenaVrednost,
        "dejanskaVrednost": dejanskaVrednost,
        "pwm": pwm
    });
};