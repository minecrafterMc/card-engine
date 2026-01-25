const express = require("express");
const { Server } = require("socket.io");
const { createServer } = require("node:http");
const app = express();
const server = createServer(app);
const io = new Server(server, {
  connectionStateRecovery: {},
});

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});
app.get("/style.css", (req, res) => {
  res.sendFile(__dirname + "/style.css");
});
app.get("/libs/phaser.js", (req, res) => {
  res.sendFile(__dirname + "/libs/phaser.js");
});
app.param("room", (req, res, next, room) => {
  req.room = room;
  next();
});
app.get("/game/:room", (req, res) => {
  req.params.room;
  res.sendFile(__dirname + "/games/dutch/client.html");
});
app.get("/engine.js", (req, res) => {
  res.sendFile(__dirname + "/engine.js");
});
app.get("/card-generator", (req, res) => {
  res.sendFile(__dirname + "/card-generator/script.js");
});
app.get("/assets/:asset", (req, res) => {
  res.sendFile(__dirname + "/card-generator/assets/" + req.params.asset);
});
io.on("connection", (socket) => {
  console.log("a user connected");
  socket.
  socket.on("disconnect", () => {
    console.log("user disconnected");
  });
  socket.on("joinGame", (data) => {
    console.log("User joined game: " + data.game);
  });
});
server.listen(3000, () => {
  console.log("server running at http://localhost:3000");
});
