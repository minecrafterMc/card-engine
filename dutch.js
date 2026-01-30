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
class Table {
    constructor(room){
       this.players = room.players;
       this.discardPile = [];
       this.deck = []; 
       this.turnIndex = 0;
       this.startingHandSize = 4;
       let cardColors = ['h','d','s','c'];
       let cardNumbers = ['A','2','3','4','5','6','7','8','9','10','J','Q','K'];
       for (let color of cardColors) {
           for (let number of cardNumbers) {
               this.deck.push(number+color);
           }
       }
       shuffle(this.deck);
       for (let player of this.players){
           player.hand = [];
              for (let i = 0; i < this.startingHandSize; i++){
                    player.hand.push(this.deck.pop());
                }
            }

    }
}
function getPlayerById(room, id){
    for (let player of room.players){
        if (player.id === id){
            return player;
        }
    }
    return null;
}
function getPlayerByTempId(room, tempId){
    for (let player of room.players){
        if (player.tempId == tempId){
            console.log(player);
            return player;
        }
    }
    return null;
}
export function DutchGame(socket, room){
    if (!room.initialized){
        tables[room.id] = new Table(room);
        room.initialized = true;
    }
    socket.on("connectToGame", (data) => {
        if (getPlayerByTempId(room, data.tempId) == null) {console.log("player not found",data.tempId,room.players,room);socket.disconnect(); return;};
        getPlayerByTempId(room, data.tempId).id = socket.id;
        let hand = [];
        for (let i = 0; i < getPlayerById(room, socket.id).hand.length; i++) {
            hand.push((i < (getPlayerById(room, socket.id).hand.length / 2)) ? getPlayerById(room, socket.id).hand[i] : "back");
        }
        console.log("Dealing hand to player "+socket.id+": "+hand);
        socket.emit("updateHand", {hand: hand} );
        setTimeout(function(){
            hand = [];
            for(let i = 0;i<getPlayerById(room, socket.id).hand.length;i++){
                hand.push("back");
            }
            socket.emit("updateHand", {hand: hand} );
        },5000)
    });
    socket.on("playCard", (data) => {
        if (!room) return;
    });
}
const tables = {};