//AMIGO INVISIBLE SERVIDOR
var fs = require('fs');
var express=require('express');
var logfmt = require("logfmt");//heroku logs
var app = express();
var portada = fs.readFileSync('index.html','utf8');
//servir ficheros /js, /css, /img,/fonts
app.use(express.static(__dirname + '/public'));

app.use(logfmt.requestLogger());

//Estructura de Datos al crear una fiesta antes de sortear
//ejemplo: { fecha: '24-12-2014' ,
//           lugar: 'mi casa',
//           presupuesto: '15',
//           participantes: [ { nombre: 'juanfe', email: 'jf@gmail.com', amigo: 'nadie'},
//                            { nombre: 'ines', email: 'ines@yahoo.es', amigo: 'nadie'},
//                            { nombre: 'fer', email: 'fer@gmail.com', amigo: 'nadie'} ]
//         }
var fiesta = new Object();
var fecha, lugar, presupuesto;
var participantes = new Array();

//GET
//servir el index.html
app.get('/', function (req, res) {
    res.send(portada);
});

//PUT crea la fiesta
//curl -X PUT http://127.0.0.1:5000/fiesta/fecha/lugar/presupuesto
app.put('/fiesta/:fecha/:lugar/:presupuesto', function( req,res ) {
    fiesta = {  fecha: req.params.fecha ,
                lugar: req.params.lugar,
                presupuesto: req.params.presupuesto,
                participantes: participantes };
    res.send('Fiesta creada: '+ JSON.stringify(fiesta) + "\n");
});
//POST crea/modificar la fiesta
//curl -X POST http://127.0.0.1:5000/fiesta/fecha/lugar/presupuesto
app.post('/fiesta/:fecha/:lugar/:presupuesto', function( req,res ) {
    fiesta = {  fecha: req.params.fecha ,
                lugar: req.params.lugar,
                presupuesto: req.params.presupuesto,
                participantes: participantes };
    res.send('Fiesta modificada: '+ JSON.stringify(fiesta) + "\n");
});
//GET obtiene datos de la fiesta
//curl http://127.0.0.1:5000/fiesta/
app.get('/fiesta/', function( req,res ) {
    res.send('Fiesta: '+ JSON.stringify(fiesta) + "\n");
});
//POST crear/modificar participante a la fiesta
//curl -X POST http://127.0.0.1:5000/participante/nombre/email
app.post('/participante/:nombre/:email', function (req, res) {
    var pos_usuario = buscarNombre(req.params.nombre);
    fiesta.participantes[pos_usuario] = {nombre: req.params.nombre, email: req.params.email, amigo: "nadie"};
    participantes = fiesta.participantes;
    res.contentType('application/json');
    res.send( fiesta.participantes[pos_usuario] );
    console.log( fiesta.participantes[pos_usuario] );
});
//crear/modificar un participante
app.post('/participante/:id/:nombre/:email', function (req, res) {
    if(!fiesta.participantes){
        fiesta.participantes = new Array();
    }
    fiesta.participantes[req.params.id]= {nombre: req.params.nombre, email: req.params.email, amigo: "nadie"};
    participantes = fiesta.participantes;
    res.contentType('application/json');
    res.send( fiesta );
    console.log( fiesta );
});
//GET obtiener participantes a la fiesta
//curl http://127.0.0.1:5000/participantes
app.get('/participantes/', function (req, res) {
    res.contentType('application/json');
    res.send( fiesta.participantes );
    console.log( fiesta.participantes );
});
//GET sortear amigo invisible
//curl  -X POST http://127.0.0.1:5000/sortear/
app.get('/sortear/', function (req, res) {
    sortear();
    //res.contentType('application/json');
    res.send( 'Sorteado: '+ JSON.stringify(fiesta) + "\n" );
    console.log( fiesta.participantes );
});
//hacer un sorteo del amigo invisible  pero con los datos recibidos
//curl  -X POST http://127.0.0.1:5000/sortear/datos
app.post('/sortear/:datos', function (req, res) {
    var json_text = req.params.datos;
    var json_obj = JSON.parse(json_text);
    console.log( json_obj );
    res.send( "ok" );
});

var port = Number(process.env.PORT || 5000);
app.listen(port, function() {
    console.log("Server listening on " + port);
});


// -------------- utilidades ----------------
function buscarNombre(nombre){
    if(fiesta.participantes){
        for ( var i = 0; i < fiesta.participantes.length; i ++ ) {
            var name = fiesta.participantes[i].nombre;
            if(name == nombre){
                return i;//devuelvo la posicion del array si lo encuentro
            }
        }
        return fiesta.participantes.length;//si no lo encuentro, devuelvo posicion donde ira un nuevo elemento
    }else{
        fiesta.participantes = new Array();
        return 0;
    }
}

//----------------------
//       MAILER
//----------------------
// node mailer.js
var nodemailer   = require("nodemailer");
//datos configuracion servidor MailChimp
var username = "juanfe.godoy@gmail.com"
  , password = "BR_JF0JTpJlYUWskqDsDsA";//API Keys

// create reusable transport method (opens pool of SMTP connections)
var transport = nodemailer.createTransport("SMTP", {
    host: "smtp.mandrillapp.com", // hostname
    port: 587, //port for secure SMTP
    auth: {
        user: username,
        pass: password
    }
});

//----------------------
//       SORTEO
//----------------------
function sortear(){
    var amigos = new Array();
    for(var i=0; i<fiesta.participantes.length; i++){
        amigos[i]=i;
    }
    var repetido;
    do{
        amigos.sort(function() {return 0.5 - Math.random()});;//ordenar aleatoreamente el array de amigos
        //comprobamos que no haya coincidencias
        repetido=false;
        for(var i=0; i<amigos.length && !repetido; i++){
            if(amigos[i]==i){
                repetido=true;
            }
        }
    }while(repetido);

    //guardo resultado sorteo
    for(var i=0; i<fiesta.participantes.length; i++){
        var pos_amigo = amigos[i];
        fiesta.participantes[i].amigo = fiesta.participantes[pos_amigo].nombre;
        //--------------------------- MAILER ----------------------------
        var mailOptions = {
            from: "amigo@invisible.com>", // sender address
            to: fiesta.participantes[i].email, // list of receivers
            subject: "Amigo invisible", // Subject line
            text: "Hola "+fiesta.participantes[i].nombre+" te ha tocado "+fiesta.participantes[i].amigo+" como amigo invisible, la fiesta tendra lugar el "+fiesta.fecha+" en "+fiesta.lugar+" y el presupuesto max. para el regalo es de "+fiesta.prespuesto+"€ ", // plaintext body
            html: "<p><img src='https://sites.google.com/site/eurekioslabs/img/papanoel.png'>Hola "+fiesta.participantes[i].nombre+" te ha tocado <b>"+fiesta.participantes[i].amigo+"</b> como amigo invisible.La fiesta tendra lugar el "+fiesta.fecha+" en "+fiesta.lugar+" y el presupuesto max. para el regalo es de "+fiesta.presupuesto+"€ </p>" // html body
        }
        // send mail with defined transport object
        transport.sendMail(mailOptions, function(error, response){
            if(error){
                console.log(error);
            }else{
                console.log("Message sent: " + response.message);
            }
        });
    }
    // if you don't want to use this transport object anymore, uncomment following line
    transport.close(); // shut down the connection pool, no more messages
}

