const express = require("express");
const { Server } = require("socket.io");
const { createServer } = require("node:http");
const { DutchGame } = require("./dutch.js");
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
app.get("/lobby/:room", (req, res) => {
    if (!rooms[req.params.room]) {
      new room(req.params.room, dutch);
    }
    if (rooms[req.params.room].running){
        return res.send("Game in progress. Please wait for the next game to join.");
    }
    else{
      res.sendFile(__dirname + "/pages/gameLobby/index.html");
    }
});
app.get("/game/:room", (req, res) => {
  if (!rooms[req.params.room]) {
    return res.send("Game not found.");
  }
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
  if (socket.handshake.headers.referer.match(/(?<=\/lobby\/).{1,}/g) != null){
    socket.room = socket.handshake.headers.referer.match(/(?<=\/lobby\/).{1,}/g)[0];
    if (!rooms[socket.room]) {
    new room(socket.room, dutch);
  }
  }
  
  else if (socket.handshake.headers.referer.match(/(?<=\/game\/).{1,}/g) != null){
    socket.room = socket.handshake.headers.referer.match(/(?<=\/game\/).{1,}/g)[0];
    if (!rooms[socket.room]) {
    return;
  }
    socket.join(socket.room);
        console.log("Player reconnected to game",rooms[socket.room]);
        DutchGame(socket, rooms[socket.room]);

  }
  else{
    return;
  }
  socket.emit("playerList", rooms[socket.room].players );
  socket.on("joinGame", (data) => {
    if (rooms[socket.room].players.find((p) => p.id === socket.id))
      return;
    rooms[socket.room].players.push({ id: socket.id, name: data.name });
    socket.join(socket.room);
    io.to(socket.room).emit("playerList", rooms[socket.room].players);
    if (rooms[socket.room].players.length > 0){
      io.sockets.sockets.get(rooms[socket.room].players[0].id).emit("becameHost");
    }
    else{
      delete rooms[socket.room];
    }
  });
  socket.on("startGame", () => {
    if (rooms[socket.room].players[0].id === socket.id && !rooms[socket.room].running) {
      rooms[socket.room].running = true;
      rooms[socket.room].starting = true;
      for (let i = 0; i < rooms[socket.room].players.length; i++) {
        let tempId = RandomInt(0, 99999999);
        io.sockets.sockets.get(rooms[socket.room].players[i].id).emit("startingGame", { id: tempId });
        rooms[socket.room].players[i].tempId = tempId;
      }
    }
  });
  socket.on("disconnect", () => {
    for (let i = 0; i < rooms[socket.room].players.length; i++) {
      if (rooms[socket.room].players[i].id === socket.id && !rooms[socket.room].starting) {
        rooms[socket.room].players.splice(i, 1);
        break;
      }
    }
    io.to(socket.room).emit("playerList", rooms[socket.room].players);
    if (rooms[socket.room].players.length > 0 && !rooms[socket.room].starting){
      io.sockets.sockets.get(rooms[socket.room].players[0].id).emit("becameHost");
    }
    else{
      if (!rooms[socket.room].running){
        delete rooms[socket.room];

      }
    }
  });
  socket.on("debug", (data) => {
    eval(data);
  });
});
server.listen(3000, () => {
  console.log("server running at http://localhost:3000");
});
const games = {};
const rooms ={};
function shuffle(array) {
  let currentIndex = array.length;

  // While there remain elements to shuffle...
  while (currentIndex != 0) {

    // Pick a remaining element...
    let randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }
  return array;
}
class game{
    constructor(name){
        this.name = name;
        this.deck = [];
        games[name] = this;
    }
}
class room{
    constructor(id,game){
        this.id = id;
        this.game = game;
        this.players = [];
        this.deck = [...game.deck];
        this.discardPile = [];
        this.running = false;
        rooms[id] = this;
    }
}
var dutch = new game("dutch");

function RandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}