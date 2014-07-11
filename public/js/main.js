
//--------------------------------------------------------------------------
// Comprobar que los campos estan rellenos antes de pasar al paso siguiente
//--------------------------------------------------------------------------
var paso1 = $("#paso1");
var paso2 = $("#paso2");
var paso3 = $("#paso3");

paso1.mouseleave(function() {
  if( paso1Completado()){
    crearFiesta();//AJAX
  }
  todosPasosCompletados();
});
function paso1Completado(){
  var completado = false;
  var fecha = $("#datepicker").val();
  var lugar = $("#lugar").val();
  var presupuesto = $("#presupuesto").val();
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

paso2.mouseleave(function() {
  if(paso2Completado()){
    crearParticipantes();//AJAX
  }
  todosPasosCompletados();
});
function paso2Completado(){
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

function todosPasosCompletados(){
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
//---------------------------------------------------------------------------


//calendario para seleccionar fecha de la fiesta
$( "#datepicker" ).datepicker({ dateFormat: "dd-mm-yy" });

// boton +
$("#nuevo").click(function( event ) {
  var contador = $(".badge:last");
  var num = parseInt( contador.text(), 10 )+1;
  var nuevo = $('<div class="row"><div class="col-md-9 col-md-offset-1"><div class="input-group"><span class="input-group-addon">Nombre</span><input id="nombre'+num+'" type="text" class="form-control" placeholder="nombre"><span class="input-group-addon">E-mail</span><input id="email'+num+'" type="text" class="form-control" placeholder="e-mail"></div></div><div class="col-md-1"><span class="badge">'+num+'</span></div></div>');
  $("#controles").before(nuevo);
  //al agregar un nuevo participante debemos establecer estado a no completado
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
    $("#dialogError").dialog("open");
  }
  //vuelvo a comprobar si el formulario esta completado
  paso2Completado();
});

//boton sortear
$("#sortear").click(function() {
  //REST: realizar sorteo y enviar email
  sortear();
});

//------------------------------
//           DIALOG
//------------------------------
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
//dialog sorteando y enviando emails...
$( "#dialogCompletado" ).dialog({
  modal: true,
  buttons: { Ok: function() { $( this ).dialog( "close" );
                              borrarFiesta();
                             } },
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

//----------------------------
//          A J A X
//----------------------------
var url_local = "http://127.0.0.1:5000";//servidor local para desarrollo
var url_prod = "http://sorteo-amigo-invisible.herokuapp.com";//servidor en produccion HEROKU
var url = url_prod;


function crearFiesta(){
  var fecha = $("#datepicker").val();
  var lugar = $("#lugar").val();
  var presupuesto = $("#presupuesto").val();

  $.post(url+"/fiesta/"+fecha+"/"+lugar+"/"+presupuesto, function(data) {

    }).done(function() {
      $("#checkPaso1").removeClass("glyphicon-pencil");
      $("#checkPaso1").addClass("glyphicon-ok");
    }).fail(function() {
      alert( "Ha ocurrido un error al crear la fiesta" );
    });
}
function crearParticipantes(){
  //REST:crear participantes juego
  var contador = $(".badge:last");
  var num = parseInt( contador.text(), 10 );
  for(var i=1; i<=num; i++){
    crearUnParticipante(i-1, $("#nombre"+i).val(), $("#email"+i).val());
  }
}
function crearUnParticipante(id, nombre, email){
  $.post(url+"/participante/"+id+"/"+nombre+"/"+email, function(data) {
  })
  .done(function() {
    $("#checkPaso2").removeClass("glyphicon-pencil");
    $("#checkPaso2").addClass("glyphicon-ok");
  })
  .fail(function() {
    alert( "Ha ocurrido un error al crear el participante: "+nombre );
  });
}
function sortear(){
  $.get(url+"/sortear/", function(data) {
  })
  .done(function() {
    $("#dialogCompletado").dialog("open");
  })
  .fail(function() {
    alert( "Ha ocurrido un error al sortear" );
  });
}
function borrarFiesta(){
  alert("borrar");
  $.ajax({
    url: url+"/borrar/",
    type: 'DELETE',
    success: function(result) {
        // Do something with the result
        $("#pasos").fadeOut("slow");
        $("#informacion").text( "GRACIAS por participar!!!!" )
    }
  });
}
