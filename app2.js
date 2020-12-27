const https = require('https');
const WebSocket = require('ws');
const constants = require('./util/constants')
const cors = require('cors');
const server = https.createServer();
const wss = new WebSocket.Server({ server });
require('./db');


const NodeRoute = require('./Routes/node');


// app.use(cors());

server.use('/node', NodeRoute);
// app.use('/payment', PaymentRoute);

// wss.on('connection', function connection(ws) {
//     ws.on('message', function incoming(message) {
//         console.log('received: %s', message);
//     });

//     ws.send('something');
// });

server.listen(8080);