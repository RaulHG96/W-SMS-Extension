// var enviado = false;
// var interval;
// $(document).ready(function() {
// 	//verificarLlave();
// 	$('[data-toggle="tooltip"]').tooltip();
// 	//chrome.storage.local.set({'tiempo_sync': $("#tiempo_sync").val()}, function(){});
// })

// /**
//  * Función evento botón "Enviar" página de API WhatsApp
//  */
// function eventEnviar() {
// 	document.getElementById("action-button").click();
// }


// /**
//  * Función evento "Enviar" de página WhatsApp Web
//  */
// function mandarMensaje() {
// 	document.querySelector('button.compose-btn-send').click();
// 	interval = setInterval(checarEnvioMsg,100);
// }

// function checarEnvioMsg() {
// 	//console.log(document.querySelector(".status-icon>span").getAttribute("data-icon"));
// 	if (document.querySelector(".status-icon>span").getAttribute("data-icon") != null) {
// 		var estadoMsg = document.querySelector(".status-icon>span").getAttribute("data-icon");
// 		if (estadoMsg == "msg-dblcheck-ack" || estadoMsg == "msg-dblcheck" 	|| estadoMsg == "msg-check") {
// 			console.log("Enviado");
// 			chrome.runtime.sendMessage({
// 				type: "enviado"
// 			});
// 			clearInterval(interval);
// 		}
// 	}
// }

// function actualizarLeyendas(tipoAccion){
// 	switch(tipoAccion){
// 		case 1://Durante envío de petición
//         	$("#sync").css("display","block");
//         	$("#sync-end").css("display","none");
// 		break;
// 		case 2://Success
//         	$("#sync").css("display","none");
//         	$("#sync-end").css("display","block");
//         	$("#text-sync").html("Usted tiene mensaje(s) <br/> Iniciando envío...");
// 		break;
// 		case 3://Error
//         	$("#sync").css("display","none");
//         	$("#sync-end").css("display","block");
//         	$("#text-sync").html("Error al consultar");
// 		break;
// 		default:
// 		break;
// 	}
// }
var contador = 0;
/**
 * Recepción de mensaje de script background de extensión
 */
chrome.runtime.onMessage.addListener(gotMessage);

function gotMessage(message, sender, sendResponse){
	switch(message.txt){
		case "Whatsapp Web":
			// mandarMensaje();
			agregaJQuery(function () {
				verificaMensajeNoLeidos();
				console.log('Mensaje no leídos: ' + contador);
			});
		break;
		// case "API Whatsapp":
		// 	eventEnviar();
		// break;
		// case "Actualizar Leyenda":
		// 	actualizarLeyendas(message.tipoAccion);
		// break;
		// case "En cola":
		// 	$("#en_cola").html(message.cant);
		// break;
		default:
		break;
	}
}

function agregaJQuery(callback) {
	// Para agregar jquery desde consola
	var script = document.createElement("script");
	script.setAttribute("src", "https://ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery.min.js");
	script.addEventListener('load', function() {
		var script = document.createElement("script");
		document.body.appendChild(script);
	}, false);
	document.body.appendChild(script);
	// Se llama a función
	callback();
}

function verificaMensajeNoLeidos() {
	/////////////////////////////////////////////////////////////////////
	// Para obtener el listado de mensajes en bandeja de entrada 	   //
	// Se obtiene primero el arreglo de los chats que tiene el usuario //
	/////////////////////////////////////////////////////////////////////
	var arrayMsj = $('#pane-side>div>div>div')[0].children;
	/////////////////////////////////////////////////////////////////////////////////////
	// Una vez obtenidos se recorre el arreglo para obtener cada uno de los chats      //
	// esto con el fin de verificar si el chat tiene mensajes leídos o no, almacenando //
	// el contenido en una variable                                                    //
	/////////////////////////////////////////////////////////////////////////////////////
	for (var i = 0; i < arrayMsj.length; i++) {
		var elemento = arrayMsj[i];
		////////////////////////////////////////////////////////////////////////////////
		// A partir de la variable que se obtiene del chat se obtienen cada un de los //
		// span que se encuentren dentro de un div con un padre span                  //
		////////////////////////////////////////////////////////////////////////////////
		var obj = $(elemento).find('span>div>span');
		obj.each(function(index, element) {
			////////////////////////////////////////////////////////////////////////
			// Cada vez que se recorre se verifica cada uno los objetos obtenidos //
			// para verificar si contiene un color de fondo de: rgb(9, 210, 97)   //
			////////////////////////////////////////////////////////////////////////
			if ($(element).css('background-color') == 'rgb(9, 210, 97)') {
				contador++;
			}
		});
	}
}

// $("#btn_verificar_llave").click(function(){
// 	if ($("#API_key").val() == "") {
// 		$("#alerta").html("Ingrese Llave");
// 		$("#alerta").css("display","block");
// 	} else {
// 		$("#alerta").css("display","none");
// 	    $.ajax({
// 	        type: "POST",
// 	        url: "https://wsms.hito-soft.com.mx/ajax/verificarLlave.php",
// 	        dataType:'html',
// 	        data: {
// 	            llave: $("#API_key").val()
// 	        },
// 	        cache: false,
// 	        beforeSend:function(){
// 	        	$("#btn_verificar_llave").attr('disabled','disabled');
// 	           	$("#btn_verificar_llave").html("Verificando...");
// 	        },
// 	        success: function(result)
// 	        {
// 	            if (result == "1") {
// 	            	$("#btn_verificar_llave").html("Verificar");
// 	            	$("#btn_verificar_llave").removeAttr('disabled','disabled');
// 	            	//Se verifica existencia de variable para mandar a la siguinte ventana de popup
// 			    	chrome.storage.local.set({'web_key': $("#API_key").val()}, function(){
// 						$("#alerta").removeClass("alert-danger");
// 						$("#alerta").addClass("alert-success");
// 						$("#alerta").html("Se ha verificado cuenta, cierre y vuelva abrir extensión para refrescar");
// 						$("#alerta").css("display","block");
// 						chrome.browserAction.setPopup({popup:"src/principal.html"});
// 			    	});
// 	            } else if(result == "2"){
// 	            	$("#alerta").html("Error al verificar cuenta");
// 	            	$("#alerta").css("display","block");
// 	            	$("#btn_verificar_llave").html("Verificar");
// 	            	$("#btn_verificar_llave").removeAttr('disabled','disabled');
// 	            } else if(result == "0"){
// 	            	$("#alerta").html("No coincide con ninguna cuenta");
// 	            	$("#btn_verificar_llave").html("Verificar");
// 	            	$("#btn_verificar_llave").removeAttr('disabled','disabled');
// 	            	$("#alerta").css("display","block");
// 	            }
// 	        },
// 	        error : function (result){
// 	            $("#alerta").html("Error al verificar");
// 	            $("#alerta").css("display","block");
// 	        }
// 	    });/*.fail( function( jqXHR, textStatus, errorThrown ) {
// 		  if (jqXHR.status === 0) {
// 		    alert('Not connect: Verify Network.');
// 		  } else if (jqXHR.status == 404) {
// 		    alert('Requested page not found [404]');
// 		  } else if (jqXHR.status == 500) {
// 		    alert('Internal Server Error [500].');
// 		  } else if (textStatus === 'parsererror') {
// 		    alert('Requested JSON parse failed.');
// 		  } else if (textStatus === 'timeout') {
// 		    alert('Time out error.');
// 		  } else if (textStatus === 'abort') {
// 		    alert('Ajax request aborted.');
// 		  } else {
// 		    alert('Uncaught Error: ' + jqXHR.responseText);
// 		  }
// 		})*/
// 	}
// })

// $("#btn_sincronizar").click(function() {
// 	alert("Se presiona");
//     chrome.runtime.sendMessage({
// 		type: "notification"
// 	});
// })

// $("#turn_off").click(function(event) {
// 	$("#turn_off").css('color', '#AAAA8D');;
// 	$("#turn_off").removeAttr('data-original-title');
// 	$("#turn_off").attr('data-original-title','Presiona para habilitar la sincronización');
// });