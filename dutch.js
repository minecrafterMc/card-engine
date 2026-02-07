function shuffle(array) {
  let currentIndex = array.length;

  // While there remain elements to shuffle...
  while (currentIndex != 0) {
    // Pick a remaining element...
    let randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex],
    ];
  }
  return array;
}
class Table {
  constructor(room) {
    this.config = room.config;
    if (this.config.deckAmount == undefined){
        this.config.deckAmount = 1;
    }
    if (this.config.startingHandSize == undefined){
        this.config.startingHandSize = 4;
    }
    this.players = room.players;
    this.discardPile = [];
    this.deck = [];
    this.turnIndex = 0;
    let cardColors = ["h", "d", "s", "c"];
    let cardNumbers = [
      "A",
      "2",
      "3",
      "4",
      "5",
      "6",
      "7",
      "8",
      "9",
      "10",
      "J",
      "Q",
      "K",
    ];
    for (let i = 0;i<this.config.deckAmount;i++){
        for (let color of cardColors) {
          for (let number of cardNumbers) {
            this.deck.push(number + color);
          }
        }
    }
    shuffle(this.deck);
    for (let player of this.players) {
      player.hand = [];
      for (let i = 0; i < this.config.startingHandSize; i++) {
        player.hand.push(this.deck.pop());
      }
    }
  }
}
function getPlayerById(room, id) {
  for (let player of room.players) {
    if (player.id === id) {
      return player;
    }
  }
  return null;
}
function getPlayerByTempId(room, tempId) {
  for (let player of room.players) {
    if (player.tempId == tempId) {
      console.log(player);
      return player;
    }
  }
  return null;
}
function checkWinners(players) {
  console.log(players);
  const values = {
    A: 1,
    2: 2,
    3: 3,
    4: 4,
    5: 5,
    6: 6,
    7: 7,
    8: 8,
    9: 9,
    10: 10,
    J: 11,
    Q: 12,
  };
  let gameResults = {name:"dutch",players:[]};
  for (let i = 0; i < players.length; i++) {
    gameResults.players[i] = {name:players[i].name,hand:players[i].hand,points:0}
    for (let j = 0; j < players[i].hand.length; j++) {
      if (players[i].hand[j][0] != "K") {
        gameResults.players[i].points +=
          values[players[i].hand[j].slice(0, players[i].hand[j].length - 1)];
      }
      else{
        if (players[i].hand[j][1] == "s" || players[i].hand[j][1] == "c"){
          gameResults.players[i].points += 13;
        }
      }
    }
  }
  return gameResults;
}
function getClientReadyPlayerList(players){
  let clientPlayers = []
  for (let player of players){
    let newPlayerData = {};
    newPlayerData.name = player.name;
    newPlayerData.hand = player.hand.length;
    newPlayerData.id = player.id;
    newPlayerData.connected = player.connected;
    newPlayerData.initialized = player.initialized;
    clientPlayers.push(newPlayerData);
  }
  return clientPlayers;
}
export function DutchGame(socket, room, io) {
    if (!room.initialized) {
      tables[room.id] = new Table(room);
      room.initialized = true;
    }
    socket.on("connectToGame", (data) => {
      if (getPlayerByTempId(room, data.tempId) == null) {
        console.log("player not found", data.tempId, room.players, room);
        socket.disconnect();
        return;
      }
      getPlayerByTempId(room, data.tempId).id = socket.id;
      let hand = [];
      getPlayerById(room,socket.id).connected = true;
      socket.emit("playerUpdate",{turn:tables[room.id].turnIndex,players:getClientReadyPlayerList(room.players)});
      if (!getPlayerById(room, socket.id).initialized){
        getPlayerById(room, socket.id).initialized = true;
      }
      else{
        socket.emit("updateHand",{hand:getPlayerById(room, socket.id).hand.length});
        return;
      }
      for (let i = 0; i < getPlayerById(room, socket.id).hand.length; i++) {
        hand.push(
          i < getPlayerById(room, socket.id).hand.length / 2
            ? getPlayerById(room, socket.id).hand[i]
            : "back",
        );
      }
      getPlayerById(room, socket.id).avaliableSeeings = 0;
      console.log("Dealing hand to player " + socket.id + ": " + hand);
      socket.emit("updateHand", { hand: hand });
      io.to(socket.room).emit("updateDiscard", {
        discarded:
          tables[room.id].discardPile[tables[room.id].discardPile.length - 1],
      });
      setTimeout(function () {
        try{
            hand = [];
            for (let i = 0; i < getPlayerById(room, socket.id).hand.length; i++) {
              hand.push("back");
            }
            socket.emit("updateHand", { hand: hand });
            io.to(socket.room).emit("updateDiscard", {
              discarded:
                tables[room.id].discardPile[tables[room.id].discardPile.length - 1],
            });
        }
        catch(e){}
      }, 5000);
    });
    socket.on("playCard", (data) => {
        try{
            if (getPlayerById(room, socket.id).hand[data.card][0] == "Q") {
              getPlayerById(room, socket.id).avaliableSeeings++;
              socket.emit("canSeeCard", {
                amount: getPlayerById(room, socket.id).avaliableSeeings,
              });
            }

        }
        catch(e){}
      //tables[room.id].discardPile.push[getPlayerById(room,socket.id).hand[data.id]];

      if (
        tables[room.id].discardPile.length != 0 &&tables[room.id].discardPile[tables[room.id].discardPile.length - 1][0] != undefined &&
        getPlayerById(room, socket.id).hand[data.card][0] ==
          tables[room.id].discardPile[tables[room.id].discardPile.length - 1][0]
      ) {
        tables[room.id].discardPile.push(
          getPlayerById(room, socket.id).hand[data.card],
        );
        getPlayerById(room, socket.id).hand.splice(data.card, 1);
        socket.emit("updateHand", {
          hand: getPlayerById(room, socket.id).hand.length,
        });
        io.to(socket.room).emit("playerAction",{source:"throwCard(sucess)",card:tables[room.id].discardPile[tables[room.id].discardPile.length-1]});
        io.to(socket.room).emit("updateDiscard", {
          discarded:
          tables[room.id].discardPile[tables[room.id].discardPile.length - 1],
        });
      } else {
        tables[room.id].discardPile.push(
          getPlayerById(room, socket.id).hand[data.card],
        );
        getPlayerById(room, socket.id).hand.splice(data.card, 1);
        getPlayerById(room, socket.id).hand[
          getPlayerById(room, socket.id).hand.length
        ] = tables[room.id].deck.pop();
        getPlayerById(room, socket.id).hand[
          getPlayerById(room, socket.id).hand.length
        ] = tables[room.id].deck.pop();
        socket.emit("updateHand", {
          hand: getPlayerById(room, socket.id).hand.length,
        });
        io.to(socket.room).emit("playerAction",{source:"throwCard(fail)",card:tables[room.id].discardPile[tables[room.id].discardPile.length-1]});
        io.to(socket.room).emit("updateDiscard", {
          discarded:
            tables[room.id].discardPile[tables[room.id].discardPile.length - 1],
        });
      }
      if (tables[room.id].deck.length == 0){
        room.ended = true;
          io.to(room.id).emit("gameEnd",checkWinners(tables[room.id].players));
        }
    });
    socket.on("drawFromDeck", function (data) {
      if (socket.id == room.players[tables[room.id].turnIndex].id) {
        socket.emit("revealDeckCard", {
          card: tables[room.id].deck[tables[room.id].deck.length - 1],
        });
      }
    });
    socket.on("drawFromDiscard", function (data) {
      if (socket.id == room.players[tables[room.id].turnIndex].id) {
        socket.emit("confirmDrawFromDiscard", { card: -1 });
      }
    });
    socket.on("replaceCard", function (data) {
      if (socket.id == room.players[tables[room.id].turnIndex].id) {
        if (data.card > getPlayerById(room, socket.id).hand.length) {
          return;
        }
        if (data.source == "deck") {
          if (data.card == -1) {
            try{
                if (
                  tables[room.id].deck[tables[room.id].deck.length - 1][0] == "Q"
                ) {
                  getPlayerById(room, socket.id).avaliableSeeings++;
                  socket.emit("canSeeCard", {
                    amount: getPlayerById(room, socket.id).avaliableSeeings,
                  });
                }

            }catch(e){}
            tables[room.id].discardPile.push(tables[room.id].deck.pop());
            io.to(socket.room).emit("playerAction",{source:"deckToDiscard",card:tables[room.id].discardPile[tables[room.id].discardPile.length-1]});
            
            socket.emit("updateHand", {
              hand: getPlayerById(room, socket.id).hand.length,
            });
            io.to(socket.room).emit("updateDiscard", {
              discarded:
              tables[room.id].discardPile[
                tables[room.id].discardPile.length - 1
              ],
            });
          } else {
            if (getPlayerById(room, socket.id).hand[data.card][0] == "Q") {
              getPlayerById(room, socket.id).avaliableSeeings++;
              socket.emit("canSeeCard", {
                amount: getPlayerById(room, socket.id).avaliableSeeings,
              });
            }
            tables[room.id].discardPile.push(
              getPlayerById(room, socket.id).hand[data.card],
            );
            getPlayerById(room, socket.id).hand[data.card] =
            tables[room.id].deck.pop();
            console.log(
              socket.id + "'s hand: ",
              getPlayerById(room, socket.id).hand,
            );
            
            console.log(tables[room.id].discardPile);
            socket.emit("updateHand", {
              hand: getPlayerById(room, socket.id).hand.length,
            });
            socket.emit("playerAction",{source:"deck",card:getPlayerById(room, socket.id).hand[data.card],player:"you"});
            io.to(socket.room).emit("playerAction",{source:"deck",card:"back",player:socket.id})
            io.to(socket.room).emit("updateDiscard", {
              discarded:
                tables[room.id].discardPile[
                  tables[room.id].discardPile.length - 1
                ],
            });
          }
        } else {
          if (getPlayerById(room, socket.id).hand[data.card][0] == "Q") {
            getPlayerById(room, socket.id).avaliableSeeings++;
            socket.emit("canSeeCard", {
              amount: getPlayerById(room, socket.id).avaliableSeeings,
            });
          }
          let tempCard = getPlayerById(room, socket.id).hand[data.card];
          getPlayerById(room, socket.id).hand[data.card] =
            tables[room.id].discardPile.pop();
          tables[room.id].discardPile.push(tempCard);
          console.log(
            socket.id + "'s hand: ",
            getPlayerById(room, socket.id).hand,
          );

          console.log(tables[room.id].discardPile);
          socket.emit("updateHand", {
            hand: getPlayerById(room, socket.id).hand.length,
          });
          socket.emit("playerAction",{source:"discard",card:tables[room.id].discardPile[tables[room.id].discardPile.length-1]});
          io.to(socket.room).emit("updateDiscard", {
            discarded:
              tables[room.id].discardPile[
                tables[room.id].discardPile.length - 1
              ],
          });
        }
        if (tables[room.id].deck.length == 0){
          room.ended = true;
          io.to(room.id).emit("gameEnd",checkWinners(tables[room.id].players));
        }
        tables[room.id].turnIndex++;
        if (tables[room.id].turnIndex >= room.players.length) {
          tables[room.id].turnIndex = 0;
        }
        io.to(socket.room).emit("playerUpdate",{turn:tables[room.id].turnIndex,players:getClientReadyPlayerList(room.players)});
      }
    });
    socket.on("selectSeeCard", function (data) {
      if (getPlayerById(room, socket.id).avaliableSeeings > 0) {
        getPlayerById(room, socket.id).avaliableSeeings--;
        socket.emit("revealHeldCard", {
          card: getPlayerById(room, socket.id).hand[data.card],
          id: data.card,
        });
      }
    });
    socket.on("debug", (data) => {
      eval(data);
    });
}
const tables = {};
