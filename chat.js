var http = require("http");
var fs = require("fs");
var server = http.createServer(function (request, response) {
	fs.readFile("chat_client.html", function (err, content) {
		response.write(content);
		response.end();
	});
});
server.listen(8080);
var userSocket = require("socket.io").listen(server).sockets;

userSocket.on("connection", function (client) {
	//client.broadcast.emit('receive-message', userName , " joined...");
	client.on("send-message", function(message) {
		client.emit("receive-message", message.name, message.message);
		client.broadcast.emit('receive-message', message.name, message.message);
	});	
	
	//client.on();
});
