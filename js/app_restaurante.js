//var url_server = 'http://159.203.128.165:8080/';
//var url_server = 'http://127.0.0.1:3001/';
var url_server = 'http://192.168.0.32:3001/';
var socket = io.connect(url_server);
/* Controlador para secretario */
var app = angular.module('secreto', [])

$(document).on("click", ".logout", function(){
    localStorage.removeItem("usuario")
    window.location.href = '../index.html'
})

app.directive('fileModel', ['$parse', function ($parse) {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            var model = $parse(attrs.fileModel);
            var modelSetter = model.assign;
            
            element.bind('change', function(){
                scope.$apply(function(){
                    modelSetter(scope, element[0].files[0]);
                });
            });
        }
    };
}]);

app.service('fileUpload', ['$http', function ($http) {
    this.uploadFileToUrl = function(nombre, file, tarea, uploadUrl){
        var fd = new FormData();
        fd.append('photo', file);
        fd.append('nombre', nombre)
        $http.post(uploadUrl, fd, {
            transformRequest: angular.identity,
            headers: {'Content-Type': undefined}
        })
        .success(function(response){
            if(response.type){
                tarea.id = tarea._id; // Pasamos la _id a id para mayor comodidad del lado del servidor a manejar el dato.
                delete tarea._id
                tarea.ACUSTA = 'Terminada';
                tarea.url_file = response.ruta;
                $http.put(url_server+"tarea/actualizar", tarea).success(function(response) {
                    $("#mensaje").empty();
                    $("#mensaje").append('<div class="chip col s12 m12 l12">Tarea finalizada. <i class="material-icons">Cerrar</i></div>');
                    $("#mensaje").css('color', '#FFF');
                    location.reload();
                })
                //$("#mensaje").html("Se ha subido el archivo <a href='empleado.html'>Volver</a>")
            }
            else
                $("#mensaje").html("Ocurrio un error al subir el archivo")
        })
        .error(function(){
            $("#mensaje").html("Ocurrio un error al subir el archivo")
        });
    }
}]);

app.controller('restauranteController', ['$scope', '$http', 'fileUpload', function($scope, $http, fileUpload){
	var usuario = localStorage.getItem("usuario")
	$scope.usuario = JSON.parse(usuario);
    var empresa = $scope.usuario.EMPIDC;//localStorage.getItem("empresa")
	
    /* Obtenemos Información de platillos */
    $scope.menu = {};
    listarBebidas();
    listarPostres();
    listarPlatillos();
    listarMenu();
    listarIngredientes();

    /* Definición de las funciones anteriores */
    function listarBebidas(){
        if(empresa != undefined){
            $http.get(url_server+"restaurante/listarBebidas/"+empresa).success(function(response) {
                $scope.bebidas = response.data;
            });
        }
    }

    function listarPostres(){
        if(empresa != undefined){
            $http.get(url_server+"restaurante/listarPostres/"+empresa).success(function(response) {
                $scope.postres = response.data;
            });
        }
    }

    function listarPlatillos(){
        if(empresa != undefined){
            $http.get(url_server+"restaurante/listarPlatillos/"+empresa).success(function(response) {
                $scope.platillos = response.data;
            });
        }
    }

    function listarMenu(){
        if(empresa != undefined){
            $http.get(url_server+"restaurante/listarMenu/"+empresa).success(function(response) {
                $scope.menu = response.data;
            });
        }
    }

    function listarIngredientes(){
        if(empresa != undefined){
            $http.get(url_server+"restaurante/listarIngredientes/"+empresa).success(function(response) {
                $scope.ingredientes = response.data;
            });
        }
    }

    function getEmpleados() {
        $http.get(url_server+"user/usuario/3/"+empresa).success(function(response) {
            if(response.type) { // Si nos devuelve un OK la API...
                $scope.personas = response.data;
            }
        });
    }

    /* Agregar un platillo a la comanda */
    $scope.verComanda = function(){
        $("#verComanda").openModal();
    }

	$scope.comanda = [];

    $scope.addTortaToComanda = function(torta){
        var platillo = {
            tipo : "torta",
            torta : torta.INGNOM,
            precio : torta.INGPRE
        }
        if($scope.comanda.indexOf(platillo) >= 0){
            var notification = document.querySelector('.mdl-js-snackbar');
            var data = {
                message: "Este plantillo ya ha sido agregado a la comanda",
                timeout: 4000
            };
            notification.MaterialSnackbar.showSnackbar(data);
            return;
        }
        $scope.comanda[$scope.comanda.length] = platillo;
        var notification = document.querySelector('.mdl-js-snackbar');
        var data = {
            message: "Agregado a la comanda",
            timeout: 4000
        };
        notification.MaterialSnackbar.showSnackbar(data);
    }

    /*$scope.addCartaToComanda = function(carta){
        var platillo = {
            tipo = "carta",
            carta : carta.PLANOM,
            precio : carta.PLAPRE
        }
        if($scope.comanda.indexOf(platillo) >= 0){
            var notification = document.querySelector('.mdl-js-snackbar');
            var data = {
                message: "Este plantillo ya ha sido agregado a la comanda",
                timeout: 4000
            };
            notification.MaterialSnackbar.showSnackbar(data);
            return;
        }
        $scope.comanda[$scope.comanda.length] = platillo;
        var notification = document.querySelector('.mdl-js-snackbar');
        var data = {
            message: "Agregado a la comanda",
            timeout: 4000
        };
        notification.MaterialSnackbar.showSnackbar(data);
    }*/

    /*$scope.addBebidasToComanda = function(bebida){
        var platillo = {
            tipo = "bebida",
            bebida : bebida.BEBNOM,
            precio : bebida.BEBPRE
        }
        if($scope.comanda.indexOf(platillo) >= 0){
            var notification = document.querySelector('.mdl-js-snackbar');
            var data = {
                message: "Este plantillo ya ha sido agregado a la comanda",
                timeout: 4000
            };
            notification.MaterialSnackbar.showSnackbar(data);
            return;
        }
        $scope.comanda[$scope.comanda.length] = platillo;
        var notification = document.querySelector('.mdl-js-snackbar');
        var data = {
            message: "Agregado a la comanda",
            timeout: 4000
        };
        notification.MaterialSnackbar.showSnackbar(data);
    }*/

    $scope.addPlatilloToComanda = function(platillo){
        $scope.platillo_act = platillo;
        $scope.tipo = "menu";
        $("#addGuarnicion").openModal()
    }

    $scope.addCartaToComanda = function(platillo){
        $scope.platillo_act = platillo;
        $scope.tipo = "carta";
        $("#addGuarnicion").openModal()
    }

    $scope.addGuarnicionToComanda = function(guarnicion){
        var subtotal = ($scope.tipo=="menu") ? parseFloat($scope.platillo_act.MENPRE) : parseFloat($scope.platillo_act.PLAPRE);
        var platillo = {
            tipo : "menu",
            platillo_principal : ($scope.tipo=="menu") ? $scope.platillo_act.MENNOM : $scope.platillo_act.PLANOM,
            precio_platillo : ($scope.tipo=="menu") ? $scope.platillo_act.MENPRE : $scope.platillo_act.PLAPRE,
            guarnicion : (guarnicion!=null) ? guarnicion.MENNOM : "",
            precio_guarnicion : (guarnicion!=null) ? guarnicion.MENPRE : "$ 0.0",
            bebida : "",
            precio_bebida : " $ 0.0",
            postre : "",
            precio_postre : "$ 0.0",
            comentarios : "",
            total : (guarnicion!=null) ? subtotal + parseFloat(guarnicion.MENPRE) : subtotal
        }
        $scope.platillo_act = platillo;
        $("#addGuarnicion").closeModal();
        $("#addBebida").openModal();
    }

    $scope.addBebidaToComanda = function(bebida){
        $scope.platillo_act.bebida = (bebida!=null) ? bebida.BEBNOM : "";
        $scope.platillo_act.precio_bebida = (bebida!=null) ? bebida.BEBPRE : "$ 0.0";
        var subtotal = $scope.platillo_act.total;
        $scope.platillo_act.total = (bebida!=null) ? subtotal + parseFloat(bebida.BEBPRE) : subtotal;
        $("#addBebida").closeModal();
        $("#addPostre").openModal();
    }

    $scope.addPostreToComanda = function(postre){
        $scope.platillo_act.postre = (postre!=null) ? postre.POSNOM : "";
        $scope.platillo_act.precio_postre = (postre!=null) ? postre.POSPRE : "$ 0.0";
        var subtotal = $scope.platillo_act.total;
        $scope.platillo_act.total = (postre!=null) ? subtotal + parseFloat(postre.POSPRE) : subtotal;
        $("#addPostre").closeModal();
        $("#addComentario").openModal();
    }

    $scope.finishPedido = function() {
        $scope.comanda[$scope.comanda.length] = $scope.platillo_act;
        $("#addPostre").closeModal();
        var notification = document.querySelector('.mdl-js-snackbar');
        var data = {
            message: "Agregado a la comanda",
            timeout: 4000
        };
        notification.MaterialSnackbar.showSnackbar(data);  
    }

    /* Modulos para enviar la comanda */
    $scope.info = {}

    $scope.enviarComanda = function(){
        if($scope.comanda.length == 0){
            var notification = document.querySelector('.mdl-js-snackbar');
            var data = {
                message: "No hay nada en la comanda",
                timeout: 4000
            };
            notification.MaterialSnackbar.showSnackbar(data); 
            return;
        }
        getEmpleados();
        $("#selectOperador").openModal();
    }

    $scope.enviarConfirmacionComanda = function(){
        $scope.confirmacion = 1;
        var values = $scope.info.responsable.split("-");
        $scope.info.EMPIDE = values[0];
        $scope.info.EMPNOM = values[1];
        $("#selectOperador").closeModal();
        $("#verComanda").openModal();
    }

    $scope.finishEnviar = function(){
        $scope.info.comanda = $scope.comanda;
        $scope.info.mesero = $scope.usuario._id;
        $scope.info.servida = false;
        socket.emit("nueva_comanda", $scope.info);
        $scope.comanda = [];
        $scope.info = {};
        $("#verComanda").closeModal();
        var notification = document.querySelector('.mdl-js-snackbar');
        var data = {
            message: "Comanda enviada",
            timeout: 4000
        };
        notification.MaterialSnackbar.showSnackbar(data);
    }

    socket.on("comanda_servida", function(co){
        if(co.mesero != $scope.usuario._id){
            return;
        }
        var notification = document.querySelector('.mdl-js-snackbar');
        var data = {
            message: "Comanda servida",
            timeout: 4000
        };
        notification.MaterialSnackbar.showSnackbar(data);
    });

}]);
