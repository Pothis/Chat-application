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

var userList = ["Group"];
var userSocketList = {};

userSocket.on("connection", function (client) {
	
	var username;
	var userMessages = {};
	var isAlreadyAdded = false;
	
	client.on("send-message", function(message) {
		client.emit("receive-message", "You", message.message);
		client.broadcast.emit('receive-message', message.name, message.message);
	});	
	
	client.on("join", function(name) {
		client.broadcast.emit("new-user-joined", name);
		client.broadcast.emit("receive-message", name , " joined...");
		client.emit("list-all-users", userList);
		userList.push(name);
		username = name;
		userSocketList[name] = client;
	});
	
	client.on("disconnect", function () {
		if (username) {
			client.broadcast.emit("receive-message", username, "disconnected...");
		}
		
		for (var i = 0, len = userList.length; i < len; i++) {
			if (userList[i] == username) {
				userList.splice(i, 1);
				client.broadcast.emit("list-all-users", userList);
			}
		}
	});
	
	client.on("store-user-messages", function (usr, message) {
		userMessages[usr] = message;
	}); 
	
	client.on("get-user-messages", function (usr, currentMessage) {
		if (currentMessage) {
			userMessages[usr] ? userMessages[usr] += currentMessage : userMessages[usr] = currentMessage;
		}
		client.emit("list-user-messages", userMessages[usr]);
	});
	
	client.on("send-message-private", function (data) {console.log(data['private-chat-user']);
		userSocketList[data['private-chat-user']].emit("receive-message-private", 
													 data["name"], 
													 data["message"]);
		client.emit("receive-message-private", "You", data["message"]);
	});
	
});
