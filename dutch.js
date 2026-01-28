export function DutchGame(socket){
    socket.on("playCard", (data) => {
        const room = rooms[socket.room];
        if (!room) return;
        room.game.playCard(socket.id, data.cardId);
    });
}