var express = require('express');
var http = require('http');
var app     = express();
var WS      = require('ws');
var config  = require('./config/main');
var Client  = require('./client');

require('paint-console');

// HTTP
var server = http.createServer(app);
app.use(express.static(__dirname + '/../client/build/'));
server.listen(process.env.PORT || 8080, function() {
    console.info('HTTP listening on *:' + process.env.PORT || 8080);
});

// WebSocket
var ws = new WS.Server({server: server});
console.info('Websocket server created');
ws.on('connection', function(ws) {
    var client = new Client(ws);
    console.log('New conection:', client.id);
});

