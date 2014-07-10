//AMIGO INVISIBLE CLIENTE REST
//cliente para el servidor: servert.js
var rest = require('restler');
var url = "http://127.0.0.1:8080";

//creamos una fiesta
rest.put( url + "/fiesta/24-12-2014/Granada/15").on('complete', function( data ) {
    console.log( data );
});
//agregamos como minimo 3 participantes para poder jugar
rest.post( url + "/participante/juanfe/juanfe.godoy@gmail.com").on('complete', function( data ) {
    console.log( data );
});
rest.post( url + "/participante/ines/valentinness@hotmail.com").on('complete', function( data ) {
    console.log( data );
});
rest.post( url + "/participante/luigi/info@eurekios.com").on('complete', function( data ) {
    console.log( data );
});

//sortear
rest.get(url+"/sortear/").on('complete', function(data) {
  console.log("SORTEADO: "+data);
});
