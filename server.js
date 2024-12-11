const express = require('express');
const app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
const path = require('path');

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

io.on('connection', function (socket) {
    socket.on('create', function (callback) {
        console.log('caller at', socket.id);
        callback(socket.id);
    });

    socket.on('join', function (code) {
        console.log('receiver joined', socket.id, 'sending join status to', code);
        io.to(code).emit('ready', socket.id);
    });

    socket.on('candidate', function (event) {
        console.log('sending candidate to', event.sendTo);
        io.to(event.sendTo).emit('candidate', event);
    });

    socket.on('offer', function (event) {
        console.log('sending offer to', event.receiver);
        io.to(event.receiver).emit('offer', { event: event.sdp, caller: socket.id });
    });

    socket.on('answer', function (event) {
        console.log('sending answer to', event.caller);
        io.to(event.caller).emit('answer', event.sdp);
    });
});

// Use environment variable for dynamic port assignment
const PORT = process.env.PORT || 3000; // Fallback to 3000 if PORT is not defined
http.listen(PORT, function () {
    console.log(`Server running on port ${PORT}`);
});
