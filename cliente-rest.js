//AMIGO INVISIBLE CLIENTE REST
//cliente para el servidor: server.js
var rest = require('restler');

var url_local = "http://127.0.0.1:5000";//servidor local para desarrollo
var url_prod = "http://sorteo-amigo-invisible.herokuapp.com";//servidor en produccion HEROKU
var url = url_prod;

//borramos cualquier fiesta anterior
rest.del( url + "/borrar/").on('complete', function( data ) {
    console.log( data );
});

//creamos una fiesta
rest.put( url + "/fiesta/24-12-2014/Granada/15").on('complete', function( data ) {
    console.log( data );
});

//agregamos como minimo 3 participantes para poder jugar
rest.post( url + "/participante/0/juanfe/juanfe.godoy@gmail.com").on('complete', function( data ) {
    console.log( data );
});
rest.post( url + "/participante/1/ines/valentinness@hotmail.com").on('complete', function( data ) {
    console.log( data );
});
rest.post( url + "/participante/2/luigi/info@eurekios.com").on('complete', function( data ) {
    console.log( data );
});

//sortear
rest.get(url+"/sortear/").on('complete', function(data) {
  console.log("SORTEADO: "+data);
});
