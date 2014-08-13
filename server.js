var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var spawn = require('child_process').spawn;
var fs = require('fs');
var path = require("path");
var baseApps = 'apps/';

app.use('/', express.static(__dirname + '/'));

app.get('/', function(req, res){
	res.sendfile('index.html');
});


io.on('connection', function(socket){

	// Permite ejecutar las apliaciones
	socket.on('ejecutar', function(ejecutar){
		
		console.log("Ejecutando: "+__dirname + "/" + baseApps + ejecutar);

		var exec = require('child_process').exec,
		child;

		child = exec(__dirname + "/" + baseApps + ejecutar,
			function (error, stdout, stderr) {
				//console.log('stdout: ' + stdout);
				//console.log('stderr: ' + stderr);
				if (error !== null) {
					console.log('exec error: ' + error);
				}
		});
	});
	
});

io.on('connection', function (socket) {
 
 	var archivos = [];
 	//var icono = '';

 	socket.on('listar_archivos', function(carpeta){
 		archivos.length=0;
		fs.readdir( baseApps+carpeta, function (err, files) { 
			if (err) {
				throw err;
			}

			files.map(function (file) {
				return path.join(baseApps+carpeta, file);
			}).filter(function (file) {
				return fs.statSync(file).isFile();
			}).forEach(function (file) {
				if(path.extname(file)=='.lnk' || path.extname(file)=='.exe'){

					icono = path.join(baseApps+carpeta, path.basename(file,path.extname(file)))+'.png';

					if(!fs.existsSync(icono)){
						icono = baseApps+'no-icon.png';
					}

					console.log('Icono: '+icono);
					archivos.push({
						'path':path.dirname(file),
						'nombreCompleto':path.basename(file),
						'icono': icono,
						'nombre':path.basename(file,path.extname(file))}
					);
					console.log("Link: %s (%s)", file, path.extname(file));
				}
			});

			socket.emit('listar_archivos', {'archivos': archivos});

		});
	});

});

http.listen(3000, function(){
	console.log('listening on *:3000');
});
