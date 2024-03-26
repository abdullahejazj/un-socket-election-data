const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const port = 3000;
const clients = {};    //track connected clients with their names

// Server Web Client
app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
});

// Make one reference to event name so it can be easily renamed 
const chatEvent = "chatMessage";

// When a client connects, bind each desired event to the client socket
io.on('connection', socket => {
    socket.on('setUsername', name => {
        clients[socket.id] = name; // Store the user's name with their socket ID
        const clientConnectedMsg = name + ' connected, total: ' + Object.keys(clients).length;
        io.emit(chatEvent, clientConnectedMsg);
        console.log(clientConnectedMsg);
    });

    // Track disconnected clients via log
    socket.on('disconnect', () => {
        const name = clients[socket.id];
        delete clients[socket.id];
        if (name) {
            const clientDisconnectedMsg = name + ' disconnected, total: ' + Object.keys(clients).length;
            io.emit(chatEvent, clientDisconnectedMsg);
            console.log(clientDisconnectedMsg);
        }
    });

    // Multicast received message from client
    socket.on(chatEvent, message => {
        const name = clients[socket.id] || 'Anonymous'; // Default to 'Anonymous' if name is not provided
        const combinedMsg = name + ': ' + message;
        io.emit(chatEvent, combinedMsg); // Emit the combined message
        console.log('multicast from ' + name + ': ' + message);
    });
});

// Start the Server
http.listen(port, () => {
    console.log('listening on *:' + port);
});
