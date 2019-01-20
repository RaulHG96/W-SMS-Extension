// Para agregar jquery desde consola
var script = document.createElement("script");
script.setAttribute("src", "https://ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery.min.js");
script.addEventListener('load', function() {
	var script = document.createElement("script");
	document.body.appendChild(script);
}, false);
document.body.appendChild(script);


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
var elemento = arrayMsj[0];
////////////////////////////////////////////////////////////////////////////////
// A partir de la variable que se obtiene del chat se obtienen cada un de los //
// span que se encuentren dentro de un div con un padre span                  //
// RECORDAR QUE SE TE TIENE QUE RECORRER EL ARREGLO REGRESADO AL BUSCAR       //
// ESTO PARA VERIFICAR SI CONTIENE LA CLASE DE NO LEÍDO                       //
////////////////////////////////////////////////////////////////////////////////
var obj = $(elemento).find('span>div>span');
////////////////////////////////////////////////////////////////////////
// Cada vez que se recorre se verifica cada uno los objetos obtenidos //
// para verificar si contiene un color de fondo de: rgb(9, 210, 97)   //
////////////////////////////////////////////////////////////////////////
$(obj).css('background-color');

////////////////////////////////////////////////////////////
// Para obtener el panel donde se encuentran los mensajes //
////////////////////////////////////////////////////////////
$('div.copyable-area>div>div')[2]