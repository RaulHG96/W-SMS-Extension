main();
var on = true;
var primeraCarga = false;
var mensaje = "";
var msgQueue = new Queue();
var interval;
var envio = true;

/**
 * Función principal
 * @return {[type]} [description]
 */
function main() {
	//***********************************************************
	//	Iniciar intervalos de chequeo en servidor para mensajes
	//***********************************************************
	iniciarIntervalo();
	//***********************************************************
	//	Iniciar envío de mensajes
	//***********************************************************
	//Creación de un hilo para el envío de mensajes
	Concurrent.Thread.create(function(){
	    while(true) {
	    	if (msgQueue.size() > 0) {
		    	if (envio) {
		    		envio = false;
		    		var mensaje = msgQueue.remove();
					chrome.tabs.query({
						active: true,
						currentWindow: true
					},function (tabs) {
						if (tabs.length != 0) { // Se verifica  si se encuentra en ventana de navegador, si hay tab activa
							if (tabs[0].url == "https://web.whatsapp.com/") {		    							    		
					    		chrome.tabs.update({url: "https://api.whatsapp.com/send?phone=" + mensaje.numero_destino + "&text=" + mensaje.mensaje});				    		
					    	}
					    	
					    }
					});
					actualizarEstdMsgEnviado(mensaje.idMensaje);		    		
		    	}
	    	}
	    }
	});	
}
/**
 * Actualiza estado de mensaje a enviado en base de datos
 * @param  {integer} idMensaje Identificador de mensaje a actualizar estado
 */
function actualizarEstdMsgEnviado(idMensaje){
	$.ajax({                        
        type: "POST",                 
        url: "http://pruebas.krb-it.mx/wsms/ajax/actualizarEstdMensaje.php",      
        dataType:'text',
        data: {
            idMsg: idMensaje
        },
        cache: true,
		beforeSend:function(){ },
		success:function () { },
		error: function () { }
	});	
}

/**
 * Función para iniciar el intervalo de chequeo de mensajes en el servidor
 */
function iniciarIntervalo() {
	var tmp;
	verificarTiempoSync(function (tiempo) {
		if (tiempo.tiempo_sync != undefined) {
			clearInterval(interval);
			tmp =  parseInt(tiempo.tiempo_sync);
			interval = setInterval(initSync,tmp);	
		} else {
			clearInterval(interval);
			tmp = pparseInt(5000);
			interval = setInterval(initSync,tmp);	
		}
	});
}

/**
 * Función que verifica si el tiempo se ha guardado localmente para recuperarlo
 * @return {integer} Valor en milisegundos
 */
function verificarTiempoSync(callback) {
	var tmp;
	chrome.storage.local.get('tiempo_sync', function(data){
		callback(data);
	});
}

/**
 * Recibir mensaje desde content script, este método verifica el tipo de mensaje que se envían; 
 * para después ejecutar las funciones correspondientes
 */
chrome.runtime.onMessage.addListener(function(request, sender) {
    if (request.type == "notification"){
		//console.log(request);
    } else if (request.type == "change_tm") {
    	iniciarIntervalo();
    } else if(request.type == "enviado"){
    	console.log("Si recibo el mensaje");
    	envio = true;
    }
});

/**
 * Evento que se crea para saber cuando una pestaña se ha actualizado
 * para mandar eventos javascript para el envio de acciones dentro de la página
 */
chrome.tabs.onUpdated.addListener(function(tabId, info, tab) {
    if (info.status === 'complete' && tab.status=="complete") {//Cuando la página a terminado de cargar
    	//Se divide string de cadena para saber si página que ha cargado es de whatsapp web
    	var res = tab.url.split("?");
		if (tab.url == "https://web.whatsapp.com/") {
			///WhatsApp Web hace dos cargas en la página
			///la primera no sirve para mandar el mensaje, sólo se encarga de cargar lista de mensajes
			///la segunda es la que permite mandar mensaje ya que está el chat cargado completamente
			if (!primeraCarga) {
				primeraCarga = true;
			} else {
				let msg = {
					txt: "Whatsapp Web",
					idTab: tab.id,
					mensaje: mensaje
				}
				//Comunicación entre background.js y script.js
				chrome.tabs.sendMessage(tab.id, msg);
				primeraCarga = false;
			}    			
		}else if(res[0] == "https://api.whatsapp.com/send"){
			let msg = {
				txt: "API Whatsapp",
				idTab: tab.id
			}
			//Comunicación entre background.js y script.js
			chrome.tabs.sendMessage(tab.id, msg);
		}
	}
});

/**
 * Evento click en icono de la extensiónm se coloca el popup según la llave que se tiene almacenada
 * Se agregará el popup según si la llave
 */
chrome.browserAction.onClicked.addListener(function (){
	chrome.storage.local.get('web_key', function(data){
		if (data.web_key != undefined) {
			chrome.browserAction.setPopup({popup:"src/principal.html"});
		} else {
			chrome.browserAction.setPopup({popup:"popup.html"});
		}
	})
})

/**
 * [initSync description]
 * @return {[type]} [description]
 */
function initSync() {
	chrome.storage.local.get('web_key', function(data){
		chrome.tabs.query({
			active: true,
			currentWindow: true
		},function (tabs) {
			if (tabs.length != 0) { // Se verifica  si se encuentra en ventana de navegador, si hay tab activa
				if (tabs[0].url == "https://web.whatsapp.com/") {
				    $.ajax({                        
				        type: "POST",                 
				        url: "http://pruebas.krb-it.mx/wsms/ajax/obtenerMensajesWhatsApp.php",      
				        dataType:'json',
				        data: {
				            llave: data.web_key
				        },
				        cache: true,
				        beforeSend:function(){
				        	let msg = {
				        		txt: "Actualizar Leyenda",
				        		tipoAccion: 1
				        	}
							//Comunicación entre background.js y script.js
							chrome.runtime.sendMessage(msg);		        	
				        },
				        success: function(result)            
				        {
				        	let msg = {
				        		txt: "Actualizar Leyenda",
				        		tipoAccion: 2
				        	}
							//Comunicación entre background.js y script.js  --> idMensaje
							chrome.runtime.sendMessage(msg);	
							
					    	for (var i = 0; i < result.length; i++) {
					    		if (!msgQueue.existElement(result[i].idMensaje)) {
					    			msgQueue.add(result[i]);					    		
									$.ajax({                        
								        type: "POST",                 
								        url: "http://pruebas.krb-it.mx/wsms/ajax/actualizarEstdMensaje.php",      
								        dataType:'text',
								        data: {
								            idMsg: result[i].idMensaje,
								            queue: true //Se manda queue en verdadera para saber si es una cola
								        },
								        cache: true,
					        			beforeSend:function(){ },
					        			success:function () { },
					        			error: function () { }
					        		});
					    		}
					    	}
					    	/**
					    	 * Para comunicar la cantidad de mensajes en cola
					    	 */
							let en_cola = {
				        		txt: "En cola",
				        		cant: msgQueue.size()
				        	}
							//Comunicación entre background.js y script.js  --> idMensaje
							chrome.runtime.sendMessage(en_cola);	
				        },
				        error: function (result){
				        	let msg = {
				        		txt: "Actualizar Leyenda",
				        		tipoAccion: 3
				        	}
							//Comunicación entre background.js y script.js
							chrome.runtime.sendMessage(msg);		            
				        }
				    });	
				}
			}
		});
	});
}

/*****************************************************************************************
 *****************************************************************************************
 *	CODIGO DE COLAS PARA ALMACENAR LOS MENSAJES QUE SE HAN ENCONTRADO EN BASE DE DATOS	**
 *****************************************************************************************
 *****************************************************************************************
 */

function Queue() {
    var elements = [];
 
    this.add = add;
    this.remove = remove;
    this.getFrontElement = getFrontElement;
    this.hasElements = hasElements;
    this.removeAll = removeAll;
    this.size = size;
    this.toString = toString;
    this.getElement = getElement;
    this.existElement = existElement;
 
 	/**
 	 * Agrega un elmento a la cola
 	 * @param {any} element [Elemento que se desea agregar a la cola, puede se de cualquier tipo]
 	 */
    function add(element) {
        elements.push(element);
    }
 	
 	/**
 	 * Remueve el primer elemento de la cola
 	 * @return {[any]} [Retorna el elemento eliminado de la primera posición]
 	 */
    function remove() {
        return elements.shift();
    }
 	
 	/**
 	 * Obtiene un elemento de la cola según el índice recibido
 	 * @param  {[integer]} index [ïndice del elmento que se desea obtener]
 	 * @return {[any]}       [Retorna el elemento búscado según el índice]
 	 */
 	function getElement(index){
 		return elements[index];
 	}

 	/**
 	 * Obtiene el primer elemento de la cola, sin eliminarlo
 	 * @return {[any]} [Retorna el elmento inicial de la cola]
 	 */
    function getFrontElement() {
        return elements[0];
    }   
 
 	/**
 	 * Verifica si la cola tiene elementos almacenados
 	 * @return {Boolean} [Retorna un verdadero si la cola contiene elementos, de lo contrario retorna falso]
 	 */
    function hasElements() {
        return elements.length > 0;
    }
 	/**
 	 * Remueve todos los elmentos de la cola
 	 * @return {[void]} [No retorna algo]
 	 */
    function removeAll() {
        elements = [];
    }
 
 	/**
 	 * Consulta el tamaño total de la cola
 	 * @return {[integer]} [Retorna el valor total de la cola en entero]
 	 */
    function size() {
        return elements.length;
    }

    /**
     * Verifica si elemento exista en cola
     * @param  {[integer]} id [Id del mensaje recibido]
     * @return {[boolean]}    [Retorna verdadero si elemento existe en cola y falso si no]
     */
    function existElement(id){
    	for (var i = 0; i < elements.length; i++) {
    		if (elements[i].idMensaje == id) {
    			return true;
    		}
    	}
    	return false;
    }

    /**
     * Imprime todos los elementos de la cola
     */
    function toString() {
        console.log(elements.toString());
    }
}