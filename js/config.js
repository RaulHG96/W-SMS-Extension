$(document).ready(function() {				
	chrome.storage.local.get('tiempo_sync', function(data){
		if (data.tiempo_sync != undefined) {
			$("#tiempo_sync").val(data.tiempo_sync);
		}
	})
});

$("#tiempo_sync").change(function(event) {
	chrome.runtime.sendMessage({
		type: "change_tm"
	});
	chrome.storage.local.set({'tiempo_sync': $("#tiempo_sync").val()}, function(){
		alert("Se guardó configuración");
	});
});