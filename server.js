const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');  // Required for serving HTML files
const cors = require('cors');  // To handle CORS issues

// Create an Express app
const app = express();

// Enable CORS
app.use(cors({
    origin: 'https://connect-with.netlify.app', // Allow your frontend's Netlify URL
    methods: ['GET', 'POST'],                  // Allow specific HTTP methods
    credentials: true                          // Allow cookies if needed
}));

// Serve the static files from the "frontend/public" folder (frontend)
app.use(express.static(path.resolve(__dirname, '../frontend/public'))); // Use path.resolve for better path handling

// Explicitly handle the root route
app.get('/', (req, res) => {
  res.sendFile(path.resolve(__dirname, '../frontend/public', 'index.html'));  // Serve index.html from frontend/public
});

// Create an HTTP server
const server = http.createServer(app);

// Create a WebSocket server
const wss = new WebSocket.Server({ server });

// Array to store connected clients
const clients = [];

// Handle WebSocket connections
wss.on('connection', (ws) => {
    if (clients.length >= 2) {
        ws.send('Sorry, the chat is limited to two users only.');
        ws.close();
        return;
    }

    // Add the new client to the array
    clients.push(ws);
    console.log('A user connected. Current users:', clients.length);

    ws.on('message', (message) => {
        console.log('Received:', message);

        // Broadcast the message to the other client
        clients.forEach((client) => {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
                client.send(message);
            }
        });
    });

    // Handle disconnection
    ws.on('close', () => {
        console.log('A user disconnected');
        const index = clients.indexOf(ws);
        if (index > -1) {
            clients.splice(index, 1); // Remove the disconnected client
        }
        console.log('Current users:', clients.length);
    });
});

// Start the server
const PORT = process.env.PORT || 3000; // Use the PORT environment variable provided by Railway or fallback to 3000 for local development
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
