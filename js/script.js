var enviado = false;
var interval;
$(document).ready(function() {
	//verificarLlave();
	$('[data-toggle="tooltip"]').tooltip();
	//chrome.storage.local.set({'tiempo_sync': $("#tiempo_sync").val()}, function(){});
})

/**
 * Función evento botón "Enviar" página de API WhatsApp
 */
function eventEnviar() {
	document.getElementById("action-button").click();
}


/**
 * Función evento "Enviar" de página WhatsApp Web
 */
function mandarMensaje() {
	document.querySelector('button.compose-btn-send').click();
	interval = setInterval(checarEnvioMsg,100);
}

function checarEnvioMsg() {
	//console.log(document.querySelector(".status-icon>span").getAttribute("data-icon"));
	if (document.querySelector(".status-icon>span").getAttribute("data-icon") != null) {
		var estadoMsg = document.querySelector(".status-icon>span").getAttribute("data-icon");
		if (estadoMsg == "msg-dblcheck-ack" || estadoMsg == "msg-dblcheck" 	|| estadoMsg == "msg-check") {
			console.log("Enviado");
			chrome.runtime.sendMessage({
				type: "enviado"
			});			
			clearInterval(interval);
		}
	}
}

function actualizarLeyendas(tipoAccion){
	switch(tipoAccion){
		case 1://Durante envío de petición
        	$("#sync").css("display","block");
        	$("#sync-end").css("display","none");			
		break;
		case 2://Success
        	$("#sync").css("display","none");
        	$("#sync-end").css("display","block");
        	$("#text-sync").html("Usted tiene mensaje(s) <br/> Iniciando envío...");
		break;
		case 3://Error
        	$("#sync").css("display","none");
        	$("#sync-end").css("display","block");
        	$("#text-sync").html("Error al consultar");
		break;
		default:
		break;
	}
}

/**
 * Recepción de mensaje de script background de extensión
 */
chrome.runtime.onMessage.addListener(gotMessage);

function gotMessage(message, sender, sendResponse){
	switch(message.txt){
		case "Whatsapp Web":
			mandarMensaje();
		break;
		case "API Whatsapp":
			eventEnviar();
		break;
		case "Actualizar Leyenda":
			actualizarLeyendas(message.tipoAccion);
		break;
		case "En cola":
			$("#en_cola").html(message.cant);
		break;
		default:
		break;
	}
}

$("#btn_verificar_llave").click(function(){
	if ($("#API_key").val() == "") {
		$("#alerta").html("Ingrese Llave");
		$("#alerta").css("display","block");
	} else {
		$("#alerta").css("display","none");
	    $.ajax({                        
	        type: "POST",                 
	        url: "http://pruebas.krb-it.mx/wsms/ajax/verificarLlave.php",      
	        dataType:'html',
	        data: {
	            llave: $("#API_key").val()
	        },
	        cache: false,
	        beforeSend:function(){
	        	$("#btn_verificar_llave").attr('disabled','disabled');
	           	$("#btn_verificar_llave").html("Verificando...");
	        },
	        success: function(result)            
	        {
	            if (result == "1") {
	            	$("#btn_verificar_llave").html("Verificar");
	            	$("#btn_verificar_llave").removeAttr('disabled','disabled');
	            	//Se verifica existencia de variable para mandar a la siguinte ventana de popup
			    	chrome.storage.local.set({'web_key': $("#API_key").val()}, function(){
						$("#alerta").removeClass("alert-danger");
						$("#alerta").addClass("alert-success");
						$("#alerta").html("Se ha verificado cuenta, cierre y vuelva abrir extensión para refrescar");
						$("#alerta").css("display","block");
						chrome.browserAction.setPopup({popup:"src/principal.html"});
			    	});	            	
	            } else if(result == "2"){
	            	$("#alerta").html("Error al verificar cuenta");
	            	$("#alerta").css("display","block");
	            	$("#btn_verificar_llave").html("Verificar");	            	
	            	$("#btn_verificar_llave").removeAttr('disabled','disabled');
	            } else if(result == "0"){
	            	$("#alerta").html("No coincide con ninguna cuenta");
	            	$("#btn_verificar_llave").html("Verificar");
	            	$("#btn_verificar_llave").removeAttr('disabled','disabled');
	            	$("#alerta").css("display","block");
	            }
	        },
	        error : function (result){
	            $("#alerta").html("Error al verificar");
	            $("#alerta").css("display","block");
	        }
	    });/*.fail( function( jqXHR, textStatus, errorThrown ) {
		  if (jqXHR.status === 0) {
		    alert('Not connect: Verify Network.');
		  } else if (jqXHR.status == 404) {
		    alert('Requested page not found [404]');
		  } else if (jqXHR.status == 500) {
		    alert('Internal Server Error [500].');
		  } else if (textStatus === 'parsererror') {
		    alert('Requested JSON parse failed.');
		  } else if (textStatus === 'timeout') {
		    alert('Time out error.');
		  } else if (textStatus === 'abort') {
		    alert('Ajax request aborted.');
		  } else {
		    alert('Uncaught Error: ' + jqXHR.responseText);
		  }
		})*/
	}
})

$("#btn_sincronizar").click(function() {
	alert("Se presiona");
    chrome.runtime.sendMessage({
		type: "notification"
	});
})

$("#turn_off").click(function(event) {
	$("#turn_off").css('color', '#AAAA8D');;
	$("#turn_off").removeAttr('data-original-title');
	$("#turn_off").attr('data-original-title','Presiona para habilitar la sincronización');
});