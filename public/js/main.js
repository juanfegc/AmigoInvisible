
//----------------------------------------------------
//           COMPROBAR DATOS FORMULARIO
//----------------------------------------------------
$('#paso1').mouseleave(function() {
  if( paso1Completado()){
    crearFiesta();
  }
  ultimoPaso();
});

function paso1Completado(){
  var completado = false;
  var fecha = $("#datepicker").val();
  var lugar = $("#lugar").val();
  var presupuesto = $("#presupuesto").val();
  var paso1 = $("#paso1");
  if(fecha!="" && lugar!="" && presupuesto!=""){//completado
    paso1.removeClass("alert-danger");
    paso1.addClass( "alert-success" );
    completado = true;
  }else{//no completado
    paso1.removeClass("alert-success");
    paso1.addClass( "alert-danger" );
    completado = false;
  }
  return completado;
}

$('#paso2').mouseleave(function() {
  paso2Completado();
  ultimoPaso();
});

function paso2Completado(){
  var paso2 = $("#paso2");
  //obtengo el contador del ultimo usuario agregado
  var contador = $(".badge:last");
  var num = parseInt( contador.text(), 10 );
  var completado = true;
  //recorro todos los posibles campos de participantes para ver si estan todos rellenos
  for(var i=1; i<=num && completado; i++){
    var nombre = $("#nombre"+i).val();
    var email = $("#email"+i).val();
    if(nombre=="" || email==""){
      completado = false;
    }
  }
  if(completado){
    paso2.removeClass("alert-danger");
    paso2.addClass( "alert-success" );
  }else{
    paso2.removeClass("alert-success");
    paso2.addClass( "alert-danger" );
  }
  return completado;
}

function ultimoPaso(){
  var paso3 = $("#paso3");
  var botonSortear = $("#sortear");
  if( paso1Completado() && paso2Completado() ){
    paso3.removeClass("alert-danger");
    paso3.addClass( "alert-success" );
    botonSortear.removeClass("disabled");
    botonSortear.removeClass("btn-danger");
    botonSortear.addClass("btn-success");
  }else{
    paso3.removeClass("alert-success");
    paso3.addClass( "alert-danger" );
    botonSortear.addClass("disabled");
    botonSortear.removeClass("btn-success");
    botonSortear.addClass( "btn-danger" );
  }
}
//---------------------------------------------------


//calendario para seleccionar fecha de la fiesta
$( "#datepicker" ).datepicker({ dateFormat: "dd-mm-yy" });

// boton +
$("#nuevo").click(function( event ) {
  sortear();
  var contador = $(".badge:last");
  var num = parseInt( contador.text(), 10 )+1;
  var nuevo = $('<div class="row"><div class="col-md-9 col-md-offset-1"><div class="input-group"><span class="input-group-addon">Nombre</span><input id="nombre'+num+'" type="text" class="form-control" placeholder="nombre"><span class="input-group-addon">E-mail</span><input id="email'+num+'" type="text" class="form-control" placeholder="e-mail"></div></div><div class="col-md-1"><span class="badge">'+num+'</span></div></div>');
  $("#controles").before(nuevo);
  //establecer estado a no completado
  var paso2 = $("#paso2");
  paso2.removeClass("alert-success");
  paso2.addClass( "alert-danger" );
});

//boton -
$("#eliminar").click(function( event ) {
  var contador = $(".badge:last");
  var num = parseInt( contador.text(), 10 );
  if(num>3){
    var eliminar = $("#controles").prev();
    eliminar.remove();
  }else{
    $( "#dialogError" ).dialog( "open" );
  }
  //comprobar si el formulario esta completado
  paso2Completado();
});
//dialog error eliminar usuarios
$( "#dialogError" ).dialog({
  modal: true,
  buttons: { Ok: function() { $( this ).dialog( "close" );} },
  autoOpen: false,
  show: {
  effect: "fade",
  duration: 1000
  },
  hide: {
  effect: "explode",
  duration: 1000
  }
});

//boton sortear
$("#sortear").click(function() {
  crearParticipantes();
  $("#dialogCompletado").dialog("open");
});
//dialog sorteando y enviando emails...
$( "#dialogCompletado" ).dialog({
  modal: true,
  buttons: { Ok: function() { $( this ).dialog( "close" );
                              $("#pasos").fadeOut("slow");
                              $("#informacion").text( "GRACIAS por participar!!!!" )} },
  autoOpen: false,
  show: {
  effect: "clip",
  duration: 1000
  },
  hide: {
  effect: "explode",
  duration: 1000
  }
});

//----------------
//      AJAX
//----------------
var url_local = "http://127.0.0.1:5000";//servidor local para desarrollo
var url_prod = "http://sorteo-amigo-invisible.herokuapp.com";//servidor en produccion HEROKU
var url = url_prod;


function crearFiesta(){
  var fecha = $("#datepicker").val();
  var lugar = $("#lugar").val();
  var presupuesto = $("#presupuesto").val();

  $.post(url+"/fiesta/"+fecha+"/"+lugar+"/"+presupuesto, function(data) {
            //$('.resultado').html('<h1>Resultado: '+ data+'</h1>');
            var paso1 = $("#paso1");
            paso1.removeClass("alert-success");
            paso1.addClass( "alert-warning" );
        })
        .done(function() {
            //alert( "AJAX OK" );
        })
        .fail(function() {
            alert( "Ha ocurrido un error al crear la fiesta" );
        });
}
function crearUnParticipante(nombre, email){
  $.post(url+"/participante/"+nombre+"/"+email, function(data) {
    //$('.resultado').html('<h1>Resultado: '+ data+'</h1>');
  })
  .done(function() {
    //alert( "AJAX OK" );
  })
  .fail(function() {
    alert( "Ha ocurrido un error al crear el participante: "+nombre );
  });
}
function crearParticipantes(){
  //REST:crear participantes juego
  var contador = $(".badge:last");
  var num = parseInt( contador.text(), 10 );
  for(var i=1; i<=num; i++){
    crearUnParticipante($("#nombre"+i).val(), $("#email"+i).val());
  }
  //REST: realizar sorteo y enviar email
  sortear();
}
function sortear(){
  $.get(url+"/sortear/", function(data) {
    //$('.resultado').html('<h1>Resultado: '+ data+'</h1>');
  })
  .done(function() {
    //alert( "AJAX OK" );
  })
  .fail(function() {
    alert( "Ha ocurrido un error al sortear" );
  });
}
