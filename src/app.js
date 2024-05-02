const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

// Importing Socket Controller
const socketController = require("./controllers/socket.controller");

const app = express();

app.use(
    cors({
        origin: ["http://localhost:3000", "https://app.getrecord.in"],
        methods: ["GET", "PUT", "POST", "DELETE", "OPTIONS"],
        credentials: true,
    }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const routes = require("./routes");
app.use("/api", routes);

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: ["http://localhost:3000", "https://app.getrecord.in"],
        methods: ["GET", "PUT", "POST", "DELETE", "OPTIONS"],
        // allowedHeaders: ["Record-Signature"],
        credentials: true,
    },
});

io.on("connection", (socket) => {
    socketController.handleUserConnected(socket);
    socket.on("disconnect", () => {
        socketController.handleUserDisconneted(socket);
    });
});

module.exports = { app, server };
