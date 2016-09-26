//var url_server = 'http://159.203.128.165:8080/';
//var url_server = 'http://127.0.0.1:3001/';
var url_server = 'http://192.168.0.32:3001/';
var socket = io.connect(url_server);

/* Controlador para secretario */
var app = angular.module('secreto', [])

$(document).on("click", ".logout", function(){
    localStorage.removeItem("usuario")
    window.location.href = '../index.html'
});

app.controller('empleadoController', ['$scope', '$http', function($scope, $http){
	var usuario = localStorage.getItem("usuario")
	$scope.usuario = JSON.parse(usuario);
    var empresa = $scope.usuario.EMPIDC;
    if(localStorage.getItem("comandas") != null)
        $scope.comandas = JSON.parse(localStorage.getItem("comandas"));
    /* Actualizamos las comandas */
    socket.on("nueva_comanda", function(data){
    	if(data.EMPIDE != $scope.usuario._id){
    		return;
    	}
    	var comandas_act = [];
    	if(localStorage.getItem("comandas") == null)
    		localStorage.setItem("comandas", JSON.stringify(comandas_act));

    	comandas_act = JSON.parse(localStorage.getItem("comandas"));
    	comandas_act[comandas_act.length] = data;
    	localStorage.setItem("comandas", JSON.stringify(comandas_act));
        $scope.comandas = JSON.parse(localStorage.getItem("comandas"));
    	var notification = document.querySelector('.mdl-js-snackbar');
        var data = {
            message: "Nueva comanda",
            timeout: 4000
        };
        notification.MaterialSnackbar.showSnackbar(data);

    });

    $scope.comandaServida = function(comanda) {
        comanda.servida = true;
        socket.emit("comanda_servida", comanda);
    }
}]);